import { describe, expect, it } from "vitest";
import { countSolutions, generateLinePatterns } from "./solver";

describe("Nonogram solver", () => {
  it("generates line patterns with required spacing", () => {
    expect(generateLinePatterns(5, [2, 1])).toHaveLength(3);
    expect(generateLinePatterns(3, [])).toEqual([[false, false, false]]);
    expect(generateLinePatterns(3, [2, 2])).toEqual([]);
  });

  it("counts a unique rectangular puzzle", () => {
    expect(countSolutions({ width: 3, height: 2, rows: [[2], [1]], columns: [[1], [2], []] })).toBe(1);
  });

  it("caps an ambiguous puzzle at two solutions", () => {
    expect(countSolutions({ width: 2, height: 2, rows: [[1], [1]], columns: [[1], [1]] })).toBe(2);
  });

  it("returns zero for impossible clues", () => {
    expect(countSolutions({ width: 2, height: 1, rows: [[2]], columns: [[], []] })).toBe(0);
  });
});

