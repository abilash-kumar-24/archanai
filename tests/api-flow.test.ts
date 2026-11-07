// End-to-end API journey: runs the real route handlers against an in-memory Postgres (PGlite) with the
// real migrations. Only the Supabase session and Storage are replaced. Run with `npm run test:api`.
import { test, mock, before, after } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { resolve } from "node:path"
import { createRequire } from "node:module"
import { NextRequest } from "next/server"

process.env.NEXT_PUBLIC_SUPABASE_URL = "http://x"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "x"
process.env.SUPABASE_SERVICE_ROLE_KEY = "x"
process.env.CRON_SECRET = "test-secret"
process.env.BREVO_SMTP_USER = "u"
process.env.BREVO_SMTP_KEY = "k"
process.env.DIRECT_URL = "postgresql://postgres:postgres@127.0.0.1:5546/postgres"
process.env.DATABASE_URL = process.env.DIRECT_URL

type U = { id: string; role: string; name: string; email: string; phone: string | null }
let current: U | null = null // who is "signed in"
const file = (p: string) => pathToFileURL(resolve(p)).href

mock.module(file("lib/supabase/get-session-user.ts"), { namedExports: { getSessionUser: async () => current } })
const sent: { to: string | string[]; subject: string; html: string }[] = []
const fakeNodemailer = { createTransport: () => ({ sendMail: async (m: (typeof sent)[number]) => { sent.push(m) } }) }
mock.module(pathToFileURL(createRequire(resolve("package.json")).resolve("nodemailer")).href, { defaultExport: fakeNodemailer, namedExports: fakeNodemailer })
const flush = () => new Promise((r) => setTimeout(r, 30)) // emails run after the response
const mailTo = (to: string, subjectStart: string) => sent.filter((m) => String(m.to).includes(to) && m.subject.startsWith(subjectStart))
mock.module(file("lib/supabase/admin.ts"), {
  namedExports: {
    supabaseAdmin: {
      auth: { admin: { updateUserById: async () => ({ error: null }) } },
      storage: { createBucket: async () => ({}), from: () => ({ upload: async () => ({ error: null }), remove: async () => ({}), getPublicUrl: () => ({ data: { publicUrl: "http://x/p.jpg" } }), createSignedUrl: async () => ({ data: { signedUrl: "http://x/signed" } }) }) },
    },
  },
})

let prisma: typeof import("../lib/prisma").prisma
let close: () => Promise<void>
// Route modules are loaded after the mocks are installed, so they are typed loosely here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const routes: Record<string, any> = {}
const R = (path: string, method: string, body?: unknown, headers: Record<string, string> = {}) => {
  return new NextRequest(`http://localhost${path}`, { method, headers: { "content-type": "application/json", ...headers }, body: body === undefined ? undefined : JSON.stringify(body) })
}
const ctx = (id: string) => ({ params: Promise.resolve({ id }) })
const as = (u: U | null) => { current = u }
const day = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10)
const bookingBody = (priestId: string, date: string, extra: object = {}) => ({
  priestId, ceremonyType: "GRIHA_PRAVESH", scheduledDate: date, scheduledTime: "09:00", addressLine1: "12 Temple Street",
  city: "CHENNAI", pincode: "600001", contactPhone: "9876543210", samagriOption: "SELF_ARRANGED", familyDetails: { primaryName: "Ramesh Kumar" }, ...extra,
})

