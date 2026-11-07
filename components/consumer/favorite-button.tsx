"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function FavoriteButton({ priestId, initial, signedIn }: { priestId: string; initial: boolean; signedIn: boolean }) {
  const router = useRouter()
  const [fav, setFav] = useState(initial)
  const [busy, setBusy] = useState(false)

  const toggle = async () => {
    if (!signedIn) return router.push(`/login?redirect=${encodeURIComponent(`/priests/${priestId}`)}`)
    setBusy(true)
    try {
      const res = await fetch("/api/favorites", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priestId, favorite: !fav }),
      })
      if (!res.ok) throw new Error()
      setFav(!fav)
      toast.success(fav ? "Removed from saved" : "Saved")
    } catch {
      toast.error("Could not update. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" disabled={busy} onClick={toggle} aria-pressed={fav}>
      <Heart className={`h-4 w-4 ${fav ? "fill-primary text-primary" : ""}`} /> {fav ? "Saved" : "Save"}
    </Button>
  )
}
