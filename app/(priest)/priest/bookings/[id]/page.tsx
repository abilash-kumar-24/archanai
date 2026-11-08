import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BookingChat } from "@/components/shared/booking-chat"
import { CEREMONIES, CITIES } from "@/lib/constants"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import type { CeremonyType, City } from "@/types"

export const metadata = { title: "Booking" }

const STATUS: Record<string, string> = {
  PENDING: "Awaiting your reply", CONFIRMED: "Confirmed", PRIEST_ACCEPTED: "Accepted", COMPLETED: "Completed",
  CANCELLED_CONSUMER: "Cancelled by the family", CANCELLED_PRIEST: "Cancelled by you", NO_SHOW: "No-show",
}

export default async function PriestBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSessionUser()
  if (!user) redirect(`/login?redirect=/priest/bookings/${id}`)

  const b = await prisma.booking.findUnique({ where: { id }, include: { ceremony: true, consumer: { select: { name: true } }, priest: { select: { userId: true } } } })
  if (!b || b.priest.userId !== user.id) notFound()
  const ceremony = CEREMONIES[b.ceremony.type as CeremonyType]
  const showPhone = ["PRIEST_ACCEPTED", "COMPLETED"].includes(b.status) && b.contactPhone

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/priest/dashboard" className="text-xs text-muted-foreground hover:text-foreground">← Dashboard</Link>
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{ceremony.emoji} {ceremony.label}</h1>
        <Badge variant="secondary">{STATUS[b.status]}</Badge>
      </div>
      <Card className="border-border/60 shadow-none"><CardContent className="p-5 space-y-2 text-sm">
        <p><span className="text-muted-foreground">Family: </span>{b.consumer.name ?? "—"}</p>
        <p><span className="text-muted-foreground">When: </span>{format(b.scheduledDate, "EEEE, d MMMM yyyy")} at {b.scheduledTime}</p>
        <p><span className="text-muted-foreground">Where: </span>{b.addressLine1}, {CITIES[b.city as City]?.label} {b.pincode}</p>
        {showPhone && <p><span className="text-muted-foreground">Phone: </span><a className="text-primary underline" href={`tel:+91${b.contactPhone}`}>+91 {b.contactPhone}</a></p>}
      </CardContent></Card>
      <BookingChat bookingId={b.id} meId={user.id} />
    </div>
  )
}
