// src/app/drive-test/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, Trophy, BookOpen, Target } from "lucide-react";
import Nuri, { NuriSpeech } from "@/components/Nuri";
import ThemeToggle from "@/components/ThemeToggle";
import { SnakePath, type SnakeNode } from "@/components/SnakePath";
import {
  PageShell,
  PageTabs,
  LoadingState,
  StatPill,
} from "@/components/layout";
import { useI18n } from "@/hooks/useI18n";
import { useNuri } from "@/hooks/useNuri";
import type { LangCode } from "@/lib/i18n/index";

interface TestIndex {
  testNumber: number;
  questionCount: number;
  imageCount: number;
  file: string;
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
    questions: "հարց",
    test: "Թեստ",
    startStudy: "Ուսուցում",
    best: "Լավագույն",
    completedCount: "ավարտ",
    nuriWelcome: "🚗 Պատրա՞ստ ես վարորդական քննությանը",
    nuriHappy: "🎉 {count} թեստ ավարտված է",
    nuriIdle: "📖 Ընտրիր թեստ կամ ուսուցում",
  },
  en: {
    title: "Driving Test",
    subtitle: "Armenian theory exam · 10 tests",
    tabTests: "Tests",
    tabStudy: "Study",
    questions: "questions",
    test: "Test",
    startStudy: "Study",
    best: "Best",
    completedCount: "done",
    nuriWelcome: "🚗 Ready for the driving exam",
    nuriHappy: "🎉 {count} tests completed",
    nuriIdle: "📖 Pick a test or study mode",
  },
  ru: {
    title: "Водительский тест",
    subtitle: "Теория РА · 10 тестов",
    tabTests: "Тесты",
    tabStudy: "Учёба",
    questions: "вопросов",
    test: "Тест",
    startStudy: "Учёба",
    best: "Лучший",
    completedCount: "заверш.",
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
      .then((data) => setTests(data.tests || []))
      .catch((e) => console.error("Failed to load drive index:", e))
      .finally(() => setLoading(false));

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
    return {
      id: String(test.testNumber),
      title: {
        hy: `${L.test} ${test.testNumber}`,
        en: `${L.test} ${test.testNumber}`,
        ru: `${L.test} ${test.testNumber}`,
      },
      icon: "🚗",
      crownLevel: scoreToCrown(p),
      subtitle: p.bestScore
        ? `${p.bestScore}%`
        : `${test.questionCount} ${L.questions}`,
      onClick: () => router.push(`/drive-test/${test.testNumber}?mode=test`),
    };
  });

  return (
    <PageShell
      title={L.title}
      subtitle={L.subtitle}
      icon={<Car size={20} />}
      backHref="/world"
      maxWidth="4xl"
      actions={
        <>
          <StatPill
            icon={<Trophy size={13} />}
            value={completedCount}
            label={L.completedCount}
            color="amber"
          />
          <ThemeToggle />
        </>
      }
    >
      {/* ─── NURI HERO ─── */}
      <div className="flex items-center gap-3 mb-5">
        <Nuri mood={completedCount > 0 ? "happy" : "idle"} size={56} />
        <div className="flex-1 min-w-0">
          <NuriSpeech
            text={nuriText}
            mood={completedCount > 0 ? "happy" : "idle"}
          />
        </div>
      </div>

      {/* ─── TABS ─── */}
      <PageTabs
        tabs={[
          { id: "tests", label: L.tabTests, icon: <Target size={16} /> },
          { id: "study", label: L.tabStudy, icon: <BookOpen size={16} /> },
        ]}
        value={tab}
        onChange={(id) => setTab(id as "tests" | "study")}
        className="mb-6"
      />

      {/* ─── LOADING ─── */}
      {loading ? (
        <LoadingState message={locale === "ru" ? "Загрузка…" : locale === "en" ? "Loading…" : "Բեռնվում…"} />
      ) : tab === "tests" ? (
        /* ─── SNAKE PATH ─── */
        <div className="rounded-3xl p-5 bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10">
          <SnakePath
            nodes={snakeNodes}
            native={locale as LangCode}
            colorFrom="#ef4444"
            colorTo="#f59e0b"
          />
        </div>
      ) : (
        /* ─── STUDY LIST ─── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
        </div>
      )}
    </PageShell>
  );
}