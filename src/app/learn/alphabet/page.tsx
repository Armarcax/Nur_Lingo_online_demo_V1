// src/app/learn/alphabet/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  BookOpen,
  CheckCircle,
  XCircle,
  Trophy,
  Sparkles,
  Play,
  Delete,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ALPHABETS,
  type AlphabetLesson,
  type AlphabetLetter,
} from "@/lib/content/alphabets";
import { GlassCard } from "@/components/ui/glass-card";
import { loadLangConfig, type LangCode } from "@/lib/i18n/index";
import { useAudioManager } from "@/lib/hooks/useAudioManager";
import { getWavClient, WavClient } from "@/lib/audio/WavClient";
import {
  PageShell,
  PageTabs,
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
  theory: { en: "Theory", hy: "Տեսություն", ru: "Теория" },
  letters: { en: "Letters", hy: "Տառեր", ru: "Буквы" },
  spelling: { en: "Spelling", hy: "Գրագիտություն", ru: "Правописание" },
  write_word: { en: "Write the word", hy: "Գրիր բառը", ru: "Напишите слово" },
  hint: { en: "Hint", hy: "Ակնարկ", ru: "Подсказка" },
  next_word: {
    en: "Next word",
    hy: "Հաջորդ բառը",
    ru: "Следующее слово",
  },
  correct: {
    en: "Correct! +10 points",
    hy: "Ճիշտ է: +10 միավոր",
    ru: "Правильно! +10 очков",
  },
  incorrect: {
    en: "Incorrect! Try again.",
    hy: "Սխալ է: Փորձիր նորից",
    ru: "Ошибка! Попробуйте еще раз.",
  },
  listen_letter: {
    en: "Listen to the letter",
    hy: "Լսել տառի անվանումը",
    ru: "Слушать букву",
  },
  listen_word: {
    en: "Listen to the word",
    hy: "Լսել բառը",
    ru: "Слушать слово",
  },
  letter_count: { en: "letters", hy: "տառ", ru: "букв" },
  subtitle: {
    en: "Learn the alphabet step by step",
    hy: "Սովորիր այբուբենը քայլ առ քայլ",
    ru: "Изучай алфавит шаг за шагом",
  },
};

// ─── MAIN ─────────────────────────────────────────────────────────────

