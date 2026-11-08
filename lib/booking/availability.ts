import { prisma } from "@/lib/prisma"
import { addDays, parseDateOnly, toDateOnly } from "@/lib/dates"
import { ACTIVE_STATUSES, bookedKey } from "@/lib/booking/slots"

export * from "@/lib/booking/slots"

export async function loadSlotContext(priestId: string, from: string, to: string, excludeBookingId?: string) {
  const fromD = parseDateOnly(from)!
  const toD = parseDateOnly(addDays(to, 1))!
  const [windows, blocked, booked] = await Promise.all([
    prisma.priestAvailability.findMany({ where: { priestId } }),
    prisma.blockedDate.findMany({ where: { priestId, date: { gte: fromD, lt: toD } }, select: { date: true } }),
    prisma.booking.findMany({
      where: {
        priestId,
        scheduledDate: { gte: fromD, lt: toD },
        status: { in: [...ACTIVE_STATUSES] },
        ...(excludeBookingId && { id: { not: excludeBookingId } }),
      },
      select: { scheduledDate: true, scheduledTime: true },
    }),
  ])
  return {
    windows: windows.map((w) => ({ dayOfWeek: w.dayOfWeek, startTime: w.startTime, endTime: w.endTime })),
    blocked: new Set(blocked.map((b) => toDateOnly(b.date))),
    booked: new Set(booked.map((b) => bookedKey(toDateOnly(b.scheduledDate), b.scheduledTime))),
  }
}
