// src/components/ThemeBackground.tsx
"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, X, Check } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import type { LangCode } from "@/lib/i18n/index";

// ─── TYPES ────────────────────────────────────────────────────────────

export type AppLanguage = LangCode;

export interface ThemeBackgroundItem {
  id: string;
  /** Translation key — resolved at render time via t() */
  titleKey: string;
  dark: string;
  light: string;
  preview: string;
}

// ─── DATA (frozen to prevent accidental mutation) ─────────────────────

export const THEME_BACKGROUNDS: ReadonlyArray<ThemeBackgroundItem> =
  Object.freeze([
    {
      id: "pomegranate",
      titleKey: "theme_pomegranate",
      dark: "/images/pomegranate-dark.jpg",
      light: "/images/pomegranate-light.jpg",
      preview: "/images/pomegranate-light.jpg",
    },
    {
      id: "aeroplane",
      titleKey: "theme_aeroplane",
      dark: "/images/Aeroplane-dark.jpeg",
      light: "/images/Aeroplane-light.jpeg",
      preview: "/images/Aeroplane-light.jpeg",
    },
    {
      id: "beehive",
      titleKey: "theme_beehive",
      dark: "/images/beehive-black-dark.jpeg",
      light: "/images/beehive-gray-light.jpeg",
      preview: "/images/beehive-gray-light.jpeg",
    },
    {
      id: "tornPaper",
      titleKey: "theme_tornPaper",
      dark: "/images/orange-black-torn-paper-dark.jpeg",
      light: "/images/beige-brown-paper-light.png",
      preview: "/images/beige-brown-paper-light.png",
    },
    {
      id: "waterPaper",
      titleKey: "theme_waterPaper",
      dark: "/images/black-water-paper-dark.jpeg",
      light: "/images/green-white-paper-light.jpeg",
      preview: "/images/green-white-paper-light.jpeg",
    },
    {
      id: "blueRedPaper",
      titleKey: "theme_blueRedPaper",
      dark: "/images/blue-red-paper-dark.jpeg",
      light: "/images/pink-skyblue-light.jpeg",
      preview: "/images/pink-skyblue-light.jpeg",
    },
    {
      id: "brown",
      titleKey: "theme_brown",
      dark: "/images/Brown-dark.jpeg",
      light: "/images/LightGray-light.jpeg",
      preview: "/images/LightGray-light.jpeg",
    },
    {
      id: "canCant",
      titleKey: "theme_canCant",
      dark: "/images/can-cant-dark.jpeg",
      light: "/images/can-cant-light.jpeg",
      preview: "/images/can-cant-light.jpeg",
    },
    {
      id: "redPink",
      titleKey: "theme_redPink",
      dark: "/images/DeepRed-dark.jpeg",
      light: "/images/DustyPink-light.jpeg",
      preview: "/images/DustyPink-light.jpeg",
    },
    {
      id: "tealLime",
      titleKey: "theme_tealLime",
      dark: "/images/DeepTeal-dark.jpeg",
      light: "/images/LimeGreen-light.jpeg",
      preview: "/images/LimeGreen-light.jpeg",
    },
    {
      id: "dialog",
      titleKey: "theme_dialog",
      dark: "/images/Dialog-dark.jpeg",
      light: "/images/Dialog-light.jpeg",
      preview: "/images/Dialog-light.jpeg",
    },
    {
      id: "dictionary",
      titleKey: "theme_dictionary",
      dark: "/images/Dictionary-dark.jpeg",
      light: "/images/Dictionary-light.jpeg",
      preview: "/images/Dictionary-light.jpeg",
    },
    {
      id: "pistol",
      titleKey: "theme_pistol",
      dark: "/images/firing-pistol-dark.jpeg",
      light: "/images/silenced-pistol-light.jpeg",
      preview: "/images/silenced-pistol-light.jpeg",
    },
    {
      id: "im",
      titleKey: "theme_im",
      dark: "/images/im-dark.jpeg",
      light: "/images/Just-do-it-light.jpeg",
      preview: "/images/Just-do-it-light.jpeg",
    },
    {
      id: "yinYangSwan",
      titleKey: "theme_yinYangSwan",
      dark: "/images/yin-yang-swan-dark.jpeg",
      light: "/images/yin-yang-swan-light.jpeg",
      preview: "/images/yin-yang-swan-light.jpeg",
    },
  ]);

// ─── HELPERS ──────────────────────────────────────────────────────────

const STORAGE_KEY = "nurlingo_background_id";
const DEFAULT_BACKGROUND_ID = "pomegranate";

export function getThemeBackground(id: string): ThemeBackgroundItem {
  return (
    THEME_BACKGROUNDS.find((item) => item.id === id) ?? THEME_BACKGROUNDS[0]
  );
}

function getInitialBackgroundId(background?: string): string {
  if (background) return background;
  if (typeof window === "undefined") return DEFAULT_BACKGROUND_ID;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEME_BACKGROUNDS.some((b) => b.id === saved)) return saved;
  } catch {
    // ignore
  }
  return DEFAULT_BACKGROUND_ID;
}

/** Preload all theme images once so switching is instant. */
function preloadAllBackgrounds() {
  if (typeof window === "undefined") return;
  for (const bg of THEME_BACKGROUNDS) {
    for (const src of [bg.dark, bg.light, bg.preview]) {
      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
    }
  }
}

// ─── PROPS ────────────────────────────────────────────────────────────

