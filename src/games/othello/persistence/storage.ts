import type { Difficulty } from "../ai/search";
import type { GameResult } from "../domain/types";

export const OTHELLO_STORAGE_KEY = "othello:v1";
export interface Stats {
  readonly games: number;
  readonly wins: number;
  readonly losses: number;
  readonly draws: number;
  readonly bestMargin: number | null;
}
export interface OthelloData {
  readonly difficulty: Difficulty;
  readonly soundEnabled: boolean;
  readonly stats: Readonly<Record<Difficulty, Stats>>;
}
const emptyStats = (): Record<Difficulty, Stats> => ({
  easy: { games: 0, wins: 0, losses: 0, draws: 0, bestMargin: null },
  normal: { games: 0, wins: 0, losses: 0, draws: 0, bestMargin: null },
  hard: { games: 0, wins: 0, losses: 0, draws: 0, bestMargin: null },
});
export const defaultData: OthelloData = {
  difficulty: "normal",
  soundEnabled: true,
  stats: emptyStats(),
};
const validDifficulty = (value: unknown): value is Difficulty =>
  value === "easy" || value === "normal" || value === "hard";
const validCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseBestMargin(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return validCount(value) ? value : null;
}

function parseStats(value: unknown): Record<Difficulty, Stats> {
  const parsedStats = emptyStats();
  if (!isRecord(value)) return parsedStats;

  for (const difficulty of ["easy", "normal", "hard"] as const) {
    const storedEntry = value[difficulty];
    if (!isRecord(storedEntry)) continue;

    const games = validCount(storedEntry.games) ? storedEntry.games : 0;
    const wins = validCount(storedEntry.wins)
      ? Math.min(storedEntry.wins, games)
      : 0;
    const draws = validCount(storedEntry.draws)
      ? Math.min(storedEntry.draws, games - wins)
      : 0;
    parsedStats[difficulty] = {
      games,
      wins,
      losses: Math.max(0, games - wins - draws),
      draws,
      bestMargin: parseBestMargin(storedEntry.bestMargin),
    };
  }

  return parsedStats;
}

function getReadableStorage(
  storage?: Pick<Storage, "getItem">,
): Pick<Storage, "getItem"> | undefined {
  if (storage) return storage;
  return typeof window === "undefined" ? undefined : localStorage;
}

function getWritableStorage(
  storage?: Pick<Storage, "setItem">,
): Pick<Storage, "setItem"> | undefined {
  if (storage) return storage;
  return typeof window === "undefined" ? undefined : localStorage;
}

export function readData(storage?: Pick<Storage, "getItem">): OthelloData {
  const target = getReadableStorage(storage);
  if (!target) return defaultData;
  try {
    const raw = target.getItem(OTHELLO_STORAGE_KEY);
    if (!raw) return defaultData;
    const storedData: unknown = JSON.parse(raw);
    if (!isRecord(storedData)) return defaultData;
    if (storedData.version !== 1 || !validDifficulty(storedData.difficulty)) {
      return defaultData;
    }

    return {
      difficulty: storedData.difficulty,
      soundEnabled:
        typeof storedData.soundEnabled === "boolean"
          ? storedData.soundEnabled
          : true,
      stats: parseStats(storedData.stats),
    };
  } catch {
    return defaultData;
  }
}
export function writeData(
  data: OthelloData,
  storage?: Pick<Storage, "setItem">,
): void {
  const target = getWritableStorage(storage);
  if (!target) return;
  try {
    target.setItem(
      OTHELLO_STORAGE_KEY,
      JSON.stringify({ version: 1, ...data }),
    );
  } catch {
    // Local preferences are optional when browser storage is unavailable.
  }
}
export function recordResult(
  currentData: OthelloData,
  difficulty: Difficulty,
  result: GameResult,
  blackCount: number,
  whiteCount: number,
): OthelloData {
  const currentStats = currentData.stats[difficulty];
  const playerWon = result === "black";
  const margin = Math.abs(blackCount - whiteCount);
  return {
    ...currentData,
    stats: {
      ...currentData.stats,
      [difficulty]: {
        games: currentStats.games + 1,
        wins: currentStats.wins + Number(playerWon),
        losses: currentStats.losses + Number(result === "white"),
        draws: currentStats.draws + Number(result === "draw"),
        bestMargin: playerWon
          ? Math.max(currentStats.bestMargin ?? 0, margin)
          : currentStats.bestMargin,
      },
    },
  };
}
