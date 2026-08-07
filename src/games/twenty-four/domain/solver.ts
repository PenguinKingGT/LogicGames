import { add, divide, equals, multiply, rational, subtract } from "./rational";
import type { Expression, Operator, Rational, Solution } from "./types";

interface Candidate {
  readonly value: Rational;
  readonly expression: Expression;
}

const TARGET = rational(24);
const OPERATOR_SYMBOLS: Readonly<Record<Operator, string>> = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷",
};

export function applyOperator(
  operator: Operator,
  left: Rational,
  right: Rational,
): Rational | null {
  switch (operator) {
    case "add":
      return add(left, right);
    case "subtract":
      return subtract(left, right);
    case "multiply":
      return multiply(left, right);
    case "divide":
      return divide(left, right);
  }
}

export function formatExpression(expression: Expression): string {
  if (expression.kind === "number") return String(expression.value);
  return `(${formatExpression(expression.left)} ${OPERATOR_SYMBOLS[expression.operator]} ${formatExpression(expression.right)})`;
}

export function solve(numbers: readonly number[]): Solution | null {
  const candidates = numbers.map<Candidate>((value, index) => ({
    value: rational(value),
    expression: {
      kind: "number",
      sourceId: `source-${index}`,
      value,
    },
  }));
  const expression = search(candidates, new Set<string>());
  if (!expression) return null;
  return {
    expression,
    display: trimOuterParentheses(formatExpression(expression)),
  };
}

function search(
  candidates: readonly Candidate[],
  visited: Set<string>,
): Expression | null {
  if (candidates.length === 1) {
    return equals(candidates[0].value, TARGET)
      ? candidates[0].expression
      : null;
  }

  const stateKey = candidates
    .map(({ value }) => `${value.numerator}/${value.denominator}`)
    .toSorted()
    .join("|");
  if (visited.has(stateKey)) return null;
  visited.add(stateKey);

  for (let leftIndex = 0; leftIndex < candidates.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < candidates.length;
      rightIndex += 1
    ) {
      const left = candidates[leftIndex];
      const right = candidates[rightIndex];
      const remaining = candidates.filter(
        (_, index) => index !== leftIndex && index !== rightIndex,
      );
      for (const combined of combineCandidates(left, right)) {
        const result = search([...remaining, combined], visited);
        if (result) return result;
      }
    }
  }
  return null;
}

function combineCandidates(
  left: Candidate,
  right: Candidate,
): readonly Candidate[] {
  const operations: readonly [Operator, Candidate, Candidate][] = [
    ["add", left, right],
    ["multiply", left, right],
    ["subtract", left, right],
    ["subtract", right, left],
    ["divide", left, right],
    ["divide", right, left],
  ];

  return operations.flatMap(([operator, first, second]) => {
    const value = applyOperator(operator, first.value, second.value);
    if (!value) return [];
    return [
      {
        value,
        expression: {
          kind: "operation",
          operator,
          left: first.expression,
          right: second.expression,
        },
      },
    ];
  });
}

function trimOuterParentheses(display: string): string {
  return display.slice(1, -1);
}
