export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { sendBookingConfirmation, sendCancellationNotice, sendSamagriChecklist } from "@/lib/resend/emails"
import { getSamagriList } from "@/lib/samagri/data"
import { notify } from "@/lib/notify"
import { background } from "@/lib/background"
import { format } from "date-fns"
import { z } from "zod"
import type { Tradition } from "@/types"

const bodySchema = z.object({
  action: z.enum(["accept", "decline"]),
  notes:  z.string().max(1000).optional(),
})

// Priest accepts or declines a booking
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  const { action, notes } = parsed.data

  const existing = await prisma.booking.findUnique({ where: { id }, include: { priest: true } })
  if (!existing || existing.priest.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (existing.status !== "PENDING") {
    return NextResponse.json({ error: `Booking already ${existing.status}` }, { status: 409 })
  }

  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status:      action === "accept" ? "PRIEST_ACCEPTED" : "CANCELLED_PRIEST",
        priestNotes: notes,
        ...(action === "accept" ? { confirmedAt: new Date() } : { cancellationReason: notes }),
      },
      include: { consumer: true, priest: { include: { user: true } }, ceremony: true },
    })

    const date = format(booking.scheduledDate, "d MMMM yyyy")
    const address = `${booking.addressLine1}, ${booking.city}`

    if (action === "accept") {
      await notify(booking.consumerId, {
        type: "BOOKING_ACCEPTED", title: "Booking confirmed",
        body: `${booking.priest.displayName} accepted your ${booking.ceremony.name} on ${date}`, href: `/bookings/${id}`,
      })
      background(() => sendBookingConfirmation(booking.consumer.email, {
        consumerName: booking.consumer.name, bookingRef: booking.bookingRef, ceremonyName: booking.ceremony.name,
        priestName: booking.priest.displayName, priestPhone: booking.priest.user.phone,
        date, time: booking.scheduledTime, address,
      }))
      if (booking.samagriOption === "SELF_ARRANGED") {
        background(() => sendSamagriChecklist(booking.consumer.email, {
          name: booking.consumer.name, ceremonyName: booking.ceremony.name,
          items: getSamagriList(booking.ceremony.type, booking.priest.tradition as Tradition),
        }))
      }
    } else {
      await notify(booking.consumerId, {
        type: "BOOKING_DECLINED", title: "Booking declined",
        body: `${booking.priest.displayName} could not take your ${booking.ceremony.name} on ${date}`, href: `/bookings/${id}`,
      })
      background(() => sendCancellationNotice(booking.consumer.email, {
        name: booking.consumer.name, bookingRef: booking.bookingRef, ceremonyName: booking.ceremony.name,
        reason: notes || "The priest is unavailable on this date.",
      }))
    }

    return NextResponse.json({ success: true, status: booking.status })
  } catch (err) {
    console.error("[bookings/:id/confirm POST]", err)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}
