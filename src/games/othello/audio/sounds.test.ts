import { describe, expect, it } from "vitest";
import { SOUNDS } from "./sounds";

describe("Othello sounds", () => {
  it("defines short, quiet synthesized cues for every game event", () => {
    expect(Object.keys(SOUNDS)).toEqual([
      "place",
      "flip",
      "button",
      "win",
      "lose",
      "draw",
    ]);
    for (const tones of Object.values(SOUNDS)) {
      expect(tones.length).toBeGreaterThan(0);
      expect(
        tones.every((tone) => tone.duration <= 0.2 && tone.gain <= 0.04),
      ).toBe(true);
    }
  });
});
