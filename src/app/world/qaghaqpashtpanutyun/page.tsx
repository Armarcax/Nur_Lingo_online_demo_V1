"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import {
  CP, UI, LANG_META, loadContentLang, saveContentLang, loadScores,
  type Lang, type Scores,
} from "@/lib/content/modules/civil-protection";

export default function CivilProtectionPage() {
  const [lang, setLang] = useState<Lang>("hy");
  const [scores, setScores] = useState<Scores>({});

  useEffect(() => {
    setLang(loadContentLang());
    setScores(loadScores());
  }, []);

  const ui = UI[lang];
  const allLessons = useMemo(() => CP.topics.flatMap((t) => t.lessons), []);
  const doneCount = allLessons.filter((l) => scores[l.id]).length;
  const percent = Math.round((doneCount / allLessons.length) * 100);

  const changeLang = (l: Lang) => {
    setLang(l);
    saveContentLang(l);
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
      <div className="h-1.5 flag-stripe sticky top-0 z-20" />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Link href="/world" className="text-sm" style={{ color: "var(--color-muted)" }}>
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
                  background: lang === m.code ? "var(--color-card2)" : "transparent",
                  border: `1px solid ${lang === m.code ? "var(--hy-red)" : "var(--color-border)"}`,
                }}
              >
                {m.flag}
              </button>
            ))}
            <ThemeToggle />
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold">🛡️ {ui.pageTitle}</h1>
          <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
            {CP.stats.lessons} {ui.lessonWord} · {CP.stats.questions} {ui.questionWord}
          </p>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: "var(--color-muted)" }}>
            <span>{ui.progress}</span>
            <span>{doneCount}/{allLessons.length} · {percent}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
            <div className="h-full rounded-full" style={{ width: `${percent}%`, background: "linear-gradient(90deg,#D90012,#F2A800)" }} />
          </div>
        </div>

        <p className="text-xs p-3 rounded-xl" style={{ background: "rgba(217,0,18,0.08)", border: "1px solid rgba(217,0,18,0.2)", color: "var(--color-muted)" }}>
          ⚠️ {ui.disclaimer}
        </p>

        {CP.topics.map((topic) => (
          <section key={topic.id} className="space-y-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold pt-2">
              <span className="text-lg">{topic.icon}</span>
              <span>{topic.title[lang]}</span>
              <span className="text-xs font-normal" style={{ color: "var(--color-dim)" }}>
                {topic.questionCount}
              </span>
            </h2>
            {topic.lessons.map((lesson) => {
              const s = scores[lesson.id];
              return (
                <Link
                  key={lesson.id}
                  href={`/world/qaghaqpashtpanutyun/${lesson.id}`}
                  className="card p-3 flex items-center gap-3"
                  style={{ borderColor: s ? topic.color + "55" : undefined }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: s ? topic.color + "22" : "var(--color-card2)" }}
                  >
                    {s ? "⭐" : topic.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{lesson.title[lang]}</p>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                      {lesson.questionIds.length} {ui.questionWord}
                    </p>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: s ? "#22c55e" : "var(--color-dim)" }}>
                    {s ? `${s.best}/${s.total}` : "→"}
                  </span>
                </Link>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}
