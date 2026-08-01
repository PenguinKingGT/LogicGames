import { SOUND_STEPS, type SoundCue } from "./sounds";

type BrowserWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export class AudioManager {
  private context: AudioContext | null = null;
  private enabled = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  async play(cue: SoundCue): Promise<void> {
    if (!this.enabled || typeof window === "undefined") return;

    try {
      const context = this.getContext();
      if (!context) return;
      if (context.state === "suspended") await context.resume();

      const startAt = context.currentTime + 0.008;
      for (const step of SOUND_STEPS[cue]) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const toneStart = startAt + step.offset;
        const toneEnd = toneStart + step.duration;

        oscillator.type = step.type;
        oscillator.frequency.setValueAtTime(step.frequency, toneStart);
        gain.gain.setValueAtTime(0.0001, toneStart);
        gain.gain.exponentialRampToValueAtTime(step.gain, toneStart + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, toneEnd);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(toneStart);
        oscillator.stop(toneEnd + 0.015);
        oscillator.addEventListener("ended", () => {
          oscillator.disconnect();
          gain.disconnect();
        }, { once: true });
      }
    } catch {
      // Sound is optional and must never interrupt a game action.
    }
  }

  private getContext(): AudioContext | null {
    if (this.context) return this.context;
    const browserWindow = window as BrowserWindow;
    const Context = browserWindow.AudioContext ?? browserWindow.webkitAudioContext;
    if (!Context) return null;
    this.context = new Context();
    return this.context;
  }
}

export const audioManager = new AudioManager();
