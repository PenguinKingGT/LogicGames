export const BOARD_COLUMNS = 7;
export const BOARD_ROWS = 6;
export const CELL_COUNT = BOARD_COLUMNS * BOARD_ROWS;

export type Player = "red" | "yellow";
export type Cell = Player | null;
export type Board = readonly Cell[];
export type GameResult = Player | "draw";

export interface Move {
  readonly column: number;
  readonly row: number;
  readonly index: number;
  readonly player: Player;
}

export interface AppliedMove {
  readonly board: Board;
  readonly move: Move;
  readonly result: GameResult | null;
}
