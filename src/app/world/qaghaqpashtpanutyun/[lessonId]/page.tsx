"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Nuri from "@/components/Nuri";
import type { NuriMood } from "@/components/Nuri";
import {
  UI, LANG_META, getLesson, getQuestion, buildOptions,
  loadContentLang, saveContentLang, loadMode, saveMode, saveResult,
  type Lang, type Mode, type CPQuestion,
} from "@/lib/content/modules/civil-protection";

type Finished = { correct: number; total: number; award: number };

function Sources({ q, lang }: { q: CPQuestion; lang: Lang }) {
  const ui = UI[lang];
  return (
    <div className="text-xs space-y-1" style={{ color: "var(--color-muted)" }}>
      <p>{ui.status}: {q.status[lang]}</p>
      {q.note && <p>⚠️ {q.note[lang]}</p>}
      <p className="pt-1">{ui.sources}:</p>
      <ul className="space-y-0.5">
        {q.sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LessonPage() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = params?.lessonId ?? "";
  const found = useMemo(() => getLesson(lessonId), [lessonId]);

  const [lang, setLang] = useState<Lang>("hy");
  const [mode, setMode] = useState<Mode>("quiz");
  const [queue, setQueue] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<null | "ok" | "err">(null);
  const [first, setFirst] = useState<Record<number, boolean>>({});
  const [retried, setRetried] = useState<number[]>([]);
  const [finished, setFinished] = useState<Finished | null>(null);
  const [mood, setMood] = useState<NuriMood>("idle");

  const reset = useCallback(() => {
    setQueue(found ? found.lesson.questionIds : []);
    setPos(0);
    setSelected(null);
    setRevealed(false);
    setResult(null);
    setFirst({});
    setRetried([]);
    setFinished(null);
    setMood("idle");
  }, [found]);

  useEffect(() => {
    setLang(loadContentLang());
    setMode(loadMode());
    reset();
  }, [reset]);

  const ui = UI[lang];
  const qid = queue[pos];
  const q = qid !== undefined ? getQuestion(qid) : undefined;
  const options = useMemo(() => (mode === "quiz" && qid !== undefined ? buildOptions(qid) : []), [mode, qid]);

  if (!found) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
        <p>{ui.notFound}</p>
        <Link href="/world/qaghaqpashtpanutyun" className="btn-ghost">{ui.toTopics}</Link>
      </div>
    );
  }

  const total = found.lesson.questionIds.length;

  const changeLang = (l: Lang) => {
    setLang(l);
    saveContentLang(l);
  };

  const changeMode = (m: Mode) => {
    if (m === mode) return;
    setMode(m);
    saveMode(m);
    reset();
  };

  // Գնահատում՝ վերադարձնում է թարմացված հերթը և առաջին փորձի արդյունքները
  const applyJudgement = (ok: boolean) => {
    const nextFirst = qid in first ? first : { ...first, [qid]: ok };
    let nextQueue = queue;
    if (!ok && !retried.includes(qid)) {
      nextQueue = [...queue, qid];
      setRetried((r) => [...r, qid]);
    }
    setFirst(nextFirst);
    setQueue(nextQueue);
    return { nextFirst, nextQueue };
  };

  const finish = (fi: Record<number, boolean>) => {
    const correct = Object.values(fi).filter(Boolean).length;
    const award = saveResult(lessonId, correct, total);
    setFinished({ correct, total, award });
    setMood("excited");
  };

  const advance = (nextQueue: number[], nextFirst: Record<number, boolean>) => {
    if (pos + 1 >= nextQueue.length) {
      finish(nextFirst);
      return;
    }
    setPos(pos + 1);
    setSelected(null);
    setRevealed(false);
    setResult(null);
    setMood("idle");
  };

  const check = () => {
    if (selected === null) return;
    const ok = selected === qid;
    applyJudgement(ok);
    setResult(ok ? "ok" : "err");
    setMood(ok ? "happy" : "sad");
  };

  const rate = (ok: boolean) => {
    const { nextFirst, nextQueue } = applyJudgement(ok);
    advance(nextQueue, nextFirst);
  };

  // ─── Ավարտի էկրան ──────────────────────────────────────────────────────────
  if (finished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center" style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
        <Nuri mood="excited" size={110} animate />
        <h1 className="text-2xl font-bold">{ui.done}</h1>
        <p style={{ color: "var(--color-muted)" }}>
          {ui.score}: {finished.correct}/{finished.total}
        </p>
        {finished.award > 0 && <span className="hayq-chip">+{finished.award} 🪙 HAYQ</span>}
        <div className="flex gap-2">
          <button onClick={reset} className="btn-ghost">{ui.again}</button>
          <Link href="/world/qaghaqpashtpanutyun" className="btn-orange">{ui.toTopics}</Link>
        </div>
      </div>
    );
  }

  if (!q) return null;
  const progress = Math.round((pos / Math.max(queue.length, 1)) * 100);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
      <div className="h-1 flag-stripe" />

      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
        <Link href="/world/qaghaqpashtpanutyun" aria-label={ui.back} className="text-xl" style={{ color: "var(--color-muted)" }}>✕</Link>
        <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
          <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,var(--hy-red),var(--hy-orange))" }} animate={{ width: `${progress}%` }} />
        </div>
        <div className="flex gap-1">
          {LANG_META.map((m) => (
            <button key={m.code} onClick={() => changeLang(m.code)} aria-pressed={lang === m.code} className="w-8 h-8 rounded-lg text-base"
              style={{ border: `1px solid ${lang === m.code ? "var(--hy-red)" : "var(--color-border)"}` }}>
              {m.flag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            {found.topic.icon} {found.lesson.title[lang]} · {Math.min(pos + 1, queue.length)}/{queue.length}
          </p>
          <div className="flex gap-1">
            {(["quiz", "cards"] as Mode[]).map((m) => (
              <button key={m} onClick={() => changeMode(m)} aria-pressed={mode === m} className="px-2.5 py-1 rounded-lg text-xs"
                style={{ background: mode === m ? "var(--color-card2)" : "transparent", border: `1px solid ${mode === m ? "var(--hy-red)" : "var(--color-border)"}`, color: "var(--color-text)" }}>
                {m === "quiz" ? ui.modeQuiz : ui.modeCards}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Nuri mood={mood} size={64} animate />
          <h2 className="text-lg font-medium leading-snug pt-1">{q.question[lang]}</h2>
        </div>

        {mode === "quiz" && (
          <div className="space-y-2">
            {options.map((optId, i) => {
              const text = getQuestion(optId)?.answer[lang] ?? "";
              const isSel = selected === optId;
              const show = result !== null;
              const isRight = optId === qid;
              const bg = show ? (isRight ? "rgba(0,120,60,0.2)" : isSel ? "rgba(120,0,0,0.2)" : "var(--color-card)") : isSel ? "rgba(242,168,0,0.08)" : "var(--color-card)";
              const bd = show ? (isRight ? "rgba(0,200,100,0.5)" : isSel ? "rgba(217,0,18,0.5)" : "var(--color-border)") : isSel ? "var(--hy-orange)" : "var(--color-border)";
              return (
                <button key={optId} disabled={show} onClick={() => setSelected(optId)} aria-pressed={isSel}
                  className="w-full text-left p-3 rounded-2xl border-2 text-sm flex gap-2"
                  style={{ background: bg, borderColor: bd, color: "var(--color-text)" }}>
                  <span style={{ color: "var(--color-dim)" }}>{i + 1}.</span>
                  <span>{text}</span>
                </button>
              );
            })}
          </div>
        )}

        {mode === "cards" && revealed && (
          <div className="card p-4 space-y-3">
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>{ui.correctAnswer}</p>
            <p className="text-sm leading-relaxed">{q.answer[lang]}</p>
            <Sources q={q} lang={lang} />
          </div>
        )}

        {mode === "quiz" && result && (
          <div className={`p-4 rounded-2xl space-y-2 ${result === "ok" ? "feedback-correct" : "feedback-wrong"}`}>
            <p className="font-bold">{result === "ok" ? `✅ ${ui.correct}` : `❌ ${ui.wrong}`}</p>
            {result === "err" && (
              <p className="text-sm">
                <span className="opacity-70">{ui.correctAnswer}: </span>{q.answer[lang]}
              </p>
            )}
            <Sources q={q} lang={lang} />
            {result === "err" && <p className="text-xs opacity-70">{ui.repeatNote}</p>}
          </div>
        )}
      </div>

      <div className="p-3 border-t" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-2xl mx-auto flex justify-end gap-2">
          {mode === "quiz" && !result && (
            <button onClick={check} disabled={selected === null} className="btn-check">{ui.check}</button>
          )}
          {mode === "quiz" && result && (
            <button onClick={() => advance(queue, first)} className="btn-check">{ui.next}</button>
          )}
          {mode === "cards" && !revealed && (
            <button onClick={() => setRevealed(true)} className="btn-check">{ui.reveal}</button>
          )}
          {mode === "cards" && revealed && (
            <>
              <button onClick={() => rate(false)} className="btn-ghost">{ui.didnt}</button>
              <button onClick={() => rate(true)} className="btn-check">{ui.knew}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
