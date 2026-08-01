import { describe, expect, it, vi } from "vitest";
import { getPuzzles } from "../domain/puzzles";
import { defaultData, NONOGRAM_STORAGE_KEY, readData, recordCompletion, selectPuzzle, writeData } from "./storage";

describe("Nonogram storage", () => {
  it("reads defaults and rejects malformed or wrong-version data", () => {
    expect(readData({ getItem: () => null })).toEqual(defaultData);
    expect(readData({ getItem: () => "bad" })).toEqual(defaultData);
    expect(readData({ getItem: () => JSON.stringify({ version: 2, lastDifficulty: "easy" }) })).toEqual(defaultData);
  });

  it("validates stored IDs and best times", () => {
    const value = JSON.stringify({
      version: 1,
      lastDifficulty: "normal",
      soundEnabled: false,
      completedPuzzleIds: ["easy-heart", "missing", "easy-heart"],
      bestTimes: { "easy-heart": 4200, missing: 1, "easy-tree": -2 },
    });
    expect(readData({ getItem: () => value })).toEqual({
      lastDifficulty: "normal",
      soundEnabled: false,
      completedPuzzleIds: ["easy-heart"],
      bestTimes: { "easy-heart": 4200 },
    });
  });

  it("defaults sound to on for existing version one saves", () => {
    const value = JSON.stringify({ version: 1, lastDifficulty: "easy" });
    expect(readData({ getItem: () => value }).soundEnabled).toBe(true);
  });

  it("writes a namespaced versioned value and tolerates errors", () => {
    const setItem = vi.fn();
    writeData(defaultData, { setItem });
    expect(setItem).toHaveBeenCalledWith(NONOGRAM_STORAGE_KEY, JSON.stringify({ version: 1, ...defaultData }));
    expect(() => readData({ getItem: () => { throw new Error("blocked"); } })).not.toThrow();
    expect(() => writeData(defaultData, { setItem: () => { throw new Error("full"); } })).not.toThrow();
  });

  it("keeps the best completion time and records once", () => {
    const first = recordCompletion(defaultData, "easy-heart", 5000);
    const slower = recordCompletion(first, "easy-heart", 7000);
    const faster = recordCompletion(slower, "easy-heart", 3000);
    expect(faster.completedPuzzleIds).toEqual(["easy-heart"]);
    expect(faster.bestTimes["easy-heart"]).toBe(3000);
  });

  it("prefers an unfinished next puzzle and cycles when complete", () => {
    const data = { ...defaultData, completedPuzzleIds: ["easy-heart"] };
    expect(selectPuzzle("easy", data, "easy-heart", () => 0).id).toBe("easy-tree");
    const all = { ...defaultData, completedPuzzleIds: getPuzzles("easy").map((puzzle) => puzzle.id) };
    expect(selectPuzzle("easy", all, "easy-star", () => 0).id).toBe("easy-heart");
  });

  it("uses the injected random source and avoids the current puzzle", () => {
    const first = selectPuzzle("normal", defaultData, undefined, () => 0);
    const last = selectPuzzle("normal", defaultData, first.id, () => 0.999999);
    expect(first.id).not.toBe(last.id);
  });
});
