"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Volume2,
  X,
} from "lucide-react";
import { PlaybackState } from "@/lib/audio";
import { GlassCard } from "@/components/ui/glass-card";
import { buildDisplayMap } from "@/lib/content/pickShuffle";
import { loadMastery, updateMastery } from "@/lib/adaptive/mastery";
import { useAudioEngine } from "@/lib/hooks/useAudioEngine";
import type {
  GrammarExercise,
  GrammarFeedback,
  GrammarItem,
  GrammarMatchItem,
  GrammarOrderItem,
  GrammarPickItem,
  GrammarTextItem,
  GrammarUnit,
  LocalizedText,
  NativeLang,
} from "@/lib/content/grammar-types";

type Stage = "learn" | "practice" | "review" | "done";
type AnswerValue = string | number[];
type ItemResult = { correct: boolean; explanation: string; answer: string };
type ExerciseResult = Record<string, ItemResult>;
type PlayEnglishAudio = (text: string, id: string) => void;

const labels = {
  hy: {
    back: "Վերադառնալ դասերին",
    learn: "Սովորիր",
    practice: "Վարժվիր",
    apply: "Կիրառիր",
    done: "Ավարտ",
    objectives: "Այս դասից հետո կկարողանաս",
    rules: "Հիմնական կանոններ",
    examples: "Օրինակներ",
    commonErrors: "Հաճախ հանդիպող սխալներ",
    review: "Հիշողության արագ ստուգում",
    showAnswer: "Ցույց տալ պատասխանը",
    continue: "Սովորեցի․ անցնել վարժություններին",
    introHint: "Նախ ծանոթացիր կանոններին և օրինակներին, հետո անցիր վարժություններին։",
    lessonProgress: "Դասի առաջընթացը",
    tasksDone: "կատարված առաջադրանք",
    allTasks: "առաջադրանքից",
    task: "Առաջադրանք",
    guided: "Ուղղորդված ճանաչում",
    recall: "Հիշողությամբ լրացում",
    independent: "Ինքնուրույն կիրառում",
    check: "Ստուգել պատասխանները",
    correct: "Ճիշտ է",
    incorrect: "Կրկին նայիր բացատրությանը",
    correctAnswer: "Ճիշտ պատասխանը",
    missing: "Լրացրու այս առաջադրանքի բոլոր կետերը՝ ստուգելուց առաջ։",
    checked: "Առաջադրանքը ստուգված է",
    retry: "Կրկին փորձել այս առաջադրանքը",
    removeWord: "Հեռացնել բառը",
    select: "Ընտրիր պատասխան",
    answer: "Պատասխան",
    listenEnglish: "Լսել անգլերեն",
    finish: "Ավարտել դասը",
    finishHint: "Ստուգիր բոլոր առաջադրանքները, որպեսզի ամփոփես դասը։",
    firstTry: "Առաջին փորձի ճիշտ պատասխաններ",
    finished: "Ավարտեցիր այս դասի ուսուցումն ու վարժությունները։",
    scoreNote: "Սա այս դասի արդյունքն է, ոչ թե երկարաժամկետ յուրացման գնահատականը։",
    again: "Կրկնել դասը",
    unknown: "Այս առաջադրանքի ձևաչափը դեռ հասանելի չէ։ Կարող ես շարունակել դասը։",
    unknownDone: "Նշել որպես դիտված",
    needReview: "Նյութը խմբագրական ստուգման փուլում է։",
    dueReview: "Այս դասի կրկնությունը հասունացել է։ Կարող ես անմիջապես ստուգել հիշողությունդ՝ առանց դասը նորից կարդալու։",
    startReview: "Անցնել կրկնությանը",
    recallStage: "Վերջնական հիշում",
    continueRecall: "Վարժություններից հետո՝ ստուգել հիշողությունը",
    reviewComplete: "Կրկնությունն ավարտված է։ Հաջորդ կրկնության օրը՝",
    due: "Կրկնել է պետք",
    reviewCard: "Հիշիր պատասխանը և գրիր անգլերենով։",
    reviewAccuracy: "Կրկնության արդյունք",
  },
  ru: {
    back: "Вернуться к урокам",
    learn: "Изучение",
    practice: "Практика",
    apply: "Применение",
    done: "Итог",
    objectives: "После урока вы сможете",
    rules: "Основные правила",
    examples: "Примеры",
    commonErrors: "Типичные ошибки",
    review: "Короткое повторение по памяти",
    showAnswer: "Показать ответ",
    continue: "Я изучил материал — перейти к упражнениям",
    introHint: "Сначала разберите правила и примеры, затем переходите к упражнениям.",
    lessonProgress: "Прогресс урока",
    tasksDone: "выполнено заданий",
    allTasks: "заданий",
    task: "Задание",
    guided: "Узнавание с подсказкой",
    recall: "Воспроизведение по памяти",
    independent: "Самостоятельное применение",
    check: "Проверить ответы",
    correct: "Верно",
    incorrect: "Посмотрите объяснение и попробуйте ещё раз",
    correctAnswer: "Правильный ответ",
    missing: "Заполните все пункты задания перед проверкой.",
    checked: "Задание проверено",
    retry: "Попробовать задание ещё раз",
    removeWord: "Убрать слово",
    select: "Выберите ответ",
    answer: "Ответ",
    listenEnglish: "Слушать по-английски",
    finish: "Завершить урок",
    finishHint: "Проверьте все задания, чтобы подвести итог урока.",
    firstTry: "Верно с первой попытки",
    finished: "Вы завершили изучение и практику по этому уроку.",
    scoreNote: "Это результат текущего урока, а не оценка долгосрочного усвоения.",
    again: "Повторить урок",
    unknown: "Этот формат задания пока недоступен. Можно продолжить урок.",
    unknownDone: "Отметить как просмотренное",
    needReview: "Материал ожидает редакторской проверки.",
    dueReview: "Пора повторить этот урок. Можно сразу проверить память, не перечитывая материал.",
    startReview: "Перейти к повторению",
    recallStage: "Вспомнить самостоятельно",
    continueRecall: "После практики — проверить память",
    reviewComplete: "Повторение завершено. Следующая дата повторения:",
    due: "Пора повторить",
    reviewCard: "Вспомните ответ и напишите его по-английски.",
    reviewAccuracy: "Результат повторения",
  },
} satisfies Record<NativeLang, Record<string, string>>;

