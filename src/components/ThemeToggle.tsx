// src/components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

interface ThemeToggleProps {
  className?: string;
  /**
   * Use theme provider context if available
   */
  useProvider?: boolean;
  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg";
}

export default function ThemeToggle({ 
  className = "", 
  useProvider = false,
  size = "md"
}: ThemeToggleProps) {
  const { t } = useI18n();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: "w-7 h-7 text-sm",
    md: "w-9 h-9 text-base",
    lg: "w-11 h-11 text-lg",
  };

  // ✅ Initialize theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    
    // Try to get saved theme
    const savedTheme = localStorage.getItem("nur_theme") ?? 
                       localStorage.getItem("theme") ?? 
                       "dark";
    
    const isDarkMode = savedTheme === "dark";
    setIsDark(isDarkMode);
    applyTheme(isDarkMode);
  }, []);

  // ✅ Apply theme to document
  const applyTheme = (dark: boolean) => {
    const theme = dark ? "dark" : "light";
    
    // For Tailwind dark: prefix
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // For CSS data-theme attribute
    document.documentElement.setAttribute("data-theme", theme);
    
    // For CSS custom properties
    document.documentElement.style.colorScheme = theme;
    
    // Save to localStorage
    localStorage.setItem("nur_theme", theme);
    localStorage.setItem("theme", theme);
  };

  // ✅ Toggle theme
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    applyTheme(newIsDark);

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent("themechange", { 
      detail: { theme: newIsDark ? "dark" : "light" } 
    }));
  };

  // ✅ Listen for theme changes from other components
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const theme = customEvent.detail?.theme;
      if (theme) {
        setIsDark(theme === "dark");
      }
    };

    window.addEventListener("themechange", handleThemeChange);
    return () => window.removeEventListener("themechange", handleThemeChange);
  }, []);

  // ✅ Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className={`${sizeClasses[size]} rounded-xl flex items-center justify-center transition-all duration-200 ${className}`}
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        aria-label={t("theme_toggle_aria")}
      >
        <span className="text-base opacity-50">🌙</span>
      </button>
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className={`${sizeClasses[size]} rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
      style={{
        background: isDark 
          ? "rgba(255,255,255,0.06)" 
          : "rgba(255,255,255,0.15)",
        border: isDark 
          ? "1px solid rgba(255,255,255,0.08)" 
          : "1px solid rgba(255,255,255,0.2)",
        backdropFilter: "blur(12px) saturate(1.2)",
        WebkitBackdropFilter: "blur(12px) saturate(1.2)",
        color: "inherit",
        boxShadow: isDark
          ? "0 4px 16px rgba(0,0,0,0.2)"
          : "0 4px 16px rgba(0,0,0,0.06)",
      }}
      aria-label={t("theme_toggle_aria")}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
    >
      <motion.span
        key={String(isDark)}
        initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-yellow-400 drop-shadow-glow" strokeWidth={2} />
        ) : (
          <Moon className="w-4 h-4 text-gray-600" strokeWidth={2} />
        )}
      </motion.span>
      
      {/* Glass reflection effect */}
      <span className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </motion.button>
  );
}

// ─── HOOK VERSION ────────────────────────────────────────────────────

export function useThemeToggle() {
  const { t } = useI18n();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("nur_theme") ?? 
                  localStorage.getItem("theme") ?? 
                  "dark";
    setIsDark(saved === "dark");
    applyTheme(saved === "dark");
  }, []);

  const applyTheme = (dark: boolean) => {
    const theme = dark ? "dark" : "light";
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("nur_theme", theme);
    localStorage.setItem("theme", theme);
  };

  const toggle = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    applyTheme(newIsDark);
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: newIsDark ? "dark" : "light" } }));
  };

  return { isDark, toggle, mounted };
}