"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: 
          "bg-primary text-primary-foreground shadow-premium hover:bg-primary/90 hover:shadow-premium hover:scale-[1.02]",
        destructive: 
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md",
        outline:
          "border border-input/50 bg-background/50 backdrop-blur-soft shadow-sm hover:bg-accent/10 hover:text-accent-foreground hover:border-accent/30 hover:shadow-glass",
        secondary: 
          "bg-secondary/80 text-secondary-foreground shadow-sm backdrop-blur-soft hover:bg-secondary/90 hover:shadow-md",
        ghost: 
          "hover:bg-accent/10 hover:text-accent-foreground hover:backdrop-blur-soft",
        link: 
          "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        glass: 
          "bg-glass-light backdrop-blur-soft border border-glass-border text-foreground shadow-glass hover:bg-glass-medium hover:shadow-glass-lg hover:scale-[1.02]",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
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
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };


