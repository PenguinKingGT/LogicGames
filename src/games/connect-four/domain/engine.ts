import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  CELL_COUNT,
  type AppliedMove,
  type Board,
  type Player,
} from "./types";

const WIN_LENGTH = 4;
const LINE_DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const;

export function createBoard(): Board {
  return Array<null>(CELL_COUNT).fill(null);
}

export function cellIndex(row: number, column: number): number {
  return row * BOARD_COLUMNS + column;
}

export function otherPlayer(player: Player): Player {
  return player === "red" ? "yellow" : "red";
}

export function getLegalColumns(board: Board): readonly number[] {
  const columns: number[] = [];
  for (let column = 0; column < BOARD_COLUMNS; column += 1) {
    if (board[cellIndex(0, column)] === null) columns.push(column);
  }
  return columns;
}

export function landingRow(board: Board, column: number): number | null {
  if (!Number.isInteger(column) || column < 0 || column >= BOARD_COLUMNS) {
    return null;
  }
  for (let row = BOARD_ROWS - 1; row >= 0; row -= 1) {
    if (board[cellIndex(row, column)] === null) return row;
  }
  return null;
}

export function dropDisc(
  board: Board,
  column: number,
  player: Player,
): AppliedMove | null {
  const row = landingRow(board, column);
  if (row === null) return null;
  const index = cellIndex(row, column);
  const nextBoard = [...board];
  nextBoard[index] = player;
  const move = { column, row, index, player } as const;
  const result = hasWinningLine(nextBoard, row, column, player)
    ? player
    : getLegalColumns(nextBoard).length === 0
      ? "draw"
      : null;
  return { board: nextBoard, move, result };
}

export function hasWinningLine(
  board: Board,
  row: number,
  column: number,
  player: Player,
): boolean {
  return LINE_DIRECTIONS.some(([rowStep, columnStep]) => {
    const forward = countDirection(
      board,
      row,
      column,
      rowStep,
      columnStep,
      player,
    );
    const backward = countDirection(
      board,
      row,
      column,
      -rowStep,
      -columnStep,
      player,
    );
    return 1 + forward + backward >= WIN_LENGTH;
  });
}

function countDirection(
  board: Board,
  startRow: number,
  startColumn: number,
  rowStep: number,
  columnStep: number,
  player: Player,
): number {
  let count = 0;
  let row = startRow + rowStep;
  let column = startColumn + columnStep;
  while (
    row >= 0 &&
    row < BOARD_ROWS &&
    column >= 0 &&
    column < BOARD_COLUMNS &&
    board[cellIndex(row, column)] === player
  ) {
    count += 1;
    row += rowStep;
    column += columnStep;
  }
  return count;
}
