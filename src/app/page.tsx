// src/app/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, BookOpen, Globe, Sparkles, ArrowRight, Zap, Heart, MessageSquare, Leaf, LayoutGrid,
  Trophy, Target, Calendar, TrendingUp, Award, Users, Music, Mic, Volume2, Settings,
  ChevronDown, ChevronUp, Star, Gift, Clock, CheckCircle, AlertCircle, Loader2,
  Languages, RefreshCw, RotateCcw, XCircle
} from "lucide-react";
import Nuri, { NuriSpeech } from "@/components/Nuri";
import ThemeToggle from "@/components/ThemeToggle";
import { NuriRain } from "@/components/NuriRain";
import { syncHearts, loadRewards, type UserRewards } from "@/lib/rewards/seeds";
import { loadQuests, type Quest } from "@/lib/rewards/seeds";
import { loadLangConfig, saveLangConfig, type LangCode, type LangPair } from "@/lib/i18n/index";
import { useI18n } from "@/hooks/useI18n"; // ✅ ՃԻՇՏ իմպորտ
// ❌ LanguageSwitcher-ը հեռացվել է

// ─── TYPES ────────────────────────────────────────────────────────────

interface HomeStats {
  streak: number;
  totalHAYQ: number;
  hearts: number;
  hasStarted: boolean;
  dailyProgress: number;
  dailyGoal: number;
}

// ✅ FIXED: Use any for icons
interface QuickLink {
  href: string;
  icon: any;
  labelKey: string;
  color?: string;
  badge?: string;
}

// ─── LANGUAGE OPTIONS ───────────────────────────────────────────────

const LANGUAGE_OPTIONS: { code: LangCode; label: string; flag: string; color: string }[] = [
  { code: "hy", label: "Հայերեն", flag: "🇦🇲", color: "text-red-400" },
  { code: "en", label: "English", flag: "🇬🇧", color: "text-blue-400" },
  { code: "ru", label: "Русский", flag: "🇷🇺", color: "text-green-400" },
];

// ─── QUICK LINKS ─────────────────────────────────────────────────────

