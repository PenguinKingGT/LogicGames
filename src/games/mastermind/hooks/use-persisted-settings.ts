import { useCallback, useState } from "react"
import {
  readSettings,
  writeSettings,
  type Settings,
} from "@/games/mastermind/lib/storage"

export function usePersistedSettings() {
  const [settings, setSettings] = useState<Settings>(() => readSettings())

  const setSoundEnabled = useCallback((soundEnabled: boolean) => {
    const next = { soundEnabled }
    setSettings(next)
    writeSettings(next)
  }, [])

  return { settings, setSoundEnabled }
}

