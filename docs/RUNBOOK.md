# Archanai — Pilot Runbook

Current, verified-against-code operations guide. (`README.md` is the long-term product vision and is partly aspirational: it still mentions WhatsApp, deposits and Next 15, none of which exist.)

## Stack in one line
Next.js 16 (App Router, `proxy.ts` instead of middleware) · React 19 · Prisma 7 + Postgres (Supabase) · Supabase Auth (email magic link) + Storage · Resend email · Vercel hosting + cron.

## Environment variables
| Var | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Vercel + `.env.local` | service key is server-only |
| `DATABASE_URL`, `DIRECT_URL` | Vercel + `.env.local` | the app connects with `DIRECT_URL ?? DATABASE_URL`; Prisma CLI uses `DIRECT_URL` |
| `RESEND_API_KEY`, `FROM_EMAIL` | Vercel | `FROM_EMAIL` must be on a Resend-verified domain, or only the Resend account owner receives mail |
| `NEXT_PUBLIC_APP_URL` | Vercel | `https://priest-azure.vercel.app` (or your domain). Used in emails and sitemap |
| `CRON_SECRET` | Vercel | any long random string. Without it both cron routes return 403 |

## Database
- Migrations live in `prisma/migrations`. Apply with `npx prisma migrate deploy` (never `migrate dev` against production: `0004` contains a partial unique index Prisma cannot model, so `dev` would try to drop it).
- The production DB predates `_prisma_migrations`. Baseline once: `npx prisma migrate resolve --applied 0001_init`, then `0002_rename_identity_verified`, `0003_remove_payment_gateway`, then `npx prisma migrate deploy` applies `0004_pilot_readiness`.
- Seed reference data (ceremonies, samagri) with `npm run seed`. It is idempotent for ceremonies; check `prisma/seed.ts` before re-running on a populated DB.

## Auth and roles
- Login is an emailed magic link. Roles live in Supabase **`app_metadata.role`** (service-role-only) and in `users.role`. `user_metadata` is user-editable and is deliberately ignored.
- First admin: sign in once, then in the Supabase dashboard (Authentication → user → raw app meta data) set `{"role": "ADMIN"}` and run `update users set role='ADMIN' where email='…'`.
- Priests get `PRIEST` automatically on registration.

## Storage buckets (created on first upload)
`priest-photos` (public) · `priest-docs` (private, admin signed URLs only).

## Scheduled jobs (`vercel.json`)
- `/api/cron/reminders` 03:30 UTC: emails families the day before an accepted ceremony.
- `/api/cron/expire` 04:00 UTC: releases PENDING requests unanswered for 48h (or past their date) and tells the family.

## Booking rules (enforced server-side)
Request must be ≥1 day ahead (IST) and ≤365 days; inside the priest's weekly hours; not on a blocked date; and a priest has at most one live booking per day (database partial unique index). A family may hold 5 pending requests; reschedule at most twice.

## Checks before each deploy
`npx tsc --noEmit && npx eslint . && npm test && npm run build`

## Known pilot limits
Email is the only channel (no SMS/WhatsApp). No maps geocoding or distance-based travel fee (travel fee is informational). English UI only. No rate limiting beyond Vercel's defaults. No automated end-to-end tests; core date/availability logic has unit tests in `tests/`.
