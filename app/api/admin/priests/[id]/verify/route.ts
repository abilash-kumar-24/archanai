export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const { action } = await req.json()

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action — must be 'approve' or 'reject'" }, { status: 400 })
  }

  await prisma.priest.update({
    where: { id },
    data: {
      verificationStatus: action === "approve" ? "VERIFIED" : "REJECTED",
      isActive: action === "approve",
    },
  })

  return NextResponse.json({ success: true })
}
