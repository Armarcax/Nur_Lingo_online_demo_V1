// src/app/page.tsx
"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  BookOpen,
  Globe,
  Sparkles,
  ArrowRight,
  Zap,
  Heart,
  MessageSquare,
  Leaf,
  LayoutGrid,
  Trophy,
  Target,
  Settings,
  Languages,
  RotateCcw,
  Loader2,
  XCircle,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Nuri, { NuriSpeech, type NuriMood } from "@/components/Nuri";
import ThemeToggle from "@/components/ThemeToggle";
import { NuriRain } from "@/components/NuriRain";
import {
  syncHearts,
  loadQuests,
  claimReward,
  addRewards,
  type UserRewards,
  type Quest,
} from "@/lib/rewards/seeds";
import {
  loadLangConfig,
  saveLangConfig,
  type LangCode,
  type LangPair,
} from "@/lib/i18n/index";
import { useI18n } from "@/hooks/useI18n";

// ─── TYPES ────────────────────────────────────────────────────────────

interface HomeStats {
  streak: number;
  totalHAYQ: number;
  hearts: number;
  hasStarted: boolean;
  dailyProgress: number;
  dailyGoal: number;
}

interface QuickLink {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  color?: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────

const LANGUAGE_OPTIONS: ReadonlyArray<{
  code: LangCode;
  label: string;
  flag: string;
  color: string;
}> = [
  { code: "hy", label: "Հայերեն", flag: "🇦🇲", color: "text-red-400" },
  { code: "en", label: "English", flag: "🇬🇧", color: "text-blue-400" },
  { code: "ru", label: "Русский", flag: "🇷🇺", color: "text-green-400" },
];

const LANG_BY_CODE: Record<LangCode, (typeof LANGUAGE_OPTIONS)[number]> =
  Object.fromEntries(LANGUAGE_OPTIONS.map((l) => [l.code, l])) as Record<
    LangCode,
    (typeof LANGUAGE_OPTIONS)[number]
  >;

const QUICK_LINKS: QuickLink[] = [
  { href: "/world", icon: Globe, labelKey: "page__world", color: "text-blue-400" },
  { href: "/dictionary", icon: BookOpen, labelKey: "page_dictionary", color: "text-emerald-400" },
  { href: "/dialogues", icon: MessageSquare, labelKey: "page_dialogues", color: "text-purple-400" },
  { href: "/curriculum", icon: LayoutGrid, labelKey: "page_curriculum", color: "text-amber-400" },
  { href: "/garden", icon: Leaf, labelKey: "page_garden", color: "text-green-400" },
  { href: "/user-dictionary", icon: Users, labelKey: "page_user_dictionary", color: "text-yellow-400" },
];

const FALLBACK_STATS: HomeStats = {
  streak: 0,
  totalHAYQ: 0,
  hearts: 5,
  hasStarted: false,
  dailyProgress: 0,
  dailyGoal: 50,
};

const DEFAULT_DAILY_GOAL = 50;

// ─── MODAL WRAPPER (accessible, focus-trapped) ───────────────────────

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  labelledBy: string;
  children: React.ReactNode;
  maxWidth?: string;
  zIndex?: number;
}

