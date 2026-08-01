import { BOARD_CELLS, cellId, neighbors } from "./grid";
import { distancesToEdge } from "./pathfinding";
import { CAT_START, type Difficulty, type Opening } from "./types";

export const BLOCKER_COUNTS: Readonly<Record<Difficulty, number>> = {
  easy: 15,
  normal: 10,
  hard: 6,
};

export const difficultyLabels: Readonly<Record<Difficulty, string>> = {
  easy: "轻松",
  normal: "标准",
  hard: "挑战",
};

const FALLBACK_BLOCKERS = [
  "r1-c2", "r1-c5", "r1-c8", "r2-c3", "r2-c7",
  "r3-c1", "r3-c9", "r4-c8", "r6-c2", "r6-c7",
  "r7-c4", "r7-c9", "r8-c1", "r8-c6", "r9-c8",
] as const;

function normalizedSeed(seed: number): number {
  if (!Number.isFinite(seed)) return 0x6d2b79f5;
  return Math.trunc(seed) >>> 0;
}

export function createRandom(seed: number): () => number {
  let state = normalizedSeed(seed);
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function isPlayableOpening(blockedIds: readonly string[]): boolean {
  const blocked = new Set(blockedIds);
  if (blocked.size !== blockedIds.length || blocked.has(cellId(CAT_START))) return false;
  const openNeighbors = neighbors(CAT_START).filter((cell) => !blocked.has(cellId(cell)));
  if (openNeighbors.length < 3) return false;
  return distancesToEdge(blocked).has(cellId(CAT_START));
}

function sampleBlockers(count: number, random: () => number): readonly string[] {
  const candidates = BOARD_CELLS
    .filter((cell) => cellId(cell) !== cellId(CAT_START))
    .map(cellId);
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [candidates[index], candidates[other]] = [candidates[other]!, candidates[index]!];
  }
  return candidates.slice(0, count);
}

export function createOpening(difficulty: Difficulty, seed: number): Opening {
  const safeSeed = normalizedSeed(seed);
  const count = BLOCKER_COUNTS[difficulty];
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const candidate = sampleBlockers(count, createRandom(safeSeed + attempt * 0x9e3779b9));
    if (isPlayableOpening(candidate)) return { difficulty, blocked: candidate, seed: safeSeed };
  }
  return { difficulty, blocked: FALLBACK_BLOCKERS.slice(0, count), seed: safeSeed };
}

