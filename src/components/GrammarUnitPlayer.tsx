// src/components/GrammarUnitPlayer.tsx
"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X, ChevronRight, RotateCcw, Loader2, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import type {
  BilingualText, GrammarExercise, GrammarUnit, PickItem, TextItem,
} from "@/lib/content/grammar-types";
import {
  renderPickItem, checkPickAnswer, resolveWrongFeedback, type RenderedPickItem,
} from "@/lib/content/pickShuffle";
import { getUnitExercises } from "@/lib/content/grammar-loader";

type NativeLang = "hy" | "ru";

function bt(text: BilingualText | string | undefined | null, lang: NativeLang): string {
  if (!text) return "";
  if (typeof text === "string") return text;
  return (text as BilingualText)[lang] || (text as BilingualText).hy || (text as BilingualText).ru || "";
}

interface Props {
  unit: GrammarUnit;
  nativeLang: NativeLang;
  onBack: () => void;
}

export function GrammarUnitPlayer({ unit, nativeLang, onBack }: Props) {
  const [stage, setStage] = useState<"intro" | "exercises" | "done">("intro");
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [attemptId, setAttemptId] = useState(() => `${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const exercises = getUnitExercises(unit);
  const current = exercises[exerciseIdx];

  const restart = () => {
    setExerciseIdx(0);
    setAttemptId(`${Date.now()}-${Math.random().toString(36).slice(2)}`);
    setStage("exercises");
  };

  const next = () => {
    if (exerciseIdx < exercises.length - 1) setExerciseIdx(exerciseIdx + 1);
    else setStage("done");
  };

  if (stage === "intro") {
    return (
      <IntroView unit={unit} nativeLang={nativeLang} onStart={() => setStage("exercises")} onBack={onBack} />
    );
  }
  if (stage === "done") {
    return <DoneView nativeLang={nativeLang} onRestart={restart} onBack={onBack} />;
  }
  if (!current) return <DoneView nativeLang={nativeLang} onRestart={restart} onBack={onBack} />;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">
          <ArrowLeft size={22} />
        </button>
        <div className="text-sm font-bold text-gray-500">
          {exerciseIdx + 1} / {exercises.length}
        </div>
        <button onClick={restart} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10" title="Նորից">
          <RotateCcw size={18} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${exerciseIdx}-${attemptId}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
        >
          <GlassCard variant="premium" className="p-6 bg-white/70 dark:bg-gray-800/70">
            <ExerciseDispatcher
              exercise={current}
              exerciseIdx={exerciseIdx}
              attemptId={attemptId}
              nativeLang={nativeLang}
              onAllDone={next}
            />
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── Intro ───────────────────────── */

function IntroView({ unit, nativeLang, onStart, onBack }: {
  unit: GrammarUnit; nativeLang: NativeLang; onStart: () => void; onBack: () => void;
}) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <button onClick={onBack} className="mb-4 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">
        <ArrowLeft size={22} />
      </button>
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">📖</div>
        <h2 className="text-3xl font-black mb-2">{bt(unit.title, nativeLang)}</h2>
        {unit.cefr && <p className="text-sm text-gray-500 font-medium">CEFR: {unit.cefr}</p>}
      </div>
      <GlassCard variant="premium" className="p-6 mb-4 bg-white/70 dark:bg-gray-800/70">
        <p className="text-base leading-relaxed">{bt(unit.explanation, nativeLang)}</p>
      </GlassCard>
      {unit.cards && unit.cards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {unit.cards.map((card) => (
            <GlassCard key={card.id} variant="premium" className="p-4 bg-white/60 dark:bg-gray-800/60">
              <p className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                {bt(card.title, nativeLang)}
              </p>
              <p className="text-sm leading-relaxed">{bt(card.body, nativeLang)}</p>
            </GlassCard>
          ))}
        </div>
      )}
      <div className="text-center">
        <button
          onClick={onStart}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-lg shadow-emerald-500/30 inline-flex items-center gap-2"
        >
          <Sparkles size={18} /> Սկսել վարժությունները
        </button>
      </div>
    </div>
  );
}

function DoneView({ nativeLang, onRestart, onBack }: {
  nativeLang: NativeLang; onRestart: () => void; onBack: () => void;
}) {
  const msg = nativeLang === "hy"
    ? "🎉 Ապրե՛ս։ Ավարտեցիր այս դասի վարժությունները։"
    : "🎉 Отлично! Ты завершил упражнения этого урока.";
  return (
    <div className="w-full max-w-xl mx-auto text-center">
      <div className="text-7xl mb-6">🏆</div>
      <h2 className="text-3xl font-black mb-3">{msg}</h2>
      <div className="flex gap-3 justify-center mt-8">
        <button onClick={onRestart} className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold inline-flex items-center gap-2">
          <RotateCcw size={18} /> {nativeLang === "hy" ? "Կրկնել" : "Повторить"}
        </button>
        <button onClick={onBack} className="px-6 py-3 rounded-2xl bg-gray-200 dark:bg-gray-700 font-bold inline-flex items-center gap-2">
          <ArrowLeft size={18} /> {nativeLang === "hy" ? "Վերադառնալ" : "Назад"}
        </button>
      </div>
    </div>
  );
}

/* ───────────────────── Exercise dispatcher ───────────────────── */

function ExerciseDispatcher({
  exercise, exerciseIdx, attemptId, nativeLang, onAllDone,
}: {
  exercise: GrammarExercise;
  exerciseIdx: number;
  attemptId: string;
  nativeLang: NativeLang;
  onAllDone: () => void;
}) {
  const exerciseId = exercise.id ?? `ex-${exerciseIdx}`;

  if (exercise.type === "pick") {
    return <PickExerciseView exercise={exercise} exerciseId={exerciseId} attemptId={attemptId} nativeLang={nativeLang} onAllDone={onAllDone} />;
  }
  if (exercise.type === "gap" || exercise.type === "write" || exercise.type === "fix") {
    return <TextExerciseView exercise={exercise} nativeLang={nativeLang} onAllDone={onAllDone} />;
  }
  return (
    <div>
      <p className="text-sm font-bold mb-2">{bt(exercise.instruction, nativeLang)}</p>
      <p className="text-xs text-gray-500">«{exercise.type}» տիպը այս էկրանում դեռ չի իրականացվել։</p>
      <button onClick={onAllDone} className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold">
        Շարունակել
      </button>
    </div>
  );
}

/* ───────────────────── Pick (with shuffle) ───────────────────── */

function PickExerciseView({
  exercise, exerciseId, attemptId, nativeLang, onAllDone,
}: {
  exercise: GrammarExercise; exerciseId: string; attemptId: string;
  nativeLang: NativeLang; onAllDone: () => void;
}) {
  const items = exercise.items as PickItem[];
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<{ ok: boolean; fb: string } | null>(null);

  const item = items[idx];
  const shuffle = exercise.shuffleOptions === true;

  // ՄԵԿ անգամ attempt-ի համար — ստուգելիս կամ re-render-ին չի նորից խառնվում
  const rendered: RenderedPickItem = useMemo(
    () => renderPickItem(exerciseId, item, idx, attemptId, shuffle),
    [exerciseId, item, idx, attemptId, shuffle]
  );

  const handlePick = (displayIdx: number) => {
    if (result) return;
    const check = checkPickAnswer(rendered, displayIdx);
    let fb = "";
    if (check.isCorrect) {
      fb = bt(item.feedback, nativeLang) || (nativeLang === "hy" ? "Ճիշտ է։" : "Верно.");
    } else {
      const wrongFb = resolveWrongFeedback(item as { no?: Record<string, unknown>; byOption?: Record<string, unknown> }, check.wrongFeedbackKey);
      const t = bt(wrongFb as BilingualText | string | undefined, nativeLang);
      fb = t || (nativeLang === "hy" ? "Սխալ է։" : "Неверно.");
    }
    setSelected(displayIdx);
    setResult({ ok: check.isCorrect, fb });
  };

  const nextItem = () => {
    if (idx < items.length - 1) {
      setIdx(idx + 1);
      setSelected(null);
      setResult(null);
    } else {
      onAllDone();
    }
  };

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
        {nativeLang === "hy" ? "Ընտրիր ճիշտ պատասխանը" : "Выберите правильный ответ"}
      </p>
      <p className="text-base font-medium mb-4">{bt(exercise.instruction, nativeLang)}</p>

      <div className="mb-6">
        <p className="text-lg font-bold mb-3">{item.s}</p>
        <div className="flex flex-col gap-2">
          {rendered.options.map((opt, displayIdx) => {
            const isSelected = selected === displayIdx;
            const isWrongPick = result && !result.ok && isSelected;
            const isRightPick = result && result.ok && isSelected;
            return (
              <button
                key={displayIdx}
                onClick={() => handlePick(displayIdx)}
                disabled={!!result}
                className={[
                  "px-4 py-3 rounded-xl text-left text-base font-medium transition-all border-2",
                  isRightPick
                    ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                    : isWrongPick
                    ? "bg-rose-50 dark:bg-rose-900/30 border-rose-500 text-rose-900 dark:text-rose-200"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400",
                ].join(" ")}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {result && (
        <div className={[
          "p-3 rounded-xl text-sm font-medium mb-4 flex items-start gap-2",
          result.ok
            ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200"
            : "bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200",
        ].join(" ")}>
          {result.ok ? <Check size={18} className="shrink-0 mt-0.5" /> : <X size={18} className="shrink-0 mt-0.5" />}
          <span>{result.fb}</span>
        </div>
      )}

      {result && (
        <button
          onClick={nextItem}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold inline-flex items-center gap-2"
        >
          {idx < items.length - 1
            ? (nativeLang === "hy" ? "Հաջորդը" : "Далее")
            : (nativeLang === "hy" ? "Ավարտել" : "Готово")}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

/* ───────────────────── Text exercises ───────────────────── */

function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase().replace(/[.!?]+$/g, "");
}

function TextExerciseView({
  exercise, nativeLang, onAllDone,
}: {
  exercise: GrammarExercise; nativeLang: NativeLang; onAllDone: () => void;
}) {
  const items = exercise.items as TextItem[];
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<{ ok: boolean; fb: string } | null>(null);

  const item = items[idx];

  const submit = () => {
    if (result || !value.trim()) return;
    const accepted = item.a.map(normalizeAnswer);
    const ok = accepted.includes(normalizeAnswer(value));
    const fb = ok
      ? (bt(item.feedback, nativeLang) || (nativeLang === "hy" ? "Ճիշտ է։" : "Верно."))
      : (bt(item.feedback, nativeLang) || (nativeLang === "hy"
          ? `Ճիշտ պատասխանը՝ ${item.a[0]}`
          : `Правильный ответ: ${item.a[0]}`));
    setResult({ ok, fb });
  };

  const nextItem = () => {
    if (idx < items.length - 1) {
      setIdx(idx + 1); setValue(""); setResult(null);
    } else {
      onAllDone();
    }
  };

  return (
    <div>
      <p className="text-base font-medium mb-4">{bt(exercise.instruction, nativeLang)}</p>
      <p className="text-lg font-bold mb-3">{item.s ?? item.p ?? ""}</p>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          disabled={!!result}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          placeholder={nativeLang === "hy" ? "Պատասխանդ..." : "Твой ответ..."}
          autoFocus
        />
        <button
          onClick={submit}
          disabled={!!result || !value.trim()}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50"
        >
          {nativeLang === "hy" ? "Ստուգել" : "Проверить"}
        </button>
      </div>

      {result && (
        <div className={[
          "p-3 rounded-xl text-sm font-medium mb-4 flex items-start gap-2",
          result.ok
            ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200"
            : "bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200",
        ].join(" ")}>
          {result.ok ? <Check size={18} className="shrink-0 mt-0.5" /> : <X size={18} className="shrink-0 mt-0.5" />}
          <span>{result.fb}</span>
        </div>
      )}

      {result && (
        <button
          onClick={nextItem}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold inline-flex items-center gap-2"
        >
          {idx < items.length - 1
            ? (nativeLang === "hy" ? "Հաջորդը" : "Далее")
            : (nativeLang === "hy" ? "Ավարտել" : "Готово")}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}