import { describe, expect, it } from "vitest";
import { PUZZLES } from "./puzzles";
import { solve } from "./solver";

describe("24 Point solver", () => {
  it("solves a puzzle that requires a fractional intermediate value", () => {
    const solution = solve([3, 3, 8, 8]);
    expect(solution).not.toBeNull();
    expect(solution?.display).toContain("÷");
  });

  it("rejects an unsolvable tuple", () => {
    expect(solve([1, 1, 1, 1])).toBeNull();
  });

  it("verifies every bundled puzzle", () => {
    const keys = new Set<string>();
    for (const puzzle of PUZZLES) {
      expect(puzzle.numbers).toHaveLength(4);
      expect(
        puzzle.numbers.every((number) => number >= 1 && number <= 13),
      ).toBe(true);
      expect(solve(puzzle.numbers), puzzle.id).not.toBeNull();
      const key = puzzle.numbers
        .toSorted((left, right) => left - right)
        .join(",");
      expect(keys.has(key), `duplicate tuple ${key}`).toBe(false);
      keys.add(key);
    }
  });
});
