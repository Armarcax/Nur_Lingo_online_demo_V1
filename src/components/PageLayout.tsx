// src/components/PageLayout.tsx
"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  noPadding?: boolean;
  noHeader?: boolean;
  headerClassName?: string;
  containerClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  animate?: boolean;
  delay?: number;
}

export function PageLayout({
  children,
  title,
  subtitle,
  icon,
  className,
  noPadding = false,
  noHeader = false,
  headerClassName,
  containerClassName,
  titleClassName,
  subtitleClassName,
  animate = true,
  delay = 0,
}: PageLayoutProps) {
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: 0.4,
          delay,
          ease: [0.16, 1, 0.3, 1],
        },
      }
    : {};

  return (
    <div className={cn("min-h-screen bg-transparent dark:bg-transparent text-gray-900 dark:text-white pb-24", className)}>
      <div className={cn("max-w-6xl mx-auto px-4", noPadding ? "" : "py-4 sm:py-6", containerClassName)}>
        {!noHeader && (title || subtitle) && (
          <motion.div
            {...animationProps}
            className={cn("flex items-start gap-4 mb-6", headerClassName)}
          >
            {icon && (
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 rounded-2xl bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 flex items-center justify-center text-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                  {icon}
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <h1 className={cn(
                  "text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white",
                  titleClassName
                )}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className={cn(
                  "text-sm text-gray-500 dark:text-gray-400 mt-0.5",
                  subtitleClassName
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          {...animationProps}
          transition={{
            duration: 0.4,
            delay: delay + 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}