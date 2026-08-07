import type { ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./Dialog";

interface InformationalDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly children: ReactNode;
  readonly onOpenChange: (open: boolean) => void;
}

function InformationalDialog({
  open,
  title,
  children,
  onOpenChange,
}: InformationalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <span>24 POINT / NOTE</span>
        <DialogTitle>{title}</DialogTitle>
        {children}
        <DialogClose className="twenty-four-dialog-primary">知道了</DialogClose>
      </DialogContent>
    </Dialog>
  );
}

interface HelpDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <InformationalDialog
      open={open}
      title="把四个数字变成 24"
      onOpenChange={onOpenChange}
    >
      <DialogDescription>
        每个数字必须使用且只能使用一次。先选数字，再选运算符，最后选第二个数字。
        可以使用加、减、乘、除，允许负数和分数；除数不能为零。
      </DialogDescription>
    </InformationalDialog>
  );
}

interface HintDialogProps {
  readonly open: boolean;
  readonly solution: string;
  readonly onOpenChange: (open: boolean) => void;
}

export function HintDialog({ open, solution, onOpenChange }: HintDialogProps) {
  return (
    <InformationalDialog
      open={open}
      title="一种可行解"
      onOpenChange={onOpenChange}
    >
      <DialogDescription>下面是一种可行算法。</DialogDescription>
      <code>{solution} = 24</code>
    </InformationalDialog>
  );
}

interface CompletionDialogProps {
  readonly open: boolean;
  readonly onNext: () => void;
}

export function CompletionDialog({ open, onNext }: CompletionDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="twenty-four-dialog twenty-four-complete">
        <span>SOLUTION VERIFIED</span>
        <strong aria-hidden="true">24</strong>
        <DialogTitle>计算成立</DialogTitle>
        <DialogDescription>
          你已经用完四个数字，并精确得到 24。
        </DialogDescription>
        <button
          type="button"
          className="twenty-four-dialog-primary"
          onClick={onNext}
        >
          下一题
        </button>
      </DialogContent>
    </Dialog>
  );
}
