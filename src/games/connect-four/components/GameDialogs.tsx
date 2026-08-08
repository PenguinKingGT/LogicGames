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
        <span>HOW TO PLAY</span>
        <DialogTitle>率先连成四枚棋子</DialogTitle>
        <DialogDescription>
          选择一列落子，棋子会落到该列最低的空位。横向、纵向或斜向连成四枚即可获胜。
          棋盘聚焦时也可以使用左右方向键选择列，按回车或空格落子。
        </DialogDescription>
        <DialogClose className="connect-four-primary">开始对局</DialogClose>
      </DialogContent>
    </Dialog>
  );
}

interface ResultDialogProps {
  readonly result: GameResult | null;
  readonly humanPlayer: Player;
  readonly onNewGame: () => void;
}

export function ResultDialog({
  result,
  humanPlayer,
  onNewGame,
}: ResultDialogProps) {
  const title = result === "draw"
    ? "本局平局"
    : result === humanPlayer
      ? "你获胜"
      : "电脑获胜";
  return (
    <Dialog open={result !== null}>
      <DialogContent hideClose>
        <span>ROUND COMPLETE</span>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          {result === "draw"
            ? "棋盘已经落满，双方都没有形成决定性的四连线。"
            : "本轮已经结束，可以立即开始一局新的对战。"}
        </DialogDescription>
        <button
          type="button"
          className="connect-four-primary"
          onClick={onNewGame}
        >
          再来一局
        </button>
      </DialogContent>
    </Dialog>
  );
}
