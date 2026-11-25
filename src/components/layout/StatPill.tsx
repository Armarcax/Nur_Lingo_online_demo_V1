// src/components/layout/StatPill.tsx
"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Color = "red" | "amber" | "blue" | "emerald" | "purple" | "gray" | "orange";

interface StatPillProps {
  icon?: ReactNode;
  value: ReactNode;
  label?: string;
  color?: Color;
  onClick?: () => void;
  active?: boolean;
  title?: string;
  className?: string;
}

const COLORS: Record<Color, { bg: string; text: string; border: string }> = {
  red: {
    bg: "bg-red-500/15",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/30",
  },
  amber: {
    bg: "bg-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
  },
  blue: {
    bg: "bg-blue-500/15",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30",
  },
  emerald: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30",
  },
  purple: {
    bg: "bg-purple-500/15",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/30",
  },
  orange: {
    bg: "bg-orange-500/15",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/30",
  },
  gray: {
    bg: "bg-white/40 dark:bg-gray-900/50",
    text: "text-gray-600 dark:text-gray-400",
    border: "border-white/20 dark:border-white/5",
  },
};

export function StatPill({
  icon,
  value,
  label,
  color = "gray",
  onClick,
  active = false,
  title,
  className,
}: StatPillProps) {
  const c = COLORS[color];
  return (
    <div
      onClick={onClick}
      title={title}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "backdrop-blur-sm border rounded-xl px-2.5 py-1.5 flex items-center gap-1 text-sm font-bold",
        c.bg,
        c.text,
        c.border,
        onClick && "cursor-pointer hover:brightness-110 active:scale-95 transition-all",
        active && "ring-2 ring-current ring-offset-1 ring-offset-transparent",
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{value}</span>
      {label && (
        <span className="text-[9px] font-normal opacity-70 ml-0.5">{label}</span>
      )}
    </div>
  );
}