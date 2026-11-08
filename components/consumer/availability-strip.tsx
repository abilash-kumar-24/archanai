import { addDays, dayOfWeek, todayIST } from "@/lib/dates"
import { DAY_PARTS, freeParts, loadSlotContext } from "@/lib/booking/availability"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAYS_SHOWN = 21

/** Next three weeks at a glance: green dot = open, with the free day-parts as a tooltip. */
export async function AvailabilityStrip({ priestId }: { priestId: string }) {
  const first = addDays(todayIST(), 1)
  const last = addDays(first, DAYS_SHOWN - 1)
  const ctx = await loadSlotContext(priestId, first, last)

  const days = Array.from({ length: DAYS_SHOWN }, (_, i) => {
    const day = addDays(first, i)
    const parts = ctx.blocked.has(day) ? [] : freeParts({ day, windows: ctx.windows, booked: ctx.booked })
    return { day, parts }
  })

  return (
    <div>
      <h2 className="font-heading font-semibold mb-1">Availability</h2>
      <p className="text-xs text-muted-foreground mb-3">Next 3 weeks. Green days have at least one free part of the day.</p>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map(({ day, parts }) => (
          <div
            key={day}
            title={parts.length ? `Free: ${parts.map((p) => DAY_PARTS[p].label).join(", ")}` : "Not available"}
            className={`rounded-md border px-1 py-1.5 text-center text-[11px] ${parts.length ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-border/60 text-muted-foreground/60"}`}
          >
            <div>{DAYS[dayOfWeek(day)]}</div>
            <div className="font-mono tabular font-medium">{Number(day.slice(8))}</div>
            <div className="mt-0.5 flex justify-center gap-0.5" aria-hidden>
              {(Object.keys(DAY_PARTS) as (keyof typeof DAY_PARTS)[]).map((p) => (
                <span key={p} className={`h-1 w-1 rounded-full ${parts.includes(p) ? "bg-emerald-500" : "bg-border"}`} />
              ))}
            </div>
            <span className="sr-only">{parts.length ? `free: ${parts.map((p) => DAY_PARTS[p].label).join(", ")}` : "not available"}</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">Dots: morning · afternoon · evening</p>
    </div>
  )
}
