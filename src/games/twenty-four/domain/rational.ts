import type { Rational } from "./types";

function greatestCommonDivisor(left: number, right: number): number {
  let first = Math.abs(left);
  let second = Math.abs(right);
  while (second !== 0) {
    [first, second] = [second, first % second];
  }
  return first || 1;
}

export function rational(numerator: number, denominator = 1): Rational {
  if (denominator === 0) throw new Error("Denominator cannot be zero");
  const sign = denominator < 0 ? -1 : 1;
  const divisor = greatestCommonDivisor(numerator, denominator);
  return {
    numerator: (numerator * sign) / divisor,
    denominator: Math.abs(denominator) / divisor,
  };
}

export function add(left: Rational, right: Rational): Rational {
  return rational(
    left.numerator * right.denominator + right.numerator * left.denominator,
    left.denominator * right.denominator,
  );
}

export function subtract(left: Rational, right: Rational): Rational {
  return rational(
    left.numerator * right.denominator - right.numerator * left.denominator,
    left.denominator * right.denominator,
  );
}

export function multiply(left: Rational, right: Rational): Rational {
  return rational(
    left.numerator * right.numerator,
    left.denominator * right.denominator,
  );
}

export function divide(left: Rational, right: Rational): Rational | null {
  if (right.numerator === 0) return null;
  return rational(
    left.numerator * right.denominator,
    left.denominator * right.numerator,
  );
}

export function equals(left: Rational, right: Rational): boolean {
  return (
    left.numerator === right.numerator && left.denominator === right.denominator
  );
}

export function formatRational(value: Rational): string {
  if (value.denominator === 1) return String(value.numerator);
  return `${value.numerator}/${value.denominator}`;
}