export default function AlphabetLessonPage() {
  const router = useRouter();
  const [native, setNative] = useState<LangCode>("hy");
  const [learningLang, setLearningLang] = useState<LangCode>("en");

  const [selectedAlphabet, setSelectedAlphabet] = useState<AlphabetLesson>(
    ALPHABETS[0]
  );
  const [activeTab, setActiveTab] = useState<"theory" | "letters" | "spelling">(
    "theory"
  );

  // Spelling game
  const [currentLetter, setCurrentLetter] = useState<AlphabetLetter | null>(
    null
  );
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [gameState, setGameState] = useState<"idle" | "correct" | "incorrect">(
    "idle"
  );
  const [score, setScore] = useState(0);

  const { stop, isPlaying } = useAudioManager();
  const [wavClient, setWavClient] = useState<WavClient | null>(null);
  const [isWAVAvailable, setIsWAVAvailable] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const speakingLockRef = useRef(false);

  const t_ui = (key: keyof typeof UI_TEXT) =>
    UI_TEXT[key][native] || UI_TEXT[key].en;

  // ─── LOAD LANG CONFIG ───
  useEffect(() => {
    try {
      const config = loadLangConfig();
      if (config) {
        setNative(config.native as LangCode);
        setLearningLang(config.learning as LangCode);
        const matchedAlphabet = ALPHABETS.find(
          (a) => a.languageCode === config.learning
        );
        if (matchedAlphabet) setSelectedAlphabet(matchedAlphabet);
      }
    } catch (e) {}
  }, []);

  // ─── INIT WAV ───
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
          selected = voices.find((v) => v.lang.startsWith(lang)) ?? null;
        }
        if (selected) utterance.voice = selected;

        utterance.onend = () => resolve();
        utterance.onerror = (e) => reject(e);
        window.speechSynthesis.speak(utterance);
      });
    },
    []
  );

  const playAudioWithFallback = useCallback(
    async (
      text: string,
      lang: string = "hy",
      type: "prompt" | "answer" = "prompt"
    ) => {
      if (!text) return;
      text = sanitizeForTTS(text);
      if (!text) return;
      const pairKey = getPairKey(native, learningLang);

      if (lang === "hy" && wavClient && isWAVAvailable) {
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
        await playAudioWithFemaleVoice(text, lang);
      } catch (e) {
        console.warn("TTS fallback failed:", e);
      }
    },
    [wavClient, isWAVAvailable, native, learningLang, playAudioWithFemaleVoice]
  );

  const handleSpeak = useCallback(
    async (
      text: string,
      lang: string = "hy",
      type: "prompt" | "answer" = "prompt"
    ) => {
      if (!text) return;
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
    [playAudioWithFallback]
  );

  // ─── SPELLING GAME ───
  const startSpellingGame = useCallback(() => {
    if (!selectedAlphabet.letters.length) return;
    const randomIndex = Math.floor(
      Math.random() * selectedAlphabet.letters.length
    );
    setCurrentLetter(selectedAlphabet.letters[randomIndex]);
    setSelectedLetters([]);
    setGameState("idle");
    setActiveTab("spelling");
  }, [selectedAlphabet]);

  const handleLetterClick = (letter: string) => {
    if (gameState !== "idle" || !currentLetter) return;
    const newSelected = [...selectedLetters, letter];
    setSelectedLetters(newSelected);

    const targetWord = currentLetter.example.word.toUpperCase().split("");
    if (newSelected.length === targetWord.length) {
      if (newSelected.join("") === targetWord.join("")) {
        setGameState("correct");
        setScore((prev) => prev + 10);
        handleSpeak(
          currentLetter.example.word,
          selectedAlphabet.languageCode
        );
      } else {
        setGameState("incorrect");
      }
    }
  };

  const removeLastLetter = () => {
    if (gameState !== "idle") return;
    setSelectedLetters((prev) => prev.slice(0, -1));
  };

  const theory = selectedAlphabet.theory;
  const spellingLetters = selectedAlphabet.letters.map((l) => l.capital);

  // ─── TABS CONFIG ───
  const tabs = [
    { id: "theory", label: t_ui("theory"), icon: <BookOpen size={16} /> },
    { id: "letters", label: t_ui("letters"), icon: <Sparkles size={16} /> },
    { id: "spelling", label: t_ui("spelling"), icon: <Play size={16} /> },
  ];

  // ─── RENDER ───
  return (
    <PageShell
      title={selectedAlphabet.title[native] || selectedAlphabet.title.en}
      subtitle={`${selectedAlphabet.letterCount} ${t_ui("letter_count")} · ${t_ui("subtitle")}`}
      icon={<span className="text-lg">{selectedAlphabet.icon}</span>}
      backHref="/world"
      maxWidth="4xl"
      actions={
        <StatPill
          icon={<Trophy size={13} />}
          value={score}
          color="amber"
        />
      }
    >
      {/* ─── ALPHABET HEADER CARD ─── */}
      <div className="flex justify-center mb-4">
        <div className="px-6 py-3 rounded-2xl border-2 border-white/20 dark:border-white/10 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm flex items-center gap-3">
          <span className="text-3xl">{selectedAlphabet.icon}</span>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {selectedAlphabet.title[native]}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedAlphabet.letterCount} {t_ui("letter_count")}
            </p>
          </div>
        </div>
      </div>

      {/* ─── TABS ─── */}
      <PageTabs
        tabs={tabs}
        value={activeTab}
        onChange={(id) => {
          if (id === "spelling" && !currentLetter) startSpellingGame();
          else setActiveTab(id as any);
        }}
        className="mb-6"
      />

      {/* ─── CONTENT ─── */}
      <AnimatePresence mode="wait">
        {/* ═══ THEORY ═══ */}
        {activeTab === "theory" && (
          <motion.div
            key={`theory-${selectedAlphabet.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <GlassCard variant="premium" className="p-6 md:p-8">
              <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
                {theory.intro[native]}
              </p>
              <div className="space-y-4">
                {theory.facts.map((fact, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 items-start bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl"
                  >
                    <span className="text-blue-500 font-bold text-lg mt-0.5">
                      💡
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {fact[native]}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ═══ LETTERS ═══ */}
        {activeTab === "letters" && (
          <motion.div
            key={`letters-${selectedAlphabet.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {selectedAlphabet.letters.map((letter) => (
                <motion.div
                  key={letter.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-2xl border border-white/20 dark:border-white/5 shadow-sm flex flex-col gap-2"
                >
                  {/* Letter, lowercase, name */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-gray-900 dark:text-white">
                        {letter.capital}
                      </span>
                      <span className="text-xl font-bold text-gray-500 dark:text-gray-400">
                        {letter.lowercase}
                      </span>
                      <span className="text-sm font-semibold text-blue-500">
                        ({letter.letterName[selectedAlphabet.languageCode]})
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        handleSpeak(
                          letter.letterName[selectedAlphabet.languageCode],
                          selectedAlphabet.languageCode,
                          "prompt"
                        )
                      }
                      className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      title={t_ui("listen_letter")}
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>

                  <div className="h-px bg-gray-100 dark:bg-gray-700 w-full" />

                  {/* Example word */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {letter.example.word}
                        {selectedAlphabet.languageCode === "en" && (
                          <span className="text-gray-400 font-mono font-normal ml-1">
                            [{letter.example.ipa}]
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {letter.example.translation[native]}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleSpeak(
                          letter.example.word,
                          selectedAlphabet.languageCode,
                          "answer"
                        )
                      }
                      className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                      title={t_ui("listen_word")}
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══ SPELLING GAME ═══ */}
        {activeTab === "spelling" && currentLetter && (
          <motion.div
            key={`spelling-${selectedAlphabet.id}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center"
          >
            <GlassCard variant="premium" className="p-8">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                {t_ui("write_word")}
              </p>
              <p className="text-xs text-gray-400 mb-4">
                {t_ui("hint")}՝ {currentLetter.example.translation[native]}
              </p>

              {/* Letter slots */}
              <div className="flex justify-center gap-2 mb-6 flex-wrap">
                {currentLetter.example.word
                  .toUpperCase()
                  .split("")
                  .map((char, idx) => (
                    <div
                      key={idx}
                      className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-black ${
                        selectedLetters[idx]
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "border-gray-300 dark:border-gray-600 text-gray-300 dark:text-gray-600"
                      }`}
                    >
                      {selectedLetters[idx] || ""}
                    </div>
                  ))}
              </div>

              {/* Action buttons */}
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={() =>
                    handleSpeak(
                      currentLetter.example.word,
                      selectedAlphabet.languageCode,
                      "answer"
                    )
                  }
                  className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                >
                  <Volume2 size={24} />
                </button>
                <button
                  onClick={removeLastLetter}
                  disabled={selectedLetters.length === 0}
                  className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50"
                >
                  <Delete size={24} />
                </button>
              </div>

              {/* Letter keyboard */}
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 max-w-md mx-auto">
                {spellingLetters.map((letter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLetterClick(letter)}
                    className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 text-lg font-bold text-gray-900 dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {/* Result */}
              {gameState === "correct" && (
                <div className="mt-6 p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center gap-2">
                  <CheckCircle size={20} /> {t_ui("correct")}
                </div>
              )}
              {gameState === "incorrect" && (
                <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-700 dark:text-red-300 font-bold flex items-center justify-center gap-2">
                  <XCircle size={20} /> {t_ui("incorrect")}
                </div>
              )}

              {/* Next word */}
              <div className="mt-6">
                <button
                  onClick={startSpellingGame}
                  className="px-6 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors"
                >
                  {t_ui("next_word")}
                </button>
              </div>

              {/* Score */}
              <div className="mt-4 text-lg font-bold text-yellow-500 flex items-center justify-center gap-2">
                <Trophy size={20} /> {score}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}