import { describe, expect, it } from "vitest";
import { createMaze } from "../domain/generator";
import { DIRECTIONS, hasPassage, type Direction } from "../domain/types";
import { createGameState, gameReducer } from "./game-reducer";

describe("maze game reducer", () => {
  it("moves through passages, tracks unique visits, and restarts", () => {
    const maze = createMaze(() => 0);
    const direction = openDirection(maze);
    let state = createGameState(maze);
    state = gameReducer(state, { type: "move", direction });
    expect(state.visitedIds).toHaveLength(2);
    const movedPosition = state.player;
    state = gameReducer(state, {
      type: "move",
      direction: oppositeMove(direction),
    });
    expect(state.visitedIds).toHaveLength(2);
    expect(state.player).toEqual(maze.start);
    state = gameReducer(
      { ...state, player: movedPosition },
      { type: "restart" },
    );
    expect(state.player).toEqual(maze.start);
    expect(state.maze).toBe(maze);
  });

  it("ignores blocked moves", () => {
    const maze = createMaze(() => 0);
    const blocked = DIRECTIONS.find(
      (direction) => !hasPassage(maze, maze.start, direction),
    );
    if (!blocked) throw new Error("Expected a blocked start direction");
    const state = createGameState(maze);
    expect(gameReducer(state, { type: "move", direction: blocked })).toBe(
      state,
    );
  });

  it("replaces the maze and increments the round", () => {
    const first = createMaze(() => 0);
    const second = createMaze(() => 0.9);
    const state = gameReducer(createGameState(first), {
      type: "new-maze",
      maze: second,
    });
    expect(state.maze).toBe(second);
    expect(state.roundId).toBe(2);
    expect(state.player).toEqual(second.start);
  });

  it("completes at the exit and ignores later movement", () => {
    const maze = createMaze(() => 0);
    const distances = shortestPathDirections(maze);
    let state = createGameState(maze);
    for (const direction of distances) {
      state = gameReducer(state, { type: "move", direction });
    }
    expect(state.status).toBe("completed");
    expect(gameReducer(state, { type: "move", direction: "left" })).toBe(state);
  });
});

function openDirection(maze: ReturnType<typeof createMaze>): Direction {
  const direction = DIRECTIONS.find((candidate) =>
    hasPassage(maze, maze.start, candidate),
  );
  if (!direction) throw new Error("Expected an open start direction");
  return direction;
}

function oppositeMove(direction: Direction): Direction {
  const opposites: Readonly<Record<Direction, Direction>> = {
    up: "down",
    right: "left",
    down: "up",
    left: "right",
  };
  return opposites[direction];
}

function shortestPathDirections(
  maze: ReturnType<typeof createMaze>,
): Direction[] {
  const queue = [{ position: maze.start, path: [] as Direction[] }];
  const visited = new Set([`${maze.start.row}:${maze.start.col}`]);
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (
      current.position.row === maze.exit.row &&
      current.position.col === maze.exit.col
    ) {
      return current.path;
    }
    for (const direction of DIRECTIONS) {
      if (!hasPassage(maze, current.position, direction)) continue;
      const offsets: Readonly<Record<Direction, readonly [number, number]>> = {
        up: [-1, 0],
        right: [0, 1],
        down: [1, 0],
        left: [0, -1],
      };
      const [rowOffset, colOffset] = offsets[direction];
      const position = {
        row: current.position.row + rowOffset,
        col: current.position.col + colOffset,
      };
      const key = `${position.row}:${position.col}`;
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({ position, path: [...current.path, direction] });
    }
  }
  throw new Error("Expected path to maze exit");
}
