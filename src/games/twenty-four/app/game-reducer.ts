import { applyOperator, formatExpression } from "../domain/solver";
import { equals, rational } from "../domain/rational";
import type {
  Difficulty,
  Expression,
  Operator,
  Puzzle,
  Rational,
} from "../domain/types";

export interface ExpressionCard {
  readonly id: string;
  readonly value: Rational;
  readonly expression: Expression;
}

interface RoundSnapshot {
  readonly cards: readonly ExpressionCard[];
  readonly selectedCardId: string | null;
  readonly selectedOperator: Operator | null;
}

export interface GameState {
  readonly difficulty: Difficulty;
  readonly puzzle: Puzzle;
  readonly cards: readonly ExpressionCard[];
  readonly selectedCardId: string | null;
  readonly selectedOperator: Operator | null;
  readonly history: readonly RoundSnapshot[];
  readonly assisted: boolean;
  readonly completed: boolean;
  readonly message: string;
  readonly startedAt: number;
}

export type GameAction =
  | { readonly type: "select-card"; readonly cardId: string }
  | { readonly type: "select-operator"; readonly operator: Operator }
  | { readonly type: "undo" }
  | { readonly type: "reset" }
  | { readonly type: "use-assistance" }
  | {
      readonly type: "new-puzzle";
      readonly puzzle: Puzzle;
      readonly difficulty: Difficulty;
      readonly startedAt: number;
    };

const TARGET = rational(24);

export function createGameState(
  puzzle: Puzzle,
  difficulty: Difficulty = puzzle.difficulty,
  startedAt = Date.now(),
): GameState {
  return {
    difficulty,
    puzzle,
    cards: createCards(puzzle),
    selectedCardId: null,
    selectedOperator: null,
    history: [],
    assisted: false,
    completed: false,
    message: "选择一个数字开始计算",
    startedAt,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "select-card":
      return selectCard(state, action.cardId);
    case "select-operator":
      return selectOperator(state, action.operator);
    case "undo":
      return undo(state);
    case "reset":
      return reset(state);
    case "use-assistance":
      return { ...state, assisted: true };
    case "new-puzzle":
      return createGameState(
        action.puzzle,
        action.difficulty,
        action.startedAt,
      );
  }
}

function selectCard(state: GameState, cardId: string): GameState {
  if (state.completed) return state;
  const card = state.cards.find((candidate) => candidate.id === cardId);
  if (!card) return state;

  if (!state.selectedCardId) {
    return {
      ...state,
      selectedCardId: cardId,
      message: "现在选择运算符",
    };
  }

  if (state.selectedCardId === cardId) {
    return {
      ...state,
      selectedCardId: null,
      selectedOperator: null,
      message: "已取消选择",
    };
  }

  if (!state.selectedOperator) {
    return {
      ...state,
      selectedCardId: cardId,
      message: "已更换第一个数字",
    };
  }

  return combine(state, card);
}

function selectOperator(state: GameState, operator: Operator): GameState {
  if (state.completed || !state.selectedCardId) return state;
  return {
    ...state,
    selectedOperator: operator,
    message: "选择第二个数字完成运算",
  };
}

function combine(state: GameState, rightCard: ExpressionCard): GameState {
  const leftCard = state.cards.find((card) => card.id === state.selectedCardId);
  if (!leftCard || !state.selectedOperator) return state;

  const result = applyOperator(
    state.selectedOperator,
    leftCard.value,
    rightCard.value,
  );
  if (!result) {
    return {
      ...state,
      message: "不能除以零，请换一种算法",
    };
  }

  const expression: Expression = {
    kind: "operation",
    operator: state.selectedOperator,
    left: leftCard.expression,
    right: rightCard.expression,
  };
  const nextCard: ExpressionCard = {
    id: `${leftCard.id}-${rightCard.id}-${state.history.length}`,
    value: result,
    expression,
  };
  const remainingCards = state.cards.filter(
    (card) => card.id !== leftCard.id && card.id !== rightCard.id,
  );
  const cards = [...remainingCards, nextCard];
  const completed = cards.length === 1 && equals(result, TARGET);
  return {
    ...state,
    cards,
    selectedCardId: null,
    selectedOperator: null,
    history: [
      ...state.history,
      {
        cards: state.cards,
        selectedCardId: state.selectedCardId,
        selectedOperator: state.selectedOperator,
      },
    ],
    completed,
    message: completed
      ? "漂亮，结果正好是 24"
      : `${formatExpression(expression)} = ${result.numerator}${result.denominator === 1 ? "" : `/${result.denominator}`}`,
  };
}

function undo(state: GameState): GameState {
  const snapshot = state.history.at(-1);
  if (!snapshot) return state;
  return {
    ...state,
    ...snapshot,
    history: state.history.slice(0, -1),
    completed: false,
    message: "已撤销上一步",
  };
}

function reset(state: GameState): GameState {
  return {
    ...state,
    cards: createCards(state.puzzle),
    selectedCardId: null,
    selectedOperator: null,
    history: [],
    completed: false,
    message: "本题已重置",
  };
}

function createCards(puzzle: Puzzle): readonly ExpressionCard[] {
  return puzzle.numbers.map((value, index) => {
    const sourceId = `${puzzle.id}-${index}`;
    return {
      id: sourceId,
      value: rational(value),
      expression: {
        kind: "number",
        sourceId,
        value,
      },
    };
  });
}
