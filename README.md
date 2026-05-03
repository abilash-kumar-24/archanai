# Archanai — Hindu Priest Services Platform

> Urban Company for Hindu religious services — connecting verified priests with families across South India for pujas, ceremonies, and life events.

---

## Vision

A trusted, professional marketplace where families find verified Hindu priests for any ceremony — from a simple Satyanarayan Puja to a full Upanayanam — with transparent pricing, regional tradition matching, and a seamless booking experience built for mobile-first India.

---

## V1 Cities

| City | State | Primary Traditions |
|---|---|---|
| Chennai | Tamil Nadu | Iyer (Smartha), Iyengar (Sri Vaishnava) |
| Bangalore | Karnataka | Madhwa, Smartha, Vaishnava |
| Hyderabad | Telangana | Telugu Brahmin (Niyogi, Vaidiki) |
| Cochin | Kerala | Namboodiri, Kerala Smartha |
| Amaravati | Andhra Pradesh | Telugu Brahmin (Vaidiki) |

---

## V1 Ceremonies

| Ceremony | Avg Duration | Notes |
|---|---|---|
| Griha Pravesh | 2–3 hrs | New home blessing |
| Satyanarayan Puja | 1.5–2 hrs | Monthly / any occasion |
| Namakarana | 1–2 hrs | Naming ceremony |
| Upanayanam | 4–6 hrs | Sacred thread — high value |
| Seemantham / Valaikappu | 2–3 hrs | Baby shower (South India) |
| Annaprashana | 1–1.5 hrs | First food ceremony |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma |
| Auth | Supabase Auth (OTP / Google OAuth) |
| Payments | Razorpay |
| File Storage | Supabase Storage |
| WhatsApp | Twilio WhatsApp Business API |
| Maps | Google Maps API |
| Email | Resend |
| Deployment | Vercel (frontend + API) |
| CI/CD | GitHub Actions |

---

## Features

### Consumer-Facing

#### V1 — Live
- [ ] City selector on landing page
- [ ] Browse ceremonies by type
- [ ] Priest discovery with filters
  - Tradition / sampradaya
  - Language spoken
  - Star rating
  - Price range
  - Availability on date
- [ ] Priest profile page
  - Photo, bio, tradition, languages
  - Specializations and ceremonies offered
  - Reviews with ceremony photos
  - Verified badges
- [ ] Booking flow
  - Select ceremony → date/time → location
  - Samagri choice (priest-arranged or platform checklist)
  - Family details form (names, gotram, nakshatra, rashi)
  - Special instructions / custom requests
- [ ] Deposit payment (30%) via Razorpay (UPI, card, netbanking)
- [ ] Booking confirmation via WhatsApp + Email
- [ ] Samagri checklist PDF (auto-generated, ceremony + region aware)
- [ ] 24h ceremony reminder (WhatsApp)
- [ ] Post-ceremony review request (WhatsApp)
- [ ] Review submission with optional photo upload

#### V2 — Planned
- [ ] Samagri kit delivery (platform-curated, doorstep delivery 24h before)
- [ ] Panchang integration — auspicious date/time suggestions inline
- [ ] NRI booking flow (remote booking for family in India, pay in USD/GBP)
- [ ] Multi-priest coordination (ceremonies requiring 2–4 priests)
- [ ] Video consultation (15-min pre-ceremony call with priest)
- [ ] Waitlist / availability alerts for high-demand dates
- [ ] Surge indicators on calendar (Muhurtam-aware)

#### V3 — Future
- [ ] Ceremony recap — photo summary posted to consumer account
- [ ] Temple tie-up discovery (priests affiliated with specific temples)
- [ ] Repeat family profiles — store gotram/nakshatra for future bookings
- [ ] Community Q&A — ask priests questions before booking
- [ ] Gift a puja — book and gift a ceremony to someone else
- [ ] Subscription plans — monthly Satyanarayan or festival pujas on auto-schedule

---

### Priest-Facing Dashboard

#### V1 — Live
- [ ] Profile setup wizard
  - Photo upload
  - Bio and tradition (sampradaya)
  - Languages spoken
  - Ceremonies offered + price ranges
  - Service cities / radius
