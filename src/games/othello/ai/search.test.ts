import { describe, expect, it } from "vitest";
import { applyMove, createInitialBoard, getLegalMoves } from "../domain/board";
import { chooseMove } from "./search";

describe("Othello AI", () => {
  it("always chooses a legal opening move at every difficulty", () => {
    const board = createInitialBoard();
    const legal = getLegalMoves(board, "black").map((move) => move.index);
    for (const difficulty of ["easy", "normal", "hard"] as const) {
      expect(legal).toContain(
        chooseMove(board, "black", difficulty, { random: 0, timeBudgetMs: 50 })!
          .index,
      );
    }
  });

  it("prefers an available corner", () => {
    const board = createInitialBoard();
    const openingMove = applyMove(board, "black", 19);
    expect(openingMove).not.toBeNull();
    expect(
      chooseMove(openingMove?.board ?? board, "white", "normal")?.index,
    ).toBeTypeOf("number");
  });

  it("preserves a completed hard iteration when timing out", () => {
    let ticks = 0;
    const result = chooseMove(createInitialBoard(), "black", "hard", {
      now: () => ticks++,
      timeBudgetMs: 2,
    });
    expect(result?.timedOut).toBe(true);
    expect(
      getLegalMoves(createInitialBoard(), "black").map((move) => move.index),
    ).toContain(result?.index);
  });
});
