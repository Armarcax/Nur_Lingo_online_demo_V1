// src/app/world/qaghaqpashtpanutyun/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { SnakePath, type SnakeNode } from "@/components/SnakePath";
import { PageShell, StatPill } from "@/components/layout";
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
    <PageShell
      title={ui.pageTitle}
      subtitle={`${CP.stats.lessons} ${ui.lessonWord} · ${CP.stats.questions} ${ui.questionWord}`}
      icon={<Shield size={20} />}
      backHref="/world"
      maxWidth="4xl"
      actions={
        <>
          {/* Content-language switcher (hy/en/ru) */}
          <div className="flex items-center gap-1">
            {LANG_META.map((m) => (
              <button
                key={m.code}
                onClick={() => changeLang(m.code)}
                aria-pressed={lang === m.code}
                title={m.label ?? m.code}
                className={`w-8 h-8 rounded-lg text-base transition-all ${
                  lang === m.code
                    ? "bg-red-500/10 border border-red-500/40 ring-1 ring-red-500/20"
                    : "border border-white/20 dark:border-white/5 hover:bg-white/20 dark:hover:bg-white/5"
                }`}
              >
                {m.flag}
              </button>
            ))}
          </div>
          <StatPill
            value={`${doneCount}/${allLessons.length}`}
            color="emerald"
          />
          <ThemeToggle />
        </>
      }
    >
      {/* ─── FLAG STRIPE DIVIDER ─── */}
      <div className="h-1.5 flag-stripe rounded-full mb-5" />

      {/* ─── OVERALL PROGRESS ─── */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1 text-gray-500 dark:text-gray-400">
          <span>{ui.progress}</span>
          <span>
            {doneCount}/{allLessons.length} · {percent}%
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#D90012,#F2A800)" }}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* ─── DISCLAIMER ─── */}
      <p
        className="text-xs p-3 rounded-xl mb-6 text-gray-600 dark:text-gray-400"
        style={{
          background: "rgba(217,0,18,0.08)",
          border: "1px solid rgba(217,0,18,0.2)",
        }}
      >
        ⚠️ {ui.disclaimer}
      </p>

      {/* ─── SNAKE PATH PER TOPIC ─── */}
      <div className="space-y-8">
        {CP.topics.map((topic) => {
          const nodes: SnakeNode[] = topic.lessons.map((lesson) => {
            const s = scores[lesson.id];
            return {
              id: lesson.id,
              title: lesson.title,
              icon: topic.icon,
              crownLevel: scoreToCrown(s),
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
              className="rounded-3xl p-5 relative overflow-hidden bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
            >
              <header className="flex items-center gap-2 mb-6">
                <span className="text-2xl">{topic.icon}</span>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  {topic.title[lang]}
                </h2>
                <span className="text-xs font-normal ml-auto text-gray-500 dark:text-gray-400">
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
    </PageShell>
  );
}