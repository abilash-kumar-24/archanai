export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// One-off: Vercel's build container can't reach the DB pooler, so
// `prisma migrate deploy` hangs during build. Applying this migration
// through the running serverless function instead, which has a proven
// working connection. Delete this route once run.
export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-migration-secret")
  if (!auth || auth !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.$executeRawUnsafe(
    `ALTER TABLE "priests" RENAME COLUMN "aadhaar_verified" TO "identity_verified"`
  )

  return NextResponse.json({ success: true })
}
