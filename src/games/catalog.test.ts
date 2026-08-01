import { describe, expect, it } from "vitest";
import { games } from "./catalog";

describe("game catalog", () => {
  it("contains the three unique game routes", () => {
    expect(games).toHaveLength(3);
    expect(new Set(games.map((game) => game.slug)).size).toBe(3);
    expect(games.map((game) => game.href)).toEqual([
      "/games/mastermind",
      "/games/polymine",
      "/games/nonogram",
    ]);
  });

  it("keeps hrefs aligned with slugs", () => {
    for (const game of games) {
      expect(game.href).toBe(`/games/${game.slug}`);
    }
  });
});
