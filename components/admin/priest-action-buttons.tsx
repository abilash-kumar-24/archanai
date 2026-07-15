"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function PriestActionButtons({ priestId }: { priestId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null)

  const act = async (action: "approve" | "reject") => {
    setBusy(action)
    try {
      const res = await fetch(`/api/admin/priests/${priestId}/verify`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error()
      toast.success(action === "approve" ? "Priest approved and activated" : "Priest rejected")
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex gap-2 mt-3">
      <Button
        size="sm"
        className="h-7 text-xs gap-1"
        disabled={!!busy}
        onClick={() => act("approve")}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        {busy === "approve" ? "Approving…" : "Approve"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
        disabled={!!busy}
        onClick={() => act("reject")}
      >
        <XCircle className="h-3.5 w-3.5" />
        {busy === "reject" ? "Rejecting…" : "Reject"}
      </Button>
    </div>
  )
}
