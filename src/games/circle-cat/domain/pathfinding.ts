import { BOARD_CELLS, cellId, isEdge, neighbors } from "./grid";
import type { Coordinate } from "./types";

export function distancesToEdge(blocked: ReadonlySet<string>): ReadonlyMap<string, number> {
  const distances = new Map<string, number>();
  const queue: Coordinate[] = [];

  for (const cell of BOARD_CELLS) {
    const id = cellId(cell);
    if (isEdge(cell) && !blocked.has(id)) {
      distances.set(id, 0);
      queue.push(cell);
    }
  }

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index]!;
    const nextDistance = distances.get(cellId(current))! + 1;
    for (const next of neighbors(current)) {
      const id = cellId(next);
      if (blocked.has(id) || distances.has(id)) continue;
      distances.set(id, nextDistance);
      queue.push(next);
    }
  }

  return distances;
}

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(0.999999, value));
}

export function chooseCatStep(
  cat: Coordinate,
  blocked: ReadonlySet<string>,
  randomValue: number,
): Coordinate | null {
  const distances = distancesToEdge(blocked);
  const currentDistance = distances.get(cellId(cat));
  if (currentDistance === undefined || currentDistance === 0) return null;

  const candidates = neighbors(cat).filter((cell) => (
    !blocked.has(cellId(cell)) && distances.get(cellId(cell)) === currentDistance - 1
  ));
  if (candidates.length === 0) return null;
  return candidates[Math.floor(clampUnit(randomValue) * candidates.length)] ?? candidates[0]!;
}

