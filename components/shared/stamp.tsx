import { cn } from "@/lib/utils"

export function Stamp({
  children,
  className,
  tone = "primary",
}: {
  children: React.ReactNode
  className?: string
  tone?: "primary" | "verdigris"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-[48%_52%_51%_49%/52%_48%_53%_47%] border-2 px-3 py-1 -rotate-3 select-none font-heading text-[11px] font-bold uppercase tracking-widest",
        tone === "primary" ? "border-primary text-primary" : "border-verdigris text-verdigris",
        className
      )}
    >
      {children}
    </span>
  )
}
