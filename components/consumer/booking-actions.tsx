"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const cancel = async () => {
    if (!window.confirm("Cancel this booking?")) return
    setBusy(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" })
      if (!res.ok) throw new Error()
      toast.success("Booking cancelled")
      router.refresh()
    } catch {
      toast.error("Could not cancel. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button size="sm" variant="outline" className="h-7 text-xs" disabled={busy} onClick={cancel}>
      {busy ? "Cancelling…" : "Cancel"}
    </Button>
  )
}

const SLOTS = ["06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "16:00", "16:30", "17:00", "17:30", "18:00"]

export function RescheduleForm({ bookingId, minDate, currentTime }: { bookingId: string; minDate: string; currentTime: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState("")
  const [time, setTime] = useState(currentTime)
  const [busy, setBusy] = useState(false)

  if (!open) return <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Reschedule</Button>

  const submit = async () => {
    if (!date) return toast.error("Pick a new date")
    setBusy(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/reschedule`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledDate: date, scheduledTime: time }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error)
      toast.success("Reschedule requested. The priest must confirm the new date.")
      setOpen(false)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : "Could not reschedule")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} className="h-8 rounded-md border border-border bg-background px-2 text-sm" aria-label="New date" />
      <select value={time} onChange={(e) => setTime(e.target.value)} className="h-8 rounded-md border border-border bg-background px-2 text-sm" aria-label="New start time">
        {SLOTS.map((t) => <option key={t}>{t}</option>)}
      </select>
      <Button size="sm" disabled={busy} onClick={submit}>{busy ? "Sending…" : "Request"}</Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Close</Button>
    </div>
  )
}
