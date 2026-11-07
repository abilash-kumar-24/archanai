export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { addDays, parseDateOnly, todayIST } from "@/lib/dates"
import { ACTIVE_STATUSES, MAX_HORIZON_DAYS } from "@/lib/booking/availability"

const bodySchema = z.object({ date: z.string() }) // YYYY-MM-DD

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const priest = await prisma.priest.findUnique({ where: { userId: user.id } })
  if (!priest) return NextResponse.json({ error: "Not a priest" }, { status: 403 })

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  const day = parsed.success ? parseDateOnly(parsed.data.date) : null
  if (!parsed.success || !day) return NextResponse.json({ error: "Invalid date" }, { status: 400 })
  if (parsed.data.date < todayIST() || parsed.data.date > addDays(todayIST(), MAX_HORIZON_DAYS)) {
    return NextResponse.json({ error: "Choose a date within the next year" }, { status: 400 })
  }

  const booked = await prisma.booking.findFirst({
    where: { priestId: priest.id, scheduledDate: day, status: { in: [...ACTIVE_STATUSES] } },
  })
  if (booked) {
    return NextResponse.json({ error: "You have a booking on this date. Decline or complete it first." }, { status: 409 })
  }

  // Idempotent: blocking an already-blocked day returns the existing row.
  const blocked = await prisma.blockedDate.upsert({
    where: { priestId_date: { priestId: priest.id, date: day } },
    update: {},
    create: { priestId: priest.id, date: day },
  })
  return NextResponse.json({ id: blocked.id }, { status: 201 })
}
