export type SoundCue = "pick" | "remove" | "submit" | "win" | "lose"

export interface ToneStep {
  frequency: number
  duration: number
  offset: number
  type: OscillatorType
  gain: number
}

export const SOUND_STEPS: Record<SoundCue, readonly ToneStep[]> = {
  pick: [{ frequency: 520, duration: 0.07, offset: 0, type: "sine", gain: 0.08 }],
  remove: [{ frequency: 280, duration: 0.08, offset: 0, type: "triangle", gain: 0.06 }],
  submit: [
    { frequency: 360, duration: 0.08, offset: 0, type: "sine", gain: 0.06 },
    { frequency: 520, duration: 0.1, offset: 0.07, type: "sine", gain: 0.07 },
  ],
  win: [
    { frequency: 523, duration: 0.16, offset: 0, type: "triangle", gain: 0.08 },
    { frequency: 659, duration: 0.16, offset: 0.14, type: "triangle", gain: 0.08 },
    { frequency: 784, duration: 0.32, offset: 0.28, type: "triangle", gain: 0.1 },
  ],
  lose: [
    { frequency: 330, duration: 0.18, offset: 0, type: "sine", gain: 0.06 },
    { frequency: 247, duration: 0.28, offset: 0.16, type: "sine", gain: 0.06 },
  ],
}

