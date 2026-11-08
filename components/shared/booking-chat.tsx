"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type Msg = { id: string; senderId: string; body: string; createdAt: string }

/** Polls while the tab is visible; chat volume in a pilot does not justify websockets. */
export function BookingChat({ bookingId, meId }: { bookingId: string; meId: string }) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [open, setOpen] = useState(true)
  const [otherName, setOtherName] = useState("")
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/messages`, { cache: "no-store" })
      if (!res.ok) return
      const json = await res.json()
      setMessages(json.messages)
      setOpen(json.open)
      setOtherName(json.otherName)
    } finally {
      setLoaded(true)
    }
  }, [bookingId])

  useEffect(() => {
    load()
    const t = setInterval(() => { if (document.visibilityState === "visible") load() }, 8000)
    return () => clearInterval(t)
  }, [load])

  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }) }, [messages.length])

  async function send() {
    const body = draft.trim()
    if (!body || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error ?? "Could not send")
      setDraft("")
      setMessages((m) => [...m, json.message])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send")
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="rounded-xl border border-border/60" aria-label="Chat">
      <div className="px-4 py-3 border-b border-border/60 text-sm font-medium">Chat{otherName ? ` with ${otherName}` : ""}</div>
      <div className="h-64 overflow-y-auto p-4 space-y-2" aria-live="polite">
        {loaded && !messages.length && <p className="text-xs text-muted-foreground">No messages yet. Ask about timing, travel or samagri.</p>}
        {messages.map((m) => (
          <div key={m.id} className={m.senderId === meId ? "flex justify-end" : "flex justify-start"}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${m.senderId === meId ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {m.body}
              <div className="text-[10px] opacity-70 mt-0.5">{new Date(m.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {open ? (
        <form className="flex items-end gap-2 p-3 border-t border-border/60" onSubmit={(e) => { e.preventDefault(); send() }}>
          <Textarea rows={1} maxLength={1000} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message" className="resize-none min-h-9"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }} />
          <Button type="submit" size="sm" disabled={sending || !draft.trim()} aria-label="Send"><Send className="h-4 w-4" /></Button>
        </form>
      ) : (
        <p className="p-3 border-t border-border/60 text-xs text-muted-foreground">This booking is closed, so chat is read-only.</p>
      )}
    </section>
  )
}
