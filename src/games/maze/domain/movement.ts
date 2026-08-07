import {
  hasPassage,
  isInBounds,
  neighbor,
  type Coordinate,
  type Direction,
  type Maze,
} from "./types";

export function movePlayer(
  maze: Maze,
  position: Coordinate,
  direction: Direction,
): Coordinate {
  if (!hasPassage(maze, position, direction)) return position;
  const destination = neighbor(position, direction);
  return isInBounds(destination, maze.size) ? destination : position;
}