export interface ThemeBackgroundProps {
  children: ReactNode;
  className?: string;
  /** When provided, overrides the persisted selection and syncs to storage. */
  background?: string;
  /** Optional override for the UI language. Defaults to useI18n().locale. */
  language?: AppLanguage;
  showSelector?: boolean;
}

// ─── COMPONENT ────────────────────────────────────────────────────────

export function ThemeBackground({
  children,
  className = "",
  background,
  language,
  showSelector = true,
}: ThemeBackgroundProps) {
  const { t, locale } = useI18n();

  // UI language: explicit prop wins, else fall back to i18n locale.
  const activeLanguage: AppLanguage =
    language ?? ((locale as AppLanguage) || "hy");

  // ─── STATE ────────────────────────────────────────────────────────
  // Lazy init from storage — prevents Flash of Unstyled Content (FOUC).
  const [activeId, setActiveId] = useState<string>(() =>
    getInitialBackgroundId(background)
  );
  const [isDark, setIsDark] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // ─── SYNC background PROP ↔ STORAGE ──────────────────────────────
  useEffect(() => {
    if (!background) return;
    setActiveId(background);
    setImageError(false);
    try {
      localStorage.setItem(STORAGE_KEY, background);
    } catch {
      // ignore
    }
  }, [background]);

  // ─── DARK MODE DETECTION ─────────────────────────────────────────
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // ─── PRELOAD IMAGES ONCE ─────────────────────────────────────────
  useEffect(() => {
    preloadAllBackgrounds();
  }, []);

  // ─── RESET IMAGE ERROR WHEN SOURCE CHANGES ───────────────────────
  const activeItem = useMemo(() => getThemeBackground(activeId), [activeId]);
  const currentImage = isDark ? activeItem.dark : activeItem.light;

  useEffect(() => {
    setImageError(false);
  }, [currentImage]);

  // ─── ESCAPE KEY CLOSES MODAL ─────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // ─── FOCUS TRAP + FOCUS RESTORE ──────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // Focus first focusable element
    const raf = requestAnimationFrame(() => first?.focus());

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || focusable.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    dialog.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      dialog.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen]);

  // ─── LOCK BODY SCROLL WHILE MODAL IS OPEN ────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // ─── HANDLERS ─────────────────────────────────────────────────────
  const changeBackground = useCallback((id: string) => {
    setActiveId(id);
    setImageError(false);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
    // Modal stays open so the user can preview several themes.
  }, []);

  const handleCloseModal = useCallback(() => setIsOpen(false), []);

  // ─── RENDER ───────────────────────────────────────────────────────
  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* ─── BACKGROUND (cross-fade, no remount flicker) ─── */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        aria-hidden="true"
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {!imageError ? (
              <Image
                src={currentImage}
                alt=""
                fill
                sizes="100vw"
                priority
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── DARK MODE OVERLAY ─── */}
      {isDark && (
        <div
          className="fixed inset-0 -z-10 pointer-events-none bg-black/25"
          aria-hidden="true"
        />
      )}

      {/* ─── CONTENT ─── */}
      {children}

      {/* ─── PALETTE BUTTON + MODAL ─── */}
      {showSelector && (
        <>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="fixed bottom-40 right-6 z-[60] p-3 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-white/30 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all shadow-lg no-print"
            title={t("theme_background_title")}
            aria-label={t("theme_background_title")}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
          >
            <Palette size={20} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="theme-bg-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={handleCloseModal}
              >
                <motion.div
                  key="theme-bg-dialog"
                  ref={dialogRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="theme-bg-title"
                  aria-describedby="theme-bg-subtitle"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700 shadow-2xl flex flex-col"
                >
                  {/* ─── HEADER ─── */}
                  <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Palette size={20} className="text-red-500" />
                      <div>
                        <h3
                          id="theme-bg-title"
                          className="font-bold text-gray-900 dark:text-white"
                        >
                          {t("theme_background_title")}
                        </h3>
                        <p
                          id="theme-bg-subtitle"
                          className="text-xs text-gray-500 dark:text-gray-400"
                        >
                          {t("theme_background_subtitle")}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                      aria-label={t("theme_background_close")}
                    >
                      <X size={18} className="text-gray-500" />
                    </button>
                  </div>

                  {/* ─── GRID ─── */}
                  <div className="p-5 overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {THEME_BACKGROUNDS.map((bg) => {
                        const isActive = activeId === bg.id;
                        return (
                          <button
                            key={bg.id}
                            type="button"
                            onClick={() => changeBackground(bg.id)}
                            aria-pressed={isActive}
                            aria-current={isActive ? "true" : undefined}
                            className={`group relative flex flex-col rounded-xl overflow-hidden border-2 transition-all ${
                              isActive
                                ? "border-red-500 ring-2 ring-red-500/30"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                            }`}
                          >
                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                              <Image
                                src={bg.preview}
                                alt={t(bg.titleKey)}
                                fill
                                sizes="(max-width: 640px) 50vw, 33vw"
                                loading="lazy"
                                decoding="async"
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              {isActive && (
                                <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                                  <Check
                                    size={14}
                                    className="text-white"
                                    strokeWidth={3}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="px-2 py-2 text-left bg-white dark:bg-gray-900">
                              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                {t(bg.titleKey)}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ─── FOOTER (Apply / Done) ─── */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D90012] to-[#FFA500] text-white font-bold text-sm hover:scale-[1.02] transition-transform"
                    >
                      {t("theme_background_apply")}
                    </button>
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