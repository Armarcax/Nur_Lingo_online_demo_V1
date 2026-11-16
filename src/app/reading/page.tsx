// src/app/reading/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, BookOpen, Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle, Languages, Loader2, PencilLine } from "lucide-react";
import { READING_TEXTS, type ReadingText, type ReadingParagraph } from "@/lib/content/reading-texts";
import { GlassCard } from "@/components/ui/glass-card";
import { loadLangConfig, type LangCode } from "@/lib/i18n/index";
import { useAudioManager } from "@/lib/hooks/useAudioManager";
import { getWavClient, WavClient } from "@/lib/audio/WavClient";

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

// ✅ UI Տեքստերի թարգմանություններ
const UI_TEXT = {
  title: { en: "Reading", hy: "Ընթերցանություն", ru: "Чтение" },
  level: { en: "Level", hy: "Մակարդակ", ru: "Уровень" },
  minutes: { en: "min", hy: "րոպե", ru: "мин" },
  words: { en: "words", hy: "բառ", ru: "слов" },
  listen: { en: "Listen", hy: "Լսել", ru: "Слушать" },
  stop: { en: "Stop", hy: "Կանգնեցնել", ru: "Стоп" },
  translation: { en: "Translation", hy: "Թարգմանություն", ru: "Перевод" },
  vocabulary: { en: "Vocabulary", hy: "Բառարան", ru: "Словарь" },
  questions: { en: "Questions", hy: "Հարցեր", ru: "Вопросы" },
  creativeTask: { en: "Creative Task", hy: "Ստեղծագործական առաջադրանք", ru: "Творческое задание" },
  yourAnswer: { en: "Write your answer here...", hy: "Գրիր քո պատասխանը այստեղ...", ru: "Напиши свой ответ здесь..." },
  check: { en: "Check", hy: "Ստուգել", ru: "Проверить" },
  correct: { en: "Correct!", hy: "Ճիշտ է:", ru: "Правильно!" },
  incorrect: { en: "Incorrect!", hy: "Սխալ է:", ru: "Неправильно!" },
  back: { en: "Back to list", hy: "Վերադառնալ ցանկին", ru: "Назад к списку" },
  nextPart: { en: "Next part", hy: "Հաջորդ մասը", ru: "Следующая часть" },
  prevPart: { en: "Previous part", hy: "Նախորդ մասը", ru: "Предыдущая часть" },
};

