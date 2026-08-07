import { SOUNDS, type SoundCue } from "./sounds";
type BrowserWindow = Window &
  typeof globalThis & { webkitAudioContext?: typeof AudioContext };

export class AudioManager {
  private context: AudioContext | null = null;
  private enabled = true;
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
  async play(cue: SoundCue): Promise<void> {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      const browserWindow = window as BrowserWindow;
      const AudioContextConstructor =
        browserWindow.AudioContext ?? browserWindow.webkitAudioContext;
      if (!this.context && AudioContextConstructor) {
        this.context = new AudioContextConstructor();
      }
      if (!this.context) return;

      if (this.context.state === "suspended") {
        await this.context.resume();
      }

      const soundStart = this.context.currentTime + 0.008;
      for (const tone of SOUNDS[cue]) {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        const toneStart = soundStart + tone.offset;
        const toneEnd = toneStart + tone.duration;
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(tone.frequency, toneStart);
        gain.gain.setValueAtTime(0.0001, toneStart);
        gain.gain.exponentialRampToValueAtTime(tone.gain, toneStart + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, toneEnd);
        oscillator.connect(gain);
        gain.connect(this.context.destination);
        oscillator.start(toneStart);
        oscillator.stop(toneEnd + 0.01);
        oscillator.addEventListener(
          "ended",
          () => {
            oscillator.disconnect();
            gain.disconnect();
          },
          { once: true },
        );
      }
    } catch {
      // Audio is optional and must never interrupt a turn.
    }
  }
}
export const audioManager = new AudioManager();
