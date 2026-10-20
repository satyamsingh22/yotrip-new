import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "tw-inline-flex tw-items-center tw-gap-1 tw-rounded-full tw-border tw-px-2.5 tw-py-0.5 tw-text-[11px] tw-font-semibold tw-uppercase tw-tracking-wide tw-transition-colors",
  {
    variants: {
      variant: {
        default: "tw-border-transparent tw-bg-primary tw-text-primary-foreground",
        secondary:
          "tw-border-transparent tw-bg-secondary tw-text-secondary-foreground",
        outline: "tw-border-border tw-text-foreground",
        success: "tw-border-transparent tw-bg-success/12 tw-text-success",
        warning:
          "tw-border-transparent tw-bg-warning/18 tw-text-warning-foreground",
        danger: "tw-border-transparent tw-bg-destructive/12 tw-text-destructive",
        info: "tw-border-transparent tw-bg-info/12 tw-text-info",
        muted: "tw-border-transparent tw-bg-muted tw-text-muted-foreground",
        super:
          "tw-border-transparent tw-bg-gradient-to-r tw-from-amber-400 tw-to-warning tw-text-warning-foreground tw-shadow-sm",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="tw-size-1.5 tw-rounded-full tw-bg-current tw-opacity-80" />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
