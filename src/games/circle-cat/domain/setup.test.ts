import { describe, expect, it } from "vitest";
import { createOpening, BLOCKER_COUNTS, createRandom, isPlayableOpening } from "./setup";

describe("circle cat setup", () => {
  it("creates deterministic playable openings for every difficulty", () => {
    for (const difficulty of ["easy", "normal", "hard"] as const) {
      for (let seed = 0; seed < 50; seed += 1) {
        const opening = createOpening(difficulty, seed);
        expect(opening.blocked).toHaveLength(BLOCKER_COUNTS[difficulty]);
        expect(new Set(opening.blocked).size).toBe(opening.blocked.length);
        expect(isPlayableOpening(opening.blocked)).toBe(true);
        expect(createOpening(difficulty, seed)).toEqual(opening);
      }
    }
  });

  it("provides reproducible unit random values", () => {
    const first = createRandom(42);
    const second = createRandom(42);
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
    expect(first()).toBeGreaterThanOrEqual(0);
    expect(first()).toBeLessThan(1);
  });
});

