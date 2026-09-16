// src/app/dialogues/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNuri } from "@/hooks/useNuri";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Play,
  Volume2,
  VolumeX,
  Search,
  X,
  MessageSquare,
  Sparkles,
  User,
  Bot,
  Eye,
  EyeOff,
  RefreshCw,
  Users,
  Mic,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowUp,
  Filter,
  ChevronRight,
  Star,
  Share2,
  Bookmark,
  BookmarkCheck,
  Download,
  Languages,
  Globe,
  Headphones,
  Radio,
  Speaker,
  Zap,
  TrendingUp,
  BarChart3,
  Calendar,
  Award,
  Target,
  Brain,
  Heart,
  Smile,
  Frown,
  Meh,
  Laugh,
  Flame,
  Gift,
  Settings,
  Plus,
  Copy,
  Check,
  Music,
  List,
  Grid3x3,
  SortAsc,
  SortDesc,
  FilterX,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import InteractiveDialogue from "@/components/InteractiveDialogue";
import { CONTENT_LESSONS, type DialogueTurn } from "@/lib/content/database";
import { loadLangConfig, type LangCode } from "@/lib/i18n/index";
import { useAudio } from "@/lib/hooks/useAudio";
import { useAudioManager } from "@/lib/hooks/useAudioManager";
import Nuri, { NuriSpeech, type NuriMood } from "@/components/Nuri";
import ThemeToggle from "@/components/ThemeToggle";
import { getWavClient } from "@/lib/audio/WavClient";
import { useI18n } from "@/hooks/useI18n"; // ✅ ՃԻՇՏ import

// ─── CHARACTER MAPPING ──────────────────────────────────────────────

const CHARACTER_AVATARS: Record<string, string> = {
  nurik: "🐿️",
  user: "🧑‍🎓",
  anahit: "👩",
  arman: "👨",
  nare: "👧",
  david: "👦",
  lusine: "👩‍🦰",
  hayk: "👨‍🦱",
  anna: "👩‍🦳",
  armen: "👨‍🦰",
};

const CHARACTER_EMOJIS: Record<string, string> = {
  nurik: "🐿️",
  user: "🧑‍🎓",
  anahit: "👩",
  arman: "👨",
  nare: "👧",
  david: "👦",
  lusine: "👩‍🦰",
  hayk: "👨‍🦱",
  anna: "👩‍🦳",
  armen: "👨‍🦰",
};

const CHARACTER_NAMES: Record<string, Record<LangCode, string>> = {
  nurik: { hy: "Նուրիկ", en: "Nurik", ru: "Нурик" },
  user: { hy: "Դուք", en: "You", ru: "Вы" },
  anahit: { hy: "Անահիտ", en: "Anahit", ru: "Анаит" },
  arman: { hy: "Արման", en: "Arman", ru: "Арман" },
  nare: { hy: "Նարե", en: "Nare", ru: "Наре" },
  david: { hy: "Դավիթ", en: "David", ru: "Давид" },
  lusine: { hy: "Լուսինե", en: "Lusine", ru: "Лусине" },
  hayk: { hy: "Հայկ", en: "Hayk", ru: "Айк" },
  anna: { hy: "Աննա", en: "Anna", ru: "Анна" },
  armen: { hy: "Արմեն", en: "Armen", ru: "Армен" },
};

const CHARACTER_COLORS: Record<string, string> = {
  nurik: "bg-amber-500/20 border-amber-500/20 text-amber-400",
  user: "bg-emerald-500/20 border-emerald-500/20 text-emerald-400",
  anahit: "bg-pink-500/20 border-pink-500/20 text-pink-400",
  arman: "bg-blue-500/20 border-blue-500/20 text-blue-400",
  nare: "bg-purple-500/20 border-purple-500/20 text-purple-400",
  david: "bg-indigo-500/20 border-indigo-500/20 text-indigo-400",
  lusine: "bg-rose-500/20 border-rose-500/20 text-rose-400",
  hayk: "bg-cyan-500/20 border-cyan-500/20 text-cyan-400",
  anna: "bg-orange-500/20 border-orange-500/20 text-orange-400",
  armen: "bg-teal-500/20 border-teal-500/20 text-teal-400",
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
  worried: "😰",
  proud: "😌",
  curious: "🧐",
  grateful: "🙏",
  tired: "😴",
  energetic: "⚡",
  funny: "😂",
  serious: "😤",
};

const getMoodEmoji = (mood?: string): string => {
  if (!mood) return "😐";
  return MOOD_EMOJIS[mood] || "😐";
};

const DIFFICULTY_LABELS: Record<string, { labelKey: string; color: string; icon: string }> = {
  beginner: { labelKey: "dialogues_difficulty_beginner", color: "text-green-400 bg-green-500/20", icon: "🌱" },
  intermediate: { labelKey: "dialogues_difficulty_intermediate", color: "text-yellow-400 bg-yellow-500/20", icon: "📈" },
  advanced: { labelKey: "dialogues_difficulty_advanced", color: "text-red-400 bg-red-500/20", icon: "🔥" },
};

