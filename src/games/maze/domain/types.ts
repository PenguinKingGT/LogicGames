export const STANDARD_MAZE_SIZE = 15;
export const COMPLEX_MAZE_SIZE = 25;
export type MazeMode = "standard" | "complex";

export type Direction = "up" | "right" | "down" | "left";

export interface Coordinate {
  readonly row: number;
  readonly col: number;
}

export interface Maze {
  readonly size: number;
  readonly passages: readonly number[];
  readonly start: Coordinate;
  readonly exit: Coordinate;
  readonly signature: string;
}

export const DIRECTIONS: readonly Direction[] = ["up", "right", "down", "left"];

const DIRECTION_BITS: Readonly<Record<Direction, number>> = {
  up: 1,
  right: 2,
  down: 4,
  left: 8,
};

const DIRECTION_OFFSETS: Readonly<Record<Direction, Coordinate>> = {
  up: { row: -1, col: 0 },
  right: { row: 0, col: 1 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
};

const OPPOSITES: Readonly<Record<Direction, Direction>> = {
  up: "down",
  right: "left",
  down: "up",
  left: "right",
};

export function coordinateId(
  coordinate: Coordinate,
  size = STANDARD_MAZE_SIZE,
): number {
  return coordinate.row * size + coordinate.col;
}

export function coordinateFromId(
  id: number,
  size = STANDARD_MAZE_SIZE,
): Coordinate {
  return {
    row: Math.floor(id / size),
    col: id % size,
  };
}

export function isInBounds(
  coordinate: Coordinate,
  size = STANDARD_MAZE_SIZE,
): boolean {
  return (
    coordinate.row >= 0 &&
    coordinate.row < size &&
    coordinate.col >= 0 &&
    coordinate.col < size
  );
}

export function neighbor(
  coordinate: Coordinate,
  direction: Direction,
): Coordinate {
  const offset = DIRECTION_OFFSETS[direction];
  return {
    row: coordinate.row + offset.row,
    col: coordinate.col + offset.col,
  };
}

export function opposite(direction: Direction): Direction {
  return OPPOSITES[direction];
}

export function directionBit(direction: Direction): number {
  return DIRECTION_BITS[direction];
}

export function hasPassage(
  maze: Maze,
  coordinate: Coordinate,
  direction: Direction,
): boolean {
  const passages = maze.passages[coordinateId(coordinate, maze.size)] ?? 0;
  return (passages & directionBit(direction)) !== 0;
}

export function sameCoordinate(left: Coordinate, right: Coordinate): boolean {
  return left.row === right.row && left.col === right.col;
}
