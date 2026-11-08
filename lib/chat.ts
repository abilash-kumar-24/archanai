import { prisma } from "@/lib/prisma"

export const MAX_MESSAGE_LENGTH = 1000
export const MAX_MESSAGES_PER_HOUR = 30
/** No new messages once a booking is cancelled or marked no-show; history stays readable. */
export const CLOSED_STATUSES = ["CANCELLED_CONSUMER", "CANCELLED_PRIEST", "NO_SHOW"]

/** Resolves whether `userId` is the family or the priest on this booking. Null = not a participant. */
export async function chatAccess(bookingId: string, userId: string) {
  const b = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true, bookingRef: true, status: true, consumerId: true,
      consumer: { select: { name: true, email: true } },
      priest: { select: { userId: true, displayName: true, user: { select: { email: true } } } },
      ceremony: { select: { name: true } },
    },
  })
  if (!b) return null
  const isFamily = b.consumerId === userId
  const isPriest = b.priest.userId === userId
  if (!isFamily && !isPriest) return null
  return {
    booking: b,
    me: isFamily ? ("FAMILY" as const) : ("PRIEST" as const),
    other: isFamily
      ? { userId: b.priest.userId, name: b.priest.displayName, email: b.priest.user.email, href: `/priest/bookings/${b.id}` }
      : { userId: b.consumerId, name: b.consumer.name ?? "the family", email: b.consumer.email, href: `/bookings/${b.id}` },
    senderName: isFamily ? (b.consumer.name ?? "The family") : b.priest.displayName,
    open: !CLOSED_STATUSES.includes(b.status),
  }
}
