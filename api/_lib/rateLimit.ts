import type { VercelRequest } from "@vercel/node";
import { prisma } from "./prisma.js";
import { HttpError } from "./respond.js";

/**
 * Postgres-backed rate limiting (no Redis/Upstash dependency — reuses the
 * database we already have). One row per attempt; on every check, a key's
 * expired rows are deleted first, so there's no separate cleanup job.
 *
 * Every call to the guarded endpoint counts against the limit regardless of
 * outcome (success or failure) — simplest to reason about, and it still
 * bounds brute force / spam either way.
 */
export async function enforceRateLimit(key: string, limit: number, windowMs: number): Promise<void> {
  const windowStart = new Date(Date.now() - windowMs);

  await prisma.rateLimitAttempt.deleteMany({ where: { key, createdAt: { lt: windowStart } } });

  const count = await prisma.rateLimitAttempt.count({ where: { key, createdAt: { gte: windowStart } } });
  if (count >= limit) {
    throw new HttpError(429, "Too many attempts. Please try again later.");
  }

  await prisma.rateLimitAttempt.create({ data: { key } });
}

export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (value) return value.split(",")[0].trim();
  return req.socket?.remoteAddress ?? "unknown";
}
