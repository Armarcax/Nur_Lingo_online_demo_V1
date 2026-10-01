"use client";

import {
  useState,
  useEffect,
  ReactNode,
} from "react";

/* ─────────────────────────────────────────────
   LANGUAGE
───────────────────────────────────────────── */

export type AppLanguage = "hy" | "en" | "ru";

/* ─────────────────────────────────────────────
   BACKGROUND DEFINITION
───────────────────────────────────────────── */

export interface ThemeBackgroundItem {
  id: string;

  title: {
    hy: string;
    en: string;
    ru: string;
  };

  dark: string;
  light: string;

  preview: string;
}

/* ─────────────────────────────────────────────
   BACKGROUND LIST
───────────────────────────────────────────── */

export const THEME_BACKGROUNDS: ThemeBackgroundItem[] = [
  {
    id: "pomegranate",

    title: {
      hy: "Նուռ",
      en: "Pomegranate",
      ru: "Гранат",
    },

    dark: "/images/pomegranate-dark.jpg",
    light: "/images/pomegranate-light.jpg",

    preview: "/images/pomegranate-light.jpg",
  },

  {
    id: "aeroplane",

    title: {
      hy: "Օդանավ",
      en: "Aeroplane",
      ru: "Самолёт",
    },

    dark: "/images/Aeroplane-dark.jpeg",
    light: "/images/Aeroplane-light.jpeg",

    preview: "/images/Aeroplane-light.jpeg",
  },

  {
    id: "beehive",

    title: {
      hy: "Մեղվափեթակ",
      en: "Beehive",
      ru: "Пчелиный улей",
    },

    dark: "/images/beehive black-dark.jpeg",
    light: "/images/beehive gray-light.jpeg",

    preview: "/images/beehive gray-light.jpeg",
  },

  {
    id: "tornPaper",

    title: {
      hy: "Պատռված թուղթ",
      en: "Torn Paper",
      ru: "Рваная бумага",
    },

    dark: "/images/Orange + Black torn paper-dark.jpeg",
    light: "/images/Beige + Browntan paper-light.png",

    preview: "/images/Beige + Browntan paper-light.png",
  },

  {
    id: "waterPaper",

    title: {
      hy: "Ջուր և թուղթ",
      en: "Water & Paper",
      ru: "Вода и бумага",
    },

    dark: "/images/Black+water paper-dark.jpeg",
    light: "/images/Green + white paper-light.jpeg",

    preview: "/images/Green + white paper-light.jpeg",
  },

  {
    id: "blueRedPaper",

    title: {
      hy: "Կապույտ և կարմիր",
      en: "Blue & Red",
      ru: "Синий и красный",
    },

    dark: "/images/Blue+red paper-dark.jpeg",
    light: "/images/Pink+skyblue-light.jpeg",

    preview: "/images/Pink+skyblue-light.jpeg",
  },

  {
    id: "brown",

    title: {
      hy: "Շագանակագույն",
      en: "Brown",
      ru: "Коричневый",
    },

    dark: "/images/Brown-dark.jpeg",
    light: "/images/LightGray-light.jpeg",

    preview: "/images/LightGray-light.jpeg",
  },

  {
    id: "canCant",

    title: {
      hy: "Կարող եմ / Չեմ կարող",
      en: "CAN / CAN'T",
      ru: "МОГУ / НЕ МОГУ",
    },

    dark: "/images/CAN-CAN'T-dark.jpeg",
    light: "/images/CAN-CAN'T-light.jpeg",

    preview: "/images/CAN-CAN'T-light.jpeg",
  },

  {
    id: "redPink",

    title: {
      hy: "Կարմիր և վարդագույն",
      en: "Red & Pink",
      ru: "Красный и розовый",
    },

    dark: "/images/DeepRed-dark.jpeg",
    light: "/images/DustyPink-light.jpeg",

    preview: "/images/DustyPink-light.jpeg",
  },

  {
    id: "tealLime",

    title: {
      hy: "Թեյլ և լայմ",
      en: "Teal & Lime",
      ru: "Бирюзовый и лаймовый",
    },

    dark: "/images/DeepTeal-dark.jpeg",
    light: "/images/LimeGreen-light.jpeg",

    preview: "/images/LimeGreen-light.jpeg",
  },

  {
    id: "dialog",

    title: {
      hy: "Երկխոսություն",
      en: "Dialog",
      ru: "Диалог",
    },

    dark: "/images/Dialog-dark.jpeg",
    light: "/images/Dialog-light.jpeg",

    preview: "/images/Dialog-light.jpeg",
  },

  {
    id: "dictionary",

    title: {
      hy: "Բառարան",
      en: "Dictionary",
      ru: "Словарь",
    },

    dark: "/images/Dictionary-dark.jpeg",
    light: "/images/Dictionary-light.jpeg",

    preview: "/images/Dictionary-light.jpeg",
  },

  {
    id: "pistol",

    title: {
      hy: "Ատրճանակ",
      en: "Pistol",
      ru: "Пистолет",
    },

    dark: "/images/Firing pistol-dark.jpeg",
    light: "/images/Silenced pistol-light.jpeg",

    preview: "/images/Silenced pistol-light.jpeg",
  },

  {
    id: "im",

    title: {
      hy: "Ես եմ",
      en: "I'm",
      ru: "Я",
    },

    dark: "/images/I'm-dark.jpeg",
    light: "/images/I'm-light.jpeg",

    preview: "/images/I'm-light.jpeg",
  },

  {
    id: "yinYangSwan",

    title: {
      hy: "Յին և Յան կարապներ",
      en: "Yin-Yang Swans",
      ru: "Лебеди Инь-Ян",
    },

    dark: "/images/Yin-Yang Swan-dark.jpeg",
    light: "/images/Yin-Yang Swan-light.jpeg",

    preview: "/images/Yin-Yang Swan-light.jpeg",
  },
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

export function getThemeBackground(
  id: string
): ThemeBackgroundItem {
  return (
    THEME_BACKGROUNDS.find(
      (item) => item.id === id
    ) ??
    THEME_BACKGROUNDS[0]
  );
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

interface ThemeBackgroundProps {
  children: ReactNode;

  className?: string;

  /**
   * Selected background.
   * Default: pomegranate
   */
  background?: string;

  /**
   * Current application language.
   */
  language?: AppLanguage;

  /**
   * Backwards compatibility:
   * Direct image overrides.
   */
  darkImage?: string;
  lightImage?: string;

  showNoise?: boolean;
  showVignette?: boolean;
  showOverlay?: boolean;

  imageOpacity?: number;
}

export function ThemeBackground({
  children,

  className = "",

  background = "pomegranate",

  language = "hy",

  darkImage,
  lightImage,

  showNoise = true,
  showVignette = true,
  showOverlay = true,

  imageOpacity = 1,
}: ThemeBackgroundProps) {
  const [isDark, setIsDark] =
    useState(false);

  const [isMounted, setIsMounted] =
    useState(false);

  /* ─────────────────────────────────────────
     THEME DETECTION
  ───────────────────────────────────────── */

  useEffect(() => {
    setIsMounted(true);

    const checkTheme = () => {
      const dark =
        document.documentElement.classList.contains(
          "dark"
        );

      setIsDark(dark);
    };

    checkTheme();

    const observer =
      new MutationObserver(checkTheme);

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: ["class"],
      }
    );

    return () =>
      observer.disconnect();
  }, []);

  /* ─────────────────────────────────────────
     SELECT BACKGROUND
  ───────────────────────────────────────── */

  const selected =
    getThemeBackground(background);

  /*
   * Direct image props have priority.
   * Otherwise use the selected pair.
   */
  const currentDarkImage =
    darkImage ?? selected.dark;

  const currentLightImage =
    lightImage ?? selected.light;

  const currentImage = isDark
    ? currentDarkImage
    : currentLightImage;

  /* ─────────────────────────────────────────
     SSR / HYDRATION
  ───────────────────────────────────────── */

  if (!isMounted) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */

  return (
    <div
      className={`relative min-h-screen ${className}`}
    >
      {/* ───────────────────────────────
          LAYER 1 — BACKGROUND
      ─────────────────────────────── */}

      <div
        className="
          fixed
          inset-0
          -z-10
          bg-cover
          bg-center
          bg-no-repeat
          transition-all
          duration-500
        "
        style={{
          backgroundImage:
            `url("${currentImage}")`,

          opacity: imageOpacity,
        }}
      />

      {/* ───────────────────────────────
          LAYER 2 — OVERLAY
      ─────────────────────────────── */}

      {showOverlay && (
        <div
          className="
            fixed
            inset-0
            -z-10
            transition-opacity
            duration-500
          "
          style={{
            background: isDark
              ? "linear-gradient(180deg, rgba(13,13,20,0.3) 0%, rgba(13,13,20,0.5) 100%)"
              : "linear-gradient(180deg, rgba(250,248,246,0.2) 0%, rgba(250,248,246,0.4) 100%)",
          }}
        />
      )}

      {/* ───────────────────────────────
          LAYER 3 — GLASS
      ─────────────────────────────── */}

      <div
        className="
          fixed
          inset-0
          -z-10
          pointer-events-none
        "
        style={{
          background: isDark
            ? "rgba(13,13,20,0.15)"
            : "rgba(255,255,255,0.1)",

          backdropFilter:
            "blur(2px)",

          WebkitBackdropFilter:
            "blur(2px)",
        }}
      />

      {/* ───────────────────────────────
          LAYER 4 — NOISE
      ─────────────────────────────── */}

      {showNoise && (
        <div
          className="
            fixed
            inset-0
            -z-10
            opacity-[0.02]
            pointer-events-none
          "
          style={{
            backgroundImage:
              `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,

            backgroundSize:
              "256px 256px",
          }}
        />
      )}

      {/* ───────────────────────────────
          LAYER 5 — VIGNETTE
      ─────────────────────────────── */}

      {showVignette && (
        <div
          className="
            fixed
            inset-0
            -z-10
            pointer-events-none
          "
          style={{
            background: isDark
              ? "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)"
              : "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.06) 100%)",
          }}
        />
      )}

      {/* ───────────────────────────────
          CONTENT
      ─────────────────────────────── */}

      {children}
    </div>
  );
}