before(async () => {
  const { PGlite } = await import("@electric-sql/pglite")
  const { PGLiteSocketServer } = await import("@electric-sql/pglite-socket")
  const db = await PGlite.create()
  for (const d of readdirSync("prisma/migrations").filter((x) => /^\d{4}_/.test(x)).sort()) await db.exec(readFileSync(`prisma/migrations/${d}/migration.sql`, "utf8"))
  const server = new PGLiteSocketServer({ db, port: 5546, host: "127.0.0.1", maxConnections: 10 } as never)
  await server.start()
  close = async () => { await server.stop(); await db.close() }
  ;({ prisma } = await import("../lib/prisma"))
  for (const [type, name] of [["GRIHA_PRAVESH", "Griha Pravesh"], ["SATYANARAYAN_PUJA", "Satyanarayan Puja"], ["NAMAKARANA", "Namakarana"], ["UPANAYANAM", "Upanayanam"], ["SEEMANTHAM", "Seemantham"], ["ANNAPRASHANA", "Annaprashana"]]) {
    await prisma.ceremony.create({ data: { type: type as never, name, description: "d", durationMin: 60, durationMax: 120 } })
  }
  routes.register = await import("../app/api/priests/register/route")
  routes.verify = await import("../app/api/admin/priests/[id]/verify/route")
  routes.bookings = await import("../app/api/bookings/route")
  routes.confirm = await import("../app/api/bookings/[id]/confirm/route")
  routes.reschedule = await import("../app/api/bookings/[id]/reschedule/route")
  routes.complete = await import("../app/api/bookings/[id]/complete/route")
  routes.review = await import("../app/api/bookings/[id]/review/route")
  routes.cancel = await import("../app/api/bookings/[id]/cancel/route")
  routes.blocked = await import("../app/api/priests/blocked-dates/route")
  routes.availability = await import("../app/api/priests/[id]/availability/route")
  routes.me = await import("../app/api/priests/me/route")
  routes.expire = await import("../app/api/cron/expire/route")
  routes.favorites = await import("../app/api/favorites/route")
  routes.notifications = await import("../app/api/notifications/route")
})
after(async () => { await prisma.$disconnect(); await close(); process.exit(0) })

const mkUser = async (tag: string, role = "CONSUMER", phone: string | null = null): Promise<U> => {
  const u = await prisma.user.create({ data: { supabaseId: `s-${tag}`, email: `${tag}@t.in`, name: tag, role: role as never, phone } })
  return { id: u.id, role, name: tag, email: u.email, phone }
}

let admin: U, priestUser: U, family: U, other: U, priestId: string, bookingId: string
const profile = {
  displayName: "Pandit Venkat", bio: "Trained in Vedic rituals for over a decade in Tamil Nadu.", experienceYears: 12, tradition: "IYER_SMARTHA",
  languages: ["TAMIL"], cities: ["CHENNAI"], phone: "9123456780",
  offerings: [{ type: "GRIHA_PRAVESH", price: 3000, samagriIncluded: false }, { type: "UPANAYANAM", price: 9000, samagriIncluded: true }],
}

test("priest registers: profile, offerings, default week, phone, admin notified", async () => {
  admin = await mkUser("admin", "ADMIN"); priestUser = await mkUser("priest"); family = await mkUser("family"); other = await mkUser("other")
  as(null); assert.equal((await routes.register.POST(R("/", "POST", profile))).status, 401)
  as(priestUser)
  assert.equal((await routes.register.POST(R("/", "POST", { ...profile, phone: "123" }))).status, 422)
  const res = await routes.register.POST(R("/", "POST", profile))
  assert.equal(res.status, 201)
  priestId = (await res.json()).priestId
  const p = await prisma.priest.findUniqueOrThrow({ where: { id: priestId }, include: { ceremonyOfferings: true, availability: true, user: true } })
  assert.equal(p.verificationStatus, "PENDING"); assert.equal(p.ceremonyOfferings.length, 2); assert.equal(p.availability.length, 7)
  assert.equal(p.priceRangeMin, 3000); assert.equal(p.priceRangeMax, 9000); assert.equal(p.user.phone, "9123456780"); assert.equal(p.user.role, "PRIEST")
  assert.equal(await prisma.notification.count({ where: { userId: admin.id, type: "PRIEST_APPLIED" } }), 1)
  await flush(); assert.equal(mailTo("admin@t.in", "New priest application").length, 1, "admin emailed")
  assert.equal((await routes.register.POST(R("/", "POST", profile))).status, 409, "second registration refused")
})

test("unverified priest cannot be booked; admin gate on verify", async () => {
  as(family)
  assert.equal((await routes.bookings.POST(R("/", "POST", bookingBody(priestId, day(5))))).status, 409)
  assert.equal((await routes.verify.POST(R("/", "POST", { action: "approve" }), ctx(priestId))).status, 403, "non-admin")
  as(admin)
  assert.equal((await routes.verify.POST(R("/", "POST", { action: "bogus" }), ctx(priestId))).status, 400)
  assert.equal((await routes.verify.POST(R("/", "POST", { action: "approve" }), ctx(priestId))).status, 200)
  assert.equal(await prisma.notification.count({ where: { userId: priestUser.id, type: "PRIEST_VERIFIED" } }), 1)
  await flush(); assert.equal(mailTo("priest@t.in", "You're verified").length, 1, "priest emailed")
})

