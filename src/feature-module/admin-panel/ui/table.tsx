import * as React from "react";
import { cn } from "@/lib/utils";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="admin-scroll tw-relative tw-w-full tw-overflow-x-auto tw-rounded-xl tw-border tw-border-border/80 tw-bg-card">
    <table
      ref={ref}
      className={cn("tw-w-full tw-caption-bottom tw-text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("[&_tr]:tw-border-b [&_tr]:tw-border-border/70", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:tw-border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "tw-border-b tw-border-border/60 tw-transition-colors hover:tw-bg-muted/60 data-[state=selected]:tw-bg-muted",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "tw-sticky tw-top-0 tw-z-10 tw-h-11 tw-bg-muted/70 tw-px-4 tw-text-left tw-align-middle tw-text-[11px] tw-font-bold tw-uppercase tw-tracking-wider tw-text-muted-foreground tw-backdrop-blur",
      "[&:has([role=checkbox])]:tw-pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "tw-px-4 tw-py-3 tw-align-middle tw-text-foreground/90 [&:has([role=checkbox])]:tw-pr-0",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
