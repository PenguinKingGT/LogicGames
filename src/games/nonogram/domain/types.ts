export type Difficulty = "easy" | "normal" | "hard";
export type CellMark = "unknown" | "filled" | "crossed";
export type GamePhase = "ready" | "playing" | "won";
export type Tool = "filled" | "crossed" | "unknown";

export interface PuzzleDefinition {
  readonly id: string;
  readonly name: string;
  readonly difficulty: Difficulty;
  readonly width: number;
  readonly height: number;
  readonly solution: readonly string[];
}

export interface PuzzleClues {
  readonly width: number;
  readonly height: number;
  readonly rows: readonly (readonly number[])[];
  readonly columns: readonly (readonly number[])[];
}

