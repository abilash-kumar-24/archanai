import { prisma } from "@/lib/prisma"
import { addDays, dayOfWeek, parseDateOnly, toDateOnly } from "@/lib/dates"

export const MIN_LEAD_DAYS = 1
export const MAX_HORIZON_DAYS = 365
export const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "PRIEST_ACCEPTED"] as const

export type Window = { dayOfWeek: number; startTime: string; endTime: string }

export type SlotCheck = { ok: true } | { ok: false; reason: string }

/** Pure rule set — no I/O so it can be unit tested. Times are "HH:MM". */
export function evaluateSlot(i: {
  day: string
  time: string
  today: string
  windows: Window[]
  blocked: ReadonlySet<string>
  booked: ReadonlySet<string>
}): SlotCheck {
  if (i.day < addDays(i.today, MIN_LEAD_DAYS)) return { ok: false, reason: "Please choose a date at least a day ahead" }
  if (i.day > addDays(i.today, MAX_HORIZON_DAYS)) return { ok: false, reason: "Date is too far ahead" }
  // No schedule rows means the priest never restricted their week.
  if (i.windows.length) {
    const w = i.windows.find((x) => x.dayOfWeek === dayOfWeek(i.day))
    if (!w) return { ok: false, reason: "Priest does not take bookings on this weekday" }
    if (i.time < w.startTime || i.time >= w.endTime) {
      return { ok: false, reason: `Priest is available ${w.startTime}–${w.endTime} on this day` }
    }
  }
  if (i.blocked.has(i.day)) return { ok: false, reason: "Priest is unavailable on this date" }
  if (i.booked.has(i.day)) return { ok: false, reason: "Priest is already booked on this date" }
  return { ok: true }
}

/** Day-level check used by "available on" search; same rules as evaluateSlot minus the time-of-day. */
export function dayAvailable(i: { day: string; today: string; windows: Window[]; blocked: ReadonlySet<string>; booked: ReadonlySet<string> }): boolean {
  if (i.day < addDays(i.today, MIN_LEAD_DAYS) || i.day > addDays(i.today, MAX_HORIZON_DAYS)) return false
  if (i.windows.length && !i.windows.some((w) => w.dayOfWeek === dayOfWeek(i.day))) return false
  return !i.blocked.has(i.day) && !i.booked.has(i.day)
}

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
      select: { scheduledDate: true },
    }),
  ])
  return {
    windows: windows.map((w) => ({ dayOfWeek: w.dayOfWeek, startTime: w.startTime, endTime: w.endTime })),
    blocked: new Set(blocked.map((b) => toDateOnly(b.date))),
    booked: new Set(booked.map((b) => toDateOnly(b.scheduledDate))),
  }
}
