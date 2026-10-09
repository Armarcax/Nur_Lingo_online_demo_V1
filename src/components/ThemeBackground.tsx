"use client";

import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, X, Check } from "lucide-react";

export type AppLanguage = "hy" | "en" | "ru";

export interface ThemeBackgroundItem {
  id: string;
  title: { hy: string; en: string; ru: string };
  dark: string;
  light: string;
  preview: string;
}

export const THEME_BACKGROUNDS: ThemeBackgroundItem[] = [
  {
    id: "pomegranate",
    title: { hy: "Նուռ", en: "Pomegranate", ru: "Гранат" },
    dark: "/images/pomegranate-dark.jpg",
    light: "/images/pomegranate-light.jpg",
    preview: "/images/pomegranate-light.jpg",
  },
  {
    id: "aeroplane",
    title: { hy: "Օդանավ", en: "Aeroplane", ru: "Самолёт" },
    dark: "/images/Aeroplane-dark.jpeg",
    light: "/images/Aeroplane-light.jpeg",
    preview: "/images/Aeroplane-light.jpeg",
  },
  {
    id: "beehive",
    title: { hy: "Մեղվափեթակ", en: "Beehive", ru: "Пчелиный улей" },
    dark: "/images/beehive-black-dark.jpeg",
    light: "/images/beehive-gray-light.jpeg",
    preview: "/images/beehive-gray-light.jpeg",
  },
  {
    id: "tornPaper",
    title: { hy: "Պատռված թուղթ", en: "Torn Paper", ru: "Рваная бумага" },
    dark: "/images/orange-black-torn-paper-dark.jpeg",
    light: "/images/beige-brown-paper-light.png",
    preview: "/images/beige-brown-paper-light.png",
  },
  {
    id: "waterPaper",
    title: { hy: "Ջուր և թուղթ", en: "Water & Paper", ru: "Вода и бумага" },
    dark: "/images/black-water-paper-dark.jpeg",
    light: "/images/green-white-paper-light.jpeg",
    preview: "/images/green-white-paper-light.jpeg",
  },
  {
    id: "blueRedPaper",
    title: { hy: "Կապույտ և կարմիր", en: "Blue & Red", ru: "Синий и красный" },
    dark: "/images/blue-red-paper-dark.jpeg",
    light: "/images/pink-skyblue-light.jpeg",
    preview: "/images/pink-skyblue-light.jpeg",
  },
  {
    id: "brown",
    title: { hy: "Շագանակագույն", en: "Brown", ru: "Коричневый" },
    dark: "/images/Brown-dark.jpeg",
    light: "/images/LightGray-light.jpeg",
    preview: "/images/LightGray-light.jpeg",
  },
  {
    id: "canCant",
    title: { hy: "Կարող եմ / Չեմ կարող", en: "CAN / CAN'T", ru: "МОГУ / НЕ МОГУ" },
    dark: "/images/can-cant-dark.jpeg",
    light: "/images/can-cant-light.jpeg",
    preview: "/images/can-cant-light.jpeg",
  },
  {
    id: "redPink",
    title: { hy: "Կարմիր և վարդագույն", en: "Red & Pink", ru: "Красный и розовый" },
    dark: "/images/DeepRed-dark.jpeg",
    light: "/images/DustyPink-light.jpeg",
    preview: "/images/DustyPink-light.jpeg",
  },
  {
    id: "tealLime",
    title: { hy: "Թեյլ և լայմ", en: "Teal & Lime", ru: "Бирюзовый и лаймовый" },
    dark: "/images/DeepTeal-dark.jpeg",
    light: "/images/LimeGreen-light.jpeg",
    preview: "/images/LimeGreen-light.jpeg",
  },
  {
    id: "dialog",
    title: { hy: "Երկխոսություն", en: "Dialog", ru: "Диалог" },
    dark: "/images/Dialog-dark.jpeg",
    light: "/images/Dialog-light.jpeg",
    preview: "/images/Dialog-light.jpeg",
  },
  {
    id: "dictionary",
    title: { hy: "Բառարան", en: "Dictionary", ru: "Словарь" },
    dark: "/images/Dictionary-dark.jpeg",
    light: "/images/Dictionary-light.jpeg",
    preview: "/images/Dictionary-light.jpeg",
  },
  {
    id: "pistol",
    title: { hy: "Ատրճանակ", en: "Pistol", ru: "Пистолет" },
    dark: "/images/firing-pistol-dark.jpeg",
    light: "/images/silenced-pistol-light.jpeg",
    preview: "/images/silenced-pistol-light.jpeg",
  },
  {
    id: "im",
    title: { hy: "Ես եմ", en: "I'm", ru: "Я" },
    dark: "/images/im-dark.jpeg",
    light: "/images/Just-do-it-light.jpeg",
    preview: "/images/Just-do-it-light.jpeg",
  },
  {
    id: "yinYangSwan",
    title: { hy: "Յին և Յան կարապներ", en: "Yin-Yang Swans", ru: "Лебеди Инь-Ян" },
    dark: "/images/yin-yang-swan-dark.jpeg",
    light: "/images/yin-yang-swan-light.jpeg",
    preview: "/images/yin-yang-swan-light.jpeg",
  },
];

