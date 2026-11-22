// src/app/drive-test/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Car,
  Trophy,
  BookOpen,
  Target,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import Nuri, { NuriSpeech } from "@/components/Nuri";
import { SnakePath, type SnakeNode } from "@/components/SnakePath";
import { useI18n } from "@/hooks/useI18n";
import { useNuri } from "@/hooks/useNuri";
import type { LangCode } from "@/lib/i18n/index";

interface TestIndex {
  testNumber: number;
  questionCount: number;
  imageCount: number;
  file: string;
  progress?: number;
  bestScore?: number;
}

interface ProgressRecord {
  completed?: boolean;
  bestScore?: number;
  lastScore?: number;
  lastAttempt?: string;
}

const STORAGE_KEY = "nur_drive_test_progress";

const LABELS = {
  hy: {
    title: "Վարորդական թեստ",
    subtitle: "ՀՀ տեսական քննություն · 10 թեստ",
    tabTests: "Թեստեր",
    tabStudy: "Ուսուցում",
    total: "Ընդհանուր",
    questions: "հարց",
    test: "Թեստ",
    startTest: "Սկսել թեստ",
    startStudy: "Ուսուցում",
    completed: "Ավարտված",
    inProgress: "Ընթացքի մեջ",
    notStarted: "Չսկսված",
    best: "Լավագույն",
    nuriWelcome: "🚗 Պատրա՞ստ ես վարորդական քննությանը",
    nuriHappy: "🎉 {count} թեստ ավարտված է",
    nuriIdle: "📖 Ընտրիր թեստ կամ ուսուցում",
  },
  en: {
    title: "Driving Test",
    subtitle: "Armenian theory exam · 10 tests",
    tabTests: "Tests",
    tabStudy: "Study",
    total: "Total",
    questions: "questions",
    test: "Test",
    startTest: "Start Test",
    startStudy: "Study",
    completed: "Completed",
    inProgress: "In progress",
    notStarted: "Not started",
    best: "Best",
    nuriWelcome: "🚗 Ready for the driving exam",
    nuriHappy: "🎉 {count} tests completed",
    nuriIdle: "📖 Pick a test or study mode",
  },
  ru: {
    title: "Водительский тест",
    subtitle: "Теория РА · 10 тестов",
    tabTests: "Тесты",
    tabStudy: "Учёба",
    total: "Всего",
    questions: "вопросов",
    test: "Тест",
    startTest: "Начать тест",
    startStudy: "Учёба",
    completed: "Завершено",
    inProgress: "В процессе",
    notStarted: "Не начато",
    best: "Лучший",
    nuriWelcome: "🚗 Готов к экзамену",
    nuriHappy: "🎉 {count} тестов завершено",
    nuriIdle: "📖 Выбери тест или учёбу",
  },
};

export default function DriveTestPage() {
  const router = useRouter();
  const { locale } = useI18n();
  const { setPage } = useNuri();
  const [tests, setTests] = useState<TestIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<number, ProgressRecord>>({});
  const [tab, setTab] = useState<"tests" | "study">("tests");

  const L = LABELS[(locale as keyof typeof LABELS) || "hy"] || LABELS.hy;

  useEffect(() => {
    setPage("drive-test" as any);
  }, [setPage]);

  useEffect(() => {
    fetch("/drive_test/data/index.json")
      .then((r) => r.json())
      .then((data) => {
        setTests(data.tests || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to load drive index:", e);
        setLoading(false);
      });

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProgress(JSON.parse(saved));
    } catch (e) {
      console.warn("Failed to parse drive test progress:", e);
    }
  }, []);

  const completedCount = Object.values(progress).filter((p) => p.completed).length;

  const nuriText =
    completedCount > 0
      ? L.nuriHappy.replace("{count}", String(completedCount))
      : loading
      ? L.nuriWelcome
      : L.nuriIdle;

  /** score % → crown 1..3 */
  const scoreToCrown = (p?: ProgressRecord): number => {
    if (!p) return 0;
    const s = p.bestScore || 0;
    if (s >= 80) return 3;
    if (s >= 50) return 2;
    if (s > 0) return 1;
    return 0;
  };

  const snakeNodes: SnakeNode[] = tests.map((test) => {
    const p = progress[test.testNumber] || {};
    const crown = scoreToCrown(p);
    return {
      id: String(test.testNumber),
      title: { hy: `${L.test} ${test.testNumber}`, en: `${L.test} ${test.testNumber}`, ru: `${L.test} ${test.testNumber}` },
      icon: "🚗",
      crownLevel: crown,
      subtitle: p.bestScore ? `${p.bestScore}%` : `${test.questionCount} ${L.questions}`,
      onClick: () => router.push(`/drive-test/${test.testNumber}?mode=test`),
    };
  });

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="container-main py-6 max-w-4xl mx-auto">
        {/* ─── HEADER ─── */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push("/world")}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 flex items-center gap-3">
            <Nuri mood={completedCount > 0 ? "happy" : "idle"} size={48} />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Car size={22} className="text-red-500" />
                {L.title}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {L.subtitle}
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="mb-4">
          <NuriSpeech text={nuriText} mood={completedCount > 0 ? "happy" : "idle"} />
        </div>

        {/* ─── TABS ─── */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("tests")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              tab === "tests"
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                : "bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-white/20 dark:border-white/10"
            }`}
          >
            <Target size={16} />
            {L.tabTests}
          </button>
          <button
            onClick={() => setTab("study")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              tab === "study"
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                : "bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-white/20 dark:border-white/10"
            }`}
          >
            <BookOpen size={16} />
            {L.tabStudy}
          </button>
        </div>

        {/* ─── LOADING ─── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-red-500" />
          </div>
        )}

        {/* ─── TESTS TAB → SNAKE PATH ─── */}
        {!loading && tab === "tests" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-5 bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10"
          >
            <SnakePath
              nodes={snakeNodes}
              native={locale as LangCode}
              colorFrom="#ef4444"
              colorTo="#f59e0b"
            />
          </motion.div>
        )}

        {/* ─── STUDY TAB → SEPARATE LIST ─── */}
        {!loading && tab === "study" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {tests.map((test) => {
              const p = progress[test.testNumber] || {};
              return (
                <div
                  key={test.testNumber}
                  className="rounded-2xl p-4 bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 flex items-center gap-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                    <span className="text-lg font-black text-purple-500">
                      {test.testNumber}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {L.test} {test.testNumber}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {test.questionCount} {L.questions}
                      {p.bestScore ? ` · ${L.best}: ${p.bestScore}%` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/drive-test/${test.testNumber}?mode=study`}
                    className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-500 text-xs font-bold transition flex items-center gap-1 border border-purple-500/30"
                  >
                    <BookOpen size={14} />
                    {L.startStudy}
                  </Link>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}