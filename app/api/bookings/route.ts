export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { randomBytes } from "crypto"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { sendPriestBookingAlert, sendBookingReceived } from "@/lib/resend/emails"
import { notify } from "@/lib/notify"
import { background } from "@/lib/background"
import { parseDateOnly, todayIST } from "@/lib/dates"
import { evaluateSlot, loadSlotContext } from "@/lib/booking/availability"
import { CITIES, CEREMONIES } from "@/lib/constants"
import { format } from "date-fns"
import type { City, CeremonyType } from "@/types"

const MAX_PENDING_PER_CONSUMER = 5

// ─── GET — list bookings for the logged-in consumer ──────────────────────────

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const bookings = await prisma.booking.findMany({
    where:   { consumerId: user.id },
    include: { ceremony: true, priest: { select: { id: true, displayName: true, photoUrl: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ bookings })
}

// ─── POST — create a new booking request ─────────────────────────────────────

const createBookingSchema = z.object({
  priestId:      z.string(),
  ceremonyType:  z.enum(Object.keys(CEREMONIES) as [CeremonyType, ...CeremonyType[]]),
  scheduledDate: z.string(), // YYYY-MM-DD
  scheduledTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  addressLine1:  z.string().min(5).max(200),
  addressLine2:  z.string().max(200).optional(),
  city:          z.enum(Object.keys(CITIES) as [City, ...City[]]),
  pincode:       z.string().regex(/^\d{6}$/),
  googleMapsUrl: z.string().url().max(500).optional().or(z.literal("")),
  contactPhone:  z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  samagriOption: z.enum(["PRIEST_ARRANGED", "SELF_ARRANGED", "PLATFORM_KIT"]),
  familyDetails: z.object({
    primaryName: z.string().min(2).max(100),
    spouseName:  z.string().max(100).optional(),
    fatherName:  z.string().max(100).optional(),
    motherName:  z.string().max(100).optional(),
    gotram:      z.string().max(100).optional(),
    nakshatra:   z.string().max(100).optional(),
    rashi:       z.string().max(100).optional(),
    notes:       z.string().max(1000).optional(),
  }),
  specialRequests: z.string().max(1000).optional(),
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  try {
    const data = createBookingSchema.parse(await req.json())

    const day = parseDateOnly(data.scheduledDate)
    if (!day) return NextResponse.json({ error: "Invalid date" }, { status: 400 })

    const [priest, ceremony] = await Promise.all([
      prisma.priest.findUnique({
        where:   { id: data.priestId },
        include: { user: true, ceremonyOfferings: { where: { ceremonyType: data.ceremonyType } } },
      }),
      prisma.ceremony.findUnique({ where: { type: data.ceremonyType } }),
    ])
    if (!priest || !ceremony) {
      return NextResponse.json({ error: "Priest or ceremony not found" }, { status: 404 })
    }
    if (priest.verificationStatus !== "VERIFIED" || !priest.isActive) {
      return NextResponse.json({ error: "Priest is not available for booking" }, { status: 409 })
    }
    if (!priest.ceremonies.includes(ceremony.type)) {
      return NextResponse.json({ error: "Priest does not perform this ceremony" }, { status: 400 })
    }
    if (!priest.serviceCities.includes(data.city)) {
      return NextResponse.json({ error: "Priest does not serve this city" }, { status: 400 })
    }

    const pending = await prisma.booking.count({ where: { consumerId: user.id, status: "PENDING" } })
    if (pending >= MAX_PENDING_PER_CONSUMER) {
      return NextResponse.json({ error: "You have several requests awaiting a reply. Please wait for a response first." }, { status: 429 })
    }

    const ctx = await loadSlotContext(priest.id, data.scheduledDate, data.scheduledDate)
    const slot = evaluateSlot({ day: data.scheduledDate, time: data.scheduledTime, today: todayIST(), ...ctx })
    if (!slot.ok) return NextResponse.json({ error: slot.reason }, { status: 409 })

    const offering = priest.ceremonyOfferings[0]
    const price = offering?.price ?? priest.priceRangeMin

    const booking = await prisma.booking.create({
      data: {
        // Random suffix: no count()+1 race; the unique index is the backstop.
        bookingRef:      `ARC-${new Date().getFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`,
        consumerId:      user.id,
        priestId:        priest.id,
        ceremonyId:      ceremony.id,
        scheduledDate:   day,
        scheduledTime:   data.scheduledTime,
        durationHours:   ceremony.durationMax / 60,
        addressLine1:    data.addressLine1,
        addressLine2:    data.addressLine2,
        city:            data.city,
        pincode:         data.pincode,
        googleMapsUrl:   data.googleMapsUrl || null,
        contactPhone:    data.contactPhone,
        samagriOption:   offering?.samagriIncluded ? "PRIEST_ARRANGED" : data.samagriOption,
        familyDetails:   data.familyDetails,
        specialRequests: data.specialRequests,
        // No platform payment: these are the priest's stated terms, recorded for reference.
        basePrice:    price,
        travelFee:    0,
        samagriPrice: 0,
        totalAmount:  price,
      },
    })

    const when = format(day, "d MMM yyyy")
    await notify(priest.userId, {
      type: "BOOKING_REQUEST", title: "New booking request",
      body: `${data.familyDetails.primaryName} · ${ceremony.name} · ${when}`, href: "/priest/dashboard",
    })
    background(() => sendPriestBookingAlert(priest.user.email, {
      priestName: priest.displayName, bookingRef: booking.bookingRef, ceremonyName: ceremony.name,
      consumerName: data.familyDetails.primaryName, date: when, time: data.scheduledTime,
      address: `${data.addressLine1}, ${CITIES[data.city].label}`,
    }))
    background(() => sendBookingReceived(user.email, {
      consumerName: user.name, bookingRef: booking.bookingRef, ceremonyName: ceremony.name,
      priestName: priest.displayName, date: when, time: data.scheduledTime,
    }))

    return NextResponse.json({ bookingId: booking.id, bookingRef: booking.bookingRef })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: err.issues }, { status: 400 })
    }
    // The partial unique index caught a simultaneous request for the same priest and day.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Priest was just booked for this date. Please pick another." }, { status: 409 })
    }
    console.error("[bookings POST]", err)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
