export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { sendPriestVerification } from "@/lib/resend/emails"
import { notify } from "@/lib/notify"
import { background } from "@/lib/background"

const bodySchema = z.object({ action: z.enum(["approve", "reject", "deactivate", "reactivate"]) })

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "action must be approve, reject, deactivate or reactivate" }, { status: 400 })
  }
  const { action } = parsed.data

  const priest = await prisma.priest.findUnique({ where: { id }, include: { user: true } })
  if (!priest) return NextResponse.json({ error: "Priest not found" }, { status: 404 })

  if (action === "reactivate" && priest.verificationStatus !== "VERIFIED") {
    return NextResponse.json({ error: "Only verified priests can be reactivated" }, { status: 409 })
  }

  await prisma.priest.update({
    where: { id },
    data:
      action === "approve"    ? { verificationStatus: "VERIFIED", isActive: true,  identityVerified: true } :
      action === "reject"     ? { verificationStatus: "REJECTED", isActive: false, identityVerified: false } :
      action === "deactivate" ? { isActive: false } :
                                { isActive: true },
  })

  if (action === "approve" || action === "reject") {
    const approved = action === "approve"
    await notify(priest.userId, {
      type: approved ? "PRIEST_VERIFIED" : "PRIEST_REJECTED",
      title: approved ? "You're verified" : "Application needs attention",
      body: approved ? "Your profile is now visible to families." : "Please update your profile and documents.",
      href: approved ? "/priest/dashboard" : "/priest/profile",
    })
    background(() => sendPriestVerification(priest.user.email, { name: priest.displayName, approved }))
  }

  return NextResponse.json({ success: true })
}
