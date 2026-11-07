"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [title, setTitle]   = useState("")
  const [body, setBody]     = useState("")
  const [busy, setBusy]     = useState(false)

  const submit = async () => {
    if (!rating) return toast.error("Pick a star rating")
    setBusy(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/review`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ rating, title: title || undefined, body: body || undefined }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success("Thank you for your review 🙏")
      router.push("/bookings")
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : "Could not submit review")
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(n)}>
            <Star className={`h-8 w-8 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
          </button>
        ))}
      </div>
      <Input placeholder="Title (optional)" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea placeholder="Tell others about your experience (optional)" maxLength={2000} rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
      <Button onClick={submit} disabled={busy}>{busy ? "Submitting…" : "Submit review"}</Button>
    </div>
  )
}
