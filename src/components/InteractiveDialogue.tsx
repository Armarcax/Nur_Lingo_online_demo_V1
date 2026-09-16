// src/components/InteractiveDialogue.tsx

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Volume2,
  Send,
  RefreshCw,
  Sparkles,
  Trophy,
  Eye,
  EyeOff,
  Loader2,
  Music,
} from "lucide-react";
import type { DialogueTurn } from "@/lib/content/database";
import { useAudioManager } from "@/lib/hooks/useAudioManager";
import { getWavClient } from "@/lib/audio/WavClient";
import { useI18n } from "@/hooks/useI18n";

type Language = 'hy' | 'en' | 'ru';
type Gender = 'male' | 'female';

// ─── CHARACTER MAPPING ──────────────────────────────────────────────

const CHARACTER_AVATARS: Record<string, string> = {
  nurik: "🐿️",
  user: "🧑‍🎓",
  anahit: "👩",
  arman: "👨",
  nare: "👧",
  david: "👦",
};

const CHARACTER_NAMES: Record<string, Record<string, string>> = {
  nurik: { hy: "Նուրիկ", en: "Nurik", ru: "Нурик" },
  user: { hy: "Դուք", en: "You", ru: "Вы" },
  anahit: { hy: "Անահիտ", en: "Anahit", ru: "Анаит" },
  arman: { hy: "Արման", en: "Arman", ru: "Арман" },
  nare: { hy: "Նարե", en: "Nare", ru: "Наре" },
  david: { hy: "Դավիթ", en: "David", ru: "Давид" },
};

const MOOD_EMOJIS: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  thinking: "🤔",
  excited: "🤩",
  angry: "😠",
  surprised: "😲",
  neutral: "😐",
  encouraging: "💪",
};

const getMoodEmoji = (mood?: string): string => {
  if (!mood) return "😐";
  return MOOD_EMOJIS[mood] || "😐";
};

// ─── VOICE SELECTOR ──────────────────────────────────────────────────