export function getThemeBackground(id: string): ThemeBackgroundItem {
  return (
    THEME_BACKGROUNDS.find((item) => item.id === id) ??
    THEME_BACKGROUNDS[0]
  );
}

const STORAGE_KEY = "nur_background_id";
const DEFAULT_BACKGROUND_ID = "pomegranate";

interface ThemeBackgroundProps {
  children: ReactNode;
  className?: string;
  background?: string;
  language?: AppLanguage;
  showSelector?: boolean;
}

export function ThemeBackground({
  children,
  className = "",
  background,
  language = "hy",
  showSelector = true,
}: ThemeBackgroundProps) {
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeId, setActiveId] = useState<string>(
    background ?? DEFAULT_BACKGROUND_ID
  );
  const [isOpen, setIsOpen] = useState(false);

  /* MOUNT */
  useEffect(() => {
    setIsMounted(true);

    if (background) {
      setActiveId(background);
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setActiveId(saved);
      } catch {}
    }
  }, [background]);

  /* THEME */
  useEffect(() => {
    const checkTheme = () => {
      const dark = document.documentElement.classList.contains("dark");
      setIsDark(dark);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  /* CHANGE */
  const changeBackground = (id: string) => {
    setActiveId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
    setIsOpen(false);
  };

  /* SELECT */
  const selected = getThemeBackground(activeId);
  const currentImage = isDark ? selected.dark : selected.light;

  const labels = {
    hy: { title: "Ֆոնի Տեսք", subtitle: "Ընտրիր ֆոնը" },
    en: { title: "Background Style", subtitle: "Choose your background" },
    ru: { title: "Стиль Фона", subtitle: "Выберите фон" },
  };
  const L = labels[language] || labels.hy;

  if (!isMounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* BACKGROUND — single img, no layers */}
      <img
        key={currentImage}
        src={currentImage}
        alt=""
        className="fixed inset-0 w-full h-full object-cover pointer-events-none"
        style={{
          zIndex: -1,
        }}
      />

      {/* DARK MODE OVERLAY — very light */}
      {isDark && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: -1,
            background: "rgba(0,0,0,0.25)",
          }}
        />
      )}

      {/* CONTENT */}
      {children}

      {/* PALETTE BUTTON */}
      {showSelector && (
        <>
          <button
            onClick={() => setIsOpen(true)}
            className="fixed top-4 right-4 z-[60] p-2.5 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-white/30 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all shadow-lg"
            title={L.title}
            aria-label={L.title}
          >
            <Palette size={18} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700 shadow-2xl flex flex-col"
                >
                  <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Palette size={20} className="text-red-500" />
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {L.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {L.subtitle}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                      aria-label="Close"
                    >
                      <X size={18} className="text-gray-500" />
                    </button>
                  </div>

                  <div className="p-5 overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {THEME_BACKGROUNDS.map((bg) => {
                        const isActive = activeId === bg.id;
                        return (
                          <button
                            key={bg.id}
                            onClick={() => changeBackground(bg.id)}
                            className={`group relative flex flex-col rounded-xl overflow-hidden border-2 transition-all ${
                              isActive
                                ? "border-red-500 ring-2 ring-red-500/30"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                            }`}
                          >
                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                              <img
                                src={bg.preview}
                                alt={bg.title[language]}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                              {isActive && (
                                <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                                  <Check size={14} className="text-white" strokeWidth={3} />
                                </div>
                              )}
                            </div>
                            <div className="px-2 py-2 text-left bg-white dark:bg-gray-900">
                              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                {bg.title[language]}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}