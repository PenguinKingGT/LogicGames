import { describe, expect, it } from "vitest";
import { deriveClues } from "./clues";
import { difficultySizes, puzzles } from "./puzzles";
import { countSolutions } from "./solver";

describe("Nonogram puzzle pack", () => {
  it("contains at least one hundred unique puzzles for every size", () => {
    expect(puzzles.length).toBeGreaterThanOrEqual(300);
    expect(new Set(puzzles.map((puzzle) => puzzle.id)).size).toBe(puzzles.length);
    expect(new Set(puzzles.map((puzzle) => `${puzzle.difficulty}:${puzzle.solution.join("/")}`)).size)
      .toBe(puzzles.length);
    for (const difficulty of ["easy", "normal", "hard"] as const) {
      expect(puzzles.filter((puzzle) => puzzle.difficulty === difficulty).length).toBeGreaterThanOrEqual(100);
    }
  });

  it.each(puzzles)("validates $id and proves it has one solution", (puzzle) => {
    const size = difficultySizes[puzzle.difficulty];
    expect(puzzle.width).toBe(size);
    expect(puzzle.height).toBe(size);
    expect(puzzle.solution).toHaveLength(size);
    expect(puzzle.solution.every((row) => row.length === size && /^[.#]+$/.test(row))).toBe(true);
    const joined = puzzle.solution.join("");
    expect(joined).toContain("#");
    expect(joined).toContain(".");
    const clues = deriveClues(puzzle);
    expect(clues.rows).toHaveLength(size);
    expect(clues.columns).toHaveLength(size);
    expect(countSolutions(clues)).toBe(1);
  });
});