test("booking validation", async () => {
  as(family)
  const post = (b: object) => routes.bookings.POST(R("/", "POST", b))
  assert.equal((await post(bookingBody(priestId, day(0)))).status, 409, "today")
  assert.equal((await post(bookingBody(priestId, day(-3)))).status, 409, "past")
  assert.equal((await post(bookingBody(priestId, "2026-02-30"))).status, 400, "impossible date")
  assert.equal((await post(bookingBody(priestId, day(5), { city: "BANGALORE" }))).status, 400, "city not served")
  assert.equal((await post(bookingBody(priestId, day(5), { contactPhone: "12345" }))).status, 400, "bad phone")
  assert.equal((await post(bookingBody(priestId, day(5), { ceremonyType: "NAMAKARANA" }))).status, 400, "ceremony not offered")
  assert.equal((await post(bookingBody(priestId, day(5), { addressLine1: "x" }))).status, 400, "short address")
  // user text must be escaped inside the email the priest receives
  const evil = await post(bookingBody(priestId, day(60), { familyDetails: { primaryName: "<img src=x onerror=alert(1)>" } }))
  assert.equal(evil.status, 200)
  await flush()
  const m = sent.filter((x) => x.subject.startsWith("New Booking Request")).at(-1)!
  assert.ok(m.html.includes("&lt;img src=x") && !m.html.includes("<img src=x"), "html injection neutralised")
  await routes.cancel.POST(R("/", "POST", {}), ctx((await prisma.booking.findFirstOrThrow({ where: { scheduledDate: new Date(`${day(60)}T00:00:00Z`) } })).id))
})

test("booking created with the priest's price; priest notified; double-booking refused", async () => {
  as(family)
  const res = await routes.bookings.POST(R("/", "POST", bookingBody(priestId, day(5))))
  assert.equal(res.status, 200)
  const { bookingId: id, bookingRef } = await res.json(); bookingId = id
  assert.match(bookingRef, /^ARC-\d{4}-[0-9A-F]{8}$/)
  const b = await prisma.booking.findUniqueOrThrow({ where: { id } })
  assert.equal(b.totalAmount, 3000); assert.equal(b.status, "PENDING"); assert.equal(b.contactPhone, "9876543210")
  assert.equal(await prisma.notification.count({ where: { userId: priestUser.id, type: "BOOKING_REQUEST", body: { contains: "Ramesh Kumar" } } }), 1)
  await flush()
  assert.equal(mailTo("priest@t.in", "New Booking Request").filter((m) => m.subject.includes(bookingRef)).length, 1, "priest emailed")
  assert.equal(mailTo("family@t.in", "Request sent").filter((m) => m.subject.includes(bookingRef)).length, 1, "family emailed")
  as(other)
  assert.equal((await routes.bookings.POST(R("/", "POST", bookingBody(priestId, day(5))))).status, 409, "same day")
  assert.equal((await routes.bookings.POST(R("/", "POST", bookingBody(priestId, day(6), { ceremonyType: "UPANAYANAM" })))).status, 200, "other day, samagri-included ceremony")
  const up = await prisma.booking.findFirstOrThrow({ where: { consumerId: other.id } })
  assert.equal(up.samagriOption, "PRIEST_ARRANGED"); assert.equal(up.totalAmount, 9000)
})

test("availability endpoint reports booked day; blocked dates guarded", async () => {
  const av = await (await routes.availability.GET(R(`/api/priests/${priestId}/availability`, "GET"), ctx(priestId))).json()
  assert.ok(av.unavailable.includes(day(5)) && av.windows.length === 7)
  as(priestUser)
  const block = (d: string) => routes.blocked.POST(R("/", "POST", { date: d }))
  assert.equal((await block(day(5))).status, 409, "has a booking")
  assert.equal((await block("garbage")).status, 400)
  assert.equal((await block(day(-1))).status, 400, "past")
  const a = await block(day(9)); const b = await block(day(9))
  assert.equal(a.status, 201); assert.equal((await a.json()).id, (await b.json()).id, "idempotent")
  as(family)
  assert.equal((await routes.bookings.POST(R("/", "POST", bookingBody(priestId, day(9))))).status, 409, "blocked day")
})

