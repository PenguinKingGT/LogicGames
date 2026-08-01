import type { Ref } from "react"
import { GearSix, Question } from "@phosphor-icons/react"
import { Button } from "@/games/mastermind/components/ui/button"

interface GameHeaderProps {
  remaining: number
  soundEnabled: boolean
  onOpenRules: () => void
  onOpenSettings: () => void
  rulesTriggerRef?: Ref<HTMLButtonElement>
  settingsTriggerRef?: Ref<HTMLButtonElement>
}

export function GameHeader({
  remaining,
  soundEnabled,
  onOpenRules,
  onOpenSettings,
  rulesTriggerRef,
  settingsTriggerRef,
}: GameHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 px-1">
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-[var(--action)]">MASTERMIND</p>
        <h1 className="text-[26px] font-black tracking-[-0.04em] text-[var(--ink)]">彩码谜局</h1>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="attempt-pill" aria-label={`剩余 ${remaining} 次机会`}>
          <span className="text-[10px] font-bold text-[var(--ink-muted)]">剩余</span>
          <strong>{remaining}</strong>
        </div>
        <Button ref={rulesTriggerRef} variant="ghost" size="icon" onClick={onOpenRules} aria-label="查看玩法">
          <Question size={22} weight="bold" />
        </Button>
        <Button
          ref={settingsTriggerRef}
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          aria-label={soundEnabled ? "打开设置，音效已开启" : "打开设置，音效已关闭"}
        >
          <GearSix size={22} weight="bold" />
        </Button>
      </div>
    </header>
  )
}
