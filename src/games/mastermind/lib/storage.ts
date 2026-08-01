export const SETTINGS_STORAGE_KEY = "mastermind:settings:v1"

export interface Settings {
  soundEnabled: boolean
}

interface StoredSettings extends Settings {
  version: 1
}

export const DEFAULT_SETTINGS: Settings = { soundEnabled: true }

export function readSettings(storage?: Pick<Storage, "getItem">): Settings {
  const target = storage ?? (typeof window === "undefined" ? undefined : window.localStorage)
  if (!target) return DEFAULT_SETTINGS

  try {
    const raw = target.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "version" in parsed &&
      parsed.version === 1 &&
      "soundEnabled" in parsed &&
      typeof parsed.soundEnabled === "boolean"
    ) {
      return { soundEnabled: parsed.soundEnabled }
    }
  } catch {
    return DEFAULT_SETTINGS
  }

  return DEFAULT_SETTINGS
}

export function writeSettings(
  settings: Settings,
  storage?: Pick<Storage, "setItem">,
): void {
  const target = storage ?? (typeof window === "undefined" ? undefined : window.localStorage)
  if (!target) return

  const value: StoredSettings = { version: 1, ...settings }
  try {
    target.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Storage may be unavailable in private browsing or embedded webviews.
  }
}

