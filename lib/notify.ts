import { prisma } from "@/lib/prisma"

/** In-app notification row. Never throws: a failed notification must not fail the action that caused it. */
export async function notify(userId: string, n: { type: string; title: string; body: string; href?: string }) {
  try {
    await prisma.notification.create({
      data: { userId, type: n.type, title: n.title, body: n.body, data: n.href ? { href: n.href } : undefined },
    })
  } catch (err) {
    console.error("[notify]", err)
  }
}
