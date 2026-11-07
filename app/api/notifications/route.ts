export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ unread: 0, items: [] })
  const [unread, items] = await Promise.all([
    prisma.notification.count({ where: { userId: user.id, isRead: false } }),
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { sentAt: "desc" }, take: 20 }),
  ])
  return NextResponse.json({ unread, items })
}

// Mark everything read
export async function POST() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await prisma.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } })
  return NextResponse.json({ success: true })
}
