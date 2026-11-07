export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { DOC_BUCKET, DOC_TYPES, MAX_DOCS_PER_PRIEST } from "@/lib/priest/documents"

// Private bucket: ID proof and certificates are never publicly readable; admins get short-lived signed URLs.
export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const priest = await prisma.priest.findUnique({ where: { userId: user.id } })
  if (!priest) return NextResponse.json({ error: "Priest profile not found" }, { status: 404 })

  const form = await req.formData()
  const file = form.get("file")
  const kind = form.get("kind")
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 })
  if (typeof kind !== "string" || !["ID_PROOF", "CERTIFICATE", "TEMPLE_LETTER", "OTHER"].includes(kind)) {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 })
  }
  const ext = DOC_TYPES[file.type]
  if (!ext) return NextResponse.json({ error: "Use PDF, JPG, PNG or WebP" }, { status: 400 })
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Max 8MB" }, { status: 400 })
  if ((await prisma.priestDocument.count({ where: { priestId: priest.id } })) >= MAX_DOCS_PER_PRIEST) {
    return NextResponse.json({ error: "Document limit reached. Delete one first." }, { status: 409 })
  }

  await supabaseAdmin.storage.createBucket(DOC_BUCKET, { public: false }) // no-op error if it exists
  const path = `${priest.id}/${kind}-${Date.now()}.${ext}`
  const { error } = await supabaseAdmin.storage.from(DOC_BUCKET).upload(path, file, { contentType: file.type })
  if (error) {
    console.error("[priests/documents]", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }

  const doc = await prisma.priestDocument.create({
    data: { priestId: priest.id, kind: kind as "ID_PROOF", path, fileName: file.name.slice(0, 120) },
  })
  return NextResponse.json({ document: doc }, { status: 201 })
}
