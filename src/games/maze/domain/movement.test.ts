import { describe, expect, it } from "vitest";
import { createMaze } from "./generator";
import { movePlayer } from "./movement";
import { DIRECTIONS, hasPassage } from "./types";

describe("maze movement", () => {
  it("moves only through an open passage", () => {
    const maze = createMaze(() => 0);
    const openDirection = DIRECTIONS.find((direction) =>
      hasPassage(maze, maze.start, direction),
    );
    const closedDirection = DIRECTIONS.find(
      (direction) => !hasPassage(maze, maze.start, direction),
    );
    expect(openDirection).toBeDefined();
    expect(closedDirection).toBeDefined();
    if (!openDirection || !closedDirection) return;
    expect(movePlayer(maze, maze.start, openDirection)).not.toEqual(maze.start);
    expect(movePlayer(maze, maze.start, closedDirection)).toEqual(maze.start);
  });
});
