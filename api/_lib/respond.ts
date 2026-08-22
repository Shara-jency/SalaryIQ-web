import type { VercelRequest, VercelResponse } from "@vercel/node";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFound(message = "Not found"): never {
  throw new HttpError(404, message);
}

export function badRequest(message: string): never {
  throw new HttpError(400, message);
}

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void>;

/**
 * Wraps a Vercel function handler so any thrown HttpError maps to its status
 * code, and any other error (bug, DB failure) maps to a generic 500 instead
 * of leaking internals — keeps that mapping in one place rather than
 * repeated try/catch in every route file.
 */
export function withHandler(handler: Handler): Handler {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

export function methodNotAllowed(res: VercelResponse, allowed: string[]): void {
  res.setHeader("Allow", allowed.join(", "));
  res.status(405).json({ error: "Method not allowed" });
}

/**
 * Reads the first path segment matched by a catch-all route file
 * (`[...paramName].ts`). Next.js populates `req.query.paramName` as a
 * string array, but Vercel's plain (non-Next.js) Node.js runtime populates
 * it under the literal key `"...paramName"` (dots included) as a single
 * "/"-joined string instead — this normalizes both shapes so route handlers
 * don't need to know which one they're getting.
 */
export function firstCatchAllSegment(
  req: VercelRequest,
  paramName: string,
): string | undefined {
  const value = req.query[paramName] ?? req.query[`...${paramName}`];
  if (Array.isArray(value)) return value[0];
  if (typeof value === "string") return value.split("/")[0] || undefined;
  return undefined;
}
