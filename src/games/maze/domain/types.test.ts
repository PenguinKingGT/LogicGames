import { describe, expect, it } from "vitest";
import {
  COMPLEX_MAZE_SIZE,
  DIRECTIONS,
  STANDARD_MAZE_SIZE,
  coordinateFromId,
  coordinateId,
  isInBounds,
  neighbor,
  opposite,
} from "./types";

describe("maze coordinates", () => {
  it("round-trips every cell identifier", () => {
    for (const size of [STANDARD_MAZE_SIZE, COMPLEX_MAZE_SIZE]) {
      for (let id = 0; id < size * size; id += 1) {
        expect(coordinateId(coordinateFromId(id, size), size)).toBe(id);
      }
    }
  });

  it("maps all direction opposites symmetrically", () => {
    for (const direction of DIRECTIONS) {
      expect(opposite(opposite(direction))).toBe(direction);
    }
  });

  it("detects bounds and orthogonal neighbors", () => {
    expect(isInBounds({ row: 0, col: 0 })).toBe(true);
    expect(isInBounds({ row: -1, col: 0 })).toBe(false);
    expect(isInBounds({ row: 24, col: 24 }, COMPLEX_MAZE_SIZE)).toBe(true);
    expect(neighbor({ row: 4, col: 4 }, "right")).toEqual({ row: 4, col: 5 });
  });
});
