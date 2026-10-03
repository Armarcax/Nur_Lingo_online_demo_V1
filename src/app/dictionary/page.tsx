// src/app/dictionary/page.tsx
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, BookOpen, X, Filter, ChevronDown, ChevronUp, Sparkles, Play,
  Loader2, ArrowUp, Star, RefreshCw, CheckCircle, AlertCircle, Users,
  Check, Tag, BarChart3, List, Grid3x3, FilterX, Clock,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Nuri, { NuriSpeech, type NuriMood } from "@/components/Nuri";
import ThemeToggle from "@/components/ThemeToggle";
import UserRecordingButton from "@/components/UserRecordingButton";
import { useNuri } from "@/hooks/useNuri";
import { useAudioManager } from "@/lib/hooks/useAudioManager";
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
  createdAt?: string;
  updatedAt?: string;
}

interface WordStats {
  total: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
  withAudio: number;
}

// ─── LOAD JSON DATA ──────────────────────────────────────────────────

import baseDict from "../../../data/dictionaries/unified-dictionary.json";

const LANGS: { code: LangCode; label: string; flagUrl: string; color: string }[] = [
  { code: "hy", label: "ՀԱՅԵՐԵՆ", flagUrl: "https://flagcdn.com/24x18/am.png", color: "text-red-400" },
  { code: "en", label: "ENGLISH", flagUrl: "https://flagcdn.com/24x18/gb.png", color: "text-blue-400" },
  { code: "ru", label: "РУССКИЙ", flagUrl: "https://flagcdn.com/24x18/ru.png", color: "text-green-400" },
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
  VIEW_PREFERENCES: "nurlingo_view_preferences",
  DICTIONARY_HISTORY: "nurlingo_dictionary_history",
  FAVORITE_WORDS: "nurlingo_favorite_words",
};

