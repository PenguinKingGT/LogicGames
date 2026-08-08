import type { Difficulty } from "../ai/search";
import { createBoard, dropDisc, getLegalColumns, otherPlayer } from "../domain/engine";
import type { Board, GameResult, Move, Player } from "../domain/types";

export type GamePhase =
  | "human-turn"
  | "dropping-human"
  | "ai-thinking"
  | "dropping-ai"
  | "finished";

interface UndoSnapshot {
  readonly board: Board;
}

export interface GameState {
  readonly board: Board;
  readonly phase: GamePhase;
  readonly humanPlayer: Player;
  readonly difficulty: Difficulty;
  readonly result: GameResult | null;
  readonly lastMove: Move | null;
  readonly roundId: number;
  readonly turnId: number;
  readonly undo: UndoSnapshot | null;
  readonly fallbackUsed: boolean;
}

export type GameAction =
  | { readonly type: "human-drop"; readonly column: number }
  | { readonly type: "finish-human-drop"; readonly roundId: number; readonly turnId: number }
  | {
      readonly type: "ai-drop";
      readonly column: number;
      readonly roundId: number;
      readonly turnId: number;
      readonly fallback?: boolean;
    }
  | { readonly type: "finish-ai-drop"; readonly roundId: number; readonly turnId: number }
  | {
      readonly type: "new-game";
      readonly roundId: number;
      readonly humanPlayer?: Player;
      readonly difficulty?: Difficulty;
    }
  | { readonly type: "undo" };

export function createGameState(
  humanPlayer: Player = "red",
  difficulty: Difficulty = "normal",
  roundId = 1,
): GameState {
  return {
    board: createBoard(),
    phase: humanPlayer === "red" ? "human-turn" : "ai-thinking",
    humanPlayer,
    difficulty,
    result: null,
    lastMove: null,
    roundId,
    turnId: 0,
    undo: null,
    fallbackUsed: false,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === "new-game") {
    return createGameState(
      action.humanPlayer ?? state.humanPlayer,
      action.difficulty ?? state.difficulty,
      action.roundId,
    );
  }
  if (action.type === "undo") return undoExchange(state);
  if (action.type === "human-drop") return applyHumanDrop(state, action.column);
  if (action.type === "finish-human-drop") {
    if (!matchesPending(state, "dropping-human", action)) return state;
    return state.result
      ? { ...state, phase: "finished", lastMove: null }
      : { ...state, phase: "ai-thinking", lastMove: null };
  }
  if (action.type === "ai-drop") return applyAiDrop(state, action);
  if (!matchesPending(state, "dropping-ai", action)) return state;
  return state.result
    ? { ...state, phase: "finished", lastMove: null }
    : { ...state, phase: "human-turn", lastMove: null };
}

function applyHumanDrop(state: GameState, column: number): GameState {
  if (state.phase !== "human-turn") return state;
  const applied = dropDisc(state.board, column, state.humanPlayer);
  if (!applied) return state;
  return {
    ...state,
    board: applied.board,
    phase: "dropping-human",
    result: applied.result,
    lastMove: applied.move,
    turnId: state.turnId + 1,
    undo: { board: state.board },
    fallbackUsed: false,
  };
}

function applyAiDrop(
  state: GameState,
  action: Extract<GameAction, { type: "ai-drop" }>,
): GameState {
  if (
    state.phase !== "ai-thinking" ||
    action.roundId !== state.roundId ||
    action.turnId !== state.turnId
  ) {
    return state;
  }
  const legalColumns = getLegalColumns(state.board);
  const selectedColumn = legalColumns.includes(action.column)
    ? action.column
    : legalColumns[0];
  if (selectedColumn === undefined) {
    return { ...state, phase: "finished", result: "draw" };
  }
  const applied = dropDisc(
    state.board,
    selectedColumn,
    otherPlayer(state.humanPlayer),
  );
  if (!applied) return state;
  return {
    ...state,
    board: applied.board,
    phase: "dropping-ai",
    result: applied.result,
    lastMove: applied.move,
    turnId: state.turnId + 1,
    fallbackUsed: Boolean(action.fallback || selectedColumn !== action.column),
  };
}

function undoExchange(state: GameState): GameState {
  if (!state.undo || (state.phase !== "human-turn" && state.phase !== "finished")) {
    return state;
  }
  return {
    ...state,
    board: state.undo.board,
    phase: "human-turn",
    result: null,
    lastMove: null,
    turnId: state.turnId + 1,
    undo: null,
    fallbackUsed: false,
  };
}

function matchesPending(
  state: GameState,
  phase: GamePhase,
  action: { readonly roundId: number; readonly turnId: number },
): boolean {
  return (
    state.phase === phase &&
    state.roundId === action.roundId &&
    state.turnId === action.turnId
  );
}
