import { Suspense } from "react"
import { Filter, SlidersHorizontal } from "lucide-react"
import { BrowseFilters } from "@/components/consumer/browse-filters"
import { PriestGrid } from "@/components/consumer/priest-grid"
import { Skeleton } from "@/components/ui/skeleton"

interface BrowsePageProps {
  searchParams: Promise<{
    city?: string
    ceremony?: string
    tradition?: string
    language?: string
    date?: string
    minRating?: string
    maxPrice?: string
  }>
}

export const metadata = {
  title: "Browse Priests",
  description: "Find verified Hindu priests near you, filtered by tradition, language, ceremony, and availability.",
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Find a Priest</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Verified priests across 5 South Indian cities, tradition-matched to your family
            </p>
          </div>

          <div className="flex gap-8">
            {/* Sidebar filters — desktop */}
            <aside className="hidden lg:block w-64 shrink-0">
              <BrowseFilters initialFilters={params} />
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Mobile filter button */}
              <div className="lg:hidden mb-4">
                <BrowseFilters initialFilters={params} isMobile />
              </div>

              <Suspense fallback={<PriestGridSkeleton />}>
                <PriestGrid filters={params} />
              </Suspense>
            </div>
          </div>
        </div>
    </div>
  )
}

function PriestGridSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/60 p-5 space-y-3">
          <div className="flex gap-4">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-8 w-28 ml-auto" />
        </div>
      ))}
    </div>
  )
}
