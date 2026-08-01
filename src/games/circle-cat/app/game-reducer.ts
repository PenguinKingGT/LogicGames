import { cellId, isEdge, isInBounds, sameCell } from "../domain/grid";
import { chooseCatStep } from "../domain/pathfinding";
import { CAT_START, type Coordinate, type GamePhase, type Opening } from "../domain/types";

export interface GameState {
  readonly difficulty: Opening["difficulty"];
  readonly blocked: readonly string[];
  readonly cat: Coordinate;
  readonly previousCat: Coordinate;
  readonly moves: number;
  readonly phase: GamePhase;
  readonly escapePending: boolean;
  readonly roundId: number;
}

export type GameAction =
  | { readonly type: "block"; readonly cell: Coordinate; readonly randomValue: number }
  | { readonly type: "finish-move"; readonly roundId: number }
  | { readonly type: "new-round"; readonly opening: Opening; readonly roundId: number };

export function createGameState(opening: Opening, roundId = 1): GameState {
  return {
    difficulty: opening.difficulty,
    blocked: [...opening.blocked],
    cat: CAT_START,
    previousCat: CAT_START,
    moves: 0,
    phase: "ready",
    escapePending: false,
    roundId,
  };
}

export function canBlock(state: GameState, cell: Coordinate): boolean {
  return (state.phase === "ready" || state.phase === "playing")
    && isInBounds(cell)
    && !sameCell(state.cat, cell)
    && !state.blocked.includes(cellId(cell));
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === "new-round") return createGameState(action.opening, action.roundId);

  if (action.type === "finish-move") {
    if (state.phase !== "moving" || action.roundId !== state.roundId) return state;
    return {
      ...state,
      phase: state.escapePending ? "lost" : "playing",
      escapePending: false,
    };
  }

  if (!canBlock(state, action.cell)) return state;
  const blocked = [...state.blocked, cellId(action.cell)];
  const destination = chooseCatStep(state.cat, new Set(blocked), action.randomValue);
  if (!destination) {
    return {
      ...state,
      blocked,
      moves: state.moves + 1,
      phase: "won",
      escapePending: false,
    };
  }

  return {
    ...state,
    blocked,
    previousCat: state.cat,
    cat: destination,
    moves: state.moves + 1,
    phase: "moving",
    escapePending: isEdge(destination),
  };
}
