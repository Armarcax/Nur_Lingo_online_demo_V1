// src/app/dictionary/page.tsx
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react"

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  Mic,
  Volume2,
  VolumeX,
  Plus,
  User,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Globe,
  Languages,
  Play,
  Pause,
  Loader2,
  ArrowUp,
  BadgeCheck,
  Star,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  Zap,
  Clock,
  Music,
  Headphones,
  ChevronRight,
  Radio,
  Speaker,
  Users,
  Copy,
  Check,
  Tag,
  FolderOpen,
  BarChart3,
  TrendingUp,
  BookMarked,
  GraduationCap,
  Brain,
  Target,
  Flame,
  Calendar,
  Settings,
  Eye,
  EyeOff,
  List,
  Grid3x3,
  SortAsc,
  SortDesc,
  FilterX,
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
  audio?: {
    hy?: string;
    en?: string;
    ru?: string;
  };
  wavAudio?: {
    hy?: string;
    en?: string;
    ru?: string;
  };
  hasWAV?: boolean;
  wavGenerating?: boolean;
  wavError?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface WavManifest {
  schemaVersion: number;
  lastUpdated: string;
  totalEntries: number;
  entries: Record<string, {
    hy?: string;
    en?: string;
    ru?: string;
  }>;
}

interface WordStats {
  total: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
  withAudio: number;
  withWAV: number;
  mostPopular: string[];
  recentWords: string[];
}

// ─── LOAD JSON DATA ──────────────────────────────────────────────────

import baseDict from "../../../data/dictionaries/unified-dictionary.json";

