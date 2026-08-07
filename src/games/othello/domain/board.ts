import type {
  Board,
  DiscCounts,
  GameResult,
  Move,
  MoveResult,
  Player,
  TurnResolution,
} from "./types";

export const BOARD_SIZE = 8;
export const CELL_COUNT = 64;
const DIRECTIONS = [-1, 0, 1]
  .flatMap((row) => [-1, 0, 1].map((col) => [row, col] as const))
  .filter(([row, col]) => row !== 0 || col !== 0);

export function opponent(player: Player): Player {
  return player === "black" ? "white" : "black";
}
export function toIndex(row: number, col: number): number {
  return row * BOARD_SIZE + col;
}
export function toCoordinate(index: number): { row: number; col: number } {
  return { row: Math.floor(index / BOARD_SIZE), col: index % BOARD_SIZE };
}
function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function createInitialBoard(): Board {
  const board = Array<null | Player>(CELL_COUNT).fill(null);
  board[toIndex(3, 3)] = "white";
  board[toIndex(3, 4)] = "black";
  board[toIndex(4, 3)] = "black";
  board[toIndex(4, 4)] = "white";
  return board;
}

export function getFlips(
  board: Board,
  player: Player,
  index: number,
): number[] {
  if (index < 0 || index >= CELL_COUNT || board[index] !== null) return [];
  const { row, col } = toCoordinate(index);
  const enemy = opponent(player);
  const flips: number[] = [];
  for (const [rowStep, colStep] of DIRECTIONS) {
    const line: number[] = [];
    let nextRow = row + rowStep;
    let nextCol = col + colStep;
    while (
      inBounds(nextRow, nextCol) &&
      board[toIndex(nextRow, nextCol)] === enemy
    ) {
      line.push(toIndex(nextRow, nextCol));
      nextRow += rowStep;
      nextCol += colStep;
    }
    if (
      line.length > 0 &&
      inBounds(nextRow, nextCol) &&
      board[toIndex(nextRow, nextCol)] === player
    ) {
      flips.push(...line);
    }
  }
  return flips;
}

export function getLegalMoves(board: Board, player: Player): Move[] {
  const moves: Move[] = [];
  for (let index = 0; index < CELL_COUNT; index += 1) {
    const flips = getFlips(board, player, index);
    if (flips.length > 0) moves.push({ index, flips });
  }
  return moves;
}

export function applyMove(
  board: Board,
  player: Player,
  index: number,
): MoveResult | null {
  const flips = getFlips(board, player, index);
  if (flips.length === 0) return null;
  const next = [...board];
  next[index] = player;
  for (const flip of flips) next[flip] = player;
  return { board: next, move: { index, flips } };
}

export function countDiscs(board: Board): DiscCounts {
  let black = 0;
  let white = 0;
  for (const cell of board) {
    if (cell === "black") black += 1;
    if (cell === "white") white += 1;
  }
  return { black, white };
}

export function getResult(board: Board): GameResult {
  const counts = countDiscs(board);
  if (counts.black === counts.white) return "draw";
  return counts.black > counts.white ? "black" : "white";
}

export function resolveTurn(board: Board, preferred: Player): TurnResolution {
  if (getLegalMoves(board, preferred).length > 0) {
    return { nextPlayer: preferred, passed: null, result: null };
  }

  const otherPlayer = opponent(preferred);
  if (getLegalMoves(board, otherPlayer).length > 0) {
    return { nextPlayer: otherPlayer, passed: preferred, result: null };
  }

  return { nextPlayer: null, passed: null, result: getResult(board) };
}