function Modal({
  isOpen,
  onClose,
  labelledBy,
  children,
  maxWidth = "max-w-sm",
  zIndex = 100,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const raf = requestAnimationFrame(() => first?.focus());

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
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

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(raf);
      dialog.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          style={{ zIndex }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/40 dark:border-white/20 rounded-2xl p-6 ${maxWidth} w-full max-h-[80vh] overflow-y-auto shadow-2xl`}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function Home() {
  const router = useRouter();
  const { t, locale, setLanguage } = useI18n();
  const lang = locale as LangCode;

  // ─── STATE ────────────────────────────────────────────────────────
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [nuriMood, setNuriMood] = useState<NuriMood>("happy");
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  // ─── LANGUAGE STATE ───────────────────────────────────────────────
  const [currentNative, setCurrentNative] = useState<LangCode>("hy");
  const [currentLearning, setCurrentLearning] = useState<LangCode>("en");
  const [selectedNative, setSelectedNative] = useState<LangCode>("hy");
  const [selectedLearning, setSelectedLearning] = useState<LangCode>("en");

  // ─── APPEARANCE STATE ─────────────────────────────────────────────
  const [selectedFont, setSelectedFont] = useState("sans");
  const [selectedColor, setSelectedColor] = useState("red");

  // ─── TIMER CLEANUP ────────────────────────────────────────────────
  const nuriTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (nuriTimerRef.current) clearTimeout(nuriTimerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  /** Set mood temporarily, then revert. Cancels any pending timer. */
  const setMoodTemporarily = useCallback(
    (mood: NuriMood, duration: number, resetTo: NuriMood = "happy") => {
      setNuriMood(mood);
      if (nuriTimerRef.current) clearTimeout(nuriTimerRef.current);
      nuriTimerRef.current = setTimeout(() => setNuriMood(resetTo), duration);
    },
    []
  );

  // ─── LOAD DATA ────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);

      // ─── 1. Language config check ─────────────────────────────────
      try {
        const langConfigRaw = localStorage.getItem("nur_lang_config");
        if (!langConfigRaw) {
          router.replace("/onboarding");
          return;
        }
        const config = loadLangConfig();
        if (cancelled) return;
        if (config) {
          setCurrentNative(config.native as LangCode);
          setCurrentLearning(config.learning as LangCode);
          setSelectedNative(config.native as LangCode);
          setSelectedLearning(config.learning as LangCode);
        }
      } catch {
        if (!cancelled) router.replace("/onboarding");
        return;
      }

      // ─── 2. Load Appearance Settings ─────────────────────────────
      setSelectedFont(localStorage.getItem("nur_font") || "sans");
      setSelectedColor(localStorage.getItem("nur_color") || "red");

      // ─── 3. Rewards + quests ──────────────────────────────────────
      try {
        const rewardsData = syncHearts();
        if (cancelled) return;
        setRewards(rewardsData);

        const questsData = loadQuests() || [];
        if (cancelled) return;
        setQuests(questsData);

        const today = new Date().toISOString().split("T")[0];
        const dailyActivity = rewardsData.dailyActivity?.[today] ?? 0;
        const dailyGoal = rewardsData.dailyGoal ?? DEFAULT_DAILY_GOAL;
        const totalHAYQ = rewardsData.totalHAYQ ?? 0;
        const streak = rewardsData.streak ?? 0;

        if (cancelled) return;
        setStats({
          streak,
          totalHAYQ,
          hearts: rewardsData.hearts ?? 5,
          hasStarted: totalHAYQ > 0 || streak > 0,
          dailyProgress: Math.min(dailyActivity, dailyGoal),
          dailyGoal,
        });

        if (dailyActivity >= dailyGoal) {
          setMoodTemporarily("excited", 3000, "happy");
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        if (!cancelled) setStats(FALLBACK_STATS);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [router, setMoodTemporarily]);

  // ─── DERIVED ──────────────────────────────────────────────────────
  const claimableQuests = useMemo(
    () => quests.filter((q) => q.completed && !q.claimed),
    [quests]
  );
  const claimableCount = claimableQuests.length;

  const currentNativeInfo = LANG_BY_CODE[currentNative];
  const currentLearningInfo = LANG_BY_CODE[currentLearning];

  const hearts = stats?.hearts ?? rewards?.hearts ?? 5;
  const streak = stats?.streak ?? rewards?.streak ?? 0;
  const totalHAYQ = stats?.totalHAYQ ?? rewards?.totalHAYQ ?? 0;

  // ─── HANDLERS ─────────────────────────────────────────────────────

  const openStatsModal = useCallback(() => setShowStatsModal(true), []);

  const openSettingsModal = useCallback(() => {
    const config = loadLangConfig();
    if (config) {
      setSelectedNative(config.native as LangCode);
      setSelectedLearning(config.learning as LangCode);
    }
    // Sync appearance state with current localStorage on open
    setSelectedFont(localStorage.getItem("nur_font") || "sans");
    setSelectedColor(localStorage.getItem("nur_color") || "red");
    setShowSettingsModal(true);
  }, []);

  const updateAppearance = useCallback((type: 'font' | 'color', value: string) => {
    if (type === 'font') {
      setSelectedFont(value);
      localStorage.setItem("nur_font", value);
      document.documentElement.setAttribute("data-font", value);
    } else {
      setSelectedColor(value);
      localStorage.setItem("nur_color", value);
      document.documentElement.setAttribute("data-color", value);
    }
  }, []);

  const handleClaimQuest = useCallback(
    async (questId: string) => {
      const quest = quests.find((q) => q.id === questId);
      if (!quest || !quest.completed || quest.claimed) return;

      try {
        const reward = claimReward(questId);
        if (!reward) return;

        addRewards(reward.hayq ?? 0, reward.seeds ?? 0);

        const questsData = loadQuests() || [];
        setQuests(questsData);

        const rewardsData = syncHearts();
        setRewards(rewardsData);

        setStats((prev) =>
          prev
            ? {
                ...prev,
                totalHAYQ: rewardsData.totalHAYQ ?? prev.totalHAYQ,
                hasStarted: true,
              }
            : prev
        );

        setMoodTemporarily("excited", 2000, "happy");
      } catch (error) {
        console.error("Failed to claim quest:", error);
      }
    },
    [quests, setMoodTemporarily]
  );

  const handleSaveLanguage = useCallback(() => {
    if (selectedNative === selectedLearning) return;
    try {
      saveLangConfig({
        native: selectedNative,
        learning: selectedLearning,
        pair: `${selectedNative}-${selectedLearning}` as LangPair,
      });
      setLanguage(selectedNative);
      setCurrentNative(selectedNative);
      setCurrentLearning(selectedLearning);
      setShowSettingsModal(false);

      setMoodTemporarily("excited", 2000, "happy");
    } catch (error) {
      console.error("Failed to save language settings:", error);
    }
  }, [selectedNative, selectedLearning, setLanguage, setMoodTemporarily]);

  const handleResetOnboarding = useCallback(() => {
    setIsResetting(true);

    try {
      const keysToRemove = [
        "nur_lang_config",
        "nurlingo_rewards",
        "nurlingo_quests",
        "nurlingo_hearts",
        "nurlingo_streak",
        "nur_device_id",
        "nur_lesson_mistakes_v2",
        "nur_font",     // Reset appearance too
        "nur_color",
      ];
      for (const key of keysToRemove) localStorage.removeItem(key);

      // WAV caches
      const allKeys = Object.keys(localStorage);
      for (const key of allKeys) {
        if (key.startsWith("wav_audio_")) {
          localStorage.removeItem(key);
          localStorage.removeItem(key + "_time");
        }
      }

      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setIsResetting(false);
        setShowResetConfirm(false);
        setShowSettingsModal(false);
        router.push("/onboarding");
      }, 500);
    } catch (error) {
      console.error("Failed to reset:", error);
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  }, [router]);

  // ─── LOADING / ERROR STATES ───────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FFA500] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)] text-sm font-medium">
            {t("page_loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)] text-sm font-medium">
            {t("home_error_title")}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition"
          >
            {t("home_error_reload")}
          </button>
        </div>
      </div>
    );
  }

  const isReturning = stats.hasStarted;

  // ─── RENDER ───────────────────────────────────────────────────────
  return (
    <main className="min-h-screen overflow-hidden relative">
      <NuriRain langs={[currentNative]} count={35} speed={0.7} />

      {/* ─── HEADER ACTIONS ─── */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {isReturning && claimableCount > 0 && (
          <button
            type="button"
            onClick={openStatsModal}
            className="relative p-1"
            title={t("home_quest_badge_title", { count: claimableCount })}
            aria-label={t("home_quest_badge_aria", { count: claimableCount })}
          >
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] font-bold text-black animate-pulse">
              {claimableCount}
            </div>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          </button>
        )}

        <button
          type="button"
          onClick={openSettingsModal}
          className="p-2 rounded-full bg-white/10 dark:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/10 hover:bg-white/20 transition-all"
          title={t("page_settings")}
          aria-label={t("page_settings")}
        >
          <Settings
            size={20}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition"
          />
        </button>

        <ThemeToggle size="lg" />
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* ─── NURI ─── */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3.5, repeat: Infinity }}
          className="mb-3"
        >
          <Nuri mood={nuriMood} size={160} glow />
        </motion.div>

        <NuriSpeech
          text={
            isReturning
              ? claimableCount > 0
                ? t("page_nuri_quests_ready", { count: claimableCount })
                : t("page_nuri_continue")
              : t("page_nuri_welcome")
          }
          mood={nuriMood}
        />

        {/* ─── TITLE ─── */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mt-4 mb-1">
          <span className="bg-gradient-to-r from-[var(--palette-primary)] via-[var(--palette-accent)] to-[#0033A0] bg-clip-text text-transparent">
            NUR Lingo
          </span>
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm font-bold uppercase tracking-[0.3em] mb-6">
          {t("page_subtitle")}
        </p>

        {/* ─── STATS ─── */}
        {isReturning && (
          <div className="flex items-center gap-3 mb-6 flex-wrap justify-center">
            <button
              type="button"
              onClick={openStatsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/20 transition-all"
              aria-label={t("page_stats")}
            >
              <Flame size={14} className="text-orange-500" />
              <span className="text-sm font-bold text-[var(--color-text)]">
                {streak}
              </span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/10">
              <Zap size={14} className="text-yellow-500" />
              <span className="text-sm font-bold text-[var(--color-text)]">
                {totalHAYQ}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/10">
              <Heart size={14} className="text-red-500" />
              <span className="text-sm font-bold text-[var(--color-text)]">
                {hearts}
              </span>
            </div>

            {rewards && (rewards.streakFreeze ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30">
                <span className="text-xs">🛡️</span>
                <span className="text-xs font-bold text-blue-500">
                  {rewards.streakFreeze}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ─── MAIN BUTTON ─── */}
        <div className="w-full max-w-sm">
          <Link
            href={isReturning ? "/world" : "/onboarding"}
            className="w-full bg-gradient-to-r from-[var(--palette-primary)] to-[var(--palette-accent)] text-white font-bold py-5 px-8 rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-[var(--palette-primary-dim)] text-lg backdrop-blur-soft group"
          >
            <Sparkles
              size={22}
              className="group-hover:rotate-12 transition-transform"
            />
            {isReturning ? t("page_continue") : t("page_start")}
            <ArrowRight
              size={22}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        {/* ─── QUICK LINKS ─── */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-6 w-full max-w-sm">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-2xl p-2.5 text-center hover:bg-white/50 dark:hover:bg-white/20 hover:scale-105 transition-all group"
            >
              <item.icon
                size={20}
                className={`mx-auto ${
                  item.color || "text-[var(--color-text-secondary)]"
                } mb-0.5 group-hover:scale-110 transition-transform`}
              />
              <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                {t(item.labelKey)}
              </span>
            </Link>
          ))}
        </div>

        {/* ─── DAILY PROGRESS ─── */}
        {isReturning && (
          <div className="w-full max-w-sm mt-4">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-1">
              <span className="flex items-center gap-1.5">
                <Target size={12} />
                {t("page_daily_goal")}
              </span>
              <span>
                {Math.round(stats.dailyProgress)} / {stats.dailyGoal} XP
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={Math.round(stats.dailyProgress)}
              aria-valuemin={0}
              aria-valuemax={stats.dailyGoal}
              className="w-full h-1.5 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-sm overflow-hidden"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(stats.dailyProgress / stats.dailyGoal) * 100}%`,
                }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--palette-primary)] via-[var(--palette-accent)] to-[#0033A0]"
              />
            </div>
          </div>
        )}

        {/* ─── FOOTER ─── */}
        <p className="text-[var(--color-text-muted)] text-[10px] font-bold uppercase tracking-[0.2em] mt-8 opacity-40">
          {t("page_footer_platform")}
        </p>
      </div>

      {/* ─── STATS MODAL ─── */}
      <Modal
        isOpen={showStatsModal && !!rewards}
        onClose={() => setShowStatsModal(false)}
        labelledBy="stats-modal-title"
      >
        {rewards && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3
                id="stats-modal-title"
                className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2"
              >
                <Trophy size={20} className="text-yellow-500" />
                {t("page_stats")}
              </h3>
              <button
                type="button"
                onClick={() => setShowStatsModal(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors p-1 rounded-lg"
                aria-label={t("page_close")}
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <StatRow
                label={t("page__streak")}
                value={rewards.streak ?? 0}
                valueClass="text-[var(--color-text)]"
              />
              <StatRow
                label={t("page__hayq")}
                value={rewards.totalHAYQ ?? 0}
                valueClass="text-yellow-500"
              />
              <StatRow
                label={t("page__seeds")}
                value={rewards.totalSeeds ?? 0}
                valueClass="text-emerald-500"
              />
              <StatRow
                label={t("page__hearts")}
                value={rewards.hearts ?? 0}
                valueClass="text-red-500"
              />
              <StatRow
                label={t("page__freeze")}
                value={rewards.streakFreeze ?? 0}
                valueClass="text-blue-500"
              />
              <StatRow
                label={t("page__crowns")}
                value={Object.values(rewards.crowns || {}).reduce(
                  (a, b) => a + b,
                  0
                )}
                valueClass="text-amber-500"
              />
            </div>

            {claimableQuests.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                  {t("page__completed_quests")}
                </p>
                <div className="space-y-1.5">
                  {claimableQuests.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-2 bg-white/40 dark:bg-white/5 rounded-lg text-xs"
                    >
                      <span className="text-[var(--color-text-secondary)]">
                        {q.description?.[lang] ?? q.description?.en ?? q.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleClaimQuest(q.id)}
                        className="px-2 py-0.5 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors text-[10px] font-bold"
                      >
                        {t("page_claim")}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowStatsModal(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--palette-primary)] to-[var(--palette-accent)] text-white font-bold text-sm"
            >
              {t("page_close")}
            </button>
          </>
        )}
      </Modal>

      {/* ─── SETTINGS MODAL ─── */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        labelledBy="settings-modal-title"
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            id="settings-modal-title"
            className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2"
          >
            <Settings size={20} className="text-[var(--color-text-secondary)]" />
            {t("page_settings")}
          </h3>
          <button
            type="button"
            onClick={() => setShowSettingsModal(false)}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors p-1 rounded-lg"
            aria-label={t("page_close")}
          >
            ✕
          </button>
        </div>

        <div className="bg-white/40 dark:bg-white/5 rounded-xl p-3 mb-4">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">
            {t("page_current_languages")}
          </p>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[var(--color-text-secondary)]">
              {t("page__native_")}
            </span>
            <span className="font-bold text-[var(--color-text)]">
              {currentNativeInfo?.flag} {currentNativeInfo?.label}
            </span>
            <span className="text-[var(--color-text-muted)]">→</span>
            <span className="font-bold text-[var(--palette-accent)]">
              {currentLearningInfo?.flag} {currentLearningInfo?.label}
            </span>
          </div>
        </div>

        {/* Native language selector */}
        <div className="mb-4">
          <label className="text-xs text-[var(--color-text-muted)] mb-2 block">
            {t("page__native_")}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGE_OPTIONS.map((lng) => (
              <button
                key={`native-${lng.code}`}
                type="button"
                onClick={() => setSelectedNative(lng.code)}
                aria-pressed={selectedNative === lng.code}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  selectedNative === lng.code
                    ? `border-[var(--palette-accent)] bg-[var(--palette-accent)]/10 ${lng.color}`
                    : "border-white/30 dark:border-white/10 bg-white/40 dark:bg-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                }`}
              >
                <div className="text-2xl">{lng.flag}</div>
                <div className="text-[10px] font-medium mt-1">{lng.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Learning language selector */}
        <div className="mb-4">
          <label className="text-xs text-[var(--color-text-muted)] mb-2 block">
            {t("page__learning_")}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGE_OPTIONS.filter((l) => l.code !== selectedNative).map(
              (lng) => (
                <button
                  key={`learning-${lng.code}`}
                  type="button"
                  onClick={() => setSelectedLearning(lng.code)}
                  aria-pressed={selectedLearning === lng.code}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    selectedLearning === lng.code
                      ? `border-[var(--palette-accent)] bg-[var(--palette-accent)]/10 ${lng.color}`
                      : "border-white/30 dark:border-white/10 bg-white/40 dark:bg-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  }`}
                >
                  <div className="text-2xl">{lng.flag}</div>
                  <div className="text-[10px] font-medium mt-1">{lng.label}</div>
                </button>
              )
            )}
          </div>
          {selectedNative === selectedLearning && (
            <p className="text-xs text-red-500 mt-2">
              ⚠️ {t("page_language_same_error")}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveLanguage}
          disabled={selectedNative === selectedLearning}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mb-6 ${
            selectedNative === selectedLearning
              ? "bg-white/20 dark:bg-white/5 text-[var(--color-text-muted)] cursor-not-allowed"
              : "bg-gradient-to-r from-[var(--palette-primary)] to-[var(--palette-accent)] text-white hover:scale-105"
          }`}
        >
          <Languages size={16} />
          {t("page_save_languages")}
        </button>

        {/* ─── 🎨 APPEARANCE SECTION ─── */}
        <div className="mb-6 pt-4 border-t border-white/20 dark:border-white/10">
          <label className="text-xs text-[var(--color-text-muted)] mb-2 block font-bold">
            🎨 Տառատեսակ (Font)
          </label>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { id: "sans", label: "Sans", class: "font-sans" },
              { id: "serif", label: "Serif", class: "font-serif" },
              { id: "mono", label: "Mono", class: "font-mono" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => updateAppearance("font", f.id)}
                className={`p-2 rounded-xl border-2 transition-all ${f.class} ${
                  selectedFont === f.id
                    ? "border-[var(--palette-accent)] bg-[var(--palette-accent)]/10 text-[var(--color-text)]"
                    : "border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/5 text-[var(--color-text-secondary)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <label className="text-xs text-[var(--color-text-muted)] mb-2 block font-bold">
            🖌️ Հիմնական գույն (Accent)
          </label>
          <div className="flex gap-3 justify-center">
            {[
              { id: "red", color: "bg-[#d90012]" },
              { id: "blue", color: "bg-[#0033a0]" },
              { id: "emerald", color: "bg-[#059669]" },
              { id: "purple", color: "bg-[#7c3aed]" },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => updateAppearance("color", c.id)}
                className={`w-10 h-10 rounded-full ${c.color} transition-all ${
                  selectedColor === c.id
                    ? "ring-4 ring-[var(--palette-accent)] scale-110"
                    : "opacity-60 hover:opacity-100"
                }`}
                aria-label={`Color ${c.id}`}
              />
            ))}
          </div>
        </div>

        {/* ─── DANGER ZONE ─── */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20 dark:border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-transparent px-2 text-[var(--color-text-muted)]">
              ⚠️ {t("page_danger_zone")}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="w-full py-3 rounded-xl border-2 border-red-500/30 bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} />
          {t("page__onboarding_")}
        </button>
        <p className="text-[10px] text-[var(--color-text-muted)] text-center mt-2">
          {t("page_reset_warning")}
        </p>

        <button
          type="button"
          onClick={() => setShowSettingsModal(false)}
          className="w-full mt-3 py-2.5 rounded-xl border border-white/20 dark:border-white/10 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors text-sm font-medium"
        >
          {t("page_cancel")}
        </button>
      </Modal>

      {/* ─── RESET CONFIRMATION MODAL ─── */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        labelledBy="reset-modal-title"
        zIndex={101}
      >
        <div className="text-center">
          <div className="text-5xl mb-4" aria-hidden="true">
            ⚠️
          </div>
          <h3
            id="reset-modal-title"
            className="text-xl font-bold text-[var(--color-text)] mb-2"
          >
            {t("page_reset_onboarding_title")}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            {t("page_reset_onboarding_description")}
            <br />
            <span className="text-red-500 font-bold">
              {t("page_reset_irreversible")}
            </span>
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 py-3 rounded-xl border border-white/20 dark:border-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors font-medium"
            >
              {t("page_cancel")}
            </button>
            <button
              type="button"
              onClick={handleResetOnboarding}
              disabled={isResetting}
              className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isResetting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t("page_deleting")}
                </>
              ) : (
                <>
                  <XCircle size={16} />
                  {t("page_confirm")}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────

function StatRow({
  label,
  value,
  valueClass = "text-[var(--color-text)]",
}: {
  label: string;
  value: number | string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/40 dark:bg-white/5 rounded-xl">
      <span className="text-[var(--color-text-secondary)]">{label}</span>
      <span className={`font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}