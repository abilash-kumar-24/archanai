import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { CalendarView } from "./calendar-view"

export const metadata = { title: "Calendar — Archanai" }

export default async function CalendarPage() {
  const user = await getSessionUser()
  if (!user) redirect("/login")

  const priest = await prisma.priest.findUnique({ where: { userId: user.id } })
  if (!priest) redirect("/priest/register")

  const [bookings, blockedDates] = await Promise.all([
    prisma.booking.findMany({
      where: {
        priestId: priest.id,
        status: { in: ["CONFIRMED", "PRIEST_ACCEPTED", "PENDING"] },
      },
      include: { ceremony: true, consumer: true },
      orderBy: { scheduledDate: "asc" },
    }),
    prisma.blockedDate.findMany({
      where: { priestId: priest.id },
    }),
  ])

  return (
    <CalendarView
      priestId={priest.id}
      bookings={bookings.map((b) => ({
        id:           b.id,
        date:         b.scheduledDate.toISOString(),
        ceremonyType: b.ceremony.type,
        ceremonyName: b.ceremony.name,
        consumer:     b.consumer.name,
        time:         b.scheduledTime,
      }))}
      initialBlocked={blockedDates.map((d) => ({
        id:   d.id,
        date: d.date.toISOString(),
      }))}
    />
  )
}
