// src/lib/hooks/useTheme.ts
"use client";

import { useState, useEffect, useCallback } from "react";

export type ThemePresetId =
  | "default"
  | "blue"
  | "green"
  | "purple"
  | "charcoal";

export interface ThemeColors {
  lightFrom: string;
  lightTo: string;
  darkFrom: string;
  darkTo: string;
}

export interface ThemePreset {
  id: ThemePresetId;
  label: { hy: string; en: string; ru: string };
  emoji: string;
  colors: ThemeColors;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "default",
    label: {
      hy: "🏆 NUR Lingo (խորհուրդ)",
      en: "🏆 NUR Lingo (recommended)",
      ru: "🏆 NUR Lingo (рекомендуется)",
    },
    emoji: "🏆",
    colors: {
      lightFrom: "#F4F7F5",
      lightTo: "#E8F0EA",
      darkFrom: "#111A19",
      darkTo: "#172421",
    },
  },
  {
    id: "blue",
    label: { hy: "🌙 Հանգիստ կապույտ", en: "🌙 Calm blue", ru: "🌙 Спокойный синий" },
    emoji: "🌙",
    colors: {
      lightFrom: "#F4F8FC",
      lightTo: "#EAF3FA",
      darkFrom: "#101827",
      darkTo: "#162238",
    },
  },
  {
    id: "green",
    label: { hy: "🌲 Բնական կանաչ", en: "🌲 Natural green", ru: "🌲 Природный зелёный" },
    emoji: "🌲",
    colors: {
      lightFrom: "#F3F8F5",
      lightTo: "#E8F2EC",
      darkFrom: "#101A18",
      darkTo: "#172622",
    },
  },
  {
    id: "purple",
    label: { hy: "🌌 Մանուշակագույն", en: "🌌 Lavender", ru: "🌌 Лаванда" },
    emoji: "🌌",
    colors: {
      lightFrom: "#F8F6FC",
      lightTo: "#F0ECF8",
      darkFrom: "#151321",
      darkTo: "#211D31",
    },
  },
  {
    id: "charcoal",
    label: { hy: "🪨 Մինիմալ", en: "🪨 Minimal", ru: "🪨 Минимал" },
    emoji: "🪨",
    colors: {
      lightFrom: "#F7F7F5",
      lightTo: "#EEEEEB",
      darkFrom: "#17191C",
      darkTo: "#22262A",
    },
  },
];

// ─── MODULE-LEVEL STATE ───
const STORAGE_KEY = "nur_theme_preset";
const PATTERN_KEY = "nur_theme_pattern";

let globalThemeId: ThemePresetId = "default";
let globalPatternEnabled = true;
let isInitialized = false;
const listeners = new Set<() => void>();

function loadFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemePresetId | null;
    if (saved && THEME_PRESETS.some((p) => p.id === saved)) globalThemeId = saved;
    const pattern = localStorage.getItem(PATTERN_KEY);
    if (pattern !== null) globalPatternEnabled = pattern === "true";
  } catch (e) {
    console.warn("Failed to load theme:", e);
  }
}

function initializeIfNeeded() {
  if (!isInitialized && typeof window !== "undefined") {
    loadFromStorage();
    isInitialized = true;
  }
}

function notifyAll() {
  listeners.forEach((l) => l());
}

function setThemeId(id: ThemePresetId) {
  globalThemeId = id;
  try { localStorage.setItem(STORAGE_KEY, id); } catch {}
  notifyAll();
}

function setPattern(enabled: boolean) {
  globalPatternEnabled = enabled;
  try { localStorage.setItem(PATTERN_KEY, String(enabled)); } catch {}
  notifyAll();
}

// ─── HOOK ───
export function useTheme() {
  initializeIfNeeded();

  const [themeId, setLocalThemeId] = useState<ThemePresetId>(globalThemeId);
  const [patternEnabled, setLocalPatternEnabled] = useState(globalPatternEnabled);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setLocalThemeId(globalThemeId);
    setLocalPatternEnabled(globalPatternEnabled);

    const handler = () => {
      setLocalThemeId(globalThemeId);
      setLocalPatternEnabled(globalPatternEnabled);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const updateTheme = useCallback((id: ThemePresetId) => setThemeId(id), []);
  const updatePattern = useCallback((enabled: boolean) => setPattern(enabled), []);

  const currentPreset =
    THEME_PRESETS.find((p) => p.id === themeId) ?? THEME_PRESETS[0];

  return {
    themeId,
    currentPreset,
    patternEnabled,
    updateTheme,
    updatePattern,
    isMounted,
  };
}