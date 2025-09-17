import * as React from "react"

import { cn } from "@/lib/utils"

function Table({
  className,
  ...props
},ref) {
  return (
    (<div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm bg-[#201E1D]", className)}
        {...props} />
    </div>)
  );
}

function TableHeader({
  className,
  ...props
}) {
  return (
    ( <thead  className={cn("[&_tr]: border-[#2F2C2A] bg-[#2F2C2A]", className)} {...props} />)
  );
}

function TableBody({
  className,
  ...props
}) {
  return (
    ( <tbody
     
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />)
  );
}

function TableFooter({
  className,
  ...props
}) {
  return (
    (<tfoot
   
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />)
  );
}

function TableRow({
  className,
  ...props
}) {
  return (
    (<tr
  
      className={cn(
        " transition-colors hover:bg-[#2F2C2A]/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />)
  );
}

function TableHead({
  className,
  ...props
}) {
  return (
    (<th

      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-[#94A3B8] [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />)
  );
}

function TableCell({
  className,
  ...props
}) {
  return (
    (<td
      data-slot="table-cell"
      className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props} />)
  );
}

function TableCaption({
  className,
  ...props
}) {
  return (
    (<caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props} />)
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
