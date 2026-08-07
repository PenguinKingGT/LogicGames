const STORAGE_KEY = "twenty-four:v1";

export interface TwentyFourSettings {
  readonly soundEnabled: boolean;
}

export const defaultSettings: TwentyFourSettings = {
  soundEnabled: true,
};

export function readSettings(): TwentyFourSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultSettings;
    const candidate = JSON.parse(stored) as Partial<TwentyFourSettings>;
    return {
      soundEnabled:
        typeof candidate.soundEnabled === "boolean"
          ? candidate.soundEnabled
          : defaultSettings.soundEnabled,
    };
  } catch {
    return defaultSettings;
  }
}

export function writeSettings(settings: TwentyFourSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage is optional; gameplay must remain available.
  }
}
