export type SoundCue = "place" | "flip" | "button" | "win" | "lose" | "draw";
export interface Tone {
  readonly frequency: number;
  readonly duration: number;
  readonly offset: number;
  readonly gain: number;
}
export const SOUNDS: Readonly<Record<SoundCue, readonly Tone[]>> = {
  place: [{ frequency: 155, duration: 0.07, offset: 0, gain: 0.035 }],
  flip: [
    { frequency: 290, duration: 0.05, offset: 0, gain: 0.025 },
    { frequency: 390, duration: 0.06, offset: 0.045, gain: 0.02 },
  ],
  button: [{ frequency: 470, duration: 0.04, offset: 0, gain: 0.018 }],
  win: [
    { frequency: 392, duration: 0.12, offset: 0, gain: 0.035 },
    { frequency: 523, duration: 0.14, offset: 0.1, gain: 0.04 },
    { frequency: 659, duration: 0.2, offset: 0.22, gain: 0.035 },
  ],
  lose: [
    { frequency: 294, duration: 0.15, offset: 0, gain: 0.026 },
    { frequency: 220, duration: 0.2, offset: 0.13, gain: 0.02 },
  ],
  draw: [
    { frequency: 330, duration: 0.16, offset: 0, gain: 0.025 },
    { frequency: 330, duration: 0.16, offset: 0.18, gain: 0.025 },
  ],
};
