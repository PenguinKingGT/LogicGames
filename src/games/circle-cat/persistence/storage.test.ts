import { describe, expect, it } from "vitest";
import { CIRCLE_CAT_STORAGE_KEY, defaultData, readData, recordResult, writeData } from "./storage";

describe("circle cat storage", () => {
  it("uses a versioned namespace and round-trips valid data", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
    };
    const next = recordResult(defaultData, "normal", true, 12);
    writeData(next, storage);
    expect(values.has(CIRCLE_CAT_STORAGE_KEY)).toBe(true);
    expect(readData(storage)).toEqual(next);
  });

  it("keeps the lowest winning move count and records losses", () => {
    const first = recordResult(defaultData, "easy", true, 14);
    const slower = recordResult(first, "easy", true, 18);
    const loss = recordResult(slower, "easy", false, 7);
    expect(loss.stats.easy).toEqual({ games: 3, wins: 2, bestMoves: 14 });
  });

  it("falls back safely for malformed data and storage errors", () => {
    expect(readData({ getItem: () => "bad json" })).toEqual(defaultData);
    expect(readData({ getItem: () => JSON.stringify({ version: 2 }) })).toEqual(defaultData);
    expect(() => writeData(defaultData, { setItem: () => { throw new Error("quota"); } })).not.toThrow();
  });

  it("sanitizes invalid stats", () => {
    const result = readData({
      getItem: () => JSON.stringify({
        version: 1, lastDifficulty: "hard", soundEnabled: false,
        stats: { hard: { games: 2, wins: 9, bestMoves: -1 } },
      }),
    });
    expect(result.stats.hard).toEqual({ games: 2, wins: 2, bestMoves: null });
  });
});

