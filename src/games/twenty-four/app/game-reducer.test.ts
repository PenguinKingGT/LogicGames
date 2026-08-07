import { describe, expect, it } from "vitest";
import type { Puzzle } from "../domain/types";
import { createGameState, gameReducer, type GameState } from "./game-reducer";

const puzzle: Puzzle = {
  id: "test",
  difficulty: "easy",
  numbers: [1, 2, 3, 4],
};

function operate(
  state: GameState,
  leftId: string,
  operator: "add" | "subtract" | "multiply" | "divide",
  rightId: string,
): GameState {
  let next = gameReducer(state, { type: "select-card", cardId: leftId });
  next = gameReducer(next, { type: "select-operator", operator });
  return gameReducer(next, { type: "select-card", cardId: rightId });
}

describe("24 Point reducer", () => {
  it("combines cards and completes an exact solution", () => {
    let state = createGameState(puzzle, "easy", 100);
    state = operate(state, "test-0", "add", "test-1");
    const firstResultId = state.cards.at(-1)?.id ?? "";
    state = operate(state, firstResultId, "add", "test-2");
    const secondResultId = state.cards.at(-1)?.id ?? "";
    state = operate(state, secondResultId, "multiply", "test-3");
    expect(state.cards[0].value).toEqual({ numerator: 24, denominator: 1 });
    expect(state.completed).toBe(true);
  });

  it("supports undo and reset without clearing assistance", () => {
    let state = createGameState(puzzle);
    state = gameReducer(state, { type: "use-assistance" });
    state = operate(state, "test-0", "add", "test-1");
    expect(gameReducer(state, { type: "undo" }).cards).toHaveLength(4);
    state = gameReducer(state, { type: "reset" });
    expect(state.cards).toHaveLength(4);
    expect(state.assisted).toBe(true);
  });

  it("rejects division by zero without changing cards", () => {
    const zeroPuzzle: Puzzle = {
      id: "zero",
      difficulty: "easy",
      numbers: [1, 1, 3, 4],
    };
    let state = createGameState(zeroPuzzle);
    state = operate(state, "zero-0", "subtract", "zero-1");
    const zeroCardId = state.cards.at(-1)?.id ?? "";
    state = operate(state, "zero-2", "divide", zeroCardId);
    expect(state.cards).toHaveLength(3);
    expect(state.message).toContain("不能除以零");
  });
});