test("accept: only the owning priest, only once; family notified", async () => {
  const act = (u: U, a: string) => { as(u); return routes.confirm.POST(R("/", "POST", { action: a }), ctx(bookingId)) }
  assert.equal((await act(family, "accept")).status, 403)
  assert.equal((await act(priestUser, "nonsense")).status, 400)
  assert.equal((await act(priestUser, "accept")).status, 200)
  assert.equal((await act(priestUser, "accept")).status, 409, "already accepted")
  assert.equal(await prisma.notification.count({ where: { userId: family.id, type: "BOOKING_ACCEPTED" } }), 1)
  await flush()
  const conf = mailTo("family@t.in", "Booking Confirmed").at(-1)!
  assert.ok(conf.html.includes("9123456780"), "priest phone in confirmation")
  assert.equal(mailTo("family@t.in", "Samagri checklist").length, 1, "self-arranged family gets the checklist")
})

test("reschedule: validated, returns to PENDING, limited to 2", async () => {
  const re = (d: string, u: U = family) => { as(u); return routes.reschedule.POST(R("/", "POST", { scheduledDate: d, scheduledTime: "10:00" }), ctx(bookingId)) }
  assert.equal((await re(day(11), other)).status, 403, "not the family's booking")
  assert.equal((await re(day(9))).status, 409, "blocked day")
  assert.equal((await re(day(6))).status, 409, "priest already has a booking that day")
  assert.equal((await re(day(11))).status, 200)
  let b = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } })
  assert.equal(b.status, "PENDING"); assert.equal(b.rescheduleCount, 1); assert.equal(b.confirmedAt, null)
  assert.equal((await re(day(12))).status, 200)
  assert.equal((await re(day(13))).status, 409, "third reschedule refused")
  b = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } }); assert.equal(b.rescheduleCount, 2)
})

test("complete: needs acceptance and the date; records amount; rating from review", async () => {
  as(priestUser)
  const done = (o: object) => routes.complete.POST(R("/", "POST", o), ctx(bookingId))
  assert.equal((await done({ outcome: "completed" })).status, 409, "still pending")
  await routes.confirm.POST(R("/", "POST", { action: "accept" }), ctx(bookingId))
  assert.equal((await done({ outcome: "completed" })).status, 409, "date has not arrived")
  await prisma.booking.update({ where: { id: bookingId }, data: { scheduledDate: new Date(`${day(-1)}T00:00:00Z`) } })
  as(family); assert.equal((await done({ outcome: "completed" })).status, 403, "family cannot complete")
  as(priestUser)
  assert.equal((await done({ outcome: "completed", amountReceived: -5 })).status, 400)
  assert.equal((await done({ outcome: "completed", amountReceived: 3500 })).status, 200)
  const b = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } })
  assert.equal(b.status, "COMPLETED"); assert.equal(b.amountReceived, 3500)
  assert.equal((await prisma.priest.findUniqueOrThrow({ where: { id: priestId } })).ceremoniesCount, 1)

  const rev = (u: U, rating: number) => { as(u); return routes.review.POST(R("/", "POST", { rating, body: "Wonderful" }), ctx(bookingId)) }
  assert.equal((await rev(other, 5)).status, 403, "stranger")
  assert.equal((await rev(family, 9)).status, 400)
  assert.equal((await rev(family, 5)).status, 201)
  assert.equal((await rev(family, 4)).status, 409, "one review per booking")
  const p = await prisma.priest.findUniqueOrThrow({ where: { id: priestId } })
  assert.equal(p.rating, 5); assert.equal(p.reviewCount, 1)
})

test("cancel frees the day; only the family can cancel", async () => {
  as(family)
  const id = (await (await routes.bookings.POST(R("/", "POST", bookingBody(priestId, day(20))))).json()).bookingId
  as(other); assert.equal((await routes.cancel.POST(R("/", "POST", {}), ctx(id))).status, 403)
  as(family); assert.equal((await routes.cancel.POST(R("/", "POST", { reason: "plans changed" }), ctx(id))).status, 200)
  assert.equal((await routes.cancel.POST(R("/", "POST", {}), ctx(id))).status, 409, "already cancelled")
  assert.equal((await routes.bookings.POST(R("/", "POST", bookingBody(priestId, day(20))))).status, 200, "day is free again")
})

