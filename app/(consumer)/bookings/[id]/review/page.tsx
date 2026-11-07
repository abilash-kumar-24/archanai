import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { ReviewForm } from "@/components/consumer/review-form"

export const metadata = { title: "Write a Review" }

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSessionUser()
  if (!user) redirect(`/login?redirect=/bookings/${id}/review`)

  const booking = await prisma.booking.findUnique({
    where:   { id },
    include: { priest: true, ceremony: true, review: true },
  })
  if (!booking || booking.consumerId !== user.id) notFound()
  if (booking.status !== "COMPLETED" || booking.review) redirect("/bookings")

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto max-w-xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Review your {booking.ceremony.name}</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-6">with {booking.priest.displayName}</p>
        <ReviewForm bookingId={booking.id} />
      </div>
    </div>
  )
}
