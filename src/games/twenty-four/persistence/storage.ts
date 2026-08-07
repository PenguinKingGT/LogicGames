import type { Difficulty } from "../domain/types";

const STORAGE_KEY = "twenty-four:v1";

export interface DifficultyRecord {
  readonly completed: number;
  readonly assisted: number;
  readonly bestTimeMs: number | null;
}

export interface TwentyFourData {
  readonly difficulty: Difficulty;
  readonly soundEnabled: boolean;
  readonly streak: number;
  readonly bestStreak: number;
  readonly records: Readonly<Record<Difficulty, DifficultyRecord>>;
}

const EMPTY_RECORD: DifficultyRecord = {
  completed: 0,
  assisted: 0,
  bestTimeMs: null,
};

export const defaultData: TwentyFourData = {
  difficulty: "normal",
  soundEnabled: true,
  streak: 0,
  bestStreak: 0,
  records: {
    easy: EMPTY_RECORD,
    normal: EMPTY_RECORD,
    hard: EMPTY_RECORD,
  },
};

export function readData(): TwentyFourData {
  if (typeof window === "undefined") return defaultData;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultData;
    const candidate = JSON.parse(stored) as Partial<TwentyFourData>;
    if (!isDifficulty(candidate.difficulty)) return defaultData;
    return {
      ...defaultData,
      ...candidate,
      records: {
        ...defaultData.records,
        ...candidate.records,
      },
    };
  } catch {
    return defaultData;
  }
}

export function writeData(data: TwentyFourData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage is optional; gameplay must remain available.
  }
}

export function recordCompletion(
  data: TwentyFourData,
  difficulty: Difficulty,
  assisted: boolean,
  elapsedMs: number,
): TwentyFourData {
  const current = data.records[difficulty];
  const bestTimeMs = assisted
    ? current.bestTimeMs
    : getBestTime(current.bestTimeMs, elapsedMs);
  const streak = assisted ? 0 : data.streak + 1;
  return {
    ...data,
    streak,
    bestStreak: Math.max(data.bestStreak, streak),
    records: {
      ...data.records,
      [difficulty]: {
        completed: current.completed + 1,
        assisted: current.assisted + (assisted ? 1 : 0),
        bestTimeMs,
      },
    },
  };
}

function getBestTime(current: number | null, elapsedMs: number): number {
  return current === null ? elapsedMs : Math.min(current, elapsedMs);
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === "easy" || value === "normal" || value === "hard";
}
