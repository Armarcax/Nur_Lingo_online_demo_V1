// src/app/drive-test/[testNum]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Trophy,
  Target,
  BookOpen,
  Home,
  RotateCcw,
  Coins,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ThemeToggle from "@/components/ThemeToggle";
import { useI18n } from "@/hooks/useI18n";
import { useNuri } from "@/hooks/useNuri";
import {
  QuestionCard,
  type DriveQuestion,
} from "@/components/drive-test/QuestionCard";

const STORAGE_KEY = "nur_drive_test_progress";

const LABELS = {
  hy: {
    back: "Վերադառնալ",
    test: "Թեստ",
    study: "Ուսուցում",
    loading: "Բեռնվում է...",
    loadingHint: "Nuri-ն ամեն ինչ պատրաստում է...",
    results: "Արդյունքներ",
    correct: "Ճիշտ",
    wrong: "Սխալ",
    percent: "Ճշգրտություն",
    retry: "Կրկին փորձել",
    home: "Գլխավոր",
    nuriPerfect: "🏆 Անթերի՛",
    nuriGreat: "🎉 Հիանալի՛",
    nuriGood: "💪 Լավ է!",
    nuriBad: "📖 Մի քիչ էլ պարապենք",
    hayqEarned: "HAYQ վաստակած",
    notFound: "Թեստ չի գտնվել",
  },
  en: {
    back: "Back",
    test: "Test",
    study: "Study",
    loading: "Loading...",
    loadingHint: "Nuri is preparing everything...",
    results: "Results",
    correct: "Correct",
    wrong: "Wrong",
    percent: "Accuracy",
    retry: "Try again",
    home: "Home",
    nuriPerfect: "🏆 Perfect!",
    nuriGreat: "🎉 Great!",
    nuriGood: "💪 Good job!",
    nuriBad: "📖 Let's practice more",
    hayqEarned: "HAYQ earned",
    notFound: "Test not found",
  },
  ru: {
    back: "Назад",
    test: "Тест",
    study: "Учёба",
    loading: "Загрузка...",
    loadingHint: "Нурик всё готовит...",
    results: "Результаты",
    correct: "Правильно",
    wrong: "Неправильно",
    percent: "Точность",
    retry: "Попробовать снова",
    home: "Главная",
    nuriPerfect: "🏆 Идеально!",
    nuriGreat: "🎉 Отлично!",
    nuriGood: "💪 Хорошо!",
    nuriBad: "📖 Ещё попрактикуемся",
    hayqEarned: "HAYQ заработано",
    notFound: "Тест не найден",
  },
};

export default function DriveTestRunner() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const { t, locale } = useI18n();
  const { setPage } = useNuri();

  const testNum = Number(params?.testNum);
  const mode = (search?.get("mode") as "test" | "study") || "test";

  const L = LABELS[locale as keyof typeof LABELS] || LABELS.hy;

  const [questions, setQuestions] = useState<DriveQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [hayqEarned, setHayqEarned] = useState(0);

  useEffect(() => {
    setPage("drive-test" as any);
  }, [setPage]);

  useEffect(() => {
    if (!testNum) return;
    setLoading(true);

    fetch(`/drive_test/data/test-${String(testNum).padStart(2, "0")}.json`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to load test:", e);
        setLoading(false);
      });
  }, [testNum]);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setHayqEarned((h) => h + 5);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) {
      setFinished(true);
      saveProgress();
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  const saveProgress = () => {
    if (mode !== "test") return;
    const total = questions.length;
    if (total === 0) return;

    const finalScore = Math.round((correctCount / total) * 100);

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const progress = raw ? JSON.parse(raw) : {};
      const prev = progress[testNum] || {};
      progress[testNum] = {
        ...prev,
        completed: finalScore >= 70,
        lastScore: finalScore,
        bestScore: Math.max(prev.bestScore || 0, finalScore),
        lastAttempt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {}
  };

  const handleRetry = () => {
    setCurrentIdx(0);
    setCorrectCount(0);
    setFinished(false);
    setHayqEarned(0);
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent">
        <Loader2 size={32} className="animate-spin text-red-500 mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">{L.loading}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {L.loadingHint}
        </p>
      </div>
    );
  }

  // Not found
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent">
        <p className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          {L.notFound}
        </p>
        <Link
          href="/drive-test"
          className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold"
        >
          ← {L.back}
        </Link>
      </div>
    );
  }

  // Results
  if (finished) {
    const total = questions.length;
    const percent = Math.round((correctCount / total) * 100);
    const passed = percent >= 70;

    return (
      <div className="min-h-screen flex flex-col bg-transparent pb-24">
        <div className="container-main py-6 flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="mb-6"
          >
            <div className="text-7xl mb-3 text-center">
              {percent >= 90 ? "🏆" : percent >= 70 ? "🎉" : "📖"}
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl font-black text-gray-900 dark:text-white mb-2 text-center"
          >
            {percent >= 90
              ? L.nuriPerfect
              : percent >= 70
              ? L.nuriGreat
              : percent >= 50
              ? L.nuriGood
              : L.nuriBad}
          </motion.h2>

          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {L.test} {testNum} · {mode === "study" ? L.study : L.test}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3 mb-6 w-full max-w-sm"
          >
            <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 text-center">
              <div className="text-2xl font-black text-emerald-500">
                {correctCount}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                {L.correct}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 text-center">
              <div className="text-2xl font-black text-red-500">
                {total - correctCount}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                {L.wrong}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 text-center">
              <div className="text-2xl font-black text-blue-500">{percent}%</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                {L.percent}
              </div>
            </div>
          </motion.div>

          {hayqEarned > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-500 font-bold text-sm"
            >
              <Coins size={16} />+{hayqEarned} HAYQ
            </motion.div>
          )}

          <div className="w-full max-w-xs h-3 rounded-full bg-white/20 dark:bg-white/10 overflow-hidden mb-8">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ delay: 0.4, duration: 1 }}
              className={`h-full rounded-full ${
                passed ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
          </div>

          <div className="flex gap-3 w-full max-w-sm">
            <button
              onClick={handleRetry}
              className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={16} />
              {L.retry}
            </button>
            <Link
              href="/drive-test"
              className="flex-1 py-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 text-gray-900 dark:text-white text-sm font-bold transition flex items-center justify-center gap-1.5"
            >
              <Home size={16} />
              {L.home}
            </Link>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  // Active question
  const current = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-transparent pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-b border-white/20 dark:border-white/10">
        <div className="container-main py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/drive-test")}
                className="p-2 rounded-xl hover:bg-white/20 dark:hover:bg-white/5 transition text-gray-900 dark:text-white"
                aria-label={L.back}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {mode === "study" ? (
                    <BookOpen size={16} className="text-purple-500" />
                  ) : (
                    <Target size={16} className="text-red-500" />
                  )}
                  {L.test} {testNum}
                </h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {mode === "study" ? L.study : L.test} · {questions.length}
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Progress bar */}
          <div className="mt-2 w-full h-1.5 rounded-full bg-white/20 dark:bg-white/10 overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className={`h-full rounded-full ${
                mode === "study"
                  ? "bg-purple-500"
                  : "bg-gradient-to-r from-red-500 to-orange-400"
              }`}
            />
          </div>
        </div>
      </header>

      {/* Question */}
      <div className="container-main py-6">
        <QuestionCard
          question={current}
          index={currentIdx}
          total={questions.length}
          mode={mode}
          native={(locale as "hy" | "en" | "ru") || "hy"}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      </div>

      <BottomNav />
    </div>
  );
}