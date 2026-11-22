// src/app/visual-lessons/page.tsx
"use client";

import {
  useState,
  Suspense,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  VolumeOff,
  ArrowLeft,
  Search,
  Sparkles,
  BookOpen,
  ChevronRight,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { VISUAL_LESSONS, type VisualLesson } from "@/lib/content/visual-lessons";
import { GlassCard } from "@/components/ui/glass-card";
import { loadLangConfig, type LangCode } from "@/lib/i18n/index";
import { useAudioManager } from "@/lib/hooks/useAudioManager";
import { getWavClient, WavClient } from "@/lib/audio/WavClient";
import type { GrammarUnit } from "@/lib/content/grammar-types";
import { loadGrammarUnits } from "@/lib/content/grammar-loader";
import { GrammarUnitCard } from "@/components/GrammarUnitCard";
import { GrammarUnitPlayer } from "@/components/GrammarUnitPlayer";
import { SnakePath, type SnakeNode } from "@/components/SnakePath";

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

function VisualLessonsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams?.get("module") || null;

  const [selectedLesson, setSelectedLesson] = useState<VisualLesson | null>(null);
  const [selectedGrammarUnit, setSelectedGrammarUnit] =
    useState<GrammarUnit | null>(null);
  const [grammarUnits, setGrammarUnits] = useState<GrammarUnit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState<"practice" | "grammar">("practice");

  const [native, setNative] = useState<LangCode>("en");
  const [learningLang, setLearningLang] = useState<LangCode>("hy");
  const [isLangLoaded, setIsLangLoaded] = useState(false);

  const [audioEnabled, setAudioEnabled] = useState(true);
  const { stop, isPlaying } = useAudioManager();
  const [wavClient, setWavClient] = useState<WavClient | null>(null);
  const [isWAVAvailable, setIsWAVAvailable] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const speakingLockRef = useRef(false);

  const showGrammar = learningLang === "en";
  const grammarNativeLang: "hy" | "ru" = native === "ru" ? "ru" : "hy";

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

  useEffect(() => {
    if (wavClient && isWAVAvailable) setIsAudioReady(true);
  }, [wavClient, isWAVAvailable]);

  useEffect(() => {
    if (!isWAVAvailable && typeof window !== "undefined") {
      const checkVoices = () => {
        if (window.speechSynthesis.getVoices().length > 0) setIsAudioReady(true);
      };
      window.speechSynthesis.onvoiceschanged = checkVoices;
      checkVoices();
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [isWAVAvailable]);

  useEffect(() => {
    try {
      const config = loadLangConfig();
      if (config) {
        setNative(config.native as LangCode);
        setLearningLang(config.learning as LangCode);
      }
    } catch (e) {
      console.warn("Failed to load lang config", e);
    } finally {
      setIsLangLoaded(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadGrammarUnits()
      .then((units) => {
        if (!cancelled) setGrammarUnits(units);
      })
      .catch((e) => console.warn("grammar load failed", e));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (moduleId && isLangLoaded) {
      const found = VISUAL_LESSONS.find((l) => l.id === moduleId);
      if (found) setSelectedLesson(found);
    }
  }, [moduleId, isLangLoaded]);

  const playAudioWithFemaleVoice = useCallback(
    (text: string, lang: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (typeof window === "undefined" || !window.speechSynthesis) {
          reject(new Error("Speech synthesis not supported"));
          return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        if (lang === "hy") utterance.rate = 1.5;
        else if (lang === "en") utterance.rate = 1.1;
        else utterance.rate = 1.15;
        utterance.pitch = 1.3;
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const femaleVoiceNames = [
          "Samantha",
          "Google UK English Female",
          "Karen",
          "Zira",
          "Alice",
          "Victoria",
          "Emma",
          "Susan",
          "Tessa",
          "Google русский",
          "Anna",
          "Elena",
          "Katya",
          "Marina",
          "Natalia",
          "Alena",
          "Ani",
          "Google Հայերեն",
          "Armine",
          "Lusine",
        ];

        let selected: SpeechSynthesisVoice | null = null;
        for (const name of femaleVoiceNames) {
          const found = voices.find(
            (v) =>
              v.lang.startsWith(lang) &&
              v.name.toLowerCase() === name.toLowerCase()
          );
          if (found) {
            selected = found;
            break;
          }
        }
        if (!selected) {
          for (const name of femaleVoiceNames) {
            const found = voices.find(
              (v) =>
                v.lang.startsWith(lang) &&
                v.name.toLowerCase().includes(name.toLowerCase())
            );
            if (found) {
              selected = found;
              break;
            }
          }
        }
        if (!selected) {
          selected =
            voices.find(
              (v) =>
                v.lang.startsWith(lang) &&
                (v.name.toLowerCase().includes("female") ||
                  v.name.toLowerCase().includes("samantha") ||
                  v.name.toLowerCase().includes("zira") ||
                  v.name.toLowerCase().includes("karen") ||
                  v.name.toLowerCase().includes("anna"))
            ) ?? null;
        }
        if (selected) utterance.voice = selected;
        else utterance.pitch = 1.5;

        utterance.onend = () => resolve();
        utterance.onerror = (e) => reject(e);
        window.speechSynthesis.speak(utterance);
      });
    },
    []
  );

  const playAudioWithFallback = useCallback(
    async (text: string, lang: string = "hy", type: "prompt" | "answer" = "prompt") => {
      if (!audioEnabled || !text) return;
      text = sanitizeForTTS(text);
      if (!text) return;
      const pairKey = getPairKey(native, learningLang);

      if (type === "prompt") {
        if (lang === "hy") {
          if (wavClient && isWAVAvailable) {
            try {
              await wavClient.playPrompt(text, pairKey, "Ani");
              return;
            } catch (error: any) {
              if (
                error.message === "AUTOPLAY_BLOCKED" ||
                error.name === "NotAllowedError"
              ) {
                try {
                  await playAudioWithFemaleVoice(text, "hy");
                  return;
                } catch {}
              }
            }
          }
          try {
            await playAudioWithFemaleVoice(text, "hy");
            return;
          } catch {}
        }
        try {
          await playAudioWithFemaleVoice(text, lang);
        } catch {}
      }

      if (type === "answer") {
        if (learningLang === "hy" && wavClient && isWAVAvailable) {
          try {
            await wavClient.playAnswer(text, pairKey, "Ani");
            return;
          } catch (error: any) {
            if (
              error.message === "AUTOPLAY_BLOCKED" ||
              error.name === "NotAllowedError"
            ) {
              try {
                await playAudioWithFemaleVoice(text, "hy");
                return;
              } catch {}
            }
          }
        }
        try {
          await playAudioWithFemaleVoice(text, learningLang);
        } catch {}
      }
    },
    [wavClient, isWAVAvailable, native, learningLang, playAudioWithFemaleVoice, audioEnabled]
  );

  const handleSpeak = useCallback(
    async (text: string, lang: string = "hy", type: "prompt" | "answer" = "prompt") => {
      if (!text || !audioEnabled) return;
      if (speakingLockRef.current) {
        if (typeof window !== "undefined") window.speechSynthesis?.cancel();
        speakingLockRef.current = false;
        return;
      }
      speakingLockRef.current = true;
      try {
        await playAudioWithFallback(text, lang, type);
      } catch (e) {
        console.warn("handleSpeak error:", e);
      } finally {
        speakingLockRef.current = false;
      }
    },
    [playAudioWithFallback, audioEnabled]
  );

  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => !prev);
    if (audioEnabled) stop();
  }, [audioEnabled, stop]);

  const filteredLessons = useMemo(
    () =>
      VISUAL_LESSONS.filter((l) => {
        const matchesSearch =
          l.title.hy.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.title.en.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      }),
    [searchQuery]
  );

  const filteredGrammarUnits = useMemo(() => {
    if (!showGrammar) return [];
    if (!searchQuery.trim()) return grammarUnits;
    const q = searchQuery.toLowerCase();
    return grammarUnits.filter((u) => {
      const hy = (u.title?.hy ?? "").toLowerCase();
      const ru = (u.title?.ru ?? "").toLowerCase();
      const en = (u.title?.en ?? "").toLowerCase();
      return hy.includes(q) || ru.includes(q) || en.includes(q);
    });
  }, [grammarUnits, searchQuery, showGrammar]);

  const handleBack = () => {
    if (selectedGrammarUnit) {
      setSelectedGrammarUnit(null);
      return;
    }
    if (selectedLesson) {
      setSelectedLesson(null);
      router.replace("/visual-lessons");
    } else {
      router.push("/world");
    }
  };

  if (!isLangLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  const isDetailView = !!selectedLesson || !!selectedGrammarUnit;

  // Build snake nodes from visual lessons
  const snakeNodes: SnakeNode[] = filteredLessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    icon: lesson.icon,
    subtitle: `${lesson.items.length} cards`,
    onClick: () => setSelectedLesson(lesson),
  }));

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent text-gray-900 dark:text-white pb-20">
      <header className="sticky top-0 z-40 bg-white/60 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-white/5 shadow-sm">
        <div className="container-main py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-xl font-black flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                  <Sparkles size={20} className="text-amber-500" /> Վիզուալ Դասեր
                </h1>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  {native.toUpperCase()} → {learningLang.toUpperCase()}
                </p>
              </div>
            </div>

            <button
              onClick={toggleAudio}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
                audioEnabled
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"
                  : "bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30"
              }`}
              title={audioEnabled ? "Անջատել ձայնը" : "Միացնել ձայնը"}
            >
              {audioEnabled ? <Volume2 size={14} /> : <VolumeOff size={14} />}
              <span className="hidden sm:inline">
                {audioEnabled ? "Ձայնը միացված է" : "Ձայնը անջատված է"}
              </span>
            </button>
          </div>

          {!isDetailView && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Փնտրել դասեր..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* ─── TABS ─── */}
          {!isDetailView && showGrammar && (
            <div className="flex gap-2">
              <button
                onClick={() => setTab("practice")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  tab === "practice"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700"
                }`}
              >
                <BookOpen size={16} /> Practice
              </button>
              <button
                onClick={() => setTab("grammar")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  tab === "grammar"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-500/30"
                    : "bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700"
                }`}
              >
                <GraduationCap size={16} /> Grammar
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="container-main py-6">
        <AnimatePresence mode="wait">
          {selectedGrammarUnit ? (
            <motion.div
              key="grammar-detail"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <GrammarUnitPlayer
                unit={selectedGrammarUnit}
                nativeLang={grammarNativeLang}
                onBack={handleBack}
              />
            </motion.div>
          ) : !selectedLesson ? (
            <motion.div
              key={`list-${tab}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {/* ─── PRACTICE TAB → SNAKE ─── */}
              {tab === "practice" && (
                <div className="rounded-3xl p-5 bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10">
                  {snakeNodes.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 py-8">
                      Դասեր չեն գտնվել
                    </p>
                  ) : (
                    <SnakePath
                      nodes={snakeNodes}
                      native={native}
                      colorFrom="#3b82f6"
                      colorTo="#8b5cf6"
                    />
                  )}
                </div>
              )}

              {/* ─── GRAMMAR TAB → CARD GRID ─── */}
              {tab === "grammar" && showGrammar && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredGrammarUnits.length === 0 ? (
                    <p className="col-span-full text-center text-sm text-gray-500 py-8">
                      Քերականական միավորներ չեն գտնվել
                    </p>
                  ) : (
                    filteredGrammarUnits.map((unit) => (
                      <GrammarUnitCard
                        key={unit.id}
                        unit={unit}
                        nativeLang={grammarNativeLang}
                        onClick={() => setSelectedGrammarUnit(unit)}
                      />
                    ))
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col items-center"
            >
              <div className="text-center mb-10">
                <div className="text-7xl mb-4 drop-shadow-lg">
                  {selectedLesson.icon}
                </div>
                <h2 className="text-4xl font-black mb-2">
                  {selectedLesson.title[learningLang] || selectedLesson.title.en}
                </h2>
                <p className="text-gray-500 font-medium text-lg">
                  {selectedLesson.title[native] || selectedLesson.title.en}
                </p>
              </div>

              <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedLesson.items.map((item, idx) => {
                  const targetWord: string =
                    (item as any)[learningLang] || item.en || "";
                  const nativeWord: string =
                    (item as any)[native] || item.en || "";

                  const targetExample = (item as any)[`example_${learningLang}`];
                  const nativeExample = (item as any)[`example_${native}`];

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <GlassCard
                        variant="premium"
                        className={`p-5 h-full flex flex-col justify-between border-l-4 border-l-${
                          selectedLesson.gradient.split("-")[1]
                        }-500 bg-white/70 dark:bg-gray-800/70`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="text-3xl drop-shadow-sm">
                                  {item.emoji}
                                </span>
                                {item.highlightWord && learningLang === "en" ? (
                                  <span>
                                    {targetWord
                                      .split(item.highlightWord)
                                      .map(
                                        (
                                          part: string,
                                          i: number,
                                          arr: string[]
                                        ) => (
                                          <span key={i}>
                                            {part}
                                            {i < arr.length - 1 && (
                                              <span className="text-blue-600 dark:text-blue-400 underline decoration-2">
                                                {item.highlightWord}
                                              </span>
                                            )}
                                          </span>
                                        )
                                      )}
                                  </span>
                                ) : (
                                  targetWord
                                )}
                              </p>
                              <p className="text-base text-gray-700 dark:text-gray-300 font-bold mt-1">
                                {nativeWord}
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                handleSpeak(targetWord, learningLang, "answer")
                              }
                              disabled={isPlaying}
                              className={`p-3 rounded-full transition-all ml-2 shadow-sm ${
                                isPlaying
                                  ? "bg-amber-500/20 text-amber-500 animate-pulse"
                                  : "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
                              }`}
                            >
                              {isPlaying ? (
                                <Loader2 size={20} className="animate-spin" />
                              ) : (
                                <Volume2 size={20} />
                              )}
                            </button>
                          </div>

                          {targetExample && (
                            <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
                              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                📖 {targetExample}
                              </p>
                              {nativeExample && (
                                <p className="text-xs text-emerald-600/80 dark:text-emerald-300/80 mt-1">
                                  {nativeExample}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="mt-12 px-10 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black shadow-xl shadow-purple-500/30 flex items-center gap-2"
              >
                <ArrowLeft size={20} /> Վերադառնալ ցանկին
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function VisualLessonsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <VisualLessonsContent />
    </Suspense>
  );
}