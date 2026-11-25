// src/app/reading/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  Languages,
  PencilLine,
  Filter,
  Loader2,
} from "lucide-react";
import {
  READING_TEXTS,
  type ReadingText,
} from "@/lib/content/reading-texts";
import { GlassCard } from "@/components/ui/glass-card";
import { loadLangConfig, type LangCode } from "@/lib/i18n/index";
import { useAudioManager } from "@/lib/hooks/useAudioManager";
import { getWavClient, WavClient } from "@/lib/audio/WavClient";
import {
  PageShell,
  PageTabs,
  EmptyState,
  LoadingState,
  StatPill,
} from "@/components/layout";

// ─── HELPERS ──────────────────────────────────────────────────────────

function sanitizeForTTS(text: string): string {
  if (!text) return text;
  return text
    .replace(/[«»""'']/g, "")
    .replace(/՛/g, "")
    .replace(/՝/g, ",")
    .replace(/։/g, ".")
    .replace(/[.,;:!?։»«]+\s*$/g, "")
    .replace(/[։»«]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getPairKey(native: LangCode, learning: LangCode): string {
  return `${native}-${learning}`;
}

const UI_TEXT = {
  title: { en: "Reading", hy: "Ընթերցանություն", ru: "Чтение" },
  subtitle: {
    en: "Read & learn",
    hy: "Կարդա և սովորիր",
    ru: "Читай и учись",
  },
  minutes: { en: "min", hy: "րոպե", ru: "мин" },
  words: { en: "words", hy: "բառ", ru: "слов" },
  listen: { en: "Listen", hy: "Լսել", ru: "Слушать" },
  stop: { en: "Stop", hy: "Կանգնեցնել", ru: "Стоп" },
  translation: { en: "Translation", hy: "Թարգմանություն", ru: "Перевод" },
  vocabulary: { en: "Vocabulary", hy: "Բառարան", ru: "Словарь" },
  questions: { en: "Questions", hy: "Հարցեր", ru: "Вопросы" },
  creativeTask: {
    en: "Creative Task",
    hy: "Ստեղծագործական առաջադրանք",
    ru: "Творческое задание",
  },
  yourAnswer: {
    en: "Write your answer here...",
    hy: "Գրիր քո պատասխանը այստեղ...",
    ru: "Напиши свой ответ здесь...",
  },
  check: { en: "Check", hy: "Ստուգել", ru: "Проверить" },
  correct: { en: "Correct!", hy: "Ճիշտ է", ru: "Правильно" },
  all: { en: "All", hy: "Բոլորը", ru: "Все" },
  noResults: {
    en: "No texts at this level yet",
    hy: "Այս մակարդակում տեքստեր դեռ չկան",
    ru: "Текстов этого уровня пока нет",
  },
  texts: { en: "texts", hy: "տեքստ", ru: "текстов" },
};

type TabKey = "vocabulary" | "questions" | "creativeTask";
type LevelFilter = "all" | "A1" | "A2" | "B1" | "B2";

const LEVEL_COLORS: Record<string, string> = {
  A1: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30",
  A2: "text-blue-500 bg-blue-50 dark:bg-blue-900/30",
  B1: "text-orange-500 bg-orange-50 dark:bg-orange-900/30",
  B2: "text-purple-500 bg-purple-50 dark:bg-purple-900/30",
};

export default function ReadingPage() {
  const router = useRouter();
  const [native, setNative] = useState<LangCode>("hy");
  const [learningLang, setLearningLang] = useState<LangCode>("en");
  const [isLangLoaded, setIsLangLoaded] = useState(false);

  const [selectedText, setSelectedText] = useState<ReadingText | null>(null);
  const [currentPart, setCurrentPart] = useState(0);
  const [showTranslation, setShowTranslation] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("vocabulary");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [creativeAnswers, setCreativeAnswers] = useState<Record<number, string>>({});
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");

  const { stop, isPlaying } = useAudioManager();
  const [wavClient, setWavClient] = useState<WavClient | null>(null);
  const [isWAVAvailable, setIsWAVAvailable] = useState(false);
  const speakingLockRef = useRef(false);

  const t_ui = (key: keyof typeof UI_TEXT) =>
    UI_TEXT[key][native] || UI_TEXT[key].en;

  // ─── EFFECTS ───
  useEffect(() => {
    try {
      const config = loadLangConfig();
      if (config) {
        setNative(config.native as LangCode);
        setLearningLang(config.learning as LangCode);
      }
    } catch (e) {}
    setIsLangLoaded(true);
  }, []);

  useEffect(() => {
    const initWAV = async () => {
      try {
        const client = getWavClient();
        if (client) {
          setWavClient(client);
          setIsWAVAvailable(true);
        }
      } catch (error) {
        console.warn("WAV init error:", error);
      }
    };
    initWAV();
  }, []);

  // ─── AUDIO ───
  const playAudioWithFemaleVoice = useCallback(
    (text: string, lang: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (typeof window === "undefined" || !window.speechSynthesis) {
          reject(new Error("Speech synthesis not supported"));
          return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang =
          lang === "en" ? "en-US" : lang === "hy" ? "hy-AM" : "ru-RU";
        utterance.rate = lang === "hy" ? 1.2 : 1.0;
        utterance.pitch = 1.2;
        utterance.volume = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find((v) => v.lang.startsWith(lang));
        if (voice) utterance.voice = voice;
        utterance.onend = () => resolve();
        utterance.onerror = (e) => reject(e);
        window.speechSynthesis.speak(utterance);
      });
    },
    []
  );

  const handleSpeak = useCallback(
    async (text: string, lang: string = "en") => {
      if (!text || speakingLockRef.current) return;
      speakingLockRef.current = true;
      try {
        const cleanText = sanitizeForTTS(text);
        if (learningLang === "hy" && wavClient && isWAVAvailable) {
          try {
            await wavClient.playPrompt(
              cleanText,
              getPairKey(native, learningLang),
              "Ani"
            );
            return;
          } catch {}
        }
        await playAudioWithFemaleVoice(cleanText, lang);
      } catch (e) {
        console.warn("handleSpeak error:", e);
      } finally {
        speakingLockRef.current = false;
      }
    },
    [wavClient, isWAVAvailable, native, learningLang, playAudioWithFemaleVoice]
  );

  // ─── FILTERS ───
  const filteredTexts = useMemo(() => {
    if (levelFilter === "all") return READING_TEXTS;
    return READING_TEXTS.filter((t) => t.level === levelFilter);
  }, [levelFilter]);

  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: READING_TEXTS.length,
      A1: 0,
      A2: 0,
      B1: 0,
      B2: 0,
    };
    for (const t of READING_TEXTS) counts[t.level] = (counts[t.level] || 0) + 1;
    return counts;
  }, []);

  if (!isLangLoaded) {
    return <LoadingState />;
  }

  // ═══════════════════════════════════════════════════════════════
  // LIST VIEW
  // ═══════════════════════════════════════════════════════════════
  if (!selectedText) {
    const levelFilters: LevelFilter[] = ["all", "A1", "A2", "B1", "B2"];

    return (
      <PageShell
        title={t_ui("title")}
        subtitle={t_ui("subtitle")}
        icon={<BookOpen size={20} />}
        backHref="/world"
        maxWidth="4xl"
        actions={
          <StatPill
            icon={<Filter size={13} />}
            value={levelFilter === "all" ? filteredTexts.length : `${levelFilter} · ${filteredTexts.length}`}
            color="blue"
          />
        }
      >
        {/* ─── LEVEL FILTER ROW ─── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {levelFilters.map((lvl) => {
            const count = levelCounts[lvl] || 0;
            const isActive = levelFilter === lvl;
            const label = lvl === "all" ? t_ui("all") : lvl;
            return (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                disabled={count === 0 && lvl !== "all"}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                    : count === 0
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    : "bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 border border-white/20 dark:border-white/5 hover:border-blue-300"
                }`}
              >
                {label} <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* ─── RESULTS COUNT ─── */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          {filteredTexts.length} {t_ui("texts")}
        </p>

        {/* ─── GRID or EMPTY ─── */}
        {filteredTexts.length === 0 ? (
          <EmptyState
            icon="📖"
            title={t_ui("noResults")}
            action={{ label: t_ui("all"), onClick: () => setLevelFilter("all") }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredTexts.map((text) => (
                <motion.div
                  key={text.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  onClick={() => {
                    setSelectedText(text);
                    setCurrentPart(0);
                    setActiveTab("vocabulary");
                    setAnswers({});
                    setShowResults(false);
                    setCreativeAnswers({});
                  }}
                  className="cursor-pointer bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-5 border border-white/20 dark:border-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${LEVEL_COLORS[text.level] || ""}`}
                      >
                        {text.level}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} /> {text.minutes} {t_ui("minutes")}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">
                      {text.title[learningLang] || text.title.en}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {text.paragraphs[0][learningLang] || text.paragraphs[0].en}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <span className="text-xs bg-gray-100 dark:bg-gray-700/60 px-2 py-1 rounded text-gray-500 dark:text-gray-400">
                      {text.words} {t_ui("words")}
                    </span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700/60 px-2 py-1 rounded text-gray-500 dark:text-gray-400">
                      {text.questionsCount} {t_ui("questions")}
                    </span>
                    {text.creativeTask && (
                      <span className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-2 py-1 rounded flex items-center gap-1">
                        <PencilLine size={10} /> {t_ui("creativeTask")}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </PageShell>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // DETAIL VIEW
  // ═══════════════════════════════════════════════════════════════
  const part = selectedText.paragraphs[currentPart];
  const textToRead = part[learningLang] || part.en;
  const textToTranslate = part[native] || part.en;

  const tabs = [
    {
      id: "vocabulary" as TabKey,
      label: t_ui("vocabulary"),
    },
    {
      id: "questions" as TabKey,
      label: t_ui("questions"),
      badge: selectedText.questions.length,
    },
    ...(selectedText.creativeTask
      ? [{ id: "creativeTask" as TabKey, label: t_ui("creativeTask") }]
      : []),
  ];

  const correctCount = selectedText.questions.filter(
    (q, i) => answers[i] === q.correctIndex
  ).length;

  return (
    <PageShell
      title={selectedText.title[learningLang] || selectedText.title.en}
      subtitle={`${selectedText.level} · ${selectedText.minutes} ${t_ui("minutes")}`}
      icon={<BookOpen size={20} />}
      onBack={() => setSelectedText(null)}
      maxWidth="4xl"
      actions={
        <StatPill
          icon={<Languages size={13} />}
          value={`${native.toUpperCase()}←${learningLang.toUpperCase()}`}
          color="purple"
        />
      }
    >
      {/* ─── TOOLS ROW ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-3 rounded-2xl border border-white/20 dark:border-white/5">
        <button
          onClick={() =>
            isPlaying ? stop() : handleSpeak(textToRead, learningLang)
          }
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            isPlaying
              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
              : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
          }`}
        >
          <Volume2 size={18} />
          {isPlaying ? t_ui("stop") : t_ui("listen")}
        </button>
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className={`flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-xl transition-all ${
            showTranslation
              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              : "bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400"
          }`}
        >
          <Languages size={18} /> {t_ui("translation")}
        </button>
      </div>

      {/* ─── TEXT CONTENT ─── */}
      <GlassCard
        variant="premium"
        className="p-6 md:p-10 bg-white/70 dark:bg-gray-800/70"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
              {learningLang.toUpperCase()}
            </span>
            <p className="text-xl leading-relaxed text-gray-800 dark:text-gray-200 font-medium">
              {textToRead}
            </p>
          </div>
          {showTranslation && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="border-l-0 md:border-l border-gray-200 dark:border-gray-700 md:pl-8"
            >
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                {native.toUpperCase()}
              </span>
              <p className="text-xl leading-relaxed text-gray-500 dark:text-gray-400">
                {textToTranslate}
              </p>
            </motion.div>
          )}
        </div>
      </GlassCard>

      {/* ─── PAGINATION ─── */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => setCurrentPart((p) => Math.max(0, p - 1))}
          disabled={currentPart === 0}
          className="p-3 rounded-full bg-white/60 dark:bg-gray-800/60 border border-white/20 dark:border-white/5 disabled:opacity-50 shadow-sm transition-opacity"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
          {currentPart + 1} / {selectedText.paragraphs.length}
        </span>
        <button
          onClick={() =>
            setCurrentPart((p) =>
              Math.min(selectedText.paragraphs.length - 1, p + 1)
            )
          }
          disabled={currentPart === selectedText.paragraphs.length - 1}
          className="p-3 rounded-full bg-white/60 dark:bg-gray-800/60 border border-white/20 dark:border-white/5 disabled:opacity-50 shadow-sm transition-opacity"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* ─── TABS ─── */}
      <PageTabs
        tabs={tabs}
        value={activeTab}
        onChange={(id) => {
          setActiveTab(id as TabKey);
          if (id !== "questions") setShowResults(false);
        }}
        className="mt-10 mb-4"
      />

      {/* ─── VOCABULARY TAB ─── */}
      {activeTab === "vocabulary" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {selectedText.vocabulary.map((v, i) => {
            const targetWord = v.translation[learningLang] || v.word;
            const nativeMeaning = v.translation[native] || v.translation.en;
            return (
              <div
                key={i}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-3 rounded-xl border border-white/20 dark:border-white/5 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {targetWord}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {nativeMeaning}
                  </p>
                </div>
                <button
                  onClick={() => handleSpeak(targetWord, learningLang)}
                  className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Volume2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── QUESTIONS TAB ─── */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          {selectedText.questions.map((q, qi) => (
            <GlassCard key={qi} variant="premium" className="p-5">
              <p className="font-bold mb-3 text-gray-900 dark:text-white">
                {q.question[learningLang] || q.question.en}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected = answers[qi] === oi;
                  const isCorrect = oi === q.correctIndex;
                  let cls =
                    "w-full text-left p-3 rounded-xl border-2 transition-all ";
                  if (showResults) {
                    if (isCorrect)
                      cls += "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30";
                    else if (isSelected && !isCorrect)
                      cls += "border-red-500 bg-red-50 dark:bg-red-900/30";
                    else cls += "border-gray-200 dark:border-gray-700 opacity-50";
                  } else {
                    cls += isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300";
                  }
                  return (
                    <button
                      key={oi}
                      onClick={() =>
                        !showResults && setAnswers({ ...answers, [qi]: oi })
                      }
                      className={cls}
                      disabled={showResults}
                    >
                      {opt[learningLang] || opt.en}
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          ))}
          <button
            onClick={() => setShowResults(true)}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
          >
            {t_ui("check")}
          </button>
          {showResults && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-700 dark:text-emerald-300 font-bold text-center">
              {correctCount} / {selectedText.questions.length} ·{" "}
              {t_ui("correct")}
            </div>
          )}
        </div>
      )}

      {/* ─── CREATIVE TASK TAB ─── */}
      {activeTab === "creativeTask" && selectedText.creativeTask && (
        <div className="space-y-4">
          <GlassCard
            variant="premium"
            className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800"
          >
            <p className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <PencilLine size={14} /> {t_ui("creativeTask")}
            </p>
            <p className="font-bold text-lg mb-1 text-gray-900 dark:text-white">
              {selectedText.creativeTask.prompt[learningLang] ||
                selectedText.creativeTask.prompt.en}
            </p>
            {learningLang !== native && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedText.creativeTask.prompt[native] ||
                  selectedText.creativeTask.prompt.en}
              </p>
            )}
          </GlassCard>

          <div className="space-y-3">
            {selectedText.creativeTask.questions.map((q, i) => (
              <div
                key={i}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-white/20 dark:border-white/5"
              >
                <p className="font-medium mb-1 text-gray-900 dark:text-white flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span>{q[learningLang] || q.en}</span>
                </p>
                {learningLang !== native && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 ml-8">
                    {q[native] || q.en}
                  </p>
                )}
                <textarea
                  value={creativeAnswers[i] || ""}
                  onChange={(e) =>
                    setCreativeAnswers({
                      ...creativeAnswers,
                      [i]: e.target.value,
                    })
                  }
                  placeholder={t_ui("yourAnswer")}
                  className="w-full mt-2 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={2}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}