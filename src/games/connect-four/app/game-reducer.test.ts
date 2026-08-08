import { describe, expect, it } from "vitest";
import { createGameState, gameReducer, type GameState } from "./game-reducer";

describe("Connect Four reducer", () => {
  it("starts red humans immediately and yellow humans after an AI opening", () => {
    expect(createGameState("red").phase).toBe("human-turn");
    expect(createGameState("yellow").phase).toBe("ai-thinking");
  });

  it("runs a human and AI exchange and supports undo", () => {
    let state = createGameState();
    state = gameReducer(state, { type: "human-drop", column: 3 });
    expect(state.phase).toBe("dropping-human");
    state = finishHuman(state);
    state = gameReducer(state, {
      type: "ai-drop",
      column: 2,
      roundId: state.roundId,
      turnId: state.turnId,
    });
    state = finishAi(state);
    expect(state.phase).toBe("human-turn");
    expect(state.board.filter(Boolean)).toHaveLength(2);
    state = gameReducer(state, { type: "undo" });
    expect(state.board.filter(Boolean)).toHaveLength(0);
    expect(state.undo).toBeNull();
  });

  it("rejects blocked input and stale AI results", () => {
    let state = gameReducer(createGameState(), { type: "human-drop", column: 3 });
    const unchanged = gameReducer(state, { type: "human-drop", column: 2 });
    expect(unchanged).toBe(state);
    state = finishHuman(state);
    expect(
      gameReducer(state, {
        type: "ai-drop",
        column: 3,
        roundId: state.roundId - 1,
        turnId: state.turnId,
      }),
    ).toBe(state);
  });

  it("falls back to a legal AI column when a response is invalid", () => {
    let state = createGameState("yellow");
    state = gameReducer(state, {
      type: "ai-drop",
      column: 99,
      roundId: state.roundId,
      turnId: state.turnId,
      fallback: true,
    });
    expect(state.phase).toBe("dropping-ai");
    expect(state.board.filter(Boolean)).toHaveLength(1);
    expect(state.fallbackUsed).toBe(true);
  });

  it("starts a fresh round with changed settings", () => {
    const state = gameReducer(createGameState(), {
      type: "new-game",
      roundId: 8,
      humanPlayer: "yellow",
      difficulty: "hard",
    });
    expect(state).toMatchObject({
      roundId: 8,
      humanPlayer: "yellow",
      difficulty: "hard",
      phase: "ai-thinking",
    });
  });
});

function finishHuman(state: GameState): GameState {
  return gameReducer(state, {
    type: "finish-human-drop",
    roundId: state.roundId,
    turnId: state.turnId,
  });
}

function finishAi(state: GameState): GameState {
  return gameReducer(state, {
    type: "finish-ai-drop",
    roundId: state.roundId,
    turnId: state.turnId,
  });
}
