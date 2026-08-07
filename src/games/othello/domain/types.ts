export type Player = "black" | "white";
export type Cell = Player | null;
export type Board = readonly Cell[];

export interface Move {
  readonly index: number;
  readonly flips: readonly number[];
}

export interface MoveResult {
  readonly board: Board;
  readonly move: Move;
}

export interface DiscCounts {
  readonly black: number;
  readonly white: number;
}

export type GameResult = "black" | "white" | "draw";

export interface TurnResolution {
  readonly nextPlayer: Player | null;
  readonly passed: Player | null;
  readonly result: GameResult | null;
}
