import { useState, type KeyboardEvent } from "react";
import { landingRow } from "../domain/engine";
import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  type Board,
  type Move,
} from "../domain/types";

interface ConnectFourBoardProps {
  readonly board: Board;
  readonly lastMove: Move | null;
  readonly disabled: boolean;
  readonly onDrop: (column: number) => void;
}

export function ConnectFourBoard({
  board,
  lastMove,
  disabled,
  onDrop,
}: ConnectFourBoardProps) {
  const [activeColumn, setActiveColumn] = useState(3);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const offset = event.key === "ArrowLeft" ? -1 : 1;
      setActiveColumn((column) =>
        Math.max(0, Math.min(BOARD_COLUMNS - 1, column + offset)),
      );
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && !disabled) {
      event.preventDefault();
      onDrop(activeColumn);
    }
  }

  return (
    <div
      className="connect-four-board-wrap"
      role="application"
      aria-label="四子棋棋盘。使用左右方向键选择列，回车或空格落子"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="connect-four-column-actions" aria-label="选择落子列">
        {Array.from({ length: BOARD_COLUMNS }, (_, column) => {
          const full = landingRow(board, column) === null;
          return (
            <button
              key={column}
              type="button"
              aria-label={`第 ${column + 1} 列${full ? "，已满" : ""}`}
              disabled={disabled || full}
              data-active={activeColumn === column ? "" : undefined}
              onFocus={() => setActiveColumn(column)}
              onPointerEnter={() => setActiveColumn(column)}
              onClick={() => onDrop(column)}
            >
              <span aria-hidden="true">{column + 1}</span>
            </button>
          );
        })}
      </div>
      <div className="connect-four-grid" aria-hidden="true">
        {Array.from({ length: BOARD_ROWS * BOARD_COLUMNS }, (_, index) => {
          const player = board[index];
          return (
            <div className="connect-four-cell" key={index}>
              {player ? (
                <span
                  className="connect-four-disc"
                  data-player={player}
                  data-last={lastMove?.index === index ? "" : undefined}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
