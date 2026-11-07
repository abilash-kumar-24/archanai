// Booking/blocked dates are calendar days, not instants. They travel as "YYYY-MM-DD" strings
// and are stored as UTC midnight, so no timezone can shift them to a neighbouring day.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const DAY_MS = 86_400_000

export function parseDateOnly(s: string): Date | null {
  if (!DATE_RE.test(s)) return null
  const d = new Date(`${s}T00:00:00.000Z`)
  return isNaN(d.getTime()) || toDateOnly(d) !== s ? null : d
}

export function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function addDays(s: string, n: number): string {
  return toDateOnly(new Date(new Date(`${s}T00:00:00.000Z`).getTime() + n * DAY_MS))
}

export function dayOfWeek(s: string): number {
  return new Date(`${s}T00:00:00.000Z`).getUTCDay()
}

/** Today's calendar date in India, the only timezone the pilot operates in. */
export function todayIST(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now)
}
