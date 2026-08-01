import { describe, expect, it } from "vitest";
import { BOARD_CELLS, cellId, isEdge, neighbors } from "./grid";

describe("circle cat grid", () => {
  it("builds 121 stable cells and detects edges", () => {
    expect(BOARD_CELLS).toHaveLength(121);
    expect(cellId({ row: 5, col: 5 })).toBe("r5-c5");
    expect(isEdge({ row: 0, col: 5 })).toBe(true);
    expect(isEdge({ row: 5, col: 5 })).toBe(false);
  });

  it("uses six offset neighbors in the center", () => {
    expect(neighbors({ row: 4, col: 5 })).toEqual([
      { row: 4, col: 4 }, { row: 4, col: 6 },
      { row: 3, col: 4 }, { row: 3, col: 5 },
      { row: 5, col: 4 }, { row: 5, col: 5 },
    ]);
    expect(neighbors({ row: 5, col: 5 })).toEqual([
      { row: 5, col: 4 }, { row: 5, col: 6 },
      { row: 4, col: 5 }, { row: 4, col: 6 },
      { row: 6, col: 5 }, { row: 6, col: 6 },
    ]);
  });

  it("clips corner neighbors to the board", () => {
    expect(neighbors({ row: 0, col: 0 })).toEqual([
      { row: 0, col: 1 }, { row: 1, col: 0 },
    ]);
  });
});

