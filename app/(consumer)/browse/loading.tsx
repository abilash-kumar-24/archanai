import { Skeleton } from "@/components/ui/skeleton"

export default function BrowseLoading() {
  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Skeleton className="h-7 w-40 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </aside>
          <div className="flex-1 grid sm:grid-cols-2 gap-4">
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
        </div>
      </div>
    </div>
  )
}
