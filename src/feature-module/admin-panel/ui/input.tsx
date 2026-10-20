import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "tw-flex tw-h-10 tw-w-full tw-rounded-lg tw-border tw-border-input tw-bg-card tw-px-3.5 tw-py-2 tw-text-sm tw-text-foreground tw-shadow-soft tw-transition-all",
        "placeholder:tw-text-muted-foreground/70",
        "focus-visible:tw-outline-none focus-visible:tw-border-ring focus-visible:tw-ring-4 focus-visible:tw-ring-ring/15",
        "disabled:tw-cursor-not-allowed disabled:tw-opacity-60",
        "file:tw-border-0 file:tw-bg-transparent file:tw-text-sm file:tw-font-medium",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "tw-flex tw-min-h-[90px] tw-w-full tw-rounded-lg tw-border tw-border-input tw-bg-card tw-px-3.5 tw-py-2.5 tw-text-sm tw-text-foreground tw-shadow-soft tw-transition-all",
      "placeholder:tw-text-muted-foreground/70",
      "focus-visible:tw-outline-none focus-visible:tw-border-ring focus-visible:tw-ring-4 focus-visible:tw-ring-ring/15",
      "disabled:tw-cursor-not-allowed disabled:tw-opacity-60",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Input, Textarea };
