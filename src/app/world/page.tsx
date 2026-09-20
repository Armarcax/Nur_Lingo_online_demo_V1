// src/app/world/page.tsx
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNuri } from "@/hooks/useNuri";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Flame,
  Coins,
  Heart,
  Menu,
  X,
  Lock,
  Gift,
  CheckCircle,
  Clock,
  BookOpen,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Target,
  Calendar,
  Star,
  Crown,
  Medal,
  Users,
  MessageSquare,
  Music,
  Mic,
  Volume2,
  Settings,
  ChevronDown,
  ChevronUp,
  Grid3x3,
  List,
  Filter,
  Search,
  ArrowUp,
  RefreshCw,
  Loader2,
  AlertCircle,
  Check,
  Share2,
  Copy,
  Unlock,
  Lock as LockIcon,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import {
  loadRewards,
  syncHearts,
  checkAndApplyFreeze,
  checkStreakMilestones,
  checkDailyGoalBonus,
  addRewards,
  type UserRewards,
} from "@/lib/rewards/seeds";
import { loadQuests, claimReward, type Quest } from "@/lib/rewards/seeds";
import {
  getLessonsForPair,
  LangPair,
  MultiLesson,
  MultiUnit,
} from "@/lib/i18n/multilingual";
import { hayqToLevel } from "@/lib/lessons/engine";
import Nuri, { NuriSpeech, type NuriMood } from "@/components/Nuri";
import { loadLangConfig, LangCode } from "@/lib/i18n/index";
import ThemeToggle from "@/components/ThemeToggle";
import { GlassCard } from "@/components/ui/glass-card";
import { PageLayout } from "@/components/PageLayout";
import { useI18n } from "@/hooks/useI18n"; // ✅ ՃԻՇՏ import

// ─── TYPES ────────────────────────────────────────────────────────────

interface WorldStats {
  totalLessons: number;
  completedLessons: number;
  totalUnits: number;
  completedUnits: number;
  overallProgress: number;
  totalCrowns: number;
  currentStreak: number;
  bestStreak: number;
  totalHAYQ: number;
  totalSeeds: number;
}

// ─── CONFETTI ─────────────────────────────────────────────────────────

function Confetti({ color, count = 30, active = true }: { color: string; count?: number; active?: boolean }) {
  if (!active) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-visible">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, x: 0, y: 0, scale: Math.random() * 0.5 + 0.5, rotate: 0 }}
          animate={{
            opacity: 0,
            x: (Math.random() - 0.5) * 500,
            y: (Math.random() - 0.5) * 500,
            rotate: Math.random() * 720,
            scale: 0,
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: Math.random() * 4 + 1,
            ease: "easeOut",
          }}
          className="absolute w-2.5 h-2.5 rounded-sm"
          style={{ backgroundColor: color, left: "50%", top: "50%" }}
        />
      ))}
    </div>
  );
}

// ─── SNAKE PATH ──────────────────────────────────────────────────────

