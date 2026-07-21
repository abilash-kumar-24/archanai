import { cn } from "@/lib/utils"

export function Flame({
  className,
  withBase = false,
  glow = false,
}: {
  className?: string
  withBase?: boolean
  glow?: boolean
}) {
  return (
    <svg
      viewBox="0 0 100 130"
      className={cn(glow && "flame-glow", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {withBase && (
        <path
          d="M12 112 Q50 130 88 112 Q80 100 50 100 Q20 100 12 112 Z"
          fill="var(--bronze)"
        />
      )}
      <g className="flame-flicker">
        <path
          d="M50 12 C34 38 25 54 25 74 C25 94 36 105 50 105 C64 105 75 94 75 74 C75 54 66 38 50 12 Z"
          fill="url(#flame-gradient)"
        />
      </g>
      <defs>
        <linearGradient id="flame-gradient" x1="50" y1="12" x2="50" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbf3e1" />
          <stop offset="38%" stopColor="var(--flame)" />
          <stop offset="100%" stopColor="var(--ember)" />
        </linearGradient>
      </defs>
    </svg>
  )
}
