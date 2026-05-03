"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function BookingActionButtons({ bookingId, bookingRef }: { bookingId: string; bookingRef: string }) {
  const router  = useRouter()
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null)

  const act = async (action: "accept" | "decline") => {
    setBusy(action)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error()
      toast.success(action === "accept" ? "Booking accepted 🙏" : "Booking declined")
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-border/60 flex gap-2 items-center">
      <Button
        size="sm"
        className="h-7 text-xs"
        disabled={!!busy}
        onClick={() => act("accept")}
      >
        {busy === "accept" ? "Accepting…" : "Accept Booking"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs"
        disabled={!!busy}
        onClick={() => act("decline")}
      >
        {busy === "decline" ? "Declining…" : "Decline"}
      </Button>
      <span className="text-xs text-muted-foreground ml-auto font-mono">{bookingRef}</span>
    </div>
  )
}
