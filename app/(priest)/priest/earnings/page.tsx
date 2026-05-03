import { redirect } from "next/navigation"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { IndianRupee, TrendingUp, CalendarDays } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { CEREMONIES } from "@/lib/constants"
import { formatINR } from "@/lib/utils/booking"
import type { CeremonyType } from "@/types"

export const metadata = { title: "Earnings — Archanai" }

export default async function EarningsPage() {
  const user = await getSessionUser()
  if (!user) redirect("/login")

  const priest = await prisma.priest.findUnique({ where: { userId: user.id } })
  if (!priest) redirect("/priest/register")

  const completedBookings = await prisma.booking.findMany({
    where:   { priestId: priest.id, status: "COMPLETED" },
    include: { ceremony: true },
    orderBy: { scheduledDate: "desc" },
  })

  // Build last-5-months breakdown
  const months = Array.from({ length: 5 }, (_, i) => subMonths(new Date(), 4 - i))
  const monthly = months.map((m) => {
    const start = startOfMonth(m)
    const end   = endOfMonth(m)
    const inMonth = completedBookings.filter(
      (b) => b.scheduledDate >= start && b.scheduledDate <= end
    )
    const gross = inMonth.reduce((s, b) => s + b.basePrice, 0)
    return { month: m, bookings: inMonth.length, gross }
  })

  const totalBookings   = completedBookings.length
  const totalGross      = completedBookings.reduce((s, b) => s + b.basePrice, 0)
  const avgPerCeremony  = totalBookings ? Math.round(totalGross / totalBookings) : 0
  const thisMonthGross  = monthly.at(-1)!.gross
  const maxGross        = Math.max(...monthly.map((m) => m.gross), 1)

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Earnings</h1>

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
        Archanai is free — no platform commission. Contributions shown below are what families paid directly to you.
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Total ceremonies",    value: String(totalBookings),      icon: CalendarDays },
          { label: "Avg contribution",    value: formatINR(avgPerCeremony),  icon: TrendingUp },
          { label: "This month",          value: formatINR(thisMonthGross),  icon: IndianRupee },
        ].map((s) => (
          <Card key={s.label} className="border-border/60 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
              <p className="text-xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly bar chart */}
      <Card className="border-border/60 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Monthly breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-36">
            {monthly.map((m) => (
              <div key={m.month.toISOString()} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">
                  {m.gross ? formatINR(m.gross) : "—"}
                </span>
                <div className="w-full relative" style={{ height: `${Math.round((m.gross / maxGross) * 80)}px` }}>
                  <div className="absolute inset-0 rounded-md bg-primary transition-all" />
                </div>
                <span className="text-xs text-muted-foreground">{format(m.month, "MMM")}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent transactions */}
      {completedBookings.length > 0 ? (
        <div>
          <h2 className="font-semibold mb-4">Completed ceremonies</h2>
          <Card className="border-border/60 shadow-none divide-y divide-border/60">
            {completedBookings.slice(0, 20).map((b) => {
              const ceremony = CEREMONIES[b.ceremony.type as CeremonyType]
              return (
                <div key={b.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{ceremony?.emoji}</span>
                    <div>
                      <p className="text-sm font-medium">{b.ceremony.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(b.scheduledDate, "d MMM yyyy")} · {b.bookingRef}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{formatINR(b.basePrice)}</p>
                </div>
              )
            })}
          </Card>
        </div>
      ) : (
        <Card className="border-border/60 shadow-none">
          <CardContent className="p-8 text-center text-muted-foreground text-sm">
            No completed ceremonies yet. Earnings will appear here once bookings are marked complete.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
