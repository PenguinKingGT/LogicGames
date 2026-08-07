import { describe, expect, it } from "vitest";
import {
  createMaze,
  distanceFromStart,
  passageCount,
  reachableCellIds,
} from "./generator";
import {
  COMPLEX_MAZE_SIZE,
  DIRECTIONS,
  STANDARD_MAZE_SIZE,
  coordinateFromId,
  coordinateId,
  hasPassage,
  isInBounds,
  neighbor,
  opposite,
} from "./types";

describe("maze generator", () => {
  it.each([
    [STANDARD_MAZE_SIZE, 0],
    [STANDARD_MAZE_SIZE, 0.999999],
    [STANDARD_MAZE_SIZE, Number.NaN],
    [COMPLEX_MAZE_SIZE, 0],
    [COMPLEX_MAZE_SIZE, 0.999999],
  ])(
    "creates a connected perfect size-%i maze with random value %s",
    (size, randomValue) => {
      const maze = createMaze(() => randomValue, size);
      expect(reachableCellIds(maze).size).toBe(size * size);
      expect(passageCount(maze)).toBe(size * size - 1);
      expectReciprocalPassages(maze);
      expectExitIsFarthest(maze);
    },
  );

  it("is deterministic for the same random sequence", () => {
    expect(createMaze(createRandom(42))).toEqual(createMaze(createRandom(42)));
    expect(createMaze(createRandom(42)).signature).not.toBe(
      createMaze(createRandom(43)).signature,
    );
  });

  it("stays valid across varied seeds", () => {
    for (let seed = 1; seed <= 24; seed += 1) {
      const maze = createMaze(createRandom(seed));
      expect(reachableCellIds(maze).size).toBe(maze.size * maze.size);
      expect(passageCount(maze)).toBe(maze.size * maze.size - 1);
    }
  });
});

function expectReciprocalPassages(maze: ReturnType<typeof createMaze>): void {
  for (let id = 0; id < maze.size * maze.size; id += 1) {
    const cell = coordinateFromId(id, maze.size);
    for (const direction of DIRECTIONS) {
      if (!hasPassage(maze, cell, direction)) continue;
      const adjacent = neighbor(cell, direction);
      expect(isInBounds(adjacent, maze.size)).toBe(true);
      expect(hasPassage(maze, adjacent, opposite(direction))).toBe(true);
    }
  }
}

function expectExitIsFarthest(maze: ReturnType<typeof createMaze>): void {
  const distances = distanceFromStart(maze);
  const exitDistance = distances.get(coordinateId(maze.exit, maze.size));
  expect(exitDistance).toBe(Math.max(...distances.values()));
}

function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
