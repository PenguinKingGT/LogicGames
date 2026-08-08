export type SoundName = "drop" | "win" | "lose" | "draw" | "button";

class AudioManager {
  private enabled = true;
  private context: AudioContext | null = null;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  async play(sound: SoundName): Promise<void> {
    if (!this.enabled || typeof AudioContext === "undefined") return;
    this.context ??= new AudioContext();
    if (this.context.state === "suspended") await this.context.resume();
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const frequencies: Record<SoundName, number> = {
      drop: 180,
      button: 260,
      win: 520,
      lose: 150,
      draw: 320,
    };
    oscillator.frequency.value = frequencies[sound];
    gain.gain.setValueAtTime(0.06, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.context.currentTime + 0.12,
    );
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start();
    oscillator.stop(this.context.currentTime + 0.12);
  }
}

export const audioManager = new AudioManager();
