// src/app/dictionary/page.tsx
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, BookOpen, X, Filter, ChevronDown, ChevronUp, Sparkles, Play,
  Loader2, ArrowUp, Star, RefreshCw, CheckCircle, AlertCircle, Users,
  Check, Tag, BarChart3, List, Grid3x3, FilterX, Clock, Volume2,
  Download, Music,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Nuri, { NuriSpeech, type NuriMood } from "@/components/Nuri";
import ThemeToggle from "@/components/ThemeToggle";
import UserRecordingButton from "@/components/UserRecordingButton";
import { useNuri } from "@/hooks/useNuri";
import { useAudioManager } from "@/lib/hooks/useAudioManager";
import { getWavClient, WavClient } from "@/lib/audio/WavClient";
import type { LangCode } from "@/lib/i18n/multilingual";
import type { LanguageCode } from "@/lib/audio";
import { useI18n } from "@/hooks/useI18n";

// ─── TYPES ────────────────────────────────────────────────────────────

interface DictionaryEntry {
  id: string;
  hy: string;
  en: string;
  ru: string;
  type: string;
  category?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  tags?: string[];
  popularity?: number;
  audio?: { hy?: string; en?: string; ru?: string };
  wavAudio?: { hy?: string; en?: string; ru?: string };
  hasWAV?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface WavManifest {
  schemaVersion: number;
  lastUpdated: string;
  totalEntries: number;
  entries: Record<string, { hy?: string; en?: string; ru?: string }>;
}

interface WordStats {
  total: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
  withAudio: number;
  withWAV: number;
}

import baseDict from "../../../data/dictionaries/unified-dictionary.json";

// ✅ FLAG ONLY (no label)
const LANGS: { code: LangCode; flagUrl: string }[] = [
  { code: "hy", flagUrl: "https://flagcdn.com/24x18/am.png" },
  { code: "en", flagUrl: "https://flagcdn.com/24x18/gb.png" },
  { code: "ru", flagUrl: "https://flagcdn.com/24x18/ru.png" },
];

interface ActivePlay {
  wordId: string;
  lang: LangCode;
  source: "mp3" | "wav" | "tts";
}

type ViewMode = "list" | "grid" | "compact";
type SortOption = "default" | "popular" | "alphabetical" | "reverse-alpha" | "newest" | "oldest";
type FilterOption = "all" | "vocab" | "phrase" | "dialogue" | "beginner" | "intermediate" | "advanced" | "has-audio" | "no-audio";

const STORAGE_KEYS = {
  WAV_MANIFEST: "nurlingo_wav_manifest",
  SELECTED_VOICE: "nurlingo_selected_voice",
  VIEW_PREFERENCES: "nurlingo_view_preferences",
  DICTIONARY_HISTORY: "nurlingo_dictionary_history",
  FAVORITE_WORDS: "nurlingo_favorite_words",
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("hy-AM", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return dateString; }
};

const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty) {
    case "beginner": return "text-green-400 bg-green-500/20";
    case "intermediate": return "text-yellow-400 bg-yellow-500/20";
    case "advanced": return "text-red-400 bg-red-500/20";
    default: return "text-gray-400 bg-gray-500/20";
  }
};

const getDifficultyLabel = (difficulty?: string, t?: (key: string) => string) => {
  if (t) {
    switch (difficulty) {
      case "beginner": return `🌱 ${t("page_beginner")}`;
      case "intermediate": return `📈 ${t("page_intermediate")}`;
      case "advanced": return `🔥 ${t("page_advanced")}`;
      default: return "📚 Ընդհանուր";
    }
  }
  switch (difficulty) {
    case "beginner": return "🌱 Սկսնակ";
    case "intermediate": return "📈 Միջին";
    case "advanced": return "🔥 Առաջադեմ";
    default: return "📚 Ընդհանուր";
  }
};

