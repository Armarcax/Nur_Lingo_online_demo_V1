// src/app/grammar/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeOff, ArrowLeft, Search, Sparkles, Loader2, BookOpen, Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";
import { loadLangConfig, type LangCode } from "@/lib/i18n/index";
import { useAudioManager } from "@/lib/hooks/useAudioManager";
import { getWavClient, WavClient } from "@/lib/audio/WavClient";
import type { GrammarUnit } from "@/lib/content/grammar-types";
import { loadGrammarUnits } from "@/lib/content/grammar-loader";
import { GrammarUnitPlayer } from "@/components/GrammarUnitPlayer";
import { GrammarUnitCard } from "@/components/GrammarUnitCard";
import { SnakePath, type SnakeNode } from "@/components/SnakePath";
import { loadMastery, type MasteryEntry } from "@/lib/adaptive/mastery";

const STUDIED_UNITS_KEY = "nur-grammar-studied-v1";

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

const GRAMMAR_PAGE_COPY = {
  hy: {
    pageTitle: "Անգլերենի քերականություն",
    pathTitle: "Քերականության առաջադրանքների ուղի",
    pathDescription: "Օձաձև ուղու վրա միայն առաջադրանքներն են։ Դասի բացատրություններն ու օրինակները՝ ուսումնական բաժնում։",
    studyTab: "Ուսուցում",
    practiceTab: "Առաջադրանքներ",
    studyTitle: "Ուսումնական մաս",
    studyDescription: "Ընտրիր դասերից մեկը և ուսումնասիրիր դրա բացատրությունները, կանոններն ու օրինակները։ Առաջադրանքները առանձին բաժնում են։",
    practiceTitle: "Առաջադրանքների ուղի",
    practiceDescription: "Օձաձև ուղու յուրաքանչյուր հանգույցը մեկ դաս է և բացում է միայն այդ դասի առաջադրանքները։ Նախ ուսումնասիրիր դասը համապատասխան քարտում։",
    studyFirst: "Նախ ուսումնասիրիր այս դասի ուսումնական մասը։",
    search: "Փնտրել դասը կամ թեման…",
    lessons: "դաս",
    started: "սկսված",
    mastered: "յուրացված",
    due: "կրկնության է սպասում",
    dueShort: "կրկնության է սպասում",
    masteredShort: "յուրացված է",
    exercise: "առաջադրանք",
    lastResult: "Վերջին արդյունք",
    loading: "Բեռնվում են քերականության դասերը…",
    noSearch: "Այս որոնմամբ դասեր չեն գտնվել։",
    noLessons: "Քերականության դասերը դեռ հասանելի չեն։",
    wrongTarget: "Այս բաժնի դասերը անգլերենի քերականությունն են։ Ուսուցման լեզուն դարձրու անգլերեն՝ դասերը բացելու համար։",
  },
  ru: {
    pageTitle: "Английская грамматика",
    pathTitle: "Путь заданий по грамматике",
    pathDescription: "На змееобразном пути находятся только задания. Объяснения и примеры — в учебном разделе.",
    studyTab: "Изучение",
    practiceTab: "Задания",
    studyTitle: "Учебный раздел",
    studyDescription: "Выберите один из уроков и изучите объяснения, правила и примеры. Задания находятся в отдельном разделе.",
    practiceTitle: "Путь заданий",
    practiceDescription: "Каждый узел на змееобразном пути соответствует одному уроку и открывает только его задания. Сначала изучите урок в соответствующей карточке.",
    studyFirst: "Сначала изучите материал этого урока.",
    search: "Найти урок или тему…",
    lessons: "уроков",
    started: "начато",
    mastered: "освоено",
    due: "пора повторить",
    dueShort: "пора повторить",
    masteredShort: "освоено",
    exercise: "заданий",
    lastResult: "Последний результат",
    loading: "Загружаются уроки грамматики…",
    noSearch: "По этому запросу уроки не найдены.",
    noLessons: "Уроки грамматики пока недоступны.",
    wrongTarget: "Здесь собраны уроки английской грамматики. Выберите английский как изучаемый язык, чтобы открыть их.",
  },
} as const;

