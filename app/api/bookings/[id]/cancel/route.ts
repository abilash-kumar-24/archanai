export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { sendCancellationNotice } from "@/lib/resend/emails"
import { notify } from "@/lib/notify"
import { background } from "@/lib/background"

// Consumer cancels their own upcoming booking
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { reason } = (await req.json().catch(() => ({}))) as { reason?: string }

  const existing = await prisma.booking.findUnique({
    where:   { id },
    include: { priest: { include: { user: true } }, ceremony: true },
  })
  if (!existing || existing.consumerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!["PENDING", "CONFIRMED", "PRIEST_ACCEPTED"].includes(existing.status)) {
    return NextResponse.json({ error: `Booking already ${existing.status}` }, { status: 409 })
  }

  await prisma.booking.update({
    where: { id },
    data:  { status: "CANCELLED_CONSUMER", cancellationReason: reason?.slice(0, 1000) },
  })

  await notify(existing.priest.userId, {
    type: "BOOKING_CANCELLED", title: "Booking cancelled by family",
    body: `${existing.ceremony.name} (${existing.bookingRef})`, href: "/priest/dashboard",
  })
  background(() => sendCancellationNotice(existing.priest.user.email, {
    name:         existing.priest.displayName,
    bookingRef:   existing.bookingRef,
    ceremonyName: existing.ceremony.name,
    reason:       reason || "Cancelled by the family.",
  }))

  return NextResponse.json({ success: true })
}
