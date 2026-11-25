// src/components/layout/PageHero.tsx
"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageHeroStat {
  icon: ReactNode;
  value: ReactNode;
  label?: string;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  stats?: PageHeroStat[];
  children?: ReactNode;
  className?: string;
}

export function PageHero({ title, subtitle, stats, children, className }: PageHeroProps) {
  return (
    <section className={cn("text-center px-2 pb-6", className)}>
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter italic text-gray-900 dark:text-white leading-none"
      >
        {title}
      </motion.h1>
      {subtitle && (
        <p className="mt-3 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.25em] text-[11px]">
          {subtitle}
        </p>
      )}

      {stats && stats.length > 0 && (
        <div className="mt-4 flex items-center justify-center gap-5 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
          {stats.map((s, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {s.icon}
              <span className="font-bold">{s.value}</span>
              {s.label && <span className="opacity-80">{s.label}</span>}
            </span>
          ))}
        </div>
      )}

      {children}
    </section>
  );
}