const LANGS: { code: LangCode; label: string; flag: string; color: string; bg: string; textColor: string }[] = [
  { code: "hy", label: "ՀԱՅԵՐԵՆ", flag: "🇦🇲", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", textColor: "text-red-300" },
  { code: "en", label: "ENGLISH", flag: "🇬🇧", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", textColor: "text-blue-300" },
  { code: "ru", label: "РУССКИЙ", flag: "🇷🇺", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", textColor: "text-green-300" },
];

interface ActivePlay {
  wordId: string;
  lang: LangCode;
  source: "mp3" | "wav" | "tts";
}

type ViewMode = "list" | "grid" | "compact";
type SortOption = "default" | "popular" | "alphabetical" | "reverse-alpha" | "newest" | "oldest";
type FilterOption = "all" | "vocab" | "phrase" | "dialogue" | "beginner" | "intermediate" | "advanced" | "has-audio" | "no-audio" | "has-wav";

// ─── LOCAL STORAGE KEYS ─────────────────────────────────────────────

const STORAGE_KEYS = {
  WAV_MANIFEST: "nurlingo_wav_manifest",
  WAV_GENERATED: "nurlingo_wav_generated",
  SELECTED_VOICE: "nurlingo_selected_voice",
  VIEW_PREFERENCES: "nurlingo_view_preferences",
  DICTIONARY_HISTORY: "nurlingo_dictionary_history",
  FAVORITE_WORDS: "nurlingo_favorite_words",
};

// ─── HELPERS ─────────────────────────────────────────────────────────

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("hy-AM", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function DictionaryPage() {
  const { play, stop, isPlaying, isLoading, isTTSFallback, preload } = useAudioManager();
  const { t } = useI18n();
  const { setPage } = useNuri();
  
  // ─── LOCAL TOAST ──────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
  
  const showMessage = useCallback((text: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage(text);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  }, []);
  
  useEffect(() => setPage("dictionary"), [setPage]);

  // ─── STATE ──────────────────────────────────────────────────────────

  const [vocab, setVocab] = useState<DictionaryEntry[]>([]);
  const [activePlay, setActivePlay] = useState<ActivePlay | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLang, setFilterLang] = useState<LangCode>("hy");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [nuriMood, setNuriMood] = useState<NuriMood>("idle");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isWAVAvailable, setIsWAVAvailable] = useState(false);
  const [wavStatus, setWavStatus] = useState<string>("");
  const [isGeneratingWAV, setIsGeneratingWAV] = useState(false);
  const [wavProgress, setWavProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [wavManifest, setWavManifest] = useState<WavManifest | null>(null);
  const [wavClient, setWavClient] = useState<WavClient | null>(null);
  const [generatingSingleWord, setGeneratingSingleWord] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("Avet");
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [wavCredits, setWavCredits] = useState<number | null>(null);
  const [isTestingWAV, setIsTestingWAV] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [wordHistory, setWordHistory] = useState<string[]>([]);
  const [wordStats, setWordStats] = useState<WordStats | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  
  const topRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const cancelGenerationRef = useRef<boolean>(false);

  // ─── LOAD FAVORITES & HISTORY ─────────────────────────────────────

  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITE_WORDS);
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      }
      const savedHistory = localStorage.getItem(STORAGE_KEYS.DICTIONARY_HISTORY);
      if (savedHistory) {
        setWordHistory(JSON.parse(savedHistory));
      }
    } catch {
      // Ignore
    }
  }, []);

  // ─── SAVE FAVORITES ───────────────────────────────────────────────

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(STORAGE_KEYS.FAVORITE_WORDS, JSON.stringify([...next]));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  // ─── TRACK WORD VIEW ──────────────────────────────────────────────

  const trackWordView = useCallback((id: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(w => w !== id);
      const updated = [id, ...filtered].slice(0, 20);
      try {
        localStorage.setItem(STORAGE_KEYS.DICTIONARY_HISTORY, JSON.stringify(updated));
      } catch { /* ignore */ }
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
    } catch {
      // Ignore
    }
  }, []);

  // ─── SAVE VIEW PREFERENCES ────────────────────────────────────────

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VIEW_PREFERENCES, JSON.stringify({
        viewMode,
        sortOption,
        filterOption,
      }));
    } catch {
      // Ignore
    }
  }, [viewMode, sortOption, filterOption]);

  // ─── LOAD WAV MANIFEST FROM LOCAL STORAGE ─────────────────────────

  const loadWavManifestFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WAV_MANIFEST);
      if (stored) {
        const data = JSON.parse(stored) as WavManifest;
        setWavManifest(data);
        return data;
      }
    } catch {
      // Ignore
    }
    return null;
  }, []);

  const saveWavManifestToStorage = useCallback((manifest: WavManifest) => {
    try {
      localStorage.setItem(STORAGE_KEYS.WAV_MANIFEST, JSON.stringify(manifest));
    } catch {
      // Ignore
    }
  }, []);

  // ─── CHECK WAV AVAILABILITY ────────────────────────────────────────

  useEffect(() => {
    const initWAV = async () => {
      try {
        const client = getWavClient();
        if (client) {
          setWavClient(client);
          setIsWAVAvailable(true);
          setWavStatus("✅ WAV.am connected");
          
          const voices = client.getAvailableVoices();
          if (voices.length > 0) {
            const savedVoice = localStorage.getItem(STORAGE_KEYS.SELECTED_VOICE);
            if (savedVoice && voices.includes(savedVoice)) {
              setSelectedVoice(savedVoice);
            } else {
              setSelectedVoice(voices[0]);
            }
          }
          
          try {
            const credits = await client.getRemainingCredits();
            if (credits !== null) {
              setWavCredits(credits);
            }
          } catch {
            // Ignore
          }
          
          const manifest = loadWavManifestFromStorage();
          if (manifest) {
            setVocab(prev => prev.map(entry => {
              const wavEntry = manifest.entries?.[entry.id];
              if (wavEntry) {
                return {
                  ...entry,
                  hasWAV: true,
                  wavAudio: {
                    hy: wavEntry.hy || undefined,
                    en: wavEntry.en || undefined,
                    ru: wavEntry.ru || undefined,
                  }
                };
              }
              return entry;
            }));
          }
        } else {
          setIsWAVAvailable(false);
          setWavStatus("⚠️ WAV.am not available");
        }
      } catch (error) {
        console.error("WAV init error:", error);
        setIsWAVAvailable(false);
        setWavStatus("⚠️ WAV.am not available");
      }
    };
    initWAV();
  }, [loadWavManifestFromStorage]);

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

  // ─── UPDATE STATS ──────────────────────────────────────────────────

  const updateStats = useCallback((data: DictionaryEntry[]) => {
    const stats: WordStats = {
      total: data.length,
      byType: {},
      byCategory: {},
      byDifficulty: {},
      withAudio: data.filter(e => e.audio && (e.audio.hy || e.audio.en || e.audio.ru)).length,
      withWAV: data.filter(e => e.hasWAV).length,
      mostPopular: data.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 5).map(e => e.id),
      recentWords: data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5).map(e => e.id),
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
    if (!searchQuery) {
      setNuriMood("idle");
      return;
    }
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
      case "vocab":
        items = items.filter(e => e.type === "vocab");
        break;
      case "phrase":
        items = items.filter(e => e.type === "phrase");
        break;
      case "dialogue":
        items = items.filter(e => e.type === "dialogue");
        break;
      case "beginner":
        items = items.filter(e => e.difficulty === "beginner");
        break;
      case "intermediate":
        items = items.filter(e => e.difficulty === "intermediate");
        break;
      case "advanced":
        items = items.filter(e => e.difficulty === "advanced");
        break;
      case "has-audio":
        items = items.filter(e => e.audio && (e.audio.hy || e.audio.en || e.audio.ru));
        break;
      case "no-audio":
        items = items.filter(e => !e.audio || (!e.audio.hy && !e.audio.en && !e.audio.ru));
        break;
      case "has-wav":
        items = items.filter(e => e.hasWAV);
        break;
      default:
        break;
    }
    
    switch (sortOption) {
      case "popular":
        items.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      case "alphabetical":
        items.sort((a, b) => a.hy.localeCompare(b.hy));
        break;
      case "reverse-alpha":
        items.sort((a, b) => b.hy.localeCompare(a.hy));
        break;
      case "newest":
        items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case "oldest":
        items.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        break;
      case "default":
      default:
        items.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        break;
    }
    
    return items;
  }, [vocab, searchQuery, filterOption, sortOption]);

  // ─── GET AUDIO ID ──────────────────────────────────────────────────

  const getAudioId = useCallback((item: DictionaryEntry): string => {
    return item.id;
  }, []);

  // ─── GENERATE SINGLE WORD WAV ─────────────────────────────────────

  const generateSingleWAV = useCallback(async (entry: DictionaryEntry) => {
    if (!wavClient || !isWAVAvailable) {
      setWavStatus("❌ WAV client not available");
      return;
    }

    setGeneratingSingleWord(entry.id);
    setWavStatus(`⏳ Generating WAV for "${entry.hy}"...`);

    try {
      const text = entry.hy;
      if (!text) {
        throw new Error("No text to generate");
      }

      const result = await wavClient.generateAudio(text, { 
        voice: selectedVoice, 
        format: "mp3" 
      });
      
      const audioBlob = await wavClient.downloadAudio(result.path);
      
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });

      const audioKey = `wav_audio_${entry.id}`;
      try {
        localStorage.setItem(audioKey, base64);
      } catch {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('wav_audio_'));
        const sorted = keys.sort((a, b) => {
          const aTime = parseInt(localStorage.getItem(a + '_time') || '0');
          const bTime = parseInt(localStorage.getItem(b + '_time') || '0');
          return aTime - bTime;
        });
        for (let i = 0; i < Math.min(10, sorted.length); i++) {
          localStorage.removeItem(sorted[i]);
          localStorage.removeItem(sorted[i] + '_time');
        }
        localStorage.setItem(audioKey, base64);
      }
      localStorage.setItem(audioKey + '_time', Date.now().toString());

      const newManifest: WavManifest = {
        schemaVersion: 1,
        lastUpdated: new Date().toISOString(),
        totalEntries: (wavManifest?.totalEntries || 0) + 1,
        entries: {
          ...(wavManifest?.entries || {}),
          [entry.id]: {
            hy: `data:audio/mp3;base64,${base64.split(',')[1]}`,
          }
        }
      };

      setWavManifest(newManifest);
      saveWavManifestToStorage(newManifest);

      setVocab(prev => prev.map(e => 
        e.id === entry.id 
          ? { 
              ...e, 
              hasWAV: true, 
              wavAudio: { 
                hy: `data:audio/mp3;base64,${base64.split(',')[1]}` 
              } 
            }
          : e
      ));

      try {
        const credits = await wavClient.getRemainingCredits();
        if (credits !== null) {
          setWavCredits(credits);
        }
      } catch {
        // Ignore
      }

      setWavStatus(`✅ Generated WAV for "${entry.hy}"`);
      showMessage(t("page_wav_generated", { word: entry.hy }), "success");
    } catch (error) {
      console.error(`❌ Failed to generate WAV for ${entry.id}:`, error);
      setWavStatus(`❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      showMessage(t("page_wav_generation_failed"), "error");
    } finally {
      setGeneratingSingleWord(null);
    }
  }, [wavClient, isWAVAvailable, wavManifest, saveWavManifestToStorage, selectedVoice, showMessage, t]);

  // ─── GENERATE WAV FOR ALL WORDS ───────────────────────────────────

  const generateAllWAV = useCallback(async () => {
    if (!wavClient || !isWAVAvailable) {
      setWavStatus("❌ WAV client not available");
      return;
    }

    cancelGenerationRef.current = false;
    setIsGeneratingWAV(true);
    setWavStatus(`⏳ ${t("page_generating_wav_with")} ${selectedVoice}...`);
    setWavProgress({ current: 0, total: vocab.length });

    const newManifest: WavManifest = {
      schemaVersion: 1,
      lastUpdated: new Date().toISOString(),
      totalEntries: 0,
      entries: {},
    };

    let successCount = 0;
    const totalWords = vocab.length;

    for (let i = 0; i < vocab.length; i++) {
      if (cancelGenerationRef.current) {
        setWavStatus("⏹️ Generation cancelled");
        break;
      }

      const entry = vocab[i];
      const text = entry.hy;
      
      if (!text) continue;

      try {
        setWavProgress({ current: i + 1, total: totalWords });
        setWavStatus(`⏳ ${i + 1}/${totalWords}: "${text}"`);

        const result = await wavClient.generateAudio(text, { 
          voice: selectedVoice, 
          format: "mp3" 
        });
        
        const audioBlob = await wavClient.downloadAudio(result.path);
        
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(audioBlob);
        });

        const audioKey = `wav_audio_${entry.id}`;
        try {
          localStorage.setItem(audioKey, base64);
          localStorage.setItem(audioKey + '_time', Date.now().toString());
        } catch {
          console.warn(`⚠️ Storage full, skipping ${entry.id}`);
          continue;
        }

        newManifest.entries[entry.id] = {
          hy: `data:audio/mp3;base64,${base64.split(',')[1]}`,
        };
        newManifest.totalEntries++;
        successCount++;

        setVocab(prev => prev.map(e => 
          e.id === entry.id 
            ? { ...e, hasWAV: true, wavAudio: { hy: `data:audio/mp3;base64,${base64.split(',')[1]}` } }
            : e
        ));

        await new Promise(r => setTimeout(r, 500));

      } catch (error) {
        console.error(`❌ Failed to generate WAV for ${entry.id}:`, error);
      }
    }

    newManifest.lastUpdated = new Date().toISOString();
    setWavManifest(newManifest);
    saveWavManifestToStorage(newManifest);

    try {
      const credits = await wavClient.getRemainingCredits();
      if (credits !== null) {
        setWavCredits(credits);
      }
    } catch {
      // Ignore
    }

    setIsGeneratingWAV(false);
    setWavStatus(`✅ ${t("page_wav_generated_all", { success: successCount, total: totalWords })}`);
    showMessage(t("page_wav_generated_all", { success: successCount, total: totalWords }), "success");
  }, [vocab, wavClient, isWAVAvailable, saveWavManifestToStorage, selectedVoice, showMessage, t]);

  // ─── CANCEL WAV GENERATION ────────────────────────────────────────

  const cancelWAVGeneration = useCallback(() => {
    cancelGenerationRef.current = true;
    setWavStatus("⏹️ Cancelling...");
  }, []);

  // ─── CLEAR WAV CACHE ──────────────────────────────────────────────

  const clearWAVCache = useCallback(() => {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('wav_audio_'));
      keys.forEach(k => {
        localStorage.removeItem(k);
        localStorage.removeItem(k + '_time');
      });
      localStorage.removeItem(STORAGE_KEYS.WAV_MANIFEST);
      setWavManifest(null);
      setVocab(prev => prev.map(e => ({ ...e, hasWAV: false, wavAudio: undefined })));
      setWavStatus("🗑️ WAV cache cleared");
      showMessage(t("page_wav_cache_cleared"), "info");
    } catch {
      setWavStatus("❌ Failed to clear cache");
    }
  }, [showMessage, t]);

  // ─── FEMALE VOICE SPEECH SYNTHESIS ────────────────────────────────

  const speakWithFemaleVoice = useCallback((text: string, lang: string) => {
    return new Promise((resolve, reject) => {
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
            const newVoices = window.speechSynthesis.getVoices();
            findAndSpeak(newVoices);
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
          console.log(`🎤 Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
        } else {
          utterance.pitch = 1.5;
          console.warn(`⚠️ No female voice found for ${lang}, using high pitch (1.5)`);
        }

        utterance.onend = () => {
          resolve(true);
        };

        utterance.onerror = (e) => {
          console.error('Speech error:', e);
          reject(e);
        };

        window.speechSynthesis.speak(utterance);
      };

      getVoices();
    });
  }, []);

  // ─── PLAY AUDIO VIA API ──────────────────────────────────────────────

  const playAudioViaAPI = useCallback(async (text: string, lang: LangCode) => {
    if (!text) return false;

    if (lang === 'hy') {
      if (wavClient && isWAVAvailable) {
        try {
          console.log(`🔊 Playing Armenian via WAV: "${text}"`);
          await wavClient.playGeneratedAudio(text, selectedVoice);
          return true;
        } catch (error) {
          console.warn("WAV Client failed:", error);
        }
      }

      try {
        const response = await fetch('/api/generate-wav', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice: selectedVoice }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.audio) {
            const audio = new Audio(data.audio);
            await audio.play();
            return true;
          } else if (data.url || data.audioUrl) {
            const url = data.url || data.audioUrl;
            const audio = new Audio(url);
            await audio.play();
            return true;
          }
        }
      } catch (error) {
        console.warn("WAV API failed:", error);
      }

      try {
        await speakWithFemaleVoice(text, 'hy');
        return true;
      } catch {
        return false;
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
          if (data.audio) {
            const audio = new Audio(data.audio);
            await audio.play();
            return true;
          } else if (data.audioUrl) {
            const audio = new Audio(data.audioUrl);
            await audio.play();
            return true;
          }
        }
      } catch (error) {
        console.warn("English TTS API failed:", error);
      }

      try {
        await speakWithFemaleVoice(text, 'en');
        return true;
      } catch {
        return false;
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
          if (data.audio) {
            const audio = new Audio(data.audio);
            await audio.play();
            return true;
          } else if (data.audioUrl) {
            const audio = new Audio(data.audioUrl);
            await audio.play();
            return true;
          }
        }
      } catch (error) {
        console.warn("Russian TTS API failed:", error);
      }

      try {
        await speakWithFemaleVoice(text, 'ru');
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }, [wavClient, isWAVAvailable, selectedVoice, speakWithFemaleVoice]);

  // ─── HANDLE SPEAK ──────────────────────────────────────────────────

  const handleSpeak = useCallback(
    async (item: DictionaryEntry, lang: LangCode) => {
      const text = item[lang] || "";
      
      if (!text) {
        showMessage(t("page_no_text"), "error");
        return;
      }

      if (isPlaying) {
        stop();
        setActivePlay(null);
        return;
      }

      setActivePlay({ wordId: item.id, lang, source: "tts" });
      setNuriMood("happy");

      try {
        if (lang === "hy") {
          const wavUrl = item.wavAudio?.hy;
          if (wavUrl) {
            try {
              const audio = new Audio(wavUrl);
              await audio.play();
              audio.onended = () => setActivePlay(null);
              return;
            } catch (error) {
              console.warn("WAV playback failed:", error);
            }
          }

          const success = await playAudioViaAPI(text, "hy");
          if (success) {
            setActivePlay(null);
            return;
          }
          
          play(text, lang as LanguageCode, item.id, `${item.id}-${lang}`);
          return;
        }

        if (lang === "en") {
          const success = await playAudioViaAPI(text, "en");
          if (success) {
            setActivePlay(null);
            return;
          }
          play(text, lang as LanguageCode, item.id, `${item.id}-${lang}`);
          return;
        }

        if (lang === "ru") {
          const success = await playAudioViaAPI(text, "ru");
          if (success) {
            setActivePlay(null);
            return;
          }
          play(text, lang as LanguageCode, item.id, `${item.id}-${lang}`);
          return;
        }

        play(text, lang as LanguageCode, item.id, `${item.id}-${lang}`);
      } catch (error) {
        console.error("Playback error:", error);
        play(text, lang as LanguageCode, item.id, `${item.id}-${lang}`);
      }
    },
    [isPlaying, stop, play, showMessage, playAudioViaAPI, t]
  );

  // ─── TEST WAV.am ────────────────────────────────────────────────────

  const testWAV = useCallback(async () => {
    if (!wavClient || !isWAVAvailable) {
      setWavStatus("❌ WAV client not available");
      return;
    }
    
    setIsTestingWAV(true);
    try {
      setWavStatus(`⏳ ${t("page_testing_wav_with")} ${selectedVoice}...`);
      await wavClient.playGeneratedAudio("Բարև, ես Նուռ Լինգո եմ", selectedVoice);
      setWavStatus(`✅ WAV TTS works! (${selectedVoice})`);
      
      try {
        const credits = await wavClient.getRemainingCredits();
        if (credits !== null) {
          setWavCredits(credits);
        }
      } catch {
        // Ignore
      }
    } catch (error) {
      setWavStatus(`❌ WAV error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestingWAV(false);
    }
  }, [wavClient, isWAVAvailable, selectedVoice, t]);

  // ─── CHANGE VOICE ──────────────────────────────────────────────────

  const changeVoice = useCallback((voice: string) => {
    setSelectedVoice(voice);
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_VOICE, voice);
    } catch {
      // Ignore
    }
    setShowVoiceSelector(false);
    setWavStatus(`🎤 ${t("page_voice_changed_to")} ${voice}`);
  }, [t]);

  // ─── IS WORD PLAYING ──────────────────────────────────────────────

  const isWordPlaying = useCallback(
    (id: string, lang: LangCode) => {
      return activePlay?.wordId === id && activePlay?.lang === lang && (isPlaying || isLoading);
    },
    [activePlay, isPlaying, isLoading]
  );

  // ─── TOGGLE EXPAND ─────────────────────────────────────────────────

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    trackWordView(id);
  };

  // ─── TYPE COLORS ────────────────────────────────────────────────────

  const typeColors: Record<string, string> = {
    vocab: "bg-blue-500/20 text-blue-300 border-blue-500/20",
    phrase: "bg-purple-500/20 text-purple-300 border-purple-500/20",
    dialogue: "bg-green-500/20 text-green-300 border-green-500/20",
  };

  // ─── SCROLL TO TOP ──────────────────────────────────────────────────

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ─── COPY ID ──────────────────────────────────────────────────────

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

  // ─── RESET FILTERS ─────────────────────────────────────────────────

  const resetFilters = useCallback(() => {
    setFilterOption("all");
    setSortOption("default");
    setSearchQuery("");
    setShowFilters(false);
  }, []);

  const totalWords = vocab.length;
  const wavCount = vocab.filter(e => e.hasWAV).length;
  const isFiltered = filterOption !== "all" || sortOption !== "default" || searchQuery !== "";

  // ─── LOADING STATE ──────────────────────────────────────────────────

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary dark:text-gray-400">{t("page_loading")}</p>
        </div>
      </div>
    );
  }

  // ─── MAIN RENDER ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-transparent text-text-light dark:text-text-dark pb-24">
      <div ref={topRef} className="container-main py-6">
        
        {/* Nuri-listening */}
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
              <p className="text-sm text-text-muted dark:text-gray-500 flex items-center gap-2 flex-wrap">
                <span>{t("page__wordstats_total_", { total: vocab.length })}</span>
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                <span>📝 {t("page__wordstats_bylanguage_hy_", { count: wordStats?.byType.vocab || 0 })}</span>
                <span>💬 {t("page__wordstats_bylanguage_hy_", { count: wordStats?.byType.phrase || 0 })}</span>
                <span>🎭 {t("page__wordstats_bylanguage_hy_", { count: wordStats?.byType.dialogue || 0 })}</span>
                {isWAVAvailable && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                    <span className="text-emerald-500">{t("page__audiostats_withwav_0_wav", { wav: wavCount })}</span>
                    {wavCredits !== null && (
                      <span className="text-yellow-500">{t("page_credit_count", { credits: wavCredits })}</span>
                    )}
                  </>
                )}
              </p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {/* View Mode */}
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

              {/* Voice Selector */}
              {isWAVAvailable && wavClient && (
                <div className="relative">
                  <button
                    onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                    className="px-3 py-2 rounded-xl text-xs font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all flex items-center gap-1"
                    title={t("page_select_voice")}
                  >
                    <Music size={14} />
                    {selectedVoice}
                    <ChevronDown size={12} />
                  </button>
                  
                  <AnimatePresence>
                    {showVoiceSelector && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-full mt-1 right-0 z-50 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl p-2 min-w-[140px] shadow-glass backdrop-blur-xl"
                      >
                        {wavClient.getAvailableVoices().map((voice) => (
                          <button
                            key={voice}
                            onClick={() => changeVoice(voice)}
                            className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left ${voice === selectedVoice ? "bg-purple-500/30 text-purple-300" : "hover:bg-white/5 text-text-muted"}`}
                          >
                            {voice} {voice === selectedVoice && "✓"}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              
              {/* User Dictionary Button */}
              <Link
                href="/user-dictionary"
                className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 hover:bg-yellow-500/30 rounded-xl text-sm font-medium transition-all flex items-center gap-2 text-yellow-500 backdrop-blur-soft"
              >
                <Users size={16} />
                <span className="hidden sm:inline">{t("page_user_dictionary")}</span>
                <span className="sm:hidden">{t("page_user_dictionary_short")}</span>
              </Link>
              
              {/* Generate All WAV Button */}
              {isWAVAvailable && (
                <>
                  <button
                    onClick={isGeneratingWAV ? cancelWAVGeneration : generateAllWAV}
                    disabled={isGeneratingWAV}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${isGeneratingWAV ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"}`}
                    title={t("page_generate_all")}
                  >
                    {isGeneratingWAV ? (
                      <>
                        <X size={14} />
                        {t("page_cancel")} {wavProgress.current}/{wavProgress.total}
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        {t("page_generate_all")}
                      </>
                    )}
                  </button>
                  <button
                    onClick={clearWAVCache}
                    className="px-3 py-2 rounded-xl text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-1"
                    title={t("page_clear_cache")}
                  >
                    <X size={14} />
                    {t("page_clear_cache")}
                  </button>
                </>
              )}
              <button
                onClick={testWAV}
                disabled={isTestingWAV}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${isTestingWAV ? "bg-yellow-500/20 text-yellow-400 cursor-wait" : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"}`}
                title={t("page_test_wav")}
              >
                {isTestingWAV ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Zap size={14} />
                )}
                {t("page_test_wav")}
              </button>

              {/* Stats Button */}
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
          
          {/* WAV Status */}
          {wavStatus && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${wavStatus.includes("✅") ? "text-emerald-500" : wavStatus.includes("❌") ? "text-red-500" : wavStatus.includes("⏳") ? "text-yellow-500" : wavStatus.includes("⏹️") ? "text-orange-500" : "text-blue-500"}`}>
              {wavStatus.includes("✅") && <CheckCircle size={12} />}
              {wavStatus.includes("❌") && <AlertCircle size={12} />}
              {wavStatus.includes("⏳") && <Loader2 size={12} className="animate-spin" />}
              {wavStatus.includes("⏹️") && <X size={12} />}
              {wavStatus}
            </p>
          )}
          
          {/* WAV Progress Bar */}
          {isGeneratingWAV && (
            <div className="mt-2 w-full h-1.5 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-soft overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${(wavProgress.current / wavProgress.total) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
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
                    <div className="text-2xl font-bold text-blue-400">{wordStats.withWAV}</div>
                    <div className="text-xs text-text-muted">{t("page_has_wav")}</div>
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
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500"
            />
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
            {/* Language Filter */}
            <div className="flex gap-1 bg-white/10 dark:bg-white/5 backdrop-blur-soft rounded-xl p-1 border border-gray-200 dark:border-gray-700">
              {LANGS.map(({ code, flag }) => (
                <button
                  key={code}
                  onClick={() => setFilterLang(code)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filterLang === code ? "bg-primary text-white" : "hover:bg-white/5 text-text-muted"}`}
                >
                  {flag}
                </button>
              ))}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${showFilters ? "bg-yellow-500/20 text-yellow-400" : "bg-white/10 dark:bg-white/5 text-text-muted hover:text-text"} ${isFiltered ? "border border-yellow-500/50" : ""}`}
            >
              <Filter size={14} />
              <span className="hidden sm:inline">{t("page_filters")}</span>
              {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
            </button>

            {/* Reset Filters */}
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

            {/* WAV filter shortcut */}
            <button
              onClick={() => {
                if (filterOption === "all") {
                  setFilterOption("has-wav");
                } else if (filterOption === "has-wav") {
                  setFilterOption("all");
                } else {
                  setFilterOption("has-wav");
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${filterOption === "has-wav" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-white/10 dark:bg-white/5 text-text-muted hover:text-text"}`}
            >
              <BadgeCheck size={14} />
              <span className="hidden sm:inline">{t("page_has_wav")}</span>
            </button>
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
                  {/* Type Filter */}
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
                      <option value="has-wav">🔊 {t("page_has_wav")}</option>
                    </select>
                  </div>

                  {/* Sort */}
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

                  {/* Stats */}
                  <div>
                    <label className="text-xs text-text-muted mb-1 block">📊 {t("page_stats")}</label>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <span>📚 {totalWords}</span>
                      <span>|</span>
                      <span>🎵 {wordStats?.withAudio || 0}</span>
                      <span>|</span>
                      <span>🔊 {wordStats?.withWAV || 0}</span>
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
            <span className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
            <span className="text-text-muted dark:text-gray-500">🇦🇲 {vocab.filter(e => e.hy).length}</span>
            <span className="text-text-muted dark:text-gray-500">🇬🇧 {vocab.filter(e => e.en).length}</span>
            <span className="text-text-muted dark:text-gray-500">🇷🇺 {vocab.filter(e => e.ru).length}</span>
            {recentlyViewed.length > 0 && (
              <>
                <span className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                <span className="text-text-muted dark:text-gray-500 text-xs">
                  🕐 {t("page_recently_viewed")}: {recentlyViewed.length}
                </span>
              </>
            )}
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
              const audioId = getAudioId(item);
              const isExpanded = expandedItems.has(item.id);
              const hasAudio = item.audio && (item.audio.hy || item.audio.en || item.audio.ru);
              const hasWAV = item.hasWAV;
              const isGeneratingThis = generatingSingleWord === item.id;
              const showWavButton = isWAVAvailable && !hasWAV && !isGeneratingThis;
              const isFavorite = favorites.has(item.id);
              const isCompact = viewMode === "compact";

              // Translate source label
              const getSourceLabel = (code: LangCode): string => {
                if (code === "hy") {
                  return hasWAV ? t("page_wav") : t("page_wav_api");
                } else if (code === "en") {
                  return t("page_tts");
                } else if (code === "ru") {
                  return t("page_tts");
                }
                return "";
              };

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.015, 0.3) }}
                  className={`bg-white/10 dark:bg-white/5 backdrop-blur-soft border ${isFavorite ? "border-yellow-500/50" : "border-gray-200 dark:border-gray-700"} p-${isCompact ? "2" : "4"} rounded-xl transition-all hover:shadow-glass ${isCompact ? "hover:bg-white/15" : ""}`}
                >
                  {/* ─── HEADER ROW ─── */}
                  <div className={`flex items-center justify-between ${isCompact ? "mb-1" : "mb-3"}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${typeColors[item.type] || "bg-white/10 text-gray-300 border-gray-500/20"}`}>
                        {item.type?.toUpperCase() || t("page_vocab")}
                      </span>
                      <button
                        onClick={() => copyId(item.id)}
                        className="text-[10px] text-text-muted dark:text-gray-500 font-mono hover:text-yellow-500 transition flex items-center gap-0.5"
                      >
                        #{audioId}
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
                      {hasWAV && (
                        <span className="text-[8px] text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded-full">
                          {t("page_wav")} ✓
                        </span>
                      )}
                      {isGeneratingThis && (
                        <span className="text-[8px] text-yellow-400 bg-yellow-500/20 px-1.5 py-0.5 rounded-full animate-pulse">
                          {t("page_generating")}...
                        </span>
                      )}
                      {isFavorite && (
                        <span className="text-[8px] text-yellow-400 bg-yellow-500/20 px-1.5 py-0.5 rounded-full">
                          ⭐
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className={`p-1 rounded-lg transition-colors ${isFavorite ? "text-yellow-400" : "text-text-muted hover:text-yellow-400"}`}
                        title={isFavorite ? t("page_remove_favorite") : t("page_add_favorite")}
                      >
                        <Star size={isCompact ? 12 : 14} fill={isFavorite ? "currentColor" : "none"} />
                      </button>
                      
                      {showWavButton && (
                        <button
                          onClick={() => generateSingleWAV(item)}
                          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          title={`${t("page_generate_wav_with")} ${selectedVoice}`}
                        >
                          <Download size={isCompact ? 12 : 14} />
                          {!isCompact && <span className="text-[8px] font-bold">WAV</span>}
                        </button>
                      )}
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="p-1 rounded-lg hover:bg-white/5 transition-colors text-text-muted"
                      >
                        {isExpanded ? <ChevronUp size={isCompact ? 14 : 16} /> : <ChevronDown size={isCompact ? 14 : 16} />}
                      </button>
                    </div>
                  </div>

                  {/* ─── THREE LANGUAGES ─── */}
                  <div className={isCompact ? "space-y-1" : "space-y-2.5"}>
                    {LANGS.map(({ code, label, flag, color, bg, textColor }) => {
                      const playing = isWordPlaying(item.id, code);
                      const loading = activePlay?.wordId === item.id && activePlay.lang === code && isLoading;
                      const text = item[code] || "—";
                      const isCurrentFilter = filterLang === code;
                      
                      const sourceLabel = getSourceLabel(code);

                      return (
                        <div
                          key={code}
                          className={`flex items-center justify-between gap-3 p-${isCompact ? "1" : "2"} rounded-xl transition-all ${isCurrentFilter ? bg : "hover:bg-white/5"}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className={`text-[10px] font-bold mb-0.5 ${color}`}>
                              {flag} {label}
                              {isCurrentFilter && (
                                <span className="ml-1.5 text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                                  {t("page_active")}
                                </span>
                              )}
                              {code === "hy" && hasWAV && (
                                <span className="ml-1.5 text-[8px] text-blue-400">🔊 {t("page_wav")}</span>
                              )}
                              {code === "hy" && !hasWAV && isWAVAvailable && (
                                <span className="ml-1.5 text-[8px] text-purple-400">✨ {t("page_wav_api")}</span>
                              )}
                              {code === "en" && (
                                <span className="ml-1.5 text-[8px] text-blue-400">🔊 {t("page_tts")}</span>
                              )}
                              {code === "ru" && (
                                <span className="ml-1.5 text-[8px] text-green-400">🔊 {t("page_tts")}</span>
                              )}
                              <span className="ml-1.5 text-[8px] text-gray-400">
                                [{sourceLabel}]
                              </span>
                            </div>
                            <div className={`${isCompact ? "text-base" : "text-lg"} font-semibold truncate ${text === "—" ? "text-text-muted dark:text-gray-500" : "text-text dark:text-white"}`}>
                              {text}
                            </div>
                          </div>

                          {/* Play Button */}
                          <button
                            onClick={() => handleSpeak(item, code)}
                            disabled={text === "—"}
                            className={`relative flex-shrink-0 w-${isCompact ? "9" : "11"} h-${isCompact ? "9" : "11"} rounded-xl transition-all flex items-center justify-center ${playing ? "bg-emerald-500 text-white" : loading ? "bg-yellow-500/30 text-yellow-400 animate-pulse" : text === "—" ? "bg-white/5 text-text-muted/30 cursor-not-allowed" : "bg-white/10 dark:bg-white/5 backdrop-blur-soft hover:bg-white/20 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700"}`}
                            title={code === "hy" ? t("page_lang_hy_wav") : code === "en" ? t("page_lang_en_tts") : t("page_lang_ru_tts")}
                          >
                            {loading ? (
                              <Loader2 size={isCompact ? 14 : 18} className="animate-spin" />
                            ) : playing ? (
                              <Volume2 size={isCompact ? 14 : 18} />
                            ) : (
                              <Play size={isCompact ? 12 : 16} />
                            )}
                            {code === "hy" && hasWAV && !playing && !isCompact && (
                              <span className="absolute -top-1 -right-1 text-[8px] bg-blue-500 text-white rounded-full px-1 font-bold">
                                {t("page_wav")}
                              </span>
                            )}
                            {code === "hy" && !hasWAV && !playing && !isCompact && isWAVAvailable && (
                              <span className="absolute -top-1 -right-1 text-[8px] bg-purple-500 text-white rounded-full px-1 font-bold">
                                {t("page_api")}
                              </span>
                            )}
                            {code === "en" && !playing && !isCompact && (
                              <span className="absolute -top-1 -right-1 text-[8px] bg-blue-500 text-white rounded-full px-1 font-bold">
                                {t("page_tts")}
                              </span>
                            )}
                            {code === "ru" && !playing && !isCompact && (
                              <span className="absolute -top-1 -right-1 text-[8px] bg-green-500 text-white rounded-full px-1 font-bold">
                                {t("page_tts")}
                              </span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* ─── EXPANDED CONTENT ─── */}
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
                          {/* Tags */}
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
                          
                          {/* Audio info */}
                          <div className="text-xs text-text-muted dark:text-gray-500 flex items-center gap-2 flex-wrap">
                            {item.audio?.hy && (
                              <span className="flex items-center gap-1">
                                <CheckCircle size={12} className="text-emerald-500" />
                                {t("page_mp3")}
                              </span>
                            )}
                            {item.wavAudio?.hy && (
                              <span className="flex items-center gap-1">
                                <CheckCircle size={12} className="text-blue-500" />
                                {t("page_wav")}
                              </span>
                            )}
                            {!item.wavAudio?.hy && isWAVAvailable && (
                              <span className="flex items-center gap-1 text-purple-400">
                                <AlertCircle size={12} />
                                {t("page_wav_api_available")}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-text-muted">
                              <Clock size={12} />
                              {wavManifest?.lastUpdated ? formatDate(wavManifest.lastUpdated) : t("page_na")}
                            </span>
                            {wavCredits !== null && (
                              <span className="flex items-center gap-1 text-yellow-500">
                                {t("page_credit_count", { credits: wavCredits })}
                              </span>
                            )}
                          </div>

                          {/* Recording */}
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

        {/* ─── FOOTER COUNT ─── */}
        {searchQuery && filteredVocab.length > 0 && (
          <div className="text-center text-text-muted dark:text-gray-500 text-sm mt-4">
            {t("page_showing_count", { count: filteredVocab.length, total: totalWords })}
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
            className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border px-6 py-3 max-w-sm rounded-xl text-center shadow-xl ${toastType === "success" ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : toastType === "error" ? "border-red-500/30 text-red-600 dark:text-red-400" : "border-blue-500/30 text-blue-600 dark:text-blue-400"}`}
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