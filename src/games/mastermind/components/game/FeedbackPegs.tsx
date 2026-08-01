import type { Feedback } from "@/games/mastermind/game/types"

interface FeedbackPegsProps {
  feedback?: Feedback
}

export function FeedbackPegs({ feedback }: FeedbackPegsProps) {
  const exact = feedback?.exact ?? 0
  const colorOnly = feedback?.colorOnly ?? 0
  const pegs = [
    ...Array.from({ length: exact }, () => "exact" as const),
    ...Array.from({ length: colorOnly }, () => "color" as const),
    ...Array.from({ length: 4 - exact - colorOnly }, () => "empty" as const),
  ]

  return (
    <div
      className="grid grid-cols-2 gap-1"
      aria-label={feedback ? `${exact} 个位置正确，${colorOnly} 个颜色正确` : "尚无反馈"}
    >
      {pegs.map((peg, index) => (
        <span
          key={`${peg}-${index}`}
          className={`feedback-peg feedback-peg--${peg}`}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

