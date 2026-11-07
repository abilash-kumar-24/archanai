export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { loadSlotContext, MAX_HORIZON_DAYS } from "@/lib/booking/availability"
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
  return NextResponse.json({ windows: ctx.windows, unavailable: [...new Set([...ctx.blocked, ...ctx.booked])] })
}
