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
        <span>FIELD NOTE / 01</span>
        <DialogTitle>找到图上的出口</DialogTitle>
        <DialogDescription>
          从左上角出发，沿通道抵达标记出口。使用方向键、WASD
          或滑动手势移动。完整迷宫始终可见，没有步数和时间限制。
        </DialogDescription>
        <DialogClose className="maze-dialog-primary">开始寻路</DialogClose>
      </DialogContent>
    </Dialog>
  );
}

interface CompletionDialogProps {
  readonly open: boolean;
  readonly onNewMaze: () => void;
}

export function CompletionDialog({ open, onNewMaze }: CompletionDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="maze-dialog maze-completion-dialog">
        <span>ROUTE COMPLETE</span>
        <div className="maze-completion-mark" aria-hidden="true">
          EXIT
        </div>
        <DialogTitle>找到出口</DialogTitle>
        <DialogDescription>
          路线已完成，可以生成一张全新的迷宫图。
        </DialogDescription>
        <button
          type="button"
          className="maze-dialog-primary"
          onClick={onNewMaze}
        >
          再来一局
        </button>
      </DialogContent>
    </Dialog>
  );
}
