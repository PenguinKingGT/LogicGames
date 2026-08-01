import type { RefObject } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/games/mastermind/components/ui/dialog"
import { Switch } from "@/games/mastermind/components/ui/switch"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  soundEnabled: boolean
  onSoundEnabledChange: (enabled: boolean) => void
  triggerRef?: RefObject<HTMLButtonElement | null>
}

export function SettingsDialog({
  open,
  onOpenChange,
  soundEnabled,
  onSoundEnabledChange,
  triggerRef,
}: SettingsDialogProps) {
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
          <DialogTitle>游戏设置</DialogTitle>
          <DialogDescription>设置会保存在当前设备上。</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between rounded-2xl bg-[var(--surface-muted)] p-4">
          <label htmlFor="sound-effects" className="font-bold">游戏音效</label>
          <Switch
            id="sound-effects"
            checked={soundEnabled}
            onCheckedChange={onSoundEnabledChange}
            aria-label="游戏音效"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
