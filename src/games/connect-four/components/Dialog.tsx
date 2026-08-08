import { X } from "@phosphor-icons/react";
import * as Primitive from "@radix-ui/react-dialog";
import type { ComponentProps, ReactNode } from "react";

export const Dialog = Primitive.Root;
export const DialogTitle = Primitive.Title;
export const DialogDescription = Primitive.Description;
export const DialogClose = Primitive.Close;

type DialogContentProps = ComponentProps<typeof Primitive.Content> & {
  readonly children: ReactNode;
  readonly hideClose?: boolean;
};

export function DialogContent({
  children,
  hideClose = false,
  ...contentProps
}: DialogContentProps) {
  return (
    <Primitive.Portal>
      <div className="connect-four-portal">
        <Primitive.Overlay className="connect-four-dialog-overlay" />
        <Primitive.Content
          className="connect-four-dialog"
          {...contentProps}
        >
          {children}
          {hideClose ? null : (
            <Primitive.Close
              className="connect-four-dialog-close"
              aria-label="关闭"
            >
              <X />
            </Primitive.Close>
          )}
        </Primitive.Content>
      </div>
    </Primitive.Portal>
  );
}
