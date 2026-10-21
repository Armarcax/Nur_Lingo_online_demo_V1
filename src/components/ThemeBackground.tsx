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
  titleKey: string;
  dark?: string;
  light?: string;
  preview?: string;
  cssClass?: string;
  hasBlobs?: boolean;
}

// ─── DATA ─────────────────────────────────────────────────────────────

export const THEME_BACKGROUNDS: ReadonlyArray<ThemeBackgroundItem> =
  Object.freeze([
    // ═══════════════════════════════════════════════════════════════
    // 🎨 CSS Themes
    // ═══════════════════════════════════════════════════════════════
    {
      id: "modernMesh",
      titleKey: "theme_modern_mesh",
      cssClass: "bg-mesh-light dark:bg-mesh-dark bg-noise",
      hasBlobs: true,
    },
    {
      id: "aurora",
      titleKey: "theme_aurora",
      cssClass: "bg-aurora-light dark:bg-aurora",
      hasBlobs: false,
    },
    {
      id: "grid",
      titleKey: "theme_grid",
      cssClass: "bg-grid bg-[#faf8f6] dark:bg-[#0f172a]",
      hasBlobs: false,
    },
    {
      id: "liquid",
      titleKey: "theme_liquid",
      cssClass: "bg-liquid",
      hasBlobs: false,
    },
    {
      id: "glassPanels",
      titleKey: "theme_glass_panels",
      cssClass: "bg-glass-panels",
      hasBlobs: false,
    },
    {
      id: "geoHex",
      titleKey: "theme_geo_hex",
      cssClass: "bg-geo-hex",
      hasBlobs: false,
    },
    {
      id: "aero",
      titleKey: "theme_aero",
      cssClass: "bg-aero",
      hasBlobs: false,
    },
    {
      id: "lines",
      titleKey: "theme_lines",
      cssClass: "bg-lines",
      hasBlobs: false,
    },

    // ═══════════════════════════════════════════════════════════════
    // 🖼️ NEW IMAGES (Ուղղված անուններով)
    // ═══════════════════════════════════════════════════════════════
    {
      id: "2027",
      titleKey: "theme_2027",
      dark: "/images/2027_dark.jpeg",
      light: "/images/2027_light.jpeg",
      preview: "/images/2027_light.jpeg",
    },
    {
      id: "yeahSo",
      titleKey: "theme_yeah_so",
      dark: "/images/Yeah_so_dark.jpeg",
      light: "/images/Yeah_so_light.jpeg",
      preview: "/images/Yeah_so_light.jpeg",
    },
    {
      id: "assorted",
      titleKey: "theme_assorted",
      dark: "/images/assorted_dark.jpeg",
      light: "/images/assorted_light.jpeg",
      preview: "/images/assorted_light.jpeg",
    },
    {
      id: "astonMartin",
      titleKey: "theme_aston_martin",
      dark: "/images/aston_martin_dark.jpeg",
      light: "/images/aston_martin_light.jpeg",
      preview: "/images/aston_martin_light.jpeg",
    },
    {
      id: "autumn",
      titleKey: "theme_autumn",
      dark: "/images/autumn_dark.jpeg",
      light: "/images/autumn_light.jpeg",
      preview: "/images/autumn_light.jpeg",
    },
    {
      id: "bubbleGum",
      titleKey: "theme_bubble_gum",
      dark: "/images/bubble_gum_dark.jpeg",
      light: "/images/bubble_gum_light.png",
      preview: "/images/bubble_gum_light.png",
    },
    {
      id: "ball",
      titleKey: "theme_ball",
      dark: "/images/ball_dark.jpeg",
      light: "/images/ball_light.png",
      preview: "/images/ball_light.png",
    },
    {
      id: "books",
      titleKey: "theme_books",
      dark: "/images/books_dark.jpeg",
      light: "/images/books_light.jpeg",
      preview: "/images/books_light.jpeg",
    },
    {
      id: "branch",
      titleKey: "theme_branch",
      dark: "/images/branch_dark.jpeg",
      light: "/images/branch_light.jpeg",
      preview: "/images/branch_light.jpeg",
    },
    {
      id: "brick1",
      titleKey: "theme_brick_1",
      dark: "/images/brick1_dark.jpeg",
      light: "/images/brick1_light.jpeg",
      preview: "/images/brick1_light.jpeg",
    },
    {
      id: "brick",
      titleKey: "theme_brick",
      dark: "/images/brick_dark.jpeg",
      light: "/images/brick_light.jpeg",
      preview: "/images/brick_light.jpeg",
    },
    {
      id: "brotherBear",
      titleKey: "theme_brother_bear",
      dark: "/images/brother_bear_dark.jpeg",
      light: "/images/brother_bear_light.jpeg",
      preview: "/images/brother_bear_light.jpeg",
    },
    {
      id: "bugatti",
      titleKey: "theme_bugatti",
      dark: "/images/bugatti_dark.jpeg",
      light: "/images/bugatti_light.jpeg",
      preview: "/images/bugatti_light.jpeg",
    },
    {
      id: "car",
      titleKey: "theme_car",
      dark: "/images/car_dark.png",
      light: "/images/car_light.jpeg",
      preview: "/images/car_light.jpeg",
    },
    {
      id: "chess",
      titleKey: "theme_chess",
      dark: "/images/chess_dark.jpeg",
      light: "/images/chess_light.jpeg",
      preview: "/images/chess_light.jpeg",
    },
    {
      id: "coffeePopcorn",
      titleKey: "theme_coffee_popcorn",
      dark: "/images/coffee_popcorn_dark.jpeg",
      light: "/images/coffee_popcorn_light.jpeg",
      preview: "/images/coffee_popcorn_light.jpeg",
    },
    {
      id: "corridor",
      titleKey: "theme_corridor",
      dark: "/images/corridor_dark.jpeg",
      light: "/images/corridor_light.jpeg",
      preview: "/images/corridor_light.jpeg",
    },
    {
      id: "dice",
      titleKey: "theme_dice",
      dark: "/images/dice_dark.jpeg",
      light: "/images/dice_light.jpeg",
      preview: "/images/dice_light.jpeg",
    },
    {
      id: "dream",
      titleKey: "theme_dream",
      dark: "/images/dream_dark.jpeg",
      light: "/images/dream_light.jpeg",
      preview: "/images/dream_light.jpeg",
    },
    {
      id: "enemyFriend",
      titleKey: "theme_enemy_friend",
      dark: "/images/enemy_friend_dark.jpeg",
      light: "/images/enemy_friend_light.jpeg",
      preview: "/images/enemy_friend_light.jpeg",
    },
    {
      id: "goldenFissure",
      titleKey: "theme_golden_fissure",
      dark: "/images/golden_fissure_dark.jpeg",
      light: "/images/golden_fissure_light.jpeg",
      preview: "/images/golden_fissure_light.jpeg",
    },
    {
      id: "good",
      titleKey: "theme_good",
      dark: "/images/good_dark.jpeg",
      light: "/images/good_light.jpeg",
      preview: "/images/good_light.jpeg",
    },
    {
      id: "pomegranateFruit",
      titleKey: "theme_pomegranate_fruit",
      dark: "/images/pomegranate_fruit_dark.jpeg",
      light: "/images/pomegranate_fruit_light.png",
      preview: "/images/pomegranate_fruit_light.png",
    },
    {
      id: "grapefruit",
      titleKey: "theme_grapefruit",
      dark: "/images/grapefruit_dark.jpeg",
      light: "/images/grapefruit_light.jpeg",
      preview: "/images/grapefruit_light.jpeg",
    },
    {
      id: "guitar",
      titleKey: "theme_guitar",
      dark: "/images/guitar_dark.jpeg",
      light: "/images/guitar_light.jpeg",
      preview: "/images/guitar_light.jpeg",
    },
    {
      id: "horizontalVertical",
      titleKey: "theme_horizontal_vertical",
      dark: "/images/horizontal_vertical_dark.png",
      light: "/images/horizontal_vertical_light.jpeg",
      preview: "/images/horizontal_vertical_light.jpeg",
    },
    {
      id: "knowledge",
      titleKey: "theme_knowledge",
      dark: "/images/knowledge_dark.jpeg",
      light: "/images/knowledge_light.jpeg",
      preview: "/images/knowledge_light.jpeg",
    },
    {
      id: "lamborghini",
      titleKey: "theme_lamborghini",
      dark: "/images/lamborghini_dark.jpeg",
      light: "/images/lamborghini_light.jpeg",
      preview: "/images/lamborghini_light.jpeg",
    },
    {
      id: "leaf",
      titleKey: "theme_leaf",
      dark: "/images/leaf_dark.jpeg",
      light: "/images/leaf_light.jpeg",
      preview: "/images/leaf_light.jpeg",
    },
    {
      id: "leafFall",
      titleKey: "theme_leaf_fall",
      dark: "/images/leaf_fall_dark.jpeg",
      light: "/images/leaf_fall_light.jpeg",
      preview: "/images/leaf_fall_light.jpeg",
    },
    {
      id: "leather1",
      titleKey: "theme_leather_1",
      dark: "/images/leather1_dark.jpeg",
      light: "/images/leather1_light.jpeg",
      preview: "/images/leather1_light.jpeg",
    },
    {
      id: "leather",
      titleKey: "theme_leather",
      dark: "/images/leather_dark.jpeg",
      light: "/images/leather_light.jpeg",
      preview: "/images/leather_light.jpeg",
    },
    {
      id: "ledFlower",
      titleKey: "theme_led_flower",
      dark: "/images/led_flower_dark.jpeg",
      light: "/images/led_flower_light.jpeg",
      preview: "/images/led_flower_light.jpeg",
    },
    {
      id: "lemon1",
      titleKey: "theme_lemon_1",
      dark: "/images/lemon1_dark.jpeg",
      light: "/images/lemon1_light.jpeg",
      preview: "/images/lemon1_light.jpeg",
    },
    {
      id: "lemon2",
      titleKey: "theme_lemon_2",
      dark: "/images/lemon2_dark.jpeg",
      light: "/images/lemon2_light.png",
      preview: "/images/lemon2_light.png",
    },
    {
      id: "lemon",
      titleKey: "theme_lemon",
      dark: "/images/lemon_dark.jpeg",
      light: "/images/lemon_light.jpeg",
      preview: "/images/lemon_light.jpeg",
    },
    {
      id: "loveLife",
      titleKey: "theme_love_life",
      dark: "/images/love_life_dark.jpeg",
      light: "/images/love_life_light.jpeg",
      preview: "/images/love_life_light.jpeg",
    },
    {
      id: "meWe",
      titleKey: "theme_me_we",
      dark: "/images/me_we_dark.jpeg",
      light: "/images/me_we_light.jpeg",
      preview: "/images/me_we_light.jpeg",
    },
    {
      id: "mikyMiny",
      titleKey: "theme_miky_miny",
      dark: "/images/miky_miny_dark.jpeg",
      light: "/images/miky_miny_light.jpeg",
      preview: "/images/miky_miny_light.jpeg",
    },
    {
      id: "mood",
      titleKey: "theme_mood",
      dark: "/images/mood_dark.jpeg",
      light: "/images/mood_light.jpeg",
      preview: "/images/mood_light.jpeg",
    },
    {
      id: "multcar",
      titleKey: "theme_multcar",
      dark: "/images/multcar_dark.jpeg",
      light: "/images/multcar_light.jpeg",
      preview: "/images/multcar_light.jpeg",
    },
    {
      id: "music",
      titleKey: "theme_music",
      dark: "/images/music_dark.jpeg",
      light: "/images/music_light.jpeg",
      preview: "/images/music_light.jpeg",
    },
    {
      id: "ninja",
      titleKey: "theme_ninja",
      dark: "/images/ninja_dark.jpeg",
      light: "/images/ninja_light.jpeg",
      preview: "/images/ninja_light.jpeg",
    },
    {
      id: "oldNew",
      titleKey: "theme_old_new",
      dark: "/images/old_new_dark.jpeg",
      light: "/images/old_new_light.jpeg",
      preview: "/images/old_new_light.jpeg",
    },
    {
      id: "predator",
      titleKey: "theme_predator",
      dark: "/images/predator_dark.jpeg",
      light: "/images/predator_light.jpeg",
      preview: "/images/predator_light.jpeg",
    },
    {
      id: "rabbit",
      titleKey: "theme_rabbit",
      dark: "/images/rabbit_dark.jpeg",
      light: "/images/rabbit_light.jpeg",
      preview: "/images/rabbit_light.jpeg",
    },
    {
      id: "rainy",
      titleKey: "theme_rainy",
      dark: "/images/rainy_dark.jpeg",
      light: "/images/rainy_light.jpeg",
      preview: "/images/rainy_light.jpeg",
    },
    {
      id: "rr",
      titleKey: "theme_rr",
      dark: "/images/rr_dark.jpeg",
      light: "/images/rr_light.jpeg",
      preview: "/images/rr_light.jpeg",
    },
    {
      id: "shine",
      titleKey: "theme_shine",
      dark: "/images/shine_dark.jpeg",
      light: "/images/shine_light.jpeg",
      preview: "/images/shine_light.jpeg",
    },
    {
      id: "skyEarth",
      titleKey: "theme_sky_earth",
      dark: "/images/sky_earth_dark.jpeg",
      light: "/images/sky_earth_light.jpeg",
      preview: "/images/sky_earth_light.jpeg",
    },
    {
      id: "songMachine",
      titleKey: "theme_song_machine",
      dark: "/images/song_machine_dark.jpeg",
      light: "/images/song_machine_light.jpeg",
      preview: "/images/song_machine_light.jpeg",
    },
    {
      id: "spider",
      titleKey: "theme_spider",
      dark: "/images/spider_dark.jpeg",
      light: "/images/spider_light.jpeg",
      preview: "/images/spider_light.jpeg",
    },
    {
      id: "stoneLeaf",
      titleKey: "theme_stone_leaf",
      dark: "/images/stone_leaf_dark.jpeg",
      light: "/images/stone_leaf_light.jpeg",
      preview: "/images/stone_leaf_light.jpeg",
    },
    {
      id: "sword",
      titleKey: "theme_sword",
      dark: "/images/sword_dark.jpeg",
      light: "/images/sword_light.jpeg",
      preview: "/images/sword_light.jpeg",
    },
    {
      id: "tomatoCucumber",
      titleKey: "theme_tomato_cucumber",
      dark: "/images/tomato_cucumber_dark.jpeg",
      light: "/images/tomato_cucumber_light.jpeg",
      preview: "/images/tomato_cucumber_light.jpeg",
    },
    {
      id: "tree",
      titleKey: "theme_tree",
      dark: "/images/tree_dark.jpeg",
      light: "/images/tree_light.jpeg",
      preview: "/images/tree_light.jpeg",
    },
    {
      id: "vini",
      titleKey: "theme_vini",
      dark: "/images/vini_dark.jpeg",
      light: "/images/vini_light.jpeg",
      preview: "/images/vini_light.jpeg",
    },
    {
      id: "wise",
      titleKey: "theme_wise",
      dark: "/images/wise_dark.jpeg",
      light: "/images/wise_light.jpeg",
      preview: "/images/wise_light.jpeg",
    },
    {
      id: "worldBallons",
      titleKey: "theme_world_ballons",
      dark: "/images/world_ballons_dark.jpeg",
      light: "/images/world_ballons_light.png",
      preview: "/images/world_ballons_light.png",
    },
    {
      id: "youCan",
      titleKey: "theme_you_can",
      dark: "/images/you_can_dark.png",
      light: "/images/you_can_light.jpeg",
      preview: "/images/you_can_light.jpeg",
    },

    // ═══════════════════════════════════════════════════════════════
    // 🖼️ OLD IMAGES (Պահպանված են)
    // ═══════════════════════════════════════════════════════════════
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
const DEFAULT_BACKGROUND_ID = "modernMesh";

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
  } catch {}
  return DEFAULT_BACKGROUND_ID;
}

