import {
  BOARD_SIZE,
  countDiscs,
  getLegalMoves,
  opponent,
  toCoordinate,
} from "../domain/board";
import type { Board, Player } from "../domain/types";

const POSITION_WEIGHTS = [
  120, -28, 18, 8, 8, 18, -28, 120, -28, -45, -6, -4, -4, -6, -45, -28, 18, -6,
  12, 2, 2, 12, -6, 18, 8, -4, 2, 1, 1, 2, -4, 8, 8, -4, 2, 1, 1, 2, -4, 8, 18,
  -6, 12, 2, 2, 12, -6, 18, -28, -45, -6, -4, -4, -6, -45, -28, 120, -28, 18, 8,
  8, 18, -28, 120,
] as const;
const AROUND = [-1, 0, 1]
  .flatMap((r) => [-1, 0, 1].map((c) => [r, c] as const))
  .filter(([r, c]) => r || c);

function getParityWeight(occupiedCount: number): number {
  if (occupiedCount >= 52) return 9;
  if (occupiedCount >= 44) return 3;
  return 1;
}

function isFrontierDisc(board: Board, row: number, col: number): boolean {
  return AROUND.some(([rowOffset, colOffset]) => {
    const adjacentRow = row + rowOffset;
    const adjacentCol = col + colOffset;
    return (
      adjacentRow >= 0 &&
      adjacentRow < BOARD_SIZE &&
      adjacentCol >= 0 &&
      adjacentCol < BOARD_SIZE &&
      board[adjacentRow * BOARD_SIZE + adjacentCol] === null
    );
  });
}

export function evaluate(board: Board, player: Player): number {
  const enemy = opponent(player);
  const counts = countDiscs(board);
  const occupied = counts.black + counts.white;
  const discDifference =
    player === "black"
      ? counts.black - counts.white
      : counts.white - counts.black;
  const mobility =
    getLegalMoves(board, player).length - getLegalMoves(board, enemy).length;
  let positional = 0;
  let frontier = 0;
  for (let index = 0; index < board.length; index += 1) {
    const cell = board[index];
    if (!cell) continue;
    const sign = cell === player ? 1 : -1;
    positional += (POSITION_WEIGHTS[index] ?? 0) * sign;
    const { row, col } = toCoordinate(index);
    if (isFrontierDisc(board, row, col)) frontier += sign;
  }
  const parityWeight = getParityWeight(occupied);
  return (
    positional * 3 +
    mobility * 14 -
    frontier * 4 +
    discDifference * parityWeight
  );
}
