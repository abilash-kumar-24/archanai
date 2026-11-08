# Archanai — Pilot Runbook

Current, verified-against-code operations guide. (`README.md` is the long-term product vision and is partly aspirational: it still mentions WhatsApp, deposits and Next 15, none of which exist.)

## Stack in one line
Next.js 16 (App Router, `proxy.ts` instead of middleware) · React 19 · Prisma 7 + Postgres (Supabase) · Supabase Auth (email magic link) + Storage · Brevo SMTP email (Resend fallback) · Vercel hosting + cron.

## Environment variables
| Var | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Vercel + `.env.local` | service key is server-only |
| `DATABASE_URL`, `DIRECT_URL` | Vercel + `.env.local` | the app connects with `DIRECT_URL ?? DATABASE_URL`; Prisma CLI uses `DIRECT_URL` |
| `BREVO_SMTP_USER`, `BREVO_SMTP_KEY`, `FROM_EMAIL` | Vercel | Email goes through Brevo SMTP (`smtp-relay.brevo.com:587`). `FROM_EMAIL` must be a sender verified in Brevo. If the two `BREVO_*` vars are absent the app falls back to Resend (`RESEND_API_KEY`), which only delivers to the Resend account owner until a domain is verified |
| `NEXT_PUBLIC_APP_URL` | Vercel | `https://archanai.vercel.app` (or your domain). Used in emails and sitemap |
| `CRON_SECRET` | Vercel | any long random string. Without it both cron routes return 403 |

## Database
- Migrations live in `prisma/migrations`. Apply with `npx prisma migrate deploy` (0001-0005 are applied in production) (never `migrate dev` against production: `0004` contains a partial unique index Prisma cannot model, so `dev` would try to drop it).
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

## Priest attributes and browse filters
Priest profile stores tradition, languages, cities, years of experience, optional gender, "travels outside city", per-ceremony price, "samagri included" and a short per-ceremony note. Browse filters: city, ceremony, tradition, language, available-on date, min rating, max price, min experience (5/10/20), gender, samagri included, travels outside city; sort by rating, price, experience. Ceremony durations are deliberately not shown (they vary by priest and family).

## Checks before each deploy
`npx tsc --noEmit && npx eslint . && npm test && npm run test:api && npm run build`

`npm test` = fast unit tests (dates, availability, email escaping). `npm run test:api` runs the real API route handlers through the whole priest and family journey (register, approve, book, accept, reschedule, complete, review, cancel, expiry cron, pause) against an in-memory Postgres built from the real migrations; Supabase session/storage and the SMTP transport are mocked, and it asserts which emails are sent.

Emails and notifications: in-app notifications are awaited; emails run via `after()` (`lib/background.ts`) so Vercel keeps the invocation alive until they are sent.

## Known pilot limits
Email is the only channel (no SMS/WhatsApp). Email is sent from a Gmail address via Brevo, so some will land in spam until you own a domain with SPF/DKIM. No maps geocoding and no distance-based travel fee. English UI only. No rate limiting beyond Vercel's defaults. No browser-level end-to-end tests: the API journey test covers the server side, but screens and file uploads to real Storage are checked by hand.