- [ ] Availability calendar management
- [ ] Incoming booking request (accept / decline with reason)
- [ ] Pre-ceremony briefing view (family details, ceremony notes, address)
- [ ] Earnings dashboard (upcoming, completed, payouts)
- [ ] Cancellation management

#### V2 — Planned
- [ ] Multi-city service toggle
- [ ] Recurring availability templates (e.g., "available every weekend")
- [ ] Priest-to-consumer direct messaging (pre-ceremony)
- [ ] Package offerings (ceremony + samagri bundle pricing)

#### V3 — Future
- [ ] Priest analytics (peak demand periods, top ceremonies)
- [ ] Referral program for priests onboarding other priests
- [ ] Training / certification badge system

---

### Admin Panel

#### V1 — Live
- [ ] Priest verification workflow (identity + tradition)
- [ ] Booking oversight and status tracking
- [ ] Dispute management
- [ ] Commission tracking and payout management
- [ ] City and ceremony configuration

#### V2 — Planned
- [ ] Samagri kit inventory management
- [ ] Analytics dashboard (bookings, revenue, city-wise)
- [ ] Priest performance monitoring (cancellation rates, ratings)

---

## Samagri Options

| Option | Description | V1 |
|---|---|---|
| **A — Priest-Arranged** | Priest sources all materials, bundled into price | ✅ |
| **B — Self-Arranged (Guided)** | Platform generates ceremony + region-specific checklist | ✅ |
| **C — Platform Kit Delivery** | Curated kit delivered 24h before ceremony | V2 |

Samagri lists are region-aware. A Rudrabhishek in Tamil Nadu uses different items than one in UP. Lists are keyed by `ceremony_type + regional_tradition`.

---

## Pricing Model

- Consumer pays **30% deposit** at booking via Razorpay
- Balance paid **directly to priest** (cash or UPI) on ceremony day
- Platform commission: **12% of deposit** (V1)
- Priests set a **"Suggested Contribution Range"** (respects dakshina culture)
- Travel fee auto-calculated based on distance from priest's base location
- Urgency/same-day premium: +25%

---

## Trust & Verification

| Layer | Method |
|---|---|
| Identity | Aadhaar-linked verification |
| Tradition | Self-declared sampradaya + community references |
| Experience | Years of practice, ceremonies performed count |
| Reviews | Post-ceremony, photo-verified |
| Community | Temple affiliation badge |
| Repeat bookings | "X families have booked again" social proof |

---

## Cancellation Policy

**Priest cancels:**
- < 48h: Consumer gets full refund + ₹500 platform credit + priority rebooking
- Platform attempts to find replacement priest

