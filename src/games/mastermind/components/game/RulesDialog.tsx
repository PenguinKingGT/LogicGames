import type { RefObject } from "react"
import { ColorToken } from "@/games/mastermind/components/game/ColorToken"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/games/mastermind/components/ui/dialog"

interface RulesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRef?: RefObject<HTMLButtonElement | null>
}

export function RulesDialog({ open, onOpenChange, triggerRef }: RulesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onCloseAutoFocus={(event) => {
          if (!triggerRef?.current) return
          event.preventDefault()
          triggerRef.current.focus()
        }}
      >
        <DialogHeader>
          <DialogTitle>破解四位彩码</DialogTitle>
          <DialogDescription>
            从六种颜色中组合答案。颜色可以重复，你有 10 次机会。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm leading-6">
          <div className="rule-row">
            <span className="feedback-peg feedback-peg--exact size-3" />
            <p><strong>深色判定</strong><br />颜色和位置都正确</p>
          </div>
          <div className="rule-row">
            <span className="feedback-peg feedback-peg--color size-3" />
            <p><strong>浅色判定</strong><br />颜色正确，位置不对</p>
          </div>
          <div className="rounded-2xl bg-[var(--surface-muted)] p-4">
            <p className="mb-3 font-bold">示例猜测</p>
            <div className="flex items-center gap-2">
              <ColorToken color="coral" />
              <ColorToken color="amber" />
              <ColorToken color="coral" />
              <ColorToken color="blue" />
              <span className="ml-auto text-xs text-[var(--ink-muted)]">1 个位置正确<br />2 个颜色正确</span>
            </div>
          </div>
          <p className="text-xs text-[var(--ink-muted)]">判定钉的排列顺序不会提示具体位置。</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
