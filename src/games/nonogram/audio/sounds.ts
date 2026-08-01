export type SoundCue = "fill" | "cross" | "erase" | "undo" | "switch" | "win";

export interface ToneStep {
  readonly frequency: number;
  readonly duration: number;
  readonly offset: number;
  readonly type: OscillatorType;
  readonly gain: number;
}

export const SOUND_STEPS: Record<SoundCue, readonly ToneStep[]> = {
  fill: [{ frequency: 180, duration: 0.055, offset: 0, type: "triangle", gain: 0.045 }],
  cross: [{ frequency: 430, duration: 0.045, offset: 0, type: "sine", gain: 0.035 }],
  erase: [{ frequency: 250, duration: 0.065, offset: 0, type: "sine", gain: 0.025 }],
  undo: [
    { frequency: 330, duration: 0.055, offset: 0, type: "sine", gain: 0.03 },
    { frequency: 260, duration: 0.07, offset: 0.045, type: "sine", gain: 0.025 },
  ],
  switch: [
    { frequency: 390, duration: 0.055, offset: 0, type: "triangle", gain: 0.035 },
    { frequency: 490, duration: 0.07, offset: 0.05, type: "triangle", gain: 0.035 },
  ],
  win: [
    { frequency: 392, duration: 0.13, offset: 0, type: "triangle", gain: 0.045 },
    { frequency: 523, duration: 0.13, offset: 0.11, type: "triangle", gain: 0.05 },
    { frequency: 659, duration: 0.18, offset: 0.22, type: "triangle", gain: 0.055 },
    { frequency: 784, duration: 0.3, offset: 0.35, type: "sine", gain: 0.05 },
  ],
};
