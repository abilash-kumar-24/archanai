export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { supabaseAdmin } from "@/lib/supabase/admin"

const BUCKET = "priest-photos"
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const priest = await prisma.priest.findUnique({ where: { userId: user.id } })
  if (!priest) return NextResponse.json({ error: "Priest profile not found" }, { status: 404 })

  const file = (await req.formData()).get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 })
  const ext = TYPES[file.type]
  if (!ext) return NextResponse.json({ error: "Use JPG, PNG or WebP" }, { status: 400 })
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Max 5MB" }, { status: 400 })

  // Idempotent: errors if the bucket already exists, which is fine
  await supabaseAdmin.storage.createBucket(BUCKET, { public: true })

  const path = `${priest.id}/${Date.now()}.${ext}`
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, file, { contentType: file.type })
  if (error) {
    console.error("[priests/photo]", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }

  const photoUrl = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  await prisma.priest.update({ where: { id: priest.id }, data: { photoUrl } })

  // Drop the previous photo so replaced uploads don't pile up in storage.
  const old = priest.photoUrl?.split(`/${BUCKET}/`)[1]
  if (old) await supabaseAdmin.storage.from(BUCKET).remove([old]).catch(console.error)
  return NextResponse.json({ photoUrl })
}
