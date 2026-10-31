// src/app/world/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNuri } from "@/hooks/useNuri";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  X,
  Lock,
  Gift,
  CheckCircle,
  Clock,
  Sparkles,
  Target,
  ArrowUp,
  Unlock,
  HelpCircle, // ✅ Ավելացվել է «?» կոճակի համար
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import {
  loadRewards,
  saveRewards,
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
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/hooks/useI18n";

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

const STORAGE_KEYS = {
  UNLOCK_ALL: "nurlingo_unlock_all",
  LANG_CONFIG: "nur_lang_config",
} as const;

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
  isUnlocked = false,
}: {
  lessons: MultiLesson[];
  unit: MultiUnit;
  crowns: Record<string, number>;
  onStart: (l: MultiLesson) => void;
  native: LangCode;
  isUnlocked?: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(400);

  useEffect(() => {
    const measure = () => {
      const el = wrapperRef.current;
      if (!el || !el.parentElement) return;
      const available = el.parentElement.clientWidth - 48;
      setContainerWidth(Math.max(260, Math.min(400, available)));
    };
    const t = setTimeout(measure, 0);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const WIDTH = containerWidth;
  const scale = WIDTH / 400;
  const STEP_Y = 130 * scale;
  const AMPLITUDE = 140 * scale;
  const centerX = WIDTH / 2;
  const height = Math.max(160 * scale, lessons.length * STEP_Y + 40);

  const NODES_PER_SWING = 3.5;
  const nodeX = (i: number) => {
    const angle = (i / NODES_PER_SWING) * Math.PI;
    return centerX + Math.sin(angle) * AMPLITUDE;
  };
  const nodeY = (i: number) => 50 + i * STEP_Y;

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
          strokeWidth={4}
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
        const size = "w-16 h-16 md:w-20 md:h-20";
        const textSize = "text-3xl";

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
                    className="w-5 h-5 text-[9px] bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border border-yellow-600"
                  >
                    ⭐
                  </motion.div>
                ))}
              </div>
            )}

            {!unlocked && !done && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-600">
                  <Lock size={12} className="text-gray-400" />
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

            <p className="mt-2 text-[10px] font-bold text-white/70 max-w-[90px] truncate text-center">
              {l.title[native] || l.title.en}
            </p>
          </motion.button>
        );
      })}
    </div>
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
  const { t, locale } = useI18n();
  
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
  const [native, setNative] = useState<LangCode>("en");
  const [pair, setPair] = useState<LangPair>("en-hy");
  const [quests, setQuests] = useState<Quest[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [worldStats, setWorldStats] = useState<WorldStats | null>(null);
  const [unlockAllActive, setUnlockAllActive] = useState(false);
  
  const topRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

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
      
      const mergedRewards: UserRewards = {
        ...r,
        ...withFreeze,
        ...(res.rewards || {}),
        ...(goalRes.rewards || {}),
      };
      setRewards(mergedRewards);

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

      try {
        const unlockSetting = localStorage.getItem(STORAGE_KEYS.UNLOCK_ALL);
        if (unlockSetting === "true") {
          setUnlockAllActive(true);
        }
      } catch {
        // Ignore
      }

      const savedConfig = localStorage.getItem(STORAGE_KEYS.LANG_CONFIG);
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
      bestStreak: rewards.maxStreak || rewards.streak || 0,
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

  // ─── START LESSON ──────────────────────────────────────────────────

  const startLesson = useCallback((l: MultiLesson) => {
    router.push(`/learn?lesson=${l.id}&pair=${pair}`);
  }, [router, pair]);

  // ─── CLAIM QUEST ───────────────────────────────────────────────────

  const handleClaimQuest = useCallback((questId: string) => {
    try {
      const reward = claimReward(questId);
      if (reward) {
        const updated = addRewards(reward.hayq, reward.seeds || 0);
        setQuests(loadQuests() || []);
        setRewards(updated);
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

  const filteredUnits = useMemo(() => {
    let result = units;
    if (selectedUnit) {
      result = result.filter(u => u.id === selectedUnit);
    }
    return result;
  }, [units, selectedUnit]);

  const level = useMemo(
    () => (rewards ? hayqToLevel(rewards.totalHAYQ || 0) : null),
    [rewards]
  );

  if (!rewards || !level) return null;

  const completedLessons = allLessons.filter(l => (rewards.crowns[l.id] || 0) > 0).length;
  const totalLessons = allLessons.length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // ─── RENDER ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent text-gray-900 dark:text-white pb-24">
      <div ref={topRef} className="relative z-10 flex flex-col">
        
        {/* Nuri - fixed top right */}
        <div className="fixed top-24 right-6 z-50 pointer-events-none">
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
            {/* ✅ Տեղափոխված «?» (Nuri/Օգնություն) կոճակը վերև աջ */}
            <button
              onClick={() => {
                // Այստեղ ավելացրու Nuri օգնականի բացման տրամաբանությունը, եթե կա
                // Օրինակ՝ setShowNuri(true)
              }}
              className="p-2 rounded-xl bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 hover:border-white/30 dark:hover:border-white/20 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
              title="Օգնություն / Nuri"
            >
              <HelpCircle size={20} />
            </button>
          </div>
        </nav>

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
                  const getDescription = (q: Quest, lang: LangCode): string => {
                    if (typeof q.description === "string") return q.description;
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
          </div>
        </div>

        {/* ─── UNIT SELECTOR ─── */}
        {units.length > 1 && (
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
                  {t("page_no_units")}
                </p>
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
    </div>
  );
}