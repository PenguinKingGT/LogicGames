import { describe, expect, it } from "vitest";
import {
  add,
  divide,
  equals,
  formatRational,
  multiply,
  rational,
  subtract,
} from "./rational";

describe("rational arithmetic", () => {
  it("normalizes signs and common factors", () => {
    expect(rational(8, -12)).toEqual({ numerator: -2, denominator: 3 });
    expect(rational(0, 9)).toEqual({ numerator: 0, denominator: 1 });
  });

  it("calculates all operations exactly", () => {
    const oneThird = rational(1, 3);
    const twoThirds = rational(2, 3);
    expect(add(oneThird, twoThirds)).toEqual(rational(1));
    expect(subtract(oneThird, twoThirds)).toEqual(rational(-1, 3));
    expect(multiply(oneThird, twoThirds)).toEqual(rational(2, 9));
    expect(divide(oneThird, twoThirds)).toEqual(rational(1, 2));
    expect(divide(oneThird, rational(0))).toBeNull();
  });

  it("compares and formats normalized values", () => {
    expect(equals(rational(48, 2), rational(24))).toBe(true);
    expect(formatRational(rational(-6, 8))).toBe("-3/4");
    expect(() => rational(1, 0)).toThrow("Denominator cannot be zero");
  });
});
