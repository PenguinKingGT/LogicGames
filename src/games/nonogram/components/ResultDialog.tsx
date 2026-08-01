import { Trophy } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./Dialog";

interface ResultDialogProps {
  open: boolean;
  name: string;
  elapsed: string;
  onNext: () => void;
  onReplay: () => void;
}

export function ResultDialog({ open, name, elapsed, onNext, onReplay }: ResultDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="result-dialog" hideClose onEscapeKeyDown={(event) => event.preventDefault()}>
        <span className="result-icon" aria-hidden="true"><Trophy weight="fill" /></span>
        <DialogTitle>完成</DialogTitle>
        <DialogDescription>图案“{name}”，用时 {elapsed}</DialogDescription>
        <div className="dialog-actions">
          <button type="button" className="primary-button" onClick={onNext}>下一题</button>
          <button type="button" className="secondary-button" onClick={onReplay}>重玩本题</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

