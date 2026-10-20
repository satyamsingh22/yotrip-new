import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-whitespace-nowrap tw-rounded-lg tw-text-sm tw-font-semibold tw-transition-all tw-duration-200 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 focus-visible:tw-ring-offset-background disabled:tw-pointer-events-none disabled:tw-opacity-50 active:tw-scale-[.97] [&_svg]:tw-pointer-events-none [&_svg]:tw-size-4 [&_svg]:tw-shrink-0",
  {
    variants: {
      variant: {
        default:
          "tw-bg-primary tw-text-primary-foreground tw-shadow-sm hover:tw-shadow-lift hover:-tw-translate-y-0.5 hover:tw-bg-primary/95",
        destructive:
          "tw-bg-destructive tw-text-destructive-foreground tw-shadow-sm hover:tw-shadow-lift hover:-tw-translate-y-0.5 hover:tw-bg-destructive/90",
        success:
          "tw-bg-success tw-text-success-foreground tw-shadow-sm hover:tw-shadow-lift hover:-tw-translate-y-0.5 hover:tw-bg-success/90",
        outline:
          "tw-border tw-border-input tw-bg-card tw-text-foreground tw-shadow-soft hover:tw-bg-accent hover:tw-text-accent-foreground hover:tw-border-border",
        secondary:
          "tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-secondary/70",
        ghost:
          "tw-text-foreground hover:tw-bg-accent hover:tw-text-accent-foreground",
        link: "tw-text-primary tw-underline-offset-4 hover:tw-underline",
      },
      size: {
        default: "tw-h-10 tw-px-4 tw-py-2",
        sm: "tw-h-9 tw-rounded-md tw-px-3 tw-text-[13px]",
        lg: "tw-h-11 tw-rounded-xl tw-px-6 tw-text-[15px]",
        icon: "tw-h-10 tw-w-10",
        "icon-sm": "tw-h-8 tw-w-8 tw-rounded-md [&_svg]:tw-size-[15px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
