export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"

const bodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  title:  z.string().max(120).optional(),
  body:   z.string().max(2000).optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid review" }, { status: 400 })

  const booking = await prisma.booking.findUnique({ where: { id }, include: { review: true } })
  if (!booking || booking.consumerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (booking.status !== "COMPLETED") {
    return NextResponse.json({ error: "Only completed bookings can be reviewed" }, { status: 409 })
  }
  if (booking.review) {
    return NextResponse.json({ error: "Already reviewed" }, { status: 409 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        bookingId:  id,
        priestId:   booking.priestId,
        consumerId: user.id,
        isVerified: true,
        ...parsed.data,
      },
    })
    const agg = await tx.review.aggregate({
      where:  { priestId: booking.priestId },
      _avg:   { rating: true },
      _count: { id: true },
    })
    await tx.priest.update({
      where: { id: booking.priestId },
      data:  { rating: agg._avg.rating ?? 0, reviewCount: agg._count.id },
    })
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
