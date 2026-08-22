import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Used only by the Prisma CLI (migrate/studio/db pull) — the app's runtime
  // PrismaClient connects separately via the Neon driver adapter (api/_lib/prisma.ts)
  // using the pooled DATABASE_URL. Migrations need the direct, non-pooled
  // connection because PgBouncer's transaction pooling mode breaks the
  // advisory locks/DDL Prisma's migration engine relies on.
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
