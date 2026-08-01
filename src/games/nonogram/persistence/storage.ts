import { getPuzzle, getPuzzles, puzzles } from "../domain/puzzles";
import type { Difficulty, PuzzleDefinition } from "../domain/types";

export const NONOGRAM_STORAGE_KEY = "nonogram:v1";

export interface NonogramData {
  readonly lastDifficulty: Difficulty;
  readonly soundEnabled: boolean;
  readonly completedPuzzleIds: readonly string[];
  readonly bestTimes: Readonly<Record<string, number>>;
}

interface StoredData extends NonogramData {
  readonly version: 1;
}

export const defaultData: NonogramData = {
  lastDifficulty: "easy",
  soundEnabled: true,
  completedPuzzleIds: [],
  bestTimes: {},
};

function isDifficulty(value: unknown): value is Difficulty {
  return value === "easy" || value === "normal" || value === "hard";
}

export function readData(storage?: Pick<Storage, "getItem">): NonogramData {
  const target = storage ?? (typeof window === "undefined" ? undefined : window.localStorage);
  if (!target) return defaultData;
  try {
    const raw = target.getItem(NONOGRAM_STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !("version" in parsed) || parsed.version !== 1
      || !("lastDifficulty" in parsed) || !isDifficulty(parsed.lastDifficulty)) return defaultData;
    const validIds = new Set(puzzles.map((puzzle) => puzzle.id));
    const completed = "completedPuzzleIds" in parsed && Array.isArray(parsed.completedPuzzleIds)
      ? [...new Set(parsed.completedPuzzleIds.filter((id): id is string => typeof id === "string" && validIds.has(id)))]
      : [];
    const bestTimes: Record<string, number> = {};
    if ("bestTimes" in parsed && parsed.bestTimes && typeof parsed.bestTimes === "object") {
      for (const [id, value] of Object.entries(parsed.bestTimes)) {
        if (validIds.has(id) && typeof value === "number" && Number.isFinite(value) && value >= 0) bestTimes[id] = value;
      }
    }
    const soundEnabled = "soundEnabled" in parsed && typeof parsed.soundEnabled === "boolean"
      ? parsed.soundEnabled
      : true;
    return { lastDifficulty: parsed.lastDifficulty, soundEnabled, completedPuzzleIds: completed, bestTimes };
  } catch {
    return defaultData;
  }
}

export function writeData(data: NonogramData, storage?: Pick<Storage, "setItem">): void {
  const target = storage ?? (typeof window === "undefined" ? undefined : window.localStorage);
  if (!target) return;
  const value: StoredData = { version: 1, ...data };
  try {
    target.setItem(NONOGRAM_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Local records are optional when storage is blocked or full.
  }
}

export function recordCompletion(data: NonogramData, puzzleId: string, elapsed: number): NonogramData {
  if (!getPuzzle(puzzleId) || !Number.isFinite(elapsed) || elapsed < 0) return data;
  const previous = data.bestTimes[puzzleId];
  return {
    ...data,
    completedPuzzleIds: data.completedPuzzleIds.includes(puzzleId)
      ? data.completedPuzzleIds
      : [...data.completedPuzzleIds, puzzleId],
    bestTimes: { ...data.bestTimes, [puzzleId]: previous === undefined ? elapsed : Math.min(previous, elapsed) },
  };
}

export function selectPuzzle(
  difficulty: Difficulty,
  data: NonogramData,
  afterId?: string,
  random: () => number = Math.random,
): PuzzleDefinition {
  const candidates = getPuzzles(difficulty);
  const withoutCurrent = candidates.filter((puzzle) => puzzle.id !== afterId);
  const unfinished = withoutCurrent.filter((puzzle) => !data.completedPuzzleIds.includes(puzzle.id));
  const pool = unfinished.length > 0 ? unfinished : withoutCurrent.length > 0 ? withoutCurrent : candidates;
  const sample = random();
  const unit = Number.isFinite(sample) ? Math.max(0, Math.min(0.999999, sample)) : 0;
  return pool[Math.floor(unit * pool.length)] ?? puzzles[0]!;
}
