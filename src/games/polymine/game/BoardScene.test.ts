import type { GameController } from "../app/GameController";
import type { GameSnapshot } from "../domain/types";
import { describe, expect, it, vi } from "vitest";

const { FakeScene, sceneEvents } = vi.hoisted(() => {
  type Listener = {
    callback: (...args: unknown[]) => void;
    context: unknown;
  };

  class FakeEventEmitter {
    private readonly listeners = new Map<string, Listener[]>();

    once(event: string, callback: (...args: unknown[]) => void, context: unknown): void {
      this.listeners.set(event, [...(this.listeners.get(event) ?? []), { callback, context }]);
    }

    emit(event: string, ...args: unknown[]): void {
      const listeners = this.listeners.get(event) ?? [];
      this.listeners.delete(event);
      for (const listener of listeners) listener.callback.call(listener.context, ...args);
    }
  }

  class FakeScene {
    readonly events = new FakeEventEmitter();
    readonly scale = {
      width: 800,
      height: 600,
      on: vi.fn(),
      off: vi.fn(),
    };
    readonly input = {
      mouse: { disableContextMenu: vi.fn() },
      on: vi.fn(),
    };
    readonly add = {
      graphics: vi.fn(() => ({ clear: vi.fn() })),
    };
    readonly cache = {
      audio: { exists: vi.fn(() => false) },
    };
    readonly sound = {
      play: vi.fn(),
      mute: false,
      volume: 1,
    };
  }

  return {
    FakeScene,
    sceneEvents: {
      shutdown: "shutdown",
      destroy: "destroy",
    },
  };
});

vi.mock("phaser", () => ({
  default: {
    Scene: FakeScene,
    Scenes: {
      Events: {
        SHUTDOWN: sceneEvents.shutdown,
        DESTROY: sceneEvents.destroy,
      },
    },
  },
}));

import { BoardScene } from "./BoardScene";

describe("BoardScene lifecycle", () => {
  it("releases controller subscriptions when Phaser destroys the scene", () => {
    const unsubscribeState = vi.fn();
    const unsubscribeEffects = vi.fn();
    const unsubscribeSettings = vi.fn();
    const controller = {
      subscribe: vi.fn(() => unsubscribeState),
      onEffects: vi.fn(() => unsubscribeEffects),
      subscribeSettings: vi.fn(() => unsubscribeSettings),
      getSnapshot: vi.fn(() => ({ cells: new Map() }) as unknown as GameSnapshot),
      getTopology: vi.fn(() => ({
        cells: () => [],
      })),
      settings: {
        sfxMuted: false,
        sfxVolume: 1,
      },
    } as unknown as GameController;
    const scene = new BoardScene(controller);

    scene.create();
    scene.events.emit(sceneEvents.destroy);

    expect(unsubscribeState).toHaveBeenCalledOnce();
    expect(unsubscribeEffects).toHaveBeenCalledOnce();
    expect(unsubscribeSettings).toHaveBeenCalledOnce();
  });
});
