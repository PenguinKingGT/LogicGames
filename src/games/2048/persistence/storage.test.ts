import { describe, expect, it } from "vitest";
import { createGameState } from "../app/game-reducer";
import { boardValues } from "../domain/engine";
import { GAME_2048_STORAGE_KEY, readGame, writeGame } from "./storage";

describe("2048 storage", () => {
  it("round-trips valid state", () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
    const state = createGameState(() => 0);
    writeGame(state, storage);
    expect(values.has(GAME_2048_STORAGE_KEY)).toBe(true);
    expect(boardValues(readGame(storage)!.tiles)).toEqual(boardValues(state.tiles));
  });

  it("rejects malformed and wrong-version data", () => {
    expect(readGame({ getItem: () => "{" })).toBeNull();
    expect(readGame({ getItem: () => JSON.stringify({ version: 2 }) })).toBeNull();
  });
});
