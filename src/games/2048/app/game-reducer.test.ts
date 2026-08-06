import { describe, expect, it } from "vitest";
import { createGameState, gameReducer, type GameState } from "./game-reducer";

describe("2048 reducer", () => {
  it("moves, scores, locks animation, and supports one undo", () => {
    const state: GameState = {
      ...createGameState(() => 0),
      tiles: [{ id: 1, value: 2, row: 0, col: 0 }, { id: 2, value: 2, row: 0, col: 1 }],
      nextTileId: 3,
    };
    const moving = gameReducer(state, { type: "move", direction: "left", randomPosition: 0, randomValue: 0 });
    expect(moving.phase).toBe("animating");
    expect(moving.score).toBe(4);
    expect(moving.tiles).toHaveLength(2);
    expect(gameReducer(moving, { type: "move", direction: "right", randomPosition: 0, randomValue: 0 })).toBe(moving);
    const playing = gameReducer(moving, { type: "finish-animation", roundId: 1, moveId: 1 });
    expect(playing.phase).toBe("playing");
    const undone = gameReducer(playing, { type: "undo" });
    expect(undone.score).toBe(0);
    expect(undone.tiles).toEqual(state.tiles);
    expect(gameReducer(undone, { type: "undo" })).toBe(undone);
  });

  it("ignores no-op moves and stale animation events", () => {
    const state = { ...createGameState(() => 0), tiles: [{ id: 1, value: 2, row: 0, col: 0 }] };
    expect(gameReducer(state, { type: "move", direction: "left", randomPosition: 0, randomValue: 0 })).toBe(state);
    expect(gameReducer(state, { type: "finish-animation", roundId: 9, moveId: 1 })).toBe(state);
  });

  it("pauses once at 2048 and can continue", () => {
    const state: GameState = {
      ...createGameState(() => 0),
      tiles: [{ id: 1, value: 1024, row: 0, col: 0 }, { id: 2, value: 1024, row: 0, col: 1 }],
      nextTileId: 3,
    };
    const moving = gameReducer(state, { type: "move", direction: "left", randomPosition: 0, randomValue: 0 });
    const won = gameReducer(moving, { type: "finish-animation", roundId: 1, moveId: 1 });
    expect(won.phase).toBe("won");
    expect(gameReducer(won, { type: "continue" }).phase).toBe("continued");
  });
});
