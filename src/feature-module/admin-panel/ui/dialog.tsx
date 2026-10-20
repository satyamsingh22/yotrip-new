import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "tw-fixed tw-inset-0 tw-z-[1080] tw-bg-slate-950/55 tw-backdrop-blur-sm",
      "data-[state=open]:tw-animate-fade-in",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  // The portal renders outside .admin-area, so re-assert the scope here.
  <DialogPortal>
    <div className="admin-area">
      <DialogOverlay />
      {/* Flexbox centering — transform-based centering is unreliable here because
          preflight is disabled (uninitialized --tw-translate vars) and the scale-in
          animation overwrites `transform`. */}
      <div className="tw-pointer-events-none tw-fixed tw-inset-0 tw-z-[1090] tw-flex tw-items-center tw-justify-center tw-p-4">
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "tw-pointer-events-auto tw-relative tw-grid tw-max-h-[calc(100dvh-2rem)] tw-w-full tw-max-w-lg tw-gap-4 tw-overflow-y-auto",
            "tw-rounded-2xl tw-border tw-border-border/80 tw-bg-card tw-p-6 tw-shadow-lift",
            "data-[state=open]:tw-animate-scale-in",
            className
          )}
          {...props}
        >
          {children}
          <DialogPrimitive.Close className="tw-absolute tw-right-4 tw-top-4 tw-rounded-md tw-p-1 tw-text-muted-foreground tw-opacity-70 tw-transition-opacity hover:tw-bg-muted hover:tw-opacity-100 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-ring">
            <X className="tw-size-4" />
            <span className="tw-sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </div>
    </div>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("tw-flex tw-flex-col tw-gap-1.5 tw-pr-6", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "tw-flex tw-flex-col-reverse tw-gap-2 sm:tw-flex-row sm:tw-justify-end",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("tw-text-lg tw-font-bold tw-tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("tw-text-sm tw-text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
