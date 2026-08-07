export type SoundCue = "select" | "combine" | "success";

export function playSound(cue: SoundCue, enabled: boolean): void {
  if (!enabled || typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;
  try {
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const frequencies: Readonly<Record<SoundCue, number>> = {
      select: 240,
      combine: 360,
      success: 620,
    };
    oscillator.frequency.value = frequencies[cue];
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.05, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.1);
    oscillator.addEventListener("ended", () => void context.close());
  } catch {
    // Audio feedback is optional.
  }
}
