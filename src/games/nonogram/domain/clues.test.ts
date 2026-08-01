import { describe, expect, it } from "vitest";
import { deriveClues, deriveLineClue, matchesSolution } from "./clues";
import type { PuzzleDefinition } from "./types";

const rectangle: PuzzleDefinition = {
  id: "fixture",
  name: "fixture",
  difficulty: "easy",
  width: 3,
  height: 2,
  solution: ["##.", ".#."],
};

describe("Nonogram clues", () => {
  it.each([
    [[true, true, true], [3]],
    [[false, true, true, false, true, false], [2, 1]],
    [[false, false, false], []],
    [[true, false, false], [1]],
    [[false, false, true], [1]],
  ] as const)("derives line runs", (line, expected) => {
    expect(deriveLineClue(line)).toEqual(expected);
  });

  it("derives row and column clues for a rectangle", () => {
    expect(deriveClues(rectangle)).toEqual({
      width: 3,
      height: 2,
      rows: [[2], [1]],
      columns: [[1], [2], []],
    });
  });

  it("matches filled cells exactly while ignoring crosses", () => {
    expect(matchesSolution(["filled", "filled", "crossed", "unknown", "filled", "crossed"], rectangle)).toBe(true);
    expect(matchesSolution(["filled", "unknown", "crossed", "unknown", "filled", "crossed"], rectangle)).toBe(false);
    expect(matchesSolution(["filled", "filled", "filled", "unknown", "filled", "crossed"], rectangle)).toBe(false);
  });
});

