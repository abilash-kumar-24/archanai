"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, FileText, PauseCircle, PlayCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Action = "approve" | "reject" | "deactivate" | "reactivate"
type Doc = { id: string; kind: string; fileName: string; url: string | null }

const DONE: Record<Action, string> = {
  approve: "Priest approved and activated", reject: "Priest rejected", deactivate: "Priest paused", reactivate: "Priest reactivated",
}

export function PriestActionButtons({ priestId, mode = "pending" }: { priestId: string; mode?: "pending" | "active" | "paused" }) {
  const router = useRouter()
  const [busy, setBusy] = useState<Action | null>(null)
  const [docs, setDocs] = useState<Doc[] | null>(null)

  const act = async (action: Action) => {
    setBusy(action)
    try {
      const res = await fetch(`/api/admin/priests/${priestId}/verify`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error)
      toast.success(DONE[action])
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : "Something went wrong. Please try again.")
    } finally {
      setBusy(null)
    }
  }

  const loadDocs = async () => {
    const res = await fetch(`/api/admin/priests/${priestId}/documents`)
    if (!res.ok) return toast.error("Could not load documents")
    setDocs((await res.json()).documents)
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-2">
        {mode === "pending" && (
          <>
            <Button size="sm" className="h-7 text-xs gap-1" disabled={!!busy} onClick={() => act("approve")}>
              <CheckCircle2 className="h-3.5 w-3.5" />{busy === "approve" ? "Approving…" : "Approve"}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" disabled={!!busy} onClick={() => act("reject")}>
              <XCircle className="h-3.5 w-3.5" />{busy === "reject" ? "Rejecting…" : "Reject"}
            </Button>
          </>
        )}
        {mode === "active" && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={!!busy} onClick={() => act("deactivate")}>
            <PauseCircle className="h-3.5 w-3.5" />{busy === "deactivate" ? "Pausing…" : "Pause profile"}
          </Button>
        )}
        {mode === "paused" && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={!!busy} onClick={() => act("reactivate")}>
            <PlayCircle className="h-3.5 w-3.5" />{busy === "reactivate" ? "Reactivating…" : "Reactivate"}
          </Button>
        )}
        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={loadDocs}>
          <FileText className="h-3.5 w-3.5" />Documents
        </Button>
      </div>
      {docs && (
        <ul className="text-xs space-y-1">
          {docs.length === 0 && <li className="text-muted-foreground">No documents uploaded. Verify by phone.</li>}
          {docs.map((d) => (
            <li key={d.id}>
              {d.url
                ? <a className="text-primary underline" href={d.url} target="_blank" rel="noopener noreferrer">{d.kind.replace("_", " ").toLowerCase()} · {d.fileName}</a>
                : `${d.kind} · ${d.fileName} (link unavailable)`}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
