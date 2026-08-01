import type { PuzzleClues } from "./types";

type Pattern = readonly boolean[];

export function generateLinePatterns(length: number, clues: readonly number[]): readonly Pattern[] {
  if (clues.some((clue) => !Number.isInteger(clue) || clue <= 0)) return [];
  if (clues.length === 0) return [Array.from({ length }, () => false)];
  const minimum = clues.reduce((sum, clue) => sum + clue, 0) + clues.length - 1;
  if (minimum > length) return [];

  const patterns: boolean[][] = [];
  const place = (clueIndex: number, cursor: number, cells: boolean[]) => {
    if (clueIndex === clues.length) {
      patterns.push([...cells]);
      return;
    }
    const clue = clues[clueIndex]!;
    const remaining = clues.slice(clueIndex + 1).reduce((sum, value) => sum + value, 0)
      + Math.max(0, clues.length - clueIndex - 1);
    const latestStart = length - clue - remaining;
    for (let start = cursor; start <= latestStart; start += 1) {
      const next = [...cells];
      for (let offset = 0; offset < clue; offset += 1) next[start + offset] = true;
      place(clueIndex + 1, start + clue + 1, next);
    }
  };
  place(0, 0, Array.from({ length }, () => false));
  return patterns;
}

function compatible(pattern: Pattern, assignments: Int8Array, indices: readonly number[]): boolean {
  return indices.every((cellIndex, offset) => assignments[cellIndex] === -1
    || assignments[cellIndex] === Number(pattern[offset]));
}

function propagate(
  assignments: Int8Array,
  rowCandidates: Pattern[][],
  columnCandidates: Pattern[][],
  width: number,
  height: number,
): boolean {
  let changed = true;
  while (changed) {
    changed = false;
    for (let row = 0; row < height; row += 1) {
      const indices = Array.from({ length: width }, (_, column) => row * width + column);
      const filtered = rowCandidates[row]!.filter((pattern) => compatible(pattern, assignments, indices));
      if (filtered.length === 0) return false;
      if (filtered.length !== rowCandidates[row]!.length) rowCandidates[row] = filtered;
      for (let column = 0; column < width; column += 1) {
        const value = Number(filtered[0]![column]);
        if (filtered.every((pattern) => Number(pattern[column]) === value)) {
          const index = row * width + column;
          if (assignments[index] === -1) {
            assignments[index] = value;
            changed = true;
          } else if (assignments[index] !== value) return false;
        }
      }
    }
    for (let column = 0; column < width; column += 1) {
      const indices = Array.from({ length: height }, (_, row) => row * width + column);
      const filtered = columnCandidates[column]!.filter((pattern) => compatible(pattern, assignments, indices));
      if (filtered.length === 0) return false;
      if (filtered.length !== columnCandidates[column]!.length) columnCandidates[column] = filtered;
      for (let row = 0; row < height; row += 1) {
        const value = Number(filtered[0]![row]);
        if (filtered.every((pattern) => Number(pattern[row]) === value)) {
          const index = row * width + column;
          if (assignments[index] === -1) {
            assignments[index] = value;
            changed = true;
          } else if (assignments[index] !== value) return false;
        }
      }
    }
  }
  return true;
}

export function countSolutions(clues: PuzzleClues, limit = 2): number {
  if (limit <= 0 || clues.rows.length !== clues.height || clues.columns.length !== clues.width) return 0;
  const rows = clues.rows.map((line) => [...generateLinePatterns(clues.width, line)]);
  const columns = clues.columns.map((line) => [...generateLinePatterns(clues.height, line)]);
  if (rows.some((patterns) => patterns.length === 0) || columns.some((patterns) => patterns.length === 0)) return 0;
  const memo = new Map<string, number>();

  const search = (assignments: Int8Array, rowCandidates: Pattern[][], columnCandidates: Pattern[][]): number => {
    if (!propagate(assignments, rowCandidates, columnCandidates, clues.width, clues.height)) return 0;
    const unknown = assignments.indexOf(-1);
    if (unknown === -1) return 1;
    const key = assignments.join("");
    const cached = memo.get(key);
    if (cached !== undefined) return cached;
    let total = 0;
    for (const value of [0, 1] as const) {
      const branch = assignments.slice();
      branch[unknown] = value;
      total += search(branch, rowCandidates.map((set) => [...set]), columnCandidates.map((set) => [...set]));
      if (total >= limit) {
        memo.set(key, limit);
        return limit;
      }
    }
    memo.set(key, total);
    return total;
  };

  const assignments = new Int8Array(clues.width * clues.height);
  assignments.fill(-1);
  return search(assignments, rows, columns);
}

