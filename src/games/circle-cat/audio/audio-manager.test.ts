import { beforeEach, describe, expect, it, vi } from "vitest";
import { AudioManager } from "./audio-manager";

function installAudioContext(state: AudioContextState = "running") {
  const oscillator = {
    type: "sine" as OscillatorType,
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), addEventListener: vi.fn(),
  };
  const gain = {
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(), disconnect: vi.fn(),
  };
  const context = {
    state, currentTime: 0, destination: {}, resume: vi.fn().mockResolvedValue(undefined),
    createOscillator: vi.fn(() => oscillator), createGain: vi.fn(() => gain),
  };
  const Context = vi.fn(class MockAudioContext { constructor() { return context; } });
  Object.defineProperty(window, "AudioContext", { configurable: true, value: Context });
  return { Context, context };
}

describe("Circle Cat AudioManager", () => {
  beforeEach(() => Reflect.deleteProperty(window, "AudioContext"));

  it("creates Web Audio lazily and schedules every cue step", async () => {
    const { Context, context } = installAudioContext();
    const manager = new AudioManager();
    expect(Context).not.toHaveBeenCalled();
    await manager.play("win");
    expect(Context).toHaveBeenCalledOnce();
    expect(context.createOscillator).toHaveBeenCalledTimes(4);
  });

  it("resumes suspended audio", async () => {
    const { context } = installAudioContext("suspended");
    await new AudioManager().play("step");
    expect(context.resume).toHaveBeenCalledOnce();
  });

  it("stays silent when disabled or unsupported", async () => {
    const { Context } = installAudioContext();
    const manager = new AudioManager();
    manager.setEnabled(false);
    await manager.play("lose");
    expect(Context).not.toHaveBeenCalled();
    Reflect.deleteProperty(window, "AudioContext");
    await expect(new AudioManager().play("place")).resolves.toBeUndefined();
  });
});

