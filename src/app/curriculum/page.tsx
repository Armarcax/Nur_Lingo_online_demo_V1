// src/app/curriculum/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Globe,
  ChevronDown,
  ChevronUp,
  Printer,
  Download,
  Search,
  X,
  Filter,
  Sparkles,
  Users,
  MessageSquare,
  BookMarked,
  GraduationCap,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  Eye,
  EyeOff,
  BarChart3,
  TrendingUp,
  Award,
  Flame,
  Calendar,
  Share2,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Settings,
  List,
  Grid3x3,
  SortAsc,
  SortDesc,
  FileText,
  Book,
  Star,
  Heart,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ThemeToggle from "@/components/ThemeToggle";
import Nuri, { NuriSpeech, type NuriMood } from "@/components/Nuri";
import { CONTENT_LESSONS, WORLDS, type ContentLesson } from "@/lib/content/database";
import type { LangCode } from "@/lib/i18n/multilingual";
import { useNuri } from "@/hooks/useNuri";
import { GlassCard } from "@/components/ui/glass-card";
import { PageLayout } from "@/components/PageLayout";
import { useI18n } from "@/hooks/useI18n";

// ─── TYPES ────────────────────────────────────────────────────────────

interface LessonProgress {
  completed: boolean;
  score: number;
  lastAttempt: string;
  vocabularyMastered: string[];
  phrasesMastered: string[];
}

interface WorldProgress {
  completedLessons: number;
  totalLessons: number;
  totalScore: number;
  lastActivity: string;
}

interface CurriculumStats {
  totalLessons: number;
  totalVocabulary: number;
  totalPhrases: number;
  totalDialogues: number;
  completedLessons: number;
  inProgressLessons: number;
  overallProgress: number;
  byWorld: Record<string, WorldProgress>;
}

type ViewMode = "list" | "grid" | "compact";
type FilterOption = "all" | "in-progress" | "completed" | "not-started";
type SortOption = "default" | "alphabetical" | "progress" | "recent";

// ─── LOCAL STORAGE KEYS ─────────────────────────────────────────────

const STORAGE_KEYS = {
  LESSON_PROGRESS: "nurlingo_lesson_progress",
  CURRICULUM_VIEW: "nurlingo_curriculum_view",
  CURRICULUM_FAVORITES: "nurlingo_curriculum_favorites",
};

// ─── CHARACTER NAMES (for translations) ─────────────────────────────

const CHARACTER_NAMES: Record<string, Record<LangCode, string>> = {
  nurik: { hy: "Նուրիկ", en: "Nurik", ru: "Нурик" },
  user: { hy: "Դուք", en: "You", ru: "Вы" },
};

// ─── HELPER: Get localized text ─────────────────────────────────────

function getLocalizedText(
  obj: { hy?: string; en?: string; ru?: string } | undefined,
  lang: LangCode,
  fallback: string = ""
): string {
  if (!obj) return fallback;
  return obj[lang] || obj.en || fallback;
}

// ─── HELPER: Get speaker name ─────────────────────────────────────

