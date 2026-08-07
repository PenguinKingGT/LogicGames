import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createMaze } from "../domain/generator";
import { DIRECTIONS, hasPassage } from "../domain/types";
import { MazeBoard } from "./MazeBoard";

describe("MazeBoard", () => {
  it("turns a dominant swipe into one directional move", () => {
    const maze = createMaze(() => 0);
    const direction = DIRECTIONS.find((candidate) =>
      hasPassage(maze, maze.start, candidate),
    );
    if (!direction) throw new Error("Expected an open direction");
    const onMove = vi.fn();
    render(
      <MazeBoard
        maze={maze}
        player={maze.start}
        visitedIds={[0]}
        onMove={onMove}
      />,
    );
    const board = screen.getByRole("application");
    const endpoint = swipeEndpoint(direction);
    fireEvent.pointerDown(board, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(board, { ...endpoint, pointerId: 1 });
    expect(onMove).toHaveBeenCalledOnce();
    expect(onMove).toHaveBeenCalledWith(direction);
  });

  it("ignores a short pointer gesture", () => {
    const maze = createMaze(() => 0);
    const onMove = vi.fn();
    render(
      <MazeBoard
        maze={maze}
        player={maze.start}
        visitedIds={[0]}
        onMove={onMove}
      />,
    );
    const board = screen.getByRole("application");
    fireEvent.pointerDown(board, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(board, { clientX: 108, clientY: 105, pointerId: 1 });
    expect(onMove).not.toHaveBeenCalled();
  });
});

function swipeEndpoint(direction: (typeof DIRECTIONS)[number]): {
  readonly clientX: number;
  readonly clientY: number;
} {
  if (direction === "up") return { clientX: 100, clientY: 50 };
  if (direction === "right") return { clientX: 150, clientY: 100 };
  if (direction === "down") return { clientX: 100, clientY: 150 };
  return { clientX: 50, clientY: 100 };
}