function SnakePath({
  lessons,
  unit,
  crowns,
  onStart,
  native,
  isCompact = false,
  isUnlocked = false,
}: {
  lessons: MultiLesson[];
  unit: MultiUnit;
  crowns: Record<string, number>;
  onStart: (l: MultiLesson) => void;
  native: LangCode;
  isCompact?: boolean;
  isUnlocked?: boolean;
}) {
  const { t } = useI18n();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(400);

  // 📱 Responsive: measure available width on the parent and scale all positions
  useEffect(() => {
    const measure = () => {
      const el = wrapperRef.current;
      if (!el || !el.parentElement) return;
      // GlassCard has p-6 (24px each side = 48px total padding)
      const available = el.parentElement.clientWidth - 48;
      setContainerWidth(Math.max(260, Math.min(400, available)));
    };
    // Let layout settle first
    const t = setTimeout(measure, 0);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, []);

  const WIDTH = containerWidth;
  const scale = WIDTH / 400;
  const STEP_Y = (isCompact ? 100 : 130) * scale;
  const AMPLITUDE = (isCompact ? 100 : 140) * scale;
  const centerX = WIDTH / 2;
  const height = Math.max((isCompact ? 120 : 160) * scale, lessons.length * STEP_Y + 40);

  const NODES_PER_SWING = 3.5;
  const nodeX = (i: number) => {
    const angle = (i / NODES_PER_SWING) * Math.PI;
    return centerX + Math.sin(angle) * AMPLITUDE;
  };
  const nodeY = (i: number) => (isCompact ? 30 : 50) + i * STEP_Y;

  const pathD = lessons.reduce((acc, _, i) => {
    const x = nodeX(i);
    const y = nodeY(i);
    if (i === 0) return `M ${x} ${y}`;
    const prevX = nodeX(i - 1);
    const prevY = nodeY(i - 1);
    const midY = (prevY + y) / 2;
    return `${acc} C ${prevX} ${midY}, ${x} ${midY}, ${x} ${y}`;
  }, "");

  const currentIdx = lessons.findIndex(l => (crowns[l.id] || 0) === 0);
  const isUnitComplete = lessons.every(l => (crowns[l.id] || 0) > 0);

  const isLessonUnlocked = (index: number) => {
    if (isUnlocked) return true;
    if (index === 0) return true;
    const prevLesson = lessons[index - 1];
    return (crowns[prevLesson.id] || 0) > 0;
  };

  return (
    <div ref={wrapperRef} className="relative mx-auto" style={{ width: WIDTH, height }}>
      <svg className="absolute inset-0 pointer-events-none" width={WIDTH} height={height}>
        <path
          d={pathD}
          fill="none"
          stroke={unit.colorFrom || "#D90012"}
          strokeOpacity={0.35}
          strokeWidth={isCompact ? 3 : 4}
          strokeDasharray="8 10"
          strokeLinecap="round"
        />
      </svg>

      {lessons.map((l, i) => {
        const done = (crowns[l.id] || 0) > 0;
        const isCurrent = i === currentIdx && !isUnitComplete;
        const isReview = l.id.startsWith("review_");
        const unlocked = isLessonUnlocked(i) || isUnlocked;
        const x = nodeX(i);
        const y = nodeY(i);
        const crownLevel = crowns[l.id] || 0;
        const size = isCompact ? "w-12 h-12 md:w-14 md:h-14" : "w-16 h-16 md:w-20 md:h-20";
        const textSize = isCompact ? "text-xl" : "text-3xl";

        return (
          <motion.button
            key={l.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={unlocked ? { scale: 1.1 } : {}}
            whileTap={unlocked ? { scale: 0.95 } : {}}
            onClick={() => unlocked && onStart(l)}
            disabled={!unlocked}
            className={`absolute -translate-x-1/2 -translate-y-1/2 group ${isCurrent ? "animate-bob" : ""}`}
            style={{ left: x, top: y }}
          >
            {done && (
              <div className="absolute -top-2 -right-2 flex gap-0.5 z-10">
                {[1, 2, 3].map((level) => (
                  <motion.div
                    key={level}
                    initial={{ scale: 0 }}
                    animate={{ scale: crownLevel >= level ? 1 : 0 }}
                    className={`${isCompact ? "w-3 h-3 text-[6px]" : "w-5 h-5 text-[9px]"} bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border border-yellow-600`}
                  >
                    ⭐
                  </motion.div>
                ))}
              </div>
            )}

            {!unlocked && !done && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className={`${isCompact ? "w-5 h-5" : "w-7 h-7"} bg-gray-700 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-600`}>
                  <Lock size={isCompact ? 10 : 12} className="text-gray-400" />
                </div>
              </div>
            )}

            {unlocked && !done && !isLessonUnlocked(i) && isUnlocked && (
              <div className="absolute -top-2 -left-2 z-10">
                <div className={`${isCompact ? "w-4 h-4" : "w-5 h-5"} bg-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-amber-400`}>
                  <Unlock size={isCompact ? 8 : 10} className="text-white" />
                </div>
              </div>
            )}

            <div
              className={`${size} rounded-[35%_65%_70%_30%/30%_30%_70%_70%] flex items-center justify-center ${textSize} shadow-2xl border-4 transition-all ${
                !unlocked
                  ? "border-white/10 opacity-40 grayscale"
                  : done
                    ? "border-yellow-400 shadow-glow"
                    : isReview
                      ? "border-purple-400/60"
                      : "border-white/20"
              }`}
              style={{
                background: unlocked
                  ? `linear-gradient(135deg, ${isReview ? "#9333ea" : unit.colorFrom || "#D90012"}, ${isReview ? "#581c87" : unit.colorTo || "#F2A800"})`
                  : "rgba(255,255,255,0.05)",
              }}
            >
              <span className="drop-shadow-lg">{!unlocked ? "🔒" : isReview ? "🏆" : unit.iconEmoji}</span>
            </div>

            {!isCompact && (
              <p className="mt-2 text-[10px] font-bold text-white/70 max-w-[90px] truncate text-center">
                {l.title[native] || l.title.en}
              </p>
            )}

            {unlocked && !done && (
              <div className="absolute -top-8 -left-14 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <img 
                  src="/images/nuri/nuri-wink.png" 
                  alt="Nuri wink" 
                  className="w-14 h-14 object-contain animate-bounce"
                />
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── STAT COMPONENT ──────────────────────────────────────────────────

function Stat({ icon, value, color, label, onClick }: { icon: string; value: string | number; color?: string; label?: string; onClick?: () => void }) {
  return (
    <div 
      className={`bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-1 text-sm font-bold ${color || ""} ${onClick ? "cursor-pointer hover:border-white/40 dark:hover:border-white/20 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]" : ""}`}
      onClick={onClick}
    >
      <span>{icon}</span>
      <span>{value}</span>
      {label && <span className="text-[8px] text-white/40 font-normal ml-0.5">{label}</span>}
    </div>
  );
}

// ─── STREAK MILESTONE MODAL ─────────────────────────────────────────

function StreakMilestoneModal({
  milestone,
  onClose,
}: {
  milestone: number;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const rewards = [
    { days: 7, reward: "🎁 +1 Heart" },
    { days: 14, reward: "🎁 +2 Seeds" },
    { days: 30, reward: "🎁 +5 HAYQ" },
    { days: 60, reward: "🎁 +10 Seeds" },
    { days: 100, reward: "🎁 +20 HAYQ" },
  ];
  
  const currentReward = rewards.find(r => r.days === milestone) || rewards[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, y: 60 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 60 }}
        className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-yellow-500/10 via-transparent to-transparent animate-pulse" />

        <Nuri mood="celebrating" glow size={150} className="mx-auto mb-4" />

        <h2 className="text-3xl font-black text-gray-900 dark:text-white">
          🔥 {milestone} {t("page_days")}!
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">
          {t("page_streak_milestone")}
        </p>

        <div className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-2xl p-4 mt-6 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3 text-left">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="text-xs font-bold text-[#FFA500] uppercase tracking-wider">
                {t("page_reward")}
              </p>
              <p className="font-bold text-gray-900 dark:text-white">{currentReward.reward}</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-[#FFA500]">✅</span>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-[#FFA500] text-black py-3 rounded-xl font-bold text-sm hover:bg-[#FFA500]/80 transition-colors"
        >
          {t("page_awesome")}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── DAILY GOAL MODAL ───────────────────────────────────────────────

function DailyGoalModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, y: 60 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 60 }}
        className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      >
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">{t("page_daily_goal_complete")}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t("page_daily_goal_message")}</p>
        <button
          onClick={onClose}
          className="w-full mt-6 bg-[#FFA500] text-black py-3 rounded-xl font-bold text-sm hover:bg-[#FFA500]/80 transition-colors"
        >
          {t("page_congrats")}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── UNIT PROGRESS BAR ──────────────────────────────────────────────

function UnitProgressBar({ completed, total }: { completed: number; total: number }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <div className="flex items-center gap-3 mt-3 w-full">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 dark:bg-gray-700 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#FFA500] to-[#D90012]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-[10px] font-medium text-gray-400 dark:text-gray-400 min-w-[32px] text-right">
        {percentage}%
      </span>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function WorldPage() {
  const router = useRouter();
  const { setPage } = useNuri();
  const { t, locale } = useI18n(); // ✅ ՃԻՇՏ useI18n
  
  // ─── LOCAL TOAST ──────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
  
  const showMessage = useCallback((text: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage(text);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  }, []);
  
  useEffect(() => setPage("world"), [setPage]);
  
  // ─── STATE ──────────────────────────────────────────────────────────
  
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [units, setUnits] = useState<MultiUnit[]>([]);
  const [allLessons, setAllLessons] = useState<MultiLesson[]>([]);
  const [milestone, setMilestone] = useState<number | null>(null);
  const [goalAchieved, setGoalAchieved] = useState(false);
  const [native, setNative] = useState<LangCode>("en");
  const [pair, setPair] = useState<LangPair>("en-hy");
  const [quests, setQuests] = useState<Quest[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [worldStats, setWorldStats] = useState<WorldStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockAllActive, setUnlockAllActive] = useState(false);
  
  const topRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const confettiRef = useRef<Record<string, boolean>>({});

  // ─── LOAD DATA ──────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const config = loadLangConfig();
      const p = (config?.pair || "en-hy") as LangPair;
      const nat = (config?.native || "en") as LangCode;
      setNative(nat);
      setPair(p);

      const r = syncHearts();
      const withFreeze = checkAndApplyFreeze();
      const res = checkStreakMilestones();
      const goalRes = checkDailyGoalBonus();
      
      const mergedRewards = {
        ...r,
        ...withFreeze,
        ...(res.rewards || {}),
        ...(goalRes.rewards || {}),
      };
      setRewards(mergedRewards);
      
      if (res.milestone) setMilestone(res.milestone);

      const today = new Date().toISOString().split("T")[0];
      const dailyActivity = goalRes.rewards?.dailyActivity?.[today] || 0;
      const dailyGoal = goalRes.rewards?.dailyGoal || 50;
      if (dailyActivity >= dailyGoal) {
        setGoalAchieved(true);
      }

      try {
        const data = getLessonsForPair(p);
        setUnits(data.units || []);
        setAllLessons(data.lessons || []);
      } catch (error) {
        console.error("Failed to load lessons:", error);
        setUnits([]);
        setAllLessons([]);
      }
      
      try {
        setQuests(loadQuests() || []);
      } catch {
        setQuests([]);
      }

      // ✅ Check unlock all setting from localStorage
      try {
        const unlockSetting = localStorage.getItem("nurlingo_unlock_all");
        if (unlockSetting === "true") {
          setIsUnlocked(true);
          setUnlockAllActive(true);
        }
      } catch {
        // Ignore
      }

      const savedConfig = localStorage.getItem("nur_lang_config");
      if (!savedConfig) {
        router.push("/onboarding");
        return;
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      setRewards(syncHearts());
    }
  }, [router]);

  // ─── CALCULATE STATS ──────────────────────────────────────────────

  useEffect(() => {
    if (!rewards || !allLessons.length) return;
    
    const stats: WorldStats = {
      totalLessons: allLessons.length,
      completedLessons: allLessons.filter(l => (rewards.crowns[l.id] || 0) > 0).length,
      totalUnits: units.length,
      completedUnits: units.filter(u => 
        allLessons.filter(l => l.unitId === u.id).every(l => (rewards.crowns[l.id] || 0) > 0)
      ).length,
      overallProgress: Math.round((allLessons.filter(l => (rewards.crowns[l.id] || 0) > 0).length / allLessons.length) * 100),
      totalCrowns: allLessons.reduce((sum, l) => sum + (rewards.crowns[l.id] || 0), 0),
      currentStreak: rewards.streak || 0,
      bestStreak: rewards.streak || 0,
      totalHAYQ: rewards.totalHAYQ || 0,
      totalSeeds: rewards.totalSeeds || 0,
    };
    setWorldStats(stats);
  }, [rewards, allLessons, units]);

  // ─── SCROLL EVENT ──────────────────────────────────────────────────

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── KEYBOARD SHORTCUTS ───────────────────────────────────────────

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSearch(true);
      }
      if (e.key === "Escape") {
        setShowStats(false);
        setShowSettings(false);
        setShowSearch(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // ─── START LESSON ──────────────────────────────────────────────────

  const startLesson = useCallback((l: MultiLesson) => {
    router.push(`/learn?lesson=${l.id}&pair=${pair}`);
  }, [router, pair]);

  // ─── CLAIM QUEST ───────────────────────────────────────────────────

  const handleClaimQuest = useCallback((questId: string) => {
    try {
      const reward = claimReward(questId);
      if (reward) {
        addRewards(reward.hayq, reward.seeds || 0);
        setQuests(loadQuests() || []);
        setRewards((prev) =>
          prev
            ? {
                ...prev,
                totalHAYQ: (prev.totalHAYQ || 0) + reward.hayq,
                totalSeeds: (prev.totalSeeds || 0) + (reward.seeds || 0),
              }
            : null
        );
        showMessage(t("page_quest_claimed", { hayq: reward.hayq }), "success");
      }
    } catch (error) {
      console.error("Failed to claim quest:", error);
      showMessage(t("page_quest_claim_failed"), "error");
    }
  }, [showMessage, t]);

  // ─── SCROLL TO TOP ─────────────────────────────────────────────────

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ─── TOGGLE COMPACT VIEW ──────────────────────────────────────────

  const toggleCompact = useCallback(() => {
    setIsCompact(prev => {
      const newVal = !prev;
      try {
        localStorage.setItem("nurlingo_compact_world", String(newVal));
      } catch {
        // Ignore
      }
      return newVal;
    });
  }, []);

  // ─── TOGGLE UNLOCK ALL ────────────────────────────────────────────

  const toggleUnlockAll = useCallback(() => {
    setIsUnlocked(prev => {
      const newVal = !prev;
      setUnlockAllActive(newVal);
      try {
        localStorage.setItem("nurlingo_unlock_all", String(newVal));
      } catch {
        // Ignore
      }
      showMessage(
        newVal ? t("page_unlock_all_on") : t("page_unlock_all_off"),
        newVal ? "success" : "info"
      );
      
      // ✅ Refresh the page to apply changes
      if (newVal) {
        // Also add crowns for all w1 lessons to show them as completed
        try {
          const rewards = JSON.parse(localStorage.getItem("nurlingo_rewards") || "{}");
          if (!rewards.crowns) rewards.crowns = {};
          for (let i = 1; i <= 10; i++) {
            rewards.crowns[`w1_l${i}`] = 3;
          }
          localStorage.setItem("nurlingo_rewards", JSON.stringify(rewards));
        } catch {
          // Ignore
        }
      }
      
      // Reload to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
      return newVal;
    });
  }, [showMessage, t]);

  // ─── LOAD COMPACT PREFERENCE ──────────────────────────────────────

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nurlingo_compact_world");
      if (saved) setIsCompact(saved === "true");
    } catch {
      // Ignore
    }
  }, []);

  // ─── FILTERED UNITS ───────────────────────────────────────────────

  const filteredUnits = useMemo(() => {
    let result = units;
    
    if (selectedUnit) {
      result = result.filter(u => u.id === selectedUnit);
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(u => 
        (u.title[native] || u.title.en).toLowerCase().includes(q) ||
        (u.description[native] || u.description.en).toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [units, selectedUnit, searchQuery, native]);

  if (!rewards) return null;

  const level = hayqToLevel(rewards.totalHAYQ || 0);
  const completedLessons = allLessons.filter(l => (rewards.crowns[l.id] || 0) > 0).length;
  const totalLessons = allLessons.length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const hasSearch = searchQuery.trim().length > 0;

  // ─── RENDER ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent text-gray-900 dark:text-white pb-24">
      <div ref={topRef} className="relative z-10 flex flex-col">
        
        {/* Nuri - վերևի աջ անկյունում */}
        <div className="fixed top-24 right-6 z-50">
          <img 
            src="/images/nuri/nuri-learning.png" 
            alt="Nuri learning" 
            className="w-20 h-20 object-contain animate-float"
          />
        </div>

        {/* ─── HEADER ─── */}
        <nav className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/20 dark:border-white/5 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-30 flex-wrap gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D90012] to-[#FFA500] flex items-center justify-center font-black text-xl shadow-lg border border-white/20">
              Ն
            </Link>
            <span className="font-black tracking-tighter text-xl uppercase italic text-gray-900 dark:text-white">NUR Lingo</span>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Rank */}
            <div className="hidden md:flex flex-col items-end mr-2">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">{t("page_rank")}</p>
              <p className="text-sm font-black" style={{ color: level.color || "#FFA500" }}>
                {level.title?.[native] || level.titleArmenian || t("page_student")}
              </p>
            </div>
            
            <Stat icon="🪙" value={rewards.totalHAYQ || 0} color="text-[#FFA500]" />
            <Stat icon="🍎" value={rewards.totalSeeds || 0} />
            <Stat 
              icon="🔥" 
              value={`${rewards.streak || 0}${rewards.streakFreeze > 0 ? " 🛡️" : ""}`} 
              onClick={() => setShowStats(true)}
            />
            <Stat icon="❤️" value={rewards.hearts || 5} />
            
            {/* ✅ Unlock All Toggle Button - top header */}
            <button
              onClick={toggleUnlockAll}
              className={`p-2 rounded-xl border transition-all duration-300 ${
                unlockAllActive
                  ? "bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30"
                  : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-white/30 dark:hover:border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
              }`}
              title={unlockAllActive ? t("page_unlock_all_on") : t("page_unlock_all_off")}
            >
              {unlockAllActive ? <Unlock size={16} /> : <LockIcon size={16} />}
            </button>
            
            {/* Stats Button */}
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-2 rounded-xl bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 hover:border-white/30 dark:hover:border-white/20 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
            >
              <TrendingUp size={16} />
            </button>
            
            {/* Search Button */}
            <button
              onClick={() => {
                setShowSearch(!showSearch);
                if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className="p-2 rounded-xl bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 hover:border-white/30 dark:hover:border-white/20 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
            >
              <Search size={16} />
            </button>
            
            {/* Compact Toggle */}
            <button
              onClick={toggleCompact}
              className={`p-2 rounded-xl border transition-colors ${
                isCompact ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
              }`}
              title={isCompact ? t("page_expand") : t("page_compact")}
            >
              {isCompact ? <Grid3x3 size={16} /> : <List size={16} />}
            </button>
            
            <Link
              href="/curriculum"
              className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 px-3 py-1.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/80 transition-all flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
            >
              <BookOpen size={14} />
              {t("page_curriculum")}
            </Link>
            <ThemeToggle />
          </div>
        </nav>

        {/* ─── SEARCH BAR ─── */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="max-w-4xl mx-auto px-4 py-3 w-full">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("page_search_worlds")}
                    className="w-full bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-xl px-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── UNLOCK ALL STATUS BAR ─── */}
        {unlockAllActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="max-w-4xl mx-auto px-4 py-2 w-full">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-amber-400">
                  <Unlock size={14} />
                  <span>{t("page_unlock_all_on")}</span>
                  <span className="text-[8px] bg-amber-500/20 px-1.5 py-0.5 rounded ml-1">DEV MODE</span>
                </div>
                <button
                  onClick={toggleUnlockAll}
                  className="text-xs text-amber-400/60 hover:text-amber-400 transition-colors"
                >
                  {t("page_turn_off")}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── STATS PANEL ─── */}
        <AnimatePresence>
          {showStats && worldStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="max-w-4xl mx-auto px-4 py-4 w-full">
                <GlassCard variant="premium" className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-500">{worldStats.completedLessons}/{worldStats.totalLessons}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t("page_lessons")}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">{worldStats.totalCrowns}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">👑 {t("page_crowns")}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">{worldStats.bestStreak}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">🔥 {t("page_best_streak")}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">{worldStats.completedUnits}/{worldStats.totalUnits}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">📚 {t("page_units")}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t("page_overall_progress")}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${worldStats.overallProgress}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{worldStats.overallProgress}%</span>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── QUESTS ─── */}
        {quests.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 py-4 w-full">
            <GlassCard variant="premium" className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-yellow-500" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t("page_daily_quests")}</h3>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {quests.filter((q) => q.claimed).length}/{quests.length}
                </span>
              </div>
              <div className="space-y-2">
                {quests.map((q) => {
                  // ✅ Helper to get description
                  const getDescription = (q: Quest, lang: LangCode): string => {
                    if (typeof q.description === 'string') return q.description;
                    return q.description?.[lang] || q.description?.en || t("page_quest");
                  };
                  
                  return (
                    <div key={q.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-700 dark:text-gray-300">
                            {getDescription(q, native)}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {q.progress}/{q.target}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 mt-1 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${(q.progress / q.target) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                      {q.completed && !q.claimed ? (
                        <button
                          onClick={() => handleClaimQuest(q.id)}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#FFA500] text-black hover:bg-[#FFA500]/80 transition-colors"
                        >
                          <Gift size={12} className="inline mr-1" />
                          {t("page_claim")}
                        </button>
                      ) : q.claimed ? (
                        <span className="px-3 py-1.5 text-xs font-bold text-emerald-500">
                          <CheckCircle size={14} />
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 text-xs font-bold text-gray-400">
                          <Clock size={14} />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        )}

        {/* ─── HERO ─── */}
        <div className="px-6 pt-10 pb-8 max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-black leading-none mb-3 tracking-tighter italic mt-4 text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t("page_seed_world")}
          </motion.h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-2">
            <Sparkles size={12} className="text-yellow-500" />
            {t("page_organic_learning")}
            <Sparkles size={12} className="text-yellow-500" />
          </p>
          
          {/* Progress overview */}
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
            <span className="flex items-center gap-1">
              <CheckCircle size={12} className="text-emerald-500" />
              {completedLessons}/{totalLessons} {t("page_lessons")}
            </span>
            <span className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
            <span className="flex items-center gap-1">
              <Trophy size={12} className="text-yellow-500" />
              {worldStats?.totalCrowns || 0} {t("page_crowns")}
            </span>
            <span className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
            <span className="flex items-center gap-1">
              <Target size={12} className="text-blue-500" />
              {overallProgress}%
            </span>
            {hasSearch && (
              <>
                <span className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                <span className="flex items-center gap-1 text-amber-500">
                  <Search size={12} />
                  {filteredUnits.reduce((acc, u) => {
                    const lessons = allLessons.filter(l => l.unitId === u.id);
                    return acc + lessons.length;
                  }, 0)} {t("page_results")}
                </span>
              </>
            )}
            {unlockAllActive && (
              <>
                <span className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                <span className="flex items-center gap-1 text-amber-400">
                  <Unlock size={12} />
                  🔓 {t("page_all_unlocked")}
                </span>
              </>
            )}
          </div>
          
          {/* 🔓 Unlock All Status Badge - Hero */}
          {unlockAllActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold"
            >
              <Unlock size={14} />
              {t("page_all_unlocked")}
            </motion.div>
          )}
        </div>

        {/* ─── UNIT SELECTOR ─── */}
        {units.length > 1 && !hasSearch && (
          <div className="max-w-4xl mx-auto px-4 pb-4 w-full">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedUnit(null)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  !selectedUnit
                    ? "bg-[#FFA500] text-black"
                    : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                }`}
              >
                📚 {t("page_all")}
              </button>
              {units.map(u => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUnit(u.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    selectedUnit === u.id
                      ? "bg-[#FFA500] text-black"
                      : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                  }`}
                >
                  {u.iconEmoji} {u.title[native] || u.title.en}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── LESSON PATH ─── */}
        <div className="max-w-4xl mx-auto px-4 md:px-8 pb-32 w-full">
          <div className="flex flex-col gap-20">
            {filteredUnits.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {searchQuery ? t("page_no_results", { query: searchQuery }) : t("page_no_units")}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 px-6 py-2 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                  >
                    {t("page_clear_search")}
                  </button>
                )}
              </div>
            ) : (
              filteredUnits.map((unit) => {
                const lessons = allLessons.filter(l => l.unitId === unit.id);
                const completed = lessons.filter(l => (rewards.crowns[l.id] || 0) > 0).length;
                const pct = lessons.length ? (completed / lessons.length) * 100 : 0;
                const isComplete = pct === 100;

                return (
                  <GlassCard 
                    key={unit.id} 
                    variant="world"
                    className="p-6 relative overflow-hidden"
                  >
                    <div className="flex flex-col items-center mb-6">
                      <div className="px-6 py-3 rounded-2xl bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 relative shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{unit.iconEmoji}</span>
                          <h2 className="text-xl md:text-2xl font-black text-[#FFA500]">{unit.title[native] || unit.title.en}</h2>
                          {isComplete && (
                            <motion.span
                              initial={{ scale: 0, rotate: -20 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="text-xl"
                            >
                              🌟
                            </motion.span>
                          )}
                          {unlockAllActive && !isComplete && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full"
                            >
                              🔓 {t("page_unlocked")}
                            </motion.span>
                          )}
                        </div>
                        <p className="text-[10px] text-center text-gray-500 dark:text-gray-400 font-bold uppercase mt-1">{unit.description[native] || unit.description.en}</p>
                      </div>

                      {isComplete && <Confetti color={unit.colorFrom || "#D90012"} count={20} active={isComplete} />}

                      <UnitProgressBar completed={completed} total={lessons.length} />
                    </div>

                    <SnakePath
                      lessons={lessons}
                      unit={unit}
                      crowns={rewards.crowns}
                      onStart={startLesson}
                      native={native}
                      isCompact={isCompact}
                      isUnlocked={unlockAllActive}
                    />
                  </GlassCard>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ─── TOAST MESSAGE ─── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border px-6 py-3 max-w-sm rounded-xl text-center shadow-xl ${
              toastType === "success"
                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : toastType === "error"
                ? "border-red-500/30 text-red-600 dark:text-red-400"
                : "border-blue-500/30 text-blue-600 dark:text-blue-400"
            }`}
          >
            <p className="text-sm font-medium">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── SCROLL TO TOP ─── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 z-50 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 p-3.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all"
          >
            <ArrowUp size={20} className="text-gray-900 dark:text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <BottomNav />

      {/* ─── MODALS ─── */}
      <AnimatePresence>
        {milestone && (
          <StreakMilestoneModal
            milestone={milestone}
            onClose={() => setMilestone(null)}
          />
        )}
        {goalAchieved && (
          <DailyGoalModal onClose={() => setGoalAchieved(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}