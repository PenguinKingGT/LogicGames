import { describe, expect, it } from "vitest";
import { neighbors, cellId } from "../domain/grid";
import { createOpening } from "../domain/setup";
import { CAT_START } from "../domain/types";
import { canBlock, createGameState, gameReducer } from "./game-reducer";

describe("circle cat game reducer", () => {
  it("blocks one cell, moves once, and unlocks after animation", () => {
    const state = createGameState(createOpening("normal", 5), 7);
    const target = { row: 2, col: 2 };
    const moving = gameReducer(state, { type: "block", cell: target, randomValue: 0 });
    expect(moving.phase).toBe("moving");
    expect(moving.moves).toBe(1);
    expect(moving.blocked).toContain(cellId(target));
    expect(neighbors(CAT_START)).toContainEqual(moving.cat);

    expect(gameReducer(moving, { type: "block", cell: { row: 3, col: 3 }, randomValue: 0 })).toBe(moving);
    expect(gameReducer(moving, { type: "finish-move", roundId: 6 })).toBe(moving);
    expect(gameReducer(moving, { type: "finish-move", roundId: 7 }).phase).toBe("playing");
  });

  it("ignores the cat and existing blockers", () => {
    const state = createGameState(createOpening("easy", 2));
    expect(canBlock(state, CAT_START)).toBe(false);
    expect(gameReducer(state, { type: "block", cell: CAT_START, randomValue: 0 })).toBe(state);
    const [blocked] = state.blocked;
    const match = /^r(\d+)-c(\d+)$/.exec(blocked!)!;
    const cell = { row: Number(match[1]), col: Number(match[2]) };
    expect(gameReducer(state, { type: "block", cell, randomValue: 0 })).toBe(state);
    expect(gameReducer(state, { type: "block", cell: { row: -1, col: 5 }, randomValue: 0 })).toBe(state);
  });

  it("wins before moving when the new block closes the final route", () => {
    const openNeighbor = neighbors(CAT_START)[0]!;
    const blocked = neighbors(CAT_START).slice(1).map(cellId);
    const state = createGameState({ difficulty: "hard", blocked, seed: 1 });
    const won = gameReducer(state, { type: "block", cell: openNeighbor, randomValue: 0 });
    expect(won.phase).toBe("won");
    expect(won.cat).toEqual(CAT_START);
    expect(won.moves).toBe(1);
  });

  it("marks an edge destination as lost after the movement finishes", () => {
    const state = {
      ...createGameState({ difficulty: "hard", blocked: [], seed: 1 }, 4),
      cat: { row: 1, col: 5 },
      previousCat: { row: 1, col: 5 },
      phase: "playing" as const,
    };
    const moving = gameReducer(state, { type: "block", cell: { row: 2, col: 5 }, randomValue: 0.4 });
    expect(moving.phase).toBe("moving");
    expect(moving.escapePending).toBe(true);
    expect(gameReducer(moving, { type: "finish-move", roundId: 4 }).phase).toBe("lost");
  });

  it("replaces a round without mutating the previous state", () => {
    const state = createGameState(createOpening("easy", 1), 1);
    const next = gameReducer(state, { type: "new-round", opening: createOpening("hard", 9), roundId: 2 });
    expect(next.difficulty).toBe("hard");
    expect(next.moves).toBe(0);
    expect(next.roundId).toBe(2);
    expect(state.difficulty).toBe("easy");
  });
});
