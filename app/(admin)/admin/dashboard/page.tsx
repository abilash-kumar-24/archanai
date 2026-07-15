import { format, startOfMonth } from "date-fns"
import { Users, CalendarCheck, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { prisma } from "@/lib/prisma"
import { CEREMONIES, CITIES, TRADITIONS } from "@/lib/constants"
import { formatINR } from "@/lib/utils/booking"
import { PriestActionButtons } from "@/components/admin/priest-action-buttons"
import type { CeremonyType, City } from "@/types"

export const metadata = { title: "Admin — Archanai" }
export const dynamic = "force-dynamic"

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  PENDING:         { label: "Pending",         variant: "secondary" },
  CONFIRMED:       { label: "Confirmed",        variant: "default" },
  PRIEST_ACCEPTED: { label: "Priest Accepted",  variant: "default" },
  COMPLETED:       { label: "Completed",        variant: "outline" },
  CANCELLED_CONSUMER: { label: "Cancelled",     variant: "destructive" },
  CANCELLED_PRIEST:   { label: "Cancelled",     variant: "destructive" },
}

export default async function AdminDashboard() {
  const now = new Date()
  const monthStart = startOfMonth(now)

  const [
    totalBookings,
    thisMonthBookings,
    activePriests,
    pendingPriests,
    avgRating,
    recentBookings,
    pendingPriestList,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.priest.count({ where: { isActive: true, verificationStatus: "VERIFIED" } }),
    prisma.priest.count({ where: { verificationStatus: "PENDING" } }),
    prisma.priest.aggregate({ _avg: { rating: true } }),
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { ceremony: true },
    }),
    prisma.priest.findMany({
      where: { verificationStatus: "PENDING" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  const stats = [
    { label: "Total Bookings",   value: String(totalBookings),               delta: `+${thisMonthBookings} this month`, icon: CalendarCheck },
    { label: "Active Priests",   value: String(activePriests),               delta: `${pendingPriests} pending review`,  icon: Users },
    { label: "Avg Rating",       value: avgRating._avg.rating?.toFixed(1) ?? "—", delta: "Across all priests",          icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">Archanai</span>
          <span className="text-muted-foreground text-sm">· Admin</span>
        </div>
        <span className="text-xs text-muted-foreground">{format(now, "EEEE, d MMM yyyy")}</span>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <h1 className="text-2xl font-semibold tracking-tight">Platform Overview</h1>

        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="border-border/60 shadow-none">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <s.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.delta}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="verification">
          <TabsList>
            <TabsTrigger value="verification">
              Priest Verification
              {pendingPriests > 0 && (
                <Badge variant="destructive" className="ml-2 h-4 px-1 text-xs">{pendingPriests}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="verification" className="mt-6 space-y-4">
            {pendingPriestList.length === 0 ? (
              <p className="text-sm text-muted-foreground">No priests pending verification.</p>
            ) : (
              pendingPriestList.map((p: (typeof pendingPriestList)[number]) => (
                <Card key={p.id} className="border-border/60 shadow-none">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 rounded-xl">
                        <AvatarFallback className="rounded-xl bg-accent text-primary font-semibold">
                          {p.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm">{p.displayName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {TRADITIONS[p.tradition]?.label} · {p.serviceCities.map((c) => CITIES[c as City]?.label).join(", ")} · {p.experienceYears}y exp
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Applied {format(p.createdAt, "d MMM yyyy")}
                            </p>
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            <Clock className="h-3 w-3 mr-1" /> Pending
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.ceremonies.map((c) => (
                            <span key={c} className="text-xs bg-muted rounded px-2 py-0.5">
                              {CEREMONIES[c as CeremonyType]?.emoji} {CEREMONIES[c as CeremonyType]?.label}
                            </span>
                          ))}
                        </div>
                        <PriestActionButtons priestId={p.id} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <Card className="border-border/60 shadow-none divide-y divide-border/60">
              {recentBookings.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No bookings yet.</p>
              ) : recentBookings.map((b) => {
                const s = STATUS_BADGE[b.status] ?? { label: b.status, variant: "secondary" as const }
                return (
                  <div key={b.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{CEREMONIES[b.ceremony.type as CeremonyType]?.emoji}</span>
                      <div>
                        <p className="text-sm font-medium">{b.ceremony.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {b.bookingRef} · {CITIES[b.city as City]?.label} · {format(b.scheduledDate, "d MMM")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={s.variant} className="text-xs">{s.label}</Badge>
                      <span className="font-semibold text-sm">{formatINR(b.basePrice)}</span>
                    </div>
                  </div>
                )
              })}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
