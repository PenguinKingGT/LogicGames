import { CODE_LENGTH, MAX_ATTEMPTS } from "@/games/mastermind/game/config"
import { createSecret, scoreGuess, toCode } from "@/games/mastermind/game/engine"
import type { Code, ColorId, GameState } from "@/games/mastermind/game/types"

export type GameAction =
  | { type: "pick-color"; color: ColorId }
  | { type: "remove-last" }
  | { type: "clear-current" }
  | { type: "submit-guess" }
  | { type: "restart"; secret?: Code }

export function createInitialState(secret: Code = createSecret()): GameState {
  return {
    secret,
    currentGuess: [],
    history: [],
    status: "playing",
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === "restart") {
    return createInitialState(action.secret)
  }

  if (state.status !== "playing") return state

  switch (action.type) {
    case "pick-color": {
      if (state.currentGuess.length >= CODE_LENGTH) return state
      return { ...state, currentGuess: [...state.currentGuess, action.color] }
    }
    case "remove-last": {
      if (state.currentGuess.length === 0) return state
      return { ...state, currentGuess: state.currentGuess.slice(0, -1) }
    }
    case "clear-current": {
      if (state.currentGuess.length === 0) return state
      return { ...state, currentGuess: [] }
    }
    case "submit-guess": {
      const code = toCode(state.currentGuess)
      if (!code) return state

      const feedback = scoreGuess(state.secret, code)
      const history = [...state.history, { code, feedback }]
      const status =
        feedback.exact === CODE_LENGTH
          ? "won"
          : history.length >= MAX_ATTEMPTS
            ? "lost"
            : "playing"

      return { ...state, currentGuess: [], history, status }
    }
  }
}

