import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "@phosphor-icons/react"
import { cn } from "@/games/mastermind/lib/utils"

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}

export function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="mastermind-portal fixed inset-0 z-40 bg-[#17332a]/35 backdrop-blur-[3px] data-[state=closed]:animate-out data-[state=open]:animate-in" />
      <DialogPrimitive.Content
        className={cn(
          "mastermind-portal fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-white/80 bg-[var(--surface)] p-6 text-[var(--ink)] shadow-[0_24px_80px_rgba(31,74,61,.24)] focus:outline-none",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close className="absolute right-4 top-4 grid size-10 place-items-center rounded-xl text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--focus-ring)]">
            <X size={20} weight="bold" />
            <span className="sr-only">关闭</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-5 space-y-2 pr-10", className)} {...props} />
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-xl font-black tracking-tight", className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm leading-6 text-[var(--ink-muted)]", className)}
      {...props}
    />
  )
}
