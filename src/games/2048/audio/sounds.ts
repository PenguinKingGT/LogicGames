export type SoundCue = "slide" | "merge" | "milestone" | "lose" | "button";
export interface ToneStep { readonly frequency: number; readonly duration: number; readonly offset: number; readonly type: OscillatorType; readonly gain: number }
export const SOUND_STEPS: Readonly<Record<SoundCue, readonly ToneStep[]>> = {
  slide: [{ frequency: 170, duration: 0.045, offset: 0, type: "triangle", gain: 0.018 }],
  merge: [{ frequency: 280, duration: 0.07, offset: 0, type: "sine", gain: 0.032 }, { frequency: 420, duration: 0.08, offset: 0.045, type: "sine", gain: 0.026 }],
  milestone: [{ frequency: 392, duration: 0.12, offset: 0, type: "triangle", gain: 0.035 }, { frequency: 523, duration: 0.14, offset: 0.1, type: "triangle", gain: 0.04 }, { frequency: 784, duration: 0.2, offset: 0.22, type: "sine", gain: 0.04 }],
  lose: [{ frequency: 294, duration: 0.14, offset: 0, type: "sine", gain: 0.025 }, { frequency: 220, duration: 0.2, offset: 0.12, type: "sine", gain: 0.02 }],
  button: [{ frequency: 480, duration: 0.04, offset: 0, type: "sine", gain: 0.02 }],
};
