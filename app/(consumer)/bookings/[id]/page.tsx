import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { format } from "date-fns"
import { MapPin, Phone, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookingChat } from "@/components/shared/booking-chat"
import { CancelBookingButton, RescheduleForm } from "@/components/consumer/booking-actions"
import { CEREMONIES, CITIES } from "@/lib/constants"
import { addDays, todayIST } from "@/lib/dates"
import { formatINR } from "@/lib/utils/booking"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import type { CeremonyType, City } from "@/types"

export const metadata = { title: "Booking details" }

const STATUS: Record<string, string> = {
  PENDING: "Waiting for the priest", CONFIRMED: "Confirmed", PRIEST_ACCEPTED: "Confirmed by the priest",
  COMPLETED: "Completed", CANCELLED_CONSUMER: "Cancelled by you", CANCELLED_PRIEST: "Cancelled by the priest", NO_SHOW: "Marked no-show",
}

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSessionUser()
  if (!user) redirect(`/login?redirect=/bookings/${id}`)

  const b = await prisma.booking.findUnique({
    where: { id },
    include: { ceremony: true, review: { select: { id: true } }, priest: { include: { user: { select: { phone: true } } } } },
  })
  if (!b || b.consumerId !== user.id) notFound()

  const live = ["PENDING", "CONFIRMED", "PRIEST_ACCEPTED"].includes(b.status)
  const showContact = ["CONFIRMED", "PRIEST_ACCEPTED", "COMPLETED"].includes(b.status) && b.priest.user.phone
  const ceremony = CEREMONIES[b.ceremony.type as CeremonyType]
  const fam = b.familyDetails as Record<string, string | undefined>
  const mapsHref = b.googleMapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.addressLine1}, ${b.pincode}`)}`

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-5">
        <Link href="/bookings" className="text-xs text-muted-foreground hover:text-foreground">← My bookings</Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{ceremony.emoji} {ceremony.label}</h1>
            <p className="text-sm text-muted-foreground mt-1">with <Link className="underline" href={`/priests/${b.priestId}`}>{b.priest.displayName}</Link></p>
          </div>
          <Badge variant={live ? "default" : "secondary"}>{STATUS[b.status]}</Badge>
        </div>

        {b.status === "CANCELLED_PRIEST" && b.cancellationReason && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">{b.cancellationReason}</div>
        )}

        <Card className="border-border/60 shadow-none"><CardContent className="p-5 space-y-3 text-sm">
          <Row k="Reference" v={<span className="font-mono">{b.bookingRef}</span>} />
          <Row k="When" v={`${format(b.scheduledDate, "EEEE, d MMMM yyyy")} at ${b.scheduledTime}`} />
          <Row k="Where" v={<>{b.addressLine1}{b.addressLine2 ? `, ${b.addressLine2}` : ""}, {CITIES[b.city as City].label} {b.pincode}{" "}
            <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline"><MapPin className="h-3 w-3" />Map</a></>} />
          <Row k="Priest's price" v={`${formatINR(b.totalAmount)} — paid directly to the priest`} />
          <Row k="Samagri" v={b.samagriOption === "SELF_ARRANGED" ? "You arrange (checklist emailed on confirmation)" : "Priest arranges"} />
          <Row k="Yajamana" v={fam.primaryName ?? "—"} />
          {showContact && (
            <Row k="Priest's phone" v={<a href={`tel:+91${b.priest.user.phone}`} className="inline-flex items-center gap-1 text-primary underline"><Phone className="h-3 w-3" />+91 {b.priest.user.phone}</a>} />
          )}
        </CardContent></Card>

        <div className="flex flex-wrap items-center gap-2">
          {live && <RescheduleForm bookingId={b.id} minDate={addDays(todayIST(), 1)} currentTime={b.scheduledTime} />}
          {live && <CancelBookingButton bookingId={b.id} />}
          {b.status === "COMPLETED" && !b.review && (
            <Button size="sm" asChild><Link href={`/bookings/${b.id}/review`}><Star className="h-3 w-3 mr-1" />Write a review</Link></Button>
          )}
          {!live && <Button size="sm" variant="outline" asChild><Link href={`/book?priestId=${b.priestId}&ceremony=${b.ceremony.type}`}>Book again</Link></Button>}
        </div>
        <BookingChat bookingId={b.id} meId={user.id} />
        {b.rescheduleCount > 0 && live && <p className="text-xs text-muted-foreground">Rescheduled {b.rescheduleCount} of 2 allowed times.</p>}
      </div>
    </div>
  )
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-4"><span className="text-muted-foreground shrink-0">{k}</span><span className="text-right">{v}</span></div>
}
