import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./Dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConfirmDialog({ open, onOpenChange, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>重新开始本题？</DialogTitle>
        <DialogDescription>当前填写会被清除。</DialogDescription>
        <div className="dialog-actions">
          <button type="button" className="danger-button" onClick={onConfirm}>重新开始</button>
          <button type="button" className="secondary-button" onClick={() => onOpenChange(false)}>取消</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

