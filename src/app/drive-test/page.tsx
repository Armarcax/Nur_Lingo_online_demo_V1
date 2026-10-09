// src/app/drive-test/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Car,
  Trophy,
  BookOpen,
  Target,
  Clock,
  CheckCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ThemeToggle from "@/components/ThemeToggle";
import Nuri, { NuriSpeech } from "@/components/Nuri";
import { useI18n } from "@/hooks/useI18n";
import { useNuri } from "@/hooks/useNuri";

interface TestIndex {
  testNumber: number;
  questionCount: number;
  imageCount: number;
  file: string;
  progress?: number;
  bestScore?: number;
}

const STORAGE_KEY = "nur_drive_test_progress";

const LABELS = {
  hy: {
    title: "Վարորդական թեստ",
    subtitle: "ՀՀ տեսական քննություն · 10 թեստ",
    total: "Ընդհանուր",
    questions: "հարց",
    test: "Թեստ",
    startTest: "Սկսել թեստ",
    startStudy: "Ուսուցում",
    completed: "Ավարտված",
    inProgress: "Ընթացքի մեջ",
    notStarted: "Չսկսված",
    best: "Լավագույն",
    nuriWelcome: "🚗 Պատրա՞ստ ես վարորդական քննությանը:",
    nuriHappy: "🎉 {count} թեստ ավարտված:",
    nuriIdle: "📖 Սովորի՛ր կամ փորձի՛ր թեստը:",
  },
  en: {
    title: "Driving Test",
    subtitle: "Armenian theory exam · 10 tests",
    total: "Total",
    questions: "questions",
    test: "Test",
    startTest: "Start Test",
    startStudy: "Study",
    completed: "Completed",
    inProgress: "In progress",
    notStarted: "Not started",
    best: "Best",
    nuriWelcome: "🚗 Ready for the driving exam?",
    nuriHappy: "🎉 {count} tests completed.",
    nuriIdle: "📖 Study or try a test.",
  },
  ru: {
    title: "Водительский тест",
    subtitle: "Теория РА · 10 тестов",
    total: "Всего",
    questions: "вопросов",
    test: "Тест",
    startTest: "Начать тест",
    startStudy: "Учёба",
    completed: "Завершено",
    inProgress: "В процессе",
    notStarted: "Не начато",
    best: "Лучший",
    nuriWelcome: "🚗 Готов к экзамену?",
    nuriHappy: "🎉 {count} тестов завершено.",
    nuriIdle: "📖 Учись или попробуй тест.",
  },
};

interface ProgressRecord {
  completed?: boolean;
  bestScore?: number;
  lastScore?: number;
  lastAttempt?: string;
}

export default function DriveTestPage() {
  const { t, locale } = useI18n();
  const { setPage } = useNuri();
  const [tests, setTests] = useState<TestIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<number, ProgressRecord>>({});

  const L = LABELS[locale as keyof typeof LABELS] || LABELS.hy;

  useEffect(() => {
    setPage("drive-test" as any);
  }, [setPage]);

  useEffect(() => {
    // Load index
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

    // Load progress
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProgress(JSON.parse(saved));
    } catch {}
  }, []);

  const completedCount = Object.values(progress).filter((p) => p.completed).length;

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="container-main py-6">
        {/* Nuri */}
        <div className="flex items-center gap-4 mb-6">
          <Nuri mood={completedCount > 0 ? "happy" : "idle"} size={72} />
          <div className="flex-1">
            <NuriSpeech
              text={
                completedCount > 0
                  ? L.nuriHappy.replace("{count}", String(completedCount))
                  : loading
                  ? L.nuriWelcome
                  : L.nuriIdle
              }
              mood={completedCount > 0 ? "happy" : "idle"}
            />
          </div>
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Car size={28} className="text-red-500" />
            {L.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {L.subtitle}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-red-500" />
          </div>
        )}

        {/* Test Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test, i) => {
              const p = progress[test.testNumber] || {};
              const percent = p.bestScore || 0;

              return (
                <motion.div
                  key={test.testNumber}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl p-5 bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <span className="text-xl font-black text-red-500">
                        {test.testNumber}
                      </span>
                    </div>
                    {p.completed ? (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-500">
                        ✅ {L.completed}
                      </span>
                    ) : p.lastScore ? (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500">
                        🔄 {L.inProgress}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-500/20 text-gray-500">
                        ⏳ {L.notStarted}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {L.test} {test.testNumber}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {test.questionCount} {L.questions}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-white/20 dark:bg-white/10 overflow-hidden mb-4">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percent >= 80
                          ? "bg-emerald-500"
                          : percent >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {p.bestScore ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                      <Trophy size={12} className="text-amber-500" />
                      {L.best}: {p.bestScore}%
                    </p>
                  ) : null}

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/drive-test/${test.testNumber}?mode=test`}
                      className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <Target size={14} />
                      {L.startTest}
                    </Link>
                    <Link
                      href={`/drive-test/${test.testNumber}?mode=study`}
                      className="flex-1 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-500 text-xs font-bold transition flex items-center justify-center gap-1 border border-purple-500/30"
                    >
                      <BookOpen size={14} />
                      {L.startStudy}
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}