import { describe, expect, it } from "vitest"
import { createInitialState, gameReducer } from "@/games/mastermind/game/reducer"
import type { Code, GameState } from "@/games/mastermind/game/types"

const secret: Code = ["coral", "amber", "mint", "blue"]

function select(state: GameState, colors: Code): GameState {
  return colors.reduce(
    (next, color) => gameReducer(next, { type: "pick-color", color }),
    state,
  )
}

describe("gameReducer", () => {
  it("picks at most four colors", () => {
    const full = select(createInitialState(secret), secret)
    expect(gameReducer(full, { type: "pick-color", color: "violet" })).toBe(full)
  })

  it("removes the latest color", () => {
    const state = gameReducer(createInitialState(secret), {
      type: "pick-color",
      color: "coral",
    })
    expect(gameReducer(state, { type: "remove-last" }).currentGuess).toEqual([])
  })

  it("keeps identity when removing from empty", () => {
    const state = createInitialState(secret)
    expect(gameReducer(state, { type: "remove-last" })).toBe(state)
  })

  it("clears the current guess", () => {
    const state = gameReducer(createInitialState(secret), {
      type: "pick-color",
      color: "coral",
    })
    expect(gameReducer(state, { type: "clear-current" }).currentGuess).toEqual([])
  })

  it("keeps identity for incomplete submission", () => {
    const state = createInitialState(secret)
    expect(gameReducer(state, { type: "submit-guess" })).toBe(state)
  })

  it("submits a valid guess", () => {
    const state = select(createInitialState(secret), ["violet", "violet", "violet", "violet"])
    const next = gameReducer(state, { type: "submit-guess" })
    expect(next.history).toHaveLength(1)
    expect(next.currentGuess).toEqual([])
    expect(next.status).toBe("playing")
  })

  it("wins with the exact code", () => {
    const state = select(createInitialState(secret), secret)
    expect(gameReducer(state, { type: "submit-guess" }).status).toBe("won")
  })

  it("checks victory before the final-attempt loss", () => {
    const miss = {
      code: ["violet", "violet", "violet", "violet"] as Code,
      feedback: { exact: 0, colorOnly: 0 },
    }
    const state = select(
      { ...createInitialState(secret), history: Array(9).fill(miss) },
      secret,
    )
    expect(gameReducer(state, { type: "submit-guess" }).status).toBe("won")
  })

  it("loses after the tenth miss", () => {
    const miss = {
      code: ["violet", "violet", "violet", "violet"] as Code,
      feedback: { exact: 0, colorOnly: 0 },
    }
    const state = select(
      { ...createInitialState(secret), history: Array(9).fill(miss) },
      miss.code,
    )
    expect(gameReducer(state, { type: "submit-guess" }).status).toBe("lost")
  })

  it("ignores gameplay actions after a terminal state", () => {
    const state = { ...createInitialState(secret), status: "won" as const }
    expect(gameReducer(state, { type: "pick-color", color: "coral" })).toBe(state)
  })

  it("restarts with a clean state and provided secret", () => {
    const nextSecret: Code = ["blue", "blue", "blue", "blue"]
    const state = { ...createInitialState(secret), status: "lost" as const }
    expect(gameReducer(state, { type: "restart", secret: nextSecret })).toEqual(
      createInitialState(nextSecret),
    )
  })
})
