import { describe, expect, it } from "vitest";
import { games } from "./catalog";

describe("game catalog", () => {
  it("contains the two unique game routes", () => {
    expect(games).toHaveLength(2);
    expect(new Set(games.map((game) => game.slug)).size).toBe(2);
    expect(games.map((game) => game.href)).toEqual([
      "/games/mastermind",
      "/games/polymine",
    ]);
  });

  it("keeps hrefs aligned with slugs", () => {
    for (const game of games) {
      expect(game.href).toBe(`/games/${game.slug}`);
    }
  });
});
