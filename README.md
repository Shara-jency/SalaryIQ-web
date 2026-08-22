# SalaryIQ Web

React + TypeScript web app for salary analysis, market benchmarking, growth projections, and history tracking — with a Vercel serverless + Postgres (Neon) backend and real email/password auth.

## Architecture

- **Frontend**: Vite + React + TypeScript, Tailwind v4, TanStack Query, react-router. Layered under `src/`: `domain/` (models, repository interfaces, pure business logic), `infrastructure/local/` (IndexedDB repos, used for tests/offline logic only) and `infrastructure/api/` (the repos that call the backend), `app/` (providers, routing), `features/` (pages), `shared/` (UI/theme/layout).
- **Backend**: Vercel serverless functions under `api/`, Prisma 7 + `@prisma/adapter-neon` against Neon Postgres, JWT access + refresh-cookie auth, Postgres-backed rate limiting on auth endpoints, and an email-based password reset flow (via [Resend](https://resend.com), optional).

## Local setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, DIRECT_URL, JWT secrets — see below
npm run db:generate     # generates the Prisma client into ./generated/prisma
npm run db:migrate:dev  # applies the schema to your database (first time / after schema changes)
npm run db:seed         # loads the ~89-row market benchmark dataset
```

Then either:
- `npm run dev` — Vite only, frontend against IndexedDB (`VITE_DATA_MODE` unset/`local`). No backend needed, but auth/login isn't wired up in this mode.
- `vercel dev` — frontend + `/api/*` serverless functions together, matching production. Requires `vercel login` and the env vars below (Vercel CLI pulls them from your linked project, or reads your local `.env`).

## Required environment variables

Set these in the Vercel dashboard (Project Settings → Environment Variables) for Production/Preview, and in a local `.env` for `vercel dev` / `db:*` scripts. See `.env.example`.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string — used by the app's runtime Prisma client (via `@prisma/adapter-neon`). |
| `DIRECT_URL` | Neon **direct** (unpooled) connection string — used only by the Prisma CLI (`migrate`/`db seed`). |
| `JWT_ACCESS_SECRET` | Signs 15-minute access tokens. Generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. |
| `JWT_REFRESH_SECRET` | Signs 30-day refresh tokens. Must be a **different** value from the access secret. |
| `VITE_DATA_MODE` | `api` in any deployed environment. Leave unset (defaults to `local`) for frontend-only dev without a backend. |
| `RESEND_API_KEY` | Optional. Enables actually emailing password-reset links via [Resend](https://resend.com) (free tier available). Without it, reset requests are logged server-side instead, and non-production responses include a `devResetUrl` field so the flow is still testable locally. |
| `RESEND_FROM_EMAIL` | Optional. Sender address for reset emails; defaults to Resend's shared test sender if unset. |

**Preview deployments should use a separate Neon branch/database from Production** (Neon supports branching) so preview builds never touch production data.

## Security notes

- **Rate limiting** on `login`, `register`, `forgot-password`, and `reset-password` is Postgres-backed (no Redis/Upstash needed) — see `api/_lib/rateLimit.ts`. Limits are per-IP and, for login/forgot-password, also per-email.
- **Password reset** tokens are single-use, expire after 1 hour, and resetting a password revokes every existing refresh token for that account (signs out all sessions).
- Forgot-password always returns the same generic response whether or not the email is registered, to avoid leaking which emails have accounts.

## Getting a Neon database

1. In the Vercel dashboard: **Storage → Create Database → Postgres (powered by Neon)**, or create one directly at neon.tech and connect it to the Vercel project.
2. Copy the **pooled** connection string into `DATABASE_URL` and the **direct** connection string into `DIRECT_URL` (Neon's dashboard labels these, or pooled strings contain `-pooler` in the host).
3. Run `npm run db:migrate` (uses `DIRECT_URL`) once to create the schema, then `npm run db:seed` to load market benchmarks.

## Deploying

Push to the branch connected to your Vercel project (or `vercel --prod`). `vercel.json`'s `buildCommand` runs `prisma generate` before `vite build` so the generated client is available to the bundled `api/*.ts` functions. **Migrations are not run automatically during the build** — run `npm run db:migrate` yourself (locally or in CI) before/after deploying a schema change.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server (frontend only, IndexedDB) |
| `npm run build` | Type-check + production build |
| `npm run test` | Run the test suite once |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:migrate` | Apply migrations (production — uses `DIRECT_URL`) |
| `npm run db:migrate:dev` | Create + apply a migration during local development |
| `npm run db:seed` | Seed market benchmark data |
