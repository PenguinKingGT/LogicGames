import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { deriveClues } from "../domain/clues";
import type { GameAction, GameState } from "../app/game-reducer";
import type { Tool } from "../domain/types";
import type { SoundCue } from "../audio/sounds";

interface PuzzleBoardProps {
  state: GameState;
  tool: Tool;
  dispatch: (action: GameAction) => void;
  onSound: (cue: SoundCue) => void;
}

const stateLabels = { unknown: "未标记", filled: "已填充", crossed: "已标空" } as const;
const getNow = () => performance.now();

export function PuzzleBoard({ state, tool, dispatch, onSound }: PuzzleBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const activePointer = useRef<number | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const clues = useMemo(() => deriveClues(state.puzzle), [state.puzzle]);
  const solution = state.puzzle.solution;
  const rowSolved = useMemo(() => solution.map((row, rowIndex) =>
    [...row].every((cell, column) => (state.marks[rowIndex * state.puzzle.width + column] === "filled") === (cell === "#"))),
  [solution, state.marks, state.puzzle.width]);
  const columnSolved = useMemo(() => Array.from({ length: state.puzzle.width }, (_, column) =>
    solution.every((row, rowIndex) => (state.marks[rowIndex * state.puzzle.width + column] === "filled") === (row[column] === "#"))),
  [solution, state.marks, state.puzzle.width]);

  const endStroke = useCallback(() => {
    if (activePointer.current === null) return;
    activePointer.current = null;
    dispatch({ type: "end-stroke", now: getNow() });
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener("pointerup", endStroke);
    window.addEventListener("pointercancel", endStroke);
    return () => {
      window.removeEventListener("pointerup", endStroke);
      window.removeEventListener("pointercancel", endStroke);
    };
  }, [endStroke]);

  const begin = (index: number, event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 && event.button !== 2) return;
    event.preventDefault();
    activePointer.current = event.pointerId;
    boardRef.current?.setPointerCapture?.(event.pointerId);
    const selectedTool = event.button === 2 ? "crossed" : tool;
    onSound(state.marks[index] === selectedTool ? "erase" : selectedTool === "filled" ? "fill" : selectedTool === "crossed" ? "cross" : "erase");
    dispatch({
      type: "begin-stroke",
      index,
      tool: selectedTool,
      now: getNow(),
    });
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== event.pointerId) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-cell-index]");
    if (!target || !boardRef.current?.contains(target)) return;
    const index = Number(target.dataset.cellIndex);
    if (Number.isInteger(index)) dispatch({ type: "paint-cell", index });
  };

  const moveFocus = (index: number, rowDelta: number, columnDelta: number) => {
    const row = Math.floor(index / state.puzzle.width);
    const column = index % state.puzzle.width;
    const nextRow = Math.max(0, Math.min(state.puzzle.height - 1, row + rowDelta));
    const nextColumn = Math.max(0, Math.min(state.puzzle.width - 1, column + columnDelta));
    const next = nextRow * state.puzzle.width + nextColumn;
    setFocusIndex(next);
    requestAnimationFrame(() => {
      boardRef.current?.querySelector<HTMLButtonElement>(`[data-cell-index="${next}"]`)?.focus();
    });
  };

  const style = {
    "--board-width": state.puzzle.width,
    "--board-height": state.puzzle.height,
  } as CSSProperties;

  return (
    <div className="puzzle-frame" data-size={state.puzzle.width}>
      <div
        ref={boardRef}
        className="puzzle-layout"
        style={style}
        role="grid"
        aria-label={`${state.puzzle.width} 乘 ${state.puzzle.height} 数织棋盘`}
        onContextMenu={(event) => event.preventDefault()}
        onPointerMove={move}
      >
        <div className="clue-corner" aria-hidden="true">
          <span>{state.puzzle.width}</span>
        </div>
        <div className="column-clues" aria-label="列线索">
          {clues.columns.map((line, column) => (
            <div key={column} id={`nonogram-column-${column}`} className="column-clue" data-solved={columnSolved[column]}>
              {(line.length ? line : [0]).map((clue, index) => <span key={index}>{clue}</span>)}
            </div>
          ))}
        </div>
        <div className="row-clues" aria-label="行线索">
          {clues.rows.map((line, row) => (
            <div key={row} id={`nonogram-row-${row}`} className="row-clue" data-solved={rowSolved[row]}>
              {(line.length ? line : [0]).map((clue, index) => <span key={index}>{clue}</span>)}
            </div>
          ))}
        </div>
        <div className="nonogram-cells" role="rowgroup">
          {state.marks.map((mark, index) => {
            const row = Math.floor(index / state.puzzle.width);
            const column = index % state.puzzle.width;
            return (
              <button
                key={index}
                type="button"
                role="gridcell"
                className="nonogram-cell"
                data-cell-index={index}
                data-state={mark}
                data-major-row={(row + 1) % 5 === 0}
                data-major-column={(column + 1) % 5 === 0}
                tabIndex={focusIndex === index ? 0 : -1}
                aria-label={`第 ${row + 1} 行，第 ${column + 1} 列，${stateLabels[mark]}`}
                aria-describedby={`nonogram-row-${row} nonogram-column-${column}`}
                onFocus={() => setFocusIndex(index)}
                onPointerDown={(event) => begin(index, event)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowLeft") moveFocus(index, 0, -1);
                  else if (event.key === "ArrowRight") moveFocus(index, 0, 1);
                  else if (event.key === "ArrowUp") moveFocus(index, -1, 0);
                  else if (event.key === "ArrowDown") moveFocus(index, 1, 0);
                  else if (event.key === "Enter" || event.key === " ") {
                    onSound(state.marks[index] === tool ? "erase" : tool === "filled" ? "fill" : tool === "crossed" ? "cross" : "erase");
                    dispatch({ type: "begin-stroke", index, tool, now: getNow() });
                    dispatch({ type: "end-stroke", now: getNow() });
                  } else return;
                  event.preventDefault();
                }}
              >
                {mark === "crossed" ? <span aria-hidden="true">×</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
