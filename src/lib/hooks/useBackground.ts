// src/lib/hooks/useBackground.ts
"use client";

import { useState, useEffect, useCallback } from "react";

export type BackgroundType = "image" | "solid" | "gradient";

export interface BackgroundSettings {
  type: BackgroundType;
  solidColor: string;
  gradientFrom: string;
  gradientTo: string;
}

const DEFAULT_SETTINGS: BackgroundSettings = {
  type: "image",
  solidColor: "#8B0000",
  gradientFrom: "#D90012",
  gradientTo: "#FFA500",
};

const STORAGE_KEY = "nur_background_settings";

export function useBackground() {
  const [settings, setSettings] = useState<BackgroundSettings>(DEFAULT_SETTINGS);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (e) {
      console.warn("Failed to load background settings:", e);
    }
  }, []);

  const updateSettings = useCallback((updates: Partial<BackgroundSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn("Failed to save background settings:", e);
      }
      // Dispatch event for other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("nur-background-change", { detail: next }));
      }
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("nur-background-change", { detail: DEFAULT_SETTINGS }));
      }
    } catch {}
  }, []);

  // Listen to changes from other components
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<BackgroundSettings>;
      setSettings(customEvent.detail);
    };
    window.addEventListener("nur-background-change", handler);
    return () => window.removeEventListener("nur-background-change", handler);
  }, []);

  return { settings, updateSettings, resetSettings, isMounted };
}