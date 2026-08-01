import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/games/mastermind/lib/utils"

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[14px] text-sm font-bold transition-[transform,background-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--focus-ring)] disabled:pointer-events-none disabled:opacity-45 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--action)] px-5 text-white shadow-[0_5px_0_var(--action-deep)] hover:bg-[var(--action-hover)] active:translate-y-1 active:shadow-none",
        secondary:
          "bg-[var(--surface-muted)] px-4 text-[var(--ink)] hover:bg-[var(--surface-strong)]",
        ghost: "px-3 text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]",
      },
      size: {
        default: "h-12",
        icon: "size-11 p-0",
        wide: "h-14 w-full text-base",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
)

Button.displayName = "Button"
