import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "tw-flex tw-h-10 tw-w-full tw-items-center tw-justify-between tw-gap-2 tw-rounded-lg tw-border tw-border-input tw-bg-card tw-px-3.5 tw-py-2 tw-text-sm tw-shadow-soft tw-transition-all",
      "placeholder:tw-text-muted-foreground focus:tw-outline-none focus:tw-border-ring focus:tw-ring-4 focus:tw-ring-ring/15",
      "disabled:tw-cursor-not-allowed disabled:tw-opacity-60 [&>span]:tw-line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="tw-size-4 tw-opacity-60" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <div className="admin-area">
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        className={cn(
          "tw-relative tw-z-[1090] tw-max-h-96 tw-min-w-[8rem] tw-overflow-hidden tw-rounded-xl tw-border tw-border-border/80 tw-bg-popover tw-text-popover-foreground tw-shadow-lift data-[state=open]:tw-animate-scale-in",
          position === "popper" &&
            "data-[side=bottom]:tw-translate-y-1 data-[side=top]:-tw-translate-y-1",
          className
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="tw-flex tw-h-6 tw-items-center tw-justify-center">
          <ChevronUp className="tw-size-4" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport
          className={cn(
            "tw-p-1.5",
            position === "popper" &&
              "tw-h-[var(--radix-select-trigger-height)] tw-w-full tw-min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="tw-flex tw-h-6 tw-items-center tw-justify-center">
          <ChevronDown className="tw-size-4" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </div>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "tw-relative tw-flex tw-w-full tw-cursor-pointer tw-select-none tw-items-center tw-rounded-lg tw-py-2 tw-pl-8 tw-pr-2.5 tw-text-sm tw-font-medium tw-outline-none tw-transition-colors",
      "focus:tw-bg-accent focus:tw-text-accent-foreground data-[disabled]:tw-pointer-events-none data-[disabled]:tw-opacity-50",
      className
    )}
    {...props}
  >
    <span className="tw-absolute tw-left-2 tw-flex tw-size-3.5 tw-items-center tw-justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="tw-size-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "tw-px-2 tw-py-1.5 tw-text-[11px] tw-font-bold tw-uppercase tw-tracking-wider tw-text-muted-foreground",
      className
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-tw-mx-1 tw-my-1 tw-h-px tw-bg-border", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
};
