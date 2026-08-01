import { describe, expect, it } from "vitest";
import { createSeededRandom, makeSeed } from "./rng";

describe("seeded random", () => {
  it("returns repeatable values in the unit interval", () => {
    const first = createSeededRandom("poly");
    const second = createSeededRandom("poly");
    const values = Array.from({ length: 8 }, () => first());
    expect(values).toEqual(Array.from({ length: 8 }, () => second()));
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
  });

  it("creates non-empty session seeds", () => {
    expect(makeSeed()).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
  });
});
