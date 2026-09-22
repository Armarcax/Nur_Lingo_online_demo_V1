// src/app/learn/page.tsx - I18N THARMACVATS TARBERAK
"use client";

import { useState, useEffect, useCallback, Suspense, useRef, useMemo } from "react"
import { offlineLessonEngine } from '@/lib/offline/OfflineLessonEngine';
import { offlineAudioManager } from '@/lib/offline/OfflineAudioManager';
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Coins,
  CheckCircle,
  XCircle,
  Volume2,
  RefreshCw,
  Send,
  Trophy,
  Clock,
  Sparkles,
  Brain,
  Target,
  Flame,
  Award,
  BarChart3,
  Share2,
  Copy,
  Check,
  Loader2,
  Zap,
  BookOpen,
  Users,
  MessageSquare,
  Eye,
  EyeOff,
  Settings,
  ChevronDown,
  ChevronUp,
  Star,
  Gift,
  Calendar,
  TrendingUp,
  AlertCircle,
  Info,
  Mic,
  VolumeX,
  Play,
  Pause,
  Unlock,
  Wifi,
  WifiOff,
  Music,
  Radio,
  Speaker,
  Volume,
  VolumeOff,
  GraduationCap,
  Gamepad2,
  MousePointerClick,
} from "lucide-react";
import Nuri, { NuriSpeech, getMoodFromScore, type NuriMood } from "@/components/Nuri";
import { useNuri } from "@/hooks/useNuri";
import { loadLangConfig, type LangCode, type LangPair } from "@/lib/i18n/index";
import { getLessonById, type MultiLesson, type MultiExercise } from "@/lib/i18n/multilingual";
import {
  loadRewards,
  saveRewards,
  addRewards,
  updateStreak,
  addHAYQ,
  syncHearts,
  deductHeart,
  buyHeartRefill,
  getNextHeartCountdown,
  saveCrownLevel,
  earnHeartByPractice,
  updateQuestProgress,
} from "@/lib/rewards/seeds";
import { supabase } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { useAudioManager } from "@/lib/hooks/useAudioManager";
import { getWavClient, WavClient } from "@/lib/audio/WavClient";
import type { LanguageCode } from "@/lib/audio";
import { resolveExerciseAudio, resolveOfflineAudio } from '@/lib/offline/offline-audio-resolver';
import { useI18n } from "@/hooks/useI18n";
import { translateOfflineLessonForLang } from "@/lib/offline/offline-lesson-translator";

// ─── TYPES ────────────────────────────────────────────────────────────

interface MistakeRecord {
  exerciseId: string;
  exercise: MultiExercise;
  attempts: number;
  revealed: boolean;
}

interface ExState {
  index: number;
  userAnswer: string;
  matchPairsAnswer: Record<string, string>;
  state: "idle" | "submitting" | "correct" | "incorrect" | "revealed";
  feedback: string;
  score: number;
  hayqEarned: number;
  corrections?: string[];
  nuriMood: NuriMood;
  nuriSpeech: string;
  customImage?: string;
  showHint: boolean;
  timeSpent: number;
  showListenButton?: boolean;
  showCoinAnimation?: boolean;
}

interface LessonStats {
  correct: number;
  total: number;
  hayqEarned: number;
  seedsEarned: number;
  streaks: number;
  bestStreak: number;
  timeSpent: number;
}

// ─── SMART RETRY HELPERS ─────────────────────────────────────────────

const MISTAKES_KEY = "nur_lesson_mistakes_v2";

function logMistake(lessonId: string, ex: MultiExercise, attempts: number, revealed: boolean) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(MISTAKES_KEY);
    const all: Record<string, MistakeRecord[]> = raw ? JSON.parse(raw) : {};
    const list = all[lessonId] ?? [];
    const existing = list.findIndex(m => m.exerciseId === ex.id);
    const rec: MistakeRecord = { exerciseId: ex.id, exercise: ex, attempts, revealed };
    if (existing >= 0) list[existing] = rec;
    else list.push(rec);
    all[lessonId] = list;
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(all));
  } catch {}
}

function getMistakes(lessonId: string): MistakeRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MISTAKES_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Record<string, MistakeRecord[]>;  
  return all[lessonId] ?? [];
  } catch {
    return [];
  }
}

function clearMistakes(lessonId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(MISTAKES_KEY);
    if (!raw) return;
    const all = JSON.parse(raw) as Record<string, MistakeRecord[]>;
    delete all[lessonId];
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(all));
  } catch {}
}

function buildRetryQueue(lessonId: string): MultiExercise[] {
  return getMistakes(lessonId).map(m => ({
    ...m.exercise,
    id: `${m.exercise.id}_retry`,
  }));
}

// ─── HELPERS ──────────────────────────────────────────────────────────

function getOrCreateDeviceId(): string {
  const key = "nur_device_id";
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min > 0 ? `${min}ր ${sec}վ` : `${sec}վ`;
}

// ─── LANGUAGE HELPERS ──────────────────────────────────────────────

function getInitialLanguage(): LangCode {
  if (typeof window === 'undefined') return 'en';
  
  const params = new URLSearchParams(window.location.search);
  const pair = params.get('pair');
  if (pair) {
    const parts = pair.split('-');
    if (parts.length === 2) {
      const native = parts[0] as LangCode;
      if (['en', 'hy', 'ru'].includes(native)) {
        console.log(`📍 Native language from URL: ${native}`);
        return native;
      }
    }
  }
  
  try {
    const saved = localStorage.getItem('nur_language_preference');
    if (saved && ['en', 'hy', 'ru'].includes(saved)) {
      console.log(`📍 Native language from localStorage: ${saved}`);
      return saved as LangCode;
    }
  } catch {}
  
  try {
    const browserLang = navigator.language.split('-')[0];
    if (['hy', 'ru'].includes(browserLang)) {
      console.log(`📍 Native language from browser: ${browserLang}`);
      return browserLang as LangCode;
    }
  } catch {}
  
  console.log(`📍 Default native language: en`);
  return 'en';
}

function getLearningLanguage(): LangCode {
  if (typeof window === 'undefined') return 'hy';
  
  const params = new URLSearchParams(window.location.search);
  const pair = params.get('pair');
  if (pair) {
    const parts = pair.split('-');
    if (parts.length === 2) {
      const learning = parts[1] as LangCode;
      if (['en', 'hy', 'ru'].includes(learning)) {
        return learning;
      }
    }
  }
  
  const native = getInitialLanguage();
  return native === 'hy' ? 'en' : 'hy';
}

function getPairKey(native: LangCode, learning: LangCode): string {
  return `${native}-${learning}`;
}

// ─── NURI LINES ──────────────────────────────────────────────────────

const NURI_LINES: Record<string, string[]> = {
  correct_perfect: [
    "🏆 Վայ, HAYQ վաստակեցիր!",
    "🎉 Չեմ հավատում, թե որքան լավ ես սովորել!",
    "🔥 Դու այսօր շատ լավն ես!",
    "💪 Դու հանճար ես!",
    "🌟 Հիանալի աշխատանք!",
  ],
  correct: [
    "✅ Շատ լավ!",
    "👍 Այո! Հայերեն գիտես!",
    "💪 Ճիշտ է! Շարունակիր նույն ոգով!",
    "🎯 Ճիշտ ուղղությամբ ես շարժվում!",
    "🌟 Հիանալի է, շարունակիր!",
  ],
  almost: [
    "💪 Գրեթե! Կրկին փորձիր",
    "🤏 Մոտ էր!",
    "🧐 Քիչ էր մնում...",
    "📖 Մի քիչ էլ, և կստացվի!",
  ],
  incorrect: [
    "💪 Մի տխրիր! Կարող ես ավելի լավ",
    "🔄 Կրկնիր, և կստացվի!",
    "💪 Շատ մոտ էր, բայց կփորձենք նորից!",
    "📖 Եկեք նորից փորձենք միասին",
    "💪 Հաջորդ անգամ կստացվի:",
  ],
  reveal: [
    "🍎 Արի սովորենք միասին",
    "📖 Ահա ճիշտ պատասխանը",
  ],
  thinking: [
    "💭 Մտածիր...",
    "🤔 Հայերենը հիասքանչ է",
    "🧠 Ոչ այստեղ, ոչ այնտեղ...",
  ],
  idle: [
    "🍎 Բարև! Սովորենք միասին!",
    "💪 Ինչպե՞ս ես: Պատրա՞ստ ես:",
    "🪙 Հայերեն սովորելը հաճելի է",
  ],
  relax: [
    "☕ Ժամանակն է մի փոքր հանգստանալ:",
    "🧘 Եկեք մի փոքր հանգստանանք!",
    "🍵 5 րոպե հանգիստ, հետո կշարունակենք!",
  ],
  surprised: [
    "😲 Վա՜յ, դու շատ արագ ես սովորում!",
    "🤯 Անհավատալի!",
    "🌟 Դու ինձ զարմացնում ես!",
  ],
  encouraging: [
    "💪 Դու կարող ես ամեն ինչ!",
    "🌟 Շարունակիր այսպես!",
    "🔥 Դու լավագույնն ես!",
  ],
  sad: [
    "😢 Մի տխրիր, հաջորդ անգամ կստացվի!",
    "💪 Մի հանձնվիր:",
  ],
  angry: [
    "😤 Հանգստացիր, ամեն ինչ լավ կլինի!",
    "🧘 Շնչիր խորը...",
  ],
  excited: [
    "🤩 Հիանալի է, շարունակիր:",
    "🎉 Վա՜յ, դու առաջընթաց ունես!",
  ],
  neutral: [
    "😐 Լավ, շարունակենք:",
    "📖 Եկեք առաջ գնանք:",
  ],
};

