import { describe, expect, it } from "vitest"
import { createSecret, scoreGuess, toCode } from "@/games/mastermind/game/engine"
import type { Code } from "@/games/mastermind/game/types"

const code = (...colors: Code): Code => colors

describe("scoreGuess", () => {
  it.each([
    {
      name: "scores four exact matches",
      secret: code("coral", "amber", "mint", "blue"),
      guess: code("coral", "amber", "mint", "blue"),
      expected: { exact: 4, colorOnly: 0 },
    },
    {
      name: "scores four displaced colors",
      secret: code("coral", "amber", "mint", "blue"),
      guess: code("amber", "mint", "blue", "coral"),
      expected: { exact: 0, colorOnly: 4 },
    },
    {
      name: "scores no shared colors",
      secret: code("coral", "coral", "amber", "amber"),
      guess: code("mint", "mint", "blue", "blue"),
      expected: { exact: 0, colorOnly: 0 },
    },
    {
      name: "keeps exact and color-only matches separate",
      secret: code("coral", "amber", "mint", "blue"),
      guess: code("coral", "mint", "violet", "cyan"),
      expected: { exact: 1, colorOnly: 1 },
    },
    {
      name: "consumes one secret occurrence once",
      secret: code("coral", "amber", "mint", "blue"),
      guess: code("amber", "amber", "amber", "amber"),
      expected: { exact: 1, colorOnly: 0 },
    },
    {
      name: "consumes one guess occurrence once",
      secret: code("coral", "coral", "coral", "blue"),
      guess: code("amber", "mint", "blue", "violet"),
      expected: { exact: 0, colorOnly: 1 },
    },
    {
      name: "consumes exact duplicates before displaced duplicates",
      secret: code("coral", "coral", "amber", "blue"),
      guess: code("coral", "amber", "coral", "coral"),
      expected: { exact: 1, colorOnly: 2 },
    },
  ])("$name", ({ secret, guess, expected }) => {
    expect(scoreGuess(secret, guess)).toEqual(expected)
  })

  it("does not mutate either code", () => {
    const secret = code("coral", "amber", "mint", "blue")
    const guess = code("blue", "mint", "amber", "coral")
    const secretBefore = [...secret]
    const guessBefore = [...guess]

    scoreGuess(secret, guess)

    expect(secret).toEqual(secretBefore)
    expect(guess).toEqual(guessBefore)
  })
})

describe("createSecret", () => {
  it("maps deterministic random values to colors", () => {
    const values = [0, 0.2, 0.5, 0.99]
    let index = 0
    expect(createSecret(() => values[index++]!)).toEqual([
      "coral",
      "amber",
      "cyan",
      "violet",
    ])
  })

  it("clamps a random value of one to the palette", () => {
    expect(createSecret(() => 1)).toEqual([
      "violet",
      "violet",
      "violet",
      "violet",
    ])
  })
})

describe("toCode", () => {
  it("rejects incomplete colors", () => {
    expect(toCode(["coral", "amber"])).toBeNull()
  })

  it("creates a fixed code from four colors", () => {
    expect(toCode(["coral", "amber", "mint", "blue"])).toEqual([
      "coral",
      "amber",
      "mint",
      "blue",
    ])
  })
})

