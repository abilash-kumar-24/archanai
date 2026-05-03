"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
      <span className="text-5xl">🙏</span>
      <div>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          We ran into an unexpected issue. Please try again — if the problem persists, contact support.
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
