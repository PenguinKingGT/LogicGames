import { createOpening, hasWon, isGameOver, moveTiles, spawnTile } from "../domain/engine";
import type { Direction, Tile, TileMotion } from "../domain/types";

export type GamePhase = "ready" | "playing" | "animating" | "won" | "continued" | "lost";

export interface UndoSnapshot {
  readonly tiles: readonly Tile[];
  readonly score: number;
  readonly victoryAcknowledged: boolean;
}

export interface GameState {
  readonly tiles: readonly Tile[];
  readonly score: number;
  readonly bestScore: number;
  readonly phase: GamePhase;
  readonly victoryAcknowledged: boolean;
  readonly undo: UndoSnapshot | null;
  readonly motions: readonly TileMotion[];
  readonly roundId: number;
  readonly moveId: number;
  readonly nextTileId: number;
  readonly moves: number;
}

export type GameAction =
  | { readonly type: "move"; readonly direction: Direction; readonly randomPosition: number; readonly randomValue: number }
  | { readonly type: "finish-animation"; readonly roundId: number; readonly moveId: number }
  | { readonly type: "new-round"; readonly tiles: readonly Tile[]; readonly nextTileId: number; readonly roundId: number }
  | { readonly type: "hydrate"; readonly state: GameState }
  | { readonly type: "continue" }
  | { readonly type: "undo" };

export function createGameState(random: () => number = Math.random, bestScore = 0, roundId = 1): GameState {
  const opening = createOpening(random);
  return {
    ...opening, score: 0, bestScore, phase: "ready", victoryAcknowledged: false,
    undo: null, motions: [], roundId, moveId: 0, moves: 0,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === "hydrate") return action.state;
  if (action.type === "new-round") {
    return {
      tiles: action.tiles, nextTileId: action.nextTileId, score: 0, bestScore: state.bestScore,
      phase: "ready", victoryAcknowledged: false, undo: null, motions: [], roundId: action.roundId,
      moveId: 0, moves: 0,
    };
  }
  if (action.type === "continue") {
    return state.phase === "won" ? { ...state, phase: "continued", victoryAcknowledged: true } : state;
  }
  if (action.type === "undo") {
    if (!state.undo || state.phase === "animating") return state;
    return {
      ...state,
      tiles: state.undo.tiles,
      score: state.undo.score,
      phase: state.undo.victoryAcknowledged ? "continued" : "playing",
      victoryAcknowledged: state.undo.victoryAcknowledged,
      undo: null,
      motions: [],
      moveId: state.moveId + 1,
      moves: Math.max(0, state.moves - 1),
    };
  }
  if (action.type === "finish-animation") {
    if (state.phase !== "animating" || action.roundId !== state.roundId || action.moveId !== state.moveId) return state;
    const won = !state.victoryAcknowledged && hasWon(state.tiles);
    const phase: GamePhase = won ? "won" : isGameOver(state.tiles) ? "lost" : state.victoryAcknowledged ? "continued" : "playing";
    return {
      ...state,
      phase,
      motions: [],
      tiles: state.tiles.map((tile) => ({ id: tile.id, value: tile.value, row: tile.row, col: tile.col })),
    };
  }
  if (state.phase === "animating" || state.phase === "won" || state.phase === "lost") return state;
  const moved = moveTiles(state.tiles, action.direction, state.nextTileId);
  if (!moved.changed) return state;
  const spawned = spawnTile(moved.tiles, moved.nextTileId, action.randomPosition, action.randomValue);
  const tiles = spawned ? [...moved.tiles, spawned] : moved.tiles;
  const score = state.score + moved.scoreDelta;
  return {
    ...state,
    tiles,
    score,
    bestScore: Math.max(state.bestScore, score),
    phase: "animating",
    undo: { tiles: state.tiles, score: state.score, victoryAcknowledged: state.victoryAcknowledged },
    motions: moved.motions,
    nextTileId: moved.nextTileId + (spawned ? 1 : 0),
    moveId: state.moveId + 1,
    moves: state.moves + 1,
  };
}
