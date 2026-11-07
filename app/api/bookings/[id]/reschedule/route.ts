export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { format } from "date-fns"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { parseDateOnly, todayIST } from "@/lib/dates"
import { evaluateSlot, loadSlotContext } from "@/lib/booking/availability"
import { sendRescheduleNotice } from "@/lib/resend/emails"
import { notify } from "@/lib/notify"
import { background } from "@/lib/background"

const MAX_RESCHEDULES = 2
const bodySchema = z.object({
  scheduledDate: z.string(),
  scheduledTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
})

// Family asks to move a booking. It goes back to PENDING so the priest must agree again.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  const day = parsed.success ? parseDateOnly(parsed.data.scheduledDate) : null
  if (!parsed.success || !day) return NextResponse.json({ error: "Invalid date or time" }, { status: 400 })

  const b = await prisma.booking.findUnique({
    where: { id },
    include: { priest: { include: { user: true } }, ceremony: true },
  })
  if (!b || b.consumerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (!["PENDING", "PRIEST_ACCEPTED"].includes(b.status)) {
    return NextResponse.json({ error: `Booking is ${b.status}` }, { status: 409 })
  }
  if (b.rescheduleCount >= MAX_RESCHEDULES) {
    return NextResponse.json({ error: "This booking has already been rescheduled twice. Please cancel and book again." }, { status: 409 })
  }

  const ctx = await loadSlotContext(b.priestId, parsed.data.scheduledDate, parsed.data.scheduledDate, b.id)
  const slot = evaluateSlot({ day: parsed.data.scheduledDate, time: parsed.data.scheduledTime, today: todayIST(), ...ctx })
  if (!slot.ok) return NextResponse.json({ error: slot.reason }, { status: 409 })

  try {
    await prisma.booking.update({
      where: { id },
      data: {
        scheduledDate: day, scheduledTime: parsed.data.scheduledTime,
        status: "PENDING", confirmedAt: null, rescheduleCount: { increment: 1 },
      },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Priest was just booked for this date. Please pick another." }, { status: 409 })
    }
    throw err
  }

  const when = format(day, "d MMM yyyy")
  await notify(b.priest.userId, {
    type: "BOOKING_RESCHEDULED", title: "Reschedule request",
    body: `${b.ceremony.name} (${b.bookingRef}) → ${when} ${parsed.data.scheduledTime}`, href: "/priest/dashboard",
  })
  background(() => sendRescheduleNotice(b.priest.user.email, {
    name: b.priest.displayName, bookingRef: b.bookingRef, ceremonyName: b.ceremony.name,
    date: when, time: parsed.data.scheduledTime,
  }))

  return NextResponse.json({ success: true })
}
