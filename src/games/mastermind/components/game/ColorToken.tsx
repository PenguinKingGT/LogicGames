import { COLOR_META } from "@/games/mastermind/game/config"
import type { ColorId } from "@/games/mastermind/game/types"
import { cn } from "@/games/mastermind/lib/utils"

interface ColorTokenProps {
  color: ColorId
  size?: "small" | "medium" | "large"
  label?: boolean
}

const sizes = {
  small: "size-7 text-[10px]",
  medium: "size-9 text-xs",
  large: "size-12 text-sm",
}

export function ColorToken({ color, size = "medium", label = false }: ColorTokenProps) {
  const meta = COLOR_META[color]
  return (
    <span className="inline-flex flex-col items-center gap-1.5">
      <span
        className={cn(
          "color-token grid shrink-0 place-items-center rounded-full border-[3px] border-white/60 font-black text-white shadow-[inset_0_-3px_0_rgba(24,45,38,.16),0_2px_5px_rgba(31,74,61,.16)]",
          sizes[size],
        )}
        style={{ backgroundColor: meta.hex }}
        aria-hidden="true"
      >
        {meta.number}
      </span>
      {label ? <span className="text-[11px] font-bold text-[var(--ink-muted)]">{meta.name}</span> : null}
      <span className="sr-only">{meta.name}色，编号 {meta.number}</span>
    </span>
  )
}

