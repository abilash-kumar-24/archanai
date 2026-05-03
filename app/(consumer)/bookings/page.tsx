import Link from "next/link"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { CalendarClock, ChevronRight, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CEREMONIES, CITIES } from "@/lib/constants"
import { formatINR } from "@/lib/utils/booking"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { prisma } from "@/lib/prisma"
import type { BookingStatus, CeremonyType, City } from "@/types"

export const metadata = { title: "My Bookings" }

const STATUS_CONFIG: Record<BookingStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  PENDING:            { label: "Pending",             variant: "secondary" },
  CONFIRMED:          { label: "Confirmed",            variant: "default" },
  PRIEST_ACCEPTED:    { label: "Priest Confirmed",     variant: "default" },
  COMPLETED:          { label: "Completed",            variant: "outline" },
  CANCELLED_CONSUMER: { label: "Cancelled",            variant: "destructive" },
  CANCELLED_PRIEST:   { label: "Cancelled by Priest",  variant: "destructive" },
  NO_SHOW:            { label: "No Show",              variant: "destructive" },
}

const UPCOMING_STATUSES = ["PENDING", "CONFIRMED", "PRIEST_ACCEPTED"]
const PAST_STATUSES     = ["COMPLETED", "CANCELLED_CONSUMER", "CANCELLED_PRIEST", "NO_SHOW"]

export default async function BookingsPage() {
  const user = await getSessionUser()
  if (!user) redirect("/login?redirect=/bookings")

  const bookings = await prisma.booking.findMany({
    where:   { consumerId: user.id },
    include: { ceremony: true, priest: true },
    orderBy: { scheduledDate: "asc" },
  })

  const upcoming = bookings.filter((b) => UPCOMING_STATUSES.includes(b.status))
  const past     = bookings.filter((b) => PAST_STATUSES.includes(b.status))

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">My Bookings</h1>
          <Button size="sm" asChild>
            <Link href="/browse">Book a Priest</Link>
          </Button>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">
              Upcoming
              {upcoming.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1">{upcoming.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past">
              Past
              {past.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs h-4 px-1">{past.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcoming.length === 0 ? (
              <EmptyState tab="upcoming" />
            ) : (
              upcoming.map((b) => (
                <BookingCard
                  key={b.id}
                  id={b.id}
                  bookingRef={b.bookingRef}
                  priestName={b.priest.displayName}
                  ceremonyType={b.ceremony.type as CeremonyType}
                  scheduledDate={b.scheduledDate}
                  scheduledTime={b.scheduledTime}
                  city={b.city as City}
                  status={b.status as BookingStatus}
                  totalAmount={b.totalAmount}
                  canReview={false}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {past.length === 0 ? (
              <EmptyState tab="past" />
            ) : (
              past.map((b) => {
                const hasReview = false // extend later with b.review check
                return (
                  <BookingCard
                    key={b.id}
                    id={b.id}
                    bookingRef={b.bookingRef}
                    priestName={b.priest.displayName}
                    ceremonyType={b.ceremony.type as CeremonyType}
                    scheduledDate={b.scheduledDate}
                    scheduledTime={b.scheduledTime}
                    city={b.city as City}
                    status={b.status as BookingStatus}
                    totalAmount={b.totalAmount}
                    canReview={b.status === "COMPLETED" && !hasReview}
                  />
                )
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function BookingCard({
  id, bookingRef, priestName, ceremonyType, scheduledDate, scheduledTime,
  city, status, totalAmount, canReview,
}: {
  id: string
  bookingRef: string
  priestName: string
  ceremonyType: CeremonyType
  scheduledDate: Date
  scheduledTime: string
  city: City
  status: BookingStatus
  totalAmount: number
  canReview: boolean
}) {
  const ceremony    = CEREMONIES[ceremonyType]
  const statusCfg   = STATUS_CONFIG[status]
  const isUpcoming  = UPCOMING_STATUSES.includes(status)

  return (
    <Card className="border-border/60 shadow-none hover:shadow-sm transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">{ceremony.emoji}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm">{ceremony.label}</h3>
                <Badge variant={statusCfg.variant} className="text-xs h-5">{statusCfg.label}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{priestName}</p>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" />
                {format(scheduledDate, "EEE, d MMM yyyy")} at {scheduledTime}
                <span>·</span>
                {CITIES[city]?.label}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">Ref</p>
            <p className="text-xs font-mono font-medium">{bookingRef}</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {isUpcoming
              ? <span>Contribution: <span className="font-medium text-foreground">{formatINR(totalAmount)}</span> paid directly to priest</span>
              : <span>Contribution: <span className="font-medium text-foreground">{formatINR(totalAmount)}</span></span>
            }
          </div>
          <div className="flex gap-2">
            {canReview && (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
                <Link href={`/bookings/${id}/review`}>
                  <Star className="h-3 w-3" /> Review
                </Link>
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-7 text-xs" asChild>
              <Link href={`/bookings/${id}`}>
                Details <ChevronRight className="h-3 w-3 ml-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ tab }: { tab: string }) {
  return (
    <div className="text-center py-16">
      <span className="text-4xl">🪔</span>
      <p className="mt-3 font-medium">No {tab} bookings</p>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        {tab === "upcoming" ? "Book your first ceremony today." : "Your completed bookings will appear here."}
      </p>
      <Button size="sm" asChild>
        <Link href="/browse">Browse Priests</Link>
      </Button>
    </div>
  )
}
