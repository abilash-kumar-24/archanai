import { Flame } from "@/components/shared/flame"
import { cn } from "@/lib/utils"

export function FlameBadge({
  children,
  className,
  tone = "light",
}: {
  children: React.ReactNode
  className?: string
  tone?: "light" | "dark"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest",
        tone === "light" ? "border-primary/40 bg-primary/10 text-primary" : "border-flame/50 bg-white/5 text-flame",
        className
      )}
    >
      <Flame className="h-2.5 w-2.5" />
      {children}
    </span>
  )
}
