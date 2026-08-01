import { Confetti, SmileySad } from "@phosphor-icons/react"
import { ColorToken } from "@/games/mastermind/components/game/ColorToken"
import { Button } from "@/games/mastermind/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/games/mastermind/components/ui/dialog"
import type { Code, GameStatus } from "@/games/mastermind/game/types"

interface ResultDialogProps {
  status: GameStatus
  secret: Code
  attempts: number
  onReplay: () => void
}

export function ResultDialog({ status, secret, attempts, onReplay }: ResultDialogProps) {
  const won = status === "won"
  return (
    <Dialog open={status !== "playing"}>
      <DialogContent
        className="text-center"
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <div className={`result-mark ${won ? "result-mark--won" : "result-mark--lost"}`}>
          {won ? <Confetti size={34} weight="fill" /> : <SmileySad size={34} weight="fill" />}
        </div>
        <DialogHeader className="mb-4 pr-0">
          <DialogTitle className="text-2xl">{won ? "密码破解成功" : "这局差一点"}</DialogTitle>
          <p className="text-sm text-[var(--ink-muted)]">
            {won ? `你用了 ${attempts} 次猜中答案` : "正确彩码已经揭晓"}
          </p>
        </DialogHeader>
        <div className="mb-6 flex justify-center gap-3 rounded-2xl bg-[var(--surface-muted)] p-4" aria-label="正确答案">
          {secret.map((color, index) => <ColorToken key={`${color}-${index}`} color={color} size="large" />)}
        </div>
        <Button size="wide" onClick={onReplay}>再来一局</Button>
      </DialogContent>
    </Dialog>
  )
}
