export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { freeParts, loadSlotContext, MAX_HORIZON_DAYS } from "@/lib/booking/availability"
import { addDays, parseDateOnly, todayIST } from "@/lib/dates"

// Public: which days a priest cannot take (blocked or already booked) plus their weekly windows.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const today = todayIST()
  const from = req.nextUrl.searchParams.get("from") ?? today
  const to = req.nextUrl.searchParams.get("to") ?? addDays(today, MAX_HORIZON_DAYS)
  if (!parseDateOnly(from) || !parseDateOnly(to) || to < from || to > addDays(from, 400)) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 })
  }
  const ctx = await loadSlotContext(id, from, to)
  // A day is closed when blocked or every day-part the priest works is taken; partly booked days stay open.
  const bookedDays = new Set([...ctx.booked].map((k) => k.split("|")[0]))
  const full = [...bookedDays].filter((d) => freeParts({ day: d, windows: ctx.windows, booked: ctx.booked }).length === 0)
  return NextResponse.json({ windows: ctx.windows, unavailable: [...new Set([...ctx.blocked, ...full])], booked: [...ctx.booked] })
}
