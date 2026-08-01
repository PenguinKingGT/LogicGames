import type { Difficulty } from "../domain/types";

export const CIRCLE_CAT_STORAGE_KEY = "circle-cat:v1";

export interface DifficultyStats {
  readonly games: number;
  readonly wins: number;
  readonly bestMoves: number | null;
}

export interface CircleCatData {
  readonly lastDifficulty: Difficulty;
  readonly soundEnabled: boolean;
  readonly stats: Readonly<Record<Difficulty, DifficultyStats>>;
}

interface StoredData extends CircleCatData { readonly version: 1 }

const emptyStats = (): Record<Difficulty, DifficultyStats> => ({
  easy: { games: 0, wins: 0, bestMoves: null },
  normal: { games: 0, wins: 0, bestMoves: null },
  hard: { games: 0, wins: 0, bestMoves: null },
});

export const defaultData: CircleCatData = {
  lastDifficulty: "normal",
  soundEnabled: true,
  stats: emptyStats(),
};

function isDifficulty(value: unknown): value is Difficulty {
  return value === "easy" || value === "normal" || value === "hard";
}

function validCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function parseStats(value: unknown): Record<Difficulty, DifficultyStats> {
  const fallback = emptyStats();
  if (!value || typeof value !== "object") return fallback;
  for (const difficulty of ["easy", "normal", "hard"] as const) {
    const entry = difficulty in value ? (value as Record<string, unknown>)[difficulty] : null;
    if (!entry || typeof entry !== "object") continue;
    const candidate = entry as Record<string, unknown>;
    const games = validCount(candidate.games) ? candidate.games : 0;
    const wins = validCount(candidate.wins) ? Math.min(candidate.wins, games) : 0;
    const bestMoves = candidate.bestMoves === null || candidate.bestMoves === undefined
      ? null
      : validCount(candidate.bestMoves) && candidate.bestMoves > 0 ? candidate.bestMoves : null;
    fallback[difficulty] = { games, wins, bestMoves };
  }
  return fallback;
}

export function readData(storage?: Pick<Storage, "getItem">): CircleCatData {
  const target = storage ?? (typeof window === "undefined" ? undefined : window.localStorage);
  if (!target) return defaultData;
  try {
    const raw = target.getItem(CIRCLE_CAT_STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaultData;
    const candidate = parsed as Record<string, unknown>;
    if (candidate.version !== 1 || !isDifficulty(candidate.lastDifficulty)) return defaultData;
    return {
      lastDifficulty: candidate.lastDifficulty,
      soundEnabled: typeof candidate.soundEnabled === "boolean" ? candidate.soundEnabled : true,
      stats: parseStats(candidate.stats),
    };
  } catch {
    return defaultData;
  }
}

export function writeData(data: CircleCatData, storage?: Pick<Storage, "setItem">): void {
  const target = storage ?? (typeof window === "undefined" ? undefined : window.localStorage);
  if (!target) return;
  try {
    const stored: StoredData = { version: 1, ...data };
    target.setItem(CIRCLE_CAT_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Local records are optional when browser storage is unavailable.
  }
}

export function recordResult(
  data: CircleCatData,
  difficulty: Difficulty,
  won: boolean,
  moves: number,
): CircleCatData {
  if (!validCount(moves) || moves === 0) return data;
  const current = data.stats[difficulty];
  const bestMoves = won
    ? current.bestMoves === null ? moves : Math.min(current.bestMoves, moves)
    : current.bestMoves;
  return {
    ...data,
    stats: {
      ...data.stats,
      [difficulty]: {
        games: current.games + 1,
        wins: current.wins + (won ? 1 : 0),
        bestMoves,
      },
    },
  };
}

