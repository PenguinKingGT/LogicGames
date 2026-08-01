import { ColorToken } from "@/games/mastermind/components/game/ColorToken"
import { FeedbackPegs } from "@/games/mastermind/components/game/FeedbackPegs"
import type { SubmittedGuess } from "@/games/mastermind/game/types"

interface GuessRowProps {
  attempt: number
  guess?: SubmittedGuess
}

export function GuessRow({ attempt, guess }: GuessRowProps) {
  return (
    <div className="guess-row" aria-label={`第 ${attempt} 次猜测`}>
      <span className="attempt-number">{String(attempt).padStart(2, "0")}</span>
      <div className="grid grid-cols-4 gap-2">
        {guess
          ? guess.code.map((color, index) => (
              <ColorToken key={`${color}-${index}`} color={color} size="medium" />
            ))
          : Array.from({ length: 4 }, (_, index) => (
              <span key={index} className="empty-slot size-9" aria-hidden="true" />
            ))}
      </div>
      <FeedbackPegs feedback={guess?.feedback} />
    </div>
  )
}

