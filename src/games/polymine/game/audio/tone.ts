import type { SoundCue } from "../../domain/types";

const cueFrequency: Record<SoundCue, number> = {
  reveal: 520,
  cascade: 360,
  "flag-on": 720,
  "flag-off": 430,
  invalid: 170,
  mine: 95,
  win: 880,
};

function writeString(view: DataView, offset: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
}

export function createToneDataUri(cue: SoundCue): string {
  const sampleRate = 11025;
  const duration = cue === "win" ? 0.34 : cue === "mine" ? 0.26 : 0.1;
  const sampleCount = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + sampleCount * 2);
  const view = new DataView(buffer);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + sampleCount * 2, true);
  writeString(view, 8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, sampleCount * 2, true);
  const frequency = cueFrequency[cue];
  for (let index = 0; index < sampleCount; index += 1) {
    const progress = index / sampleCount;
    const envelope = Math.pow(1 - progress, 2);
    const glide = cue === "win" ? 1 + Math.floor(progress * 3) * 0.25 : 1;
    const wave = Math.sin((2 * Math.PI * frequency * glide * index) / sampleRate);
    const noise = cue === "mine" ? (Math.sin(index * 12.9898) * 0.25) : 0;
    view.setInt16(44 + index * 2, Math.max(-1, Math.min(1, wave + noise)) * envelope * 12000, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:audio/wav;base64,${btoa(binary)}`;
}

