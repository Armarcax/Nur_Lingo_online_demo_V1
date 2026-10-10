// src/components/drive-test/QuestionCard.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Lightbulb,
  BookOpen,
  AlertCircle,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { LangCode } from "@/lib/i18n/multilingual";
import { getWavClient, WavClient } from "@/lib/audio/WavClient";

export interface DriveQuestion {
  id: string;
  testNumber: number;
  sourceQuestionNumber: number;
  category: string;
  prompt: Record<LangCode, string>;
  options: Record<LangCode, string[]>;
  correctIndex: number;
  imageUrl: string | null;
  imageFilename: string | null;
  page: number;
}

interface ExplanationData {
  title: string;
  reason: string;
  rule: string;
  tip: string;
  example: string;
}

interface QuestionCardProps {
  question: DriveQuestion;
  index: number;
  total: number;
  mode: "test" | "study";
  native: LangCode;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  showExplanation?: boolean;
}

// ─── TTS SANITIZER ────────────────────────────────────────────────
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

// ─── COMPONENT ─────────────────────────────────────────────────────

export function QuestionCard({
  question,
  index,
  total,
  mode,
  native,
  onAnswer,
  onNext,
  showExplanation = true,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [showExplain, setShowExplain] = useState(false);

  // ═══════════════════════════════════════════════════════════════
  // ─── AUDIO SYSTEM (learn/page.tsx-ի հետ սինխրոն) ───────────────
  // ═══════════════════════════════════════════════════════════════

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wavClient, setWavClient] = useState<WavClient | null>(null);
  const [isWAVAvailable, setIsWAVAvailable] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);

  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Drive-test-ը միշտ native → hy
  const pairKey = `${native}-hy`;

  // ─── WAV init ────────────────────────────────────────────────
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
    if (wavClient && isWAVAvailable) {
      setIsAudioReady(true);
    }
  }, [wavClient, isWAVAvailable]);

  useEffect(() => {
    if (!isWAVAvailable && typeof window !== "undefined") {
      const checkVoices = () => {
        if (window.speechSynthesis.getVoices().length > 0) {
          setIsAudioReady(true);
        }
      };
      window.speechSynthesis.onvoiceschanged = checkVoices;
      checkVoices();
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [isWAVAvailable]);

  // Fallback: 2 վրկ-ից հետո, եթե ձայներ դեռ չեն բեռնվել, միևնույն է թույլ տանք աուդիո
  useEffect(() => {
    if (isAudioReady) return;
    const t = setTimeout(() => setIsAudioReady(true), 2000);
    return () => clearTimeout(t);
  }, [isAudioReady]);

  // ─── Female browser TTS ─────────────────────────────────────
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
          "Samantha", "Google UK English Female", "Karen", "Zira",
          "Alice", "Victoria", "Emma", "Susan", "Tessa",
          "Google русский", "Anna", "Elena", "Katya", "Marina", "Natalia", "Alena",
          "Ani", "Google Հայերեն", "Armine", "Lusine",
        ];

        let pickedVoice: SpeechSynthesisVoice | null = null;

        for (const name of femaleVoiceNames) {
          const found = voices.find(
            (v) =>
              v.lang.startsWith(lang) &&
              v.name.toLowerCase() === name.toLowerCase()
          );
          if (found) { pickedVoice = found; break; }
        }

        if (!pickedVoice) {
          for (const name of femaleVoiceNames) {
            const found = voices.find(
              (v) =>
                v.lang.startsWith(lang) &&
                v.name.toLowerCase().includes(name.toLowerCase())
            );
            if (found) { pickedVoice = found; break; }
          }
        }

        if (!pickedVoice) {
          pickedVoice =
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

        if (pickedVoice) {
          utterance.voice = pickedVoice;
          console.log(`🎤 Female voice: ${pickedVoice.name}`);
        } else {
          utterance.pitch = 1.5;
          console.warn(`⚠️ No female voice found, using high pitch (1.5)`);
        }

        utterance.onend = () => resolve();
        utterance.onerror = (e) => {
          console.error("Speech error:", e);
          reject(e);
        };

        window.speechSynthesis.speak(utterance);
      });
    },
    []
  );

  // ─── Master player (WAV → EN/RU API → browser TTS) ──────────
  const playAudioWithFallback = useCallback(
    async (
      rawText: string,
      lang: string = "hy",
      type: "prompt" | "answer" = "prompt"
    ) => {
      if (!audioEnabled) {
        console.log(`🔇 Audio disabled, skipping: "${rawText}"`);
        return;
      }
      if (!rawText) return;

      const text = sanitizeForTTS(rawText);
      if (!text) return;

      console.log(`🔊 Playing ${type}: "${text}" (${lang})`);

      // ═══════════ PROMPT ═══════════
      if (type === "prompt") {
        if (lang === "hy") {
          if (wavClient && isWAVAvailable) {
            try {
              await wavClient.playPrompt(text, pairKey, "Ani");
              console.log(`✅ WAV (Ani) for prompt (hy): ${text}`);
              return;
            } catch (error: any) {
              if (
                error?.message === "AUTOPLAY_BLOCKED" ||
                error?.name === "NotAllowedError"
              ) {
                console.log("⏸️ WAV autoplay blocked, falling back to TTS");
                try {
                  await playAudioWithFemaleVoice(text, "hy");
                  return;
                } catch (ttsError) {
                  console.warn("TTS also failed:", ttsError);
                }
              } else {
                console.warn("WAV failed:", error);
              }
            }
          }

          try {
            await playAudioWithFemaleVoice(text, "hy");
            return;
          } catch (error) {
            console.warn("Female TTS failed:", error);
          }
        }

        if (lang === "en") {
          try {
            const response = await fetch("/api/generate-tts-en", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text }),
            });
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.audioUrl) {
                const audio = new Audio(data.audioUrl);
                await audio.play();
                console.log(`✅ English TTS for prompt: ${text}`);
                return;
              }
            }
          } catch (error) {
            console.warn("English TTS failed:", error);
          }
        }

        if (lang === "ru") {
          try {
            const response = await fetch("/api/generate-tts-ru", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text }),
            });
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.audioUrl) {
                const audio = new Audio(data.audioUrl);
                await audio.play();
                console.log(`✅ Russian TTS for prompt: ${text}`);
                return;
              }
            }
          } catch (error) {
            console.warn("Russian TTS failed:", error);
          }
        }

        try {
          await playAudioWithFemaleVoice(text, lang);
          return;
        } catch (error) {
          console.warn("TTS failed:", error);
        }
      }

      // ═══════════ ANSWER ═══════════
      // Drive-test-ի պատասխանները միշտ հայերեն են
      if (type === "answer") {
        if (wavClient && isWAVAvailable) {
          try {
            await wavClient.playAnswer(text, pairKey, "Ani");
            console.log(`✅ WAV (Ani) for answer (${pairKey}): ${text}`);
            return;
          } catch (error: any) {
            if (
              error?.message === "AUTOPLAY_BLOCKED" ||
              error?.name === "NotAllowedError"
            ) {
              console.log("⏸️ WAV autoplay blocked for answer, falling back to TTS");
              try {
                await playAudioWithFemaleVoice(text, "hy");
                return;
              } catch (ttsError) {
                console.warn("TTS also failed:", ttsError);
              }
            } else {
              console.warn("WAV failed:", error);
            }
          }
        }

        try {
          await playAudioWithFemaleVoice(text, "hy");
          return;
        } catch (error) {
          console.warn("TTS failed:", error);
        }
      }

      console.warn(`❌ No audio available for ${type}: "${text}"`);
      throw new Error("AUDIO_FAILED");
    },
    [wavClient, isWAVAvailable, pairKey, playAudioWithFemaleVoice, audioEnabled]
  );

  // ─── handleSpeak — wrapper ──────────────────────────────────
  const handleSpeak = useCallback(
    async (
      text: string,
      lang: string = "hy",
      type: "prompt" | "answer" = "prompt"
    ) => {
      if (!text || !audioEnabled) return;

      if (isPlaying) {
        if (typeof window !== "undefined") {
          window.speechSynthesis?.cancel();
        }
        setIsPlaying(false);
        return;
      }

      setIsPlaying(true);
      try {
        await playAudioWithFallback(text, lang, type);
      } catch (e) {
        console.warn("handleSpeak error:", e);
      } finally {
        setIsPlaying(false);
      }
    },
    [isPlaying, playAudioWithFallback, audioEnabled]
  );

  // ─── toggle audio ──────────────────────────────────────────
  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => {
      if (prev) {
        if (typeof window !== "undefined") {
          window.speechSynthesis?.cancel();
        }
        setIsPlaying(false);
      }
      return !prev;
    });
  }, []);

  // ─── stop everything ───────────────────────────────────────
  const stop = useCallback(() => {
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
    setIsPlaying(false);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // ─── QUESTION STATE ─────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════

  const prompt = question.prompt[native] || question.prompt.hy || "";
  const options = question.options[native] || question.options.hy || [];
  const correct = question.correctIndex;
  const isCorrect = submitted && selected === correct;

  // Reset on question change
  useEffect(() => {
    setSelected(null);
    setSubmitted(false);
    setExplanation(null);
    setShowExplain(false);
    stop();
  }, [question.id, stop]);

  // Study mode auto-answer
  useEffect(() => {
    if (mode === "study") {
      setSelected(correct);
      setSubmitted(true);
      setShowExplain(true);
    }
  }, [mode, correct, question.id]);

  // ─── AUTO-PLAY PROMPT ──────────────────────────────────────
  useEffect(() => {
    if (!audioEnabled) return;
    if (!prompt) return;
    if (!isAudioReady) return;

    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }

    autoPlayTimeoutRef.current = setTimeout(() => {
      playAudioWithFallback(prompt, native, "prompt").catch(() => {});
    }, 300);

    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, [question.id, prompt, native, isAudioReady, playAudioWithFallback, audioEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  // ─── INTERACTION ───────────────────────────────────────────

  const handleSpeakQuestion = useCallback(() => {
    if (!audioEnabled || !prompt) return;
    void handleSpeak(prompt, native, "prompt");
  }, [audioEnabled, prompt, native, handleSpeak]);

  const handleSpeakOption = useCallback(
    (idx: number) => {
      if (!audioEnabled || !options[idx]) return;
      void handleSpeak(options[idx], native, "answer");
    },
    [audioEnabled, options, native, handleSpeak]
  );

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelected(idx);
    if (audioEnabled) {
      void handleSpeak(options[idx], native, "answer");
    }
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    onAnswer(selected === correct);
  };

  const handleExplain = async () => {
    if (explanation) {
      setShowExplain(true);
      return;
    }
    setShowExplain(true);
    setLoadingExplain(true);

    try {
      const res = await fetch("/api/explain-driving", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: prompt,
          correctAnswer: options[correct] || "",
          nativeLang: native,
          category: question.category,
          allOptions: options,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setExplanation(data);
      }
    } catch (e) {
      console.error("Explain failed:", e);
    } finally {
      setLoadingExplain(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ─── RENDER ─────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-500">
          #{index + 1} / {total}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className={`p-1.5 rounded-lg transition-colors ${
              audioEnabled
                ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                : "bg-gray-500/20 text-gray-500 hover:bg-gray-500/30"
            }`}
            title={audioEnabled ? "Audio ON" : "Audio OFF"}
            aria-label={audioEnabled ? "Mute audio" : "Unmute audio"}
          >
            {audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-500 uppercase">
            {question.category.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Image */}
      {question.imageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-2xl overflow-hidden bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-white/10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.imageUrl}
            alt={prompt}
            className="w-full max-h-[300px] object-contain"
            loading="lazy"
          />
        </motion.div>
      )}

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-4 p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10"
      >
        <div className="flex items-start gap-3">
          <button
            onClick={handleSpeakQuestion}
            disabled={!audioEnabled}
            className={`flex-shrink-0 p-2 rounded-xl transition-all ${
              !audioEnabled
                ? "bg-gray-500/10 text-gray-400 cursor-not-allowed"
                : isPlaying
                ? "bg-emerald-500 text-white animate-pulse"
                : "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
            }`}
            aria-label="Play question"
            title="Play question"
          >
            {isPlaying ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Volume2 size={18} />
            )}
          </button>

          <p className="font-bold text-gray-900 dark:text-white leading-relaxed flex-1">
            {prompt}
          </p>
        </div>
      </motion.div>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrectOpt = idx === correct;
          const showCorrect = submitted && isCorrectOpt;
          const showWrong = submitted && isSelected && !isCorrectOpt;

          let cls =
            "w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 ";

          if (showCorrect) cls += "border-emerald-500 bg-emerald-500/10";
          else if (showWrong) cls += "border-red-500 bg-red-500/10";
          else if (isSelected && !submitted) cls += "border-purple-500 bg-purple-500/10";
          else
            cls +=
              "border-white/20 dark:border-white/10 bg-white/30 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/10";

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + idx * 0.03 }}
              className={cls}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isPlaying) stop();
                  else handleSpeakOption(idx);
                }}
                disabled={!audioEnabled}
                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  !audioEnabled
                    ? "bg-gray-500/10 text-gray-400 cursor-not-allowed"
                    : isPlaying
                    ? "bg-emerald-500 text-white animate-pulse"
                    : showCorrect
                    ? "bg-emerald-500 text-white"
                    : showWrong
                    ? "bg-red-500 text-white"
                    : isSelected
                    ? "bg-purple-500 text-white"
                    : "bg-white/60 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-blue-500/20 hover:text-blue-500"
                }`}
                aria-label={`Play option ${String.fromCharCode(65 + idx)}`}
              >
                {isPlaying ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : showCorrect ? (
                  "✓"
                ) : showWrong ? (
                  "✕"
                ) : (
                  String.fromCharCode(65 + idx)
                )}
              </button>

              <button
                onClick={() => handleSelect(idx)}
                disabled={submitted && mode === "test"}
                className="flex-1 text-left"
              >
                <span className="text-sm text-gray-900 dark:text-white leading-relaxed">
                  {opt}
                </span>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 p-4 rounded-xl border ${
              isCorrect
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle size={20} className="text-emerald-500" />
              ) : (
                <XCircle size={20} className="text-red-500" />
              )}
              <span className="font-bold text-gray-900 dark:text-white">
                {isCorrect
                  ? native === "hy"
                    ? "✅ Ճիշտ է!"
                    : native === "ru"
                    ? "✅ Правильно!"
                    : "✅ Correct!"
                  : native === "hy"
                  ? "❌ Սխալ է"
                  : native === "ru"
                  ? "❌ Неправильно"
                  : "❌ Wrong"}
              </span>
            </div>

            {!isCorrect && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-bold">
                  {native === "hy"
                    ? "Ճիշտ պատասխան. "
                    : native === "ru"
                    ? "Правильный ответ: "
                    : "Correct answer: "}
                </span>
                {options[correct]}
              </p>
            )}

            {showExplanation && !showExplain && (
              <button
                onClick={handleExplain}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-500 text-xs font-bold transition"
              >
                <Sparkles size={12} />
                {native === "hy" ? "Ինչու՞" : native === "ru" ? "Почему?" : "Why?"}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation */}
      <AnimatePresence>
        {showExplain && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-3">
              {loadingExplain ? (
                <div className="flex items-center justify-center gap-2 py-6">
                  <Loader2 size={20} className="animate-spin text-purple-500" />
                  <span className="text-sm text-purple-500">
                    {native === "hy"
                      ? "Նուռիկը մտածում է..."
                      : native === "ru"
                      ? "Нурик думает..."
                      : "Nuri is thinking..."}
                  </span>
                </div>
              ) : explanation ? (
                <>
                  {explanation.title && (
                    <h4 className="font-black text-purple-500 text-sm flex items-center gap-2">
                      <Sparkles size={14} />
                      {explanation.title}
                    </h4>
                  )}
                  {explanation.reason && (
                    <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                      {explanation.reason}
                    </p>
                  )}
                  {explanation.rule && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">
                        📌 Rule
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {explanation.rule}
                      </p>
                    </div>
                  )}
                  {explanation.tip && (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-2">
                      <Lightbulb size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-900 dark:text-white">
                        {explanation.tip}
                      </p>
                    </div>
                  )}
                  {explanation.example && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex gap-2">
                      <BookOpen size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-900 dark:text-white italic">
                        {explanation.example}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertCircle size={16} />
                  <span className="text-sm">
                    {native === "hy"
                      ? "Չհաջողվեց բացատրություն ստանալ"
                      : native === "ru"
                      ? "Не удалось получить объяснение"
                      : "Could not get explanation"}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-3">
        {!submitted && mode === "test" && (
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition"
          >
            {native === "hy" ? "Ստուգել" : native === "ru" ? "Проверить" : "Check"}
          </button>
        )}

        {submitted && (
          <button
            onClick={onNext}
            className="flex-1 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold transition"
          >
            {index + 1 === total
              ? native === "hy"
                ? "🎉 Ավարտել"
                : native === "ru"
                ? "🎉 Завершить"
                : "🎉 Finish"
              : native === "hy"
              ? "Հաջորդ →"
              : native === "ru"
              ? "Далее →"
              : "Next →"}
          </button>
        )}
      </div>
    </div>
  );
}