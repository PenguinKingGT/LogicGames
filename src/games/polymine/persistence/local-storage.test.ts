import { beforeEach, describe, expect, it } from "vitest";
import { defaultSettings, loadData, saveData } from "./local-storage";

describe("local storage", () => {
  beforeEach(() => localStorage.clear());

  it("falls back when persisted data is corrupt", () => {
    localStorage.setItem("polymine:v1", "not json");
    expect(loadData().settings).toEqual(defaultSettings);
  });

  it("round-trips settings and stats", () => {
    const settings = { ...defaultSettings, geometry: "hex" as const, sfxVolume: 0.4 };
    saveData(settings, { "hex:easy": { games: 2, wins: 1, bestMs: 1200, streak: 0 } });
    expect(loadData()).toMatchObject({ settings, stats: { "hex:easy": { games: 2, wins: 1 } } });
  });
});
