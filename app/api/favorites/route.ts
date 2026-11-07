export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"

const bodySchema = z.object({ priestId: z.string(), favorite: z.boolean() })

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  const { priestId, favorite } = parsed.data
  const key = { userId: user.id, priestId }

  if (favorite) {
    if (!(await prisma.priest.findUnique({ where: { id: priestId }, select: { id: true } }))) {
      return NextResponse.json({ error: "Priest not found" }, { status: 404 })
    }
    await prisma.favorite.upsert({ where: { userId_priestId: key }, update: {}, create: key })
  } else {
    await prisma.favorite.deleteMany({ where: key })
  }
  return NextResponse.json({ success: true })
}
