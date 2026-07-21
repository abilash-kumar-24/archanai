"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { CITIES, CEREMONIES, TRADITIONS, LANGUAGES } from "@/lib/constants"
import type { City, CeremonyType, Tradition, Language } from "@/types"

interface BrowseFiltersProps {
  initialFilters: {
    city?: string
    ceremony?: string
    tradition?: string
    language?: string
  }
  isMobile?: boolean
}

function FilterPanel({
  onClose,
}: {
  onClose?: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const city = searchParams.get("city") as City | null
  const ceremony = searchParams.get("ceremony") as CeremonyType | null
  const tradition = searchParams.get("tradition") as Tradition | null
  const language = searchParams.get("language") as Language | null

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/browse?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearAll = () => {
    router.push("/browse")
    onClose?.()
  }

  const hasFilters = city || ceremony || tradition || language

  return (
    <div className="space-y-6">
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs text-muted-foreground -mt-2">
          <X className="h-3 w-3 mr-1" /> Clear all filters
        </Button>
      )}

      {/* City */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">City</Label>
        <div className="space-y-1.5">
          {(Object.keys(CITIES) as City[]).map((c) => (
            <button
              key={c}
              onClick={() => updateFilter("city", city === c ? null : c)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                city === c
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              {CITIES[c].label}
              <span className="text-xs opacity-70 ml-1">· {CITIES[c].state}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Ceremony */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">Ceremony</Label>
        <div className="space-y-1.5">
          {(Object.keys(CEREMONIES) as CeremonyType[]).map((c) => (
            <button
              key={c}
              onClick={() => updateFilter("ceremony", ceremony === c ? null : c)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                ceremony === c
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <span>{CEREMONIES[c].emoji}</span>
              <span>{CEREMONIES[c].label}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Tradition */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">Tradition</Label>
        <div className="space-y-1.5">
          {(Object.keys(TRADITIONS) as Tradition[]).map((t) => (
            <button
              key={t}
              onClick={() => updateFilter("tradition", tradition === t ? null : t)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                tradition === t
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              {TRADITIONS[t].label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Language */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">Language</Label>
        <div className="flex flex-wrap gap-2">
          {(["TAMIL", "TELUGU", "KANNADA", "MALAYALAM", "SANSKRIT", "ENGLISH"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => updateFilter("language", language === l ? null : l)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                language === l
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary/50 text-foreground"
              }`}
            >
              {LANGUAGES[l]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function BrowseFilters({ isMobile }: BrowseFiltersProps) {
  const [open, setOpen] = useState(false)

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted transition-colors">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </SheetTrigger>
        <SheetContent side="left" className="overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Filter priests</SheetTitle>
          </SheetHeader>
          <FilterPanel onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="sticky top-24 overflow-y-auto max-h-[calc(100vh-8rem)]">
      <p className="text-sm font-semibold mb-4">Filters</p>
      <FilterPanel />
    </div>
  )
}
