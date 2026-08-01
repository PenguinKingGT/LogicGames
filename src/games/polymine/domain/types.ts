export type GeometryKind = "square" | "triangle" | "hex";
export type Difficulty = "easy" | "normal" | "hard";
export type CellId = string;
export type CellState = "hidden" | "flagged" | "revealed";
export type GamePhase = "ready" | "playing" | "paused" | "won" | "lost";

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface BoardConfig {
  readonly geometry: GeometryKind;
  readonly difficulty: Difficulty;
  readonly mines: number;
  readonly rows?: number;
  readonly columns?: number;
  readonly radius?: number;
}

export interface CellSnapshot {
  readonly id: CellId;
  readonly state: CellState;
  readonly adjacentMines: number | null;
  readonly isMineVisible: boolean;
  readonly isTriggeredMine: boolean;
  readonly isWrongFlag: boolean;
}

export interface GameSnapshot {
  readonly phase: GamePhase;
  readonly config: BoardConfig;
  readonly seed: string;
  readonly elapsedMs: number;
  readonly mineCount: number;
  readonly flagCount: number;
  readonly safeRemaining: number;
  readonly cells: ReadonlyMap<CellId, CellSnapshot>;
}

export type SoundCue =
  | "reveal"
  | "cascade"
  | "flag-on"
  | "flag-off"
  | "invalid"
  | "mine"
  | "win";

export interface GameEffect {
  readonly type: "sound";
  readonly cue: SoundCue;
}

export interface ActionResult {
  readonly changed: boolean;
  readonly effects: readonly GameEffect[];
}

