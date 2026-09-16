// src/components/ui/glass-card.tsx
"use client";

import { ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";

export interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "world" | "lesson" | "compact" | "premium" | "glow";
  hover?: boolean;
  glow?: boolean;
  noPadding?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    children, 
    className, 
    variant = "default",
    hover = true,
    glow = false,
    noPadding = false,
    glass = true,
    onClick,
    ...props 
  }, ref) => {
    const baseStyles = glass 
      ? "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5"
      : "bg-white/10 dark:bg-gray-900/80";

    const variantStyles = {
      default: "rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]",
      world: "rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
      lesson: "rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]",
      compact: "rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]",
      premium: "rounded-xl bg-white/30 dark:bg-gray-900/50 backdrop-blur-[16px] saturate-[180%] border border-white/25 dark:border-white/6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.3)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]",
      glow: "rounded-xl bg-white/30 dark:bg-gray-900/50 backdrop-blur-[16px] saturate-[180%] border border-white/25 dark:border-white/6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.3),0_0_60px_rgba(239,68,68,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05),0_0_60px_rgba(239,68,68,0.05)]",
    };

    const hoverStyles = hover ? "hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:transform hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300" : "";

    const glowStyles = glow ? "relative before:content-[''] before:absolute before:inset-[-1px] before:rounded-[inherit] before:p-[1px] before:bg-gradient-to-br before:from-red-500/20 before:via-amber-500/20 before:to-red-500/20 before:-webkit-mask-[linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:-webkit-mask-composite-xor before:mask-composite-exclude before:pointer-events-none" : "";

    const paddingStyles = noPadding ? "" : "p-4 sm:p-5";

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          hoverStyles,
          glowStyles,
          paddingStyles,
          className
        )}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";