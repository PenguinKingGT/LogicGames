import * as Primitive from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";
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
      <div className="othello-portal">
        <Primitive.Overlay className="othello-dialog-overlay" />
        <Primitive.Content className="othello-dialog" {...contentProps}>
          {children}
          {hideClose ? null : (
            <Primitive.Close className="othello-dialog-close" aria-label="关闭">
              <X />
            </Primitive.Close>
          )}
        </Primitive.Content>
      </div>
    </Primitive.Portal>
  );
}
