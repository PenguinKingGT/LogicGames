import { describe, expect, it } from "vitest";
import { createBoard, dropDisc, getLegalColumns } from "../domain/engine";
import type { Board, Player } from "../domain/types";
import { chooseMove } from "./search";

describe("Connect Four AI", () => {
  it("takes an immediate win", () => {
    const board = play([0, 6, 1, 6, 2], "red");
    expect(chooseMove(board, "red", "easy")?.column).toBe(3);
  });

  it("blocks an immediate opponent win", () => {
    const board = play([0, 6, 1, 6, 2], "yellow");
    expect(chooseMove(board, "yellow", "easy")?.column).toBe(3);
  });

  it("uses injected randomness on easy boards", () => {
    expect(chooseMove(createBoard(), "red", "easy", { random: 0 })?.column).toBe(3);
    expect(chooseMove(createBoard(), "red", "easy", { random: 0.999 })?.column).toBe(6);
  });

  it.each(["normal", "hard"] as const)("returns a legal move on %s", (difficulty) => {
    const board = play([3, 3, 2, 4, 2, 4], "red");
    const selected = chooseMove(board, "red", difficulty, { timeBudgetMs: 2_000 });
    expect(getLegalColumns(board)).toContain(selected?.column);
  });

  it("returns the last completed iteration when time expires", () => {
    let tick = 0;
    const selected = chooseMove(createBoard(), "red", "hard", {
      timeBudgetMs: 3,
      now: () => tick++,
    });
    expect(selected?.column).toBe(3);
  });
});

function play(columns: readonly number[], first: Player): Board {
  let board = createBoard();
  let player = first;
  for (const column of columns) {
    const applied = dropDisc(board, column, player);
    if (!applied) throw new Error("Expected fixture move to be legal");
    board = applied.board;
    player = player === "red" ? "yellow" : "red";
  }
  return board;
}