function getSpeakerName(speaker: string, lang: LangCode): string {
  return CHARACTER_NAMES[speaker]?.[lang] || speaker;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function CurriculumPage() {
  const { setPage } = useNuri();
  const { t, locale } = useI18n();
  
  // ─── LOCAL TOAST ──────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
  
  const showMessage = useCallback((text: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage(text);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  }, []);
  
  useEffect(() => setPage("curriculum"), [setPage]);
  
  // ─── STATE ──────────────────────────────────────────────────────────

  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [nativeLang, setNativeLang] = useState<LangCode>("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [showFilters, setShowFilters] = useState(false);
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showStats, setShowStats] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [nuriMood, setNuriMood] = useState<NuriMood>("idle");
  const [isPrinting, setIsPrinting] = useState(false);
  const [expandedWorlds, setExpandedWorlds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const topRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // ─── LOAD PROGRESS & FAVORITES ────────────────────────────────────

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("nur_source_lang");
      if (savedLang) setNativeLang(savedLang as LangCode);
      
      const savedProgress = localStorage.getItem(STORAGE_KEYS.LESSON_PROGRESS);
      if (savedProgress) {
        setLessonProgress(JSON.parse(savedProgress));
      }
      
      const savedView = localStorage.getItem(STORAGE_KEYS.CURRICULUM_VIEW);
      if (savedView) {
        const view = JSON.parse(savedView);
        if (view.viewMode) setViewMode(view.viewMode);
        if (view.filterOption) setFilterOption(view.filterOption);
        if (view.sortOption) setSortOption(view.sortOption);
      }
      
      const savedFavorites = localStorage.getItem(STORAGE_KEYS.CURRICULUM_FAVORITES);
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      }
    } catch {
      // Ignore
    }
  }, []);

  // ─── SAVE VIEW PREFERENCES ────────────────────────────────────────

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRICULUM_VIEW, JSON.stringify({
        viewMode,
        filterOption,
        sortOption,
      }));
    } catch {
      // Ignore
    }
  }, [viewMode, filterOption, sortOption]);

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
        setExpandedLesson(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // ─── GET WORLD LESSONS ─────────────────────────────────────────────

  const getWorldLessons = useCallback((worldId: string): ContentLesson[] => {
    return CONTENT_LESSONS.filter((l) => l.worldId === worldId);
  }, []);

  // ─── CALCULATE STATS ──────────────────────────────────────────────

  const stats = useMemo((): CurriculumStats => {
    const totalLessons = CONTENT_LESSONS.length;
    const totalVocabulary = CONTENT_LESSONS.reduce((s, l) => s + l.vocabulary.length, 0);
    const totalPhrases = CONTENT_LESSONS.reduce((s, l) => s + l.phrases.length, 0);
    const totalDialogues = CONTENT_LESSONS.reduce((s, l) => s + l.dialogues.length, 0);
    
    let completedLessons = 0;
    let inProgressLessons = 0;
    const byWorld: Record<string, WorldProgress> = {};
    
    for (const world of WORLDS) {
      const worldLessons = getWorldLessons(world.id);
      let completed = 0;
      let totalScore = 0;
      let lastActivity = "";
      
      for (const lesson of worldLessons) {
        const progress = lessonProgress[lesson.id];
        if (progress) {
          if (progress.completed) completed++;
          totalScore += progress.score || 0;
          if (progress.lastAttempt > lastActivity) lastActivity = progress.lastAttempt;
        }
      }
      
      byWorld[world.id] = {
        completedLessons: completed,
        totalLessons: worldLessons.length,
        totalScore,
        lastActivity,
      };
      
      completedLessons += completed;
      inProgressLessons += worldLessons.filter(l => 
        lessonProgress[l.id] && !lessonProgress[l.id].completed && lessonProgress[l.id].score > 0
      ).length;
    }
    
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    return {
      totalLessons,
      totalVocabulary,
      totalPhrases,
      totalDialogues,
      completedLessons,
      inProgressLessons,
      overallProgress,
      byWorld,
    };
  }, [lessonProgress, getWorldLessons]);

  // ─── FILTERED & SORTED WORLDS ─────────────────────────────────────

  const filteredWorlds = useMemo(() => {
    let worlds = WORLDS;
    
    if (selectedWorld) {
      worlds = worlds.filter(w => w.id === selectedWorld);
    }
    
    return worlds;
  }, [selectedWorld]);

  // ─── FILTERED & SORTED LESSONS ────────────────────────────────────

  const getFilteredLessons = useCallback((worldId: string) => {
    let lessons = getWorldLessons(worldId);
    
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      lessons = lessons.filter(l =>
        l.title.en.toLowerCase().includes(q) ||
        l.title.hy?.toLowerCase().includes(q) ||
        l.concept.en.toLowerCase().includes(q) ||
        l.vocabulary.some(v => v.hy.toLowerCase().includes(q) || v.en.toLowerCase().includes(q))
      );
    }
    
    switch (filterOption) {
      case "completed":
        lessons = lessons.filter(l => lessonProgress[l.id]?.completed);
        break;
      case "in-progress":
        lessons = lessons.filter(l => 
          lessonProgress[l.id] && !lessonProgress[l.id].completed && lessonProgress[l.id].score > 0
        );
        break;
      case "not-started":
        lessons = lessons.filter(l => !lessonProgress[l.id] || lessonProgress[l.id].score === 0);
        break;
      default:
        break;
    }
    
    switch (sortOption) {
      case "alphabetical":
        lessons.sort((a, b) => a.title.en.localeCompare(b.title.en));
        break;
      case "progress":
        lessons.sort((a, b) => {
          const progA = lessonProgress[a.id]?.score || 0;
          const progB = lessonProgress[b.id]?.score || 0;
          return progB - progA;
        });
        break;
      case "recent":
        lessons.sort((a, b) => {
          const dateA = lessonProgress[a.id]?.lastAttempt || "";
          const dateB = lessonProgress[b.id]?.lastAttempt || "";
          return dateB.localeCompare(dateA);
        });
        break;
      default:
        break;
    }
    
    return lessons;
  }, [getWorldLessons, searchQuery, filterOption, sortOption, lessonProgress]);

  // ─── TOGGLE FAVORITE ──────────────────────────────────────────────

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(STORAGE_KEYS.CURRICULUM_FAVORITES, JSON.stringify([...next]));
      return next;
    });
  }, []);

  // ─── TOGGLE WORLD EXPAND ──────────────────────────────────────────

  const toggleWorldExpand = useCallback((worldId: string) => {
    setExpandedWorlds(prev => {
      const next = new Set(prev);
      if (next.has(worldId)) next.delete(worldId);
      else next.add(worldId);
      return next;
    });
  }, []);

  // ─── HANDLE PRINT ──────────────────────────────────────────────────

  const handlePrint = useCallback(() => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  }, []);

  // ─── EXPORT CURRICULUM ────────────────────────────────────────────

  const handleExport = useCallback(() => {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        version: "2.0",
        worlds: WORLDS,
        lessons: CONTENT_LESSONS,
        progress: lessonProgress,
        stats,
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nurlingo-curriculum-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showMessage(t("page_export_success", { count: stats.totalLessons }), "success");
    } catch (error) {
      console.error("Export failed:", error);
      showMessage(t("page_export_failed"), "error");
    }
  }, [lessonProgress, stats, showMessage, t]);

  // ─── COPY LESSON ID ───────────────────────────────────────────────

  const copyId = useCallback((id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showMessage(t("page_id_copied"), "info");
  }, [showMessage, t]);

  // ─── SCROLL TO TOP ─────────────────────────────────────────────────

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ─── RESET FILTERS ─────────────────────────────────────────────────

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setFilterOption("all");
    setSortOption("default");
    setSelectedWorld(null);
    setShowFilters(false);
  }, []);

  // ─── GET LESSON STATUS ────────────────────────────────────────────

  const getLessonStatus = useCallback((lessonId: string) => {
    const progress = lessonProgress[lessonId];
    if (!progress) return { status: "not-started", labelKey: "page_not_started", color: "text-gray-400", icon: "⏳" };
    if (progress.completed) return { status: "completed", labelKey: "page_completed", color: "text-emerald-400", icon: "✅" };
    if (progress.score > 0) return { status: "in-progress", labelKey: "page_in_progress", color: "text-yellow-400", icon: "🔄" };
    return { status: "not-started", labelKey: "page_not_started", color: "text-gray-400", icon: "⏳" };
  }, [lessonProgress]);

  // ─── GET PROGRESS COLOR ───────────────────────────────────────────

  const getProgressColor = useCallback((score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 50) return "bg-yellow-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-gray-500";
  }, []);

  const isFiltered = searchQuery !== "" || filterOption !== "all" || sortOption !== "default" || selectedWorld !== null;

  // ─── MAIN RENDER ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent text-gray-900 dark:text-white pb-24">
      <div ref={topRef} className="container-main py-6">
        
        {/* ─── NURI ─── */}
        <div className="flex items-center gap-4 mb-6 no-print">
          <Nuri mood={nuriMood} size={72} glow={nuriMood === "happy"} />
          <div className="flex-1">
            <NuriSpeech
              text={
                nuriMood === "happy"
                  ? t("page_nuri_curriculum_happy", { count: stats.completedLessons })
                  : t("page_nuri_curriculum_idle")
              }
              mood={nuriMood}
            />
          </div>
          <ThemeToggle />
        </div>

        {/* ─── HEADER ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen size={24} className="text-red-500" />
              {t("page_curriculum")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
              <span>{t("page__stats_total_", { total: stats.totalLessons })}</span>
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <span>📚 {t("page__stats_completed_", { completed: stats.completedLessons })}</span>
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <span>{t("page__stats_inprogress_", { inProgress: stats.inProgressLessons })}</span>
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <span className="text-emerald-400">✅ {t("page_completed")}: {stats.completedLessons}</span>
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <span>{t("page__stats_overallprogress_", { progress: stats.overallProgress })}</span>
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap no-print">
            {/* View Mode */}
            <div className="flex gap-1 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-1 border border-white/20 dark:border-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
              <button
                onClick={() => setViewMode("list")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "list" ? "bg-blue-500 text-white" : "hover:bg-white/10 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
                title={t("page_list_view")}
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "grid" ? "bg-blue-500 text-white" : "hover:bg-white/10 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
                title={t("page_grid_view")}
              >
                <Grid3x3 size={14} />
              </button>
              <button
                onClick={() => setViewMode("compact")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "compact" ? "bg-blue-500 text-white" : "hover:bg-white/10 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
                title={t("page_compact")}
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                showFilters
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
              }`}
            >
              <Filter size={14} />
              <span className="hidden sm:inline">{t("page_filters")}</span>
              {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
            </button>

            <button
              onClick={() => setShowStats(!showStats)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                showStats
                  ? "bg-indigo-500 text-white"
                  : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
              }`}
            >
              <BarChart3 size={14} />
              <span className="hidden sm:inline">{t("page_stats")}</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-3 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-xl text-xs font-medium transition-all flex items-center gap-1 border border-blue-500/20"
            >
              {isPrinting ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
              <span className="hidden sm:inline">{t("page_print")}</span>
            </button>

            <button
              onClick={handleExport}
              className="px-3 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-xl text-xs font-medium transition-all flex items-center gap-1 border border-green-500/20"
            >
              <Download size={14} />
              <span className="hidden sm:inline">{t("page_export")}</span>
            </button>

            {isFiltered && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl text-xs font-medium transition-all flex items-center gap-1 border border-red-500/20"
              >
                <X size={14} />
                <span className="hidden sm:inline">{t("page_clear_filters")}</span>
              </button>
            )}
          </div>
        </div>

        {/* ─── STATS PANEL ─── */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <GlassCard variant="premium" className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{stats.totalLessons}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("page_lessons")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-500">{stats.completedLessons}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("page_completed")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">{stats.inProgressLessons}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("page_in_progress")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{stats.overallProgress}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("page_overall_progress")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">{stats.totalVocabulary}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("page_vocabulary")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">{stats.totalPhrases}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("page_phrases")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-500">{stats.totalDialogues}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("page_dialogues")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-500">{favorites.size}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("page_favorites")}</div>
                  </div>
                </div>
              </GlassCard>
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
              className="overflow-hidden mb-4 no-print"
            >
              <GlassCard variant="premium" className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* World Filter */}
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{t("page__world")}</label>
                    <select
                      value={selectedWorld || ""}
                      onChange={(e) => setSelectedWorld(e.target.value || null)}
                      className="w-full bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      <option value="">{t("page_all")}</option>
                      {WORLDS.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.iconEmoji} {getLocalizedText(w.title, locale as LangCode, w.title.en)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{t("page_status")}</label>
                    <select
                      value={filterOption}
                      onChange={(e) => setFilterOption(e.target.value as FilterOption)}
                      className="w-full bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      <option value="all">{t("page_all")}</option>
                      <option value="completed">{t("page_completed")}</option>
                      <option value="in-progress">{t("page_in_progress")}</option>
                      <option value="not-started">{t("page_not_started")}</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{t("page_sort")}</label>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="w-full bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      <option value="default">{t("page_default")}</option>
                      <option value="alphabetical">{t("page_alphabetical")}</option>
                      <option value="progress">{t("page_progress")}</option>
                      <option value="recent">{t("page_recently_viewed")}</option>
                    </select>
                  </div>

                  {/* Search */}
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{t("page_search")}</label>
                    <div className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("page_search_lessons_")}
                        className="w-full bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── SEARCH BAR (mobile) ─── */}
        {!showFilters && (
          <div className="relative mb-4 no-print sm:hidden">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("page_search_lessons_ctrl_k_")}
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
        )}

        {/* ─── PROGRESS OVERVIEW BAR ─── */}
        <div className="mb-6 no-print">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t("page_progress")}</span>
            <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400"
                initial={{ width: 0 }}
                animate={{ width: `${stats.overallProgress}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{t("page__stats_overallprogress_", { progress: stats.overallProgress })}</span>
          </div>
        </div>

        {/* ─── CURRICULUM CONTENT ─── */}
        <div className="space-y-6">
          {filteredWorlds.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🌍</div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">{t("page_no_worlds")}</p>
            </div>
          ) : (
            filteredWorlds.map((world) => {
              const lessons = getFilteredLessons(world.id);
              const isExpanded = expandedWorlds.has(world.id);
              const worldProgress = stats.byWorld[world.id];
              const completedCount = worldProgress?.completedLessons || 0;
              const totalCount = worldProgress?.totalLessons || 0;
              const worldProgressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

              if (lessons.length === 0 && searchQuery) return null;

              // ✅ Localized world title and description
              const worldTitle = getLocalizedText(world.title, locale as LangCode, world.title.en);
              const worldDesc = getLocalizedText(world.description, locale as LangCode, world.description.en);

              return (
                <GlassCard
                  key={world.id}
                  variant="world"
                  className="print-world overflow-hidden p-0"
                >
                  {/* ─── WORLD HEADER ─── */}
                  <div
                    className="p-4 border-b border-white/20 dark:border-white/5 cursor-pointer no-print hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
                    onClick={() => toggleWorldExpand(world.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <span>{world.iconEmoji}</span>
                          <span>{worldTitle}</span>
                          {world.title.hy && world.title.hy !== worldTitle && (
                            <span className="text-sm font-normal text-gray-400">({world.title.hy})</span>
                          )}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{worldDesc}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {completedCount}/{totalCount}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{t("page_lessons")}</div>
                        </div>
                        <div className="w-16 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-all"
                            style={{ width: `${worldProgressPercent}%` }}
                          />
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={20} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ─── EXPANDED LESSONS ─── */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden no-print"
                      >
                        <div className="p-4 space-y-4">
                          {lessons.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              {searchQuery ? t("page_no_results", { query: searchQuery }) : t("page_no_lessons")}
                            </div>
                          ) : (
                            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : viewMode === "compact" ? "space-y-1" : "space-y-3"}>
                              {lessons.map((lesson) => {
                                const status = getLessonStatus(lesson.id);
                                const progress = lessonProgress[lesson.id];
                                const score = progress?.score || 0;
                                const isFavorite = favorites.has(lesson.id);
                                const isExpandedLesson = expandedLesson === lesson.id;

                                // ✅ Localized lesson title and concept
                                const lessonTitle = getLocalizedText(lesson.title, locale as LangCode, lesson.title.en);
                                const lessonConcept = getLocalizedText(lesson.concept, locale as LangCode, lesson.concept.en);

                                return (
                                  <GlassCard
                                    key={lesson.id}
                                    variant={viewMode === "compact" ? "compact" : "lesson"}
                                    className={`${viewMode === "compact" ? "p-2" : "p-4"} ${
                                      isFavorite ? "border-yellow-500/50" : ""
                                    }`}
                                    glow={isFavorite}
                                  >
                                    {/* ─── LESSON HEADER ─── */}
                                    <div
                                      className={`flex items-center justify-between cursor-pointer ${viewMode === "compact" ? "gap-2" : ""}`}
                                      onClick={() => setExpandedLesson(isExpandedLesson ? null : lesson.id)}
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            status.status === "completed" ? "bg-emerald-500/20 text-emerald-500" :
                                            status.status === "in-progress" ? "bg-yellow-500/20 text-yellow-500" :
                                            "bg-gray-500/20 text-gray-400"
                                          }`}>
                                            {status.icon} {t(status.labelKey)}
                                          </span>
                                          {isFavorite && (
                                            <span className="text-[10px] text-yellow-400">⭐</span>
                                          )}
                                          {lesson.dialogues.length > 0 && (
                                            <span className="text-[10px] text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded-full">
                                              💬 {lesson.dialogues.length}
                                            </span>
                                          )}
                                        </div>
                                        <h3 className={`font-bold text-gray-900 dark:text-white truncate ${viewMode === "compact" ? "text-sm" : "text-base"}`}>
                                          {lessonTitle}
                                        </h3>
                                        <p className={`text-gray-500 dark:text-gray-400 truncate ${viewMode === "compact" ? "text-xs" : "text-sm"}`}>
                                          {lessonConcept}
                                        </p>
                                        {viewMode !== "compact" && (
                                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            <span>{t("page__vocab_count", { count: lesson.vocabulary.length })}</span>
                                            <span>{t("page__phrase_count", { count: lesson.phrases.length })}</span>
                                            <span>{t("page__dialogue_count", { count: lesson.dialogues.length })}</span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {viewMode !== "compact" && (
                                          <>
                                            <button
                                              onClick={(e) => { e.stopPropagation(); toggleFavorite(lesson.id); }}
                                              className={`p-1 rounded-lg transition-colors ${
                                                isFavorite ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"
                                              }`}
                                            >
                                              <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
                                            </button>
                                            <button
                                              onClick={(e) => { e.stopPropagation(); copyId(lesson.id); }}
                                              className="p-1 rounded-lg text-gray-400 hover:text-gray-300 transition-colors"
                                            >
                                              {copiedId === lesson.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                            </button>
                                          </>
                                        )}
                                        <div className="flex items-center gap-2">
                                          {viewMode !== "compact" && (
                                            <div className="text-right">
                                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {score}%
                                              </div>
                                              <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                <div
                                                  className={`h-full rounded-full ${getProgressColor(score)} transition-all`}
                                                  style={{ width: `${score}%` }}
                                                />
                                              </div>
                                            </div>
                                          )}
                                          {isExpandedLesson ? (
                                            <ChevronUp size={viewMode === "compact" ? 14 : 20} className="text-gray-500" />
                                          ) : (
                                            <ChevronDown size={viewMode === "compact" ? 14 : 20} className="text-gray-500" />
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* ─── EXPANDED LESSON CONTENT ─── */}
                                    <AnimatePresence>
                                      {isExpandedLesson && viewMode !== "compact" && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.3 }}
                                          className="overflow-hidden"
                                        >
                                          <div className="mt-3 pt-3 border-t border-white/20 dark:border-white/5 space-y-4">
                                            {/* Vocabulary */}
                                            <div>
                                              <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                                                📖 {t("page_vocabulary")} ({lesson.vocabulary.length})
                                              </h4>
                                              <div className="grid grid-cols-1 gap-1">
                                                {lesson.vocabulary.map((v) => (
                                                  <div key={v.id} className="flex gap-4 text-sm py-1 border-b border-white/10 dark:border-white/5 last:border-0">
                                                    <span className="text-red-600 dark:text-red-400 w-1/3">{v.hy}</span>
                                                    <span className="text-blue-600 dark:text-blue-400 w-1/3">{v.en}</span>
                                                    <span className="text-green-600 dark:text-green-400 w-1/3">{v.ru}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>

                                            {/* Phrases */}
                                            {lesson.phrases.length > 0 && (
                                              <div>
                                                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                                                  💬 {t("page_phrases")} ({lesson.phrases.length})
                                                </h4>
                                                <div className="grid grid-cols-1 gap-1">
                                                  {lesson.phrases.map((p, i) => (
                                                    <div key={i} className="flex gap-4 text-sm py-1 border-b border-white/10 dark:border-white/5 last:border-0">
                                                      <span className="text-red-600 dark:text-red-400 w-1/3">{p.hy}</span>
                                                      <span className="text-blue-600 dark:text-blue-400 w-1/3">{p.en}</span>
                                                      <span className="text-green-600 dark:text-green-400 w-1/3">{p.ru}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}

                                            {/* Dialogues */}
                                            {lesson.dialogues.map((d, i) => {
                                              const dialogueTitle = getLocalizedText(d.title, locale as LangCode, d.title.en);
                                              return (
                                                <div key={i}>
                                                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                                                    🗣️ {dialogueTitle} {d.title.hy && d.title.hy !== dialogueTitle && `/ ${d.title.hy}`}
                                                  </h4>
                                                  <div className="space-y-2 border border-white/20 dark:border-white/5 rounded-lg p-3 bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm">
                                                    {d.turns.map((turn, j) => {
                                                      // ✅ Use localized speaker name
                                                      const speakerName = getSpeakerName(turn.speaker, locale as LangCode);
                                                      return (
                                                        <div
                                                          key={j}
                                                          className={`p-2 rounded ${
                                                            turn.speaker === "nurik"
                                                              ? "bg-blue-50/50 dark:bg-blue-950/30"
                                                              : "bg-green-50/50 dark:bg-green-950/30"
                                                          }`}
                                                        >
                                                          <div className="font-bold text-xs mb-1 text-gray-900 dark:text-white">
                                                            {turn.speaker === "nurik" ? "🐿️ " : "🧑 "}{speakerName}
                                                          </div>
                                                          <div className="text-red-600 dark:text-red-400">{turn.hy}</div>
                                                          <div className="text-blue-600 dark:text-blue-400 text-sm">{turn.en}</div>
                                                          <div className="text-green-600 dark:text-green-400 text-sm">{turn.ru}</div>
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              );
                                            })}

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-2 pt-2">
                                              <Link
                                                href={`/learn?lesson=${lesson.id}`}
                                                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-bold text-white transition flex items-center gap-1 shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
                                              >
                                                <GraduationCap size={16} />
                                                {t("page_start_lesson")}
                                              </Link>
                                              <Link
                                                href={`/dialogues?lesson=${lesson.id}`}
                                                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-sm font-medium text-blue-400 transition flex items-center gap-1 border border-blue-500/20"
                                              >
                                                <MessageSquare size={16} />
                                                {t("page_dialogues")}
                                              </Link>
                                              <button
                                                onClick={() => toggleFavorite(lesson.id)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                                                  isFavorite
                                                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                                    : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 text-gray-400 hover:text-yellow-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                                                }`}
                                              >
                                                {isFavorite ? <BookMarked size={16} /> : <BookOpen size={16} />}
                                                {isFavorite ? t("page_favorite") : t("page_save")}
                                              </button>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    {/* Compact view actions */}
                                    {viewMode === "compact" && (
                                      <div className="mt-1 flex items-center gap-2">
                                        <Link
                                          href={`/learn?lesson=${lesson.id}`}
                                          className="px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-[10px] font-medium transition"
                                        >
                                          {t("page_start")}
                                        </Link>
                                        <button
                                          onClick={() => toggleFavorite(lesson.id)}
                                          className={`p-1 rounded-lg transition-colors ${
                                            isFavorite ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"
                                          }`}
                                        >
                                          <Star size={12} fill={isFavorite ? "currentColor" : "none"} />
                                        </button>
                                      </div>
                                    )}
                                  </GlassCard>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              );
            })
          )}
        </div>
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

      <BottomNav />
    </div>
  );
}