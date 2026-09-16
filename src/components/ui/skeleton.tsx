"use client";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 bg-[length:200%_100%] shimmer",
        className
      )} 
      {...props} 
    />
  );
}

export { Skeleton };


