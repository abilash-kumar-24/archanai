import { cn } from "@/lib/utils"

export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)} aria-hidden="true">
      <span className="h-px w-14 sm:w-24 bg-gradient-to-r from-transparent to-primary/40" />
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="shrink-0 text-primary/70">
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse key={i} cx="12" cy="12" rx="2.4" ry="7" transform={`rotate(${i * 45} 12 12)`} />
        ))}
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      </svg>
      <span className="h-px w-14 sm:w-24 bg-gradient-to-l from-transparent to-primary/40" />
    </div>
  )
}
