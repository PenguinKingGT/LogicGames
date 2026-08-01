import { ArrowCounterClockwise, X } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./Dialog";

export function AbandonRoundDialog({
  open,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  readonly open: boolean;
  readonly title: string;
  readonly description: string;
  readonly confirmLabel: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onCancel(); }}>
      <DialogContent className="circle-cat-confirm">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <div className="circle-cat-confirm-actions">
          <button type="button" className="circle-cat-secondary-button" onClick={onCancel}>
            <X weight="bold" />
            继续游戏
          </button>
          <button type="button" className="circle-cat-primary-button" onClick={onConfirm}>
            <ArrowCounterClockwise weight="bold" />
            {confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
