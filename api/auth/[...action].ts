import { randomBytes } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma.js";
import {
  hashPassword,
  hashToken,
  signAccessToken,
  signRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
  getRefreshTokenFromCookie,
  verifyPassword,
  verifyRefreshToken,
} from "../_lib/auth.js";
import { enforceRateLimit, getClientIp } from "../_lib/rateLimit.js";
import { badRequest, firstCatchAllSegment, withHandler } from "../_lib/respond.js";
import { toProfileDto } from "../_lib/mappers.js";
import { sendPasswordResetEmail } from "../_lib/email.js";

// Vercel's free (Hobby) plan caps a deployment at 12 serverless functions —
// every file under api/ is one function, so the 6 auth actions (each POST,
// each on its own path) are combined into a single catch-all route here
// instead of 6 separate files. The URLs the frontend calls
// (/api/auth/register, /api/auth/login, etc.) are unchanged either way.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const RESET_TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour
const GENERIC_RESET_MESSAGE =
  "If an account exists for that email, a password reset link has been sent.";

function requirePost(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return false;
  }
  return true;
}

function resolveAppBaseUrl(req: VercelRequest): string {
  if (req.headers.origin) return req.headers.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

async function register(req: VercelRequest, res: VercelResponse) {
  await enforceRateLimit(`register:ip:${getClientIp(req)}`, 5, 60 * 60 * 1000);

  // Only account fields here — role/industry/experience/location are
  // collected afterward in the mandatory profile-setup step (RequireCompleteProfile
  // gates the rest of the app on them), so a new signup isn't a long form.
  const { email, password, fullName } = req.body ?? {};

  if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    badRequest("Please provide a valid email address.");
  }
  if (typeof password !== "string" || password.length < 8) {
    badRequest("Password must be at least 8 characters.");
  }
  if (typeof fullName !== "string" || !fullName.trim()) {
    badRequest("Please provide your full name.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists." });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      fullName: fullName.trim(),
      // experienceYears/industry/currentRole/location use their schema
      // defaults (0 / "" / "" / "") until profile setup fills them in.
    },
  });

  const accessToken = signAccessToken(user.id, user.email);
  const refreshToken = signRefreshToken(user.id);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });

  setRefreshCookie(res, refreshToken);
  res.status(201).json({ accessToken, profile: toProfileDto(user) });
}

async function login(req: VercelRequest, res: VercelResponse) {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    badRequest("Please provide email and password.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  await enforceRateLimit(`login:ip:${getClientIp(req)}`, 20, 15 * 60 * 1000);
  await enforceRateLimit(`login:email:${normalizedEmail}`, 5, 15 * 60 * 1000);

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  const invalidCredentials = () => {
    res.status(401).json({ error: "Invalid email or password." });
  };

  if (!user) {
    invalidCredentials();
    return;
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches) {
    invalidCredentials();
    return;
  }

  const accessToken = signAccessToken(user.id, user.email);
  const refreshToken = signRefreshToken(user.id);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });

  setRefreshCookie(res, refreshToken);
  res.status(200).json({ accessToken, profile: toProfileDto(user) });
}

async function refresh(req: VercelRequest, res: VercelResponse) {
  const cookieToken = getRefreshTokenFromCookie(req);
  if (!cookieToken) {
    res.status(401).json({ error: "No refresh token." });
    return;
  }

  let userId: string;
  try {
    userId = verifyRefreshToken(cookieToken).sub;
  } catch {
    clearRefreshCookie(res);
    res.status(401).json({ error: "Invalid refresh token." });
    return;
  }

  const tokenHash = hashToken(cookieToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.userId !== userId) {
    clearRefreshCookie(res);
    res.status(401).json({ error: "Refresh token is no longer valid." });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    clearRefreshCookie(res);
    res.status(401).json({ error: "Account no longer exists." });
    return;
  }

  const newRefreshToken = signRefreshToken(user.id);
  await prisma.$transaction([
    prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } }),
    prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(newRefreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    }),
  ]);

  setRefreshCookie(res, newRefreshToken);
  res.status(200).json({ accessToken: signAccessToken(user.id, user.email) });
}

async function logout(req: VercelRequest, res: VercelResponse) {
  const cookieToken = getRefreshTokenFromCookie(req);
  if (cookieToken) {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(cookieToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  clearRefreshCookie(res);
  res.status(200).json({ ok: true });
}

async function forgotPassword(req: VercelRequest, res: VercelResponse) {
  const { email } = req.body ?? {};
  if (typeof email !== "string" || !email.trim()) {
    badRequest("Please provide an email address.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const ip = getClientIp(req);

  await enforceRateLimit(`forgot-password:ip:${ip}`, 5, 15 * 60 * 1000);
  await enforceRateLimit(`forgot-password:email:${normalizedEmail}`, 3, 15 * 60 * 1000);

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    res.status(200).json({ ok: true, message: GENERIC_RESET_MESSAGE });
    return;
  }

  const rawToken = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const resetUrl = `${resolveAppBaseUrl(req)}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail(user.email, resetUrl);

  const isProduction = process.env.NODE_ENV === "production";
  res.status(200).json({
    ok: true,
    message: GENERIC_RESET_MESSAGE,
    ...(isProduction ? {} : { devResetUrl: resetUrl }),
  });
}

async function resetPassword(req: VercelRequest, res: VercelResponse) {
  const { token, newPassword } = req.body ?? {};
  if (typeof token !== "string" || !token) badRequest("Missing reset token.");
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    badRequest("Password must be at least 8 characters.");
  }

  await enforceRateLimit(`reset-password:ip:${getClientIp(req)}`, 10, 15 * 60 * 1000);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    res.status(400).json({ error: "This reset link is invalid or has expired." });
    return;
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  res.status(200).json({ ok: true });
}

const ACTIONS: Record<string, (req: VercelRequest, res: VercelResponse) => Promise<void>> = {
  register,
  login,
  refresh,
  logout,
  "forgot-password": forgotPassword,
  "reset-password": resetPassword,
};

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!requirePost(req, res)) return;

  const action = firstCatchAllSegment(req, "action");

  const handler = action ? ACTIONS[action] : undefined;
  if (!handler) {
    res.status(404).json({ error: "Unknown auth action." });
    return;
  }

  await handler(req, res);
});
