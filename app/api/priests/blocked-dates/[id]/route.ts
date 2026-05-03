import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const priest = await prisma.priest.findUnique({ where: { userId: user.id } })
  if (!priest) return NextResponse.json({ error: "Not a priest" }, { status: 403 })

  const entry = await prisma.blockedDate.findUnique({ where: { id } })
  if (!entry || entry.priestId !== priest.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.blockedDate.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
