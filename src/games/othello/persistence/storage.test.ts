import { describe, expect, it } from "vitest";
import { defaultData, readData, recordResult, writeData } from "./storage";

describe("Othello storage", () => {
  it("round-trips and records results", () => {
    const storedValues = new Map<string, string>();
    const storage = {
      getItem: (key: string) => storedValues.get(key) ?? null,
      setItem: (key: string, storedValue: string) => {
        storedValues.set(key, storedValue);
      },
    };

    writeData(defaultData, storage);
    expect(readData(storage)).toEqual(defaultData);
    expect(
      recordResult(defaultData, "normal", "black", "black", 40, 24).stats
        .normal,
    ).toMatchObject({ games: 1, wins: 1, bestMargin: 16 });
  });

  it("records a win for a human playing white", () => {
    const stats = recordResult(defaultData, "normal", "white", "white", 21, 43)
      .stats.normal;

    expect(stats).toMatchObject({ games: 1, wins: 1, losses: 0 });
  });

  it("falls back for malformed data", () => {
    expect(readData({ getItem: () => "{" })).toEqual(defaultData);
  });
});
