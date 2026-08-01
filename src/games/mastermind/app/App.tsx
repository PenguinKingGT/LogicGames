"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { ArrowCounterClockwise, Backspace, Check } from "@phosphor-icons/react"
import { audioManager } from "@/games/mastermind/audio/audio-manager"
import type { SoundCue } from "@/games/mastermind/audio/sounds"
import { ColorPicker } from "@/games/mastermind/components/game/ColorPicker"
import { GameBoard } from "@/games/mastermind/components/game/GameBoard"
import { GameHeader } from "@/games/mastermind/components/game/GameHeader"
import { ResultDialog } from "@/games/mastermind/components/game/ResultDialog"
import { RulesDialog } from "@/games/mastermind/components/game/RulesDialog"
import { SettingsDialog } from "@/games/mastermind/components/game/SettingsDialog"
import { Button } from "@/games/mastermind/components/ui/button"
import { CODE_LENGTH, MAX_ATTEMPTS } from "@/games/mastermind/game/config"
import { scoreGuess, toCode } from "@/games/mastermind/game/engine"
import { selectCanSubmit, selectRemainingAttempts } from "@/games/mastermind/game/selectors"
import type { Code, ColorId } from "@/games/mastermind/game/types"
import { useGame } from "@/games/mastermind/hooks/use-game"
import { usePersistedSettings } from "@/games/mastermind/hooks/use-persisted-settings"

export interface AudioPort {
  setEnabled: (enabled: boolean) => void
  play: (cue: SoundCue) => Promise<void>
}

interface AppProps {
  initialSecret?: Code
  audio?: AudioPort
}

export default function App({ initialSecret, audio = audioManager }: AppProps) {
  const { state, pickColor, removeLast, submitGuess, restart } = useGame(initialSecret)
  const { settings, setSoundEnabled } = usePersistedSettings()
  const [rulesOpen, setRulesOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const rulesTriggerRef = useRef<HTMLButtonElement>(null)
  const settingsTriggerRef = useRef<HTMLButtonElement>(null)
  const remaining = selectRemainingAttempts(state)
  const canSubmit = selectCanSubmit(state)

  useEffect(() => {
    audio.setEnabled(settings.soundEnabled)
  }, [audio, settings.soundEnabled])

  const handlePick = (color: ColorId) => {
    if (state.status !== "playing" || state.currentGuess.length >= CODE_LENGTH) return
    setInvalid(false)
    pickColor(color)
    void audio.play("pick")
  }

  const handleRemove = () => {
    if (state.currentGuess.length === 0) return
    setInvalid(false)
    removeLast()
    void audio.play("remove")
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const code = toCode(state.currentGuess)
    if (!code) {
      setInvalid(true)
      return
    }

    const feedback = scoreGuess(state.secret, code)
    const isLastAttempt = state.history.length + 1 >= MAX_ATTEMPTS
    submitGuess()
    void audio.play(feedback.exact === CODE_LENGTH ? "win" : isLastAttempt ? "lose" : "submit")
  }

  const handleSoundChange = (enabled: boolean) => {
    audio.setEnabled(enabled)
    setSoundEnabled(enabled)
    if (enabled) void audio.play("pick")
  }

  const handleReplay = () => {
    setInvalid(false)
    restart()
  }

  return (
    <main className="mastermind-game app-stage">
      <form className="game-shell" onSubmit={handleSubmit}>
        <GameHeader
          remaining={remaining}
          soundEnabled={settings.soundEnabled}
          onOpenRules={() => setRulesOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          rulesTriggerRef={rulesTriggerRef}
          settingsTriggerRef={settingsTriggerRef}
        />

        <GameBoard
          history={state.history}
          currentGuess={state.currentGuess}
          invalid={invalid}
        />

        <section className="control-dock" aria-label="猜测操作">
          <ColorPicker disabled={state.currentGuess.length >= CODE_LENGTH || state.status !== "playing"} onPick={handlePick} />
          <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={handleRemove}
              disabled={state.currentGuess.length === 0 || state.status !== "playing"}
              aria-label="撤销上一枚颜色"
            >
              <Backspace size={22} weight="bold" />
            </Button>
            <Button type="submit" size="wide" disabled={!canSubmit}>
              <Check size={21} weight="bold" />
              确认猜测
            </Button>
          </div>
          <button
            type="button"
            className="restart-link"
            onClick={() => restart()}
          >
            <ArrowCounterClockwise size={15} weight="bold" />
            重新开局
          </button>
          {invalid ? <p className="mt-2 text-center text-xs font-bold text-[var(--danger)]">请先放满四枚颜色</p> : null}
        </section>
      </form>

      <RulesDialog open={rulesOpen} onOpenChange={setRulesOpen} triggerRef={rulesTriggerRef} />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        soundEnabled={settings.soundEnabled}
        onSoundEnabledChange={handleSoundChange}
        triggerRef={settingsTriggerRef}
      />
      <ResultDialog
        status={state.status}
        secret={state.secret}
        attempts={state.history.length}
        onReplay={handleReplay}
      />
    </main>
  )
}
