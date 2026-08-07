import { describe, expect, it } from "vitest";
import {
  applyMove,
  countDiscs,
  createInitialBoard,
  getFlips,
  getLegalMoves,
  resolveTurn,
  toIndex,
} from "./board";
import type { Board } from "./types";

describe("Othello rules", () => {
  it("creates the standard opening and four black moves", () => {
    const board = createInitialBoard();
    expect(countDiscs(board)).toEqual({ black: 2, white: 2 });
    expect(getLegalMoves(board, "black").map((move) => move.index)).toEqual([
      19, 26, 37, 44,
    ]);
  });

  it("flips every bracketed direction atomically", () => {
    const board = Array(64).fill(null) as Array<"black" | "white" | null>;
    const center = toIndex(3, 3);
    for (const [dr, dc] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ]) {
      board[toIndex(3 + dr, 3 + dc)] = "white";
      board[toIndex(3 + dr * 2, 3 + dc * 2)] = "black";
    }
    expect(getFlips(board, "black", center)).toHaveLength(8);
    const moveResult = applyMove(board, "black", center);
    expect(moveResult).not.toBeNull();
    expect(countDiscs(moveResult?.board ?? []).black).toBe(17);
    expect(board[center]).toBeNull();
  });

  it("does not flip an open-ended line or accept occupied cells", () => {
    const board = createInitialBoard();
    expect(getFlips(board, "black", 0)).toEqual([]);
    expect(applyMove(board, "black", toIndex(3, 3))).toBeNull();
  });

  it("forces a pass and ends only when neither side can move", () => {
    const passBoard = Array(64).fill("black") as Array<
      "black" | "white" | null
    >;
    passBoard[0] = null;
    passBoard[1] = "white";
    expect(resolveTurn(passBoard, "white")).toEqual({
      nextPlayer: "black",
      passed: "white",
      result: null,
    });
    const terminal = Array(64).fill("black") as Board;
    expect(resolveTurn(terminal, "white")).toEqual({
      nextPlayer: null,
      passed: null,
      result: "black",
    });
  });

  it("reports a draw", () => {
    const board = Array.from({ length: 64 }, (_, index) =>
      index % 2 ? "white" : "black",
    ) as Board;
    expect(resolveTurn(board, "black").result).toBe("draw");
  });
});
