export type Difficulty = "easy" | "normal" | "hard";
export type Operator = "add" | "subtract" | "multiply" | "divide";

export interface Rational {
  readonly numerator: number;
  readonly denominator: number;
}

export interface NumberExpression {
  readonly kind: "number";
  readonly sourceId: string;
  readonly value: number;
}

export interface OperationExpression {
  readonly kind: "operation";
  readonly operator: Operator;
  readonly left: Expression;
  readonly right: Expression;
}

export type Expression = NumberExpression | OperationExpression;

export interface Puzzle {
  readonly id: string;
  readonly difficulty: Difficulty;
  readonly numbers: readonly [number, number, number, number];
}

export interface Solution {
  readonly expression: Expression;
  readonly display: string;
}
