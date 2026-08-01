import { beforeEach, describe, expect, it, vi } from "vitest"
import { AudioManager } from "@/games/mastermind/audio/audio-manager"

function installAudioContext() {
  const oscillator = {
    type: "sine" as OscillatorType,
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    addEventListener: vi.fn(),
  }
  const gain = {
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }
  const context = {
    state: "running",
    currentTime: 0,
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    createOscillator: vi.fn(() => oscillator),
    createGain: vi.fn(() => gain),
  }
  const Context = vi.fn(class MockAudioContext {
    constructor() {
      return context
    }
  })
  Object.defineProperty(window, "AudioContext", { configurable: true, value: Context })
  return { Context, context, oscillator }
}

describe("AudioManager", () => {
  beforeEach(() => {
    Reflect.deleteProperty(window, "AudioContext")
  })

  it("creates the context lazily and schedules a cue", async () => {
    const { Context, context, oscillator } = installAudioContext()
    const manager = new AudioManager()
    expect(Context).not.toHaveBeenCalled()

    await manager.play("pick")

    expect(Context).toHaveBeenCalledOnce()
    expect(context.createOscillator).toHaveBeenCalledOnce()
    expect(oscillator.start).toHaveBeenCalled()
    expect(oscillator.stop).toHaveBeenCalled()
  })

  it("does not create audio while muted", async () => {
    const { Context } = installAudioContext()
    const manager = new AudioManager()
    manager.setEnabled(false)
    await manager.play("win")
    expect(Context).not.toHaveBeenCalled()
  })

  it("tolerates browsers without Web Audio", async () => {
    const manager = new AudioManager()
    await expect(manager.play("pick")).resolves.toBeUndefined()
  })
})
