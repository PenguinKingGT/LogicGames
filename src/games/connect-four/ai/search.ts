import {
  cellIndex,
  dropDisc,
  getLegalColumns,
  otherPlayer,
} from "../domain/engine";
import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  type Board,
  type Player,
} from "../domain/types";

export type Difficulty = "easy" | "normal" | "hard";

export interface SearchOptions {
  readonly random?: number;
  readonly timeBudgetMs?: number;
  readonly now?: () => number;
}

export interface SearchResult {
  readonly column: number;
  readonly score: number;
  readonly completedDepth: number;
}

const CENTER_ORDER = [3, 2, 4, 1, 5, 0, 6] as const;
const WIN_SCORE = 1_000_000;

export function chooseMove(
  board: Board,
  player: Player,
  difficulty: Difficulty,
  options: SearchOptions = {},
): SearchResult | null {
  const legalColumns = orderedLegalColumns(board);
  if (legalColumns.length === 0) return null;
  const immediateWin = findImmediateWin(board, player, legalColumns);
  if (immediateWin !== null) return result(immediateWin, WIN_SCORE, 1);
  const block = findImmediateWin(board, otherPlayer(player), legalColumns);
  if (block !== null) return result(block, 0, 1);
  if (difficulty === "easy") {
    const random = clampRandom(options.random ?? 0);
    const index = Math.floor(random * legalColumns.length);
    return result(legalColumns[index], 0, 1);
  }

  const maxDepth = difficulty === "hard" ? 9 : 5;
  const now = options.now ?? Date.now;
  const deadline = now() + (options.timeBudgetMs ?? 500);
  let best = result(legalColumns[0], -Infinity, 0);
  for (let depth = 1; depth <= maxDepth; depth += 1) {
    const iteration = searchRoot(board, player, depth, deadline, now);
    if (!iteration) break;
    best = iteration;
    if (Math.abs(best.score) >= WIN_SCORE - BOARD_ROWS * 7) break;
  }
  return best;
}

function searchRoot(
  board: Board,
  player: Player,
  depth: number,
  deadline: number,
  now: () => number,
): SearchResult | null {
  let bestColumn = -1;
  let bestScore = -Infinity;
  const transpositions = new Map<string, number>();
  for (const column of orderedLegalColumns(board)) {
    if (now() >= deadline) return null;
    const applied = dropDisc(board, column, player);
    if (!applied) continue;
    const score = applied.result === player
      ? WIN_SCORE + depth
      : -negamax(
          applied.board,
          otherPlayer(player),
          depth - 1,
          -Infinity,
          Infinity,
          deadline,
          now,
          transpositions,
        );
    if (Number.isNaN(score)) return null;
    if (score > bestScore) {
      bestScore = score;
      bestColumn = column;
    }
  }
  return bestColumn < 0 ? null : result(bestColumn, bestScore, depth);
}

function negamax(
  board: Board,
  player: Player,
  depth: number,
  alphaValue: number,
  beta: number,
  deadline: number,
  now: () => number,
  transpositions: Map<string, number>,
): number {
  if (now() >= deadline) return Number.NaN;
  if (depth === 0) return evaluate(board, player);
  const cacheKey = `${depth}:${player}:${board.map((cell) => cell?.[0] ?? "_").join("")}`;
  const cached = transpositions.get(cacheKey);
  if (cached !== undefined) return cached;
  const legalColumns = orderedLegalColumns(board);
  if (legalColumns.length === 0) return 0;
  let alpha = alphaValue;
  let cutoff = false;
  for (const column of legalColumns) {
    const applied = dropDisc(board, column, player);
    if (!applied) continue;
    const score = applied.result === player
      ? WIN_SCORE + depth
      : -negamax(
          applied.board,
          otherPlayer(player),
          depth - 1,
          -beta,
          -alpha,
          deadline,
          now,
          transpositions,
        );
    if (Number.isNaN(score)) return Number.NaN;
    alpha = Math.max(alpha, score);
    if (alpha >= beta) {
      cutoff = true;
      break;
    }
  }
  if (!cutoff) transpositions.set(cacheKey, alpha);
  return alpha;
}

function evaluate(board: Board, player: Player): number {
  let score = 0;
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    const center = board[cellIndex(row, 3)];
    if (center === player) score += 7;
    if (center === otherPlayer(player)) score -= 7;
  }
  for (const window of lineWindows(board)) {
    score += scoreWindow(window, player);
  }
  return score;
}

function lineWindows(board: Board): readonly (readonly (Player | null)[])[] {
  const windows: (Player | null)[][] = [];
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let column = 0; column <= BOARD_COLUMNS - 4; column += 1) {
      windows.push(Array.from({ length: 4 }, (_, offset) => board[cellIndex(row, column + offset)]));
    }
  }
  for (let row = 0; row <= BOARD_ROWS - 4; row += 1) {
    for (let column = 0; column < BOARD_COLUMNS; column += 1) {
      windows.push(Array.from({ length: 4 }, (_, offset) => board[cellIndex(row + offset, column)]));
    }
    for (let column = 0; column <= BOARD_COLUMNS - 4; column += 1) {
      windows.push(Array.from({ length: 4 }, (_, offset) => board[cellIndex(row + offset, column + offset)]));
    }
    for (let column = 3; column < BOARD_COLUMNS; column += 1) {
      windows.push(Array.from({ length: 4 }, (_, offset) => board[cellIndex(row + offset, column - offset)]));
    }
  }
  return windows;
}

function scoreWindow(window: readonly (Player | null)[], player: Player): number {
  const own = window.filter((cell) => cell === player).length;
  const opponent = window.filter((cell) => cell === otherPlayer(player)).length;
  const empty = 4 - own - opponent;
  if (opponent === 0 && own === 3 && empty === 1) return 90;
  if (opponent === 0 && own === 2 && empty === 2) return 12;
  if (own === 0 && opponent === 3 && empty === 1) return -110;
  if (own === 0 && opponent === 2 && empty === 2) return -14;
  return 0;
}

function orderedLegalColumns(board: Board): readonly number[] {
  const legal = new Set(getLegalColumns(board));
  return CENTER_ORDER.filter((column) => legal.has(column));
}

function findImmediateWin(
  board: Board,
  player: Player,
  columns: readonly number[],
): number | null {
  for (const column of columns) {
    if (dropDisc(board, column, player)?.result === player) return column;
  }
  return null;
}

function clampRandom(random: number): number {
  if (!Number.isFinite(random)) return 0;
  return Math.max(0, Math.min(0.999999999, random));
}

function result(column: number, score: number, completedDepth: number): SearchResult {
  return { column, score, completedDepth };
}
