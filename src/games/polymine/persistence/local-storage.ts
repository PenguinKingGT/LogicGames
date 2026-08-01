import type { Difficulty, GeometryKind } from "../domain/types";

export type ThemeMode = "system" | "light" | "dark";

export interface Settings {
  geometry: GeometryKind;
  difficulty: Difficulty;
  theme: ThemeMode;
  sfxMuted: boolean;
  sfxVolume: number;
  reducedMotion: boolean;
}

export interface ModeStats {
  games: number;
  wins: number;
  bestMs: number | null;
  streak: number;
}

interface PersistedData {
  version: 1;
  settings: Settings;
  stats: Record<string, ModeStats>;
}

const STORAGE_KEY = "polymine:v1";

export const defaultSettings: Settings = {
  geometry: "square",
  difficulty: "easy",
  theme: "system",
  sfxMuted: false,
  sfxVolume: 0.65,
  reducedMotion: false,
};

function isGeometry(value: unknown): value is GeometryKind {
  return value === "square" || value === "triangle" || value === "hex";
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === "easy" || value === "normal" || value === "hard";
}

function isTheme(value: unknown): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

export function loadData(): PersistedData {
  const fallback: PersistedData = { version: 1, settings: defaultSettings, stats: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedData>;
    const settings = parsed.settings as Partial<Settings> | undefined;
    if (
      parsed.version !== 1 ||
      !settings ||
      !isGeometry(settings.geometry) ||
      !isDifficulty(settings.difficulty) ||
      !isTheme(settings.theme)
    ) {
      return fallback;
    }
    return {
      version: 1,
      settings: {
        ...defaultSettings,
        ...settings,
        sfxVolume: Math.min(1, Math.max(0, Number(settings.sfxVolume) || 0)),
      },
      stats: parsed.stats && typeof parsed.stats === "object" ? parsed.stats : {},
    };
  } catch {
    return fallback;
  }
}

export function saveData(settings: Settings, stats: Record<string, ModeStats>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, settings, stats }));
  } catch {
    // Storage is an enhancement; private browsing or quota errors must not break the game.
  }
}

export function statsKey(geometry: GeometryKind, difficulty: Difficulty): string {
  return `${geometry}:${difficulty}`;
}

