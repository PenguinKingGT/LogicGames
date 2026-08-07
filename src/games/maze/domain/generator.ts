import {
  STANDARD_MAZE_SIZE,
  DIRECTIONS,
  coordinateFromId,
  coordinateId,
  directionBit,
  hasPassage,
  isInBounds,
  neighbor,
  opposite,
  type Coordinate,
  type Direction,
  type Maze,
} from "./types";

const START: Coordinate = { row: 0, col: 0 };

export function createMaze(
  random: () => number,
  size = STANDARD_MAZE_SIZE,
): Maze {
  const passages = Array<number>(size * size).fill(0);
  const visited = new Set<number>([coordinateId(START, size)]);
  const stack: Coordinate[] = [START];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const options = unvisitedNeighbors(current, visited, size);
    if (options.length === 0) {
      stack.pop();
      continue;
    }

    const selected = options[randomIndex(random(), options.length)];
    openPassage(
      passages,
      current,
      selected.coordinate,
      selected.direction,
      size,
    );
    visited.add(coordinateId(selected.coordinate, size));
    stack.push(selected.coordinate);
  }

  const exit = findFarthestCell(passages, START, size);
  return {
    size,
    passages,
    start: START,
    exit,
    signature: passages.join("."),
  };
}

export function reachableCellIds(maze: Maze): ReadonlySet<number> {
  const reached = new Set<number>([coordinateId(maze.start, maze.size)]);
  const queue: Coordinate[] = [maze.start];
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    for (const direction of DIRECTIONS) {
      if (!hasPassage(maze, current, direction)) continue;
      const next = neighbor(current, direction);
      const id = coordinateId(next, maze.size);
      if (reached.has(id)) continue;
      reached.add(id);
      queue.push(next);
    }
  }
  return reached;
}

export function passageCount(maze: Maze): number {
  let directionalOpenings = 0;
  for (const passages of maze.passages) {
    for (const direction of DIRECTIONS) {
      if ((passages & directionBit(direction)) !== 0) directionalOpenings += 1;
    }
  }
  return directionalOpenings / 2;
}

export function distanceFromStart(maze: Maze): ReadonlyMap<number, number> {
  return distances(maze.passages, maze.start, maze.size);
}

function unvisitedNeighbors(
  coordinate: Coordinate,
  visited: ReadonlySet<number>,
  size: number,
): readonly {
  readonly coordinate: Coordinate;
  readonly direction: Direction;
}[] {
  return DIRECTIONS.flatMap((direction) => {
    const candidate = neighbor(coordinate, direction);
    if (
      !isInBounds(candidate, size) ||
      visited.has(coordinateId(candidate, size))
    )
      return [];
    return [{ coordinate: candidate, direction }];
  });
}

function openPassage(
  passages: number[],
  from: Coordinate,
  to: Coordinate,
  direction: Direction,
  size: number,
): void {
  const fromId = coordinateId(from, size);
  const toId = coordinateId(to, size);
  passages[fromId] |= directionBit(direction);
  passages[toId] |= directionBit(opposite(direction));
}

function randomIndex(value: number, length: number): number {
  const safeValue = Number.isFinite(value)
    ? Math.max(0, Math.min(0.999999999, value))
    : 0;
  return Math.floor(safeValue * length);
}

function findFarthestCell(
  passages: readonly number[],
  start: Coordinate,
  size: number,
): Coordinate {
  const measured = distances(passages, start, size);
  let farthestId = coordinateId(start, size);
  let farthestDistance = -1;
  for (let id = 0; id < passages.length; id += 1) {
    const distance = measured.get(id);
    if (distance === undefined || distance <= farthestDistance) continue;
    farthestId = id;
    farthestDistance = distance;
  }
  return coordinateFromId(farthestId, size);
}

function distances(
  passages: readonly number[],
  start: Coordinate,
  size: number,
): ReadonlyMap<number, number> {
  const measured = new Map<number, number>([[coordinateId(start, size), 0]]);
  const queue: Coordinate[] = [start];
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    const currentDistance = measured.get(coordinateId(current, size)) ?? 0;
    for (const direction of DIRECTIONS) {
      const mask = passages[coordinateId(current, size)] ?? 0;
      if ((mask & directionBit(direction)) === 0) continue;
      const next = neighbor(current, direction);
      const id = coordinateId(next, size);
      if (measured.has(id)) continue;
      measured.set(id, currentDistance + 1);
      queue.push(next);
    }
  }
  return measured;
}
