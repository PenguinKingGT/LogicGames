import { matchesSolution } from "../domain/clues";
import type { CellMark, GamePhase, PuzzleDefinition, Tool } from "../domain/types";

const HISTORY_LIMIT = 100;

export interface ActiveStroke {
  readonly mark: CellMark;
  readonly visited: ReadonlySet<number>;
}

export interface GameState {
  readonly puzzle: PuzzleDefinition;
  readonly marks: readonly CellMark[];
  readonly phase: GamePhase;
  readonly history: readonly (readonly CellMark[])[];
  readonly activeStroke: ActiveStroke | null;
  readonly startedAt: number | null;
  readonly completedElapsedMs: number;
}

export type GameAction =
  | { readonly type: "load-puzzle"; readonly puzzle: PuzzleDefinition }
  | { readonly type: "begin-stroke"; readonly index: number; readonly tool: Tool; readonly now: number }
  | { readonly type: "paint-cell"; readonly index: number }
  | { readonly type: "end-stroke"; readonly now: number }
  | { readonly type: "undo"; readonly now: number }
  | { readonly type: "restart" };

export function createInitialState(puzzle: PuzzleDefinition): GameState {
  return {
    puzzle,
    marks: Array.from({ length: puzzle.width * puzzle.height }, () => "unknown" as const),
    phase: "ready",
    history: [],
    activeStroke: null,
    startedAt: null,
    completedElapsedMs: 0,
  };
}

export function elapsedMs(state: GameState, now: number): number {
  return state.completedElapsedMs + (state.startedAt === null ? 0 : Math.max(0, now - state.startedAt));
}

function paint(marks: readonly CellMark[], index: number, mark: CellMark): readonly CellMark[] {
  if (marks[index] === mark) return marks;
  const next = [...marks];
  next[index] = mark;
  return next;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === "load-puzzle") return createInitialState(action.puzzle);
  if (action.type === "restart") return createInitialState(state.puzzle);

  if (action.type === "undo") {
    const previous = state.history.at(-1);
    if (!previous) return state;
    const allUnknown = previous.every((mark) => mark === "unknown");
    const completed = elapsedMs(state, action.now);
    return {
      ...state,
      marks: previous,
      phase: allUnknown ? "ready" : "playing",
      history: state.history.slice(0, -1),
      activeStroke: null,
      startedAt: allUnknown ? null : action.now,
      completedElapsedMs: allUnknown ? 0 : completed,
    };
  }

  if (state.phase === "won") return state;

  if (action.type === "begin-stroke") {
    if (state.activeStroke || action.index < 0 || action.index >= state.marks.length) return state;
    const requested: CellMark = action.tool;
    const effective: CellMark = state.marks[action.index] === requested ? "unknown" : requested;
    if (state.marks[action.index] === effective) return state;
    const history = [...state.history, state.marks].slice(-HISTORY_LIMIT);
    return {
      ...state,
      marks: paint(state.marks, action.index, effective),
      phase: "playing",
      history,
      activeStroke: { mark: effective, visited: new Set([action.index]) },
      startedAt: state.startedAt ?? action.now,
    };
  }

  if (action.type === "paint-cell") {
    if (!state.activeStroke || action.index < 0 || action.index >= state.marks.length
      || state.activeStroke.visited.has(action.index)) return state;
    const visited = new Set(state.activeStroke.visited);
    visited.add(action.index);
    return {
      ...state,
      marks: paint(state.marks, action.index, state.activeStroke.mark),
      activeStroke: { ...state.activeStroke, visited },
    };
  }

  if (action.type === "end-stroke") {
    if (!state.activeStroke) return state;
    if (matchesSolution(state.marks, state.puzzle)) {
      return {
        ...state,
        phase: "won",
        activeStroke: null,
        completedElapsedMs: elapsedMs(state, action.now),
        startedAt: null,
      };
    }
    return { ...state, activeStroke: null };
  }

  return state;
}

