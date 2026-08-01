import { describe, expect, it, vi } from "vitest"
import { DEFAULT_SETTINGS, readSettings, SETTINGS_STORAGE_KEY, writeSettings } from "@/games/mastermind/lib/storage"

describe("settings storage", () => {
  it("returns defaults when storage is empty", () => {
    expect(readSettings({ getItem: () => null })).toEqual(DEFAULT_SETTINGS)
  })

  it("reads a valid versioned value", () => {
    const storage = { getItem: () => JSON.stringify({ version: 1, soundEnabled: false }) }
    expect(readSettings(storage)).toEqual({ soundEnabled: false })
  })

  it.each(["not-json", JSON.stringify({ version: 2, soundEnabled: false }), JSON.stringify({ version: 1, soundEnabled: "yes" })])(
    "rejects invalid data",
    (value) => expect(readSettings({ getItem: () => value })).toEqual(DEFAULT_SETTINGS),
  )

  it("writes a namespaced versioned value", () => {
    const setItem = vi.fn()
    writeSettings({ soundEnabled: false }, { setItem })
    expect(setItem).toHaveBeenCalledWith(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ version: 1, soundEnabled: false }),
    )
  })

  it("tolerates storage exceptions", () => {
    expect(() => readSettings({ getItem: () => { throw new Error("blocked") } })).not.toThrow()
    expect(() => writeSettings({ soundEnabled: true }, { setItem: () => { throw new Error("full") } })).not.toThrow()
  })
})

