import Link from "next/link"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"

export const metadata = { title: "Notifications" }
export const dynamic = "force-dynamic"

export default async function NotificationsPage() {
  const user = await getSessionUser()
  if (!user) redirect("/login?redirect=/notifications")

  const items = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { sentAt: "desc" }, take: 50 })
  await prisma.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } })

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-6">Notifications</h1>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing yet. Updates about your bookings will appear here.</p>
        ) : (
          <ul className="divide-y divide-border/60 rounded-xl border border-border/60">
            {items.map((n) => {
              const href = (n.data as { href?: string } | null)?.href
              const inner = (
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm ${n.isRead ? "font-medium" : "font-semibold"}`}>{n.title}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{format(n.sentAt, "d MMM, HH:mm")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                </div>
              )
              return <li key={n.id} className={n.isRead ? "" : "bg-primary/5"}>{href ? <Link href={href} className="block hover:bg-muted/50">{inner}</Link> : inner}</li>
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
