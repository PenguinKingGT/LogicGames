import { BOARD_SIZE, type Coordinate } from "./types";

export function cellId({ row, col }: Coordinate): string {
  return `r${row}-c${col}`;
}

export function sameCell(left: Coordinate, right: Coordinate): boolean {
  return left.row === right.row && left.col === right.col;
}

export function isInBounds({ row, col }: Coordinate): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function isEdge({ row, col }: Coordinate): boolean {
  return row === 0 || col === 0 || row === BOARD_SIZE - 1 || col === BOARD_SIZE - 1;
}

export function neighbors({ row, col }: Coordinate): readonly Coordinate[] {
  const diagonalOffset = row % 2 === 0 ? -1 : 0;
  return [
    { row, col: col - 1 },
    { row, col: col + 1 },
    { row: row - 1, col: col + diagonalOffset },
    { row: row - 1, col: col + diagonalOffset + 1 },
    { row: row + 1, col: col + diagonalOffset },
    { row: row + 1, col: col + diagonalOffset + 1 },
  ].filter(isInBounds);
}

export const BOARD_CELLS: readonly Coordinate[] = Array.from(
  { length: BOARD_SIZE * BOARD_SIZE },
  (_, index) => ({ row: Math.floor(index / BOARD_SIZE), col: index % BOARD_SIZE }),
);

