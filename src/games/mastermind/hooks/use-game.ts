import { useCallback, useReducer } from "react"
import { createSecret } from "@/games/mastermind/game/engine"
import { createInitialState, gameReducer } from "@/games/mastermind/game/reducer"
import type { Code, ColorId } from "@/games/mastermind/game/types"

export function useGame(initialSecret?: Code) {
  const [state, dispatch] = useReducer(
    gameReducer,
    initialSecret,
    (secret) => createInitialState(secret ?? createSecret()),
  )

  const pickColor = useCallback((color: ColorId) => {
    dispatch({ type: "pick-color", color })
  }, [])
  const removeLast = useCallback(() => dispatch({ type: "remove-last" }), [])
  const clearCurrent = useCallback(() => dispatch({ type: "clear-current" }), [])
  const submitGuess = useCallback(() => dispatch({ type: "submit-guess" }), [])
  const restart = useCallback((secret?: Code) => {
    dispatch({ type: "restart", secret: secret ?? createSecret() })
  }, [])

  return { state, pickColor, removeLast, clearCurrent, submitGuess, restart }
}

