import { describe, expect, it } from "vitest";
import { games } from "./catalog";

describe("game catalog", () => {
  it("contains the eight unique game routes", () => {
    expect(games).toHaveLength(8);
    expect(new Set(games.map((game) => game.slug)).size).toBe(8);
    expect(games.map((game) => game.href)).toEqual([
      "/games/mastermind",
      "/games/polymine",
      "/games/nonogram",
      "/games/circle-cat",
      "/games/2048",
      "/games/othello",
      "/games/twenty-four",
      "/games/maze",
    ]);
  });

  it("keeps hrefs aligned with slugs", () => {
    for (const game of games) {
      expect(game.href).toBe(`/games/${game.slug}`);
    }
  });
});
