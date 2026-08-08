import { describe, expect, it } from "vitest";
import {
  createBoard,
  dropDisc,
  getLegalColumns,
  landingRow,
} from "./engine";
import type { Player } from "./types";

const WIN_CASES: readonly (readonly [readonly number[], string])[] = [
  [[0, 1, 2, 3], "horizontal"],
  [[0, 0, 0, 0], "vertical"],
  [[0, 1, 1, 2, 6, 2, 2, 3, 6, 3, 6, 3, 3], "rising diagonal"],
  [[3, 2, 2, 1, 6, 1, 1, 0, 6, 0, 6, 0, 0], "falling diagonal"],
];

describe("Connect Four engine", () => {
  it("drops discs to the lowest free row without mutating the board", () => {
    const board = createBoard();
    const first = dropDisc(board, 3, "red");
    const second = first ? dropDisc(first.board, 3, "yellow") : null;
    expect(first?.move.row).toBe(5);
    expect(second?.move.row).toBe(4);
    expect(board.every((cell) => cell === null)).toBe(true);
  });

  it("rejects invalid and full columns", () => {
    let board = createBoard();
    for (let move = 0; move < 6; move += 1) {
      board = requireMove(
        dropDisc(board, 0, move % 2 === 0 ? "red" : "yellow"),
      ).board;
    }
    expect(landingRow(board, 0)).toBeNull();
    expect(dropDisc(board, 0, "red")).toBeNull();
    expect(dropDisc(board, -1, "red")).toBeNull();
    expect(getLegalColumns(board)).not.toContain(0);
  });

  it.each(WIN_CASES)("detects a %s winning line", (columns) => {
    let board = createBoard();
    let result = null;
    for (const column of columns) {
      const applied = dropDisc(board, column, "red");
      expect(applied).not.toBeNull();
      board = requireMove(applied).board;
      result = requireMove(applied).result;
    }
    expect(result).toBe("red");
  });

  it("recognizes a full-board draw on the final move", () => {
    const columns = [
      5, 3, 4, 4, 2, 5, 4, 0, 3, 6, 5, 5, 4, 1, 1, 0, 5, 6, 4, 3, 2,
      6, 6, 5, 6, 0, 6, 2, 1, 3, 2, 1, 0, 1, 2, 3, 2, 4, 0, 1, 3, 0,
    ];
    let board = createBoard();
    let finalResult = null;
    for (let index = 0; index < columns.length; index += 1) {
      const player: Player = index % 2 === 0 ? "red" : "yellow";
      const applied = requireMove(dropDisc(board, columns[index], player));
      board = applied.board;
      finalResult = applied.result;
    }
    expect(getLegalColumns(board)).toEqual([]);
    expect(finalResult).toBe("draw");
  });
});

function requireMove(move: ReturnType<typeof dropDisc>) {
  if (!move) throw new Error("Expected a legal move");
  return move;
}
