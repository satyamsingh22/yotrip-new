import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "tw-relative tw-flex tw-w-full tw-items-start tw-gap-3 tw-rounded-xl tw-border tw-px-4 tw-py-3 tw-text-sm [&>svg]:tw-mt-0.5 [&>svg]:tw-size-4 [&>svg]:tw-shrink-0",
  {
    variants: {
      variant: {
        default: "tw-border-border tw-bg-card tw-text-foreground",
        info: "tw-border-info/25 tw-bg-info/8 tw-text-info [&>svg]:tw-text-info",
        success:
          "tw-border-success/25 tw-bg-success/8 tw-text-success [&>svg]:tw-text-success",
        warning:
          "tw-border-warning/35 tw-bg-warning/12 tw-text-warning-foreground [&>svg]:tw-text-warning",
        destructive:
          "tw-border-destructive/25 tw-bg-destructive/8 tw-text-destructive [&>svg]:tw-text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("tw-mb-0.5 tw-font-semibold tw-leading-none", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("tw-text-sm tw-opacity-90 [&_p]:tw-leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
