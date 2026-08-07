import { useMemo, useRef, type KeyboardEvent, type PointerEvent } from "react";
import {
  DIRECTIONS,
  coordinateFromId,
  coordinateId,
  hasPassage,
  sameCoordinate,
  type Coordinate,
  type Direction,
  type Maze,
} from "../domain/types";

const SWIPE_THRESHOLD = 24;
const KEY_DIRECTIONS: Readonly<Record<string, Direction | undefined>> = {
  ArrowUp: "up",
  w: "up",
  W: "up",
  ArrowRight: "right",
  d: "right",
  D: "right",
  ArrowDown: "down",
  s: "down",
  S: "down",
  ArrowLeft: "left",
  a: "left",
  A: "left",
};

interface MazeBoardProps {
  readonly maze: Maze;
  readonly player: Coordinate;
  readonly visitedIds: readonly number[];
  readonly onMove: (direction: Direction) => void;
}

export function MazeBoard({
  maze,
  player,
  visitedIds,
  onMove,
}: MazeBoardProps) {
  const pointerStart = useRef<Coordinate | null>(null);
  const visited = useMemo(() => new Set(visitedIds), [visitedIds]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    const direction = KEY_DIRECTIONS[event.key];
    if (!direction) return;
    event.preventDefault();
    onMove(direction);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>): void {
    pointerStart.current = { row: event.clientY, col: event.clientX };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>): void {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const horizontal = event.clientX - start.col;
    const vertical = event.clientY - start.row;
    const direction = swipeDirection(horizontal, vertical);
    if (direction) onMove(direction);
  }

  return (
    <div
      className="maze-board"
      role="application"
      aria-label={`${maze.size} 乘 ${maze.size} 迷宫。使用方向键、WASD 或滑动移动`}
      data-size={maze.size}
      data-maze-signature={maze.signature}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
    >
      {Array.from({ length: maze.size * maze.size }, (_, id) => {
        const coordinate = coordinateFromId(id, maze.size);
        const isPlayer = sameCoordinate(coordinate, player);
        const isExit = sameCoordinate(coordinate, maze.exit);
        return (
          <span
            key={id}
            className="maze-cell"
            data-open={openDirections(maze, coordinate)}
            data-visited={visited.has(id) || undefined}
            data-start={id === coordinateId(maze.start, maze.size) || undefined}
            data-exit={isExit || undefined}
          >
            {isExit ? (
              <i className="maze-exit-mark" role="img" aria-label="出口">
                E
              </i>
            ) : null}
            {isPlayer ? (
              <i
                className="maze-player-mark"
                role="img"
                aria-label={`当前位置，第 ${coordinate.row + 1} 行第 ${coordinate.col + 1} 列`}
              />
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

function openDirections(maze: Maze, coordinate: Coordinate): string {
  return DIRECTIONS.filter((direction) =>
    hasPassage(maze, coordinate, direction),
  )
    .map((direction) => direction[0])
    .join("");
}

function swipeDirection(
  horizontal: number,
  vertical: number,
): Direction | null {
  if (Math.max(Math.abs(horizontal), Math.abs(vertical)) < SWIPE_THRESHOLD) {
    return null;
  }
  if (Math.abs(horizontal) > Math.abs(vertical)) {
    return horizontal > 0 ? "right" : "left";
  }
  return vertical > 0 ? "down" : "up";
}
