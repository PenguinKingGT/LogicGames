import { CODE_LENGTH, COLOR_IDS } from "@/games/mastermind/game/config"
import type { Code, ColorId, Feedback } from "@/games/mastermind/game/types"

export function toCode(colors: readonly ColorId[]): Code | null {
  if (colors.length !== CODE_LENGTH) return null

  return [colors[0]!, colors[1]!, colors[2]!, colors[3]!]
}

export function createSecret(random: () => number = Math.random): Code {
  const colors = Array.from({ length: CODE_LENGTH }, () => {
    const rawIndex = Math.floor(random() * COLOR_IDS.length)
    const safeIndex = Math.min(COLOR_IDS.length - 1, Math.max(0, rawIndex))
    return COLOR_IDS[safeIndex]!
  })

  return toCode(colors)!
}

export function scoreGuess(secret: Code, guess: Code): Feedback {
  let exact = 0
  let colorOnly = 0
  const remaining = new Map<ColorId, number>()
  const unmatchedGuess: ColorId[] = []

  for (let index = 0; index < CODE_LENGTH; index += 1) {
    const secretColor = secret[index]!
    const guessColor = guess[index]!

    if (secretColor === guessColor) {
      exact += 1
    } else {
      remaining.set(secretColor, (remaining.get(secretColor) ?? 0) + 1)
      unmatchedGuess.push(guessColor)
    }
  }

  for (const color of unmatchedGuess) {
    const available = remaining.get(color) ?? 0
    if (available > 0) {
      colorOnly += 1
      remaining.set(color, available - 1)
    }
  }

  return { exact, colorOnly }
}