// ─── HELPERS ─────────────────────────────────────────────────────────

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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

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

  // ─── LOAD FAVORITES & HISTORY ─────────────────────────────────────

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
      try {
        localStorage.setItem(STORAGE_KEYS.FAVORITE_WORDS, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  const trackWordView = useCallback((id: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(w => w !== id);
      const updated = [id, ...filtered].slice(0, 20);
      try {
        localStorage.setItem(STORAGE_KEYS.DICTIONARY_HISTORY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // ─── LOAD VIEW PREFERENCES ────────────────────────────────────────

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

  // ─── LOAD DICTIONARY ───────────────────────────────────────────────

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
    };
    data.forEach(e => {
      stats.byType[e.type] = (stats.byType[e.type] || 0) + 1;
      stats.byCategory[e.category || "general"] = (stats.byCategory[e.category || "general"] || 0) + 1;
      stats.byDifficulty[e.difficulty || "intermediate"] = (stats.byDifficulty[e.difficulty || "intermediate"] || 0) + 1;
    });
    setWordStats(stats);
  }, []);

  // ─── SCROLL EVENT ──────────────────────────────────────────────────

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── RESET ACTIVE PLAY ─────────────────────────────────────────────

  useEffect(() => {
    if (!isPlaying && !isLoading) {
      setActivePlay(null);
      setTimeout(() => setNuriMood("idle"), 800);
    }
  }, [isPlaying, isLoading]);

  // ─── KEYBOARD SHORTCUTS ───────────────────────────────────────────

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

  // ─── UPDATE NURI MOOD ──────────────────────────────────────────────

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

  // ─── FILTERED & SORTED VOCABULARY ─────────────────────────────────

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

  // ─── HANDLE SPEAK ──────────────────────────────────────────────────

  const handleSpeak = useCallback(
    async (item: DictionaryEntry, lang: LangCode) => {
      const text = item[lang] || "";
      if (!text) { showMessage(t("page_no_text"), "error"); return; }
      if (isPlaying) { stop(); setActivePlay(null); return; }

      setActivePlay({ wordId: item.id, lang, source: "tts" });
      setNuriMood("happy");

      try {
        play(text, lang as LanguageCode, item.id, `${item.id}-${lang}`);
      } catch (error) {
        console.error("Playback error:", error);
        play(text, lang as LanguageCode, item.id, `${item.id}-${lang}`);
      }
    },
    [isPlaying, stop, play, showMessage, t]
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

  // ─── LOADING STATE ──────────────────────────────────────────────────

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center" />
    );
  }

  // ─── MAIN RENDER ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-transparent text-text-light dark:text-text-dark pb-24">
      <div ref={topRef} className="container-main py-6">

        <div className="fixed top-20 left-4 z-50">
          <img
            src="/images/nuri/nuri-listening.png"
            alt={t("page_nuri_listening")}
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
                    ? t("page_nuri_happy_dict", { count: filteredVocab.length })
                    : searchQuery
                    ? t("page_nuri_sad_dict")
                    : t("page_nuri_idle_dict")
                }
                mood={nuriMood}
              />
            </div>
            <ThemeToggle />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-display font-bold text-text dark:text-white flex items-center gap-2">
                <BookOpen size={24} className="text-primary" />
                <span className="text-gradient">{t("page_dictionary")}</span>
              </h1>
              <p className="text-sm text-text-muted dark:text-gray-500">
                <span>{t("page__wordstats_total_", { total: vocab.length })}</span>
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-1 bg-transparent dark:bg-white/10 rounded-xl p-1 border border-gray-200 dark:border-gray-700 backdrop-blur-soft">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${(viewMode === "list" ? "bg-blue-500 text-white" : "hover:bg-white/5 text-text-muted")}`}
                  title={t("page_list_view")}
                >
                  <List size={14} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === "grid" ? "bg-blue-500 text-white" : "hover:bg-white/5 text-text-muted"}`}
                  title={t("page_grid_view")}
                >
                  <Grid3x3 size={14} />
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === "compact" ? "bg-blue-500 text-white" : "hover:bg-white/5 text-text-muted"}`}
                  title={t("page_compact")}
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              <button
                onClick={() => setShowStats(!showStats)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${showStats ? "bg-indigo-500 text-white" : "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"}`}
                title={t("page_stats")}
              >
                <BarChart3 size={14} />
                <span className="hidden sm:inline">{t("page_stats")}</span>
              </button>

              <Link
                href="/admin/dictionary"
                className="bg-white/10 dark:bg-white/5 backdrop-blur-soft px-4 py-2 rounded-xl text-sm font-medium text-text-muted hover:text-text transition-all flex items-center gap-2 border border-white/5"
              >
                <Sparkles size={16} />
                <span className="hidden sm:inline">{t("page_edit")}</span>
              </Link>
            </div>
          </div>
        </header>

        {/* ─── STATS PANEL ─── */}
        <AnimatePresence>
          {showStats && wordStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div ref={statsRef} className="bg-white/10 dark:bg-white/5 backdrop-blur-soft border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{wordStats.total}</div>
                    <div className="text-xs text-text-muted">{t("page_total")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{wordStats.byType.vocab || 0}</div>
                    <div className="text-xs text-text-muted">{t("page_words")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{wordStats.byType.phrase || 0}</div>
                    <div className="text-xs text-text-muted">{t("page_phrases")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{wordStats.byType.dialogue || 0}</div>
                    <div className="text-xs text-text-muted">{t("page_dialogues")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{wordStats.withAudio}</div>
                    <div className="text-xs text-text-muted">{t("page_has_audio")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{Object.keys(wordStats.byCategory).length}</div>
                    <div className="text-xs text-text-muted">{t("page_categories")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-400">{favorites.size}</div>
                    <div className="text-xs text-text-muted">{t("page_favorites")}</div>
                  </div>
                </div>

                <div className="mt-3 flex gap-3 justify-center flex-wrap">
                  <span className="text-xs text-text-muted">📊 {t("page_difficulty")}:</span>
                  <span className="text-xs text-green-400">🌱 {t("page_beginner")} {wordStats.byDifficulty.beginner || 0}</span>
                  <span className="text-xs text-yellow-400">📈 {t("page_intermediate")} {wordStats.byDifficulty.intermediate || 0}</span>
                  <span className="text-xs text-red-400">🔥 {t("page_advanced")} {wordStats.byDifficulty.advanced || 0}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── SEARCH + FILTER ─── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("page_search_all_languages")}
              className="w-full bg-white/10 dark:bg-white/5 backdrop-blur-soft border border-gray-200 dark:border-gray-700 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-red-400/50 text-text dark:text-white placeholder-text-muted dark:placeholder-gray-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/5 text-text-muted transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1 bg-white/10 dark:bg-white/5 backdrop-blur-soft rounded-xl p-1 border border-gray-200 dark:border-gray-700">
              {LANGS.map(({ code, label, flagUrl }) => (
                <button
                  key={code}
                  onClick={() => setFilterLang(code)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${filterLang === code ? "bg-primary text-white" : "hover:bg-white/5 text-text-muted"}`}
                >
                  <img src={flagUrl} alt={code.toUpperCase()} className="w-4 h-3" loading="lazy" />
                  <span className="hidden md:inline">{label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${showFilters ? "bg-yellow-500/20 text-yellow-400" : "bg-white/10 dark:bg-white/5 text-text-muted hover:text-text"} ${isFiltered ? "border border-yellow-500/50" : ""}`}
            >
              <Filter size={14} />
              <span className="hidden sm:inline">{t("page_filters")}</span>
              {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
            </button>

            {isFiltered && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-1"
                title={t("page_clear_filters")}
              >
                <FilterX size={14} />
                <span className="hidden sm:inline">{t("page_clear_filters")}</span>
              </button>
            )}
          </div>
        </div>

        {/* ─── FILTERS PANEL ─── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-soft border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">📝 {t("page_type")}</label>
                    <select
                      value={filterOption}
                      onChange={(e) => setFilterOption(e.target.value as FilterOption)}
                      className="w-full bg-white/5 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                    <label className="text-xs text-text-muted mb-1 block">🔄 {t("page_sort")}</label>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="w-full bg-white/5 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                    <label className="text-xs text-text-muted mb-1 block">📊 {t("page_stats")}</label>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
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

        {/* ─── STATS BAR ─── */}
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-soft border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-4 flex items-center justify-between text-sm flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-text-muted">📚</span>
            <span className="text-text dark:text-white font-medium">{filteredVocab.length}</span>
            <span className="text-text-muted dark:text-gray-500">{t("page_shown")}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-text-muted dark:text-gray-500">{t("page__id_")}</span>
            <span className="text-text dark:text-white font-mono">
              {vocab.length > 0 ? `${vocab[0]?.id} - ${vocab[vocab.length-1]?.id}` : "—"}
            </span>
          </div>
        </div>

        {/* ─── VOCABULARY LIST ─── */}
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-3" : viewMode === "compact" ? "space-y-1" : "space-y-3"}>
          {filteredVocab.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 col-span-full"
            >
              <div className="text-5xl mb-4">{searchQuery ? "🔍" : "📖"}</div>
              <p className="text-text-secondary dark:text-gray-400 font-medium">
                {searchQuery ? t("page_no_results_query", { query: searchQuery }) : t("page_no_words_message")}
              </p>
              <p className="text-sm text-text-muted dark:text-gray-500 mt-1">
                {searchQuery ? t("page_try_different_search") : t("page_no_vocab")}
              </p>
              {isFiltered && (
                <button
                  onClick={resetFilters}
                  className="mt-4 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-xl text-white font-bold transition"
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
              const isFavorite = favorites.has(item.id);
              const isCompact = viewMode === "compact";

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.015, 0.3) }}
                  className={`bg-white/10 dark:bg-white/5 backdrop-blur-soft border ${isFavorite ? "border-yellow-500/50" : "border-gray-200 dark:border-gray-700"} p-${isCompact ? "2" : "4"} rounded-xl transition-all hover:shadow-glass ${isCompact ? "hover:bg-white/15" : ""}`}
                >
                  {/* HEADER ROW */}
                  <div className={`flex items-center justify-between ${isCompact ? "mb-1" : "mb-3"}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${typeColors[item.type] || "bg-white/10 text-gray-300 border-gray-500/20"}`}>
                        {item.type?.toUpperCase() || t("page_vocab")}
                      </span>
                      <button
                        onClick={() => copyId(item.id)}
                        className="text-[10px] text-text-muted dark:text-gray-500 font-mono hover:text-yellow-500 transition flex items-center gap-0.5"
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
                        <span className="text-[8px] text-emerald-500 bg-emerald-500/20 px-1.5 py-0.5 rounded-full">
                          {t("page_mp3")}
                        </span>
                      )}
                      {isFavorite && (
                        <span className="text-[8px] text-yellow-400 bg-yellow-500/20 px-1.5 py-0.5 rounded-full">
                          ⭐
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className={`p-1 rounded-lg transition-colors ${isFavorite ? "text-yellow-400" : "text-text-muted hover:text-yellow-400"}`}
                        title={isFavorite ? t("page_remove_favorite") : t("page_add_favorite")}
                      >
                        <Star size={isCompact ? 12 : 14} fill={isFavorite ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="p-1 rounded-lg hover:bg-white/5 transition-colors text-text-muted"
                      >
                        {isExpanded ? <ChevronUp size={isCompact ? 14 : 16} /> : <ChevronDown size={isCompact ? 14 : 16} />}
                      </button>
                    </div>
                  </div>

                  {/* THREE LANGUAGES */}
                  <div className={isCompact ? "space-y-1" : "space-y-2.5"}>
                    {LANGS.map(({ code, label, flagUrl, color }) => {
                      const playing = isWordPlaying(item.id, code);
                      const loading = activePlay?.wordId === item.id && activePlay.lang === code && isLoading;
                      const text = item[code] || "—";
                      const isCurrentFilter = filterLang === code;

                      return (
                        <div
                          key={code}
                          className={`flex items-center justify-between gap-3 p-${isCompact ? "1" : "2"} rounded-xl transition-all hover:bg-white/5`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className={`text-[10px] font-bold mb-0.5 ${color} flex items-center gap-1.5`}>
                              <img src={flagUrl} alt={code.toUpperCase()} className="w-3.5 h-2.5" loading="lazy" />
                              {label}
                            </div>
                            <div className={`${isCompact ? "text-base" : "text-lg"} font-semibold truncate ${text === "—" ? "text-text-muted dark:text-gray-500" : "text-text dark:text-white"}`}>
                              {text}
                            </div>
                          </div>

                          <button
                            onClick={() => handleSpeak(item, code)}
                            disabled={text === "—"}
                            className={`relative flex-shrink-0 w-${isCompact ? "9" : "11"} h-${isCompact ? "9" : "11"} rounded-xl transition-all flex items-center justify-center ${playing ? "bg-emerald-500 text-white" : loading ? "bg-yellow-500/30 text-yellow-400 animate-pulse" : text === "—" ? "bg-white/5 text-text-muted/30 cursor-not-allowed" : "bg-white/10 dark:bg-white/5 backdrop-blur-soft hover:bg-white/20 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700"}`}
                            title={code === "hy" ? t("page_lang_hy_wav") : code === "en" ? t("page_lang_en_tts") : t("page_lang_ru_tts")}
                          >
                            {loading ? (
                              <Loader2 size={isCompact ? 14 : 18} className="animate-spin" />
                            ) : playing ? (
                              <span className="text-lg">🔊</span>
                            ) : (
                              <Play size={isCompact ? 12 : 16} />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* EXPANDED CONTENT */}
                  <AnimatePresence>
                    {isExpanded && !isCompact && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {item.tags.map(tag => (
                                <span key={tag} className="text-[8px] bg-white/10 dark:bg-white/5 px-2 py-0.5 rounded-full text-text-muted">
                                  <Tag size={10} className="inline mr-0.5" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="text-xs text-text-muted dark:text-gray-500 flex items-center gap-2 flex-wrap">
                            {item.audio?.hy && (
                              <span className="flex items-center gap-1">
                                <CheckCircle size={12} className="text-emerald-500" />
                                {t("page_mp3")}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-text-muted">
                              <Clock size={12} />
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString("hy-AM") : "—"}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs text-text-muted dark:text-gray-500">🎙️</span>
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
          <div className="text-center text-text-muted dark:text-gray-500 text-sm mt-4">
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
            className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border px-6 py-3 max-w-sm rounded-xl text-center shadow-xl ${toastType === "success" ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : toastType === "error" ? "border-red-500/30 text-red-600 dark:text-red-400" : "border-blue-500/30 text-blue-600 dark:text-blue-400"}`}
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
            className="fixed bottom-24 right-6 z-50 bg-white/10 dark:bg-white/5 backdrop-blur-soft border border-gray-200 dark:border-gray-700 p-3.5 rounded-2xl shadow-glass hover:shadow-glass-lg transition-all"
          >
            <ArrowUp size={20} className="text-text" />
          </motion.button>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}