function randomLine(key: string) {
  const arr = NURI_LINES[key] ?? NURI_LINES.idle;
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── ✅ COMPONENTS ──────────────────────────────────────────────────

// ─── WORD ORDER INPUT ────────────────────────────────────────────────

interface WordOrderInputProps {
  selected: string[];
  available: string[];
  onSelect: (word: string) => void;
  onDeselect: (word: string) => void;
  disabled: boolean;
  t: (key: string, params?: any) => string;
}

function WordOrderInput({ selected, available, onSelect, onDeselect, disabled, t }: WordOrderInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 p-4 min-h-[60px] rounded-xl bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700">
        {selected.length === 0 ? (
          <span className="text-gray-500 dark:text-gray-400 text-sm">{t("page_select_words_in_order")}</span>
        ) : (
          selected.map((w, i) => (
            <motion.button
              key={`${w}-${i}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => !disabled && onDeselect(w)}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              disabled={disabled}
            >
              {w}
            </motion.button>
          ))
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {available.map((w, i) => (
          <motion.button
            key={`${w}-${i}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => !disabled && onSelect(w)}
            className="px-4 py-2 rounded-xl bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-700 text-sm font-medium transition-colors border border-white/20 dark:border-gray-700 text-gray-900 dark:text-white"
            disabled={disabled}
          >
            {w}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── MULTIPLE CHOICE INPUT ──────────────────────────────────────────

interface MultipleChoiceInputProps {
  options: string[];
  targetAnswer: string;
  userAnswer: string;
  state: "idle" | "submitting" | "correct" | "incorrect" | "revealed";
  onSelect: (opt: string) => void;
  disabled: boolean;
}

function MultipleChoiceInput({ options, targetAnswer, userAnswer, state, onSelect, disabled }: MultipleChoiceInputProps) {
  const isAnswered = state === "correct" || state === "incorrect";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => {
        const isPicked = userAnswer === opt;
        const isCorrectAnswer = opt === targetAnswer;
        const isWrong = isAnswered && isPicked && !isCorrectAnswer;
        const isCorrect = isAnswered && isCorrectAnswer;

        let className = "p-4 rounded-xl border-2 transition-all text-left ";

        if (isCorrect) {
          className += "border-emerald-500 bg-emerald-500/10 text-emerald-500";
        } else if (isWrong) {
          className += "border-red-500 bg-red-500/10 line-through opacity-70";
        } else if (isPicked && !isAnswered) {
          className += "border-red-500 bg-red-500/10";
        } else if (isAnswered && !isCorrectAnswer && !isPicked) {
          className += "opacity-50";
        } else {
          className += "border-white/20 dark:border-gray-700 bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800";
        }

        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={className}
            disabled={disabled || isAnswered}
          >
            <span className="text-gray-900 dark:text-white">{opt}</span>
            {isCorrect && <span className="ml-2 text-emerald-500">✅</span>}
            {isWrong && <span className="ml-2 text-red-500">❌</span>}
          </button>
        );
      })}
    </div>
  );
}

// ─── MATCH PAIRS INPUT ──────────────────────────────────────────────

interface MatchPairsInputProps {
  leftItems: string[];
  rightItems: string[];
  matched: Record<string, string>;
  onMatch: (left: string, right: string) => void;
  onUnmatch?: (left: string) => void;
  disabled: boolean;
}

function MatchPairsInput({ leftItems, rightItems, matched, onMatch, onUnmatch, disabled }: MatchPairsInputProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const handleLeftClick = (left: string) => {
    if (disabled) return;
    if (matched[left]) {
      onUnmatch?.(left);
      return;
    }
    setSelectedLeft(selectedLeft === left ? null : left);
  };

  const handleRightClick = (right: string) => {
    if (disabled) return;
    if (selectedLeft && !matched[selectedLeft]) {
      onMatch(selectedLeft, right);
      setSelectedLeft(null);
    }
  };

  const isRightMatched = (right: string) => {
    return Object.values(matched).includes(right);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        {leftItems.map((left) => (
          <button
            key={left}
            onClick={() => handleLeftClick(left)}
            className={`w-full p-3 rounded-xl text-left transition-all ${
              matched[left]
                ? "bg-emerald-500/20 border-emerald-500/30 line-through opacity-60 cursor-pointer"
                : selectedLeft === left
                ? "border-red-500 bg-red-500/20"
                : "bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-700 border border-white/20 dark:border-gray-700"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={disabled}
          >
            <span className="text-gray-900 dark:text-white">{left}</span>
            {matched[left] && <span className="ml-2 text-emerald-500">✅</span>}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {rightItems.map((right) => (
          <button
            key={right}
            onClick={() => handleRightClick(right)}
            className={`w-full p-3 rounded-xl text-left transition-all ${
              isRightMatched(right)
                ? "bg-emerald-500/20 border-emerald-500/30 opacity-60 cursor-not-allowed"
                : selectedLeft && !matched[selectedLeft]
                ? "bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30"
                : "bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-700 border border-white/20 dark:border-gray-700"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={disabled || isRightMatched(right)}
          >
            <span className="text-gray-900 dark:text-white">{right}</span>
            {isRightMatched(right) && <span className="ml-2 text-emerald-500">✅</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── HAYQ COIN ANIMATION (Super Mario style) ────────────────────────

function HaqCoinAnimation({ amount, show }: { amount: number; show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] pointer-events-none">
      <motion.div
        initial={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
        animate={{
          y: -180,
          opacity: [1, 1, 0],
          scale: [1, 1.4, 1.6],
          rotate: [0, 360],
        }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="flex flex-col items-center gap-2"
      >
        <div className="text-6xl drop-shadow-[0_0_25px_rgba(250,204,21,0.9)]">
          🪙
        </div>
        <div className="text-3xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] whitespace-nowrap">
          +{amount} HAYQ
        </div>
      </motion.div>
    </div>
  );
}

// ─── LISTENING INPUT ─────────────────────────────────────────────────

interface ListeningInputProps {
  ttsText: string;
  ttsLang: string;
  promptText: string;
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  onSpeak?: (text: string, lang: string) => void;
  isSpeaking?: boolean;
  t: (key: string, params?: any) => string;
}

function ListeningInput({
  ttsText,
  ttsLang,
  promptText,
  value,
  onChange,
  disabled,
  onSpeak,
  isSpeaking = false,
  t,
}: ListeningInputProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm bg-amber-500/10 backdrop-blur-sm p-3 rounded-xl border border-amber-500/30">
        <p className="flex items-center gap-2 text-gray-900 dark:text-white">
          <span>🎧</span> {promptText}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("page_listen_carefully")}</p>
      </div>

      <button
        onClick={() => onSpeak?.(ttsText, ttsLang)}
        disabled={disabled || isSpeaking}
        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
          isSpeaking
            ? "bg-amber-500 text-white cursor-wait"
            : disabled
            ? "bg-white/20 text-white/50 cursor-not-allowed"
            : "bg-amber-500 text-white hover:bg-amber-600"
        }`}
      >
        {isSpeaking ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {t("page_playing")}
          </>
        ) : disabled ? (
          <span>{t("page_please_wait")}</span>
        ) : (
          <>
            <Volume2 size={18} />
            {t("page_listen_to_pronunciation")}
          </>
        )}
      </button>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("page_write_what_you_heard")}
        className="w-full bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl h-32 border border-white/20 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        disabled={disabled}
      />
    </div>
  );
}

// ─── FREE TEXT INPUT ─────────────────────────────────────────────────

interface FreeTextInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  placeholder: string;
  onSpeak?: (text: string, lang: string) => void;
  textToSpeak?: string;
}

function FreeTextInput({ value, onChange, disabled, placeholder, onSpeak, textToSpeak }: FreeTextInputProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl h-32 border border-white/20 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 pr-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          placeholder={placeholder}
          disabled={disabled}
        />
        {textToSpeak && textToSpeak.length > 0 && onSpeak && !disabled && (
          <button
            onClick={() => onSpeak(textToSpeak, "hy")}
            className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/20 dark:bg-gray-700 hover:bg-white/30 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
          >
            <Volume2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

function LearnInner() {
  const router = useRouter();
  const params = useSearchParams();
  const lessonId = params?.get("lesson") ?? "";
  const pairParam = params?.get("pair") as LangPair | null;

  const { onCorrect, onWrong, onLessonComplete, setPage } = useNuri();
  const { t } = useI18n();

  // ─── MODE STATE ────────────────────────────────────────────────────
  const [isProfessional, setIsProfessional] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nur_learning_mode') === 'professional';
    }
    return false;
  });

  // ─── AUDIO ENABLED TOGGLE ─────────────────────────────────────────
  const [audioEnabled, setAudioEnabled] = useState(true);

  // ─── AUDIO MANAGER (Online Audio) ─────────────────────────────────
  const { 
    play: playAudio, 
    stop, 
    isPlaying, 
    isLoading, 
    isTTSFallback, 
    preload 
  } = useAudioManager();

  // ─── WAV CLIENT STATE (Online TTS) ──────────────────────────────
  const [wavClient, setWavClient] = useState<WavClient | null>(null);
  const [isWAVAvailable, setIsWAVAvailable] = useState(false);
  const [audioMode] = useState<"wav" | "tts" | "mp3">("wav");
  const [selectedVoice] = useState<string>("Ani");

  // ─── AUDIO READY STATE ────────────────────────────────────────────
  const [isAudioReady, setIsAudioReady] = useState(false);
  const firstAutoPlayAttempted = useRef(false);

  // ─── REF TO PREVENT DUPLICATE LESSON LOAD ────────────────────────
  const loadedLessonRef = useRef<string | null>(null);

  // ─── INIT WAV CLIENT ──────────────────────────────────────────────
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

  // ─── AUDIO READY CHECK ────────────────────────────────────────────
  useEffect(() => {
    if (wavClient && isWAVAvailable) {
      setIsAudioReady(true);
    }
  }, [wavClient, isWAVAvailable]);

  useEffect(() => {
    if (!isWAVAvailable && typeof window !== 'undefined') {
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

  useEffect(() => {
    setPage("learn");
  }, [setPage]);

  // ─── STATE ──────────────────────────────────────────────────────────

  const [lesson, setLesson] = useState<MultiLesson | null>(null);
  const [native, setNative] = useState<LangCode>("en");
  const [learningLang, setLearningLang] = useState<LangCode>("hy");
  const [complete, setComplete] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [attempts, setAttempts] = useState(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [startTime] = useState(() => Date.now());
  const [stats, setStats] = useState<LessonStats>({
    correct: 0,
    total: 0,
    hayqEarned: 0,
    seedsEarned: 0,
    streaks: 0,
    bestStreak: 0,
    timeSpent: 0,
  });
  const [totalHAYQ, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sessionLevel, setSLevel] = useState(1);
  const [showBreak, setShowBreak] = useState(false);
  const [breakTimer, setBreakTimer] = useState<number | null>(null);
  const [breakDuration] = useState(2);
  const [startSessionTime] = useState(() => Date.now());
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [phase, setPhase] = useState<"main" | "retry">("main");
  const [retryStartIndex, setRetryStartIndex] = useState(0);
  const [breakShown, setBreakShown] = useState(false);
  const [relaxAudio, setRelaxAudio] = useState<HTMLAudioElement | null>(null);
  const [isRelaxing, setIsRelaxing] = useState(false);

  // ─── LOCAL TOAST ──────────────────────────────────────────────────

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");

  const showMessage = useCallback((text: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage(text);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  }, []);

  // Word Order state
  const [selectedWords, setSW] = useState<string[]>([]);
  const [availWords, setAW] = useState<string[]>([]);

  // Match Pairs state
  const [matchPairsMap, setMatchPairsMap] = useState<Record<string, string>>({});
  const [matchRightItems, setMatchRightItems] = useState<string[]>([]);
  const [matchLeftItems, setMatchLeftItems] = useState<string[]>([]);

  // Exercise state
  const [ex, setEx] = useState<ExState>({
    index: 0,
    userAnswer: "",
    matchPairsAnswer: {},
    state: "idle",
    feedback: "",
    score: 0,
    hayqEarned: 0,
    nuriMood: "idle",
    nuriSpeech: randomLine("idle"),
    customImage: "",
    showHint: false,
    timeSpent: 0,
    showListenButton: false,
  });

  // Refs
  const exerciseStartTime = useRef<number>(Date.now());
  const breakTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const current = lesson?.exercises[ex.index];
  const isRetryPhase = phase === "retry" && ex.index >= retryStartIndex;
  const progress = lesson ? (ex.index / (lesson.exercises?.length || 1)) * 100 : 0;
  const attemptsLeft = Math.max(0, 3 - attempts);

  // ─── TOGGLE MODE ──────────────────────────────────────────────────

  const toggleMode = useCallback(() => {
    setIsProfessional(prev => {
      const newMode = !prev;
      localStorage.setItem('nur_learning_mode', newMode ? 'professional' : 'amateur');
      showMessage(
        newMode ? t("page_professional_mode") : t("page_amateur_mode"),
        "info"
      );
      loadedLessonRef.current = null;
      setLesson(null);
      return newMode;
    });
  }, [showMessage, t]);

  // ─── RELAX MUSIC ──────────────────────────────────────────────────

  const playRelaxMusic = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      if (!relaxAudio) {
        const audio = new Audio(
          "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=calm-nature-ambient-113194.mp3"
        );
        audio.loop = true;
        audio.volume = 0.3;
        setRelaxAudio(audio);
        audio.play().catch(() => {});
        setIsRelaxing(true);
      } else {
        relaxAudio.play().catch(() => {});
        setIsRelaxing(true);
      }
    } catch {
      // Silent fail
    }
  }, [relaxAudio]);

  const stopRelaxMusic = useCallback(() => {
    if (relaxAudio) {
      relaxAudio.pause();
      relaxAudio.currentTime = 0;
      setIsRelaxing(false);
    }
  }, [relaxAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (relaxAudio) {
        relaxAudio.pause();
        relaxAudio.currentTime = 0;
      }
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, [relaxAudio]);

  // ─── PLAY AUDIO WITH FEMALE VOICE ──────────────────────────────────
  const playAudioWithFemaleVoice = useCallback((text: string, lang: string) => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      if (lang === 'hy') {
        utterance.rate = 1.05;
      } else {
        utterance.rate = 0.9;
      }
      utterance.pitch = 1.3;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      
      const femaleVoiceNames = [
        'Samantha', 'Google UK English Female', 'Karen', 'Zira', 
        'Alice', 'Victoria', 'Emma', 'Susan', 'Tessa',
        'Google русский', 'Anna', 'Elena', 'Katya', 'Marina', 'Natalia', 'Alena',
        'Ani', 'Google Հայերեն', 'Armine', 'Lusine',
      ];
      
      let selectedVoice = null;
      
      for (const name of femaleVoiceNames) {
        const found = voices.find(v => 
          v.lang.startsWith(lang) && 
          v.name.toLowerCase() === name.toLowerCase()
        );
        if (found) {
          selectedVoice = found;
          break;
        }
      }
      
      if (!selectedVoice) {
        for (const name of femaleVoiceNames) {
          const found = voices.find(v => 
            v.lang.startsWith(lang) && 
            v.name.toLowerCase().includes(name.toLowerCase())
          );
          if (found) {
            selectedVoice = found;
            break;
          }
        }
      }
      
      if (!selectedVoice) {
        selectedVoice = voices.find(v => 
          v.lang.startsWith(lang) && 
          (v.name.toLowerCase().includes('female') ||
           v.name.toLowerCase().includes('samantha') ||
           v.name.toLowerCase().includes('zira') ||
           v.name.toLowerCase().includes('karen') ||
           v.name.toLowerCase().includes('anna'))
        );
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`🎤 Female voice: ${selectedVoice.name}`);
      } else {
        utterance.pitch = 1.5;
        console.warn(`⚠️ No female voice found, using high pitch (1.5)`);
      }

      utterance.onend = () => {
        resolve(undefined);
      };

      utterance.onerror = (e) => {
        console.error('Speech error:', e);
        reject(e);
      };

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // ─── PLAY AUDIO WITH FALLBACK ──────────────────────────────────────

  const playAudioWithFallback = useCallback(async (text: string, lang: string = "hy", type: 'prompt' | 'answer' = 'prompt') => {
    if (!audioEnabled) {
      console.log(`🔇 Audio disabled, skipping: "${text}"`);
      return;
    }

    if (!text) return;

    console.log(`🔊 Playing ${type}: "${text}" (${lang})`);

    const pairKey = getPairKey(native, learningLang);
    
    if (type === 'prompt') {
      if (lang === 'hy') {
        if (wavClient && isWAVAvailable) {
          try {
            await wavClient.playPrompt(text, pairKey, 'Ani');
            console.log(`✅ WAV (Ani) for prompt (hy): ${text}`);
            return;
          } catch (error: any) {
            if (error.message === 'AUTOPLAY_BLOCKED' || error.name === 'NotAllowedError') {
              console.log('⏸️ WAV autoplay blocked, falling back to TTS');
              try {
                await playAudioWithFemaleVoice(text, 'hy');
                console.log(`✅ TTS (hy) for prompt: ${text}`);
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
          await playAudioWithFemaleVoice(text, 'hy');
          console.log(`✅ Female TTS (hy) for prompt: ${text}`);
          return;
        } catch (error) {
          console.warn("Female TTS failed:", error);
        }
      }
      
      if (lang === 'en') {
        try {
          const response = await fetch('/api/generate-tts-en', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
      
      if (lang === 'ru') {
        try {
          const response = await fetch('/api/generate-tts-ru', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        console.log(`✅ TTS (${lang}) for prompt (fallback): ${text}`);
        return;
      } catch (error) {
        console.warn("TTS failed:", error);
      }
    }

    if (type === 'answer') {
      if (learningLang === 'hy') {
        if (wavClient && isWAVAvailable) {
          try {
            await wavClient.playAnswer(text, pairKey, 'Ani');
            console.log(`✅ WAV (Ani) for answer (${pairKey}): ${text}`);
            return;
          } catch (error: any) {
            if (error.message === 'AUTOPLAY_BLOCKED' || error.name === 'NotAllowedError') {
              console.log('⏸️ WAV autoplay blocked for answer, falling back to TTS');
              try {
                await playAudioWithFemaleVoice(text, learningLang);
                console.log(`✅ TTS (${learningLang}) for answer (fallback): ${text}`);
                return;
              } catch (ttsError) {
                console.warn("TTS also failed:", ttsError);
              }
            } else {
              console.warn("WAV failed:", error);
            }
          }
        }
      }
      
      if (learningLang === 'en') {
        try {
          const response = await fetch('/api/generate-tts-en', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.audioUrl) {
              const audio = new Audio(data.audioUrl);
              await audio.play();
              console.log(`✅ English TTS for answer: ${text}`);
              return;
            }
          }
        } catch (error) {
          console.warn("English TTS failed:", error);
        }
      }
      
      if (learningLang === 'ru') {
        try {
          const response = await fetch('/api/generate-tts-ru', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.audioUrl) {
              const audio = new Audio(data.audioUrl);
              await audio.play();
              console.log(`✅ Russian TTS for answer: ${text}`);
              return;
            }
          }
        } catch (error) {
          console.warn("Russian TTS failed:", error);
        }
      }
      
      try {
        await playAudioWithFemaleVoice(text, learningLang);
        console.log(`✅ TTS (${learningLang}) for answer (fallback): ${text}`);
        return;
      } catch (error) {
        console.warn("TTS failed:", error);
      }
    }

    console.warn(`❌ No audio available for ${type}: "${text}"`);
    throw new Error('AUDIO_FAILED');
  }, [wavClient, isWAVAvailable, native, learningLang, playAudioWithFemaleVoice, audioEnabled]);

  // ─── HANDLE SPEAK ──────────────────────────────────────────────────
  const handleSpeak = useCallback(async (text: string, lang: string = "hy", type: 'prompt' | 'answer' = 'prompt') => {
    if (!text || !audioEnabled) return;

    if (isPlaying) {
      stop();
      return;
    }

    await playAudioWithFallback(text, lang, type);
  }, [isPlaying, stop, playAudioWithFallback, audioEnabled]);

  // ─── AUTO-PLAY PROMPT ─────────────────────────────────────────────

  useEffect(() => {
    if (!audioEnabled) return;
    if (!current || !isAudioReady) return;

    const promptText = current.prompt?.[native] || current.prompt?.en || "";
    if (!promptText) return;

    const delay = 50;
    
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }

    autoPlayTimeoutRef.current = setTimeout(() => {
      playAudioWithFallback(promptText, native, 'prompt')
        .catch(() => {
          setEx(prev => ({ ...prev, showListenButton: true }));
        });
      firstAutoPlayAttempted.current = true;
    }, delay);

    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, [current, native, isAudioReady, playAudioWithFallback, audioEnabled]);

  // ─── RESET STATES ON EXERCISE CHANGE ──────────────────────────────

  useEffect(() => {
    if (!current) return;

    exerciseStartTime.current = Date.now();
    setShowHint(false);
    setEx(prev => ({ ...prev, showListenButton: false }));

    if (current.type === "word_order" && current.words) {
      setAW([...current.words]);
      setSW([]);
    } else if (current.type === "match_pairs" && current.pairs) {
      const left = current.pairs.map((p) => p[0]);
      const right = current.pairs.map((p) => p[1]);
      setMatchLeftItems(left);
      setMatchRightItems(shuffleArray([...right]));
      setMatchPairsMap({});
      setEx((prev) => ({ ...prev, matchPairsAnswer: {} }));
    } else {
      setMatchLeftItems([]);
      setMatchRightItems([]);
      setMatchPairsMap({});
    }

    setAttempts(0);
    setShowBreak(false);
    if (breakTimerRef.current) {
      clearInterval(breakTimerRef.current);
      breakTimerRef.current = null;
    }
    setBreakTimer(null);
  }, [current]);

  // ─── LOAD LESSON (WITH MODE SUPPORT) ─────────────────────────────

  const loadLesson = useCallback(() => {
    if (loadedLessonRef.current === lessonId) {
      console.log('⏭️ Lesson already loaded, skipping duplicate load');
      return;
    }

    try {
      const nativeLang = getInitialLanguage();
      const learnLang = getLearningLanguage();
      setNative(nativeLang);
      setLearningLang(learnLang);
      
      try {
        localStorage.setItem('nur_language_preference', nativeLang);
      } catch {}
      
      const cfg = loadLangConfig();
      const pair = pairParam ?? cfg?.pair ?? `${nativeLang}-${learnLang}`;
      
      console.log('📍 Pair:', pair, 'Native:', nativeLang, 'Learning:', learnLang);
      console.log(`📚 Mode: ${isProfessional ? 'PROFESSIONAL' : 'AMATEUR'}`);

      let l = null;

      if (isProfessional) {
        console.log('🔍 Trying offline dictionary (professional mode)...');
        l = offlineLessonEngine.getLesson(lessonId);
        if (!l) {
          console.warn('❌ Professional lesson not found in offline dictionary:', lessonId);
          const found = getLessonById(pair as LangPair, lessonId);
          if (found) {
            console.log('📚 Using multilingual as fallback (professional mode)');
            l = found;
          }
        } else {
          console.log(`✅ Professional lesson loaded: ${l.id} with ${l.exercises?.length || 0} exercises`);
          // 🌐 Translate options and targetAnswer to the learning language
          l = translateOfflineLessonForLang(l as any, learnLang as any) as any;
        }
      } else {
        console.log('🎮 Trying multilingual (amateur mode)...');
        l = getLessonById(pair as LangPair, lessonId);
        if (!l) {
          console.warn('❌ Amateur lesson not found in multilingual:', lessonId);
          l = offlineLessonEngine.getLesson(lessonId);
          if (l) {
            console.log(`📚 Using offline dictionary as fallback (amateur mode): ${l.id}`);
          }
        } else {
          console.log(`✅ Amateur lesson loaded: ${l.id} with ${l.exercises?.length || 0} exercises`);
        }
      }
      
      if (!l) {
        console.warn('❌ Lesson not found in any source:', lessonId);
        if (lessonId) router.push("/world");
        return;
      }
      
      loadedLessonRef.current = lessonId;
      setLesson(l as any);

      const rewards = syncHearts();
      setHearts(rewards.hearts);
      setTotal(rewards.totalHAYQ);
      setStreak(rewards.streak);
      const lvl = Math.min(3, (rewards.crowns[l.id] || 0) + 1);
      setSLevel(lvl);

      clearMistakes(l.id);
    } catch (error) {
      console.error("Failed to load lesson:", error);
    }
  }, [lessonId, pairParam, router, isProfessional]);

  // ─── LOAD LESSON EFFECT ────────────────────────────────────────────

  useEffect(() => {
    if (isProfessional && !offlineLessonEngine.isAvailable()) {
      console.log('⏳ OfflineLessonEngine not ready, waiting for professional mode...');
      const checkReady = setInterval(() => {
        if (offlineLessonEngine.isAvailable()) {
          clearInterval(checkReady);
          loadLesson();
        }
      }, 150);
      return () => clearInterval(checkReady);
    }
    loadLesson();
  }, [loadLesson, isProfessional]);

  // ─── HEART COUNTDOWN ──────────────────────────────────────────────

  useEffect(() => {
    const timer = setInterval(() => {
      try {
        const nextH = syncHearts();
        if (nextH.hearts !== hearts) setHearts(nextH.hearts);
        setCountdown(getNextHeartCountdown(nextH));
      } catch (error) {
        // silent fail
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [hearts]);

  // ─── SESSION TIME CHECK ──────────────────────────────────────────

  useEffect(() => {
    const checkTime = setInterval(() => {
      const elapsed = (Date.now() - startSessionTime) / 1000 / 60;
      if (elapsed >= 2 && !showBreak && !breakShown && ex.state !== "submitting" && !breakTimer) {
        setShowBreak(true);
        setBreakShown(true);
        setEx((prev) => ({
          ...prev,
          customImage: "/images/nuri/nuri-relax.png",
          nuriSpeech: randomLine("relax"),
        }));
        startBreakTimer(breakDuration);
        playRelaxMusic();
      }
    }, 10000);

    return () => clearInterval(checkTime);
  }, [startSessionTime, showBreak, ex.state, breakDuration, breakTimer, playRelaxMusic, breakShown]);

  // ─── BREAK TIMER ──────────────────────────────────────────────────

  const startBreakTimer = useCallback((minutes: number) => {
    if (breakTimerRef.current) {
      clearInterval(breakTimerRef.current);
      breakTimerRef.current = null;
    }
    
    let remainingSeconds = minutes * 60;
    setBreakTimer(remainingSeconds);
    
    breakTimerRef.current = setInterval(() => {
      remainingSeconds -= 1;
      setBreakTimer(remainingSeconds);
      
      if (remainingSeconds <= 0) {
        clearInterval(breakTimerRef.current!);
        breakTimerRef.current = null;
        handleBreakChoice(false);
      }
    }, 1000);
  }, []);

  const formatBreakTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // ─── TOGGLE HINT ──────────────────────────────────────────────────

  const toggleHint = useCallback(() => {
    setShowHint(prev => !prev);
    if (!showHint && current?.hint) {
      const hintText = current.hint?.[native] || current.hint?.en || "💡 Think about the word order!";
      setEx(prev => ({
        ...prev,
        nuriSpeech: `${t("page_hint_prefix")} ${hintText}`,
      }));
    }
  }, [showHint, current, native, t]);

  // ─── TOGGLE AUDIO ─────────────────────────────────────────────────

  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => !prev);
    if (audioEnabled) {
      stop();
    }
    showMessage(
      audioEnabled ? t("page_audio_disabled") : t("page_audio_enabled"),
      "info"
    );
  }, [audioEnabled, stop, showMessage, t]);

  // ─── SUBMIT ────────────────────────────────────────────────────────

    const submit = useCallback(async (overrideAnswer?: string) => {
    if (!current || ex.state === "submitting") return;

    let answerForApi: string = "";
    let userAnswerText: string = "";

    if (current.type === "word_order") {
      if (selectedWords.length === 0) {
        showMessage(t("page_please_arrange_words"), "info");
        return;
      }
      answerForApi = selectedWords.join(" ");
      userAnswerText = answerForApi;
    } else if (current.type === "match_pairs") {
      const totalPairs = current.pairs?.length || 0;
      const matchedCount = Object.keys(matchPairsMap).length;
      
      if (matchedCount !== totalPairs) {
        showMessage(t("page_please_match_all_pairs", { matched: matchedCount, total: totalPairs }), "info");
        return;
      }
      
      let correctCount = 0;
      let allCorrect = true;
      
      if (current.pairs) {
        for (const [left, right] of current.pairs) {
          if (matchPairsMap[left] === right) {
            correctCount++;
          } else {
            allCorrect = false;
          }
        }
      }
      
      if (allCorrect && current.pairs && correctCount === totalPairs) {
        const score = 1;
        const hayq = 10;
        const seeds = 1;
        
        setStats((prev) => ({
          ...prev,
          correct: prev.correct + 1,
          total: prev.total + 1,
          hayqEarned: prev.hayqEarned + hayq,
          seedsEarned: prev.seedsEarned + seeds,
        }));
        
        setAttempts(0);
        onCorrect();
        
        try {
          const rewards = loadRewards();
          const updated = addHAYQ(updateStreak(rewards), hayq);
          if (seeds > 0) updated.totalSeeds += seeds;
          saveRewards(updated);
          setTotal(updated.totalHAYQ);
          setStreak(updated.streak);
          updateQuestProgress("earn_hayq", hayq);
        } catch {
          // silent fail
        }
        
        setEx((s) => ({
          ...s,
          state: "correct",
          feedback: t("page_all_pairs_correct"),
          score: score,
          hayqEarned: hayq,
          corrections: [],
          nuriMood: "excited",
          nuriSpeech: randomLine("correct_perfect"),
          customImage: "/images/nuri/nuri-encouraging.png",
          showHint: false,
        }));
        
        if (current.pairs) {
          const correctPairs = current.pairs.map(([l, r]) => `${l} → ${r}`).join(", ");
          await new Promise(resolve => setTimeout(resolve, 200));
          await handleSpeak(correctPairs, learningLang, 'answer');
        }
        
        return;
      }
      
      setEx((s) => ({
        ...s,
        state: "incorrect",
        feedback: t("page_some_pairs_correct", { correct: correctCount, total: totalPairs }),
        nuriMood: "sad",
        nuriSpeech: randomLine("almost"),
        customImage: "/images/nuri/nuri-confused.png",
        showHint: false,
      }));
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        try {
          const updated = deductHeart();
          setHearts(updated.hearts);
        } catch {
          // silent fail
        }
        setAttempts(0);
        if (lesson) logMistake(lesson.id, current, newAttempts, false);
      }
      onWrong();
      return;
      } else if (current.type === "multiple_choice") {
        const answerToUse = overrideAnswer ?? ex.userAnswer;
        if (!answerToUse) {
          showMessage(t("page_please_select_answer"), "info");
          return;
        }
        answerForApi = answerToUse;
        const selectedOption = current.options?.find(opt => opt === answerToUse);
        userAnswerText = selectedOption || answerToUse;
    } else {
      if (!ex.userAnswer.trim()) {
        showMessage(t("page_please_enter_answer"), "info");
        return;
      }
      answerForApi = ex.userAnswer.trim();
      userAnswerText = answerForApi;
    }

    setEx((s) => ({
      ...s,
      state: "submitting",
      nuriMood: "thinking",
      nuriSpeech: randomLine("thinking"),
      customImage: "/images/nuri/nuri-thinking.png",
    }));

    try {
      if (isPlaying) {
        stop();
      }

      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAnswer: answerForApi,
          expectedAnswer: current.targetAnswer,
          englishOriginal: current.prompt["en"] ?? current.prompt[native] ?? current.targetAnswer,
          allValidAnswers: current.acceptableAnswers || [],
          sourceLanguage: native,
          targetLanguage: learningLang,
          exerciseType: current.type,
          useAI: false,
        }),
      });
      const data = await res.json();
      const correct = data.accepted;
      const score = data.score ?? 0;
      const hayq = correct ? 10 : 0;
      const seeds = correct && score >= 0.98 ? 1 : 0;

      const timeSpent = Date.now() - exerciseStartTime.current;
      setEx(prev => ({ ...prev, timeSpent: prev.timeSpent + timeSpent }));

      setStats((prev) => ({
        ...prev,
        correct: prev.correct + (correct ? 1 : 0),
        total: prev.total + 1,
        hayqEarned: prev.hayqEarned + hayq,
        seedsEarned: prev.seedsEarned + seeds,
        timeSpent: prev.timeSpent + timeSpent,
      }));

      if (!correct) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 3) {
          try {
            const updated = deductHeart();
            setHearts(updated.hearts);
          } catch {
            // silent fail
          }
          setAttempts(0);
          if (lesson) logMistake(lesson.id, current, newAttempts, false);
        }
        onWrong();

        setEx((s) => ({
          ...s,
          state: "incorrect",
          feedback: data.feedback || t("page_try_again"),
          score: score,
          hayqEarned: hayq,
          corrections: data.corrections,
          nuriMood: "sad",
          nuriSpeech: randomLine("incorrect"),
          customImage: "/images/nuri/nuri-confused.png",
          showHint: false,
        }));

      } else {
        setAttempts(0);
        onCorrect();
        setEx((prev) => ({ ...prev, customImage: "/images/nuri/nuri-encouraging.png" }));
        setCurrentStreak(prev => {
          const newStreak = prev + 1;
          setStats(s => ({ ...s, streaks: s.streaks + 1, bestStreak: Math.max(s.bestStreak, newStreak) }));
          return newStreak;
        });

        setEx((s) => ({
          ...s,
          state: "correct",
          feedback: data.feedback || t("page_correct"),
          score: score,
          hayqEarned: hayq,
          corrections: data.corrections,
          nuriMood: score >= 0.98 ? "excited" : "happy",
          nuriSpeech: randomLine(score >= 0.98 ? "correct_perfect" : "correct"),
          customImage: "/images/nuri/nuri-encouraging.png",
          showHint: false,
        }));
      }

      if (correct) {
        try {
          const rewards = loadRewards();
          const updated = addHAYQ(updateStreak(rewards), hayq);
          if (seeds > 0) updated.totalSeeds += seeds;
          saveRewards(updated);
          setTotal(updated.totalHAYQ);
          setStreak(updated.streak);
          updateQuestProgress("earn_hayq", hayq);
        } catch {
          // silent fail
        }
      }

      if (current.targetAnswer) {
        // ✅ Immediate audio — no delay
        handleSpeak(current.targetAnswer, learningLang, 'answer').catch(() => {});
      }

      let mood: NuriMood = "idle";
      let speechKey = "idle";

      if (correct) {
        mood = score >= 0.98 ? "excited" : "happy";
        speechKey = score >= 0.98 ? "correct_perfect" : "correct";
      } else {
        mood = attempts >= 2 ? "sad" : "idle";
        speechKey = attempts >= 2 ? "almost" : "incorrect";
      }

      setEx((s) => ({
        ...s,
        nuriMood: mood,
        nuriSpeech: randomLine(speechKey),
        customImage: s.customImage,
      }));

      // 🪙 Trigger HAYQ coin animation + auto-advance
      if (correct) {
        setEx((s) => ({ ...s, showCoinAnimation: true }));
        setTimeout(() => {
          setEx((s) => ({ ...s, showCoinAnimation: false }));
          try { nextRef.current?.(); } catch {}
        }, 2200);
      } else {
        // Wrong answer: only auto-advance if 3 attempts used up
        const attemptsUsed = attempts + 1;
        if (attemptsUsed >= 3) {
          setTimeout(() => {
            try { nextRef.current?.(); } catch {}
          }, 2800);
        }
        // Otherwise: stay on same question, show retry button
      }

    } catch (error) {
      console.error("Submit error:", error);
      setEx((s) => ({
        ...s,
        state: "incorrect",
        feedback: t("page_network_error"),
        nuriMood: "sad",
        nuriSpeech: t("page_oops"),
        customImage: "/images/nuri/nuri-confused.png",
      }));
    }
  }, [
    current, 
    ex.userAnswer, 
    ex.state, 
    selectedWords, 
    matchPairsMap, 
    matchLeftItems.length, 
    lesson, 
    streak, 
    native, 
    learningLang,
    attempts, 
    onCorrect, 
    onWrong, 
    startTime, 
    stats.correct, 
    lesson?.exercises?.length, 
    handleSpeak, 
    stop, 
    isPlaying, 
    showMessage,
    t
  ]);

  // ─── COMPLETE LESSON ──────────────────────────────────────────────

  const completeLesson = useCallback(() => {
    if (!lesson) return;

    const bonus = Math.min(40, stats.correct * 2);
    addRewards(bonus, 0, lesson.estimatedMinutes);
    saveCrownLevel(lesson.id, sessionLevel);
    updateQuestProgress("complete_lessons", 1);

    const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

    try {
      saveCompletionToSupabase(
        lesson.id,
        accuracy,
        stats.hayqEarned + bonus,
        sessionLevel,
        Date.now() - startTime
      );
    } catch {
      // silent fail
    }

    clearMistakes(lesson.id);
    onLessonComplete(accuracy >= 90);

    setComplete(true);
  }, [lesson, stats, sessionLevel, startTime, onLessonComplete]);

  // ─── REF FOR SUBMIT ──────────────────────────────────────────────

  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  // ─── NEXT ──────────────────────────────────────────────────────────

  const next = useCallback(() => {
    if (!lesson) return;

    const totalExercises = lesson.exercises?.length || 0;
    const nextIdx = ex.index + 1;

    if (ex.index >= totalExercises - 1 && phase === "main") {
      const retryQ = buildRetryQueue(lesson.id);

      if (retryQ.length > 0) {
        setPhase("retry");
        setRetryStartIndex(totalExercises);

        setLesson((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            exercises: [...prev.exercises, ...retryQ],
          };
        });

        setEx({
          index: totalExercises,
          userAnswer: "",
          matchPairsAnswer: {},
          state: "idle",
          feedback: "",
          score: 0,
          hayqEarned: 0,
          nuriMood: "idle",
          nuriSpeech: randomLine("idle"),
          customImage: "/images/nuri/nuri-thinking.png",
          showHint: false,
          timeSpent: 0,
          showListenButton: false,
          showCoinAnimation: false,
        });
        setSW([]);
        setAW([]);
        setMatchPairsMap({});
        setAttempts(0);
        firstAutoPlayAttempted.current = false;
        return;
      }

      completeLesson();
      return;
    }

    if (phase === "retry" && ex.index >= totalExercises - 1) {
      completeLesson();
      return;
    }

    if (nextIdx < totalExercises) {
      setEx({
        index: nextIdx,
        userAnswer: "",
        matchPairsAnswer: {},
        state: "idle",
        feedback: "",
        score: 0,
        hayqEarned: 0,
        nuriMood: "happy",
        nuriSpeech: randomLine("idle"),
        customImage: "/images/nuri/nuri-thinking.png",
        showHint: false,
        timeSpent: 0,
        showListenButton: false,
      });
      setSW([]);
      setAW([]);
      setMatchPairsMap({});
      setAttempts(0);
      setShowBreak(false);
      if (breakTimerRef.current) {
        clearInterval(breakTimerRef.current);
        breakTimerRef.current = null;
        setBreakTimer(null);
      }
      exerciseStartTime.current = Date.now();
    }
  }, [lesson, ex.index, phase, completeLesson]);

  // ─── REF FOR NEXT ─────────────────────────────────────────────────

  const nextRef = useRef(next);
  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  // ─── KEYBOARD SHORTCUTS ───────────────────────────────────────────

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (ex.state === "idle") {
          submitRef.current();
        } else if (ex.state === "correct" || (ex.state === "incorrect" && attempts >= 3)) {
          nextRef.current();
        }
      }
      if (e.key === "h" || e.key === "H") {
        toggleHint();
      }
      if (e.key === "Escape" && ex.state !== "submitting") {
        setShowExitConfirm(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ex.state, attempts, toggleHint, setShowExitConfirm]);

  // ─── RETRY SAME STEP ──────────────────────────────────────────────

  const retrySameStep = useCallback(() => {
    setEx((s) => ({
      ...s,
      userAnswer: "",
      state: "idle",
      feedback: "",
      score: 0,
      nuriMood: "idle",
      nuriSpeech: randomLine("idle"),
      customImage: "/images/nuri/nuri-thinking.png",
      showHint: false,
      showListenButton: false,
    }));
    if (current?.type === "word_order" && current.words) {
      setAW([...current.words]);
      setSW([]);
    }
    if (current?.type === "match_pairs" && current.pairs) {
      const left = current.pairs.map((p) => p[0]);
      const right = current.pairs.map((p) => p[1]);
      setMatchLeftItems(left);
      setMatchRightItems(shuffleArray([...right]));
      setMatchPairsMap({});
      setEx((prev) => ({ ...prev, matchPairsAnswer: {} }));
    }
    exerciseStartTime.current = Date.now();
  }, [current]);

  // ─── HANDLE BREAK ──────────────────────────────────────────────────

  const handleBreakChoice = useCallback((takeBreak: boolean) => {
    setShowBreak(false);
    if (breakTimerRef.current) {
      clearInterval(breakTimerRef.current);
      breakTimerRef.current = null;
      setBreakTimer(null);
    }
    
    if (takeBreak) {
      startBreakTimer(2);
      setEx((prev) => ({
        ...prev,
        customImage: "/images/nuri/nuri-relax.png",
        nuriSpeech: t("page_relax_message"),
      }));
      showMessage(t("page_take_break"), "info");
      playRelaxMusic();
    } else {
      stopRelaxMusic();
      setEx((prev) => ({
        ...prev,
        customImage: "/images/nuri/nuri-thinking.png",
        nuriSpeech: randomLine("thinking"),
      }));
      exerciseStartTime.current = Date.now();
      showMessage(t("page_continue_learning"), "success");
      setBreakShown(true);
    }
  }, [startBreakTimer, showMessage, playRelaxMusic, stopRelaxMusic, t]);

  // ─── HANDLE REFILL ─────────────────────────────────────────────────

  const handleRefill = useCallback(() => {
    try {
      const result = buyHeartRefill();
      if (result.success) {
        setHearts(result.rewards.hearts);
        setTotal(result.rewards.totalHAYQ);
      } else {
        showMessage(result.error || t("page_refill_failed"), "error");
      }
    } catch (error) {
      showMessage(t("page_something_went_wrong"), "error");
    }
  }, [showMessage, t]);

  // ─── HANDLE PRACTICE ──────────────────────────────────────────────

  const handlePractice = useCallback(() => {
    try {
      const result = earnHeartByPractice();
      if (result.success) {
        setHearts(result.rewards.hearts);
      } else {
        showMessage(t("page_already_full_hearts"), "info");
      }
    } catch (error) {
      showMessage(t("page_something_went_wrong"), "error");
    }
  }, [showMessage, t]);

  // ─── EXIT ──────────────────────────────────────────────────────────

  const exitToWorld = useCallback(() => {
    stopRelaxMusic();
    router.push("/world");
  }, [router, stopRelaxMusic]);

  // ─── UNLOCK ALL LESSONS ──────────────────────────────────────────

  const unlockAllLessons = useCallback(() => {
    if (!lesson) return;
    
    const unlockedExercises = lesson.exercises.map((ex) => ({
      ...ex,
      unlocked: true,
    }));
    
    setLesson((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: unlockedExercises,
      };
    });
    
    showMessage(t("page_all_lessons_unlocked"), "success");
  }, [lesson, showMessage, t]);

  // ─── SAVE COMPLETION ──────────────────────────────────────────────

  async function saveCompletionToSupabase(
    lessonId: string,
    accuracy: number,
    hayqEarned: number,
    crownLevel: number,
    durationMs: number
  ) {
    try {
      const deviceId = getOrCreateDeviceId();
      await supabase.from("lesson_completions" as any).upsert(
        {
          device_id: deviceId,
          lesson_id: lessonId,
          accuracy,
          hayq_earned: hayqEarned,
          crown_level: crownLevel,
          duration_ms: durationMs,
        },
        { onConflict: "device_id,lesson_id" }
      );
    } catch {
      // silently ignore
    }
  }

  // ─── COMPLETION SCREEN ────────────────────────────────────────────

  if (complete && lesson) {
    const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    const crownCount = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;
    const lessonTitle = typeof lesson.title === "string" ? lesson.title : lesson.title[native] || lesson.title.en;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-transparent dark:bg-transparent text-gray-900 dark:text-white">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="mb-6"
        >
          <img
            src="/images/nuri/nuri-celebrating.png"
            alt={t("page_celebrating")}
            className="w-40 h-40 object-contain"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold mb-1 text-gray-900 dark:text-white"
        >
          {accuracy >= 90 ? t("page_perfect") : accuracy >= 70 ? t("page_great") : t("page_good_job")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-500 dark:text-gray-400 text-sm mb-6"
        >
          {lessonTitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3 mb-6"
        >
          {[1, 2, 3].map((n) => (
            <motion.span
              key={n}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4 + n * 0.12, type: "spring", damping: 8 }}
              className={`text-4xl ${n <= crownCount ? "opacity-100" : "opacity-20 grayscale"}`}
            >
              ⭐
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-3 mb-6 w-full max-w-xs"
        >
          <GlassCard variant="compact" className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-500">{accuracy}%</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("page_accuracy")}</p>
          </GlassCard>
          <GlassCard variant="compact" className="p-3 text-center">
            <p className="text-2xl font-bold text-yellow-500">+{stats.hayqEarned}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">HAYQ</p>
          </GlassCard>
          <GlassCard variant="compact" className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-500">{formatTime(Date.now() - startTime)}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("page_time")}</p>
          </GlassCard>
        </motion.div>

        <div className="w-full max-w-xs bg-white/10 dark:bg-gray-700 rounded-full h-2.5 mb-6 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400"
            initial={{ width: 0 }}
            animate={{ width: `${accuracy}%` }}
            transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
          />
        </div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={() => router.push("/world")}
          className="w-full max-w-xs py-4 text-sm flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
        >
          <Trophy size={18} />
          {t("page_continue")} →
        </motion.button>
      </div>
    );
  }

  // ─── NO HEARTS SCREEN ─────────────────────────────────────────────

  if (hearts <= 0) {
    const minutesLeft = Math.ceil(countdown / 60000);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-transparent dark:bg-transparent text-gray-900 dark:text-white">
        <GlassCard variant="premium" className="p-8 max-w-sm w-full">
          <div className="text-6xl mb-4">💔</div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t("page_no_hearts")}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {t("page_next_heart_in", { minutes: minutesLeft })}
          </p>

          <div className="space-y-3">
            <button
              onClick={handlePractice}
              className="w-full py-3 text-sm flex items-center justify-center gap-2 rounded-xl border border-white/20 dark:border-gray-700 hover:bg-white/10 dark:hover:bg-gray-800 transition-colors font-medium text-gray-700 dark:text-gray-300"
            >
              <RefreshCw size={16} />
              {t("page_practice_for_heart")}
            </button>
            <button
              onClick={handleRefill}
              className="w-full py-3 text-sm flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
            >
              <Coins size={16} />
              {t("page_refill_hearts", { hayq: totalHAYQ })}
            </button>
            <button
              onClick={exitToWorld}
              className="w-full text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              ← {t("page_back_to_world")}
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!lesson || !current) return null;

  // ─── MAIN RENDER ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent text-gray-900 dark:text-white">
      <header className="sticky top-0 z-40 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border-b border-white/20 dark:border-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
        <div className="container-main py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExitConfirm(true)}
                className="p-2 rounded-xl hover:bg-white/10 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                aria-label={t("page_back")}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-sm font-bold truncate max-w-[120px] sm:max-w-none text-gray-900 dark:text-white">
                  {typeof lesson.title === "string" ? lesson.title : lesson.title[native] || lesson.title.en}
                </h2>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  {isRetryPhase && <span>{t("page_review")} · </span>}
                  <span className="text-blue-500">{t("page_online")} · </span>
                  {t("page_lesson_x_of_y", { current: ex.index + 1, total: lesson.exercises?.length || 0 })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button
                onClick={toggleMode}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  isProfessional
                    ? "bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30"
                    : "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                }`}
                title={isProfessional ? t("page_amateur_mode") : t("page_professional_mode")}
              >
                {isProfessional ? <GraduationCap size={14} /> : <Gamepad2 size={14} />}
                <span className="hidden sm:inline">
                  {isProfessional ? t("page_professional_short") : t("page_amateur_short")}
                </span>
              </button>

              <button
                onClick={toggleAudio}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  audioEnabled
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"
                    : "bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30"
                }`}
                title={audioEnabled ? t("page_audio_on") : t("page_audio_off")}
              >
                {audioEnabled ? <Volume2 size={14} /> : <VolumeOff size={14} />}
                <span className="hidden sm:inline">
                  {audioEnabled ? t("page_audio_on") : t("page_audio_off")}
                </span>
              </button>

              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/40 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                <Heart size={16} className="text-red-500" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">{hearts}</span>
              </div>

              {attempts > 0 && ex.state !== "correct" && (
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/40 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                  <span className="text-xs text-yellow-500">❌</span>
                  <span className="text-sm font-bold text-yellow-500">{attempts}/3</span>
                </div>
              )}

              {currentStreak > 1 && (
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                  <Flame size={14} className="text-orange-500" />
                  <span className="text-sm font-bold text-orange-500">{currentStreak}</span>
                </div>
              )}

              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/40 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                <Coins size={16} className="text-yellow-500" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">{totalHAYQ}</span>
              </div>

              <button
                onClick={() => setShowStatsPanel(!showStatsPanel)}
                className="p-2 rounded-xl hover:bg-white/10 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                title={t("page_stats")}
              >
                <BarChart3 size={18} />
              </button>
            </div>
          </div>

          <div className="mt-2 w-full h-1.5 rounded-full bg-white/10 dark:bg-gray-700 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {isPlaying && (
            <p className="text-xs text-blue-400 animate-pulse mt-1.5 flex items-center gap-1">
              <Mic size={12} className="animate-pulse" />
              {t("page_speaking")}
            </p>
          )}
          
          {breakTimer !== null && (
            <p className="text-xs text-green-400 animate-pulse mt-1.5 flex items-center gap-1">
              <Clock size={12} className="animate-pulse" />
              {t("page_break_remaining", { time: formatBreakTime(breakTimer) })}
            </p>
          )}

          {isRelaxing && (
            <p className="text-xs text-green-400/60 mt-1.5 flex items-center gap-1 animate-pulse">
              <Play size={12} className="animate-pulse" />
              🎵 {t("page_relax_music")}
            </p>
          )}

          <p className="text-xs text-blue-400/80 mt-1.5 flex items-center gap-1">
            <Wifi size={12} />
            {t("page_online_mode", { native, learning: learningLang, wav: isWAVAvailable ? t("page_wav_available") : t("page_tts_only") })}
          </p>
        </div>
      </header>

      <AnimatePresence>
        {showStatsPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-white/20 dark:border-white/5"
          >
            <div className="container-main py-3">
              <GlassCard variant="premium" className="p-4">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-emerald-500">{stats.correct}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">{t("page_correct")}</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-500">{stats.total - stats.correct}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">{t("page_wrong")}</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-500">{stats.hayqEarned}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">HAYQ</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-emerald-500">{stats.seedsEarned}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">🌱 {t("page_seeds")}</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-500">{stats.bestStreak}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">{t("page_best_streak")}</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-500">{formatTime(stats.timeSpent)}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">{t("page_time")}</div>
                  </div>
                </div>
                <div className="mt-2 text-center text-xs text-blue-500">
                  {t("page_online_mode_detail", { native, learning: learningLang, wav: isWAVAvailable ? t("page_wav_tts") : t("page_tts_only") })}
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container-main py-6">
        <div className="flex flex-col items-center gap-6">
          <NuriSpeech text={ex.nuriSpeech} mood={ex.nuriMood} />
          
          {/* 🪙 HAYQ Coin Animation */}
          <HaqCoinAnimation amount={ex.hayqEarned} show={!!ex.showCoinAnimation} />
          {ex.customImage ? (
            <div className="w-[100px] h-[100px] relative">
              <img
                src={ex.customImage}
                alt={t("page_nuri")}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <Nuri mood={ex.nuriMood} size={100} glow={ex.state === "correct"} />
          )}

          <AnimatePresence>
            {showBreak && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-full max-w-sm"
              >
                <GlassCard variant="premium" className="w-full max-w-sm p-6 text-center">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                      onClick={() => handleBreakChoice(true)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/10 dark:hover:bg-gray-800 transition-colors"
                    >
                      <img
                        src="/images/nuri/nuri-relax.png"
                        alt={t("page_take_break")}
                        className="w-16 h-16 object-contain"
                      />
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">☕ {t("page_take_break")}</span>
                      {breakTimer !== null && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          {formatBreakTime(breakTimer)}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleBreakChoice(false)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/10 dark:hover:bg-gray-800 transition-colors"
                    >
                      <img
                        src="/images/nuri/nuri-shy.png"
                        alt={t("page_continue")}
                        className="w-16 h-16 object-contain"
                      />
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">😊 {t("page_continue")}</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {ex.nuriSpeech || t("page_break_choice")}
                  </p>
                  {breakTimer !== null && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      ⏱️ {formatBreakTime(breakTimer)} {t("page_remaining")}
                    </p>
                  )}
                  {isRelaxing && (
                    <p className="text-xs text-green-400/60 mt-2 flex items-center justify-center gap-1 animate-pulse">
                      <Play size={12} className="animate-pulse" />
                      🎵 {t("page_relax_music")}
                    </p>
                  )}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          <GlassCard variant="premium" className="w-full max-w-2xl p-6">
            {isRetryPhase && (
              <p className="text-xs font-black uppercase tracking-widest text-purple-400 mb-2 flex items-center gap-1">
                <Brain size={14} /> {t("page_review_mistake")}
              </p>
            )}

            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {current.prompt[native] ?? current.prompt["en"]}
              </h3>
              <div className="flex items-center gap-2">
                {ex.showListenButton && (
                  <button
                    onClick={() => {
                      const promptText = current.prompt?.[native] || current.prompt?.en || "";
                      playAudioWithFallback(promptText, native, 'prompt')
                        .then(() => setEx(prev => ({ ...prev, showListenButton: false })))
                        .catch(() => {});
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-xs font-bold flex items-center gap-1 animate-pulse"
                  >
                    <Volume2 size={14} />
                    {t("page_listen")}
                  </button>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/40 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                  {ex.index + 1}/{lesson.exercises?.length}
                </span>
              </div>
            </div>

            {current.hint && (showHint || sessionLevel === 1) && current.hint[native] && (
              <p className="text-sm text-amber-400 mb-4 flex items-center gap-2">
                <Sparkles size={14} />
                {current.hint[native]}
              </p>
            )}

            {ex.state === "incorrect" && attempts < 3 && (
              <p className="text-amber-500 text-sm mb-3 font-bold flex items-center gap-2">
                <AlertCircle size={14} />
                {t("page_attempts_left", { count: attemptsLeft })}
              </p>
            )}

            {ex.state === "incorrect" && attempts >= 3 && (
              <div className="mb-4 p-4 bg-blue-50/50 dark:bg-blue-950/30 backdrop-blur-sm border border-blue-200/30 dark:border-blue-800/30 rounded-xl">
                <p className="text-xs font-black uppercase tracking-widest text-blue-500 mb-2 flex items-center gap-1">
                  <BookOpen size={12} /> {t("page_lets_learn_from_answer")}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">✅ {current.targetAnswer}</p>
                {current.acceptableAnswers && current.acceptableAnswers.length > 1 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("page_also_valid")}: {current.acceptableAnswers.slice(1, 4).join(", ")}
                  </p>
                )}
                {current.hint?.[native] && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">💡 {current.hint[native]}</p>
                )}
              </div>
            )}

            <div className="mt-4">
              {current.type === "word_order" && current.words ? (
                <WordOrderInput
                  selected={selectedWords}
                  available={availWords}
                  onSelect={(w) => {
                    setSW([...selectedWords, w]);
                    setAW(availWords.filter((x) => x !== w));
                  }}
                  onDeselect={(w) => {
                    setAW([...availWords, w]);
                    setSW(selectedWords.filter((x) => x !== w));
                  }}
                  disabled={ex.state !== "idle"}
                  t={t}
                />
              ) : current.type === "multiple_choice" && current.options ? (
                <MultipleChoiceInput
                  options={current.options}
                  targetAnswer={current.targetAnswer}
                  userAnswer={ex.userAnswer}
                  state={ex.state}
                  onSelect={(opt) => {
                    if (ex.state === "idle") {
                      setEx({ ...ex, userAnswer: opt });
                      // ✅ Auto-submit immediately (50ms for UI feedback)
                      setTimeout(() => submitRef.current?.(opt), 50);
                    }
                  }}
                  disabled={ex.state !== "idle"}
                />
              ) : current.type === "match_pairs" && current.pairs ? (
                <MatchPairsInput
                  leftItems={matchLeftItems}
                  rightItems={matchRightItems}
                  matched={matchPairsMap}
                  onMatch={(left, right) => {
                    const newMap = { ...matchPairsMap, [left]: right };
                    setMatchPairsMap(newMap);
                    setEx((prev) => ({ ...prev, matchPairsAnswer: newMap }));
                    setMatchRightItems((prev) => prev.filter((r) => r !== right));
                  }}
                  onUnmatch={(left) => {
                    const newMap = { ...matchPairsMap };
                    const right = newMap[left];
                    delete newMap[left];
                    setMatchPairsMap(newMap);
                    setEx((prev) => ({ ...prev, matchPairsAnswer: newMap }));
                    if (right) {
                      setMatchRightItems((prev) => [...prev, right]);
                    }
                  }}
                  disabled={ex.state !== "idle"}
                />
              ) : current.type === "listening" && current.ttsText ? (
                <ListeningInput
                  ttsText={current.ttsText}
                  ttsLang={current.ttsLang || "hy"}
                  promptText={current.prompt[native] ?? current.prompt["en"]}
                  value={ex.userAnswer}
                  onChange={(val) => setEx({ ...ex, userAnswer: val })}
                  disabled={ex.state !== "idle"}
                  onSpeak={handleSpeak}
                  isSpeaking={isPlaying}
                  t={t}
                />
              ) : (
                <FreeTextInput
                  value={ex.userAnswer}
                  onChange={(val) => setEx({ ...ex, userAnswer: val })}
                  disabled={ex.state !== "idle"}
                  placeholder={t("page_enter_your_answer")}
                  onSpeak={handleSpeak}
                  textToSpeak={ex.userAnswer}
                />
              )}
            </div>
          </GlassCard>

          <div className="w-full max-w-2xl">
                        {ex.state === "idle" ? (
              <div className="flex gap-3">
                <button
                  onClick={toggleHint}
                  className="px-4 py-3 rounded-xl border border-white/20 dark:border-gray-700 hover:bg-white/10 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Info size={16} />
                  {t("page_hint")}
                </button>
                {current?.type !== "multiple_choice" && (
                  <button
                    onClick={() => submit()}
                    className="flex-1 py-4 text-sm flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
                  >
                    <Send size={18} />
                    {t("page_check_enter")}
                  </button>
                )}
                {current?.type === "multiple_choice" && (
                  <div className="flex-1 py-4 text-center text-gray-400 dark:text-gray-500 text-sm font-medium flex items-center justify-center gap-2">
                    <MousePointerClick size={16} />
                    {native === "hy" ? "Ընտրիր պատասխանը" : native === "ru" ? "Выберите ответ" : "Choose an answer"}
                  </div>
                )}
              </div>
            ) : ex.state === "incorrect" && attempts < 3 ? (
              <button
                onClick={retrySameStep}
                className="w-full py-4 text-sm flex items-center justify-center gap-2 rounded-xl border border-white/20 dark:border-gray-700 hover:bg-white/10 dark:hover:bg-gray-800 transition-colors font-medium text-gray-700 dark:text-gray-300"
              >
                <RefreshCw size={18} />
                {t("page_try_again_left", { count: attemptsLeft })}
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-xl p-5 backdrop-blur-sm ${
                  ex.state === "correct"
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-red-500/30 bg-red-500/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {ex.state === "correct" ? (
                      <CheckCircle size={24} className="text-emerald-500" />
                    ) : (
                      <XCircle size={24} className="text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{ex.feedback}</p>
                    {ex.corrections && ex.corrections.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-semibold">{t("page_correct_answer")}</p>
                        <ul className="list-disc list-inside">
                          {ex.corrections.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {ex.hayqEarned > 0 && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-bold">
                        <Coins size={12} /> +{ex.hayqEarned} HAYQ
                      </div>
                    )}
                  </div>
                </div>
                {ex.state === "correct" ? (
                  <div className="mt-4 w-full h-1.5 bg-emerald-500/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.2, ease: "linear" }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                ) : (
                  <div className="mt-4 w-full h-1.5 bg-red-500/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.8, ease: "linear" }}
                      className="h-full bg-red-500"
                    />
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowExitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-sm w-full"
            >
              <GlassCard variant="premium" className="max-w-sm w-full p-6 text-center">
                <Nuri mood="sad" size={80} />
                <h3 className="text-xl font-black text-gray-900 dark:text-white mt-3 mb-2">{t("page_exit_lesson_title")}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                  {t("page_exit_lesson_description")}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1 py-3 rounded-xl border border-white/20 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-800 transition-colors"
                  >
                    {t("page_stay")}
                  </button>
                  <button
                    onClick={exitToWorld}
                    className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
                  >
                    {t("page_exit")}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border px-6 py-3 max-w-sm rounded-xl text-center shadow-xl ${
              toastType === "success"
                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : toastType === "error"
                ? "border-red-500/30 text-red-600 dark:text-red-400"
                : "border-blue-500/30 text-blue-600 dark:text-blue-400"
            }`}
          >
            <p className="text-sm font-medium">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-transparent dark:bg-transparent">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin border-red-600" />
        </div>
      }
    >
      <LearnInner />
    </Suspense>
  );
}