export default function DictionaryPage() {
  const { play, stop, isPlaying, isLoading } = useAudioManager();
  const { t } = useI18n();
  const { setPage } = useNuri();

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");

  const showMessage = useCallback((text: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage(text);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  }, []);

  useEffect(() => setPage("dictionary"), [setPage]);

  const [vocab, setVocab] = useState<DictionaryEntry[]>([]);
  const [activePlay, setActivePlay] = useState<ActivePlay | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLang, setFilterLang] = useState<LangCode>("hy");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [nuriMood, setNuriMood] = useState<NuriMood>("idle");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [wavManifest, setWavManifest] = useState<WavManifest | null>(null);
  const [wavClient, setWavClient] = useState<WavClient | null>(null);
  const [isWAVAvailable, setIsWAVAvailable] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>("Avet");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [wordStats, setWordStats] = useState<WordStats | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  const topRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // LOAD FAVORITES
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITE_WORDS);
      if (savedFavorites) setFavorites(new Set(JSON.parse(savedFavorites)));
      const savedHistory = localStorage.getItem(STORAGE_KEYS.DICTIONARY_HISTORY);
      if (savedHistory) setRecentlyViewed(JSON.parse(savedHistory));
    } catch {}
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem(STORAGE_KEYS.FAVORITE_WORDS, JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  const trackWordView = useCallback((id: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(w => w !== id);
      const updated = [id, ...filtered].slice(0, 20);
      try { localStorage.setItem(STORAGE_KEYS.DICTIONARY_HISTORY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  // LOAD VIEW PREFS
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIEW_PREFERENCES);
      if (saved) {
        const prefs = JSON.parse(saved);
        if (prefs.viewMode) setViewMode(prefs.viewMode);
        if (prefs.sortOption) setSortOption(prefs.sortOption);
        if (prefs.filterOption) setFilterOption(prefs.filterOption);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VIEW_PREFERENCES, JSON.stringify({
        viewMode, sortOption, filterOption,
      }));
    } catch {}
  }, [viewMode, sortOption, filterOption]);

  // LOAD WAV MANIFEST
  const loadWavManifestFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WAV_MANIFEST);
      if (stored) {
        const data = JSON.parse(stored) as WavManifest;
        setWavManifest(data);
        return data;
      }
    } catch {}
    return null;
  }, []);

  // INIT WAV CLIENT
  useEffect(() => {
    const initWAV = async () => {
      try {
        const client = getWavClient();
        if (client) {
          setWavClient(client);
          setIsWAVAvailable(true);
          const voices = client.getAvailableVoices();
          if (voices.length > 0) {
            const savedVoice = localStorage.getItem(STORAGE_KEYS.SELECTED_VOICE);
            setSelectedVoice(savedVoice && voices.includes(savedVoice) ? savedVoice : voices[0]);
          }
          loadWavManifestFromStorage();
        }
      } catch {
        setIsWAVAvailable(false);
      }
    };
    initWAV();
  }, [loadWavManifestFromStorage]);

  // LOAD DICTIONARY
  useEffect(() => {
    try {
      const data = baseDict as DictionaryEntry[];
      const enrichedData = data.map(entry => ({
        ...entry,
        category: entry.category || "general",
        difficulty: entry.difficulty || "intermediate",
        tags: entry.tags || [],
        popularity: entry.popularity || Math.floor(Math.random() * 100),
        createdAt: entry.createdAt || new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: entry.updatedAt || new Date().toISOString(),
      }));

      const sortedData = enrichedData.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      setVocab(sortedData);
      updateStats(sortedData);
      setIsLoadingData(false);
    } catch (error) {
      console.error("❌ Failed to load dictionary:", error);
      setIsLoadingData(false);
      setVocab([]);
    }
  }, []);

  const updateStats = useCallback((data: DictionaryEntry[]) => {
    const stats: WordStats = {
      total: data.length,
      byType: {},
      byCategory: {},
      byDifficulty: {},
      withAudio: data.filter(e => e.audio && (e.audio.hy || e.audio.en || e.audio.ru)).length,
      withWAV: data.filter(e => e.hasWAV).length,
    };
    data.forEach(e => {
      stats.byType[e.type] = (stats.byType[e.type] || 0) + 1;
      stats.byCategory[e.category || "general"] = (stats.byCategory[e.category || "general"] || 0) + 1;
      stats.byDifficulty[e.difficulty || "intermediate"] = (stats.byDifficulty[e.difficulty || "intermediate"] || 0) + 1;
    });
    setWordStats(stats);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isPlaying && !isLoading) {
      setActivePlay(null);
      setTimeout(() => setNuriMood("idle"), 800);
    }
  }, [isPlaying, isLoading]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        if (searchQuery) setSearchQuery("");
        if (showFilters) setShowFilters(false);
        if (showStats) setShowStats(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchQuery, showFilters, showStats]);

  useEffect(() => {
    if (!searchQuery) { setNuriMood("idle"); return; }
    const filtered = vocab.filter(
      (entry) =>
        entry.hy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.ru?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setNuriMood(filtered.length === 0 ? "sad" : "happy");
  }, [searchQuery, vocab]);

  const filteredVocab = useMemo(() => {
    let items = [...vocab];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (item) =>
          (item.hy || "").toLowerCase().includes(q) ||
          (item.en || "").toLowerCase().includes(q) ||
          (item.ru || "").toLowerCase().includes(q) ||
          (item.id || "").toLowerCase().includes(q) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }
    switch (filterOption) {
      case "vocab": items = items.filter(e => e.type === "vocab"); break;
      case "phrase": items = items.filter(e => e.type === "phrase"); break;
      case "dialogue": items = items.filter(e => e.type === "dialogue"); break;
      case "beginner": items = items.filter(e => e.difficulty === "beginner"); break;
      case "intermediate": items = items.filter(e => e.difficulty === "intermediate"); break;
      case "advanced": items = items.filter(e => e.difficulty === "advanced"); break;
      case "has-audio": items = items.filter(e => e.audio && (e.audio.hy || e.audio.en || e.audio.ru)); break;
      case "no-audio": items = items.filter(e => !e.audio || (!e.audio.hy && !e.audio.en && !e.audio.ru)); break;
      default: break;
    }
    switch (sortOption) {
      case "popular": items.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)); break;
      case "alphabetical": items.sort((a, b) => a.hy.localeCompare(b.hy)); break;
      case "reverse-alpha": items.sort((a, b) => b.hy.localeCompare(a.hy)); break;
      case "newest": items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()); break;
      case "oldest": items.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()); break;
      default: items.sort((a, b) => parseInt(a.id) - parseInt(b.id)); break;
    }
    return items;
  }, [vocab, searchQuery, filterOption, sortOption]);

  // SPEECH SYNTHESIS
  const speakWithFemaleVoice = useCallback((text: string, lang: string) => {
    return new Promise<boolean>((resolve, reject) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      utterance.volume = 1;

      const getVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          window.speechSynthesis.onvoiceschanged = () => {
            findAndSpeak(window.speechSynthesis.getVoices());
          };
          return;
        }
        findAndSpeak(voices);
      };

      const findAndSpeak = (voices: SpeechSynthesisVoice[]) => {
        const femaleVoiceNames = [
          'Samantha', 'Google UK English Female', 'Karen', 'Zira',
          'Alice', 'Victoria', 'Emma', 'Susan', 'Tessa',
          'Google русский', 'Anna', 'Elena', 'Katya', 'Marina', 'Natalia', 'Alena',
          'Ani', 'Google Հայերեն', 'Armine', 'Lusine',
        ];
        let picked: SpeechSynthesisVoice | null = null;
        for (const name of femaleVoiceNames) {
          const found = voices.find(v => v.lang.startsWith(lang) && v.name.toLowerCase() === name.toLowerCase());
          if (found) { picked = found; break; }
        }
        if (!picked) {
          for (const name of femaleVoiceNames) {
            const found = voices.find(v => v.lang.startsWith(lang) && v.name.toLowerCase().includes(name.toLowerCase()));
            if (found) { picked = found; break; }
          }
        }
        if (!picked) {
          picked = voices.find(v =>
            v.lang.startsWith(lang) &&
            (v.name.toLowerCase().includes('female') ||
             v.name.toLowerCase().includes('samantha') ||
             v.name.toLowerCase().includes('zira') ||
             v.name.toLowerCase().includes('karen') ||
             v.name.toLowerCase().includes('anna'))
          ) || null;
        }
        if (picked) utterance.voice = picked;
        else utterance.pitch = 1.5;
        utterance.onend = () => resolve(true);
        utterance.onerror = (e) => reject(e);
        window.speechSynthesis.speak(utterance);
      };
      getVoices();
    });
  }, []);

  // PLAY VIA API (WAV → API → TTS)
  const playAudioViaAPI = useCallback(async (text: string, lang: LangCode): Promise<boolean> => {
    if (!text) return false;

    if (lang === 'hy') {
      if (wavClient && isWAVAvailable) {
        try { await wavClient.playGeneratedAudio(text, selectedVoice); return true; }
        catch (error) { console.warn("WAV Client failed:", error); }
      }
      try {
        const response = await fetch('/api/generate-wav', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice: selectedVoice }),
        });
        if (response.ok) {
          const data = await response.json();
          const src = data.audio || data.url || data.audioUrl;
          if (src) { await new Audio(src).play(); return true; }
        }
      } catch (error) { console.warn("WAV API failed:", error); }
      try { await speakWithFemaleVoice(text, 'hy'); return true; }
      catch { return false; }
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
          const src = data.audio || data.url || data.audioUrl;
          if (src) { await new Audio(src).play(); return true; }
        }
      } catch (error) { console.warn("English TTS API failed:", error); }
      try { await speakWithFemaleVoice(text, 'en'); return true; }
      catch { return false; }
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
          const src = data.audio || data.url || data.audioUrl;
          if (src) { await new Audio(src).play(); return true; }
        }
      } catch (error) { console.warn("Russian TTS API failed:", error); }
      try { await speakWithFemaleVoice(text, 'ru'); return true; }
      catch { return false; }
    }
    return false;
  }, [wavClient, isWAVAvailable, selectedVoice, speakWithFemaleVoice]);

  // HANDLE SPEAK
  const handleSpeak = useCallback(
    async (item: DictionaryEntry, lang: LangCode) => {
      const text = item[lang] || "";
      if (!text) { showMessage(t("page_no_text"), "error"); return; }
      if (isPlaying) { stop(); setActivePlay(null); return; }

      setActivePlay({ wordId: item.id, lang, source: "tts" });
      setNuriMood("happy");

      try {
        // ✅ API PRIORITY — same as user-dictionary
        const success = await playAudioViaAPI(text, lang);
        if (success) {
          setActivePlay(null);
          return;
        }
        // Fallback to useAudioManager
        play(text, lang as LanguageCode, item.id, `${item.id}-${lang}`);
      } catch (error) {
        console.error("Playback error:", error);
        try { play(text, lang as LanguageCode, item.id, `${item.id}-${lang}`); } catch {}
      }
    },
    [isPlaying, stop, play, showMessage, playAudioViaAPI, t]
  );

  const isWordPlaying = useCallback(
    (id: string, lang: LangCode) => {
      return activePlay?.wordId === id && activePlay?.lang === lang && (isPlaying || isLoading);
    },
    [activePlay, isPlaying, isLoading]
  );

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    trackWordView(id);
  };

  const typeColors: Record<string, string> = {
    vocab: "bg-blue-500/20 text-blue-300 border-blue-500/20",
    phrase: "bg-purple-500/20 text-purple-300 border-purple-500/20",
    dialogue: "bg-green-500/20 text-green-300 border-green-500/20",
  };

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const copyId = useCallback((id: string) => {
    try {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      showMessage(t("page_id_copied"), "info");
    } catch {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      showMessage(t("page_id_copied"), "info");
    }
  }, [showMessage, t]);

  const resetFilters = useCallback(() => {
    setFilterOption("all");
    setSortOption("default");
    setSearchQuery("");
    setShowFilters(false);
  }, []);

  const totalWords = vocab.length;
  const isFiltered = filterOption !== "all" || sortOption !== "default" || searchQuery !== "";

  if (isLoadingData) {
    return <div className="min-h-screen bg-transparent flex items-center justify-center" />;
  }

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div ref={topRef} className="container-main py-6">

        <div className="fixed top-20 left-4 z-50">
          <img
            src="/images/nuri/nuri-listening.png"
            alt={t("page_nuri_listening")}
            className="w-16 h-16 object-contain animate-pulse"
          />
        </div>

        {/* HEADER */}
        <header className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Nuri mood={nuriMood} size={72} glow={nuriMood === "happy"} />
            <div className="flex-1">
              <NuriSpeech
                text={
                  nuriMood === "happy"
                    ? t("page_nuri_happy_dict", { count: filteredVocab.length })
                    : searchQuery ? t("page_nuri_sad_dict") : t("page_nuri_idle_dict")
                }
                mood={nuriMood}
              />
            </div>
            <ThemeToggle />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                <BookOpen size={24} className="text-primary" />
                <span className="text-gradient">{t("page_dictionary")}</span>
              </h1>
              <p className="text-sm opacity-70">
                {t("page__wordstats_total_", { total: vocab.length })}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-1 rounded-xl p-1 border border-white/20 dark:border-white/10">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-2.5 py-1.5 rounded-lg ${viewMode === "list" ? "bg-blue-500 text-white" : ""}`}
                >
                  <List size={14} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-2.5 py-1.5 rounded-lg ${viewMode === "grid" ? "bg-blue-500 text-white" : ""}`}
                >
                  <Grid3x3 size={14} />
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  className={`px-2.5 py-1.5 rounded-lg ${viewMode === "compact" ? "bg-blue-500 text-white" : ""}`}
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              <button
                onClick={() => setShowStats(!showStats)}
                className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1 ${showStats ? "bg-indigo-500 text-white" : "bg-indigo-500/20"}`}
              >
                <BarChart3 size={14} />
                <span className="hidden sm:inline">{t("page_stats")}</span>
              </button>

              <Link
                href="/admin/dictionary"
                className="px-4 py-2 rounded-xl text-sm font-medium bg-white/10 dark:bg-white/5 border border-white/5 flex items-center gap-2"
              >
                <Sparkles size={16} />
                <span className="hidden sm:inline">{t("page_edit")}</span>
              </Link>
            </div>
          </div>
        </header>

        {/* STATS PANEL */}
        <AnimatePresence>
          {showStats && wordStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div ref={statsRef} className="rounded-xl p-4 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{wordStats.total}</div>
                    <div className="text-xs opacity-70">{t("page_total")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{wordStats.byType.vocab || 0}</div>
                    <div className="text-xs opacity-70">{t("page_words")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{wordStats.byType.phrase || 0}</div>
                    <div className="text-xs opacity-70">{t("page_phrases")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{wordStats.byType.dialogue || 0}</div>
                    <div className="text-xs opacity-70">{t("page_dialogues")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{wordStats.withAudio}</div>
                    <div className="text-xs opacity-70">{t("page_has_audio")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{Object.keys(wordStats.byCategory).length}</div>
                    <div className="text-xs opacity-70">{t("page_categories")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-400">{favorites.size}</div>
                    <div className="text-xs opacity-70">{t("page_favorites")}</div>
                  </div>
                </div>

                <div className="mt-3 flex gap-3 justify-center flex-wrap">
                  <span className="text-xs opacity-70">📊 {t("page_difficulty")}:</span>
                  <span className="text-xs text-green-400">🌱 {t("page_beginner")} {wordStats.byDifficulty.beginner || 0}</span>
                  <span className="text-xs text-yellow-400">📈 {t("page_intermediate")} {wordStats.byDifficulty.intermediate || 0}</span>
                  <span className="text-xs text-red-400">🔥 {t("page_advanced")} {wordStats.byDifficulty.advanced || 0}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("page_search_all_languages")}
              className="w-full rounded-xl px-10 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* FLAG ONLY — filter */}
            <div className="flex gap-1 rounded-xl p-1 border border-white/20 dark:border-white/10">
              {LANGS.map(({ code, flagUrl }) => (
                <button
                  key={code}
                  onClick={() => setFilterLang(code)}
                  className={`px-3 py-2 rounded-lg transition-all ${filterLang === code ? "bg-primary" : "hover:bg-white/10"}`}
                  title={code.toUpperCase()}
                >
                  <img src={flagUrl} alt={code} className="w-5 h-3.5" loading="lazy" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1 ${showFilters ? "bg-yellow-500/20" : "bg-white/10 dark:bg-white/5"} ${isFiltered ? "border border-yellow-500/50" : ""}`}
            >
              <Filter size={14} />
              <span className="hidden sm:inline">{t("page_filters")}</span>
              {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
            </button>

            {isFiltered && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-red-500/20 flex items-center gap-1"
              >
                <FilterX size={14} />
                <span className="hidden sm:inline">{t("page_clear_filters")}</span>
              </button>
            )}
          </div>
        </div>

        {/* FILTERS PANEL */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="rounded-xl p-4 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs opacity-70 mb-1 block">📝 {t("page_type")}</label>
                    <select
                      value={filterOption}
                      onChange={(e) => setFilterOption(e.target.value as FilterOption)}
                      className="w-full rounded-lg px-3 py-2 text-sm bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10"
                    >
                      <option value="all">📚 {t("page_all")}</option>
                      <option value="vocab">📖 {t("page_words")}</option>
                      <option value="phrase">💬 {t("page_phrases")}</option>
                      <option value="dialogue">🎭 {t("page_dialogues")}</option>
                      <option value="beginner">🌱 {t("page_beginner")}</option>
                      <option value="intermediate">📈 {t("page_intermediate")}</option>
                      <option value="advanced">🔥 {t("page_advanced")}</option>
                      <option value="has-audio">🎵 {t("page_has_audio")}</option>
                      <option value="no-audio">🔇 {t("page_no_audio")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs opacity-70 mb-1 block">🔄 {t("page_sort")}</label>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="w-full rounded-lg px-3 py-2 text-sm bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10"
                    >
                      <option value="default">📌 {t("page_default")}</option>
                      <option value="popular">⭐ {t("page_popular")}</option>
                      <option value="alphabetical">🔤 {t("page_alphabetical")}</option>
                      <option value="reverse-alpha">🔤 {t("page_reverse_alpha")}</option>
                      <option value="newest">🆕 {t("page_newest")}</option>
                      <option value="oldest">📅 {t("page_oldest")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs opacity-70 mb-1 block">📊 {t("page_stats")}</label>
                    <div className="flex items-center gap-2 text-xs opacity-70">
                      <span>📚 {totalWords}</span>
                      <span>|</span>
                      <span>🎵 {wordStats?.withAudio || 0}</span>
                      <span>|</span>
                      <span>⭐ {favorites.size}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATS BAR */}
        <div className="rounded-xl p-3 mb-4 flex items-center justify-between text-sm flex-wrap gap-2 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="opacity-70">📚</span>
            <span className="font-medium">{filteredVocab.length}</span>
            <span className="opacity-70">{t("page_shown")}</span>
            {recentlyViewed.length > 0 && (
              <>
                <span className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                <span className="opacity-70 text-xs">
                  🕐 {t("page_recently_viewed")}: {recentlyViewed.length}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs opacity-70">
            <span>{t("page__id_")}</span>
            <span className="font-mono">
              {vocab.length > 0 ? `${vocab[0]?.id} - ${vocab[vocab.length-1]?.id}` : "—"}
            </span>
          </div>
        </div>

        {/* LIST */}
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-3" : viewMode === "compact" ? "space-y-1" : "space-y-3"}>
          {filteredVocab.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 col-span-full"
            >
              <div className="text-5xl mb-4">{searchQuery ? "🔍" : "📖"}</div>
              <p className="font-medium">
                {searchQuery ? t("page_no_results_query", { query: searchQuery }) : t("page_no_words_message")}
              </p>
              <p className="text-sm opacity-70 mt-1">
                {searchQuery ? t("page_try_different_search") : t("page_no_vocab")}
              </p>
              {isFiltered && (
                <button
                  onClick={resetFilters}
                  className="mt-4 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-xl text-white font-bold"
                >
                  <FilterX size={18} className="inline mr-1" />
                  {t("page_clear_filters")}
                </button>
              )}
            </motion.div>
          ) : (
            filteredVocab.map((item, index) => {
              const isExpanded = expandedItems.has(item.id);
              const hasAudio = item.audio && (item.audio.hy || item.audio.en || item.audio.ru);
              const hasWAV = item.hasWAV;
              const isFavorite = favorites.has(item.id);
              const isCompact = viewMode === "compact";

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.015, 0.3) }}
                  className={`rounded-xl p-${isCompact ? "2" : "4"} bg-white/10 dark:bg-white/5 border ${isFavorite ? "border-yellow-500/50" : "border-white/20 dark:border-white/5"}`}
                >
                  {/* HEADER */}
                  <div className={`flex items-center justify-between ${isCompact ? "mb-1" : "mb-3"}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${typeColors[item.type] || "bg-white/10"}`}>
                        {item.type?.toUpperCase() || t("page_vocab")}
                      </span>
                      <button
                        onClick={() => copyId(item.id)}
                        className="text-[10px] font-mono opacity-70 hover:opacity-100 flex items-center gap-0.5"
                      >
                        #{item.id}
                        {copiedId === item.id && <Check size={10} className="text-emerald-500" />}
                      </button>
                      {item.difficulty && (
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${getDifficultyColor(item.difficulty)}`}>
                          {getDifficultyLabel(item.difficulty, t)}
                        </span>
                      )}
                      {hasAudio && (
                        <span className="text-[8px] bg-emerald-500/20 px-1.5 py-0.5 rounded-full">
                          {t("page_mp3")}
                        </span>
                      )}
                      {hasWAV && (
                        <span className="text-[8px] text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded-full">
                          {t("page_wav")} ✓
                        </span>
                      )}
                      {isFavorite && (
                        <span className="text-[8px] bg-yellow-500/20 px-1.5 py-0.5 rounded-full">⭐</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className={`p-1 rounded-lg ${isFavorite ? "text-yellow-400" : "opacity-60"}`}
                      >
                        <Star size={isCompact ? 12 : 14} fill={isFavorite ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="p-1 rounded-lg opacity-60"
                      >
                        {isExpanded ? <ChevronUp size={isCompact ? 14 : 16} /> : <ChevronDown size={isCompact ? 14 : 16} />}
                      </button>
                    </div>
                  </div>

                  {/* LANGUAGES — FLAG ONLY */}
                  <div className={isCompact ? "space-y-1" : "space-y-2.5"}>
                    {LANGS.map(({ code, flagUrl }) => {
                      const playing = isWordPlaying(item.id, code);
                      const loading = activePlay?.wordId === item.id && activePlay.lang === code && isLoading;
                      const text = item[code] || "—";
                      const isCurrentFilter = filterLang === code;

                      return (
                        <div
                          key={code}
                          className={`flex items-center justify-between gap-3 p-${isCompact ? "1" : "2"} rounded-xl transition-all ${isCurrentFilter ? "bg-white/5" : ""}`}
                        >
                          <div className="flex-1 min-w-0 flex items-center gap-3">
                            <img
                              src={flagUrl}
                              alt={code}
                              className={`${isCompact ? "w-5 h-3.5" : "w-6 h-4"} flex-shrink-0`}
                              loading="lazy"
                            />
                            <div className={`${isCompact ? "text-base" : "text-lg"} font-semibold truncate ${text === "—" ? "opacity-50" : ""}`}>
                              {text}
                            </div>
                          </div>

                          <button
                            onClick={() => handleSpeak(item, code)}
                            disabled={text === "—"}
                            className={`relative flex-shrink-0 w-${isCompact ? "9" : "11"} h-${isCompact ? "9" : "11"} rounded-xl transition-all flex items-center justify-center ${
                              playing
                                ? "bg-emerald-500 text-white"
                                : loading
                                ? "bg-yellow-500/30 animate-pulse"
                                : text === "—"
                                ? "bg-white/5 opacity-30 cursor-not-allowed"
                                : "bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10"
                            }`}
                            title={code === "hy" ? "WAV (hy)" : code === "en" ? "TTS (en)" : "TTS (ru)"}
                          >
                            {loading ? (
                              <Loader2 size={isCompact ? 14 : 18} className="animate-spin" />
                            ) : playing ? (
                              <Volume2 size={isCompact ? 14 : 18} />
                            ) : (
                              <Play size={isCompact ? 12 : 16} />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* EXPANDED */}
                  <AnimatePresence>
                    {isExpanded && !isCompact && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {item.tags.map(tag => (
                                <span key={tag} className="text-[8px] bg-white/10 dark:bg-white/5 px-2 py-0.5 rounded-full opacity-70">
                                  <Tag size={10} className="inline mr-0.5" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="text-xs flex items-center gap-2 flex-wrap opacity-70">
                            {item.audio?.hy && (
                              <span className="flex items-center gap-1">
                                <CheckCircle size={12} className="text-emerald-500" />
                                {t("page_mp3")}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {wavManifest?.lastUpdated ? formatDate(wavManifest.lastUpdated) : t("page_na")}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs opacity-60">🎙️</span>
                            <UserRecordingButton wordId={item.id} word={item.hy} onRecordingChange={() => {}} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {searchQuery && filteredVocab.length > 0 && (
          <div className="text-center text-sm mt-4 opacity-70">
            {t("page_showing_count", { count: filteredVocab.length, total: totalWords })}
          </div>
        )}
      </div>

      {/* TOAST */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-50 px-6 py-3 max-w-sm rounded-xl text-center shadow-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border ${
              toastType === "success" ? "border-emerald-500/30" :
              toastType === "error" ? "border-red-500/30" : "border-blue-500/30"
            }`}
          >
            <p className="text-sm font-medium">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCROLL TOP */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 z-50 p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}