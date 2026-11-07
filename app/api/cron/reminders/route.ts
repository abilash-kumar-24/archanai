export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { format } from "date-fns"
import { prisma } from "@/lib/prisma"
import { sendCeremonyReminder } from "@/lib/resend/emails"

// Daily cron (see vercel.json): remind families about tomorrow's accepted ceremonies.
// Vercel sends `Authorization: Bearer $CRON_SECRET`.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  start.setUTCDate(start.getUTCDate() + 1)
  const end = new Date(start.getTime() + 86_400_000)

  const bookings = await prisma.booking.findMany({
    where:   { status: "PRIEST_ACCEPTED", scheduledDate: { gte: start, lt: end } },
    include: { consumer: true, ceremony: true },
  })

  const results = await Promise.allSettled(
    bookings.map((b) =>
      sendCeremonyReminder(b.consumer.email, {
        name:         b.consumer.name,
        ceremonyName: b.ceremony.name,
        date:         format(b.scheduledDate, "d MMMM yyyy"),
        time:         b.scheduledTime,
        address:      `${b.addressLine1}, ${b.city}`,
      })
    )
  )
  return NextResponse.json({ sent: results.filter((r) => r.status === "fulfilled").length, total: bookings.length })
}
