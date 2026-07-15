export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { sendPriestBookingAlert } from "@/lib/resend/emails"
import type { City, CeremonyType, SamagriOption } from "@/types"

// ─── GET — list bookings for the logged-in consumer ──────────────────────────

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const bookings = await prisma.booking.findMany({
    where:   { consumerId: user.id },
    include: { ceremony: true, priest: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ bookings })
}

// ─── POST — create a new booking request ─────────────────────────────────────

const createBookingSchema = z.object({
  priestId:      z.string(),
  ceremonyType:  z.string(),
  scheduledDate: z.string(),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/),
  addressLine1:  z.string().min(5),
  addressLine2:  z.string().optional(),
  city:          z.string(),
  pincode:       z.string().length(6),
  samagriOption: z.enum(["PRIEST_ARRANGED", "SELF_ARRANGED", "PLATFORM_KIT"]),
  familyDetails: z.object({
    primaryName: z.string().min(2),
    spouseName:  z.string().optional(),
    fatherName:  z.string().optional(),
    motherName:  z.string().optional(),
    gotram:      z.string().optional(),
    nakshatra:   z.string().optional(),
    rashi:       z.string().optional(),
    notes:       z.string().optional(),
  }),
  specialRequests: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  try {
    const body = await req.json()
    const data = createBookingSchema.parse(body)

    const [priest, ceremony] = await Promise.all([
      prisma.priest.findUnique({ where: { id: data.priestId }, include: { user: true } }),
      prisma.ceremony.findUnique({ where: { type: data.ceremonyType as CeremonyType } }),
    ])

    if (!priest || !ceremony) {
      return NextResponse.json({ error: "Priest or ceremony not found" }, { status: 404 })
    }

    // Sequential booking ref using total count
    const count = await prisma.booking.count()
    const bookingRef = `ARC-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`

    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        consumerId:      user.id,
        priestId:        priest.id,
        ceremonyId:      ceremony.id,
        scheduledDate:   new Date(data.scheduledDate),
        scheduledTime:   data.scheduledTime,
        durationHours:   ceremony.durationMax / 60,
        addressLine1:    data.addressLine1,
        addressLine2:    data.addressLine2,
        city:            data.city as City,
        pincode:         data.pincode,
        samagriOption:   data.samagriOption as SamagriOption,
        familyDetails:   data.familyDetails,
        specialRequests: data.specialRequests,
        basePrice:    priest.priceRangeMin,
        travelFee:    0,
        samagriPrice: data.samagriOption === "PRIEST_ARRANGED" ? 500 : 0,
        platformFee:  0,
        totalAmount:  priest.priceRangeMin,
        // 30% deposit, minimum ₹500, rounded to nearest ₹100
        depositAmount: Math.max(500, Math.round((priest.priceRangeMin * 0.3) / 100) * 100),
      },
    })

    // Notify priest via email (non-blocking)
    if (priest.user.email) {
      sendPriestBookingAlert(priest.user.email, {
        priestName:   priest.displayName,
        bookingRef:   booking.bookingRef,
        ceremonyName: ceremony.name,
        consumerName: data.familyDetails.primaryName,
        date:         data.scheduledDate,
        time:         data.scheduledTime,
        address:      `${data.addressLine1}, ${data.city}`,
      }).catch(console.error)
    }

    return NextResponse.json({ bookingId: booking.id, bookingRef: booking.bookingRef })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: err.issues }, { status: 400 })
    }
    console.error("[bookings POST]", err)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
