export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { chatAccess, MAX_MESSAGE_LENGTH, MAX_MESSAGES_PER_HOUR } from "@/lib/chat"
import { sendNewMessage } from "@/lib/resend/emails"
import { notify } from "@/lib/notify"
import { background } from "@/lib/background"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const access = await chatAccess(id, user.id)
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const messages = await prisma.message.findMany({
    where: { bookingId: id }, orderBy: { createdAt: "asc" }, take: 200,
    select: { id: true, senderId: true, body: true, createdAt: true },
  })
  return NextResponse.json({ messages, open: access.open, otherName: access.other.name })
}

const bodySchema = z.object({ body: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH) })

export async function POST(req: NextRequest, { params }: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const access = await chatAccess(id, user.id)
  if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (!access.open) return NextResponse.json({ error: "This booking is closed, so chat is read-only." }, { status: 409 })

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: `Message must be 1–${MAX_MESSAGE_LENGTH} characters` }, { status: 400 })

  const recent = await prisma.message.count({ where: { senderId: user.id, createdAt: { gt: new Date(Date.now() - 3_600_000) } } })
  if (recent >= MAX_MESSAGES_PER_HOUR) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 })

  const message = await prisma.message.create({
    data: { bookingId: id, senderId: user.id, body: parsed.data.body },
    select: { id: true, senderId: true, body: true, createdAt: true },
  })

  // One bell entry and one email per unread run, so a busy thread does not flood the inbox.
  const alreadyUnread = await prisma.notification.findFirst({
    where: { userId: access.other.userId, type: "NEW_MESSAGE", isRead: false, data: { path: ["href"], equals: access.other.href } },
    select: { id: true },
  })
  if (!alreadyUnread) {
    await notify(access.other.userId, {
      type: "NEW_MESSAGE", title: "New message", body: `${access.senderName} · ${access.booking.ceremony.name} (${access.booking.bookingRef})`, href: access.other.href,
    })
    background(() => sendNewMessage(access.other.email, {
      name: access.other.name, from: access.senderName, bookingRef: access.booking.bookingRef, path: access.other.href,
    }))
  }

  return NextResponse.json({ message }, { status: 201 })
}
