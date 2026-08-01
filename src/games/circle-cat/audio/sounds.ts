export type SoundCue = "place" | "step" | "button" | "win" | "lose";

export interface ToneStep {
  readonly frequency: number;
  readonly duration: number;
  readonly offset: number;
  readonly type: OscillatorType;
  readonly gain: number;
}

export const SOUND_STEPS: Readonly<Record<SoundCue, readonly ToneStep[]>> = {
  place: [
    { frequency: 220, duration: 0.055, offset: 0, type: "sine", gain: 0.045 },
    { frequency: 155, duration: 0.07, offset: 0.035, type: "triangle", gain: 0.03 },
  ],
  step: [
    { frequency: 360, duration: 0.045, offset: 0, type: "triangle", gain: 0.026 },
    { frequency: 420, duration: 0.05, offset: 0.07, type: "triangle", gain: 0.023 },
  ],
  button: [{ frequency: 470, duration: 0.045, offset: 0, type: "sine", gain: 0.025 }],
  win: [
    { frequency: 392, duration: 0.12, offset: 0, type: "triangle", gain: 0.04 },
    { frequency: 523, duration: 0.12, offset: 0.1, type: "triangle", gain: 0.045 },
    { frequency: 659, duration: 0.14, offset: 0.2, type: "triangle", gain: 0.05 },
    { frequency: 784, duration: 0.24, offset: 0.32, type: "sine", gain: 0.045 },
  ],
  lose: [
    { frequency: 330, duration: 0.15, offset: 0, type: "sine", gain: 0.035 },
    { frequency: 247, duration: 0.22, offset: 0.13, type: "sine", gain: 0.028 },
  ],
};

