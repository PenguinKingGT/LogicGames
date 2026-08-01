import { useLayoutEffect, useRef } from "react"
import { CurrentGuess } from "@/games/mastermind/components/game/CurrentGuess"
import { GuessRow } from "@/games/mastermind/components/game/GuessRow"
import { MAX_ATTEMPTS } from "@/games/mastermind/game/config"
import type { ColorId, SubmittedGuess } from "@/games/mastermind/game/types"

interface GameBoardProps {
  history: readonly SubmittedGuess[]
  currentGuess: readonly ColorId[]
  invalid: boolean
}

export function GameBoard({ history, currentGuess, invalid }: GameBoardProps) {
  const futureCount = Math.max(0, MAX_ATTEMPTS - history.length - 1)
  const scrollRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const element = scrollRef.current
    if (element) element.scrollTop = element.scrollHeight
  }, [history.length, currentGuess.length])

  return (
    <section className="board-panel" aria-label="猜测棋盘">
      <div className="board-caption">
        <span>猜测</span>
        <span>判定</span>
      </div>
      <div ref={scrollRef} className="board-scroll">
        <div className="board-rows">
          {Array.from({ length: futureCount }, (_, index) => {
            const attempt = MAX_ATTEMPTS - index
            return <GuessRow key={`future-${attempt}`} attempt={attempt} />
          })}
          {history.length < MAX_ATTEMPTS ? (
            <CurrentGuess
              attempt={history.length + 1}
              colors={currentGuess}
              invalid={invalid}
            />
          ) : null}
          {history
            .map((guess, index) => ({ guess, attempt: index + 1 }))
            .toReversed()
            .map(({ guess, attempt }) => (
              <GuessRow key={`history-${attempt}`} attempt={attempt} guess={guess} />
            ))}
        </div>
      </div>
    </section>
  )
}
