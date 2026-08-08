import { describe, expect, it } from "vitest";
import { games } from "./catalog";

describe("game catalog", () => {
  it("contains the nine unique game routes", () => {
    expect(games).toHaveLength(9);
    expect(new Set(games.map((game) => game.slug)).size).toBe(9);
    expect(games.map((game) => game.href)).toEqual([
      "/games/mastermind",
      "/games/polymine",
      "/games/nonogram",
      "/games/circle-cat",
      "/games/2048",
      "/games/othello",
      "/games/twenty-four",
      "/games/maze",
      "/games/connect-four",
    ]);
  });

  it("keeps hrefs aligned with slugs", () => {
    for (const game of games) {
      expect(game.href).toBe(`/games/${game.slug}`);
    }
  });
});
