import { movePlayer } from "../domain/movement";
import {
  coordinateId,
  sameCoordinate,
  type Coordinate,
  type Direction,
  type Maze,
} from "../domain/types";

export interface GameState {
  readonly maze: Maze;
  readonly player: Coordinate;
  readonly visitedIds: readonly number[];
  readonly status: "playing" | "completed";
  readonly roundId: number;
  readonly message: string;
}

export type GameAction =
  | { readonly type: "move"; readonly direction: Direction }
  | { readonly type: "restart" }
  | { readonly type: "new-maze"; readonly maze: Maze };

export function createGameState(maze: Maze, roundId = 1): GameState {
  return {
    maze,
    player: maze.start,
    visitedIds: [coordinateId(maze.start, maze.size)],
    status: "playing",
    roundId,
    message: "找到图上标记的出口",
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "move":
      return move(state, action.direction);
    case "restart":
      return {
        ...createGameState(state.maze, state.roundId),
        message: "已回到起点",
      };
    case "new-maze":
      return createGameState(action.maze, state.roundId + 1);
  }
}

function move(state: GameState, direction: Direction): GameState {
  if (state.status === "completed") return state;
  const nextPlayer = movePlayer(state.maze, state.player, direction);
  if (sameCoordinate(nextPlayer, state.player)) return state;

  const nextId = coordinateId(nextPlayer, state.maze.size);
  const visitedIds = state.visitedIds.includes(nextId)
    ? state.visitedIds
    : [...state.visitedIds, nextId];
  const completed = sameCoordinate(nextPlayer, state.maze.exit);
  return {
    ...state,
    player: nextPlayer,
    visitedIds,
    status: completed ? "completed" : "playing",
    message: completed ? "已抵达出口" : "继续寻找出口",
  };
}
