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
      recordResult(defaultData, "normal", "black", 40, 24).stats.normal,
    ).toMatchObject({ games: 1, wins: 1, bestMargin: 16 });
  });

  it("falls back for malformed data", () => {
    expect(readData({ getItem: () => "{" })).toEqual(defaultData);
  });
});
