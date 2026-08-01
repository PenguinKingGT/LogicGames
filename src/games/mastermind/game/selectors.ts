import { MAX_ATTEMPTS } from "@/games/mastermind/game/config"
import type { GameState } from "@/games/mastermind/game/types"

export function selectRemainingAttempts(state: GameState): number {
  return Math.max(0, MAX_ATTEMPTS - state.history.length)
}

export function selectCanSubmit(state: GameState): boolean {
  return state.status === "playing" && state.currentGuess.length === 4
}

