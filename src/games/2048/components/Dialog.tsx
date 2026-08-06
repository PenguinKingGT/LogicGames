import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";

export const Dialog = DialogPrimitive.Root;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;
export function DialogContent({ children, hideClose = false, ...props }: ComponentProps<typeof DialogPrimitive.Content> & { children: ReactNode; hideClose?: boolean }) {
  return <DialogPrimitive.Portal><div className="game-2048-portal">
    <DialogPrimitive.Overlay className="g2048-dialog-overlay" />
    <DialogPrimitive.Content className="g2048-dialog" {...props}>
      {children}
      {hideClose ? null : <DialogPrimitive.Close className="g2048-dialog-close" aria-label="关闭"><X weight="bold" /></DialogPrimitive.Close>}
    </DialogPrimitive.Content>
  </div></DialogPrimitive.Portal>;
}