function localized(value: LocalizedText | undefined, lang: NativeLang): string {
  if (!value) return "";
  return value[lang] || value.hy || value.ru || value.en || "";
}

function itemPrompt(item: GrammarItem, nativeLang: NativeLang, exercise?: GrammarExercise): string {
  if (!("prompt" in item)) return "";
  const value = item.prompt;
  const prompt = typeof value === "string" ? value : localized(value, nativeLang);
  return prompt.trim() || localized(exercise?.instruction, nativeLang);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cleanInlineArtifacts(value: string): string {
  return value
    .replace(/\*\*\s*(?:<b>\s*)?(?:&#x20;|&#32;|&nbsp;)?\s*(\(\s*[+−-]\s*\))\s*\\?<\/b>\s*\*\*/gi, "$1")
    .replace(/&#x20;|&#32;|&nbsp;/gi, " ");
}

function safeInlineMarkup(value: string): string {
  return escapeHtml(cleanInlineArtifacts(value))
    .replace(/&lt;(\/?)b&gt;/gi, "<$1strong>")
    .replace(/&lt;(\/?)strong&gt;/gi, "<$1strong>")
    .replace(/&lt;(\/?)i&gt;/gi, "<$1em>")
    .replace(/&lt;(\/?)em&gt;/gi, "<$1em>")
    .replace(/&lt;br\s*\/??&gt;/gi, "<br>");
}

function RichText({ value, className = "" }: { value: string; className?: string }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: safeInlineMarkup(value) }}
    />
  );
}

function RichInlineText({ value }: { value: string }) {
  return <span dangerouslySetInnerHTML={{ __html: safeInlineMarkup(value) }} />;
}

function plainOptionText(value: string): string {
  return cleanInlineArtifacts(value).replace(/<[^>]*>/g, "");
}

function cleanSpeechText(value: string): string {
  return cleanInlineArtifacts(value)
    .replace(/<br\s*\/??>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/gi, "and")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function isCompleteEnglishSentence(value: string): boolean {
  const text = cleanSpeechText(value);
  if (!text || /[\u0530-\u058F\u0400-\u04FF]/.test(text)) return false;
  if (/_|…|\.\.\.|→|·|\s\/\s|\b(?:subject|complement|V1|V2|V3)\b/i.test(text)) return false;
  if (!/[.!?][\"”’)]*$/.test(text)) return false;
  const wordCount = (text.match(/[A-Za-zÀ-ž]+/g) || []).length;
  if (wordCount < 3) return false;
  if (/(?:,\s*[A-Za-zÀ-ž]+){2,}[.!?]?$/.test(text) && !/\b(?:and|or|but|so)\b/i.test(text)) return false;
  return true;
}

function splitAudioText(value: string): string[] {
  return value
    .split(/(\s*(?:→|·|\/)\s*|(?<=[.!?])\s+(?=[A-ZÀ-Ž“"'(])|(?<=[.!?]),\s*(?=[A-ZÀ-Ž]))/g)
    .filter((part): part is string => typeof part === "string" && part.length > 0);
}

function AudioPlayButton({
  text,
  id,
  playAudio,
  nativeLang,
}: {
  text: string;
  id: string;
  playAudio: PlayEnglishAudio;
  nativeLang: NativeLang;
}) {
  const speechText = cleanSpeechText(text);
  if (!isCompleteEnglishSentence(speechText)) return null;
  const label = labels[nativeLang].listenEnglish;

  return (
    <button
      type="button"
      onClick={() => playAudio(speechText, id)}
      aria-label={`${label}: ${speechText}`}
      title={label}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sky-700 transition hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:text-sky-300 dark:hover:bg-sky-950/60"
    >
      <Volume2 size={16} aria-hidden="true" />
    </button>
  );
}

function SpokenText({
  value,
  id,
  playAudio,
  nativeLang,
  className = "",
}: {
  value: string;
  id: string;
  playAudio: PlayEnglishAudio;
  nativeLang: NativeLang;
  className?: string;
}) {
  const parts = splitAudioText(value);
  return (
    <div className={`flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 ${className}`}>
      {parts.map((part, index) => {
        const speakable = isCompleteEnglishSentence(part);
        return (
          <span key={`${id}-${index}`} className={speakable ? "inline-flex min-w-0 items-center gap-0.5" : "whitespace-pre-wrap"}>
            <RichInlineText value={part} />
            {speakable && <AudioPlayButton text={part} id={`${id}-${index}`} playAudio={playAudio} nativeLang={nativeLang} />}
          </span>
        );
      })}
    </div>
  );
}

function normalizeAnswer(value: string, exact = false): string {
  const trimmed = value.trim().normalize("NFKC");
  if (exact) return trimmed;
  return trimmed
    .toLocaleLowerCase("en")
    .replace(/[.!?;:,]+$/g, "")
    .replace(/\s+/g, " ");
}

function itemKind(exercise: GrammarExercise, item: GrammarItem): "pick" | "match" | "order" | "text" | "unsupported" {
  if (exercise.type === "pick" && "options" in item) return "pick";
  if (exercise.type === "match" && "answer" in item) return "match";
  if (exercise.type === "order" && "words" in item) return "order";
  if (["gap", "write", "fix"].includes(exercise.type) && "accepted" in item) return "text";
  return "unsupported";
}

function feedbackFor(
  item: GrammarItem,
  lang: NativeLang,
  selectedIndex?: number,
  answer?: string,
  fallback?: LocalizedText,
): string {
  const feedback = item.feedback as GrammarFeedback | undefined;
  if (selectedIndex !== undefined) {
    const optionFeedback = feedback?.options?.[selectedIndex];
    const text = optionFeedback ? localized(optionFeedback, lang) : "";
    if (text) return text;
  }
  if (answer && feedback?.targeted) {
    const normalized = normalizeAnswer(answer);
    const match = Object.entries(feedback.targeted).find(([key]) => normalizeAnswer(key) === normalized)?.[1];
    if (match) return typeof match === "string" ? match : localized(match, lang);
  }
  const correct = localized(feedback?.correct, lang);
  if (correct) return correct;
  return localized(fallback, lang);
}

function learningStage(exercise: GrammarExercise, lang: NativeLang): { label: string; color: string } {
  const copy = labels[lang];
  if (exercise.type === "pick" || exercise.type === "match") {
    return { label: copy.guided, color: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200" };
  }
  if (exercise.type === "gap") {
    return { label: copy.recall, color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200" };
  }
  return { label: copy.independent, color: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200" };
}

export function GrammarUnitPlayer({
  unit,
  nativeLang,
  onBack,
  mode,
  onStudyComplete,
}: {
  unit: GrammarUnit;
  nativeLang: NativeLang;
  onBack: () => void;
  mode: "study" | "practice";
  onStudyComplete: () => void;
}) {
  const audioEngine = useAudioEngine();
  const copy = labels[nativeLang];
  const playEnglishAudio = useCallback(async (text: string, id: string) => {
    if (audioEngine.currentId === id && (audioEngine.state === PlaybackState.PLAYING || audioEngine.state === PlaybackState.LOADING)) {
      audioEngine.stop();
      return;
    }
    audioEngine.stop();
    try {
      await audioEngine.play(cleanSpeechText(text), "en", { id, rate: 0.9 });
    } catch (error) {
      console.warn("Grammar example audio could not be played", error);
    }
  }, [audioEngine.currentId, audioEngine.play, audioEngine.state, audioEngine.stop]);
  const [stage, setStage] = useState<Stage>("learn");
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [firstScores, setFirstScores] = useState<Record<string, { correct: number; total: number }>>({});
  const [runId, setRunId] = useState(() => `${Date.now()}-${Math.random()}`);
  const [reviewDue, setReviewDue] = useState(false);
  const [reviewMode, setReviewMode] = useState<"lesson" | "due">("lesson");
  const [completionScore, setCompletionScore] = useState<{ correct: number; total: number } | null>(null);
  const [nextReviewDate, setNextReviewDate] = useState<number | null>(null);
  const title = localized(unit.title, nativeLang);
  const doneCount = Object.values(completed).filter(Boolean).length;
  const totalItems = unit.exercises.reduce((sum, exercise) => sum + exercise.items.length, 0);
  const firstTryScore = Object.values(firstScores).reduce((sum, entry) => sum + entry.correct, 0);
  const firstTryTotal = Object.values(firstScores).reduce((sum, entry) => sum + entry.total, 0);
  const canFinish = unit.exercises.length === 0 || doneCount === unit.exercises.length;

  useEffect(() => {
    try {
      const entry = loadMastery()[`grammar:${unit.id}`];
      setReviewDue(!!entry && entry.level < 5 && entry.nextReviewDate <= Date.now());
    } catch (error) {
      console.warn("Could not load grammar review schedule", error);
    }
  }, [unit.id]);

  const finishWithScore = (correct: number, total: number) => {
    const safeTotal = Math.max(total, 1);
    const score = correct / safeTotal;
    setCompletionScore({ correct, total: safeTotal });
    try {
      updateMastery(`grammar:${unit.id}`, score);
      setNextReviewDate(loadMastery()[`grammar:${unit.id}`]?.nextReviewDate ?? null);
    } catch (error) {
      console.warn("Could not save grammar review schedule", error);
    }
    setStage("done");
  };

  const handleChecked = (id: string, correct: number, total: number, firstCheck: boolean) => {
    setCompleted((previous) => ({ ...previous, [id]: true }));
    if (firstCheck) setFirstScores((previous) => ({ ...previous, [id]: { correct, total } }));
  };
  const handleReset = (id: string) => {
    setCompleted((previous) => ({ ...previous, [id]: false }));
  };
  const restart = () => {
    setCompleted({});
    setFirstScores({});
    setCompletionScore(null);
    setNextReviewDate(null);
    setReviewMode("lesson");
    setRunId(`${Date.now()}-${Math.random()}`);
    setStage("learn");
  };

  if (stage === "done") {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10">
            <ArrowLeft size={18} />{copy.back}
          </button>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">{copy.done}</span>
        </div>
        <GlassCard variant="premium" className="overflow-hidden p-7 text-center sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
            <CheckCircle2 size={34} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">{copy.finished}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{title}</p>
          <div className="mx-auto mt-7 max-w-sm rounded-2xl bg-gray-50 p-5 dark:bg-gray-900/70">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{reviewMode === "due" ? copy.reviewAccuracy : copy.firstTry}</p>
            <p className="mt-1 text-3xl font-black text-rose-600 dark:text-rose-300">{completionScore?.correct ?? firstTryScore} / {completionScore?.total ?? (firstTryTotal || totalItems)}</p>
            <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{copy.scoreNote}</p>
            {nextReviewDate !== null && (
              <p className="mt-3 border-t border-gray-200 pt-3 text-xs font-semibold text-violet-700 dark:border-gray-700 dark:text-violet-300">
                {copy.reviewComplete} {new Intl.DateTimeFormat(nativeLang === "hy" ? "hy-AM" : "ru-RU", { dateStyle: "medium" }).format(new Date(nextReviewDate))}
              </p>
            )}
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={restart} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 font-bold text-white transition hover:bg-rose-700">
              <RotateCcw size={17} />{copy.again}
            </button>
            <button type="button" onClick={onBack} className="rounded-xl border border-gray-200 px-5 py-3 font-bold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
              {copy.back}
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl pb-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10">
          <ArrowLeft size={18} />{copy.back}
        </button>
        <div className="hidden items-center gap-2 sm:flex">
          <StagePill active={stage === "learn"} label={copy.learn} number="1" />
          <ChevronRight size={15} className="text-gray-400" />
          <StagePill active={stage === "practice"} label={copy.practice} number="2" />
          {unit.reviewCards.length > 0 && <><ChevronRight size={15} className="text-gray-400" /><StagePill active={stage === "review"} label={copy.recallStage} number="3" /></>}
        </div>
      </div>

      {stage === "learn" ? (
        <LearningView
          unit={unit}
          title={title}
          nativeLang={nativeLang}
          playAudio={playEnglishAudio}
          reviewDue={reviewDue && unit.reviewCards.length > 0}
          onStartReview={() => { setReviewMode("due"); setStage("review"); }}
          onContinue={() => {
            if (mode === "study") {
              onStudyComplete();
            } else {
              setStage("practice");
            }
          }}
        />
      ) : stage === "review" ? (
        <RecallReview
          unit={unit}
          nativeLang={nativeLang}
          playAudio={playEnglishAudio}
          onComplete={(correct, total) => {
            if (reviewMode === "due") {
              finishWithScore(correct, total);
              return;
            }
            finishWithScore(firstTryScore + correct, firstTryTotal + total);
          }}
        />
      ) : (
        <section aria-labelledby="grammar-practice-title">
          <div className="mb-6 rounded-3xl border border-rose-100 bg-gradient-to-r from-rose-50 via-white to-amber-50 p-5 dark:border-white/10 dark:from-rose-950/40 dark:via-gray-900 dark:to-amber-950/20 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-rose-600 dark:text-rose-300">{nativeLang === "hy" ? `Միավոր ${unit.unitNumber}` : `Раздел ${unit.unitNumber}`}</p>
                <h1 id="grammar-practice-title" className="mt-2 text-2xl font-black text-gray-900 dark:text-white">{title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {nativeLang === "hy" ? "Սկսիր ճանաչումից, հետո հիշիր և կիրառիր կանոնը ինքնուրույն։" : "Начните с узнавания, затем вспомните и примените правило самостоятельно."}
                </p>
              </div>
              <div className="min-w-[9rem] rounded-2xl bg-white/80 px-4 py-3 text-center shadow-sm dark:bg-gray-800/80">
                <p className="text-2xl font-black text-rose-600 dark:text-rose-300">{doneCount}<span className="text-base text-gray-400"> / {unit.exercises.length}</span></p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{copy.tasksDone}</p>
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-rose-100 dark:bg-gray-700" role="progressbar" aria-valuemin={0} aria-valuemax={unit.exercises.length} aria-valuenow={doneCount} aria-label={copy.lessonProgress}>
              <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400 transition-all duration-500" style={{ width: `${unit.exercises.length ? (doneCount / unit.exercises.length) * 100 : 100}%` }} />
            </div>
          </div>

          <div className="space-y-5">
            {unit.exercises.map((exercise, index) => (
              <ExerciseCard
                key={`${runId}-${exercise.id}`}
                exercise={exercise}
                runId={runId}
                index={index}
                total={unit.exercises.length}
                nativeLang={nativeLang}
                unitId={unit.id}
                playAudio={playEnglishAudio}
                onChecked={handleChecked}
                onReset={handleReset}
              />
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-gray-200 bg-white/80 p-5 dark:border-gray-700 dark:bg-gray-900/70 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-extrabold text-gray-900 dark:text-white">{unit.reviewCards.length > 0 ? copy.continueRecall : copy.finish}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{canFinish ? `${copy.firstTry}: ${firstTryScore} / ${firstTryTotal || totalItems}` : copy.finishHint}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (unit.reviewCards.length) {
                    setReviewMode("lesson");
                    setStage("review");
                  } else {
                    finishWithScore(firstTryScore, firstTryTotal || totalItems);
                  }
                }}
                disabled={!canFinish}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 font-bold text-white shadow-md shadow-rose-600/15 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {unit.reviewCards.length > 0 ? copy.continueRecall : copy.finish}<ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function StagePill({ active, label, number }: { active: boolean; label: string; number: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${active ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200" : "text-gray-500 dark:text-gray-400"}`}>
      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${active ? "bg-rose-600 text-white" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}>{number}</span>
      {label}
    </span>
  );
}

function LearningView({
  unit,
  title,
  nativeLang,
  playAudio,
  reviewDue,
  onStartReview,
  onContinue,
}: {
  unit: GrammarUnit;
  title: string;
  nativeLang: NativeLang;
  playAudio: PlayEnglishAudio;
  reviewDue: boolean;
  onStartReview: () => void;
  onContinue: () => void;
}) {
  const copy = labels[nativeLang];

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
          <BookOpen size={27} />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-300">{copy.learn} · {nativeLang === "hy" ? `Միավոր ${unit.unitNumber}` : `Раздел ${unit.unitNumber}`}</p>
        <h1 className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{title}</h1>
        {unit.cefr && <p className="mt-1 text-sm text-gray-500">CEFR {unit.cefr}</p>}
      </div>

      {unit.needsReview && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
          {copy.needReview}
        </p>
      )}

      {reviewDue && (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/30 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-violet-950 dark:text-violet-100">{copy.dueReview}</p>
          <button type="button" onClick={onStartReview} className="shrink-0 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-800">
            {copy.startReview}
          </button>
        </div>
      )}

      <GlassCard variant="premium" className="mb-5 p-5 sm:p-7">
        <p className="mb-2 text-sm font-bold text-rose-700 dark:text-rose-300">{copy.introHint}</p>
        <RichText value={localized(unit.explanation, nativeLang)} className="text-base leading-8 text-gray-800 dark:text-gray-100" />
      </GlassCard>

      {unit.learningObjectives.length > 0 && (
        <section className="mb-6 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <h2 className="mb-3 font-extrabold text-gray-900 dark:text-white">{copy.objectives}</h2>
          <ul className="space-y-2">
            {unit.learningObjectives.map((objective, index) => (
              <li key={index} className="flex gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                <Check size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{localized(objective, nativeLang)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {unit.cards.length > 0 && (
        <section className="mb-7">
          <h2 className="mb-3 text-lg font-black text-gray-900 dark:text-white">
            {nativeLang === "hy" ? "Դասի քարտերը" : "Карточки урока"}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {unit.cards.map((card, index) => (
              <motion.article key={card.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.035, 0.25) }} className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-xs font-black text-rose-700 dark:bg-rose-950 dark:text-rose-300">{index + 1}</span>
                  <h3 className="font-bold text-gray-900 dark:text-white">{localized(card.title, nativeLang)}</h3>
                </div>
                <RichText value={localized(card.body, nativeLang)} className="text-sm leading-7 text-gray-700 dark:text-gray-200" />
                {card.formula && <p className="mt-3 rounded-xl bg-gray-50 px-3 py-2 text-center font-mono text-sm font-bold text-rose-700 dark:bg-gray-800 dark:text-rose-200">{card.formula}</p>}
                {(card.targetText || card.example) && (
                  <SpokenText
                    value={card.targetText || card.example || ""}
                    id={`grammar-${unit.id}-${card.id}-card`}
                    playAudio={playAudio}
                    nativeLang={nativeLang}
                    className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-gray-800 dark:bg-amber-950/30 dark:text-amber-100"
                  />
                )}
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {unit.rules.length > 0 && (
        <details className="mb-4 group rounded-2xl border border-gray-200 bg-white/70 p-4 dark:border-gray-700 dark:bg-gray-900/50">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-gray-800 dark:text-gray-100">
            {copy.rules}<ChevronDown size={18} className="transition group-open:rotate-180" />
          </summary>
          <div className="mt-4 space-y-3">
            {unit.rules.map((rule) => (
              <div key={rule.id} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/80">
                {rule.formula && <p className="font-mono text-sm font-bold text-rose-700 dark:text-rose-300">{rule.formula}</p>}
                <RichText value={localized(rule.statement, nativeLang)} className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-200" />
                {rule.targetText && (
                  <SpokenText
                    value={rule.targetText}
                    id={`grammar-${unit.id}-${rule.id}-rule`}
                    playAudio={playAudio}
                    nativeLang={nativeLang}
                    className="mt-2 text-sm font-semibold text-gray-900 dark:text-white"
                  />
                )}
              </div>
            ))}
          </div>
        </details>
      )}

      {unit.examples.length > 0 && (
        <details className="mb-4 group rounded-2xl border border-gray-200 bg-white/70 p-4 dark:border-gray-700 dark:bg-gray-900/50">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-gray-800 dark:text-gray-100">
            {copy.examples}<ChevronDown size={18} className="transition group-open:rotate-180" />
          </summary>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {unit.examples.map((example) => (
              <div key={example.id} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/80">
                <SpokenText
                  value={example.targetText}
                  id={`grammar-${unit.id}-${example.id}-example`}
                  playAudio={playAudio}
                  nativeLang={nativeLang}
                  className="font-semibold text-gray-900 dark:text-white"
                />
                {localized(example.translation, nativeLang) && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{localized(example.translation, nativeLang)}</p>}
              </div>
            ))}
          </div>
        </details>
      )}

      {unit.commonErrors.length > 0 && (
        <details className="mb-4 group rounded-2xl border border-gray-200 bg-white/70 p-4 dark:border-gray-700 dark:bg-gray-900/50">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-gray-800 dark:text-gray-100">
            {copy.commonErrors}<ChevronDown size={18} className="transition group-open:rotate-180" />
          </summary>
          <div className="mt-4 space-y-3">
            {unit.commonErrors.map((error) => (
              <div key={error.id} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/80">
                <p className="text-sm text-rose-700 line-through dark:text-rose-300">{error.wrong}</p>
                <SpokenText
                  value={error.correct}
                  id={`grammar-${unit.id}-${error.id}-correct-error-example`}
                  playAudio={playAudio}
                  nativeLang={nativeLang}
                  className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300"
                />
                <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{localized(error.explanation, nativeLang)}</p>
              </div>
            ))}
          </div>
        </details>
      )}

      <div className="sticky bottom-3 z-10 rounded-2xl border border-white/60 bg-white/90 p-3 shadow-xl backdrop-blur dark:border-white/10 dark:bg-gray-900/90 sm:p-4">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 sm:text-left">{copy.introHint}</p>
          <button type="button" onClick={onContinue} className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700 sm:w-auto">
            {copy.continue}<ChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

function RecallReview({
  unit,
  nativeLang,
  playAudio,
  onComplete,
}: {
  unit: GrammarUnit;
  nativeLang: NativeLang;
  playAudio: PlayEnglishAudio;
  onComplete: (correct: number, total: number) => void;
}) {
  const copy = labels[nativeLang];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [firstScores, setFirstScores] = useState<Record<string, boolean>>({});
  const allChecked = unit.reviewCards.length > 0 && unit.reviewCards.every((card) => card.id in results);
  const firstCorrect = Object.values(firstScores).filter(Boolean).length;
  const firstTotal = Object.keys(firstScores).length;

  const checkCard = (id: string, expected: string) => {
    if (id in results) return;
    const answer = answers[id] ?? "";
    if (!answer.trim()) return;
    const correct = normalizeAnswer(answer) === normalizeAnswer(expected);
    setResults((previous) => ({ ...previous, [id]: correct }));
    setFirstScores((previous) => id in previous ? previous : { ...previous, [id]: correct });
  };

  const retryCard = (id: string) => {
    setResults((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
    setAnswers((previous) => ({ ...previous, [id]: "" }));
  };

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-6 rounded-3xl border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-rose-50 p-5 dark:border-white/10 dark:from-violet-950/40 dark:via-gray-900 dark:to-rose-950/20 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-violet-700 dark:text-violet-300">{copy.recallStage}</p>
        <h1 className="mt-2 text-2xl font-black text-gray-900 dark:text-white">{localized(unit.title, nativeLang)}</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{copy.reviewCard}</p>
        <p className="mt-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
          {nativeLang === "hy" ? `${Object.keys(results).length} / ${unit.reviewCards.length} հարց ստուգված է` : `Проверено: ${Object.keys(results).length} / ${unit.reviewCards.length}`}
        </p>
      </div>

      <div className="space-y-3">
        {unit.reviewCards.map((card, index) => {
          const checked = card.id in results;
          const correct = results[card.id] === true;
          return (
            <article key={card.id} className="rounded-2xl border border-gray-200 bg-white/85 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/70 sm:p-5">
              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-xs font-black text-violet-800 dark:bg-violet-950 dark:text-violet-200">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-relaxed text-gray-900 dark:text-white">{localized(card.prompt, nativeLang)}</p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={answers[card.id] ?? ""}
                      onChange={(event) => setAnswers((previous) => ({ ...previous, [card.id]: event.target.value }))}
                      onKeyDown={(event) => event.key === "Enter" && checkCard(card.id, card.answer)}
                      disabled={checked}
                      aria-label={`${copy.answer} ${index + 1}`}
                      className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:opacity-80 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-violet-950"
                      placeholder={copy.answer}
                    />
                    <button type="button" onClick={() => checkCard(card.id, card.answer)} disabled={checked || !(answers[card.id] ?? "").trim()} className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-40">
                      {nativeLang === "hy" ? "Ստուգել" : "Проверить"}
                    </button>
                  </div>
                  {checked && (
                    <div className={`mt-3 rounded-xl px-3 py-2.5 text-xs leading-relaxed ${correct ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100" : "bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100"}`}>
                      <p className="flex items-center gap-1.5 font-bold">{correct ? <Check size={14} /> : <X size={14} />}{correct ? copy.correct : copy.incorrect}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1 font-semibold">
                        <span>{copy.correctAnswer}:</span>
                        <SpokenText
                          value={card.answer}
                          id={`grammar-${unit.id}-${card.id}-review-answer`}
                          playAudio={playAudio}
                          nativeLang={nativeLang}
                        />
                      </div>
                      {!correct && <button type="button" onClick={() => retryCard(card.id)} className="mt-2 font-bold underline underline-offset-2">{copy.retry}</button>}
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-4 dark:border-violet-900 dark:bg-violet-950/20 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{allChecked ? `${copy.reviewAccuracy}: ${firstCorrect} / ${firstTotal}` : copy.finishHint}</p>
        <button type="button" onClick={() => onComplete(firstCorrect, firstTotal)} disabled={!allChecked} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-40">
          {copy.finish}<ChevronRight size={17} />
        </button>
      </div>
    </section>
  );
}

function ExerciseCard({
  exercise,
  unitId,
  runId,
  index,
  total,
  nativeLang,
  playAudio,
  onChecked,
  onReset,
}: {
  exercise: GrammarExercise;
  unitId: string;
  runId: string;
  index: number;
  total: number;
  nativeLang: NativeLang;
  playAudio: PlayEnglishAudio;
  onChecked: (id: string, correct: number, total: number, firstCheck: boolean) => void;
  onReset: (id: string) => void;
}) {
  const copy = labels[nativeLang];
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [hasInitialCheck, setHasInitialCheck] = useState(false);
  const stage = learningStage(exercise, nativeLang);
  const hasNoQuestions = exercise.items.length === 0;
  const allAnswered = exercise.items.every((item) => {
    const value = answers[item.id];
    if (Array.isArray(value)) return value.length === ("words" in item ? item.words.length : 0);
    return typeof value === "string" && value.trim().length > 0;
  });

  const checkAnswers = () => {
    if (result || (!hasNoQuestions && !allAnswered)) return;
    if (hasNoQuestions) {
      setResult({});
      onChecked(exercise.id, 0, 0, !hasInitialCheck);
      setHasInitialCheck(true);
      return;
    }
    const nextResult: ExerciseResult = {};
    for (const item of exercise.items) {
      const kind = itemKind(exercise, item);
      const submitted = answers[item.id];
      let correct = false;
      let correctAnswer = "";
      let explanation = "";
      let selectedIndex: number | undefined;
      let submittedText = "";

      if (kind === "pick" && "options" in item) {
        selectedIndex = Number(submitted);
        correct = selectedIndex === item.correctIndex;
        correctAnswer = item.options[item.correctIndex] ?? "";
        explanation = feedbackFor(item, nativeLang, correct ? undefined : selectedIndex);
      } else if (kind === "match" && "answer" in item) {
        submittedText = String(submitted);
        correct = normalizeAnswer(submittedText) === normalizeAnswer(item.answer);
        correctAnswer = item.answer;
        explanation = correct
          ? feedbackFor(item, nativeLang)
          : localized(exercise.unusedOptionFeedback, nativeLang) || feedbackFor(item, nativeLang);
      } else if (kind === "order" && "words" in item) {
        submittedText = (submitted as number[]).map((wordIndex) => item.words[wordIndex]).join(" ");
        correct = item.accepted.some((accepted) => normalizeAnswer(accepted, exercise.exact) === normalizeAnswer(submittedText, exercise.exact));
        correctAnswer = item.accepted[0] ?? "";
        explanation = feedbackFor(item, nativeLang, undefined, submittedText);
      } else if (kind === "text" && "accepted" in item && "prompt" in item) {
        submittedText = String(submitted);
        const exact = exercise.exact || item.exact === true;
        correct = item.accepted.some((accepted) => normalizeAnswer(accepted, exact) === normalizeAnswer(submittedText, exact));
        correctAnswer = item.accepted[0] ?? "";
        explanation = feedbackFor(item, nativeLang, undefined, submittedText);
      } else {
        correct = false;
        correctAnswer = "";
        explanation = copy.unknown;
      }

      nextResult[item.id] = { correct, answer: correctAnswer, explanation };
    }
    const correctCount = Object.values(nextResult).filter((entry) => entry.correct).length;
    setResult(nextResult);
    onChecked(exercise.id, correctCount, exercise.items.length, !hasInitialCheck);
    setHasInitialCheck(true);
  };

  const retry = () => {
    setAnswers({});
    setResult(null);
    onReset(exercise.id);
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-gray-200 bg-white/85 shadow-sm dark:border-gray-700 dark:bg-gray-900/70">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-4 py-4 dark:border-gray-800 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-black text-gray-700 dark:bg-gray-800 dark:text-gray-100">{index + 1}</span>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{copy.task} {index + 1} {nativeLang === "hy" ? `/${total}` : `из ${total}`}</p>
            <h2 className="mt-1 text-base font-extrabold leading-snug text-gray-900 dark:text-white">{localized(exercise.instruction, nativeLang) || copy.unknown}</h2>
            {exercise.example && (
              <SpokenText
                value={exercise.example}
                id={`grammar-${unitId}-${exercise.id}-exercise-example`}
                playAudio={playAudio}
                nativeLang={nativeLang}
                className="mt-1 text-xs text-gray-500 dark:text-gray-400"
              />
            )}
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${stage.color}`}>{stage.label}</span>
      </div>

      <div className="divide-y divide-gray-100 px-4 dark:divide-gray-800 sm:px-6">
        {exercise.items.length ? exercise.items.map((item, itemIndex) => (
          <div key={item.id} className="grid min-w-0 gap-4 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)] sm:items-start">
            <div className="flex min-w-0 gap-3">
              <span className="mt-0.5 text-xs font-bold text-gray-400">{itemIndex + 1}</span>
              <PromptContent
                value={"prompt" in item ? itemPrompt(item, nativeLang, exercise) : "words" in item ? item.words.join(" · ") : ""}
                nativeLang={nativeLang}
                id={`grammar-${unitId}-${exercise.id}-${item.id}-prompt`}
                playAudio={playAudio}
                allowAudio={exercise.type !== "fix"}
              />
            </div>
            <div className="min-w-0">
              <ItemAnswerInput
                key={`${item.id}-${result ? "checked" : "open"}`}
                exercise={exercise}
                item={item}
                itemIndex={itemIndex}
                unitId={unitId}
                playAudio={playAudio}
                value={answers[item.id]}
                onChange={(value) => setAnswers((previous) => ({ ...previous, [item.id]: value }))}
                nativeLang={nativeLang}
                disabled={!!result || itemKind(exercise, item) === "unsupported"}
                outcome={result?.[item.id]}
                runKey={`${runId}-${exercise.id}`}
              />
            </div>
            {result?.[item.id] && (
              <div className={`sm:col-span-2 rounded-xl px-3 py-2.5 text-xs leading-relaxed ${result[item.id].correct ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100" : "bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100"}`}>
                <p className="flex items-center gap-1.5 font-bold">
                  {result[item.id].correct ? <Check size={14} /> : <X size={14} />}
                  {result[item.id].correct ? copy.correct : copy.incorrect}
                </p>
                {result[item.id].explanation && <p className="mt-1">{result[item.id].explanation}</p>}
                {result[item.id].answer && exercise.type !== "pick" && (
                  <div className="mt-1 flex flex-wrap items-start gap-1 font-semibold">
                    <span className="shrink-0">{copy.correctAnswer}:</span>
                    <SpokenText
                      value={result[item.id].answer}
                      id={`grammar-${unitId}-${exercise.id}-${item.id}-checked-answer`}
                      playAudio={playAudio}
                      nativeLang={nativeLang}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )) : (
          <p className="py-5 text-sm text-gray-600 dark:text-gray-300">{copy.unknown}</p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 px-4 py-4 dark:border-gray-800 dark:bg-gray-950/30 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {result ? copy.checked : hasNoQuestions ? copy.unknown : allAnswered ? (nativeLang === "hy" ? `${exercise.items.length} կետ · պատրաստ է ստուգման` : `${exercise.items.length} пунктов · готово к проверке`) : copy.missing}
        </p>
        <div className="flex flex-wrap gap-2">
          {result && (
            <button type="button" onClick={retry} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-white dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
              <RotateCcw size={15} />{copy.retry}
            </button>
          )}
          <button type="button" onClick={checkAnswers} disabled={!!result || (!hasNoQuestions && !allAnswered)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-gray-900 dark:hover:bg-rose-200">
            {result ? <CheckCircle2 size={16} /> : <Check size={16} />}{result ? copy.checked : hasNoQuestions ? copy.unknownDone : copy.check}
          </button>
        </div>
      </div>
    </article>
  );
}

function PromptContent({
  value,
  nativeLang,
  id,
  playAudio,
  allowAudio,
}: {
  value: string;
  nativeLang: NativeLang;
  id: string;
  playAudio: PlayEnglishAudio;
  allowAudio: boolean;
}) {
  const plainValue = cleanInlineArtifacts(value).replace(/<[^>]*>/g, "").trim();
  const cue = plainValue.match(/^\(\s*([+\-−])\s*\)\s*(.+?)\s*\/\s*(.+)$/);
  if (!cue) {
    return allowAudio
      ? <SpokenText value={value} id={id} playAudio={playAudio} nativeLang={nativeLang} className="min-w-0 flex-1 text-sm font-medium leading-relaxed text-gray-800 dark:text-gray-100" />
      : <RichText value={value} className="min-w-0 flex-1 text-sm font-medium leading-relaxed text-gray-800 dark:text-gray-100" />;
  }

  const isPositive = cue[1] === "+";
  const label = nativeLang === "hy"
    ? isPositive ? "Հաստատական ձև" : "Ժխտական ձև"
    : isPositive ? "Утвердительная форма" : "Отрицательная форма";

  return (
    <div className="min-w-0 flex-1 space-y-2">
      <span className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-xs font-bold ${isPositive ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100" : "bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-100"}`}>
        {cue[1]} · {label}
      </span>
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium leading-relaxed text-gray-800 dark:text-gray-100">
        <span className="max-w-full break-words rounded-lg bg-gray-100 px-2.5 py-1.5 dark:bg-gray-800">{cue[2]}</span>
        <span aria-hidden="true" className="font-bold text-gray-400">→</span>
        <span className="max-w-full break-words rounded-lg bg-gray-100 px-2.5 py-1.5 dark:bg-gray-800">{cue[3]}</span>
      </div>
    </div>
  );
}

function ItemAnswerInput({
  exercise,
  item,
  itemIndex,
  unitId,
  playAudio,
  value,
  onChange,
  nativeLang,
  disabled,
  outcome,
  runKey,
}: {
  exercise: GrammarExercise;
  item: GrammarItem;
  itemIndex: number;
  unitId: string;
  playAudio: PlayEnglishAudio;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  nativeLang: NativeLang;
  disabled: boolean;
  outcome?: ItemResult;
  runKey: string;
}) {
  const copy = labels[nativeLang];
  const kind = itemKind(exercise, item);
  const shuffledPick = useMemo(() => {
    if (kind !== "pick" || !("options" in item)) return [];
    const map = exercise.shuffleOptions ? buildDisplayMap(item.options.length, `${runKey}-${item.id}-pick`) : item.options.map((_, idx) => idx);
    return map.map((originalIndex) => ({ text: item.options[originalIndex], originalIndex }));
  }, [exercise.shuffleOptions, item, item.id, kind, runKey]);
  const matchOptions = useMemo(() => {
    if (kind !== "match" || !("answer" in item)) return [];
    const base = [...new Set([...(exercise.options ?? []), item.answer])];
    const map = exercise.shuffleOptions ? buildDisplayMap(base.length, `${runKey}-${item.id}-match`) : base.map((_, idx) => idx);
    return map.map((originalIndex) => base[originalIndex]);
  }, [exercise.options, exercise.shuffleOptions, item, item.id, kind, runKey]);
  const wordTiles = useMemo(() => {
    if (kind !== "order" || !("words" in item)) return [];
    const map = buildDisplayMap(item.words.length, `${runKey}-${item.id}-words`);
    return map.map((originalIndex) => ({ word: item.words[originalIndex], originalIndex }));
  }, [item, item.id, kind, runKey]);

  if (kind === "pick" && "options" in item) {
    const chosen = typeof value === "string" ? Number(value) : -1;
    return (
      <div className="grid w-full min-w-0 grid-cols-1 gap-2" role="group" aria-label={itemPrompt(item, nativeLang, exercise)}>
        {shuffledPick.map((option) => {
          const selected = chosen === option.originalIndex;
          const isCorrectAnswer = !!outcome && option.originalIndex === item.correctIndex;
          const isWrongSelected = !!outcome && selected && !outcome.correct;
          return (
            <div key={option.originalIndex} className="flex min-w-0 items-start gap-1.5">
              <button type="button" onClick={() => onChange(String(option.originalIndex))} disabled={disabled} aria-pressed={selected} className={`min-w-0 flex-1 whitespace-normal break-words rounded-xl border px-3 py-2.5 text-left text-sm font-bold leading-relaxed transition ${isCorrectAnswer ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100" : isWrongSelected ? "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-100" : selected ? "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-100" : "border-gray-200 bg-white text-gray-800 hover:border-rose-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"}`}>
                <RichInlineText value={option.text} />
              </button>
              <AudioPlayButton text={option.text} id={`grammar-${unitId}-${exercise.id}-${item.id}-option-${option.originalIndex}`} playAudio={playAudio} nativeLang={nativeLang} />
            </div>
          );
        })}
      </div>
    );
  }

  if (kind === "match" && "answer" in item) {
    return (
      <select aria-label={itemPrompt(item, nativeLang, exercise)} value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} disabled={disabled} className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:opacity-80 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-rose-950 ${outcome ? outcome.correct ? "border-emerald-500" : "border-rose-500" : "border-gray-200 dark:border-gray-700"}`}>
        <option value="">{copy.select}</option>
        {matchOptions.map((option, index) => <option key={`${option}-${index}`} value={option}>{plainOptionText(option)}</option>)}
      </select>
    );
  }

  if (kind === "order" && "words" in item) {
    const selectedWords = Array.isArray(value) ? value : [];
    const used = new Set(selectedWords);
    return (
      <div className="space-y-2">
        <div className="flex min-h-10 flex-wrap gap-1.5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-800/60" aria-label={copy.answer}>
          {selectedWords.length ? selectedWords.map((wordIndex, position) => (
            <button key={`${wordIndex}-${position}`} type="button" disabled={disabled} onClick={() => onChange(selectedWords.filter((_, index) => index !== position))} title={copy.removeWord} className="max-w-full whitespace-normal break-words rounded-lg bg-rose-100 px-2.5 py-1 text-left text-sm font-semibold text-rose-800 dark:bg-rose-950 dark:text-rose-100"><RichInlineText value={item.words[wordIndex]} /></button>
          )) : <span className="px-1 text-xs text-gray-400">{copy.answer}</span>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {wordTiles.map(({ word, originalIndex }) => (
            <button key={`${originalIndex}-${word}`} type="button" disabled={disabled || used.has(originalIndex)} onClick={() => onChange([...selectedWords, originalIndex])} className="max-w-full whitespace-normal break-words rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-left text-sm font-medium text-gray-700 transition hover:border-rose-300 disabled:opacity-35 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"><RichInlineText value={word} /></button>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "text" && "accepted" in item && "prompt" in item) {
    return (
      <div className="space-y-2">
        {exercise.type === "gap" && exercise.box && exercise.box.length > 0 && (
          <div className="flex flex-wrap gap-1.5" aria-label={nativeLang === "hy" ? "Բառերի ցանկ" : "Слова для выбора"}>
            {exercise.box.map((word, index) => <span key={`${word}-${index}`} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">{word}</span>)}
          </div>
        )}
        <input
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          aria-label={itemPrompt(item, nativeLang, exercise) || `${copy.answer} ${itemIndex + 1}`}
          autoComplete="off"
          className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:opacity-80 dark:bg-gray-800 dark:text-white dark:focus:ring-rose-950 ${outcome ? outcome.correct ? "border-emerald-500" : "border-rose-500" : "border-gray-200 dark:border-gray-700"}`}
          placeholder={copy.answer}
        />
      </div>
    );
  }

  return <p className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-300">{copy.unknown}</p>;
}
