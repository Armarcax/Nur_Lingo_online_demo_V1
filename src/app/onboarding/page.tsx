// src/app/onboarding/page.tsx - SINGLE PAGE ONBOARDING
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, Sparkles, Rocket, Check } from "lucide-react";
import { NuriSpeech } from "@/components/Nuri";
import ThemeToggle from "@/components/ThemeToggle";
import { useNuri } from "@/hooks/useNuri";
import { setDailyGoal } from "@/lib/rewards/seeds";
import { saveLangConfig, type LangPair } from "@/lib/i18n/index";
import { useI18n } from "@/hooks/useI18n";

type L = "hy" | "en" | "ru";

const LANGS: { c: L; nameKey: string; descKey: string; flag: string }[] = [
  { c: "hy", nameKey: "lang_hy", descKey: "lang_hy_desc", flag: "🇦🇲" },
  { c: "en", nameKey: "lang_en", descKey: "lang_en_desc", flag: "🇬🇧" },
  { c: "ru", nameKey: "lang_ru", descKey: "lang_ru_desc", flag: "🇷🇺" },
];

const GOALS = [
  { value: 5, icon: "🌱", labelKey: "goal_5min", descKey: "goal_beginner" },
  { value: 10, icon: "🌿", labelKey: "goal_10min", descKey: "goal_intermediate" },
  { value: 15, icon: "🌳", labelKey: "goal_15min", descKey: "goal_intensive" },
  { value: 20, icon: "🔥", labelKey: "goal_20min", descKey: "goal_extreme" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setPage } = useNuri();
  const { t, setLanguage } = useI18n();

  const [native, setNative] = useState<L | null>(null);
  const [learning, setLearning] = useState<L | null>(null);
  const [goal, setGoal] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPage("onboarding");
  }, [setPage]);

  // ─── HANDLE NATIVE SELECT ────────────────────────────────
  const handleNativeSelect = (lang: L) => {
    setNative(lang);
    setLanguage(lang);
    try {
      localStorage.setItem("nur_language_preference", lang);
    } catch {}
    if (learning === lang) {
      setLearning(null);
    }
    setError("");
  };

  // ─── HANDLE LEARNING SELECT ──────────────────────────────
  const handleLearningSelect = (lang: L) => {
    if (lang === native) {
      setError(t("page_language_same_error"));
      return;
    }
    setLearning(lang);
    setError("");
  };

  // ─── HANDLE START ─────────────────────────────────────────
  const handleStart = async () => {
    if (!native || !learning) {
      setError(t("page_choose_native") + " + " + t("page_choose_learning"));
      return;
    }
    if (native === learning) {
      setError(t("page_language_same_error"));
      return;
    }

    setIsLoading(true);

    try {
      setDailyGoal(goal);
      localStorage.setItem("nurlingo_daily_goal", String(goal));

      saveLangConfig({
        native,
        learning,
        pair: `${native}-${learning}` as LangPair,
      });

      try {
        const existing = localStorage.getItem("nur_lang_config");
        if (existing) {
          const parsed = JSON.parse(existing);
          parsed.completed = true;
          parsed.timestamp = new Date().toISOString();
          localStorage.setItem("nur_lang_config", JSON.stringify(parsed));
        } else {
          localStorage.setItem(
            "nur_lang_config",
            JSON.stringify({
              native,
              learning,
              pair: `${native}-${learning}`,
              completed: true,
              timestamp: new Date().toISOString(),
            })
          );
        }
      } catch (e) {
        console.warn("Failed to add completed flag:", e);
      }

      localStorage.setItem("nurlingo_onboarding_complete", "true");
      localStorage.setItem("nur_learning_mode", "amateur");

      await new Promise((r) => setTimeout(r, 400));
      router.push("/world");
    } catch (e) {
      console.error("Onboarding save error:", e);
      setIsLoading(false);
      window.location.href = "/world";
    }
  };

  const canStart = native !== null && learning !== null && native !== learning;

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-gray-900 dark:text-white overflow-hidden">

      {/* ─── FIXED HEADER: Theme Toggle ─── */}
      <div className="fixed top-4 right-4 z-[100] flex items-center gap-2">
        <ThemeToggle size="lg" />
      </div>

      {/* ─── BACKGROUND DECORATIONS ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-6 py-10 flex flex-col gap-5">

          {/* ═══ WELCOME HEADER ═══ */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center gap-3"
          >
            {/* ✅ Nuri-happy image (instead of Nuri component) */}
            <motion.img
              src="/images/nuri/nuri-happy.png"
              alt="Nuri"
              className="w-[120px] h-[120px] object-contain drop-shadow-2xl"
              animate={{ y: [-6, 6, -6] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            />

            <NuriSpeech text={t("page_nuri_welcome_onboarding")} mood="happy" />

            <h1 className="text-4xl font-black tracking-tighter">
              <span className="bg-gradient-to-r from-[#D90012] to-[#FFA500] bg-clip-text text-transparent">
                NUR Lingo
              </span>
            </h1>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <Sparkles size={12} className="text-yellow-500" />
              {t("page_platform_tagline")}
              <Sparkles size={12} className="text-yellow-500" />
            </p>
          </motion.div>

          {/* ═══ SECTION 1: NATIVE LANGUAGE ═══ */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
          >
            <h2 className="text-sm font-bold text-white mb-2.5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FFA500]/20 text-[#FFA500] flex items-center justify-center text-[10px] font-bold">1</span>
              {t("page_choose_native")}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {LANGS.map((l) => (
                <button
                  key={`native-${l.c}`}
                  onClick={() => handleNativeSelect(l.c)}
                  className={`py-2 px-1 rounded-lg border-2 transition-all flex flex-col items-center gap-0.5 ${
                    native === l.c
                      ? "border-[#FFA500] bg-[#FFA500]/15 text-white scale-105"
                      : "border-white/10 bg-white/5 text-white/50 hover:text-white/80 hover:border-white/30"
                  }`}
                >
                  <span className="text-xl">{l.flag}</span>
                  <span className="text-[10px] font-bold leading-tight">{t(l.nameKey)}</span>
                </button>
              ))}
            </div>
          </motion.section>

          {/* ═══ SECTION 2: LEARNING LANGUAGE ═══ */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
          >
            <h2 className="text-sm font-bold text-white mb-2.5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FFA500]/20 text-[#FFA500] flex items-center justify-center text-[10px] font-bold">2</span>
              {t("page_choose_learning")}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {LANGS.filter((l) => l.c !== native).map((l) => (
                <button
                  key={`learning-${l.c}`}
                  onClick={() => handleLearningSelect(l.c)}
                  className={`py-2 px-1 rounded-lg border-2 transition-all flex flex-col items-center gap-0.5 ${
                    learning === l.c
                      ? "border-[#FFA500] bg-[#FFA500]/15 text-white scale-105"
                      : "border-white/10 bg-white/5 text-white/50 hover:text-white/80 hover:border-white/30"
                  }`}
                >
                  <span className="text-xl">{l.flag}</span>
                  <span className="text-[10px] font-bold leading-tight">{t(l.nameKey)}</span>
                </button>
              ))}
            </div>
            {native && learning && native !== learning && (
              <p className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1">
                <Check size={10} /> {LANGS.find(x => x.c === native)?.flag} → {LANGS.find(x => x.c === learning)?.flag}
              </p>
            )}
          </motion.section>

          {/* ═══ SECTION 3: DAILY GOAL ═══ */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
          >
            <h2 className="text-sm font-bold text-white mb-2.5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FFA500]/20 text-[#FFA500] flex items-center justify-center text-[10px] font-bold">3</span>
              {t("page_daily_goal")}
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`py-2 px-1 rounded-lg border-2 transition-all flex flex-col items-center gap-0.5 ${
                    goal === g.value
                      ? "border-[#FFA500] bg-[#FFA500]/15 text-white scale-105"
                      : "border-white/10 bg-white/5 text-white/50 hover:text-white/80 hover:border-white/30"
                  }`}
                >
                  <span className="text-xl">{g.icon}</span>
                  <span className="text-[10px] font-bold leading-tight">{t(g.labelKey)}</span>
                  <span className="text-[8px] opacity-60 leading-tight">{t(g.descKey)}</span>
                </button>
              ))}
            </div>
          </motion.section>

          {/* ═══ ERROR MESSAGE ═══ */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 text-center"
              >
                <p className="text-xs text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ START BUTTON ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={handleStart}
              disabled={!canStart || isLoading}
              className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                canStart && !isLoading
                  ? "bg-gradient-to-r from-[#D90012] to-[#FFA500] text-white hover:scale-105 shadow-lg shadow-red-500/20"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {t("page_loading")}
                </>
              ) : (
                <>
                  <Rocket size={20} />
                  {t("page_start_learning")}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </motion.div>

          <p className="text-center text-[10px] text-white/20 pb-4">
            {t("page_ready_sub")}
          </p>
        </div>
      </div>
    </div>
  );
}