"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/80 hover:scale-105",
        secondary:
          "border-transparent bg-secondary/80 text-secondary-foreground backdrop-blur-soft shadow-sm hover:bg-secondary/90 hover:scale-105",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/80 hover:scale-105",
        outline: 
          "border border-input/50 bg-background/30 backdrop-blur-soft text-foreground hover:bg-accent/10 hover:scale-105",
        success:
          "border-transparent bg-emerald-500/20 text-emerald-500 backdrop-blur-soft border border-emerald-500/20 hover:bg-emerald-500/30 hover:scale-105",
        warning:
          "border-transparent bg-yellow-500/20 text-yellow-500 backdrop-blur-soft border border-yellow-500/20 hover:bg-yellow-500/30 hover:scale-105",
        glass:
          "border border-white/10 bg-white/10 backdrop-blur-soft text-foreground/80 hover:bg-white/20 hover:scale-105",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };


