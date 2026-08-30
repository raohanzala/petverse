import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 text-xs font-medium whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        secondary: "bg-muted text-muted-foreground",
        outline:
          "border-border bg-card text-foreground hover:bg-muted/50",
        confirmed:
          "bg-[var(--status-confirmed)] text-[var(--status-confirmed-fg)]",
        pending:
          "bg-[var(--status-pending)] text-[var(--status-pending-fg)]",
        completed:
          "bg-[var(--status-completed)] text-[var(--status-completed-fg)]",
        cancelled:
          "bg-[var(--status-cancelled)] text-[var(--status-cancelled-fg)]",
        success:
          "bg-success/15 text-success-foreground",
        warning:
          "bg-warning/15 text-warning-foreground",
        info: "bg-info/15 text-info-foreground",
        destructive:
          "bg-destructive/10 text-destructive",
        ghost: "text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
