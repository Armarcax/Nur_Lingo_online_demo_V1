// src/components/layout/PageShell.tsx
"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/BottomNav";

export type PageMaxWidth = "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";

export interface PageShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onBack?: () => void;
  backHref?: string;
  actions?: ReactNode;
  stickyHeader?: boolean;
  showBottomNav?: boolean;
  maxWidth?: PageMaxWidth;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  noContentPadding?: boolean;
  animate?: boolean;
}

const MAX_WIDTHS: Record<PageMaxWidth, string> = {
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export function PageShell({
  children,
  title,
  subtitle,
  icon,
  onBack,
  backHref,
  actions,
  stickyHeader = true,
  showBottomNav = true,
  maxWidth = "4xl",
  className,
  headerClassName,
  contentClassName,
  noContentPadding = false,
  animate = true,
}: PageShellProps) {
  const router = useRouter();
  const hasBack = !!onBack || !!backHref;

  const handleBack = () => {
    if (onBack) return onBack();
    if (backHref) return router.push(backHref);
    router.back();
  };

  const header = (
    <div
      className={cn(
        "border-b border-white/20 dark:border-white/5 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm",
        "shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)]",
        headerClassName
      )}
    >
      <div className={cn("mx-auto px-4 py-3 flex items-center gap-3", MAX_WIDTHS[maxWidth])}>
        {hasBack && (
          <button
            onClick={handleBack}
            className="p-2 rounded-xl hover:bg-white/10 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {icon && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D90012] to-[#FFA500] flex items-center justify-center shadow-lg border border-white/20 flex-shrink-0 text-white">
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );

  const content = (
    <div
      className={cn(
        "mx-auto px-4",
        MAX_WIDTHS[maxWidth],
        noContentPadding ? "" : "py-6",
        contentClassName
      )}
    >
      {children}
    </div>
  );

  return (
    <div
      className={cn(
        "min-h-screen bg-transparent dark:bg-transparent text-gray-900 dark:text-white",
        showBottomNav && "pb-24",
        className
      )}
    >
      {stickyHeader ? <div className="sticky top-0 z-30">{header}</div> : header}

      {animate ? (
        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {content}
        </motion.main>
      ) : (
        <main>{content}</main>
      )}

      {showBottomNav && <BottomNav />}
    </div>
  );
}