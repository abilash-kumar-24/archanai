import { redirect } from "next/navigation"
import { format } from "date-fns"
import { CalendarClock, IndianRupee, Star, TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CEREMONIES, CITIES } from "@/lib/constants"
import { formatINR } from "@/lib/utils/booking"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { prisma } from "@/lib/prisma"
import { BookingActionButtons } from "@/components/priest/booking-action-buttons"
import type { CeremonyType, City } from "@/types"

export const metadata = { title: "Priest Dashboard" }

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  PRIEST_ACCEPTED: CheckCircle2,
  CONFIRMED:       CheckCircle2,
  PENDING:         Clock,
}
const STATUS_COLOR: Record<string, string> = {
  PRIEST_ACCEPTED: "text-emerald-600",
  CONFIRMED:       "text-primary",
  PENDING:         "text-amber-500",
}

export default async function PriestDashboard() {
  const user = await getSessionUser()
  if (!user) redirect("/login?redirect=/priest/dashboard")

  const priest = await prisma.priest.findUnique({
    where:  { userId: user.id },
    select: {
      id:          true,
      displayName: true,
      rating:      true,
      reviewCount: true,
    },
  })

  if (!priest) redirect("/priest/register")

  const [upcomingBookings, stats] = await Promise.all([
    prisma.booking.findMany({
      where: {
        priestId: priest.id,
        status: { in: ["PENDING", "CONFIRMED", "PRIEST_ACCEPTED"] },
      },
      include: {
        consumer: { select: { name: true, phone: true } },
        ceremony: true,
      },
      orderBy: { scheduledDate: "asc" },
      take: 10,
    }),
    prisma.booking.aggregate({
      where:  { priestId: priest.id, status: "COMPLETED" },
      _count: { id: true },
      _sum:   { totalAmount: true },
    }),
  ])

  const pendingCount   = upcomingBookings.filter((b) => b.status === "PENDING").length
  const completedCount = stats._count.id
  const totalEarned    = stats._sum.totalAmount ?? 0

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Namaste, {priest.displayName.split(" ")[0]} 🙏
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {format(new Date(), "EEEE, d MMMM yyyy")}
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {pendingCount} booking{pendingCount > 1 ? "s" : ""} awaiting your confirmation
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Earnings",    value: formatINR(totalEarned),          icon: IndianRupee,  note: "All time" },
          { label: "Upcoming Bookings", value: String(upcomingBookings.length), icon: CalendarClock, note: "Confirmed + pending" },
          { label: "Average Rating",    value: priest.rating.toFixed(1),        icon: Star,          note: `${priest.reviewCount} reviews` },
          { label: "Total Ceremonies",  value: String(completedCount),          icon: TrendingUp,    note: "Completed" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/60 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Upcoming Bookings</h2>
          <Button variant="ghost" size="sm" className="text-xs" asChild>
            <a href="/priest/calendar">View calendar</a>
          </Button>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-border/60 text-muted-foreground text-sm">
            No upcoming bookings — share your profile link to get bookings.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => {
              const ceremony    = CEREMONIES[booking.ceremony.type as CeremonyType]
              const StatusIcon  = STATUS_ICON[booking.status] ?? Clock
              const statusColor = STATUS_COLOR[booking.status] ?? "text-muted-foreground"
              const familyDetails = booking.familyDetails as { gotram?: string; nakshatra?: string } | null

              return (
                <Card key={booking.id} className="border-border/60 shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl shrink-0 mt-0.5">{ceremony.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{ceremony.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{booking.consumer.name}</p>
                          </div>
                          <div className={`flex items-center gap-1 text-xs font-medium ${statusColor}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {booking.status === "PENDING"         ? "Awaiting your confirmation"
                              : booking.status === "CONFIRMED"    ? "Confirmed"
                              : "Accepted"}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarClock className="h-3 w-3" />
                            {format(booking.scheduledDate, "EEE d MMM")} · {booking.scheduledTime}
                          </span>
                          <span>📍 {booking.addressLine1}, {CITIES[booking.city as City]?.label}</span>
                        </div>

                        {familyDetails && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            {familyDetails.gotram && (
                              <span className="bg-muted rounded px-2 py-0.5">Gotram: {familyDetails.gotram}</span>
                            )}
                            {familyDetails.nakshatra && (
                              <span className="bg-muted rounded px-2 py-0.5">Nakshatra: {familyDetails.nakshatra}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {booking.status === "PENDING" && (
                      <BookingActionButtons bookingId={booking.id} bookingRef={booking.bookingRef} />
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { label: "Block a date",     href: "/priest/calendar", desc: "Mark yourself unavailable" },
            { label: "Update pricing",   href: "/priest/profile",  desc: "Edit your contribution range" },
            { label: "View earnings",    href: "/priest/earnings", desc: "See your payout history" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="rounded-xl border border-border/60 bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <p className="font-medium text-sm">{action.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

