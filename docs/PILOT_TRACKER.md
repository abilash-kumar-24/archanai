# Archanai — Pilot Readiness Tracker

Legend: `[x]` done and verified as stated · `[~]` code complete, goes live only after a human step · `[!]` blocked, human step required · `[ ]` open

**Everything marked `[~]` depends on migration `0004` being applied to the live database (see "Human steps").** Until then the deployed app and the DB disagree, so do not deploy before step 2.

## Verification performed (and what was not)
- Verified: `tsc` clean · `eslint` 0 errors (0 warnings) · `next build` passes · 7 unit tests (`npm test`) · migrations 0001→0004 applied to a throwaway in-memory Postgres (PGlite) with legacy data, confirming the backfill, the blocked-date dedupe and the one-live-booking-per-day index · Prisma queries behind availability, booking, reviews, favourites, notifications, browse filters and the registration/profile transactions run against that database (15 checks pass) · production server started, 11 public/guarded routes return expected status codes.
- **Not verified:** any click-through in a real browser; real emails (Resend is unconfigured for real recipients); real Supabase login; the live database after 0004 (not applied); file uploads against real Supabase Storage; Vercel cron execution. Expect small UI defects on first real use — budget a manual pass through the flows listed at the end.

## A. Environment and data
- [x] A1 Admin/priest roles read from `app_metadata`; existing admin + priest users backfilled in Supabase
- [x] A2 `priest-photos` bucket created (`priest-docs`, private, is created on first document upload)
- [x] A3 Empty-string phone bug (code + data)
- [!] A4 Baseline `_prisma_migrations` — blocked: the permission checker denies writes to the production DB from this session
- [!] A5 Resend sending domain — Supabase SMTP and app email both send from `onboarding@resend.dev`, which only delivers to the Resend account owner. Magic-link login and all notification emails fail for real users until fixed
- [ ] A6 Delete test accounts (`e2e-*@archanai-test.dev`) and the test priest before onboarding (your call)
- [ ] A7 Branded magic-link email (Supabase Auth → Email templates; current text is the default "Magic Link")

## B. Security and correctness
- [x] B1 Role escalation via `user_metadata`
- [x] B2 Booking-ref race
- [x] B3 Confirm route: state guard, zod
- [x] B4 Wrong email on accept
- [x] B5 HTML injection in emails (all user text escaped; Resend `{error}` results were being silently dropped, now logged)
- [x] B6 Timezone: dates are `YYYY-MM-DD` end to end (wizard, blocked dates, calendar, API); unit tested
- [x] B7 Unverified/paused priests no longer reachable by URL
- [x] B8 Priest phone was collected but never saved
- [x] B9 Admin can see priest phone/email and view documents (documents stay optional: your onboarding is by phone call)
- [x] B10 Blocked dates validated, idempotent, refused if a booking exists; calendar errors surfaced (a tap-to-block button already existed)
- [x] B11 Max 5 pending requests per family
- [~] B12 Security headers: CSP limited to `frame-ancestors/base-uri/form-action/object-src` (script/style CSP not enforced: Next inlines scripts and I cannot browser-test a strict policy)
- [x] B13 Two live bookings for one priest/day impossible (DB partial unique index; app maps the error to 409)
- [x] B14 Open redirect in the auth callback (`?redirect=@evil` / `//evil`)
- [x] B15 Landing page had invented testimonials and an on-time guarantee that nothing implements: removed/reworded
- [x] B16 `getSessionUser` wrote to the DB on every request; now read-first
- [x] B17 Privacy page contradicted behaviour (documents, phone sharing): updated
- [x] B19 Removed the "replacement priest within 2 hours" promise (FAQ, Terms) and other statements the product does not do: "we review a priest's first 3 bookings", "book up to 6 months ahead" (it is 12), "notified within 24 hours" (it is 48), samagri cost "bundled", "always prepared / always there"
- [x] B20 Travel-fee input removed from priest forms: it never affected anything, so asking for it implied a feature that did not exist
- [x] B21 Replaced profile photos are deleted from storage; unused `/api/priests` endpoint and unused imports removed
- [x] B18 Migration validation caught a stray log line in the generated `0004` SQL that would have failed the deploy: fixed

