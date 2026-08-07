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
      <div className="twenty-four-portal">
        <Primitive.Overlay className="twenty-four-dialog-layer" />
        <Primitive.Content className="twenty-four-dialog" {...props}>
          {children}
          <Primitive.Close
            className="twenty-four-dialog-close"
            aria-label="关闭"
          >
            <X />
          </Primitive.Close>
        </Primitive.Content>
      </div>
    </Primitive.Portal>
  );
}
