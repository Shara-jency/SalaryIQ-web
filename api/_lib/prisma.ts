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
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

// Module-level singleton: a warm serverless container reuses this module's
// scope across invocations, so without a singleton every invocation would
// construct a new client/adapter and still exhaust connections even against
// the pooled URL.
export const prisma = globalThis.__prisma ?? createClient();
if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
