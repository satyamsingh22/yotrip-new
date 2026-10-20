import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "tw-relative tw-overflow-hidden tw-rounded-lg tw-bg-muted",
        "after:tw-absolute after:tw-inset-0 after:-tw-translate-x-full after:tw-animate-shimmer",
        "after:tw-bg-gradient-to-r after:tw-from-transparent after:tw-via-white/60 after:tw-to-transparent",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
