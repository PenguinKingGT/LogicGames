import { formatRational } from "../domain/rational";
import { formatExpression } from "../domain/solver";
import type { ExpressionCard } from "../app/game-reducer";
import type { Operator } from "../domain/types";

const OPERATORS: readonly { operator: Operator; label: string }[] = [
  { operator: "add", label: "+" },
  { operator: "subtract", label: "−" },
  { operator: "multiply", label: "×" },
  { operator: "divide", label: "÷" },
];

interface GameWorkspaceProps {
  readonly cards: readonly ExpressionCard[];
  readonly selectedCardId: string | null;
  readonly selectedOperator: Operator | null;
  readonly message: string;
  readonly onCardSelect: (cardId: string) => void;
  readonly onOperatorSelect: (operator: Operator) => void;
}

export function GameWorkspace({
  cards,
  selectedCardId,
  selectedOperator,
  message,
  onCardSelect,
  onOperatorSelect,
}: GameWorkspaceProps) {
  return (
    <section className="twenty-four-workspace" aria-label="计算区域">
      <div className="twenty-four-target" aria-hidden="true">
        <span>目标</span>
        <strong>24</strong>
      </div>

      <div className="twenty-four-cards" aria-label="数字卡片">
        {cards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            className="twenty-four-number-card"
            data-selected={card.id === selectedCardId || undefined}
            aria-pressed={card.id === selectedCardId}
            aria-label={`数字卡片 ${formatRational(card.value)}`}
            onClick={() => onCardSelect(card.id)}
          >
            <span className="twenty-four-card-index">0{index + 1}</span>
            <strong>{formatRational(card.value)}</strong>
            <small>{formatCardExpression(card)}</small>
          </button>
        ))}
      </div>

      <div className="twenty-four-operators" aria-label="选择运算符">
        {OPERATORS.map(({ operator, label }) => (
          <button
            key={operator}
            type="button"
            disabled={!selectedCardId}
            aria-label={`运算符 ${label}`}
            aria-pressed={operator === selectedOperator}
            onClick={() => onOperatorSelect(operator)}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="twenty-four-live" aria-live="polite">
        {message}
      </p>
    </section>
  );
}

function formatCardExpression(card: ExpressionCard): string {
  if (card.expression.kind === "number") return "原始数字";
  return formatExpression(card.expression);
}