const CATEGORY_LABELS: Record<string, { labelKey: string; icon: string }> = {
  daily: { labelKey: "dialogues_category_daily", icon: "☀️" },
  travel: { labelKey: "dialogues_category_travel", icon: "✈️" },
  food: { labelKey: "dialogues_category_food", icon: "🍽️" },
  family: { labelKey: "dialogues_category_family", icon: "👨‍👩‍👦" },
  work: { labelKey: "dialogues_category_work", icon: "💼" },
  shopping: { labelKey: "dialogues_category_shopping", icon: "🛍️" },
  health: { labelKey: "dialogues_category_health", icon: "🏥" },
  education: { labelKey: "dialogues_category_education", icon: "📚" },
  entertainment: { labelKey: "dialogues_category_entertainment", icon: "🎭" },
  social: { labelKey: "dialogues_category_social", icon: "🤝" },
};

interface DialogueWithMeta {
  id: string;
  lessonTitle: string;
  worldTitle: string;
  dialogueTitle: { en: string; hy: string; ru: string };
  turns: DialogueTurn[];
  worldId: string;
  lessonId: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  category?: string;
  duration?: number;
  tags?: string[];
  pair?: string;
  native?: LangCode;
  learning?: LangCode;
}

interface DialogueStats {
  total: number;
  totalTurns: number;
  completed: number;
  inProgress: number;
  byDifficulty: Record<string, number>;
  byCategory: Record<string, number>;
  favoriteCount: number;
  totalDuration: number;
}

type SortOption = "default" | "newest" | "oldest" | "alphabetical" | "popular" | "progress";
type FilterOption = "all" | "beginner" | "intermediate" | "advanced" | "favorites" | "completed" | "in-progress" | "daily" | "travel" | "food" | "family" | "work";
type ViewMode = "list" | "grid" | "compact";

// ─── LOCAL STORAGE KEYS ─────────────────────────────────────────────

const STORAGE_KEYS = {
  DIALOGUE_FAVORITES: "nurlingo_dialogue_favorites",
  DIALOGUE_PROGRESS: "nurlingo_dialogue_progress",
  DIALOGUE_HISTORY: "nurlingo_dialogue_history",
  DIALOGUE_SETTINGS: "nurlingo_dialogue_settings",
  DIALOGUE_VIEW: "nurlingo_dialogue_view",
};

// ─── HELPERS ─────────────────────────────────────────────────────────

