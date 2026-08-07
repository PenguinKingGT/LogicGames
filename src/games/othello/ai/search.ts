import {
  applyMove,
  countDiscs,
  getLegalMoves,
  opponent,
} from "../domain/board";
import type { Board, Player } from "../domain/types";
import { evaluate } from "./evaluation";

export type Difficulty = "easy" | "normal" | "hard";
export interface SearchOptions {
  readonly now?: () => number;
  readonly timeBudgetMs?: number;
  readonly random?: number;
}
export interface SearchResult {
  readonly index: number;
  readonly depthCompleted: number;
  readonly nodes: number;
  readonly timedOut: boolean;
}
const CORNERS = new Set([0, 7, 56, 63]);
const TIMEOUT = Symbol("timeout");
const TERMINAL_SCORE_MULTIPLIER = 100_000;
const TIME_CHECK_INTERVAL = 128;
const NORMAL_DEPTH = 4;
const HARD_DEPTH = 7;
const HARD_TIME_BUDGET_MS = 650;
const STANDARD_TIME_BUDGET_MS = 10_000;

function terminalScore(board: Board, player: Player): number {
  const counts = countDiscs(board);
  const difference =
    player === "black"
      ? counts.black - counts.white
      : counts.white - counts.black;
  return difference * TERMINAL_SCORE_MULTIPLIER;
}

function orderedMoves(board: Board, player: Player) {
  return getLegalMoves(board, player).toSorted((a, b) => {
    const corner = Number(CORNERS.has(b.index)) - Number(CORNERS.has(a.index));
    if (corner) return corner;

    const firstMove = applyMove(board, player, a.index);
    const secondMove = applyMove(board, player, b.index);
    if (!firstMove || !secondMove) return a.index - b.index;

    return (
      getLegalMoves(firstMove.board, opponent(player)).length -
        getLegalMoves(secondMove.board, opponent(player)).length ||
      a.index - b.index
    );
  });
}

function boardCacheKey(board: Board, player: Player, depth: number): string {
  const position = board
    .map((cell) => {
      if (cell === "black") return "b";
      if (cell === "white") return "w";
      return ".";
    })
    .join("");
  return `${position}:${player}:${depth}`;
}

interface Context {
  nodes: number;
  readonly deadline: number;
  readonly now: () => number;
  readonly cache: Map<string, number>;
}
function negamax(
  board: Board,
  player: Player,
  depth: number,
  alpha: number,
  beta: number,
  passed: boolean,
  context: Context,
): number {
  context.nodes += 1;
  if (
    context.nodes % TIME_CHECK_INTERVAL === 0 &&
    context.now() >= context.deadline
  ) {
    throw TIMEOUT;
  }

  const moves = orderedMoves(board, player);
  if (moves.length === 0) {
    if (passed) return terminalScore(board, player);
    return -negamax(
      board,
      opponent(player),
      depth,
      -beta,
      -alpha,
      true,
      context,
    );
  }
  if (depth === 0) return evaluate(board, player);
  const key = boardCacheKey(board, player, depth);
  const cached = context.cache.get(key);
  if (cached !== undefined) return cached;
  let best = -Infinity;
  for (const move of moves) {
    const appliedMove = applyMove(board, player, move.index);
    if (!appliedMove) continue;

    const score = -negamax(
      appliedMove.board,
      opponent(player),
      depth - 1,
      -beta,
      -alpha,
      false,
      context,
    );
    best = Math.max(best, score);
    alpha = Math.max(alpha, score);
    if (alpha >= beta) break;
  }
  context.cache.set(key, best);
  return best;
}

function searchDepth(
  board: Board,
  player: Player,
  depth: number,
  context: Context,
): number {
  const moves = orderedMoves(board, player);
  const firstMove = moves[0];
  if (!firstMove)
    throw new Error("Cannot search a position without legal moves");

  let bestMove = firstMove.index;
  let bestScore = -Infinity;
  for (const move of moves) {
    const appliedMove = applyMove(board, player, move.index);
    if (!appliedMove) continue;

    const score = -negamax(
      appliedMove.board,
      opponent(player),
      depth - 1,
      -Infinity,
      -bestScore,
      false,
      context,
    );
    if (score > bestScore) {
      bestScore = score;
      bestMove = move.index;
    }
  }
  return bestMove;
}

export function chooseMove(
  board: Board,
  player: Player,
  difficulty: Difficulty,
  options: SearchOptions = {},
): SearchResult | null {
  const legal = orderedMoves(board, player);
  if (!legal.length) return null;
  if (difficulty === "easy") {
    const corners = legal.filter((move) => CORNERS.has(move.index));
    const random = Math.min(
      Math.max(options.random ?? Math.random(), 0),
      0.999999,
    );
    const movePool = corners.length > 0 && random < 0.7 ? corners : legal;
    const selectedMove = movePool[Math.floor(random * movePool.length)];
    if (!selectedMove) return null;

    return {
      index: selectedMove.index,
      depthCompleted: 0,
      nodes: 0,
      timedOut: false,
    };
  }
  const now = options.now ?? performance.now.bind(performance);
  const defaultBudget =
    difficulty === "hard" ? HARD_TIME_BUDGET_MS : STANDARD_TIME_BUDGET_MS;
  const deadline = now() + (options.timeBudgetMs ?? defaultBudget);
  const context: Context = { nodes: 0, deadline, now, cache: new Map() };
  const firstLegalMove = legal[0];
  if (!firstLegalMove) return null;

  let bestMove = firstLegalMove.index;
  let depthCompleted = 0;
  let timedOut = false;
  const targetDepth = difficulty === "normal" ? NORMAL_DEPTH : HARD_DEPTH;
  const initialDepth = difficulty === "normal" ? NORMAL_DEPTH : 1;
  for (let depth = initialDepth; depth <= targetDepth; depth += 1) {
    try {
      bestMove = searchDepth(board, player, depth, context);
      depthCompleted = depth;
    } catch (error) {
      if (error !== TIMEOUT) throw error;
      timedOut = true;
      break;
    }
  }
  return {
    index: bestMove,
    depthCompleted,
    nodes: context.nodes,
    timedOut,
  };
}
