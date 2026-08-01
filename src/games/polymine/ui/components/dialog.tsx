import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

const DialogThemeContext = React.createContext<"light" | "dark">("light");

export const DialogThemeProvider = DialogThemeContext.Provider;

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  const theme = React.useContext(DialogThemeContext);
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="polymine-portal dialog-overlay" data-theme={theme} />
      <DialogPrimitive.Content className={cn("polymine-portal dialog-content", className)} data-theme={theme} {...props}>
        {children}
        <DialogPrimitive.Close className="dialog-close" aria-label="关闭">
          <X size={18} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
