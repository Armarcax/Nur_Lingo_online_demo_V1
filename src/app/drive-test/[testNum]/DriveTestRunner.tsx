"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Home,
  RotateCcw,
  Coins,
  Target,
  BookOpen,
  XCircle,
  CheckCircle,
  AlertTriangle,
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
    // ✅ NEW
    mistakesTitle: "📋 Սխալների վերանայում",
    mistakesSubtitle: "Այս հարցերում սխալվել ես — վերանայենք միասին",
    yourAnswer: "Քո պատասխանը",
    correctAnswer: "Ճիշտ պատասխանը",
    retryMistakes: "Կրկին փորձել միայն սխալները",
    viewResults: "Տես արդյունքները",
    noMistakes: "🎉 Դու ոչ մի սխալ չե՞ս արել:",
  },
  en: {
    back: "Back",
    test: "Test",
    study: "Study",
    loading: "Loading...",
    loadingHint: "Nuri is preparing everything...",
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
    mistakesTitle: "📋 Mistakes Review",
    mistakesSubtitle: "You got these questions wrong — let's review together",
    yourAnswer: "Your answer",
    correctAnswer: "Correct answer",
    retryMistakes: "Retry only mistakes",
    viewResults: "View results",
    noMistakes: "🎉 You made no mistakes!",
  },
  ru: {
    back: "Назад",
    test: "Тест",
    study: "Учёба",
    loading: "Загрузка...",
    loadingHint: "Нурик всё готовит...",
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
    mistakesTitle: "📋 Просмотр ошибок",
    mistakesSubtitle: "Эти вопросы были неверными — давай разберём",
    yourAnswer: "Твой ответ",
    correctAnswer: "Правильный ответ",
    retryMistakes: "Повторить только ошибки",
    viewResults: "Смотреть результаты",
    noMistakes: "🎉 Ты не сделал ни одной ошибки!",
  },
};

interface MistakeRecord {
  question: DriveQuestion;
  userAnswer: string;
  index: number;
}

export default function DriveTestRunner() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const { locale } = useI18n();
  const { setPage } = useNuri();

  const testNum = Number(params?.testNum);
  const mode = (search?.get("mode") as "test" | "study") || "test";

  const L = LABELS[locale as keyof typeof LABELS] || LABELS.hy;

  const [questions, setQuestions] = useState<DriveQuestion[]>([]);
  const [originalQuestions, setOriginalQuestions] = useState<DriveQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [hayqEarned, setHayqEarned] = useState(0);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [showingMistakes, setShowingMistakes] = useState(false);
  const [retryMode, setRetryMode] = useState(false);

  useEffect(() => {
    setPage("drive-test" as any);
  }, [setPage]);

  useEffect(() => {
    if (!testNum) return;
    setLoading(true);

    fetch(`/drive_test/data/test-${String(testNum).padStart(2, "0")}.json`)
      .then((r) => r.json())
      .then((data) => {
        const qs = data.questions || [];
        setQuestions(qs);
        setOriginalQuestions(qs);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to load test:", e);
        setLoading(false);
      });
  }, [testNum]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setHayqEarned((h) => h + 5);
    }
  };

  const handleMistake = (question: DriveQuestion, userAnswer: string) => {
    setMistakes((prev) => {
      if (prev.some((m) => m.question.id === question.id)) return prev;
      return [...prev, { question, userAnswer, index: currentIdx }];
    });
  };

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) {
      setFinished(true);
      saveProgress();
      if (mistakes.length > 0) {
        setShowingMistakes(true);
      }
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  const saveProgress = () => {
    if (mode !== "test" || retryMode) return;
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
    } catch (e) {
      console.warn("Failed to save drive test progress:", e);
    }
  };

  const handleRetryAll = () => {
    setQuestions(originalQuestions);
    setCurrentIdx(0);
    setCorrectCount(0);
    setFinished(false);
    setHayqEarned(0);
    setMistakes([]);
    setRetryMode(false);
    setShowingMistakes(false);
  };

  const handleRetryMistakes = () => {
    const mistakeQs = mistakes.map((m) => m.question);
    if (mistakeQs.length === 0) return;

    setQuestions(mistakeQs);
    setCurrentIdx(0);
    setCorrectCount(0);
    setHayqEarned(0);
    setFinished(false);
    setMistakes([]);
    setShowingMistakes(false);
    setRetryMode(true);
  };

  const handleViewResults = () => {
    setShowingMistakes(false);
  };

  // ─── Loading ───────────────────────────────────────────────
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

  // ─── Not found ─────────────────────────────────────────────
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

  // ─── Mistake Review Screen ─────────────────────────────────
  if (showingMistakes && mistakes.length > 0) {
    return (
      <div className="min-h-screen bg-transparent pb-24">
        <div className="container-main py-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="text-5xl mb-3">📋</div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              {L.mistakesTitle}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {L.mistakesSubtitle} ({mistakes.length})
            </p>
          </motion.div>

          <div className="space-y-4 mb-6">
            {mistakes.map((m, i) => {
              const prompt =
                m.question.prompt[locale as "hy" | "en" | "ru"] ||
                m.question.prompt.hy ||
                "";
              const options =
                m.question.options[locale as "hy" | "en" | "ru"] ||
                m.question.options.hy ||
                [];
              const correctAnswer = options[m.question.correctIndex] || "";

              return (
                <motion.div
                  key={m.question.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl border border-red-500/30 bg-red-500/5"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white flex-1 leading-relaxed">
                      {prompt}
                    </p>
                  </div>

                  {m.question.imageUrl && (
                    <div className="mb-3 rounded-lg overflow-hidden">
                      <img
                        src={m.question.imageUrl}
                        alt=""
                        className="w-full max-h-[200px] object-contain"
                      />
                    </div>
                  )}

                  <div className="space-y-2 pl-10">
                    <div className="flex items-start gap-2 text-sm">
                      <XCircle
                        size={16}
                        className="text-red-500 flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">
                          {L.yourAnswer}:
                        </span>
                        <span className="text-red-500 line-through">
                          {m.userAnswer}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle
                        size={16}
                        className="text-emerald-500 flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">
                          {L.correctAnswer}:
                        </span>
                        <span className="text-emerald-500 font-bold">
                          {correctAnswer}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRetryMistakes}
              className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={16} />
              {L.retryMistakes} ({mistakes.length})
            </button>
            <button
              onClick={handleViewResults}
              className="flex-1 py-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 text-gray-900 dark:text-white text-sm font-bold transition flex items-center justify-center gap-1.5"
            >
              <Home size={16} />
              {L.viewResults}
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  // ─── Results ───────────────────────────────────────────────
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
            {retryMode && " · Retry"}
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
              onClick={handleRetryAll}
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

  // ─── Active question ───────────────────────────────────────
  const current = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-transparent pb-24">
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
                  {retryMode && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500">
                      Retry
                    </span>
                  )}
                </h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {mode === "study" ? L.study : L.test} · {questions.length}
                  {mistakes.length > 0 && ` · ⚠️ ${mistakes.length} mistakes`}
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

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

      <div className="container-main py-6">
        <QuestionCard
          key={current.id}
          question={current}
          index={currentIdx}
          total={questions.length}
          mode={mode}
          native={(locale as "hy" | "en" | "ru") || "hy"}
          onAnswer={handleAnswer}
          onNext={handleNext}
          onMistake={handleMistake}
        />
      </div>

      <BottomNav />
    </div>
  );
}