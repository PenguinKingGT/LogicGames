import type { Board, Player } from "../domain/types";
import type { Difficulty, SearchResult } from "./search";
export interface AiRequest {
  readonly type: "choose-move";
  readonly board: Board;
  readonly player: Player;
  readonly difficulty: Difficulty;
  readonly roundId: number;
  readonly turnId: number;
  readonly random: number;
}
export interface AiResponse {
  readonly type: "move";
  readonly roundId: number;
  readonly turnId: number;
  readonly result: SearchResult | null;
}
