import { describe, expect, it } from "vitest";
import { boardValues, createOpening, hasWon, isGameOver, moveTiles, spawnTile } from "./engine";
import type { Tile } from "./types";

const row = (values: number[]): Tile[] => values.flatMap((value, col) =>
  value ? [{ id: col + 1, value, row: 0, col }] : [],
);

describe("2048 engine", () => {
  it.each([
    [[2, 2, 2, 2], [4, 4, 0, 0], 8],
    [[2, 2, 4, 0], [4, 4, 0, 0], 4],
    [[4, 4, 8, 8], [8, 16, 0, 0], 24],
  ])("merges each source tile once: %j", (input, expected, score) => {
    const result = moveTiles(row(input), "left", 20);
    expect(boardValues(result.tiles).slice(0, 4)).toEqual(expected);
    expect(result.scoreDelta).toBe(score);
  });

  it("moves in all four directions without mutating input", () => {
    const tiles: Tile[] = [{ id: 1, value: 2, row: 1, col: 1 }];
    expect(moveTiles(tiles, "left", 2).tiles[0]).toMatchObject({ row: 1, col: 0 });
    expect(moveTiles(tiles, "right", 2).tiles[0]).toMatchObject({ row: 1, col: 3 });
    expect(moveTiles(tiles, "up", 2).tiles[0]).toMatchObject({ row: 0, col: 1 });
    expect(moveTiles(tiles, "down", 2).tiles[0]).toMatchObject({ row: 3, col: 1 });
    expect(tiles[0]).toEqual({ id: 1, value: 2, row: 1, col: 1 });
  });

  it("detects no-op moves", () => {
    expect(moveTiles([{ id: 1, value: 2, row: 0, col: 0 }], "left", 2).changed).toBe(false);
  });

  it("spawns uniformly by empty index with a 90/10 value threshold", () => {
    expect(spawnTile([], 1, 0, 0.899)?.value).toBe(2);
    expect(spawnTile([], 1, 0.999, 0.9)).toMatchObject({ value: 4, row: 3, col: 3 });
    expect(createOpening(() => 0).tiles).toHaveLength(2);
  });

  it("detects victory, mergeable full boards, and terminal boards", () => {
    expect(hasWon([{ id: 1, value: 2048, row: 0, col: 0 }])).toBe(true);
    const mergeable = Array.from({ length: 16 }, (_, index) => ({
      id: index + 1, value: index < 2 ? 2 : 2 ** (index + 1), row: Math.floor(index / 4), col: index % 4,
    }));
    expect(isGameOver(mergeable)).toBe(false);
    const values = [2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 8];
    const terminal = values.map((value, index) => ({ id: index + 1, value, row: Math.floor(index / 4), col: index % 4 }));
    expect(isGameOver(terminal)).toBe(true);
  });
});
