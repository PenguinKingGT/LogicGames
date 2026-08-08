import type { Difficulty, SearchResult } from "./search";
import type { Board, Player } from "../domain/types";

export interface AiRequest {
  readonly type: "choose-move";
  readonly board: Board;
  readonly player: Player;
  readonly difficulty: Difficulty;
  readonly random: number;
  readonly roundId: number;
  readonly turnId: number;
}

export interface AiResponse {
  readonly type: "move-selected";
  readonly result: SearchResult | null;
  readonly roundId: number;
  readonly turnId: number;
}
