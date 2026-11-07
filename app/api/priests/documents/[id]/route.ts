export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { DOC_BUCKET } from "@/lib/priest/documents"

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const doc = await prisma.priestDocument.findUnique({ where: { id }, include: { priest: true } })
  if (!doc || doc.priest.userId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await supabaseAdmin.storage.from(DOC_BUCKET).remove([doc.path])
  await prisma.priestDocument.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
