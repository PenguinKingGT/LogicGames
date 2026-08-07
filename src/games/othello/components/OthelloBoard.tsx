import { useState, type KeyboardEvent } from "react";
import { getLegalMoves, toCoordinate } from "../domain/board";
import type { Board, Cell } from "../domain/types";

const COLUMN_LABELS = "ABCDEFGH".split("");

interface OthelloBoardProps {
  readonly board: Board;
  readonly interactive: boolean;
  readonly lastIndex?: number;
  readonly flipped: readonly number[];
  readonly onMove: (index: number) => void;
}

function getCellLabel(
  cell: Cell,
  index: number,
  flipCount: number | undefined,
  canMove: boolean,
): string {
  const { row, col } = toCoordinate(index);
  const coordinate = `${String.fromCharCode(65 + col)}${row + 1}`;

  if (cell === "black") return `${coordinate}，黑棋`;
  if (cell === "white") return `${coordinate}，白棋`;
  if (canMove) return `${coordinate}，可落子，翻转 ${flipCount} 枚`;
  return `${coordinate}，空位`;
}

export function OthelloBoard({
  board,
  interactive,
  lastIndex,
  flipped,
  onMove,
}: OthelloBoardProps) {
  const legalMoves = new Map(
    getLegalMoves(board, "black").map((move) => [
      move.index,
      move.flips.length,
    ]),
  );
  const [focusIndex, setFocusIndex] = useState(19);

  const keyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const { row, col } = toCoordinate(index);
    let nextIndex = index;

    if (event.key === "ArrowUp") nextIndex = Math.max(0, row - 1) * 8 + col;
    else if (event.key === "ArrowDown")
      nextIndex = Math.min(7, row + 1) * 8 + col;
    else if (event.key === "ArrowLeft")
      nextIndex = row * 8 + Math.max(0, col - 1);
    else if (event.key === "ArrowRight")
      nextIndex = row * 8 + Math.min(7, col + 1);
    else return;

    event.preventDefault();
    setFocusIndex(nextIndex);
    document
      .querySelector<HTMLButtonElement>(`[data-othello-index="${nextIndex}"]`)
      ?.focus();
  };

  return (
    <div className="othello-board-wrap">
      <div className="othello-columns" aria-hidden="true">
        {COLUMN_LABELS.map((letter) => (
          <span key={letter}>{letter}</span>
        ))}
      </div>

      <div className="othello-board" role="grid" aria-label="8 乘 8 黑白棋棋盘">
        {board.map((cell, index) => {
          const flipCount = legalMoves.get(index);
          const canMove = interactive && flipCount !== undefined;

          return (
            <button
              key={index}
              type="button"
              role="gridcell"
              data-othello-index={index}
              data-last={index === lastIndex || undefined}
              data-legal={canMove || undefined}
              tabIndex={index === focusIndex ? 0 : -1}
              aria-label={getCellLabel(cell, index, flipCount, canMove)}
              onFocus={() => setFocusIndex(index)}
              onKeyDown={(event) => keyDown(event, index)}
              onClick={() => {
                if (canMove) onMove(index);
              }}
              disabled={!interactive && !cell}
            >
              {cell ? (
                <span
                  className={`othello-disc ${cell}`}
                  data-placed={index === lastIndex || undefined}
                  data-flipped={flipped.includes(index) || undefined}
                >
                  <span />
                </span>
              ) : null}
              {canMove ? (
                <span className="othello-legal">
                  <b>{flipCount}</b>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