function VoiceSelector({ 
  language, 
  selectedGender, 
  onSelect,
  disabled 
}: { 
  language: Language;
  selectedGender: Gender;
  onSelect: (gender: Gender) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onSelect('male')}
        disabled={disabled}
        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
          selectedGender === 'male'
            ? 'bg-blue-600 text-white'
            : 'bg-white/20 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        🧑
      </button>
      <button
        onClick={() => onSelect('female')}
        disabled={disabled}
        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
          selectedGender === 'female'
            ? 'bg-pink-600 text-white'
            : 'bg-white/20 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        👩
      </button>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

interface InteractiveDialogueProps {
  turns?: DialogueTurn[];
  dialogueId?: string;
  nativeLang?: Language;
  learningLang?: Language;
  onComplete?: (score: number, total: number) => void;
  onProgress?: (current: number, total: number) => void;
  className?: string;
}

export default function InteractiveDialogue({
  turns = [],
  dialogueId = "dialogue",
  nativeLang = "hy",
  learningLang = "en",
  onComplete,
  onProgress,
  className = "",
}: InteractiveDialogueProps) {
  const { t } = useI18n();

  // ─── ONLINE AUDIO ONLY ────────────────────────────────────────────
  const { play, stop, isPlaying } = useAudioManager();
  const [wavClient, setWavClient] = useState<any>(null);
  const [isWAVAvailable, setIsWAVAvailable] = useState(false);
  const [audioMode, setAudioMode] = useState<"wav" | "tts">("wav");
  const [selectedVoice, setSelectedVoice] = useState<Record<Language, Gender>>({
    hy: "female",
    en: "female",
    ru: "female"
  });

  // ─── INIT WAV CLIENT ──────────────────────────────────────────────
  useEffect(() => {
    const initWAV = async () => {
      try {
        const client = getWavClient();
        if (client) {
          setWavClient(client);
          setIsWAVAvailable(true);
        }
      } catch {
        setIsWAVAvailable(false);
      }
    };
    initWAV();
  }, []);

  // ─── STATE ──────────────────────────────────────────────────────────

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState(0);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [audioSupported, setAudioSupported] = useState(true);
  const [showTranslations, setShowTranslations] = useState<Record<number, boolean>>({});
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showAllTranslations, setShowAllTranslations] = useState(false);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // ✅ Check audio support
  useEffect(() => {
    if (typeof window !== "undefined" && !window.speechSynthesis) {
      setAudioSupported(false);
    }
  }, []);

  // ✅ Focus on first blank input
  useEffect(() => {
    if (!turns || turns.length === 0) return;
    
    const firstBlank = turns.findIndex(
      (t, i) => t.speaker === "user" && !submitted[i]
    );
    if (firstBlank !== -1 && inputRefs.current[firstBlank]) {
      setTimeout(() => {
        inputRefs.current[firstBlank]?.focus();
      }, 300);
    }
  }, [submitted, turns]);

  // ✅ Auto-reveal translations when all submitted
  useEffect(() => {
    if (!turns || turns.length === 0) return;
    
    const allSubmitted = turns.every((_, i) => submitted[i] || false);
    if (allSubmitted && turns.length > 0) {
      const newShow: Record<number, boolean> = {};
      turns.forEach((_, idx) => {
        newShow[idx] = true;
      });
      setShowTranslations(newShow);
      setShowAllTranslations(true);
    }
  }, [submitted, turns]);

  // ─── GET TEXT BY LANGUAGE ─────────────────────────────────────────

  const getTurnText = useCallback((turn: DialogueTurn, lang: Language): string => {
    if (lang === 'hy') return turn.hy || turn.en;
    if (lang === 'en') return turn.en || turn.hy;
    if (lang === 'ru') return turn.ru || turn.hy;
    return turn.hy || turn.en;
  }, []);

  // ─── SPEAK FUNCTION ─────────────────────────────────────────────────

  const speak = useCallback(async (text: string, lang: string, id: string) => {
    if (!audioSupported || !text) {
      console.warn('Audio not supported or text empty');
      return;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (isPlaying) {
      stop?.();
    }

    setSpeakingId(id);

    try {
      // ✅ Try WAV for Armenian
      if (lang === 'hy' && isWAVAvailable && wavClient && audioMode === 'wav') {
        try {
          await wavClient.playGeneratedAudio(text, 'Ani');
          setTimeout(() => setSpeakingId(null), 1500);
          return;
        } catch (error) {
          console.warn('WAV failed, falling back to TTS:', error);
        }
      }

      // ✅ Fallback: Browser TTS
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        utterance.pitch = 1.1;

        const voices = window.speechSynthesis.getVoices();
        const isFemale = selectedVoice[lang as Language] === 'female';
        
        let voicePatterns: string[] = [];
        if (lang === 'hy') {
          voicePatterns = isFemale 
            ? ['Ani', 'Armine', 'Lusine', 'female'] 
            : ['Areg', 'Avet', 'male'];
        } else if (lang === 'en') {
          voicePatterns = isFemale
            ? ['Samantha', 'Google UK English Female', 'Karen', 'Zira', 'female']
            : ['Google UK English Male', 'Daniel', 'male'];
        } else if (lang === 'ru') {
          voicePatterns = isFemale
            ? ['Google русский', 'Anna', 'Elena', 'Katya', 'Marina', 'female']
            : ['Google русский', 'Alexander', 'male'];
        }

        let selectedVoiceObj = null;
        for (const pattern of voicePatterns) {
          const found = voices.find(v => 
            v.lang.startsWith(lang) && 
            v.name.toLowerCase().includes(pattern.toLowerCase())
          );
          if (found) {
            selectedVoiceObj = found;
            break;
          }
        }

        if (!selectedVoiceObj) {
          selectedVoiceObj = voices.find(v => v.lang.startsWith(lang)) || null;
        }

        if (selectedVoiceObj) {
          utterance.voice = selectedVoiceObj;
          console.log(`🎤 Using voice: ${selectedVoiceObj.name} (${lang})`);
        } else {
          utterance.pitch = isFemale ? 1.2 : 0.9;
          console.warn(`⚠️ No voice found for ${lang}, using default pitch`);
        }

        utterance.onend = () => setSpeakingId(null);
        utterance.onerror = () => setSpeakingId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setSpeakingId(null);
      }
    } catch (error) {
      console.warn('Speech failed:', error);
      setSpeakingId(null);
    }
  }, [audioSupported, isWAVAvailable, wavClient, audioMode, isPlaying, stop, selectedVoice]);

  // ─── HELPERS ──────────────────────────────────────────────────────

  const getSpeakerName = (speaker: string, lang: string = "hy") => {
    return CHARACTER_NAMES[speaker]?.[lang] || speaker;
  };

  const getSpeakerAvatar = (speaker: string) => {
    return CHARACTER_AVATARS[speaker] || "👤";
  };

  const getBlankWord = (turn: DialogueTurn | undefined, idx: number): string | null => {
    if (!turn || submitted[idx]) return null;
    if (turn.speaker !== "user") return null;
    
    // ✅ Use learning language for blank word
    const text = getTurnText(turn, learningLang);
    const words = text?.split(" ") || [];
    if (words.length === 0) return null;
    const firstWord = words.find((w) => w.length > 1);
    return firstWord || words[0] || null;
  };

  // ─── CHECK ANSWER ─────────────────────────────────────────────────

  const checkAnswer = (turnIdx: number, userAnswer: string, blankWord: string) => {
    const isCorrect = userAnswer.trim().toLowerCase() === blankWord.toLowerCase();
    setFeedback((prev) => ({ ...prev, [turnIdx]: isCorrect }));
    setSubmitted((prev) => ({ ...prev, [turnIdx]: true }));
    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      if (onProgress) onProgress(turnIdx + 1, turns.length);
    }

    const allSubmitted = turns.every((_, i) => submitted[i] || i === turnIdx);
    if (allSubmitted) {
      setIsComplete(true);
      if (onComplete) onComplete(score + (isCorrect ? 1 : 0), turns.length);
    }

    const nextBlank = turns.findIndex((t, i) => t.speaker === "user" && !submitted[i] && i !== turnIdx);
    if (nextBlank !== -1 && inputRefs.current[nextBlank]) {
      setTimeout(() => {
        inputRefs.current[nextBlank]?.focus();
      }, 500);
    }
  };

  const toggleTranslation = (idx: number) => {
    setShowTranslations((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleAllTranslations = () => {
    const newState = !showAllTranslations;
    setShowAllTranslations(newState);
    const newShow: Record<number, boolean> = {};
    turns.forEach((_, idx) => {
      newShow[idx] = newState;
    });
    setShowTranslations(newShow);
  };

  const resetAll = () => {
    setAnswers({});
    setSubmitted({});
    setFeedback({});
    setScore(0);
    setShowTranslations({});
    setShowAllTranslations(false);
    setIsComplete(false);
    setCurrentTurnIndex(0);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
  };

  const toggleAudioMode = () => {
    setAudioMode(prev => prev === 'wav' ? 'tts' : 'wav');
  };

  const toggleVoice = (lang: Language) => {
    setSelectedVoice(prev => ({
      ...prev,
      [lang]: prev[lang] === 'female' ? 'male' : 'female'
    }));
  };

  // ─── RENDER TURN ──────────────────────────────────────────────────

  const renderTurn = (turn: DialogueTurn | undefined, idx: number) => {
    if (!turn) return null;
    
    // ✅ Use appropriate language for display
    const displayText = getTurnText(turn, learningLang);
    const originalText = turn.hy; // Keep original for reference
    
    const blankWord = getBlankWord(turn, idx);
    const isSubmitted = submitted[idx] || false;
    const isCorrect = feedback[idx];
    const audioId = `${dialogueId}-${turn.speaker}-${idx}`;
    const isSpeaking = speakingId === audioId;
    const showTranslation = showTranslations[idx] || false;

    // ─── SUBMITTED TURN ───
    if (isSubmitted) {
      return (
        <motion.div
          key={`submitted-${idx}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border-l-4 ${
            isCorrect
              ? "border-emerald-500 bg-emerald-500/5"
              : "border-red-500 bg-red-500/5"
          } bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm">
                <span>{getSpeakerAvatar(turn.speaker)}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {getSpeakerName(turn.speaker, learningLang)}
                </span>
                {turn.mood && (
                  <span className="text-sm">{getMoodEmoji(turn.mood)}</span>
                )}
                <span className="ml-auto">
                  {isCorrect ? (
                    <CheckCircle size={18} className="text-emerald-500" />
                  ) : (
                    <XCircle size={18} className="text-red-500" />
                  )}
                </span>
              </div>
              <div className="text-lg text-gray-900 dark:text-white mt-1">
                {displayText}
              </div>
              {isCorrect && (
                <div className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>{t("dialogues_correct")}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => speak(displayText, learningLang, audioId)}
              disabled={isSpeaking}
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                isSpeaking
                  ? "bg-red-500/20 text-red-500 animate-pulse"
                  : "bg-white/20 dark:bg-gray-800/80 hover:bg-white/30 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-white/20 dark:border-gray-700"
              }`}
            >
              {isSpeaking ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Volume2 size={16} />
              )}
            </button>
          </div>

          <button
            onClick={() => toggleTranslation(idx)}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mt-2 flex items-center gap-1"
          >
            {showTranslation ? <EyeOff size={12} /> : <Eye size={12} />}
            {showTranslation ? t("dialogues_hide_translation") : t("dialogues_show_translation")}
          </button>
          {showTranslation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-2 pt-2 border-t border-white/10 dark:border-gray-700/50 space-y-1"
            >
              <div className="text-sm text-blue-400">{originalText}</div>
              <div className="text-xs text-green-400 opacity-70">{turn.ru}</div>
            </motion.div>
          )}
        </motion.div>
      );
    }

    // ─── BLANK TURN ───
    if (turn.speaker === "user" && blankWord) {
      const parts = displayText.split(blankWord);
      const before = parts[0] || "";
      const after = parts[1] || "";
      const isSubmitting = answers[idx]?.trim().length > 0;

      return (
        <motion.div
          key={`blank-${idx}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border-2 border-red-500/30 bg-red-500/5 bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 text-sm mb-2">
            <span>{getSpeakerAvatar(turn.speaker)}</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {getSpeakerName(turn.speaker, learningLang)}
            </span>
            <span className="text-xs text-amber-500 flex items-center gap-1">
              <Sparkles size={12} />
              <span>{t("page_select_words_in_order")}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg text-gray-900 dark:text-white">{before}</span>
            <input
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              value={answers[idx] || ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [idx]: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && isSubmitting) {
                  checkAnswer(idx, answers[idx] || "", blankWord);
                }
              }}
              className="w-32 px-3 py-1.5 rounded-xl border-2 border-red-500/50 bg-white/20 dark:bg-gray-800/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 text-gray-900 dark:text-white text-center text-lg font-medium transition-all"
              placeholder="___"
              autoFocus={idx === currentTurnIndex}
            />
            <span className="text-lg text-gray-900 dark:text-white">{after}</span>
          </div>

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <button
              onClick={() => checkAnswer(idx, answers[idx] || "", blankWord)}
              disabled={!isSubmitting}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                !isSubmitting
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              <Send size={16} />
              {t("page_check_enter")}
            </button>
            <button
              onClick={() => speak(displayText, learningLang, audioId)}
              disabled={isSpeaking}
              className={`px-3 py-2 rounded-xl text-sm flex items-center gap-1.5 transition-all ${
                isSpeaking
                  ? "bg-red-500/20 text-red-500 animate-pulse"
                  : "bg-white/20 dark:bg-gray-800/80 hover:bg-white/30 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-white/20 dark:border-gray-700"
              }`}
            >
              {isSpeaking ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Volume2 size={14} />
              )}
              {isSpeaking ? "..." : t("page_listen")}
            </button>
            <button
              onClick={() => toggleTranslation(idx)}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors ml-auto"
            >
              {showTranslation ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {showTranslation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-2 pt-2 border-t border-white/10 dark:border-gray-700/50 space-y-1"
            >
              <div className="text-sm text-blue-400">{originalText}</div>
              <div className="text-xs text-green-400 opacity-70">{turn.ru}</div>
            </motion.div>
          )}
        </motion.div>
      );
    }

    // ─── NURIK TURN ───
    return (
      <motion.div
        key={`nurik-${idx}`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-4 rounded-xl border border-white/20 dark:border-gray-700 bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <span>{getSpeakerAvatar(turn.speaker)}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {getSpeakerName(turn.speaker, learningLang)}
              </span>
              {turn.mood && (
                <span className="text-sm">{getMoodEmoji(turn.mood)}</span>
              )}
            </div>
            <div className="text-lg text-gray-900 dark:text-white mt-1">
              {displayText}
            </div>
          </div>
          <button
            onClick={() => speak(displayText, learningLang, audioId)}
            disabled={isSpeaking}
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isSpeaking
                ? "bg-red-500/20 text-red-500 animate-pulse"
                : "bg-white/20 dark:bg-gray-800/80 hover:bg-white/30 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-white/20 dark:border-gray-700"
            }`}
          >
            {isSpeaking ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Volume2 size={16} />
            )}
          </button>
        </div>

        <button
          onClick={() => toggleTranslation(idx)}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mt-2 flex items-center gap-1"
        >
          {showTranslation ? <EyeOff size={12} /> : <Eye size={12} />}
          {showTranslation ? t("dialogues_hide_translation") : t("dialogues_show_translation")}
        </button>
        {showTranslation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="mt-2 pt-2 border-t border-white/10 dark:border-gray-700/50 space-y-1"
          >
            <div className="text-sm text-blue-400">{originalText}</div>
            <div className="text-xs text-green-400 opacity-70">{turn.ru}</div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // ─── MAIN RENDER ──────────────────────────────────────────────────

  if (!audioSupported) {
    return (
      <div className="p-6 rounded-xl border border-red-500/30 bg-red-500/10">
        <div className="flex items-center gap-3 text-red-500">
          <XCircle size={24} />
          <div>
            <p className="font-bold">{t("page__audio_not_supported")}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("page__audio_browser_support")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!turns || turns.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-center">
        <p className="text-yellow-500 font-medium">{t("dialogues_empty")}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("dialogues_no_data")}</p>
      </div>
    );
  }

  const totalTurns = turns.length;
  const completedTurns = Object.keys(submitted).length;
  const progress = totalTurns > 0 ? (completedTurns / totalTurns) * 100 : 0;

  // ✅ Get language display names using i18n
  const getLanguageDisplay = (lang: Language): string => {
    if (lang === 'hy') return t("language_armenian");
    if (lang === 'en') return t("language_english");
    if (lang === 'ru') return t("language_russian");
    return lang;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ─── LANGUAGE INDICATOR ─── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {learningLang === 'hy' ? '🇦🇲' : learningLang === 'en' ? '🇬🇧' : '🇷🇺'} {getLanguageDisplay(learningLang)}
          </span>
          <span className="text-[8px] text-gray-400">
            {nativeLang} → {learningLang}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-bold text-amber-500 flex items-center gap-1">
            <Trophy size={16} />
            {score}
          </div>
          <button
            onClick={resetAll}
            className="p-2 rounded-xl bg-white/20 dark:bg-gray-800/80 hover:bg-white/30 dark:hover:bg-gray-700 transition-all text-gray-600 dark:text-gray-300 border border-white/20 dark:border-gray-700"
            title={t("dialogues_reset")}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* ─── PROGRESS BAR ─── */}
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>{t("dialogues_progress")}</span>
          <span>{completedTurns}/{totalTurns}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/50 dark:bg-gray-700 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* ─── TURNS ─── */}
      <div className="space-y-3">
        {turns.map((turn, idx) => (
          <div key={idx}>{renderTurn(turn, idx)}</div>
        ))}
      </div>

      {/* ─── COMPLETION MESSAGE ─── */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-5 rounded-xl text-center border border-emerald-500/30 bg-emerald-500/5 bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm"
          >
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("dialogues_complete_title")}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t("dialogues_correct_answers")}: <span className="text-amber-500 font-bold">{score}</span> / {totalTurns}
            </p>
            <div className="flex justify-center gap-3 mt-3 flex-wrap">
              <button
                onClick={resetAll}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <RefreshCw size={16} />
                {t("dialogues_repeat")}
              </button>
              {isWAVAvailable && (
                <span className="text-xs text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-3 py-2 rounded-xl">
                  <Music size={14} />
                  WAV {t("dialogues_available")}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── STATUS INDICATOR ─── */}
      <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          {isWAVAvailable && (
            <span className="text-emerald-500">🔊 WAV</span>
          )}
          {!isWAVAvailable && (
            <span className="text-purple-400">🎤 TTS</span>
          )}
        </div>
        <div>
          {speakingId && <span className="animate-pulse text-blue-400">🔊 {t("page_playing")}</span>}
        </div>
      </div>
    </div>
  );
}