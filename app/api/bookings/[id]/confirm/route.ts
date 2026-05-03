export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { sendCeremonyReminder, sendCancellationNotice } from "@/lib/resend/emails"
import { format } from "date-fns"

// Priest accepts or declines a booking
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { action, notes } = body as { action: "accept" | "decline"; notes?: string }

  if (!["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  // Verify the booking belongs to this priest
  const existing = await prisma.booking.findUnique({ where: { id }, include: { priest: true } })
  if (!existing || existing.priest.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status:      action === "accept" ? "PRIEST_ACCEPTED" : "CANCELLED_PRIEST",
        priestNotes: notes,
        ...(action === "decline" && { cancellationReason: notes }),
      },
      include: {
        consumer: true,
        priest:   true,
        ceremony: true,
      },
    })

    if (action === "accept") {
      sendCeremonyReminder(booking.consumer.email, {
        name:         booking.consumer.name,
        ceremonyName: booking.ceremony.name,
        date:         format(booking.scheduledDate, "d MMMM yyyy"),
        time:         booking.scheduledTime,
        address:      `${booking.addressLine1}, ${booking.city}`,
      }).catch(console.error)
    } else {
      sendCancellationNotice(booking.consumer.email, {
        name:         booking.consumer.name,
        bookingRef:   booking.bookingRef,
        ceremonyName: booking.ceremony.name,
        reason:       "The priest is unavailable on this date.",
      }).catch(console.error)
    }

    return NextResponse.json({ success: true, status: booking.status })
  } catch (err) {
    console.error("[bookings/:id/confirm POST]", err)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}
