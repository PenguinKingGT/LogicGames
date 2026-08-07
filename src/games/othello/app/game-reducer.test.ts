import { describe, expect, it } from "vitest";
import { createGameState, gameReducer } from "./game-reducer";

describe("Othello reducer", () => {
  it("runs a human and AI exchange then allows undo", () => {
    const state = createGameState();
    const human = gameReducer(state, { type: "human-move", index: 19 });
    expect(human.phase).toBe("animating-human");
    expect(human.counts).toEqual({ black: 4, white: 1 });
    const thinking = gameReducer(human, {
      type: "finish-human-animation",
      roundId: 1,
      turnId: 1,
    });
    expect(thinking.phase).toBe("ai-thinking");
    const ai = gameReducer(thinking, {
      type: "ai-move",
      index: 18,
      roundId: 1,
      turnId: 1,
    });
    expect(ai.phase).toBe("animating-ai");
    const playing = gameReducer(ai, {
      type: "finish-ai-animation",
      roundId: 1,
      turnId: 2,
    });
    expect(playing.phase).toBe("human-turn");
    const undone = gameReducer(playing, { type: "undo" });
    expect(undone.counts).toEqual({ black: 2, white: 2 });
    expect(undone.undo).toBeNull();
  });

  it("rejects illegal human moves and stale AI results", () => {
    const state = createGameState();
    expect(gameReducer(state, { type: "human-move", index: 0 })).toBe(state);
    const human = gameReducer(state, { type: "human-move", index: 19 });
    const thinking = gameReducer(human, {
      type: "finish-human-animation",
      roundId: 1,
      turnId: 1,
    });
    expect(
      gameReducer(thinking, {
        type: "ai-move",
        index: 18,
        roundId: 0,
        turnId: 1,
      }),
    ).toBe(thinking);
  });

  it("lets the AI play black before a human who chooses white", () => {
    const state = createGameState("normal", 3, "white");
    expect(state.phase).toBe("ai-thinking");
    expect(state.currentPlayer).toBe("black");

    const aiMove = gameReducer(state, {
      type: "ai-move",
      index: 19,
      roundId: 3,
      turnId: 0,
    });
    expect(aiMove.phase).toBe("animating-ai");
    expect(aiMove.currentPlayer).toBe("black");

    const humanTurn = gameReducer(aiMove, {
      type: "finish-ai-animation",
      roundId: 3,
      turnId: 1,
    });
    expect(humanTurn.phase).toBe("human-turn");
    expect(humanTurn.currentPlayer).toBe("white");
  });
});
