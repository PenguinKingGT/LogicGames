import { describe, expect, it } from "vitest";
import type { Puzzle } from "../domain/types";
import { solve } from "../domain/solver";
import { createGameState, gameReducer, type GameState } from "./game-reducer";

const puzzle = createTestPuzzle("test", [1, 2, 3, 4]);

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
    let state = createGameState(puzzle);
    state = operate(state, "test-0", "add", "test-1");
    const firstResultId = state.cards.at(-1)?.id ?? "";
    state = operate(state, firstResultId, "add", "test-2");
    const secondResultId = state.cards.at(-1)?.id ?? "";
    state = operate(state, secondResultId, "multiply", "test-3");
    expect(state.cards[0].value).toEqual({ numerator: 24, denominator: 1 });
    expect(state.completed).toBe(true);
  });

  it("supports undo and starts a new puzzle cleanly", () => {
    let state = createGameState(puzzle);
    state = operate(state, "test-0", "add", "test-1");
    expect(gameReducer(state, { type: "undo" }).cards).toHaveLength(4);
    const nextPuzzle = createTestPuzzle("next", [1, 1, 1, 8]);
    state = gameReducer(state, { type: "new-puzzle", puzzle: nextPuzzle });
    expect(state.cards).toHaveLength(4);
    expect(state.puzzle.id).toBe("next");
  });

  it("rejects division by zero without changing cards", () => {
    const zeroPuzzle = createTestPuzzle("zero", [1, 1, 3, 4]);
    let state = createGameState(zeroPuzzle);
    state = operate(state, "zero-0", "subtract", "zero-1");
    const zeroCardId = state.cards.at(-1)?.id ?? "";
    state = operate(state, "zero-2", "divide", zeroCardId);
    expect(state.cards).toHaveLength(3);
    expect(state.message).toContain("不能除以零");
  });
});

function createTestPuzzle(
  id: string,
  numbers: readonly [number, number, number, number],
): Puzzle {
  const solution = solve(numbers);
  if (!solution) throw new Error(`Expected test puzzle ${id} to be solvable`);
  return { id, numbers, solution };
}
