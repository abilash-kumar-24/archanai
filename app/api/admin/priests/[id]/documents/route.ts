export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { DOC_BUCKET } from "@/lib/priest/documents"

// Admin-only: 10-minute signed links to a priest's private documents
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const docs = await prisma.priestDocument.findMany({ where: { priestId: id }, orderBy: { createdAt: "desc" } })
  const items = await Promise.all(
    docs.map(async (d) => ({
      id: d.id, kind: d.kind, fileName: d.fileName,
      url: (await supabaseAdmin.storage.from(DOC_BUCKET).createSignedUrl(d.path, 600)).data?.signedUrl ?? null,
    }))
  )
  return NextResponse.json({ documents: items })
}
