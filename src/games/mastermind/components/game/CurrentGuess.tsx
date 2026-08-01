import { ColorToken } from "@/games/mastermind/components/game/ColorToken"
import type { ColorId } from "@/games/mastermind/game/types"

interface CurrentGuessProps {
  attempt: number
  colors: readonly ColorId[]
  invalid: boolean
}

export function CurrentGuess({ attempt, colors, invalid }: CurrentGuessProps) {
  return (
    <div
      className={`guess-row guess-row--current ${invalid ? "guess-row--invalid" : ""}`}
      aria-label={`正在填写第 ${attempt} 次猜测`}
    >
      <span className="attempt-number attempt-number--active">{String(attempt).padStart(2, "0")}</span>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }, (_, index) => {
          const color = colors[index]
          return color ? (
            <span key={`${color}-${index}`} className="token-enter">
              <ColorToken color={color} size="medium" />
            </span>
          ) : (
            <span key={index} className="empty-slot empty-slot--active size-9" aria-label={`空位 ${index + 1}`} />
          )
        })}
      </div>
      <div className="grid grid-cols-2 gap-1" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} className="feedback-peg feedback-peg--empty" />
        ))}
      </div>
    </div>
  )
}

