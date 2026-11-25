// src/components/layout/PageTabs.tsx
"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageTab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
}

interface PageTabsProps {
  tabs: PageTab[];
  value: string;
  onChange: (id: string) => void;
  variant?: "primary" | "subtle";
  className?: string;
}

export function PageTabs({
  tabs,
  value,
  onChange,
  variant = "subtle",
  className,
}: PageTabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "grid gap-2 rounded-2xl p-1.5",
        variant === "subtle"
          ? "bg-white/60 dark:bg-gray-900/50 border border-white/20 dark:border-white/5"
          : "bg-transparent",
        className
      )}
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-all",
              active
                ? "bg-rose-600 text-white shadow-lg shadow-rose-500/20"
                : "text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-800"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  active
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}