import type { GameResult, Player } from "../domain/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./Dialog";

interface HelpDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <span className="othello-kicker">规则</span>
        <DialogTitle>夹住对手的棋</DialogTitle>
        <DialogDescription>
          选择执黑时你先行，选择执白时电脑先行。落子必须从至少一个方向夹住对手棋子，
          所有被夹住的棋都会翻为己方颜色。无棋可下时自动跳过，双方都不能落子时棋多者获胜。
        </DialogDescription>
        <div className="othello-dialog-actions">
          <DialogClose>知道了</DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AbandonDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

export function AbandonDialog({
  open,
  title,
  onCancel,
  onConfirm,
}: AbandonDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel();
      }}
    >
      <DialogContent hideClose>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          当前对局不会保留，战绩不会受到影响。
        </DialogDescription>
        <div className="othello-dialog-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            继续对局
          </button>
          <button type="button" onClick={onConfirm}>
            开始新局
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ResultDialogProps {
  readonly result: GameResult | null;
  readonly humanPlayer: Player;
  readonly blackCount: number;
  readonly whiteCount: number;
  readonly onRestart: () => void;
}

export function ResultDialog({
  result,
  humanPlayer,
  blackCount,
  whiteCount,
  onRestart,
}: ResultDialogProps) {
  let title = "对局结束";
  if (result === "draw") title = "平局";
  else if (result === humanPlayer) title = "你获胜";
  else if (result) title = "电脑获胜";

  return (
    <Dialog open={result !== null}>
      <DialogContent hideClose>
        <span className="othello-kicker">MATCH COMPLETE</span>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          黑 {blackCount} · 白 {whiteCount}
        </DialogDescription>
        <div className="othello-dialog-actions">
          <button type="button" onClick={onRestart}>
            再来一局
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
