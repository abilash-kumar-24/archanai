import { addDays, dayOfWeek } from "@/lib/dates"

export const MIN_LEAD_DAYS = 1
export const MAX_HORIZON_DAYS = 365
export const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "PRIEST_ACCEPTED"] as const

export type Window = { dayOfWeek: number; startTime: string; endTime: string }

export type SlotCheck = { ok: true } | { ok: false; reason: string }

/**
 * A priest can take one booking per day-part. "Booked" keys look like "2026-03-14|MORNING".
 * ponytail: fixed day-parts, not exact durations (ceremony length varies); add per-booking duration if priests ask.
 */
export const DAY_PARTS = {
  MORNING:   { label: "Morning",   start: "00:00", end: "12:00" },
  AFTERNOON: { label: "Afternoon", start: "12:00", end: "17:00" },
  EVENING:   { label: "Evening",   start: "17:00", end: "24:00" },
} as const
export type DayPart = keyof typeof DAY_PARTS

export const dayPartOf = (time: string): DayPart => (time < "12:00" ? "MORNING" : time < "17:00" ? "AFTERNOON" : "EVENING")
export const bookedKey = (day: string, time: string) => `${day}|${dayPartOf(time)}`

/** Day-parts a priest works on that day and that are not yet booked. */
export function freeParts(i: { day: string; windows: Window[]; booked: ReadonlySet<string> }): DayPart[] {
  const w = i.windows.find((x) => x.dayOfWeek === dayOfWeek(i.day))
  if (i.windows.length && !w) return []
  return (Object.keys(DAY_PARTS) as DayPart[]).filter((p) => {
    const { start, end } = DAY_PARTS[p]
    return !i.booked.has(`${i.day}|${p}`) && (!w || (w.startTime < end && w.endTime > start))
  })
}

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
  if (i.booked.has(bookedKey(i.day, i.time))) return { ok: false, reason: `Priest is already booked that ${DAY_PARTS[dayPartOf(i.time)].label.toLowerCase()}` }
  return { ok: true }
}

/** Day-level check used by "available on" search: some day-part is still free. */
export function dayAvailable(i: { day: string; today: string; windows: Window[]; blocked: ReadonlySet<string>; booked: ReadonlySet<string> }): boolean {
  if (i.day < addDays(i.today, MIN_LEAD_DAYS) || i.day > addDays(i.today, MAX_HORIZON_DAYS)) return false
  return !i.blocked.has(i.day) && freeParts(i).length > 0
}

