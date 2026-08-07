import {
  applyMove,
  countDiscs,
  createInitialBoard,
  getLegalMoves,
  opponent,
  resolveTurn,
} from "../domain/board";
import type {
  Board,
  DiscCounts,
  GameResult,
  Move,
  Player,
} from "../domain/types";
import type { Difficulty } from "../ai/search";

export type GamePhase =
  | "human-turn"
  | "animating-human"
  | "ai-thinking"
  | "animating-ai"
  | "finished";
export interface UndoSnapshot {
  readonly board: Board;
  readonly turnId: number;
}
export interface GameState {
  readonly board: Board;
  readonly phase: GamePhase;
  readonly currentPlayer: Player | null;
  readonly counts: DiscCounts;
  readonly result: GameResult | null;
  readonly difficulty: Difficulty;
  readonly humanPlayer: Player;
  readonly lastMove: Move | null;
  readonly passed: Player | null;
  readonly roundId: number;
  readonly turnId: number;
  readonly undo: UndoSnapshot | null;
  readonly fallbackUsed: boolean;
}
export type GameAction =
  | { readonly type: "human-move"; readonly index: number }
  | {
      readonly type: "finish-human-animation";
      readonly roundId: number;
      readonly turnId: number;
    }
  | {
      readonly type: "ai-move";
      readonly index: number;
      readonly roundId: number;
      readonly turnId: number;
      readonly fallback?: boolean;
    }
  | {
      readonly type: "finish-ai-animation";
      readonly roundId: number;
      readonly turnId: number;
    }
  | {
      readonly type: "new-game";
      readonly difficulty?: Difficulty;
      readonly humanPlayer?: Player;
      readonly roundId: number;
    }
  | { readonly type: "undo" };

export function createGameState(
  difficulty: Difficulty = "normal",
  roundId = 1,
  humanPlayer: Player = "black",
): GameState {
  const board = createInitialBoard();
  return {
    board,
    phase: humanPlayer === "black" ? "human-turn" : "ai-thinking",
    currentPlayer: "black",
    counts: countDiscs(board),
    result: null,
    difficulty,
    humanPlayer,
    lastMove: null,
    passed: null,
    roundId,
    turnId: 0,
    undo: null,
    fallbackUsed: false,
  };
}

function completeTurn(state: GameState, preferred: Player): GameState {
  const resolution = resolveTurn(state.board, preferred);
  if (resolution.result) {
    return {
      ...state,
      phase: "finished",
      currentPlayer: null,
      result: resolution.result,
      passed: null,
      counts: countDiscs(state.board),
    };
  }

  return {
    ...state,
    phase:
      resolution.nextPlayer === state.humanPlayer
        ? "human-turn"
        : "ai-thinking",
    currentPlayer: resolution.nextPlayer,
    passed: resolution.passed,
    lastMove: null,
    counts: countDiscs(state.board),
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === "new-game") {
    return createGameState(
      action.difficulty ?? state.difficulty,
      action.roundId,
      action.humanPlayer ?? state.humanPlayer,
    );
  }

  if (action.type === "undo") {
    if (
      !state.undo ||
      state.phase === "ai-thinking" ||
      state.phase === "animating-human" ||
      state.phase === "animating-ai"
    ) {
      return state;
    }

    return {
      ...state,
      board: state.undo.board,
      counts: countDiscs(state.undo.board),
      phase: "human-turn",
      currentPlayer: state.humanPlayer,
      result: null,
      lastMove: null,
      passed: null,
      turnId: state.turnId + 1,
      undo: null,
      fallbackUsed: false,
    };
  }
  if (action.type === "human-move") {
    if (state.phase !== "human-turn") return state;
    const applied = applyMove(state.board, state.humanPlayer, action.index);
    if (!applied) return state;
    return {
      ...state,
      board: applied.board,
      counts: countDiscs(applied.board),
      phase: "animating-human",
      currentPlayer: state.humanPlayer,
      lastMove: applied.move,
      passed: null,
      turnId: state.turnId + 1,
      undo: {
        board: state.board,
        turnId: state.turnId,
      },
      fallbackUsed: false,
    };
  }
  if (action.type === "finish-human-animation") {
    if (
      state.phase !== "animating-human" ||
      action.roundId !== state.roundId ||
      action.turnId !== state.turnId
    ) {
      return state;
    }

    return completeTurn(state, opponent(state.humanPlayer));
  }
  if (action.type === "ai-move") {
    if (
      state.phase !== "ai-thinking" ||
      action.roundId !== state.roundId ||
      action.turnId !== state.turnId
    ) {
      return state;
    }

    const aiPlayer = opponent(state.humanPlayer);
    const legalMoves = getLegalMoves(state.board, aiPlayer);
    const selectedIndex = legalMoves.some((move) => move.index === action.index)
      ? action.index
      : legalMoves[0]?.index;
    if (selectedIndex === undefined) {
      return completeTurn(state, state.humanPlayer);
    }

    const appliedMove = applyMove(state.board, aiPlayer, selectedIndex);
    if (!appliedMove) return state;

    return {
      ...state,
      board: appliedMove.board,
      counts: countDiscs(appliedMove.board),
      phase: "animating-ai",
      currentPlayer: aiPlayer,
      lastMove: appliedMove.move,
      passed: null,
      turnId: state.turnId + 1,
      fallbackUsed: Boolean(action.fallback || selectedIndex !== action.index),
    };
  }
  if (
    state.phase !== "animating-ai" ||
    action.roundId !== state.roundId ||
    action.turnId !== state.turnId
  ) {
    return state;
  }

  return completeTurn(state, state.humanPlayer);
}
