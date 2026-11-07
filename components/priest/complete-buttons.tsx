"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export function CompleteButtons({ bookingId, suggested }: { bookingId: string; suggested: number }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [amount, setAmount] = useState(String(suggested))

  const act = async (outcome: "completed" | "no_show") => {
    setBusy(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/complete`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ outcome, ...(outcome === "completed" && amount !== "" && { amountReceived: Number(amount) }) }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error)
      toast.success(outcome === "completed" ? "Marked completed 🙏" : "Marked no-show")
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : "Something went wrong. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-border/60 flex flex-wrap gap-2 items-center">
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        Received ₹
        <Input type="number" min={0} className="h-7 w-24 text-xs" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </label>
      <Button size="sm" className="h-7 text-xs" disabled={busy} onClick={() => act("completed")}>Mark completed</Button>
      <Button size="sm" variant="outline" className="h-7 text-xs" disabled={busy} onClick={() => act("no_show")}>No-show</Button>
    </div>
  )
}
