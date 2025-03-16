import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Pagination = React.forwardRef(({ className, children, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn("flex items-center justify-between space-x-2", className)}
    {...props}
  >
    {children}
  </nav>
));
Pagination.displayName = "Pagination";

const PaginationList = React.forwardRef(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("flex items-center space-x-1", className)} {...props} />
));
PaginationList.displayName = "PaginationList";

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("flex", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

const PaginationLink = React.forwardRef(({ className, active, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors",
      active ? "bg-primary text-white" : "hover:bg-accent",
      className
    )}
    {...props}
  />
));
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = React.forwardRef(({ className, ...props }, ref) => (
  <PaginationLink ref={ref} className={cn("ml-0", className)} {...props}>
    <ChevronLeft className="h-4 w-4" />
  </PaginationLink>
));
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = React.forwardRef(({ className, ...props }, ref) => (
  <PaginationLink ref={ref} className={cn("mr-0", className)} {...props}>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
));
PaginationNext.displayName = "PaginationNext";

export {
  Pagination,
  PaginationList,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
};
