import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";

export const Dialog = DialogPrimitive.Root;

export function DialogContent({
  children,
  className = "",
  hideClose = false,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { children: ReactNode; hideClose?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="nonogram-portal nonogram-dialog-overlay" />
      <DialogPrimitive.Content
        className={`nonogram-portal nonogram-dialog ${className}`}
        {...props}
      >
        {children}
        {hideClose ? null : (
          <DialogPrimitive.Close className="nonogram-dialog-close" aria-label="关闭">
            <X weight="bold" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

