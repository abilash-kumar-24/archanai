export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendCancellationNotice, RESPONSE_WINDOW_HOURS } from "@/lib/resend/emails"
import { notify } from "@/lib/notify"
import { parseDateOnly, todayIST } from "@/lib/dates"

// Daily cron: release requests the priest never answered (or whose date has passed), so the day
// is freed and the family is told rather than left waiting.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const cutoff = new Date(Date.now() - RESPONSE_WINDOW_HOURS * 3_600_000)
  const stale = await prisma.booking.findMany({
    where: {
      status: "PENDING",
      OR: [{ updatedAt: { lt: cutoff } }, { scheduledDate: { lt: parseDateOnly(todayIST())! } }],
    },
    include: { consumer: true, ceremony: true, priest: true },
  })

  for (const b of stale) {
    const reason = `No response from the priest within ${RESPONSE_WINDOW_HOURS} hours.`
    const { count } = await prisma.booking.updateMany({
      where: { id: b.id, status: "PENDING" }, // skip if the priest answered meanwhile
      data: { status: "CANCELLED_PRIEST", cancellationReason: reason },
    })
    if (!count) continue
    await notify(b.consumerId, { type: "BOOKING_EXPIRED", title: "Request expired", body: `${b.ceremony.name} (${b.bookingRef}) — ${reason}`, href: `/bookings/${b.id}` })
    await sendCancellationNotice(b.consumer.email, { name: b.consumer.name, bookingRef: b.bookingRef, ceremonyName: b.ceremony.name, reason })
  }
  return NextResponse.json({ expired: stale.length })
}
