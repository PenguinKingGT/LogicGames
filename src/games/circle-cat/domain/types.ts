export const BOARD_SIZE = 11;
export const CAT_START = { row: 5, col: 5 } as const;

export type Difficulty = "easy" | "normal" | "hard";
export type GamePhase = "ready" | "playing" | "moving" | "won" | "lost";

export interface Coordinate {
  readonly row: number;
  readonly col: number;
}

export interface Opening {
  readonly difficulty: Difficulty;
  readonly blocked: readonly string[];
  readonly seed: number;
}

