import { Cat } from "@phosphor-icons/react";
import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { BOARD_CELLS, cellId, sameCell } from "../domain/grid";
import { BOARD_SIZE, type Coordinate } from "../domain/types";
import type { GameState } from "../app/game-reducer";

type CustomStyle = CSSProperties & Record<`--${string}`, string | number>;

function horizontalPosition(cell: Coordinate): number {
  return cell.col + (cell.row % 2 === 0 ? 0 : 0.5);
}

function cellStyle(cell: Coordinate): CSSProperties {
  return {
    left: `${((horizontalPosition(cell) + 0.5) / (BOARD_SIZE + 0.5)) * 100}%`,
    top: `${((cell.row + 0.5) / BOARD_SIZE) * 100}%`,
  };
}

function catMotionStyle(state: GameState): CustomStyle {
  return {
    ...cellStyle(state.cat),
    "--cat-from-x": `${(horizontalPosition(state.previousCat) - horizontalPosition(state.cat)) * 100}%`,
    "--cat-from-y": `${(state.previousCat.row - state.cat.row) * 100}%`,
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(BOARD_SIZE - 1, value));
}

export function CatBoard({
  state,
  assetsReady,
  onBlock,
}: {
  readonly state: GameState;
  readonly assetsReady: boolean;
  readonly onBlock: (cell: Coordinate) => void;
}) {
  const blocked = useMemo(() => new Set(state.blocked), [state.blocked]);
  const [focused, setFocused] = useState<Coordinate>({ row: 5, col: 5 });
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const moving = state.phase === "moving";
  const caption = !assetsReady
    ? "小猫热身中"
    : state.phase === "moving"
      ? "小猫正在找出口"
      : state.phase === "won"
        ? "已经圈住小猫"
        : state.phase === "lost"
          ? "小猫已经走到边缘"
          : "点一个绿色圆点封住去路";

  const moveFocus = (next: Coordinate) => {
    const safe = { row: clamp(next.row), col: clamp(next.col) };
    setFocused(safe);
    window.requestAnimationFrame(() => buttons.current.get(cellId(safe))?.focus());
  };

  const handleKey = (event: KeyboardEvent<HTMLButtonElement>, cell: Coordinate) => {
    if (event.key === "ArrowLeft") moveFocus({ row: cell.row, col: cell.col - 1 });
    else if (event.key === "ArrowRight") moveFocus({ row: cell.row, col: cell.col + 1 });
    else if (event.key === "ArrowUp") moveFocus({ row: cell.row - 1, col: cell.col });
    else if (event.key === "ArrowDown") moveFocus({ row: cell.row + 1, col: cell.col });
    else if (event.key === " " || event.key === "Enter") onBlock(cell);
    else return;
    event.preventDefault();
  };

  return (
    <section className="circle-cat-board-wrap" aria-label="游戏棋盘">
      <div className="circle-cat-board" role="grid" aria-label="11 乘 11 圈小猫棋盘" aria-busy={moving}>
        {Array.from({ length: BOARD_SIZE }, (_, row) => (
          <div key={row} role="row" className="circle-cat-board-row">
            {BOARD_CELLS.slice(row * BOARD_SIZE, (row + 1) * BOARD_SIZE).map((cell) => {
              const id = cellId(cell);
              const isBlocked = blocked.has(id);
              const hasCat = sameCell(cell, state.cat);
              const stateLabel = hasCat ? "小猫所在" : isBlocked ? "已封锁" : "空位";
              return (
                <button
                  key={id}
                  ref={(node) => { if (node) buttons.current.set(id, node); else buttons.current.delete(id); }}
                  type="button"
                  role="gridcell"
                  className="circle-cat-cell"
                  style={cellStyle(cell)}
                  data-state={hasCat ? "cat" : isBlocked ? "blocked" : "open"}
                  aria-label={`${cell.row + 1} 行 ${cell.col + 1} 列，${stateLabel}`}
                  aria-disabled={moving || isBlocked || hasCat || !assetsReady}
                  tabIndex={sameCell(cell, focused) ? 0 : -1}
                  onFocus={() => setFocused(cell)}
                  onKeyDown={(event) => handleKey(event, cell)}
                  onClick={() => onBlock(cell)}
                >
                  <span aria-hidden="true" />
                </button>
              );
            })}
          </div>
        ))}

        <div className="circle-cat-token" style={catMotionStyle(state)} aria-hidden="true">
          <div
            className="circle-cat-visual"
            data-moving={moving}
            data-facing={horizontalPosition(state.cat) < horizontalPosition(state.previousCat) ? "left" : "right"}
          >
            <Cat className="circle-cat-fallback" weight="fill" />
            <span className="circle-cat-sprite-frame" />
          </div>
        </div>
      </div>
      <p className="circle-cat-board-caption" aria-live="polite">{caption}</p>
    </section>
  );
}
