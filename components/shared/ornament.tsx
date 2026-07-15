import { cn } from "@/lib/utils"

export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)} aria-hidden="true">
      <span className="h-px w-10 sm:w-16 bg-primary/25" />
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="shrink-0 text-primary/50">
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse key={i} cx="12" cy="12" rx="2" ry="6" transform={`rotate(${i * 45} 12 12)`} />
        ))}
      </svg>
      <span className="h-px w-10 sm:w-16 bg-primary/25" />
    </div>
  )
}
