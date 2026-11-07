"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Bell } from "lucide-react"

export function NotificationBell() {
  const [unread, setUnread] = useState(0)
  useEffect(() => {
    const load = () => fetch("/api/notifications").then((r) => r.json()).then((d) => setUnread(d.unread ?? 0)).catch(() => {})
    load()
    const t = setInterval(load, 60_000)
    return () => clearInterval(t)
  }, [])
  return (
    <Link href="/notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className="relative p-2 text-muted-foreground hover:text-foreground">
      <Bell className="h-4 w-4" />
      {unread > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] leading-4 text-center">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  )
}