test("pending cap per family", async () => {
  const extra = await mkUser("capfam"); as(extra)
  const p2 = await prisma.priest.findUniqueOrThrow({ where: { id: priestId } })
  let last = 200
  for (let i = 0; i < 6; i++) last = (await routes.bookings.POST(R("/", "POST", bookingBody(p2.id, day(30 + i))))).status
  assert.equal(last, 429, "6th pending request refused")
})

test("expiry cron: secret required; stale pending released and family told", async () => {
  assert.equal((await routes.expire.GET(R("/", "GET"))).status, 403)
  assert.equal((await routes.expire.GET(R("/", "GET", undefined, { authorization: "Bearer wrong" }))).status, 403)
  const stale = await prisma.booking.findFirstOrThrow({ where: { consumerId: (await prisma.user.findFirstOrThrow({ where: { name: "capfam" } })).id }, orderBy: { scheduledDate: "asc" } })
  await prisma.$executeRawUnsafe(`update bookings set updated_at = now() - interval '3 days' where id = '${stale.id}'`)
  const res = await routes.expire.GET(R("/", "GET", undefined, { authorization: "Bearer test-secret" }))
  assert.equal((await res.json()).expired, 1)
  const b = await prisma.booking.findUniqueOrThrow({ where: { id: stale.id } })
  assert.equal(b.status, "CANCELLED_PRIEST"); assert.match(b.cancellationReason ?? "", /No response/)
})

test("profile update replaces offerings and validates", async () => {
  as(priestUser)
  const put = (b: object) => routes.me.PUT(R("/", "PUT", b))
  const week = [0, 1, 2, 3, 4, 5, 6].map((d) => ({ dayOfWeek: d, startTime: "07:00", endTime: "12:00" }))
  assert.equal((await put({ ...profile, availability: [] })).status, 422, "needs a working day")
  assert.equal((await put({ ...profile, availability: [{ dayOfWeek: 1, startTime: "12:00", endTime: "07:00" }] })).status, 422)
  assert.equal((await put({ ...profile, offerings: [{ type: "GRIHA_PRAVESH", price: 3500, samagriIncluded: true }], availability: week })).status, 200)
  const p = await prisma.priest.findUniqueOrThrow({ where: { id: priestId }, include: { ceremonyOfferings: true } })
  assert.deepEqual(p.ceremonies, ["GRIHA_PRAVESH"]); assert.equal(p.priceRangeMin, 3500); assert.equal(p.ceremonyOfferings.length, 1)
  // new hours are enforced on booking: 09:00 allowed, 13:00 refused
  as(family)
  assert.equal((await routes.bookings.POST(R("/", "POST", bookingBody(priestId, day(40), { scheduledTime: "13:00" })))).status, 409, "outside hours")
  assert.equal((await routes.bookings.POST(R("/", "POST", bookingBody(priestId, day(40), { scheduledTime: "09:00" })))).status, 200)
  const me = await (await routes.me.GET()).json(); void me
})

test("favourites and notifications", async () => {
  as(family)
  assert.equal((await routes.favorites.POST(R("/", "POST", { priestId, favorite: true }))).status, 200)
  assert.equal(await prisma.favorite.count({ where: { userId: family.id } }), 1)
  assert.equal((await routes.favorites.POST(R("/", "POST", { priestId: "nope", favorite: true }))).status, 404)
  assert.equal((await routes.favorites.POST(R("/", "POST", { priestId, favorite: false }))).status, 200)
  assert.equal(await prisma.favorite.count({ where: { userId: family.id } }), 0)
  const n = await (await routes.notifications.GET()).json()
  assert.ok(n.unread >= 1)
  await routes.notifications.POST()
  assert.equal((await (await routes.notifications.GET()).json()).unread, 0)
})

test("admin can pause a priest; paused priest cannot be booked", async () => {
  as(admin); assert.equal((await routes.verify.POST(R("/", "POST", { action: "deactivate" }), ctx(priestId))).status, 200)
  as(family); assert.equal((await routes.bookings.POST(R("/", "POST", bookingBody(priestId, day(50))))).status, 409)
  as(admin); assert.equal((await routes.verify.POST(R("/", "POST", { action: "reactivate" }), ctx(priestId))).status, 200)
  as(family); assert.equal((await routes.bookings.POST(R("/", "POST", bookingBody(priestId, day(50))))).status, 200)
})