const formatDuration = (minutes?: number): string => {
  if (!minutes) return "—";
  if (minutes < 1) return "< 1 ր";
  if (minutes < 60) return `${minutes} ր`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} ժ ${mins} ր` : `${hours} ժ`;
};

// ─── PROGRESS BAR ────────────────────────────────────────────────────

function DialogueProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-1 rounded-full bg-white/10 dark:bg-gray-700 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function DialoguesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPage } = useNuri();
  const { t, locale } = useI18n(); // ✅ Ավելացված locale
  
  // ─── GET pairParam FROM URL ──────────────────────────────────────
  const pairParam = searchParams?.get("pair") || undefined; // ✅ Ուղղված `searchParams`-ի null-ի դեպքում
  
  // ─── LOCAL TOAST ──────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
  
  const showMessage = useCallback((text: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage(text);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  }, []);
  
  useEffect(() => setPage("dialogues"), [setPage]);
  
  const { play, stop, isPlaying, isLoading } = useAudioManager();
  const { speak, stop: stopAudio, isSpeaking } = useAudio();
  
  // ─── STATE ──────────────────────────────────────────────────────────

  const [dialogues, setDialogues] = useState<DialogueWithMeta[]>([]);
  const [nativeLang, setNativeLang] = useState<LangCode>("hy");
  const [expandedDialogue, setExpandedDialogue] = useState<string | null>(null);
  const [revealedLines, setRevealedLines] = useState<Record<string, boolean>>({});
  const [interactiveMode, setInteractiveMode] = useState<Record<string, boolean>>({});
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [nuriMood, setNuriMood] = useState<NuriMood>("idle");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [dialogStats, setDialogStats] = useState<DialogueStats | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [autoReveal, setAutoReveal] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState<string | null>(null);
  const [isWAVAvailable, setIsWAVAvailable] = useState(false);
  const [audioMode, setAudioMode] = useState<"wav" | "tts" | "mp3">("wav");
  const [wavClient, setWavClient] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDialogues, setSelectedDialogues] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const dialogueRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ─── LOAD VIEW PREFERENCE ─────────────────────────────────────────

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DIALOGUE_VIEW);
      if (saved) {
        const view = JSON.parse(saved);
        if (view.viewMode) setViewMode(view.viewMode);
        if (view.sortOption) setSortOption(view.sortOption);
        if (view.filterOption) setFilterOption(view.filterOption);
      }
    } catch {
      // Ignore
    }
  }, []);

  // ─── SAVE VIEW PREFERENCE ─────────────────────────────────────────

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DIALOGUE_VIEW, JSON.stringify({
        viewMode,
        sortOption,
        filterOption,
      }));
    } catch {
      // Ignore
    }
  }, [viewMode, sortOption, filterOption]);

  // ─── LOAD FAVORITES & PROGRESS ────────────────────────────────────

  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem(STORAGE_KEYS.DIALOGUE_FAVORITES);
      if (savedFavs) setFavorites(new Set(JSON.parse(savedFavs)));
      
      const savedProgress = localStorage.getItem(STORAGE_KEYS.DIALOGUE_PROGRESS);
      if (savedProgress) setProgress(JSON.parse(savedProgress));
      
      const savedCompleted = localStorage.getItem(STORAGE_KEYS.DIALOGUE_HISTORY);
      if (savedCompleted) setCompleted(new Set(JSON.parse(savedCompleted)));
      
      const savedSettings = localStorage.getItem(STORAGE_KEYS.DIALOGUE_SETTINGS);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.autoReveal !== undefined) setAutoReveal(settings.autoReveal);
        if (settings.autoPlayAudio !== undefined) setAutoPlayAudio(settings.autoPlayAudio);
      }
    } catch {
      // Ignore
    }
  }, []);

  // ─── SAVE FAVORITES ────────────────────────────────────────────────

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(STORAGE_KEYS.DIALOGUE_FAVORITES, JSON.stringify([...next]));
      return next;
    });
  }, []);

  // ─── UPDATE PROGRESS ───────────────────────────────────────────────

  const updateProgress = useCallback((id: string, value: number) => {
    setProgress(prev => {
      const updated = { ...prev, [id]: value };
      localStorage.setItem(STORAGE_KEYS.DIALOGUE_PROGRESS, JSON.stringify(updated));
      return updated;
    });
    if (value >= 100) {
      setCompleted(prev => {
        const next = new Set(prev);
        next.add(id);
        localStorage.setItem(STORAGE_KEYS.DIALOGUE_HISTORY, JSON.stringify([...next]));
        return next;
      });
    }
  }, []);

  // ─── SAVE SETTINGS ─────────────────────────────────────────────────

  const saveSettings = useCallback((key: string, value: any) => {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.DIALOGUE_SETTINGS) || '{}');
      current[key] = value;
      localStorage.setItem(STORAGE_KEYS.DIALOGUE_SETTINGS, JSON.stringify(current));
    } catch {
      // Ignore
    }
  }, []);

  // ─── TYPE GUARD ─────────────────────────────────────────────────────

  function isValidDialogueTitle(value: any): value is { en: string; hy: string; ru: string } {
    return value && typeof value === 'object' && 
      typeof value.en === 'string' && 
      typeof value.hy === 'string' && 
      typeof value.ru === 'string';
  }

  // ─── LOAD DIALOGUES ───────────────────────────────────────────────

  useEffect(() => {
    const cfg = loadLangConfig();
    setNativeLang(cfg?.native || "hy");

    const allDialogues: DialogueWithMeta[] = [];
    for (const lesson of CONTENT_LESSONS) {
      if (lesson.dialogues && lesson.dialogues.length > 0) {
        for (const dlg of lesson.dialogues) {
          const turns = dlg.turns || [];
          
          const dialogueTitle = isValidDialogueTitle(dlg.title) 
            ? dlg.title 
            : { en: String(dlg.title), hy: String(dlg.title), ru: String(dlg.title) };
          
          const pair = pairParam || cfg?.pair || 'hy-en';
          const [native, learning] = pair.split('-') as [LangCode, LangCode];
          
          allDialogues.push({
            id: dlg.id,
            lessonTitle: lesson.title.en,
            worldTitle: t("page__world") + ` ${lesson.worldId.slice(1)}`,
            dialogueTitle: dialogueTitle,
            turns: turns,
            worldId: lesson.worldId,
            lessonId: lesson.id,
            difficulty: (dlg as any).difficulty || "intermediate",
            category: (dlg as any).category || "daily",
            duration: (dlg as any).duration || Math.ceil(turns.length / 2),
            tags: (dlg as any).tags || [],
            pair: pair,
            native: native,
            learning: learning,
          });
        }
      }
    }
    setDialogues(allDialogues);
    calculateStats(allDialogues);
  }, [pairParam, t]);

  // ─── CALCULATE STATS ──────────────────────────────────────────────

  const calculateStats = useCallback((data: DialogueWithMeta[]) => {
    const stats: DialogueStats = {
      total: data.length,
      totalTurns: data.reduce((acc, d) => acc + d.turns.length, 0),
      completed: data.filter(d => completed.has(d.id)).length,
      inProgress: data.filter(d => progress[d.id] && progress[d.id] > 0 && progress[d.id] < 100).length,
      byDifficulty: {},
      byCategory: {},
      favoriteCount: data.filter(d => favorites.has(d.id)).length,
      totalDuration: data.reduce((acc, d) => acc + (d.duration || 0), 0),
    };
    
    data.forEach(d => {
      const diff = d.difficulty || "intermediate";
      stats.byDifficulty[diff] = (stats.byDifficulty[diff] || 0) + 1;
      const cat = d.category || "daily";
      stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
    });
    
    setDialogStats(stats);
  }, [completed, progress, favorites]);

  // ─── SCROLL EVENT ──────────────────────────────────────────────────

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── KEYBOARD SHORTCUTS ───────────────────────────────────────────

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShowFilters(false);
        setShowStats(false);
        setExpandedDialogue(null);
        setIsBatchMode(false);
        setSelectedDialogues(new Set());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // ─── INIT WAV ──────────────────────────────────────────────────────

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

  // ─── FILTERED & SORTED DIALOGUES ──────────────────────────────────

  const filteredDialogues = useMemo(() => {
    let items = [...dialogues];
    
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (dlg) =>
          dlg.dialogueTitle[nativeLang]?.toLowerCase().includes(q) ||
          dlg.dialogueTitle.en.toLowerCase().includes(q) ||
          dlg.lessonTitle.toLowerCase().includes(q) ||
          dlg.turns.some(t => t.hy.toLowerCase().includes(q) || t.en.toLowerCase().includes(q))
      );
    }
    
    switch (filterOption) {
      case "beginner":
        items = items.filter(d => d.difficulty === "beginner");
        break;
      case "intermediate":
        items = items.filter(d => d.difficulty === "intermediate");
        break;
      case "advanced":
        items = items.filter(d => d.difficulty === "advanced");
        break;
      case "favorites":
        items = items.filter(d => favorites.has(d.id));
        break;
      case "completed":
        items = items.filter(d => completed.has(d.id));
        break;
      case "in-progress":
        items = items.filter(d => progress[d.id] && progress[d.id] > 0 && progress[d.id] < 100);
        break;
      case "daily":
      case "travel":
      case "food":
      case "family":
      case "work":
        items = items.filter(d => d.category === filterOption);
        break;
      default:
        break;
    }
    
    switch (sortOption) {
      case "newest":
        items.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case "oldest":
        items.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "alphabetical":
        items.sort((a, b) => (a.dialogueTitle[nativeLang] || a.dialogueTitle.en).localeCompare(
          b.dialogueTitle[nativeLang] || b.dialogueTitle.en
        ));
        break;
      case "popular":
        items.sort((a, b) => (favorites.has(b.id) ? 1 : 0) - (favorites.has(a.id) ? 1 : 0));
        break;
      case "progress":
        items.sort((a, b) => (progress[b.id] || 0) - (progress[a.id] || 0));
        break;
      default:
        break;
    }
    
    return items;
  }, [dialogues, searchQuery, nativeLang, filterOption, sortOption, favorites, completed, progress]);

  // ─── HANDLE SPEAK ──────────────────────────────────────────────────

  const handleSpeak = useCallback((text: string, id: string, lang: LangCode = "hy") => {
    if (isSpeaking || isPlaying) {
      stop?.();
      if (speakingId === id) {
        setSpeakingId(null);
        setNuriMood("idle");
        return;
      }
    }
    
    setSpeakingId(id);
    setNuriMood("happy");
    
    if (audioMode === "wav" && isWAVAvailable && wavClient && lang === "hy") {
      wavClient.playGeneratedAudio(text, "Avet").catch(() => {
        speak(text, lang, {
          id: `dialogue_${id}`,
          onEnd: () => {
            setSpeakingId(null);
            setNuriMood("idle");
          },
          onError: () => {
            setSpeakingId(null);
            setNuriMood("sad");
          },
        });
      });
      return;
    }
    
    speak(text, lang, {
      id: `dialogue_${id}`,
      onEnd: () => {
        setSpeakingId(null);
        setNuriMood("idle");
      },
      onError: () => {
        setSpeakingId(null);
        setNuriMood("sad");
      },
    });
  }, [isSpeaking, isPlaying, stop, speakingId, speak, audioMode, isWAVAvailable, wavClient]);

  // ─── TOGGLE DIALOGUE ──────────────────────────────────────────────

  const toggleDialogue = useCallback((id: string) => {
    setExpandedDialogue(prev => prev === id ? null : id);
    setRevealedLines({});
  }, []);

  // ─── TOGGLE LINE ──────────────────────────────────────────────────

  const toggleLine = useCallback((dialogueId: string, turnIdx: number) => {
    const key = `${dialogueId}-${turnIdx}`;
    setRevealedLines(prev => ({ ...prev, [key]: !prev[key] }));
    
    const total = dialogues.find(d => d.id === dialogueId)?.turns.length || 1;
    const revealed = Object.keys(revealedLines).filter(k => k.startsWith(dialogueId)).length;
    const progressValue = Math.min(100, Math.round(((revealed + (revealedLines[key] ? 1 : 0)) / total) * 100));
    updateProgress(dialogueId, progressValue);
  }, [revealedLines, dialogues, updateProgress]);

  // ─── TOGGLE INTERACTIVE MODE ──────────────────────────────────────

  const toggleInteractiveMode = useCallback((id: string) => {
    setInteractiveMode(prev => ({ ...prev, [id]: !prev[id] }));
    setRevealedLines({});
  }, []);

  // ─── REVEAL ALL LINES ─────────────────────────────────────────────

  const revealAllLines = useCallback((dialogueId: string) => {
    const dlg = dialogues.find(d => d.id === dialogueId);
    if (!dlg) return;
    const newRevealed: Record<string, boolean> = {};
    dlg.turns.forEach((_, idx) => {
      newRevealed[`${dialogueId}-${idx}`] = true;
    });
    setRevealedLines(prev => ({ ...prev, ...newRevealed }));
    updateProgress(dialogueId, 100);
    showMessage(t("dialogues_all_revealed"), "success");
  }, [dialogues, updateProgress, showMessage, t]);

  // ─── HIDE ALL LINES ──────────────────────────────────────────────

  const hideAllLines = useCallback((dialogueId: string) => {
    const dlg = dialogues.find(d => d.id === dialogueId);
    if (!dlg) return;
    const newRevealed: Record<string, boolean> = {};
    dlg.turns.forEach((_, idx) => {
      newRevealed[`${dialogueId}-${idx}`] = false;
    });
    setRevealedLines(prev => ({ ...prev, ...newRevealed }));
    updateProgress(dialogueId, 0);
    showMessage(t("dialogues_all_hidden"), "info");
  }, [dialogues, updateProgress, showMessage, t]);

  // ─── SCROLL TO TOP ──────────────────────────────────────────────────

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ─── GET SPEAKER NAME ─────────────────────────────────────────────

  const getSpeakerName = useCallback((speaker: string, lang: LangCode) => {
    return CHARACTER_NAMES[speaker]?.[lang] || speaker;
  }, []);

  // ─── GET SPEAKER COLOR ────────────────────────────────────────────

  const getSpeakerColor = useCallback((speaker: string) => {
    return CHARACTER_COLORS[speaker] || "bg-gray-500/20 border-gray-500/20 text-gray-400";
  }, []);

  // ─── RESET FILTERS ─────────────────────────────────────────────────

  const resetFilters = useCallback(() => {
    setFilterOption("all");
    setSortOption("default");
    setSearchQuery("");
    setShowFilters(false);
  }, []);

  // ─── RENDER STANDARD MODE ──────────────────────────────────────────

  const renderStandardMode = useCallback((dlg: DialogueWithMeta) => {
    const totalTurns = dlg.turns.length;
    const revealedCount = Object.keys(revealedLines).filter(k => k.startsWith(dlg.id) && revealedLines[k]).length;
    const progressPercent = Math.round((revealedCount / totalTurns) * 100);

    const [native, learning] = (dlg as any).pair?.split('-') as [LangCode, LangCode] || ['hy', 'en'];

    const getLearningText = (turn: DialogueTurn): string => {
      if (learning === 'hy') return turn.hy || turn.en;
      if (learning === 'en') return turn.en || turn.hy;
      if (learning === 'ru') return turn.ru || turn.hy;
      return turn.hy || turn.en;
    };

    const getNativeText = (turn: DialogueTurn): string => {
      if (native === 'hy') return turn.hy || turn.en;
      if (native === 'en') return turn.en || turn.hy;
      if (native === 'ru') return turn.ru || turn.hy;
      return turn.en || turn.hy;
    };

    const getThirdText = (turn: DialogueTurn): string => {
      const thirdLang = ['hy', 'en', 'ru'].find(l => l !== native && l !== learning) as LangCode || 'en';
      return turn[thirdLang as keyof DialogueTurn] || '';
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-5 pb-5 pt-4 border-t border-white/20 dark:border-white/5"
      >
        <DialogueProgressBar progress={progressPercent} />
        
        <div className="flex items-center justify-between mt-2 mb-4">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {progressPercent}% {t("dialogues_completed")}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => revealAllLines(dlg.id)}
              className="text-xs text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
            >
              <Eye size={14} />
              {t("dialogues_reveal_all")}
            </button>
            <button
              onClick={() => hideAllLines(dlg.id)}
              className="text-xs text-gray-400 hover:text-gray-300 transition flex items-center gap-1"
            >
              <EyeOff size={14} />
              {t("dialogues_hide_all")}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {dlg.turns.map((turn, idx) => {
            const key = `${dlg.id}-${idx}`;
            const isRevealed = revealedLines[key] || autoReveal;
            const audioId = `${dlg.id}_${idx}`;
            const isSpeakingNow = (isSpeaking || isPlaying) && speakingId === audioId;
            const isNurik = turn.speaker === "nurik";
            const speakerColor = getSpeakerColor(turn.speaker);
            const isHighlighted = highlightedLine === key;
            
            const mainText = getLearningText(turn);
            const nativeText = getNativeText(turn);
            const thirdText = getThirdText(turn);
            const thirdLang = ['hy', 'en', 'ru'].find(l => l !== native && l !== learning) as LangCode || 'en';

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: isHighlighted ? 1.02 : 1,
                }}
                transition={{ delay: idx * 0.05 }}
                className={`flex ${isNurik ? "justify-start" : "justify-end"} relative group`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 cursor-pointer transition-all ${
                    isHighlighted ? "ring-2 ring-yellow-500/50" : ""
                  } ${
                    isNurik
                      ? "bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20"
                      : "bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20"
                  }`}
                  onClick={() => toggleLine(dlg.id, idx)}
                >
                  <div className="flex items-center gap-2 text-xs font-medium mb-1">
                    <span className={speakerColor.split(' ')[0]}>{CHARACTER_EMOJIS[turn.speaker] || "👤"}</span>
                    <span className={speakerColor}>
                      {getSpeakerName(turn.speaker, learning)}
                    </span>
                    {turn.mood && <span>{getMoodEmoji(turn.mood)}</span>}
                    <span className="text-[8px] text-gray-400">
                      #{idx + 1}/{totalTurns}
                    </span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/20 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                      {learning.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="text-lg text-gray-900 dark:text-white">
                    {mainText}
                  </div>
                  
                  <AnimatePresence>
                    {isRevealed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 pt-2 border-t border-current/20 space-y-1"
                      >
                        <div className="text-sm text-blue-400 italic">
                          {native.toUpperCase()}: {nativeText}
                        </div>
                        {thirdText && thirdText !== nativeText && (
                          <div className="text-xs text-green-400 opacity-70">
                            {thirdLang.toUpperCase()}: {thirdText}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {!isRevealed && (
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                      <Eye size={12} />
                      <span>{t("dialogues_tap_to_reveal")}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(mainText, audioId, learning);
                  }}
                  disabled={isSpeakingNow}
                  className={`absolute ${
                    isNurik ? "-right-10" : "-left-10"
                  } top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all ${
                    isSpeakingNow
                      ? "text-primary animate-pulse"
                      : "text-gray-500 hover:text-primary"
                  }`}
                >
                  {isSpeakingNow ? <Volume2 size={18} /> : <Play size={16} />}
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-2 pt-4 mt-4 border-t border-white/20 dark:border-white/5">
          <button
            onClick={() => router.push(`/learn?lesson=${dlg.lessonId}&pair=${native}-${learning}`)}
            className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 px-4 py-2 rounded-xl text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-white/50 dark:hover:bg-gray-800/80 transition-colors flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
          >
            <BookOpen size={14} />
            {t("dialogues_go_to_lesson")}
          </button>
          <button
            onClick={() => toggleInteractiveMode(dlg.id)}
            className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 px-4 py-2 rounded-xl text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
          >
            <RefreshCw size={14} />
            {interactiveMode[dlg.id] ? t("dialogues_normal") : t("dialogues_interactive")}
          </button>
          <button
            onClick={() => toggleFavorite(dlg.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
              favorites.has(dlg.id)
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 text-gray-400 hover:text-yellow-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
            }`}
          >
            {favorites.has(dlg.id) ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            {favorites.has(dlg.id) ? t("dialogues_favorited") : t("dialogues_save")}
          </button>
        </div>
      </motion.div>
    );
  }, [revealedLines, autoReveal, isSpeaking, isPlaying, speakingId, getSpeakerColor, getSpeakerName, toggleLine, revealAllLines, hideAllLines, handleSpeak, router, interactiveMode, toggleInteractiveMode, favorites, toggleFavorite, highlightedLine, t]);

  // ─── RENDER INTERACTIVE MODE ──────────────────────────────────────

  const renderInteractiveMode = useCallback((dlg: DialogueWithMeta) => {
    if (!dlg.turns || dlg.turns.length === 0) {
      return (
        <motion.div className="px-5 pb-5 pt-4 border-t border-white/20 dark:border-white/5">
          <div className="p-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-center">
            <p className="text-yellow-500 font-medium">{t("dialogues_empty")}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("dialogues_no_data")}</p>
          </div>
        </motion.div>
      );
    }

    const [native, learning] = (dlg as any).pair?.split('-') as [LangCode, LangCode] || ['hy', 'en'];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-5 pb-5 pt-4 border-t border-white/20 dark:border-white/5"
      >
        <InteractiveDialogue
          turns={dlg.turns}
          nativeLang={native}
          learningLang={learning}
          dialogueId={dlg.id}
          onComplete={(score, total) => {
            const progressValue = Math.round((score / total) * 100);
            updateProgress(dlg.id, progressValue);
            if (progressValue >= 80) {
              showMessage(t("dialogues_interactive_perfect", { score, total }), "success");
            } else {
              showMessage(t("dialogues_interactive_good", { score, total }), "info");
            }
          }}
        />
        <div className="text-center pt-3 flex justify-center gap-2">
          <button
            onClick={() => toggleInteractiveMode(dlg.id)}
            className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 px-4 py-2 rounded-xl text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
          >
            <RefreshCw size={14} />
            {t("dialogues_back_to_normal")}
          </button>
          <button
            onClick={() => toggleFavorite(dlg.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
              favorites.has(dlg.id)
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 text-gray-400 hover:text-yellow-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
            }`}
          >
            {favorites.has(dlg.id) ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
        </div>
      </motion.div>
    );
  }, [toggleInteractiveMode, updateProgress, showMessage, favorites, toggleFavorite, t]);

  // ─── MAIN RENDER ────────────────────────────────────────────────────

  const isFiltered = filterOption !== "all" || sortOption !== "default" || searchQuery !== "";

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent text-gray-900 dark:text-white pb-24">
      <div ref={topRef} className="container-main py-6">
        
        {/* ✅ Nuri-relax - վերևի ձախ անկյունում */}
        <div className="fixed top-20 left-4 z-50">
          <img 
            src="/images/nuri/nuri-relax.png" 
            alt={t("page_nuri_relax")}
            className="w-16 h-16 object-contain animate-pulse"
          />
        </div>

        {/* ─── HEADER ─── */}
        <header className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Nuri mood={nuriMood} size={72} glow={nuriMood === "happy"} />
            <div className="flex-1">
              <NuriSpeech
                text={
                  nuriMood === "happy"
                    ? t("dialogues_nuri_happy")
                    : nuriMood === "sad"
                    ? t("dialogues_nuri_sad")
                    : t("dialogues_nuri_idle", { count: dialogStats?.total || 0 })
                }
                mood={nuriMood}
              />
            </div>
            <ThemeToggle />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={24} className="text-red-500" />
                <span className="text-gradient">{t("dialogues_title")}</span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                <span>{t("dialogues_count", { count: dialogues.length })}</span>
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                <span>{t("dialogues_turns", { count: dialogStats?.totalTurns || 0 })}</span>
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                <span>{t("dialogues_favorites", { count: favorites.size })}</span>
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                <span>{t("dialogues_completed_count", { count: completed.size })}</span>
                {isWAVAvailable && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                    <span className="text-emerald-500">{t("dialogues_wav")}</span>
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* View Mode */}
              <div className="flex gap-1 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-1 border border-white/20 dark:border-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === "list" ? "bg-blue-500 text-white" : "hover:bg-white/10 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                  title={t("dialogues_list")}
                >
                  <List size={14} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === "grid" ? "bg-blue-500 text-white" : "hover:bg-white/10 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                  title={t("dialogues_grid")}
                >
                  <Grid3x3 size={14} />
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === "compact" ? "bg-blue-500 text-white" : "hover:bg-white/10 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                  title={t("dialogues_compact")}
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Audio Mode */}
              <div className="flex gap-1 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-1 border border-white/20 dark:border-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                <button
                  onClick={() => setAudioMode("wav")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    audioMode === "wav" ? "bg-blue-500 text-white" : "hover:bg-white/10 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                  title={t("page_wav_mode")}
                >
                  <Radio size={14} />
                </button>
                <button
                  onClick={() => setAudioMode("tts")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    audioMode === "tts" ? "bg-purple-500 text-white" : "hover:bg-white/10 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                  title={t("page_tts_mode")}
                >
                  <Speaker size={14} />
                </button>
                <button
                  onClick={() => setAudioMode("mp3")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    audioMode === "mp3" ? "bg-emerald-500 text-white" : "hover:bg-white/10 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                  title={t("page_mp3_mode")}
                >
                  <Music size={14} />
                </button>
              </div>

              <button
                onClick={() => {
                  setAutoReveal(!autoReveal);
                  saveSettings("autoReveal", !autoReveal);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                  autoReveal
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 text-gray-400 hover:text-gray-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                }`}
                title={t("dialogues_auto_reveal")}
              >
                <Eye size={14} />
                {autoReveal ? t("dialogues_auto") : t("dialogues_manual")}
              </button>

              <button
                onClick={() => setShowStats(!showStats)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                  showStats
                    ? "bg-indigo-500 text-white"
                    : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 text-gray-400 hover:text-gray-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                }`}
              >
                <BarChart3 size={14} />
                <span className="hidden sm:inline">{t("dialogues_stats")}</span>
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                  showFilters
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 text-gray-400 hover:text-gray-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                }`}
              >
                <Filter size={14} />
                <span className="hidden sm:inline">{t("dialogues_filters")}</span>
                {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
              </button>

              {isFiltered && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-1 border border-red-500/20"
                >
                  <X size={14} />
                  <span className="hidden sm:inline">{t("dialogues_clear")}</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ─── STATS PANEL ─── */}
        <AnimatePresence>
          {showStats && dialogStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{dialogStats.total}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("dialogues_total")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-500">{dialogStats.completed}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("dialogues_completed")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">{dialogStats.inProgress}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("dialogues_in_progress")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-500">{dialogStats.favoriteCount}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("dialogues_favorited")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{dialogStats.totalTurns}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("dialogues_total_turns")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">{formatDuration(dialogStats.totalDuration)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("dialogues_total_duration")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{Object.keys(dialogStats.byCategory).length}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("dialogues_categories")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-500">
                      {dialogStats.byDifficulty.beginner || 0} / {dialogStats.byDifficulty.intermediate || 0} / {dialogStats.byDifficulty.advanced || 0}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">🌱 / 📈 / 🔥</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── FILTERS PANEL ─── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">📊 {t("dialogues_difficulty")}</label>
                    <select
                      value={filterOption}
                      onChange={(e) => setFilterOption(e.target.value as FilterOption)}
                      className="w-full bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      <option value="all">{t("dialogues_all")}</option>
                      <option value="beginner">🌱 {t("dialogues_beginner")}</option>
                      <option value="intermediate">📈 {t("dialogues_intermediate")}</option>
                      <option value="advanced">🔥 {t("dialogues_advanced")}</option>
                      <option value="favorites">⭐ {t("dialogues_favorites")}</option>
                      <option value="completed">✅ {t("dialogues_completed")}</option>
                      <option value="in-progress">🔄 {t("dialogues_in_progress")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">📁 {t("dialogues_category")}</label>
                    <select
                      value={filterOption}
                      onChange={(e) => setFilterOption(e.target.value as FilterOption)}
                      className="w-full bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      <option value="all">{t("dialogues_all")}</option>
                      <option value="daily">☀️ {t("dialogues_category_daily")}</option>
                      <option value="travel">✈️ {t("dialogues_category_travel")}</option>
                      <option value="food">🍽️ {t("dialogues_category_food")}</option>
                      <option value="family">👨‍👩‍👦 {t("dialogues_category_family")}</option>
                      <option value="work">💼 {t("dialogues_category_work")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">🔄 {t("dialogues_sort")}</label>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="w-full bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      <option value="default">{t("dialogues_default")}</option>
                      <option value="newest">{t("dialogues_newest")}</option>
                      <option value="oldest">{t("dialogues_oldest")}</option>
                      <option value="alphabetical">{t("dialogues_alphabetical")}</option>
                      <option value="popular">{t("dialogues_popular")}</option>
                      <option value="progress">{t("dialogues_progress")}</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── SEARCH ─── */}
        <div className="relative mb-6">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("dialogues_search")}
            className="w-full bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 text-gray-500 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ─── DIALOGUES LIST ─── */}
        {filteredDialogues.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-4">💬</div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {searchQuery ? t("dialogues_no_results_query", { query: searchQuery }) : t("dialogues_no_dialogues")}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {searchQuery ? t("dialogues_try_different") : t("dialogues_coming_soon")}
            </p>
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="mt-4 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-bold transition"
              >
                <FilterX size={18} className="inline mr-1" />
                {t("dialogues_clear_filters")}
              </button>
            )}
          </motion.div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : viewMode === "compact" ? "space-y-2" : "space-y-4"}>
            {filteredDialogues.map((dlg, index) => {
              const isExpanded = expandedDialogue === dlg.id;
              const isInteractive = interactiveMode[dlg.id] || false;
              const isFavorite = favorites.has(dlg.id);
              const isCompleted = completed.has(dlg.id);
              const progressValue = progress[dlg.id] || 0;
              const diffInfo = dlg.difficulty ? DIFFICULTY_LABELS[dlg.difficulty] : null;
              const catInfo = dlg.category ? CATEGORY_LABELS[dlg.category] : null;

              return (
                <motion.div
                  key={dlg.id}
                  ref={el => { dialogueRefs.current[dlg.id] = el; }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.4) }}
                  className={`bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border ${
                    isFavorite ? "border-yellow-500/50" : "border-white/20 dark:border-white/5"
                  } rounded-xl overflow-hidden hover:border-white/30 dark:hover:border-white/10 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]`}
                >
                  {/* ─── DIALOGUE HEADER ─── */}
                  <button
                    onClick={() => toggleDialogue(dlg.id)}
                    className="w-full p-5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold flex-wrap">
                        <span>{dlg.worldTitle}</span>
                        <span className="text-gray-500 dark:text-gray-400">•</span>
                        <span className="text-gray-500 dark:text-gray-400">{dlg.lessonTitle}</span>
                        {diffInfo && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${diffInfo.color}`}>
                            {diffInfo.icon} {t(diffInfo.labelKey)}
                          </span>
                        )}
                        {catInfo && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-400">
                            {catInfo.icon} {t(catInfo.labelKey)}
                          </span>
                        )}
                        {isFavorite && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-yellow-500/20 text-yellow-400">
                            ⭐ {t("dialogues_favorited")}
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                            ✅ {t("dialogues_completed")}
                          </span>
                        )}
                        {isInteractive && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-400">
                            🎮 {t("dialogues_interactive")}
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                        {dlg.dialogueTitle[nativeLang] || dlg.dialogueTitle.en}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {dlg.turns.length} {t("dialogues_turns")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mic size={12} />
                          {dlg.turns.filter(t => t.speaker === "nurik").length} {t("dialogues_audio")}
                        </span>
                        {dlg.duration && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDuration(dlg.duration)}
                          </span>
                        )}
                        {progressValue > 0 && (
                          <span className="flex items-center gap-1 text-blue-400">
                            <Target size={12} />
                            {progressValue}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-500" />
                      )}
                    </div>
                  </button>

                  {/* ─── EXPANDED CONTENT ─── */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        {isInteractive
                          ? renderInteractiveMode(dlg)
                          : renderStandardMode(dlg)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ─── FOOTER COUNT ─── */}
        {searchQuery && filteredDialogues.length > 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
            {t("dialogues_showing_count", { count: filteredDialogues.length, total: dialogues.length })}
          </div>
        )}
      </div>

      {/* ─── TOAST MESSAGE ─── */}
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

      {/* ─── SCROLL TO TOP ─── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 z-50 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 p-3.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all"
          >
            <ArrowUp size={20} className="text-gray-900 dark:text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}