const QUICK_LINKS: QuickLink[] = [
  { href: "/world", icon: Globe, labelKey: "page__world", color: "text-blue-400" },
  { href: "/dictionary", icon: BookOpen, labelKey: "page_dictionary", color: "text-emerald-400" },
  { href: "/dialogues", icon: MessageSquare, labelKey: "page_dialogues", color: "text-purple-400" },
  { href: "/curriculum", icon: LayoutGrid, labelKey: "page_curriculum", color: "text-amber-400" },
  { href: "/garden", icon: Leaf, labelKey: "page_garden", color: "text-green-400" },
  { href: "/user-dictionary", icon: Users, labelKey: "page_user_dictionary", color: "text-yellow-400" },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function Home() {
  const router = useRouter();
  const { t, locale, setLanguage } = useI18n();
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [nuriMood, setNuriMood] = useState<"happy" | "excited" | "encouraging" | "idle">("happy");
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  
  // ─── LANGUAGE STATE ────────────────────────────────────────────────
  const [currentNative, setCurrentNative] = useState<LangCode>("hy");
  const [currentLearning, setCurrentLearning] = useState<LangCode>("en");
  const [selectedNative, setSelectedNative] = useState<LangCode>("hy");
  const [selectedLearning, setSelectedLearning] = useState<LangCode>("en");

  // ─── LOAD DATA ──────────────────────────────────────────────────────

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Check onboarding
      try {
        const langConfig = localStorage.getItem("nur_lang_config");
        if (!langConfig) {
          router.replace("/onboarding");
          return;
        }
        
        // Load current language settings
        const config = loadLangConfig();
        if (config) {
          setCurrentNative(config.native as LangCode);
          setCurrentLearning(config.learning as LangCode);
          setSelectedNative(config.native as LangCode);
          setSelectedLearning(config.learning as LangCode);
        }
      } catch {
        router.replace("/onboarding");
        return;
      }

      try {
        const rewardsData = syncHearts();
        setRewards(rewardsData);

        const questsData = loadQuests() || [];
        setQuests(questsData);

        const today = new Date().toISOString().split("T")[0];
        const dailyActivity = rewardsData.dailyActivity?.[today] || 0;
        const dailyGoal = rewardsData.dailyGoal || 50;

        setStats({
          streak: rewardsData.streak || 0,
          totalHAYQ: rewardsData.totalHAYQ || 0,
          hearts: rewardsData.hearts || 5,
          hasStarted: (rewardsData.totalHAYQ || 0) > 0 || (rewardsData.streak || 0) > 0,
          dailyProgress: Math.min(dailyActivity, dailyGoal),
          dailyGoal: dailyGoal,
        });

        if (dailyActivity >= dailyGoal) {
          setNuriMood("excited");
          setTimeout(() => setNuriMood("happy"), 3000);
        }

      } catch (error) {
        console.error("Failed to load data:", error);
        setStats({
          streak: 0,
          totalHAYQ: 0,
          hearts: 5,
          hasStarted: false,
          dailyProgress: 0,
          dailyGoal: 50,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  // ─── THEME OBSERVER ───────────────────────────────────────────────

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains("dark"));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // ─── HANDLERS ──────────────────────────────────────────────────────

  const handleStatsClick = useCallback(() => {
    setShowStatsModal(true);
  }, []);

  const handleSettingsClick = useCallback(() => {
    const config = loadLangConfig();
    if (config) {
      setSelectedNative(config.native as LangCode);
      setSelectedLearning(config.learning as LangCode);
    }
    setShowSettingsModal(true);
  }, []);

  const handleClaimQuest = useCallback(async (questId: string) => {
    try {
      const { claimReward } = await import("@/lib/rewards/seeds");
      const reward = claimReward(questId);
      
      if (reward) {
        const { addRewards } = await import("@/lib/rewards/seeds");
        addRewards(reward.hayq, reward.seeds || 0);
        
        const questsData = loadQuests() || [];
        setQuests(questsData);
        
        const rewardsData = syncHearts();
        setRewards(rewardsData);
        
        setStats((prev) =>
          prev
            ? {
                ...prev,
                totalHAYQ: rewardsData.totalHAYQ,
                hasStarted: true,
              }
            : null
        );

        setNuriMood("excited");
        setTimeout(() => setNuriMood("happy"), 2000);
      }
    } catch (error) {
      console.error("Failed to claim quest:", error);
    }
  }, []);

  // ─── SAVE LANGUAGE SETTINGS ───────────────────────────────────────

  const handleSaveLanguage = useCallback(() => {
  try {
    saveLangConfig({
      native: selectedNative,
      learning: selectedLearning,
      pair: `${selectedNative}-${selectedLearning}` as LangPair,
    });
    // ✅ UI-ի լեզուն թարմացնել
    setLanguage(selectedNative);
    setCurrentNative(selectedNative);
    setCurrentLearning(selectedLearning);
    setShowSettingsModal(false);
    
    setNuriMood("excited");
    setTimeout(() => setNuriMood("happy"), 2000);
    
    router.refresh();
  } catch (error) {
    console.error("Failed to save language settings:", error);
  }
}, [selectedNative, selectedLearning, router, setLanguage]);

  // ─── RESET ONBOARDING ─────────────────────────────────────────────

  const handleResetOnboarding = useCallback(() => {
    setIsResetting(true);
    
    try {
      localStorage.removeItem("nur_lang_config");
      localStorage.removeItem("nurlingo_rewards");
      localStorage.removeItem("nurlingo_quests");
      localStorage.removeItem("nurlingo_hearts");
      localStorage.removeItem("nurlingo_streak");
      localStorage.removeItem("nur_device_id");
      localStorage.removeItem("nur_lesson_mistakes_v2");
      
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith("wav_audio_")) {
          localStorage.removeItem(key);
          localStorage.removeItem(key + "_time");
        }
      });
      
      setTimeout(() => {
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

  // ─── LOADING STATE ─────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FFA500] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm font-medium">{t("page_loading")}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm font-medium">{t("page_something_went_wrong")}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition"
          >
            {t("page__reload")}
          </button>
        </div>
      </div>
    );
  }

  const isReturning = stats.hasStarted;
  const completedQuests = quests.filter(q => q.completed && !q.claimed).length;

  // ─── MAIN RENDER ──────────────────────────────────────────────────

  return (
    <main className="min-h-screen text-white overflow-hidden relative">

      {/* ─── BACKGROUND ─── */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: isDark
            ? "url('/images/pomegranate-dark.jpg')"
            : "url('/images/pomegranate-light.jpg')",
        }}
      />

      <NuriRain langs={["hy"]} count={35} speed={0.7} />

      {/* ─── HEADER ACTIONS ─── */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* ✅ Language Switcher-ը հեռացվել է */}

        {isReturning && completedQuests > 0 && (
          <div className="relative">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] font-bold text-black animate-pulse">
              {completedQuests}
            </div>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          </div>
        )}
        
        <button
          onClick={handleSettingsClick}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all"
          title={t("page_settings")}
        >
          <Settings size={20} className="text-white/60 hover:text-white transition" />
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
              ? completedQuests > 0
                ? t("page_nuri_quests_ready", { count: completedQuests })
                : t("page_nuri_continue")
              : t("page_nuri_welcome")
          }
          mood={nuriMood}
        />

        {/* ─── TITLE ─── */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mt-4 mb-1">
          <span className="bg-gradient-to-r from-[#D90012] via-[#F2A800] to-[#0033A0] bg-clip-text text-transparent">
            NUR Lingo
          </span>
        </h1>
        <p className="text-white/30 text-sm font-bold uppercase tracking-[0.3em] mb-6">
          {t("page_subtitle")}
        </p>

        {/* ─── STATS ─── */}
        {isReturning && (
          <div className="flex items-center gap-3 mb-6 flex-wrap justify-center">
            <button
              onClick={handleStatsClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all"
            >
              <Flame size={14} className="text-orange-500" />
              <span className="text-sm font-bold text-white">{stats.streak}</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
              <Zap size={14} className="text-yellow-500" />
              <span className="text-sm font-bold text-white">{stats.totalHAYQ}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
              <Heart size={14} className="text-red-500" />
              <span className="text-sm font-bold text-white">{stats.hearts}</span>
            </div>
            {rewards && rewards.streakFreeze > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30">
                <span className="text-xs">🛡️</span>
                <span className="text-xs font-bold text-blue-400">{rewards.streakFreeze}</span>
              </div>
            )}
          </div>
        )}

        {/* ─── MAIN BUTTON ─── */}
        <div className="w-full max-w-sm">
          <Link
            href={isReturning ? "/world" : "/onboarding"}
            className="w-full bg-gradient-to-r from-[#D90012] to-[#FFA500] text-white font-bold py-5 px-8 rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-red-500/20 text-lg backdrop-blur-soft group"
          >
            <Sparkles size={22} className="group-hover:rotate-12 transition-transform" />
            {isReturning ? t("page_continue") : t("page_start")}
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ─── QUICK LINKS ─── */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-6 w-full max-w-sm">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-2.5 text-center hover:bg-white/20 hover:scale-105 transition-all group"
            >
              <item.icon size={20} className={`mx-auto ${item.color || 'text-white/60'} mb-0.5 group-hover:scale-110 transition-transform`} />
              <span className="text-[8px] font-bold text-white/50 uppercase tracking-wider">
                {t(item.labelKey)}
              </span>
            </Link>
          ))}
        </div>

        {/* ─── DAILY PROGRESS ─── */}
        {isReturning && (
          <div className="w-full max-w-sm mt-4">
            <div className="flex items-center justify-between text-xs text-white/40 mb-1">
              <span className="flex items-center gap-1.5">
                <Target size={12} />
                {t("page_daily_goal")}
              </span>
              <span>{Math.round(stats.dailyProgress)} / {stats.dailyGoal} XP</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 backdrop-blur-sm overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.dailyProgress / stats.dailyGoal) * 100, 100)}%` }}
                className="h-full rounded-full bg-gradient-to-r from-[#D90012] via-[#F2A800] to-[#0033A0]"
              />
            </div>
          </div>
        )}

        {/* ─── FOOTER ─── */}
        <p className="text-white/10 text-[10px] font-bold uppercase tracking-[0.2em] mt-8">
          {t("page_footer_platform")}
        </p>
      </div>

      {/* ─── STATS MODAL ─── */}
      <AnimatePresence>
        {showStatsModal && rewards && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setShowStatsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Trophy size={20} className="text-yellow-500" />
                  {t("page_stats") || "Stats"}
                </h3>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-white/40 hover:text-white/70 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-white/60">{t("page__streak") || "Streak"}</span>
                  <span className="font-bold text-white">{rewards.streak}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-white/60">{t("page__hayq") || "HAYQ"}</span>
                  <span className="font-bold text-yellow-400">{rewards.totalHAYQ}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-white/60">{t("page__seeds") || "Seeds"}</span>
                  <span className="font-bold text-emerald-400">{rewards.totalSeeds}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-white/60">{t("page__hearts") || "Hearts"}</span>
                  <span className="font-bold text-red-400">{rewards.hearts}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-white/60">{t("page__freeze") || "Freeze"}</span>
                  <span className="font-bold text-blue-400">{rewards.streakFreeze}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-white/60">{t("page__crowns") || "Crowns"}</span>
                  <span className="font-bold text-amber-400">
                    {Object.values(rewards.crowns || {}).reduce((a, b) => a + b, 0)}
                  </span>
                </div>
              </div>

              {quests.filter(q => q.completed && !q.claimed).length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">{t("page__completed_quests") || "Completed Quests"}</p>
                  <div className="space-y-1.5">
                    {quests.filter(q => q.completed && !q.claimed).map((q) => (
                      <div key={q.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-xs">
                        <span className="text-white/70">
                           {q.description?.[locale as keyof typeof q.description] || q.description?.en || q.id}
                        </span>
                        <button
                          onClick={() => handleClaimQuest(q.id)}
                          className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors text-[10px] font-bold"
                        >
                          {t("page_claim")}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowStatsModal(false)}
                className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D90012] to-[#FFA500] text-white font-bold text-sm"
              >
                {t("page_close")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── SETTINGS MODAL ─── */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings size={20} className="text-white/60" />
                  {t("page_settings")}
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-white/40 hover:text-white/70 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="bg-white/5 rounded-xl p-3 mb-4">
                <p className="text-xs text-white/40 mb-1">{t("page_current_languages")}</p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-white/60">{t("page__native_") || "Native"}</span>
                  <span className="font-bold text-white">
                    {LANGUAGE_OPTIONS.find(l => l.code === currentNative)?.flag} {LANGUAGE_OPTIONS.find(l => l.code === currentNative)?.label}
                  </span>
                  <span className="text-white/20">→</span>
                  <span className="font-bold text-[#FFA500]">
                    {LANGUAGE_OPTIONS.find(l => l.code === currentLearning)?.flag} {LANGUAGE_OPTIONS.find(l => l.code === currentLearning)?.label}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-white/40 mb-2 block">{t("page__native_") || "Native"}</label>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <button
                      key={`native-${lang.code}`}
                      onClick={() => setSelectedNative(lang.code)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        selectedNative === lang.code
                          ? `border-[#FFA500] bg-[#FFA500]/10 ${lang.color}`
                          : "border-white/10 bg-white/5 text-white/40 hover:text-white/70"
                      }`}
                    >
                      <div className="text-2xl">{lang.flag}</div>
                      <div className="text-[10px] font-medium mt-1">{lang.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-white/40 mb-2 block">{t("page__learning_") || "Learning"}</label>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGE_OPTIONS.filter(l => l.code !== selectedNative).map((lang) => (
                    <button
                      key={`learning-${lang.code}`}
                      onClick={() => setSelectedLearning(lang.code)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        selectedLearning === lang.code
                          ? `border-[#FFA500] bg-[#FFA500]/10 ${lang.color}`
                          : "border-white/10 bg-white/5 text-white/40 hover:text-white/70"
                      }`}
                    >
                      <div className="text-2xl">{lang.flag}</div>
                      <div className="text-[10px] font-medium mt-1">{lang.label}</div>
                    </button>
                  ))}
                </div>
                {selectedNative === selectedLearning && (
                  <p className="text-xs text-red-400 mt-2">⚠️ {t("page_language_same_error")}</p>
                )}
              </div>

              <button
                onClick={handleSaveLanguage}
                disabled={selectedNative === selectedLearning}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  selectedNative === selectedLearning
                    ? "bg-white/5 text-white/20 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#D90012] to-[#FFA500] text-white hover:scale-105"
                }`}
              >
                <Languages size={16} />
                {t("page_save_languages")}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-transparent px-2 text-white/20">⚠️ {t("page_danger_zone")}</span>
                </div>
              </div>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-3 rounded-xl border-2 border-red-500/30 bg-red-500/10 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                {t("page__onboarding_") || "Reset Onboarding"}
              </button>
              <p className="text-[10px] text-white/20 text-center mt-2">
                {t("page_reset_warning") || "All data will be lost!"}
              </p>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full mt-3 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white/70 transition-colors text-sm font-medium"
              >
                {t("page_cancel")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── RESET CONFIRMATION MODAL ─── */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 dark:bg-gray-900/95 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 max-w-sm w-full text-center"
            >
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-white mb-2">{t("page_reset_onboarding_title")}</h3>
              <p className="text-sm text-white/40 mb-6">
                {t("page_reset_onboarding_description")}
                <br />
                <span className="text-red-400 font-bold">{t("page_reset_irreversible")}</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white/80 transition-colors font-medium"
                >
                  {t("page_cancel")}
                </button>
                <button
                  onClick={handleResetOnboarding}
                  disabled={isResetting}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}