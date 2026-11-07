export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"

const bodySchema = z.object({
  outcome:        z.enum(["completed", "no_show"]),
  amountReceived: z.number().int().min(0).max(10_000_000).optional(),
})

// Priest marks an accepted booking as done (or family no-show) once the date has arrived
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid outcome" }, { status: 400 })

  const existing = await prisma.booking.findUnique({ where: { id }, include: { priest: true } })
  if (!existing || existing.priest.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (existing.status !== "PRIEST_ACCEPTED") {
    return NextResponse.json({ error: `Booking is ${existing.status}` }, { status: 409 })
  }
  if (existing.scheduledDate.getTime() > Date.now()) {
    return NextResponse.json({ error: "Ceremony date has not arrived yet" }, { status: 409 })
  }

  if (parsed.data.outcome === "completed") {
    await prisma.$transaction([
      prisma.booking.update({ where: { id }, data: { status: "COMPLETED", completedAt: new Date(), amountReceived: parsed.data.amountReceived } }),
      prisma.priest.update({ where: { id: existing.priestId }, data: { ceremoniesCount: { increment: 1 } } }),
    ])
  } else {
    await prisma.booking.update({ where: { id }, data: { status: "NO_SHOW" } })
  }
  return NextResponse.json({ success: true })
}