type TabKey = "vocabulary" | "questions" | "creativeTask";

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

  // ✅ ԱՈՒԴԻՈ
  const { stop, isPlaying } = useAudioManager();
  const [wavClient, setWavClient] = useState<WavClient | null>(null);
  const [isWAVAvailable, setIsWAVAvailable] = useState(false);
  const speakingLockRef = useRef(false);

  const t_ui = (key: keyof typeof UI_TEXT) => UI_TEXT[key][native] || UI_TEXT[key].en;

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
      try { const client = getWavClient(); if (client) { setWavClient(client); setIsWAVAvailable(true); } }
      catch (error) { console.warn("WAV init error:", error); }
    };
    initWAV();
  }, []);

  // ─── ԱՈՒԴԻՈ ՖՈՒՆԿՑԻԱՆԵՐ ──────────────────────────────────────────

  const playAudioWithFemaleVoice = useCallback((text: string, lang: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        reject(new Error("Speech synthesis not supported")); return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "en" ? "en-US" : lang === "hy" ? "hy-AM" : "ru-RU";
      utterance.rate = lang === "hy" ? 1.2 : 1.0;
      utterance.pitch = 1.2; utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith(lang));
      if (voice) utterance.voice = voice;

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const handleSpeak = useCallback(
    async (text: string, lang: string = "en") => {
      if (!text || speakingLockRef.current) return;
      speakingLockRef.current = true;
      try {
        const cleanText = sanitizeForTTS(text);
        if (learningLang === "hy" && wavClient && isWAVAvailable) {
          try { await wavClient.playPrompt(cleanText, getPairKey(native, learningLang), "Ani"); return; }
          catch { /* Fallback */ }
        }
        await playAudioWithFemaleVoice(cleanText, lang);
      } catch (e) { console.warn("handleSpeak error:", e); }
      finally { speakingLockRef.current = false; }
    },
    [wavClient, isWAVAvailable, native, learningLang, playAudioWithFemaleVoice]
  );

  if (!isLangLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;
  }

  // ─── LIST VIEW ────────────────────────────────────────────────────

  if (!selectedText) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pb-20">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => router.push("/world")} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><ArrowLeft size={24} /></button>
            <h1 className="text-xl font-black flex items-center gap-2"><BookOpen size={20} className="text-blue-500" /> {t_ui("title")}</h1>
            <div className="w-10" />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {READING_TEXTS.map((text) => (
              <motion.div
                key={text.id}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => {
                  setSelectedText(text);
                  setCurrentPart(0);
                  setActiveTab("vocabulary");
                  setAnswers({});
                  setShowResults(false);
                  setCreativeAnswers({});
                }}
                className="cursor-pointer bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">{text.level}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> {text.minutes} {t_ui("minutes")}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-1">{text.title[learningLang] || text.title.en}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{text.paragraphs[0][learningLang] || text.paragraphs[0].en}</p>
                </div>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500">{text.words} {t_ui("words")}</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500">{text.questionsCount} {t_ui("questions")}</span>
                  {text.creativeTask && (
                    <span className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-2 py-1 rounded flex items-center gap-1">
                      <PencilLine size={10} /> {t_ui("creativeTask")}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ─── DETAIL VIEW ──────────────────────────────────────────────────

  const part = selectedText.paragraphs[currentPart];
  const textToRead = part[learningLang] || part.en;
  const textToTranslate = part[native] || part.en;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "vocabulary", label: t_ui("vocabulary") },
    { key: "questions", label: t_ui("questions") },
    ...(selectedText.creativeTask ? [{ key: "creativeTask" as TabKey, label: t_ui("creativeTask") }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pb-20">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSelectedText(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><ArrowLeft size={24} /></button>
          <div className="text-center">
            <h1 className="text-lg font-bold">{selectedText.title[learningLang] || selectedText.title.en}</h1>
            <p className="text-xs text-gray-500">{selectedText.level} · {selectedText.minutes} {t_ui("minutes")}</p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Tools */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <button onClick={() => isPlaying ? stop() : handleSpeak(textToRead, learningLang)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${isPlaying ? "bg-amber-100 text-amber-600" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>
              <Volume2 size={18} /> {isPlaying ? t_ui("stop") : t_ui("listen")}
            </button>
          </div>
          <button onClick={() => setShowTranslation(!showTranslation)} className={`flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-xl transition-all ${showTranslation ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
            <Languages size={18} /> {t_ui("translation")}
          </button>
        </div>

        {/* Text Content */}
        <GlassCard variant="premium" className="p-6 md:p-10 bg-white dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{learningLang.toUpperCase()}</span>
              <p className="text-xl leading-relaxed text-gray-800 dark:text-gray-200 font-medium">{textToRead}</p>
            </div>
            {showTranslation && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="border-l-0 md:border-l border-gray-200 dark:border-gray-700 md:pl-8">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{native.toUpperCase()}</span>
                <p className="text-xl leading-relaxed text-gray-500 dark:text-gray-400">{textToTranslate}</p>
              </motion.div>
            )}
          </div>
        </GlassCard>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8">
          <button onClick={() => setCurrentPart(p => Math.max(0, p - 1))} disabled={currentPart === 0} className="p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 shadow-sm"><ChevronLeft size={24} /></button>
          <span className="text-sm font-bold text-gray-500">{currentPart + 1} / {selectedText.paragraphs.length}</span>
          <button onClick={() => setCurrentPart(p => Math.min(selectedText.paragraphs.length - 1, p + 1))} disabled={currentPart === selectedText.paragraphs.length - 1} className="p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 shadow-sm"><ChevronRight size={24} /></button>
        </div>

        {/* Tabs: Vocabulary / Questions / Creative Task */}
        <div className="mt-10 flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? tab.key === "creativeTask"
                    ? "border-purple-500 text-purple-600"
                    : "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── VOCABULARY TAB ─── */}
        {activeTab === "vocabulary" && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedText.vocabulary.map((v, i) => {
              const targetWord = v.translation[learningLang] || v.word;
              const nativeMeaning = v.translation[native] || v.translation.en;

              return (
                <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{targetWord}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{nativeMeaning}</p>
                  </div>
                  <button onClick={() => handleSpeak(targetWord, learningLang)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"><Volume2 size={16} /></button>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── QUESTIONS TAB ─── */}
        {activeTab === "questions" && (
          <div className="mt-4 space-y-6">
            {selectedText.questions.map((q, qi) => (
              <GlassCard key={qi} variant="premium" className="p-5">
                <p className="font-bold mb-3 text-gray-900 dark:text-white">{q.question[learningLang] || q.question.en}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const isSelected = answers[qi] === oi;
                    const isCorrect = oi === q.correctIndex;
                    let cls = "w-full text-left p-3 rounded-xl border-2 transition-all ";
                    if (showResults) {
                      if (isCorrect) cls += "border-emerald-500 bg-emerald-50";
                      else if (isSelected && !isCorrect) cls += "border-red-500 bg-red-50";
                      else cls += "border-gray-200 opacity-50";
                    } else {
                      cls += isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300";
                    }
                    return (
                      <button key={oi} onClick={() => !showResults && setAnswers({ ...answers, [qi]: oi })} className={cls} disabled={showResults}>
                        {opt[learningLang] || opt.en}
                      </button>
                    );
                  })}
                </div>
              </GlassCard>
            ))}
            <button onClick={() => setShowResults(true)} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700">{t_ui("check")}</button>
            {showResults && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-700 dark:text-emerald-300 font-bold text-center">
                {selectedText.questions.filter((q, i) => answers[i] === q.correctIndex).length} / {selectedText.questions.length} {t_ui("correct")}
              </div>
            )}
          </div>
        )}

        {/* ─── CREATIVE TASK TAB ─── */}
        {activeTab === "creativeTask" && selectedText.creativeTask && (
          <div className="mt-4 space-y-4">
            <GlassCard variant="premium" className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
              <p className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <PencilLine size={14} /> {t_ui("creativeTask")}
              </p>
              <p className="font-bold text-lg mb-1 text-gray-900 dark:text-white">
                {selectedText.creativeTask.prompt[learningLang] || selectedText.creativeTask.prompt.en}
              </p>
              {learningLang !== native && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedText.creativeTask.prompt[native] || selectedText.creativeTask.prompt.en}
                </p>
              )}
            </GlassCard>

            <div className="space-y-3">
              {selectedText.creativeTask.questions.map((q, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
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
                    onChange={(e) => setCreativeAnswers({ ...creativeAnswers, [i]: e.target.value })}
                    placeholder={t_ui("yourAnswer")}
                    className="w-full mt-2 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}