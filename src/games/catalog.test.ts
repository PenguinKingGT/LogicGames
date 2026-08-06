import { describe, expect, it } from "vitest";
import { games } from "./catalog";

describe("game catalog", () => {
  it("contains the five unique game routes", () => {
    expect(games).toHaveLength(5);
    expect(new Set(games.map((game) => game.slug)).size).toBe(5);
    expect(games.map((game) => game.href)).toEqual([
      "/games/mastermind",
      "/games/polymine",
      "/games/nonogram",
      "/games/circle-cat",
      "/games/2048",
    ]);
  });

  it("keeps hrefs aligned with slugs", () => {
    for (const game of games) {
      expect(game.href).toBe(`/games/${game.slug}`);
    }
  });
});
