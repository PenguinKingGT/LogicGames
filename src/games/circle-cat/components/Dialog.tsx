import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";

export const Dialog = DialogPrimitive.Root;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export function DialogContent({
  children,
  className = "",
  hideClose = false,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { children: ReactNode; hideClose?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <div className="circle-cat-portal">
        <DialogPrimitive.Overlay className="circle-cat-dialog-overlay" />
        <DialogPrimitive.Content className={`circle-cat-dialog ${className}`} {...props}>
          {children}
          {hideClose ? null : (
            <DialogPrimitive.Close className="circle-cat-dialog-close" aria-label="关闭">
              <X weight="bold" />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  );
}
