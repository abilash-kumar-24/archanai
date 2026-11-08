export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { toDateOnly } from "@/lib/dates"
import { CITIES } from "@/lib/constants"

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n")
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")

/** Priest's upcoming accepted bookings as an .ics file for Google/Apple/Outlook calendar import. */
export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const priest = await prisma.priest.findUnique({ where: { userId: user.id }, select: { id: true } })
  if (!priest) return NextResponse.json({ error: "Priest profile not found" }, { status: 404 })

  const bookings = await prisma.booking.findMany({
    where: { priestId: priest.id, status: { in: ["CONFIRMED", "PRIEST_ACCEPTED"] }, scheduledDate: { gte: new Date(Date.now() - 86_400_000) } },
    include: { ceremony: { select: { name: true } }, consumer: { select: { name: true } } },
    orderBy: { scheduledDate: "asc" },
  })

  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Archanai//Priest calendar//EN", "CALSCALE:GREGORIAN"]
  for (const b of bookings) {
    const day = toDateOnly(b.scheduledDate).replace(/-/g, "")
    const t = b.scheduledTime.replace(":", "")
    const endHour = String(Math.min(23, Number(b.scheduledTime.slice(0, 2)) + 2)).padStart(2, "0")
    lines.push(
      "BEGIN:VEVENT",
      `UID:${b.id}@archanai`,
      `DTSTAMP:${stamp(new Date())}`,
      // Floating local time: the app works in IST, calendars show it at the same wall-clock time.
      `DTSTART:${day}T${t}00`,
      `DTEND:${day}T${endHour}${b.scheduledTime.slice(3)}00`,
      `SUMMARY:${esc(`${b.ceremony.name} — ${b.consumer.name ?? "Family"}`)}`,
      `LOCATION:${esc(`${b.addressLine1}, ${CITIES[b.city].label} ${b.pincode}`)}`,
      `DESCRIPTION:${esc(`Booking ${b.bookingRef}`)}`,
      "END:VEVENT",
    )
  }
  lines.push("END:VCALENDAR")

  return new NextResponse(lines.join("\r\n") + "\r\n", {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": 'attachment; filename="archanai-bookings.ics"' },
  })
}
