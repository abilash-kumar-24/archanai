import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const priest = await prisma.priest.findUnique({ where: { userId: user.id } })
  if (!priest) return NextResponse.json({ error: "Not a priest" }, { status: 403 })

  const { date } = await req.json()
  const blocked = await prisma.blockedDate.create({
    data: { priestId: priest.id, date: new Date(date) },
  })

  return NextResponse.json({ id: blocked.id }, { status: 201 })
}
