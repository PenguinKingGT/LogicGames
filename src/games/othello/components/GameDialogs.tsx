import type { GameResult } from "../domain/types";
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
          你执黑先行。落子必须从至少一个方向夹住白棋，所有被夹住的棋都会翻为黑色。
          无棋可下时自动跳过，双方都不能落子时棋多者获胜。
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

const RESULT_LABELS: Readonly<Record<GameResult, string>> = {
  black: "黑方获胜",
  white: "白方获胜",
  draw: "平局",
};

interface ResultDialogProps {
  readonly result: GameResult | null;
  readonly blackCount: number;
  readonly whiteCount: number;
  readonly onRestart: () => void;
}

export function ResultDialog({
  result,
  blackCount,
  whiteCount,
  onRestart,
}: ResultDialogProps) {
  const title = result ? RESULT_LABELS[result] : "对局结束";

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
