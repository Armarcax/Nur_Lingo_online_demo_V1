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

// ─── MODULE-LEVEL STATE (shared across ALL hook instances) ──────────

let globalSettings: BackgroundSettings = DEFAULT_SETTINGS;
let isInitialized = false;
const listeners = new Set<(s: BackgroundSettings) => void>();

function loadFromStorage(): BackgroundSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn("Failed to load background settings:", e);
  }
  return DEFAULT_SETTINGS;
}

function initializeIfNeeded() {
  if (!isInitialized && typeof window !== "undefined") {
    globalSettings = loadFromStorage();
    isInitialized = true;
  }
}

function updateGlobal(updates: Partial<BackgroundSettings>) {
  globalSettings = { ...globalSettings, ...updates };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalSettings));
  } catch (e) {
    console.warn("Failed to save background settings:", e);
  }
  // Notify ALL listeners (all useBackground instances)
  listeners.forEach((listener) => listener(globalSettings));
}

// ─── HOOK ───────────────────────────────────────────────────────────

export function useBackground() {
  // Initialize on first hook use (client-side only)
  initializeIfNeeded();

  const [settings, setLocalSettings] = useState<BackgroundSettings>(globalSettings);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Sync with current global state
    setLocalSettings(globalSettings);

    // Register listener
    const handler = (s: BackgroundSettings) => {
      setLocalSettings(s);
    };
    listeners.add(handler);

    return () => {
      listeners.delete(handler);
    };
  }, []);

  const updateSettings = useCallback((updates: Partial<BackgroundSettings>) => {
    updateGlobal(updates);
  }, []);

  const resetSettings = useCallback(() => {
    updateGlobal(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings, isMounted };
}