**Consumer cancels:**
- > 7 days before: Full refund
- 3–7 days before: 50% refund
- < 48h: No refund (priest's time was blocked)

---

## Language Support

| Language | Region |
|---|---|
| English | All cities |
| Tamil | Chennai |
| Kannada | Bangalore |
| Telugu | Hyderabad, Amaravati |
| Malayalam | Cochin |

Ceremony names and descriptions are localized per language. UI ships in English first; regional languages in V1.1.

---

## WhatsApp Communication (Twilio Business API)

All key lifecycle events trigger WhatsApp messages — primary communication channel.

| Event | Recipient |
|---|---|
| Booking confirmed | Consumer + Priest |
| Booking accepted by priest | Consumer |
| Samagri checklist | Consumer (if Option B) |
| 24h reminder | Consumer + Priest |
| Post-ceremony review request | Consumer |
| Payment received | Priest |
| Cancellation notice | Consumer + Priest |

---

## Pain Points (Known)

| Pain Point | Impact | Mitigation |
|---|---|---|
| Priest no-show | Critical — destroys trust | Deposit lock + backup priest pool per city |
| Last-minute Muhurtam demand | High — dates non-negotiable | Panchang calendar + waitlist (V2) |
| Price ambiguity / day-of negotiation | High | Lock agreed range in WhatsApp confirmation |
| Consumer distrust of online booking for sacred events | High | Verified profiles + community endorsements + photos |
| Regional tradition mismatch | High | Mandatory sampradaya filter; enforced at search level |
| Samagri variation by region | Medium | Ceremony + tradition keyed checklists |
| Rural priest digital literacy | Medium | Simplified priest app + phone-based onboarding support |
| Multi-religion sensitivity (future expansion) | Low (V1 is Hindu-only) | Neutral brand — avoid overly Hindu iconography in core UI |

---

## Risks

| Risk | Likelihood | Severity | Plan |
|---|---|---|---|
| Cold start — no priests at launch | High | Critical | Hand-curate 20–30 priests per city before launch; zero commission for 3 months |
| Priest resistance to fixed/visible pricing | High | High | Frame as "Suggested Contribution Range", not fixed fee |
| High-value ceremony (wedding) gone wrong | Medium | Critical | Exclude weddings from V1; build trust first |
| Payment disputes | Medium | High | Hold deposit in escrow; clear cancellation policy |
| Competitor copy (Urban Company, etc.) | Medium | Medium | Move fast; build priest loyalty via Founding Priest program |
| Data privacy (family religious data) | Low | High | Encrypt gotram/nakshatra fields; DPDP Act compliance |
| Seasonal demand crashes | Low | Medium | Diversify across ceremony types that span all seasons |

---

## Expansion Roadmap

### Phase 1 — V1 (Months 1–6)
- 5 South Indian cities
- 6 ceremony types
- 125 verified priests (25/city)
- Target: 500 bookings, 30% repeat rate

### Phase 2 — V2 (Months 7–12)
- Add Mumbai, Pune, Delhi, Kolkata
- Add weddings (managed service with coordinator)
- Samagri kit delivery (logistics partner)
- Panchang integration
- NRI booking flow

### Phase 3 — V3 (Year 2)
- Pan-India (30+ cities)
- Multi-religion expansion (Jain, Sikh — similar service model)
- B2B: Corporate event pujas, apartment association festivals
- Temple partnerships (outsourced priest availability)
- Subscription plans for families

### Phase 4 — International (Year 3)
- NRI markets: USA, UK, Singapore, UAE, Australia
- Remote booking for India-based ceremonies already validated
- Local priest directories in diaspora cities

---

## Priest Onboarding Strategy (V1)

**Target:** 20–30 priests per city before public launch

| City | Outreach Channels |
|---|---|
| Chennai | Mylapore / T. Nagar temple networks; Brahmin sabhas |
| Bangalore | Malleswaram / Basavanagudi; Pejavara/Uttaradi Math |
| Hyderabad | Secunderabad temple trusts; Telugu Brahmin associations |
| Cochin | Thrissur network; Namboodiri samajam |
| Amaravati | TTD-affiliated priest networks |

**Founding Priest Benefits:**
- Zero commission for first 3 months
- Permanent "Founding Priest" badge
- Free professional profile photo shoot
- Priority placement in search results

---

## V1 Success Metrics

| Metric | 6-Month Target |
|---|---|
| Priests onboarded | 125 (25/city) |
| Bookings completed | 500 |
| Repeat booking rate | > 30% |
| Average priest rating | > 4.3 / 5 |
| Priest-side cancellation rate | < 5% |
| WhatsApp message open rate | > 80% |
| Deposit payment conversion | > 70% of initiated bookings |

---

## Project Structure

```
archanai/
├── app/                        # Next.js App Router
│   ├── (consumer)/             # Consumer-facing pages
│   │   ├── page.tsx            # Landing page
│   │   ├── browse/             # Ceremony + priest discovery
│   │   ├── priests/[id]/       # Priest profile
│   │   ├── book/               # Booking flow
│   │   ├── bookings/           # My bookings
│   │   └── review/             # Post-ceremony review
│   ├── (priest)/               # Priest dashboard
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── calendar/
│   │   └── earnings/
│   ├── (admin)/                # Admin panel
│   └── api/                    # API routes
│       ├── bookings/
│       ├── priests/
│       ├── payments/
│       ├── whatsapp/
│       └── samagri/
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── consumer/               # Consumer-specific components
│   ├── priest/                 # Priest dashboard components
│   └── shared/                 # Shared across both portals
├── lib/
│   ├── supabase/               # Supabase client + helpers
│   ├── razorpay/               # Payment helpers
│   ├── twilio/                 # WhatsApp messaging
│   ├── panchang/               # Auspicious date logic (V2)
│   └── samagri/                # Ceremony + region samagri data
├── prisma/
│   └── schema.prisma
├── public/
└── types/
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Resend (Email)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## License

Private — All rights reserved.
