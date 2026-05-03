import { Skeleton } from "@/components/ui/skeleton"

export default function BookingsLoading() {
  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-10 w-56 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/60 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-52" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
              <div className="pt-3 border-t border-border/60 flex justify-between">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-7 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
