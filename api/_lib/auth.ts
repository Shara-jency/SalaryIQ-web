import { createHash } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { parseCookie, stringifySetCookie } from "cookie";
import { HttpError } from "./respond.js";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const REFRESH_COOKIE_NAME = "siq_rt";

function getSecret(name: "JWT_ACCESS_SECRET" | "JWT_REFRESH_SECRET"): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
}

export function signAccessToken(userId: string, email: string): string {
  const payload: AccessTokenPayload = { sub: userId, email, type: "access" };
  return jwt.sign(payload, getSecret("JWT_ACCESS_SECRET"), { expiresIn: ACCESS_TOKEN_TTL });
}

export function signRefreshToken(userId: string): string {
  const payload: RefreshTokenPayload = { sub: userId, type: "refresh" };
  return jwt.sign(payload, getSecret("JWT_REFRESH_SECRET"), {
    expiresIn: REFRESH_TOKEN_TTL_SECONDS,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  let decoded: string | jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, getSecret("JWT_ACCESS_SECRET"));
  } catch {
    throw new HttpError(401, "Invalid or expired access token");
  }
  if (typeof decoded === "string" || decoded.type !== "access") {
    throw new HttpError(401, "Invalid access token");
  }
  return decoded as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  let decoded: string | jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, getSecret("JWT_REFRESH_SECRET"));
  } catch {
    throw new HttpError(401, "Invalid or expired refresh token");
  }
  if (typeof decoded === "string" || decoded.type !== "refresh") {
    throw new HttpError(401, "Invalid refresh token");
  }
  return decoded as RefreshTokenPayload;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Refresh tokens are stored server-side only as a SHA-256 hash, never in plaintext. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getRefreshTokenFromCookie(req: VercelRequest): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  const cookies = parseCookie(header);
  return cookies[REFRESH_COOKIE_NAME] ?? null;
}

// `vercel dev` serves localhost over plain HTTP, and browsers silently drop
// `Secure` cookies on non-HTTPS origins — only require it once actually
// deployed (Vercel production/preview are always HTTPS).
const useSecureCookie = process.env.NODE_ENV === "production";

export function setRefreshCookie(res: VercelResponse, token: string): void {
  res.setHeader(
    "Set-Cookie",
    stringifySetCookie({
      name: REFRESH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: useSecureCookie,
      sameSite: "lax",
      path: "/api/auth",
      maxAge: REFRESH_TOKEN_TTL_SECONDS,
    }),
  );
}

export function clearRefreshCookie(res: VercelResponse): void {
  res.setHeader(
    "Set-Cookie",
    stringifySetCookie({
      name: REFRESH_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: useSecureCookie,
      sameSite: "lax",
      path: "/api/auth",
      maxAge: 0,
    }),
  );
}

/**
 * Derives the acting user from the verified access token. This is the ONLY
 * source of identity every handler should trust — a profileId/userId present
 * in a request body, query string, or path param must never be used for
 * authorization.
 */
export function requireAuth(req: VercelRequest): { userId: string } {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing bearer token");
  }
  const token = header.slice("Bearer ".length);
  const payload = verifyAccessToken(token);
  return { userId: payload.sub };
}
