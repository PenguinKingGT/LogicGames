import { SOUND_STEPS, type SoundCue } from "./sounds";
type BrowserWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };

export class AudioManager {
  private context: AudioContext | null = null;
  private enabled = true;
  setEnabled(enabled: boolean): void { this.enabled = enabled; }
  async play(cue: SoundCue): Promise<void> {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      const browserWindow = window as BrowserWindow;
      const Context = browserWindow.AudioContext ?? browserWindow.webkitAudioContext;
      if (!this.context && Context) this.context = new Context();
      if (!this.context) return;
      if (this.context.state === "suspended") await this.context.resume();
      const start = this.context.currentTime + 0.008;
      for (const step of SOUND_STEPS[cue]) {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        const from = start + step.offset;
        const to = from + step.duration;
        oscillator.type = step.type;
        oscillator.frequency.setValueAtTime(step.frequency, from);
        gain.gain.setValueAtTime(0.0001, from);
        gain.gain.exponentialRampToValueAtTime(step.gain, from + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, to);
        oscillator.connect(gain); gain.connect(this.context.destination);
        oscillator.start(from); oscillator.stop(to + 0.01);
        oscillator.addEventListener("ended", () => { oscillator.disconnect(); gain.disconnect(); }, { once: true });
      }
    } catch { /* Sound must never block a move. */ }
  }
}
export const audioManager = new AudioManager();
