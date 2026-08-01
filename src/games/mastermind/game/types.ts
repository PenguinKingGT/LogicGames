import type { COLOR_IDS } from "@/games/mastermind/game/config"

export type ColorId = (typeof COLOR_IDS)[number]
export type Code = readonly [ColorId, ColorId, ColorId, ColorId]

export interface Feedback {
  exact: number
  colorOnly: number
}

export interface SubmittedGuess {
  code: Code
  feedback: Feedback
}

export type GameStatus = "playing" | "won" | "lost"

export interface GameState {
  secret: Code
  currentGuess: ColorId[]
  history: SubmittedGuess[]
  status: GameStatus
}

