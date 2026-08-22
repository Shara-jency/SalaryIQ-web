import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { PrismaClient } from "../../generated/prisma/client.js";

// Neon's serverless driver needs a WebSocket implementation in the Node.js
// runtime (Vercel functions run on Node, not the browser/edge, where
// WebSocket is a global). Wiring this once here, not per-request.
neonConfig.webSocketConstructor = ws;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Check Project Settings -> Environment Variables in Vercel " +
        "(must be enabled for the environment you're testing — Production/Preview/Development).",
    );
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

// Module-level singleton: a warm serverless container reuses this module's
// scope across invocations, so without a singleton every invocation would
// construct a new client/adapter and still exhaust connections even against
// the pooled URL.
function getPrisma(): PrismaClient {
  if (!globalThis.__prisma) {
    globalThis.__prisma = createClient();
  }
  return globalThis.__prisma;
}

// Lazy on purpose: constructing the client eagerly at module load time meant
// a missing env var or bundling issue crashed the whole serverless function
// during initialization (Vercel's opaque FUNCTION_INVOCATION_FAILED page,
// bypassing our own error handling entirely). Routing every access through
// this proxy defers construction until the first actual query, which happens
// inside a request handler wrapped by withHandler — so the same failure now
// surfaces as a normal, loggable 500 JSON response instead of a platform crash.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getPrisma() as object, prop, receiver);
  },
});
