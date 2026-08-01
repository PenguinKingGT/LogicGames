import { describe, expect, it } from "vitest";
import { createInitialState, elapsedMs, gameReducer } from "./game-reducer";
import type { PuzzleDefinition } from "../domain/types";

const puzzle: PuzzleDefinition = {
  id: "tiny",
  name: "Tiny",
  difficulty: "easy",
  width: 2,
  height: 2,
  solution: ["#.", ".#"],
};

function stroke(index: number, tool: "filled" | "crossed" | "unknown", now = 100) {
  return { type: "begin-stroke", index, tool, now } as const;
}

describe("Nonogram game reducer", () => {
  it("fills a cell, starts the timer, and toggles it back to unknown", () => {
    let state = gameReducer(createInitialState(puzzle), stroke(0, "filled"));
    state = gameReducer(state, { type: "end-stroke", now: 120 });
    expect(state.marks[0]).toBe("filled");
    expect(state.phase).toBe("playing");
    expect(elapsedMs(state, 200)).toBe(100);

    state = gameReducer(state, stroke(0, "filled", 210));
    state = gameReducer(state, { type: "end-stroke", now: 220 });
    expect(state.marks[0]).toBe("unknown");
  });

  it("paints crosses and groups a drag into one undo", () => {
    let state = gameReducer(createInitialState(puzzle), stroke(0, "crossed"));
    state = gameReducer(state, { type: "paint-cell", index: 1 });
    state = gameReducer(state, { type: "paint-cell", index: 1 });
    state = gameReducer(state, { type: "end-stroke", now: 200 });
    expect(state.marks.slice(0, 2)).toEqual(["crossed", "crossed"]);
    expect(state.history).toHaveLength(1);
    state = gameReducer(state, { type: "undo", now: 250 });
    expect(state.marks.every((mark) => mark === "unknown")).toBe(true);
    expect(state.phase).toBe("ready");
  });

  it("ignores invalid indices and duplicate stroke starts", () => {
    const initial = createInitialState(puzzle);
    expect(gameReducer(initial, stroke(-1, "filled"))).toBe(initial);
    const active = gameReducer(initial, stroke(0, "filled"));
    expect(gameReducer(active, stroke(1, "filled"))).toBe(active);
    expect(gameReducer(active, { type: "paint-cell", index: 9 })).toBe(active);
  });

  it("wins only when filled cells match exactly and freezes elapsed time", () => {
    let state = gameReducer(createInitialState(puzzle), stroke(0, "filled", 100));
    state = gameReducer(state, { type: "end-stroke", now: 150 });
    state = gameReducer(state, stroke(3, "filled", 200));
    state = gameReducer(state, { type: "end-stroke", now: 300 });
    expect(state.phase).toBe("won");
    expect(elapsedMs(state, 900)).toBe(200);
    expect(gameReducer(state, stroke(1, "filled", 400))).toBe(state);
  });

  it("restarts and loads another puzzle cleanly", () => {
    const active = gameReducer(createInitialState(puzzle), stroke(0, "filled"));
    expect(gameReducer(active, { type: "restart" })).toEqual(createInitialState(puzzle));
    const next = { ...puzzle, id: "next" };
    expect(gameReducer(active, { type: "load-puzzle", puzzle: next })).toEqual(createInitialState(next));
  });

  it("caps undo history at one hundred strokes", () => {
    let state = createInitialState(puzzle);
    for (let index = 0; index < 105; index += 1) {
      state = gameReducer(state, stroke(index % 4, index % 2 ? "filled" : "crossed", index * 10));
      state = gameReducer(state, { type: "end-stroke", now: index * 10 + 1 });
      if (state.phase === "won") state = gameReducer(state, { type: "undo", now: index * 10 + 2 });
    }
    expect(state.history.length).toBeLessThanOrEqual(100);
  });
});