function preloadAllBackgrounds() {
  if (typeof window === "undefined") return;
  for (const bg of THEME_BACKGROUNDS) {
    if (bg.cssClass) continue;
    for (const src of [bg.dark, bg.light, bg.preview]) {
      if (src) {
        const img = new window.Image();
        img.decoding = "async";
        img.src = src;
      }
    }
  }
}

// ─── PROPS ────────────────────────────────────────────────────────────

export interface ThemeBackgroundProps {
  children: ReactNode;
  className?: string;
  background?: string;
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
  const activeLanguage: AppLanguage = language ?? ((locale as AppLanguage) || "hy");

  const [activeId, setActiveId] = useState<string>(() =>
    getInitialBackgroundId(background)
  );
  const [isDark, setIsDark] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!background) return;
    setActiveId(background);
    setImageError(false);
    try { localStorage.setItem(STORAGE_KEY, background); } catch {}
  }, [background]);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains("dark"));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => { preloadAllBackgrounds(); }, []);

  const activeItem = useMemo(() => getThemeBackground(activeId), [activeId]);
  const isCssTheme = !!activeItem.cssClass;
  const currentImage = isCssTheme ? "" : (isDark ? activeItem.dark : activeItem.light);

  useEffect(() => { setImageError(false); }, [currentImage]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const raf = requestAnimationFrame(() => first?.focus());
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || focusable.length === 0) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    dialog.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      dialog.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  const changeBackground = useCallback((id: string) => {
    setActiveId(id);
    setImageError(false);
    try { localStorage.setItem(STORAGE_KEY, id); } catch {}
  }, []);

  const handleCloseModal = useCallback(() => setIsOpen(false), []);

  return (
    <div className={`relative min-h-screen ${className}`}>
      <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.div
            key={activeId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={`absolute inset-0 ${activeItem.cssClass || ""}`}
          >
            {isCssTheme ? (
              activeItem.hasBlobs ? (
                <div className="blob-container">
                  <div className="blob blob-1"></div>
                  <div className="blob blob-2"></div>
                  <div className="blob blob-3"></div>
                </div>
              ) : null
            ) : (
              !imageError ? (
                <Image
                  src={currentImage || ""}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800" />
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {isDark && !isCssTheme && (
        <div className="fixed inset-0 -z-10 pointer-events-none bg-black/25" aria-hidden="true" />
      )}

      {children}

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
                  <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Palette size={20} className="text-red-500" />
                      <div>
                        <h3 id="theme-bg-title" className="font-bold text-gray-900 dark:text-white">
                          {t("theme_background_title")}
                        </h3>
                        <p id="theme-bg-subtitle" className="text-xs text-gray-500 dark:text-gray-400">
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
                              {bg.cssClass ? (
                                <div className={`w-full h-full relative overflow-hidden ${bg.cssClass}`}>
                                  {bg.hasBlobs && (
                                    <>
                                      <div className="absolute inset-0 bg-noise opacity-30"></div>
                                      <div className="blob" style={{ width: '80px', height: '80px', background: '#fca5a5', top: '-10%', left: '-10%', filter: 'blur(20px)' }}></div>
                                      <div className="blob" style={{ width: '100px', height: '100px', background: '#93c5fd', bottom: '-10%', right: '-10%', filter: 'blur(20px)' }}></div>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <Image
                                  src={bg.preview || ""}
                                  alt={t(bg.titleKey)}
                                  fill
                                  sizes="(max-width: 640px) 50vw, 33vw"
                                  loading="lazy"
                                  decoding="async"
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              )}
                              {isActive && (
                                <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                                  <Check size={14} className="text-white" strokeWidth={3} />
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