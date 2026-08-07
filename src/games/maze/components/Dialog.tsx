import { X } from "@phosphor-icons/react";
import * as Primitive from "@radix-ui/react-dialog";
import type { ComponentProps, ReactNode } from "react";

export const Dialog = Primitive.Root;
export const DialogTitle = Primitive.Title;
export const DialogDescription = Primitive.Description;
export const DialogClose = Primitive.Close;

type DialogContentProps = ComponentProps<typeof Primitive.Content> & {
  readonly children: ReactNode;
};

export function DialogContent({ children, ...props }: DialogContentProps) {
  return (
    <Primitive.Portal>
      <div className="maze-portal">
        <Primitive.Overlay className="maze-dialog-overlay" />
        <Primitive.Content className="maze-dialog" {...props}>
          {children}
          <Primitive.Close className="maze-dialog-close" aria-label="关闭">
            <X />
          </Primitive.Close>
        </Primitive.Content>
      </div>
    </Primitive.Portal>
  );
}