function VisualLessonsContent() {
  const router = useRouter();

  const [selectedGrammarUnit, setSelectedGrammarUnit] = useState<GrammarUnit | null>(null);
  const [playerMode, setPlayerMode] = useState<"study" | "practice">("study");
  const [activeTab, setActiveTab] = useState<"study" | "practice">("study");
  const [studiedUnitIds, setStudiedUnitIds] = useState<Set<string>>(new Set());
  const [grammarUnits, setGrammarUnits] = useState<GrammarUnit[]>([]);
  const [isGrammarLoading, setIsGrammarLoading] = useState(true);
  const [mastery, setMastery] = useState<Record<string, MasteryEntry>>({});
  const [searchQuery, setSearchQuery] = useState("");

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
      .catch((e) => console.warn("grammar load failed", e))
      .finally(() => {
        if (!cancelled) setIsGrammarLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STUDIED_UNITS_KEY) || "[]");
      if (Array.isArray(saved)) setStudiedUnitIds(new Set(saved.filter((id): id is string => typeof id === "string")));
    } catch (error) {
      console.warn("Could not load grammar study progress", error);
    }
  }, []);

  useEffect(() => {
    try {
      setMastery(loadMastery());
    } catch (error) {
      console.warn("Could not load grammar progress", error);
      setMastery({});
    }
  }, [selectedGrammarUnit]);

  const playAudioWithFemaleVoice = useCallback((text: string, lang: string): Promise<void> => {
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
        "Samantha", "Google UK English Female", "Karen", "Zira", "Alice", "Victoria",
        "Emma", "Susan", "Tessa", "Google русский", "Anna", "Elena", "Katya", "Marina",
        "Natalia", "Alena", "Ani", "Google Հայերեն", "Armine", "Lusine",
      ];

      let selected: SpeechSynthesisVoice | null = null;
      for (const name of femaleVoiceNames) {
        const found = voices.find(
          (v) => v.lang.startsWith(lang) && v.name.toLowerCase() === name.toLowerCase()
        );
        if (found) {
          selected = found;
          break;
        }
      }
      if (!selected) {
        for (const name of femaleVoiceNames) {
          const found = voices.find(
            (v) => v.lang.startsWith(lang) && v.name.toLowerCase().includes(name.toLowerCase())
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
  }, []);

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
              if (error.message === "AUTOPLAY_BLOCKED" || error.name === "NotAllowedError") {
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
            if (error.message === "AUTOPLAY_BLOCKED" || error.name === "NotAllowedError") {
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

  const pageCopy = GRAMMAR_PAGE_COPY[grammarNativeLang];
  const filteredGrammarUnits = useMemo(() => {
    if (!showGrammar) return [];
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return grammarUnits;
    return grammarUnits.filter((unit) =>
      [unit.title?.hy, unit.title?.ru, unit.title?.en]
        .some((title) => title?.toLocaleLowerCase().includes(query))
    );
  }, [grammarUnits, searchQuery, showGrammar]);

  const grammarProgress = useMemo(() => {
    const now = Date.now();
    return grammarUnits.reduce((counts, unit) => {
      const entry = mastery[`grammar:${unit.id}`];
      const studied = studiedUnitIds.has(unit.id) || !!entry;
      if (!studied) return counts;
      counts.started += 1;
      if (!entry) return counts;
      if (entry.level >= 5) counts.mastered += 1;
      else if (entry.nextReviewDate <= now) counts.due += 1;
      return counts;
    }, { started: 0, mastered: 0, due: 0 });
  }, [grammarUnits, mastery, studiedUnitIds]);

  const grammarNodes = useMemo<SnakeNode[]>(() => filteredGrammarUnits.map((unit) => {
    const entry = mastery[`grammar:${unit.id}`];
    const level = Math.max(0, Math.min(5, entry?.level ?? 0));
    const crownLevel = level >= 5 ? 3 : level >= 3 ? 2 : level > 0 ? 1 : 0;
    const score = entry ? Math.round(entry.lastScore * 100) : null;
    const isDue = !!entry && entry.level < 5 && entry.nextReviewDate <= Date.now();
    const state = level >= 5 ? pageCopy.masteredShort : isDue ? pageCopy.dueShort : score === null ? "" : `${pageCopy.lastResult}: ${score}%`;
    const exerciseCount = `${unit.exercises.length} ${pageCopy.exercise}`;

    return {
      id: unit.id,
      number: unit.unitNumber,
      title: unit.title,
      icon: level >= 5 ? "👑" : "📘",
      crownLevel,
      subtitle: !studiedUnitIds.has(unit.id) && !entry
        ? `${exerciseCount} · ${pageCopy.studyFirst}`
        : state ? `${exerciseCount} · ${state}` : exerciseCount,
      locked: !studiedUnitIds.has(unit.id) && !entry,
      onClick: () => {
        setPlayerMode("practice");
        setSelectedGrammarUnit(unit);
      },
    };
  }), [filteredGrammarUnits, mastery, pageCopy, studiedUnitIds]);

  const openStudy = (unit: GrammarUnit) => {
    setPlayerMode("study");
    setSelectedGrammarUnit(unit);
  };

  const completeStudy = (unit: GrammarUnit) => {
    const next = new Set(studiedUnitIds);
    next.add(unit.id);
    setStudiedUnitIds(next);
    try {
      window.localStorage.setItem(STUDIED_UNITS_KEY, JSON.stringify([...next]));
    } catch (error) {
      console.warn("Could not save grammar study progress", error);
    }
    setSelectedGrammarUnit(null);
    setActiveTab("study");
  };

  const handleBack = () => {
    if (selectedGrammarUnit) {
      setSelectedGrammarUnit(null);
      return;
    }
    router.push("/world");
  };

  if (!isLangLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  const isDetailView = !!selectedGrammarUnit;

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
                <h1 className="text-xl font-black flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-amber-500 dark:from-rose-400 dark:to-amber-300">
                  <Sparkles size={20} className="text-amber-500" /> {pageCopy.pageTitle}
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
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={pageCopy.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="container-main py-6">
        <AnimatePresence mode="wait">
          {selectedGrammarUnit ? (
            <motion.div
              key="grammar-detail"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >
              <GrammarUnitPlayer
                key={`${selectedGrammarUnit.id}-${playerMode}`}
                unit={selectedGrammarUnit}
                nativeLang={grammarNativeLang}
                onBack={handleBack}
                mode={playerMode}
                onStudyComplete={() => completeStudy(selectedGrammarUnit)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="grammar-path"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="mx-auto max-w-4xl"
            >
              {showGrammar ? (
                <>
                  <section className="mb-6 rounded-3xl border border-rose-100 bg-gradient-to-r from-white via-rose-50 to-amber-50 p-5 shadow-sm dark:border-white/10 dark:from-gray-900 dark:via-rose-950/20 dark:to-amber-950/10 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-black text-gray-900 dark:text-white">{activeTab === "study" ? pageCopy.studyTitle : pageCopy.practiceTitle}</h2>
                        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">{activeTab === "study" ? pageCopy.studyDescription : pageCopy.practiceDescription}</p>
                      </div>
                      <span className="rounded-2xl bg-rose-100 px-3 py-2 text-sm font-black text-rose-800 dark:bg-rose-950/60 dark:text-rose-200">
                        {grammarUnits.length} {pageCopy.lessons}
                      </span>
                    </div>
                    <div className="mt-5">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                        <span>{grammarProgress.started} / {grammarUnits.length} {pageCopy.started}</span>
                        <span className="flex flex-wrap gap-x-4 gap-y-1">
                          <span>{grammarProgress.mastered} {pageCopy.mastered}</span>
                          <span>{grammarProgress.due} {pageCopy.due}</span>
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all" style={{ width: `${grammarUnits.length ? (grammarProgress.started / grammarUnits.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </section>

                  <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-gray-200 bg-white/60 p-1.5 dark:border-gray-700 dark:bg-gray-900/50" role="tablist" aria-label={pageCopy.pathTitle}>
                    <button type="button" role="tab" aria-selected={activeTab === "study"} onClick={() => setActiveTab("study")} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition ${activeTab === "study" ? "bg-rose-600 text-white shadow" : "text-gray-600 hover:bg-white dark:text-gray-300 dark:hover:bg-gray-800"}`}>
                      <BookOpen size={17} />{pageCopy.studyTab}
                    </button>
                    <button type="button" role="tab" aria-selected={activeTab === "practice"} onClick={() => setActiveTab("practice")} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition ${activeTab === "practice" ? "bg-rose-600 text-white shadow" : "text-gray-600 hover:bg-white dark:text-gray-300 dark:hover:bg-gray-800"}`}>
                      <Dumbbell size={17} />{pageCopy.practiceTab}
                    </button>
                  </div>

                  {isGrammarLoading ? (
                    <div className="flex items-center justify-center py-20" role="status" aria-live="polite">
                      <Loader2 className="animate-spin text-rose-500" size={36} />
                      <span className="ml-3 text-sm text-gray-500">{pageCopy.loading}</span>
                    </div>
                  ) : grammarUnits.length === 0 ? (
                    <p className="rounded-2xl border border-gray-200 bg-white/60 p-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">{pageCopy.noLessons}</p>
                  ) : filteredGrammarUnits.length === 0 ? (
                    <p className="rounded-2xl border border-gray-200 bg-white/60 p-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">{pageCopy.noSearch}</p>
                  ) : activeTab === "study" ? (
                    <div role="tabpanel" className="grid gap-4 sm:grid-cols-2">
                      {filteredGrammarUnits.map((unit) => <GrammarUnitCard key={unit.id} unit={unit} nativeLang={grammarNativeLang} onClick={() => openStudy(unit)} />)}
                    </div>
                  ) : (
                    <SnakePath
                      nodes={grammarNodes}
                      native={grammarNativeLang}
                      colorFrom="#e11d48"
                      colorTo="#f59e0b"
                    />
                  )}
                </>
              ) : (
                <p className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm leading-relaxed text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
                  {pageCopy.wrongTarget}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function VisualLessonsPage() {
  return <VisualLessonsContent />;
}
