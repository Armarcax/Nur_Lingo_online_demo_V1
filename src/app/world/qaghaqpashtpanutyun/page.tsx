// src/app/world/qaghaqpashtpanutyun/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { SnakePath, type SnakeNode } from "@/components/SnakePath";
import {
  CP,
  UI,
  LANG_META,
  loadContentLang,
  saveContentLang,
  loadScores,
  type Lang,
  type Scores,
} from "@/lib/content/modules/civil-protection";

/** Map a score record to a 0..3 crown level. */
function scoreToCrown(s?: { best: number; total: number }): number {
  if (!s || !s.total) return 0;
  const pct = s.best / s.total;
  if (pct >= 0.8) return 3;
  if (pct >= 0.5) return 2;
  if (pct > 0) return 1;
  return 0;
}

export default function CivilProtectionPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("hy");
  const [scores, setScores] = useState<Scores>({});

  useEffect(() => {
    setLang(loadContentLang());
    setScores(loadScores());
  }, []);

  const ui = UI[lang];
  const allLessons = useMemo(() => CP.topics.flatMap((t) => t.lessons), []);
  const doneCount = allLessons.filter((l) => scores[l.id]).length;
  const percent = allLessons.length
    ? Math.round((doneCount / allLessons.length) * 100)
    : 0;

  const changeLang = (l: Lang) => {
    setLang(l);
    saveContentLang(l);
  };

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <div className="h-1.5 flag-stripe sticky top-0 z-20" />

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* ─── HEADER ─── */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/world"
            className="text-sm"
            style={{ color: "var(--color-muted)" }}
          >
            ← {ui.back}
          </Link>
          <div className="flex items-center gap-2">
            {LANG_META.map((m) => (
              <button
                key={m.code}
                onClick={() => changeLang(m.code)}
                aria-pressed={lang === m.code}
                className="w-9 h-9 rounded-xl text-lg"
                style={{
                  background:
                    lang === m.code ? "var(--color-card2)" : "transparent",
                  border: `1px solid ${
                    lang === m.code ? "var(--hy-red)" : "var(--color-border)"
                  }`,
                }}
              >
                {m.flag}
              </button>
            ))}
            <ThemeToggle />
          </div>
        </div>

        {/* ─── TITLE ─── */}
        <div>
          <h1 className="text-xl font-bold">🛡️ {ui.pageTitle}</h1>
          <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
            {CP.stats.lessons} {ui.lessonWord} · {CP.stats.questions}{" "}
            {ui.questionWord}
          </p>
        </div>

        {/* ─── OVERALL PROGRESS ─── */}
        <div>
          <div
            className="flex justify-between text-xs mb-1"
            style={{ color: "var(--color-muted)" }}
          >
            <span>{ui.progress}</span>
            <span>
              {doneCount}/{allLessons.length} · {percent}%
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "var(--color-border)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${percent}%`,
                background: "linear-gradient(90deg,#D90012,#F2A800)",
              }}
            />
          </div>
        </div>

        {/* ─── DISCLAIMER ─── */}
        <p
          className="text-xs p-3 rounded-xl"
          style={{
            background: "rgba(217,0,18,0.08)",
            border: "1px solid rgba(217,0,18,0.2)",
            color: "var(--color-muted)",
          }}
        >
          ⚠️ {ui.disclaimer}
        </p>

        {/* ─── SNAKE PATH PER TOPIC ─── */}
        {CP.topics.map((topic) => {
          const nodes: SnakeNode[] = topic.lessons.map((lesson) => {
            const s = scores[lesson.id];
            const crown = scoreToCrown(s);
            return {
              id: lesson.id,
              title: lesson.title,
              icon: topic.icon,
              crownLevel: crown,
              subtitle: s
                ? `${s.best}/${s.total}`
                : `${lesson.questionIds.length} ${ui.questionWord}`,
              onClick: () =>
                router.push(`/world/qaghaqpashtpanutyun/${lesson.id}`),
            };
          });

          return (
            <motion.section
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl p-5 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                border: "1px solid var(--color-border)",
              }}
            >
              <header className="flex items-center gap-2 mb-6">
                <span className="text-2xl">{topic.icon}</span>
                <h2 className="text-base font-bold">{topic.title[lang]}</h2>
                <span
                  className="text-xs font-normal ml-auto"
                  style={{ color: "var(--color-dim)" }}
                >
                  {topic.questionCount}
                </span>
              </header>

              <SnakePath
                nodes={nodes}
                native={lang as "en" | "hy" | "ru"}
                colorFrom={topic.color}
                colorTo="#F2A800"
              />
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}