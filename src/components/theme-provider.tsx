// src/components/theme-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";
const STORAGE_KEY = "nur:theme";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  // Load stored theme on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null;
      if (stored) {
        setTheme(stored);
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefersDark ? "dark" : "light");
      }
    } catch {
      setTheme(defaultTheme);
    }
  }, [storageKey, defaultTheme]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const resolved = theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : theme as "light" | "dark";

    setResolvedTheme(resolved);

    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.style.colorScheme = resolved;

    try {
      localStorage.setItem(storageKey, theme);
    } catch {}

    window.dispatchEvent(new CustomEvent("themechange", {
      detail: { theme: resolved }
    }));
  }, [theme, mounted, storageKey]);

  // Listen to system preference changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        const resolved = mediaQuery.matches ? "dark" : "light";
        setResolvedTheme(resolved);
        if (resolved === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        document.documentElement.setAttribute("data-theme", resolved);
        document.documentElement.style.colorScheme = resolved;
      }
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme, mounted]);

  const toggle = () => {
    setTheme(prev => {
      if (prev === "system") return "dark";
      return prev === "dark" ? "light" : "dark";
    });
  };

  const setThemeDirect = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: setThemeDirect,
        toggle,
        resolvedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    const [fallbackTheme, setFallbackTheme] = useState<Theme>("light");
    const [resolved, setResolved] = useState<"light" | "dark">("light");

    useEffect(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setFallbackTheme(isDark ? "dark" : "light");
      setResolved(isDark ? "dark" : "light");
    }, []);

    return {
      theme: fallbackTheme,
      resolvedTheme: resolved,
      setTheme: (t: Theme) => {
        const resolved = t === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
          : t as "light" | "dark";
        document.documentElement.classList.toggle("dark", resolved === "dark");
        document.documentElement.setAttribute("data-theme", resolved);
        document.documentElement.style.colorScheme = resolved;
        try { localStorage.setItem(STORAGE_KEY, t); } catch {}
        setFallbackTheme(t);
        setResolved(resolved);
        window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: resolved } }));
      },
      toggle: () => {
        const newTheme = fallbackTheme === "dark" ? "light" : "dark";
        setFallbackTheme(newTheme);
        const resolved = newTheme === "dark" ? "dark" : "light";
        document.documentElement.classList.toggle("dark", resolved === "dark");
        document.documentElement.setAttribute("data-theme", resolved);
        document.documentElement.style.colorScheme = resolved;
        try { localStorage.setItem(STORAGE_KEY, newTheme); } catch {}
        setResolved(resolved);
        window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: resolved } }));
      },
    };
  }
  return context;
}

export function getCurrentTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function prefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY) as Theme | null;
  } catch {
    return null;
  }
}

export default ThemeProvider;