## C. Booking integrity
- [~] C1 Per-ceremony price + "samagri included" (`PriestCeremony`); browse price range derived from it
- [~] C2 Weekly hours + blocked dates + one booking/day enforced on create and reschedule
- [~] C3 Wizard offers only the priest's ceremonies and cities; real availability greys out dates and limits start times
- [x] C4 Lead time ≥1 day (IST), horizon 365 days
- [x] C5 Samagri price consistency (no hidden ₹500; "included" honoured)
- [~] C6 Family mobile captured; priest sees it after accepting; priest's mobile shown to family after accepting
- [~] C7 Reschedule (max 2) → back to PENDING, priest re-notified
- [~] C8 Daily cron releases requests unanswered for 48h
- [~] C9 Priest records amount received at completion; earnings use it

## D. Notifications (email + in-app)
- [~] D1 Family gets "request sent"; D2 priest verified/rejected email; admin alerted on new application
- [~] D3 Samagri checklist emailed on accept (the wizard promised it; it was never sent)
- [~] D4 In-app notifications, bell with unread count, `/notifications`
- [~] D5 Reschedule / cancel / decline / expiry notify the other side
- [!] D6 All email depends on A5

## E. Priest journey
- [~] E1 Registration saves phone, per-ceremony prices; default Mon–Sun hours
- [~] E2 Profile: photo, per-ceremony pricing, weekly hours, documents, phone
- [~] E3 Private document upload; admin signed links (10 min)
- [x] E4 Pending / rejected / paused banners on dashboard and profile
- [x] E5 Calendar fixes (see B6, B10)
- [~] E6 Earnings from amount received

## F. Consumer journey
- [x] F1 Navbar shows signed-in state, My Bookings, Saved, bell, Sign out
- [~] F2 Booking detail page with map link, contact reveal, reschedule, cancel, review, book again
- [~] F3 Wizard prefilled from last booking; Google Maps link field; fake "parking" input removed
- [~] F4 "Available on" date filter + sort + rating/price filters
- [~] F5 Save/favourite priests, `/favorites`
- [~] F6 Book again

## G. Admin
- [x] G1 Sign out, site link; verification queue shows phone/email + document viewer
- [~] G2 Pause / reactivate priests; all-priests tab
- [x] G3 Recent bookings show priest, family contact, phone

## H. Platform
- [x] H1 Sitemap lists verified priests (falls back to static pages if DB is down)
- [x] H2 Unit tests + PGlite validation described above
- [x] H3 `docs/RUNBOOK.md`

## Deferred on purpose (external account, API key or product decision)
Google/phone login · WhatsApp/SMS (removed earlier on purpose) · map autocomplete and distance-based travel fee · UI translation (Tamil/Telugu/Kannada/Malayalam) · virtual ceremonies · recurring/annual reminders · multi-priest ceremonies · payments (none, by design) · rate limiting (use Vercel firewall) · strict script CSP.

## Decisions for you
- Wording that is a business commitment rather than product behaviour, left as written: "zero commission, ever" and "Founding Priest" (register page, FAQ, home), and "every priest is verified by phone" (home, about, FAQ). True only while you keep doing it.

## Human steps (cannot be done from here)
1. **Resend**: verify a domain; set `FROM_EMAIL` in Vercel; in Supabase → Auth → SMTP use the same sender and a Resend SMTP key.
2. **Database** (run in order, from the repo with `.env.local` pointing at production):
   `npx prisma migrate resolve --applied 0001_init`
   `npx prisma migrate resolve --applied 0002_rename_identity_verified`
   `npx prisma migrate resolve --applied 0003_remove_payment_gateway`
   `npx prisma migrate deploy`
3. **Vercel env**: `CRON_SECRET` (long random string), `NEXT_PUBLIC_APP_URL=https://priest-azure.vercel.app`.
4. Deploy; then do the manual pass: sign in → register as priest → upload photo/doc → admin approves → book from another account → accept → reschedule → complete with amount → review → check bell and emails.
5. Remove test accounts; onboard real priests.
