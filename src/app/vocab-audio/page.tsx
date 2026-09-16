// src/app/vocab-audio/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Play,
  Pause,
  Trash2,
  Check,
  X,
  Download,
  Upload,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Headphones,
  Music,
  Radio,
  Speaker,
  User,
  Users,
  BookOpen,
  Star,
  Sparkles,
  ArrowUp,
  Filter,
  ChevronDown,
  ChevronUp,
  Grid3x3,
  List,
  Copy,
  Share2,
  Heart,
  Wifi,
  WifiOff,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Nuri, { NuriSpeech, type NuriMood } from "@/components/Nuri";
import ThemeToggle from "@/components/ThemeToggle";
import { useNuri } from "@/hooks/useNuri";
import { CONTENT_LESSONS, type VocabItem, getAudioId } from "@/lib/content/database";
import { useAudio } from "@/lib/hooks/useAudio";
import { useAudioRecorder } from "@/lib/hooks/useAudioRecorder";
import { getWavClient } from "@/lib/audio/WavClient";
import { useI18n } from "@/hooks/useI18n";

// ✅ OFFLINE AUDIO IMPORTS
import { offlineAudioManager } from '@/lib/offline/OfflineAudioManager';
import { offlineLessonEngine } from '@/lib/offline/OfflineLessonEngine';

// ─── TYPES ────────────────────────────────────────────────────────────

interface VocabItemWithStatus extends VocabItem {
  hasRecording: boolean;
  isPlaying: boolean;
  isRecording: boolean;
  isGenerating: boolean;
  hasWAV: boolean;
  wavGenerating?: boolean;
  wavError?: string;
}

interface AudioStats {
  total: number;
  withWAV: number;
  withRecording: number;
  withAudio: number;
  byLesson: Record<string, number>;
}

type ViewMode = "list" | "grid" | "compact";
type SortOption = "default" | "alphabetical" | "reverse-alpha" | "newest" | "oldest";
type FilterOption = "all" | "has-recording" | "no-recording" | "has-wav" | "no-wav";

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function VocabAudioPage() {
  const { speak, isSpeaking, stop, isLoading } = useAudio();
  const { setPage } = useNuri();
  const { t } = useI18n();
  
  // ─── LOCAL TOAST ──────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
  
  const showMessage = useCallback((text: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage(text);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  }, []);
  
  useEffect(() => setPage("dictionary"), [setPage]);
  
  const {
    isRecording,
    startRecording,
    stopRecording,
    saveRecording,
    getRecording,
    playRecording,
    deleteRecording,
  } = useAudioRecorder();

  // ─── OFFLINE STATE ──────────────────────────────────────────────────
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineAudioCount, setOfflineAudioCount] = useState(0);
  const [offlineStats, setOfflineStats] = useState<{
    total: number;
    lesson: number;
    dictionary: number;
    user: number;
  } | null>(null);

  // ─── INIT OFFLINE ──────────────────────────────────────────────────
  useEffect(() => {
    const initOffline = async () => {
      try {
        await offlineAudioManager.init();
        await offlineLessonEngine.init();
        const stats = offlineAudioManager.getStats();
        setIsOfflineMode(stats.totalEntries > 0);
        setOfflineAudioCount(stats.totalEntries);
        setOfflineStats({
          total: stats.totalEntries || 0,
          lesson: stats.lessonEntries || 0,
          dictionary: stats.dictionaryEntries || 0,
          user: stats.userEntries || 0,
        });
        console.log(`📱 Vocab audio offline: ${stats.totalEntries} entries`);
      } catch (e) {
        console.warn('⚠️ Offline init error:', e);
        setIsOfflineMode(false);
      }
    };
    initOffline();
  }, []);

  // ─── STATE ──────────────────────────────────────────────────────────

  const [vocab, setVocab] = useState<VocabItemWithStatus[]>([]);
  const [filteredVocab, setFilteredVocab] = useState<VocabItemWithStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [nuriMood, setNuriMood] = useState<NuriMood>("idle");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [audioStats, setAudioStats] = useState<AudioStats | null>(null);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [isGeneratingWAV, setIsGeneratingWAV] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState({ current: 0, total: 0 });
  const [wavClient, setWavClient] = useState<any>(null);
  const [isWAVAvailable, setIsWAVAvailable] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("Avet");
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const topRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── LOAD VOCAB ────────────────────────────────────────────────────

  useEffect(() => {
    const all: VocabItem[] = [];
    for (const lesson of CONTENT_LESSONS) {
      if (lesson.vocabulary) all.push(...lesson.vocabulary);
    }
    const unique = Array.from(new Map(all.map((v) => [v.id, v])).values());
    
    const withStatus: VocabItemWithStatus[] = unique.map(item => ({
      ...item,
      hasRecording: !!getRecording(item.id),
      isPlaying: false,
      isRecording: false,
      isGenerating: false,
      hasWAV: false,
    }));
    
    setVocab(withStatus);
    calculateStats(withStatus);
  }, [getRecording]);

  // ─── LOAD FAVORITES ───────────────────────────────────────────────

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nurlingo_vocab_favorites");
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch {
      // Ignore
    }
  }, []);

  // ─── SAVE FAVORITES ──────────────────────────────────────────────

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("nurlingo_vocab_favorites", JSON.stringify([...next]));
      return next;
    });
  }, []);

  // ─── INIT WAV ──────────────────────────────────────────────────────

  useEffect(() => {
    const initWAV = async () => {
      try {
        const client = getWavClient();
        if (client) {
          setWavClient(client);
          setIsWAVAvailable(true);
          const voices = client.getAvailableVoices();
          if (voices.length > 0) {
            const saved = localStorage.getItem("nurlingo_selected_voice");
            setSelectedVoice(saved && voices.includes(saved) ? saved : voices[0]);
          }
        }
      } catch {
        setIsWAVAvailable(false);
      }
    };
    initWAV();
  }, []);

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
        setIsBatchMode(false);
        setSelectedWords(new Set());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // ─── CALCULATE STATS ──────────────────────────────────────────────

  const calculateStats = useCallback((data: VocabItemWithStatus[]) => {
    const stats: AudioStats = {
      total: data.length,
      withWAV: data.filter(d => d.hasWAV).length,
      withRecording: data.filter(d => d.hasRecording).length,
      withAudio: data.filter(d => d.hasWAV || d.hasRecording).length,
      byLesson: {},
    };
    
    data.forEach(d => {
      const lessonId = d.id.split('-')[0] || 'unknown';
      stats.byLesson[lessonId] = (stats.byLesson[lessonId] || 0) + 1;
    });
    
    setAudioStats(stats);
  }, []);

  // ─── FILTER & SORT ─────────────────────────────────────────────────

  useEffect(() => {
    let items = [...vocab];

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (item) =>
          item.hy.toLowerCase().includes(q) ||
          item.en.toLowerCase().includes(q) ||
          item.ru.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
      );
    }

    switch (filterOption) {
      case "has-recording":
        items = items.filter(d => d.hasRecording);
        break;
      case "no-recording":
        items = items.filter(d => !d.hasRecording);
        break;
      case "has-wav":
        items = items.filter(d => d.hasWAV);
        break;
      case "no-wav":
        items = items.filter(d => !d.hasWAV);
        break;
      default:
        break;
    }

    switch (sortOption) {
      case "alphabetical":
        items.sort((a, b) => a.hy.localeCompare(b.hy));
        break;
      case "reverse-alpha":
        items.sort((a, b) => b.hy.localeCompare(a.hy));
        break;
      case "newest":
        items.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case "oldest":
        items.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        break;
    }

    setFilteredVocab(items);
    setNuriMood(items.length === 0 ? "sad" : "happy");
  }, [vocab, searchQuery, filterOption, sortOption]);

  // ─── HANDLE SPEAK ──────────────────────────────────────────────────

  const handleSpeak = useCallback(async (text: string, item: VocabItemWithStatus) => {
    if (isSpeaking) {
      stop();
      setPlaying(null);
      return;
    }
    
    const audioId = getAudioId(item);
    setPlaying(audioId);

    // ✅ TRY OFFLINE FIRST
    if (isOfflineMode) {
      try {
        const variations = [
          item.id,
          item.hy?.toLowerCase().replace(/\s+/g, '_'),
          item.en?.toLowerCase().replace(/\s+/g, '_'),
          item.ru?.toLowerCase().replace(/\s+/g, '_'),
          text.toLowerCase().replace(/\s+/g, '_'),
        ];

        for (const id of variations) {
          if (!id) continue;

          // Try offlineAudioManager
          if (offlineAudioManager.hasAudioKey(id, 'hy')) {
            await offlineAudioManager.play(id, 'hy');
            setPlaying(null);
            return;
          }

          // Try offlineLessonEngine
          const path = offlineLessonEngine.getAudioPath(id, 'hy', 'female');
          if (path) {
            const audio = new Audio(path);
            await audio.play();
            audio.onended = () => setPlaying(null);
            return;
          }
        }
      } catch (e) {
        console.warn('Offline audio failed:', e);
      }
    }

    // ✅ Fallback to online TTS
    speak(text, "hy", {
      id: audioId,
      onEnd: () => setPlaying(null),
      onError: () => {
        setPlaying(null);
        showMessage(t("page__audio_playback_failed"), "error");
      },
    });
  }, [isSpeaking, stop, speak, showMessage, isOfflineMode, t]);

  // ─── HANDLE RECORD ─────────────────────────────────────────────────

  const handleRecord = useCallback(async (id: string) => {
    if (isRecording && recordingId === id) {
      stopRecording();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setRecordingDuration(0);
      setTimeout(() => {
        saveRecording(id);
        setRecordingId(null);
        setVocab(prev => prev.map(item => 
          item.id === id ? { ...item, hasRecording: true } : item
        ));
        calculateStats(vocab.map(item => 
          item.id === id ? { ...item, hasRecording: true } : item
        ));
        showMessage(t("page_recording_saved"), "success");
      }, 500);
      return;
    }
    
    setRecordingId(id);
    setRecordingDuration(0);
    await startRecording();
    
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  }, [isRecording, recordingId, stopRecording, saveRecording, startRecording, vocab, calculateStats, showMessage, t]);

  // ─── HANDLE PLAY RECORDING ────────────────────────────────────────

  const handlePlayRecording = useCallback((id: string) => {
    playRecording(id);
  }, [playRecording]);

  // ─── HANDLE DELETE RECORDING ─────────────────────────────────────

  const handleDeleteRecording = useCallback((id: string) => {
    if (confirm(t("page_confirm_delete_recording"))) {
      deleteRecording(id);
      setVocab(prev => prev.map(item => 
        item.id === id ? { ...item, hasRecording: false } : item
      ));
      calculateStats(vocab.map(item => 
        item.id === id ? { ...item, hasRecording: false } : item
      ));
      showMessage(t("page_recording_deleted"), "info");
    }
  }, [deleteRecording, vocab, calculateStats, showMessage, t]);

  // ─── GENERATE WAV ──────────────────────────────────────────────────

  const generateWAV = useCallback(async (item: VocabItemWithStatus) => {
    if (!wavClient || !isWAVAvailable) {
      showMessage(t("page__wav_client_not_available"), "error");
      return;
    }

    setVocab(prev => prev.map(w => 
      w.id === item.id ? { ...w, isGenerating: true } : w
    ));

    try {
      const result = await wavClient.generateAudio(item.hy, { 
        voice: selectedVoice, 
        format: "mp3" 
      });
      
      const audioBlob = await wavClient.downloadAudio(result.path);
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });

      const audioKey = `wav_audio_${item.id}`;
      localStorage.setItem(audioKey, base64);
      localStorage.setItem(audioKey + '_time', Date.now().toString());

      setVocab(prev => prev.map(w => 
        w.id === item.id ? { ...w, hasWAV: true, isGenerating: false } : w
      ));
      calculateStats(vocab.map(w => 
        w.id === item.id ? { ...w, hasWAV: true, isGenerating: false } : w
      ));
      showMessage(t("page_wav_generated", { word: item.hy }), "success");
    } catch (error) {
      setVocab(prev => prev.map(w => 
        w.id === item.id ? { ...w, isGenerating: false } : w
      ));
      showMessage(t("page__wav_generation_failed"), "error");
    }
  }, [wavClient, isWAVAvailable, selectedVoice, vocab, calculateStats, showMessage, t]);

  // ─── GENERATE ALL WAV ─────────────────────────────────────────────

  const generateAllWAV = useCallback(async () => {
    if (!wavClient || !isWAVAvailable) {
      showMessage(t("page__wav_client_not_available"), "error");
      return;
    }

    const toGenerate = filteredVocab.filter(item => !item.hasWAV && !item.isGenerating);
    if (toGenerate.length === 0) {
      showMessage(t("page__all_words_already_have_wav"), "info");
      return;
    }

    setIsGeneratingWAV(true);
    setGeneratingProgress({ current: 0, total: toGenerate.length });

    let success = 0;
    for (let i = 0; i < toGenerate.length; i++) {
      const item = toGenerate[i];
      setGeneratingProgress({ current: i + 1, total: toGenerate.length });
      
      try {
        const result = await wavClient.generateAudio(item.hy, { 
          voice: selectedVoice, 
          format: "mp3" 
        });
        
        const audioBlob = await wavClient.downloadAudio(result.path);
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(audioBlob);
        });

        localStorage.setItem(`wav_audio_${item.id}`, base64);
        localStorage.setItem(`wav_audio_${item.id}_time`, Date.now().toString());

        setVocab(prev => prev.map(w => 
          w.id === item.id ? { ...w, hasWAV: true } : w
        ));
        success++;
      } catch (error) {
        console.error(`Failed to generate WAV for ${item.id}:`, error);
      }
    }

    setIsGeneratingWAV(false);
    calculateStats(vocab);
    showMessage(t("page_wav_generated_all", { success, total: toGenerate.length }), "success");
  }, [wavClient, isWAVAvailable, filteredVocab, selectedVoice, vocab, calculateStats, showMessage, t]);

  // ─── TOGGLE SELECT ─────────────────────────────────────────────────

  const toggleSelect = useCallback((id: string) => {
    setSelectedWords(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedWords.size === filteredVocab.length) {
      setSelectedWords(new Set());
    } else {
      setSelectedWords(new Set(filteredVocab.map(w => w.id)));
    }
  }, [selectedWords, filteredVocab]);

  // ─── BATCH DELETE RECORDINGS ──────────────────────────────────────

  const batchDeleteRecordings = useCallback(() => {
    if (selectedWords.size === 0) return;
    if (confirm(t("page_confirm_batch_delete", { count: selectedWords.size }))) {
      selectedWords.forEach(id => {
        deleteRecording(id);
        setVocab(prev => prev.map(item => 
          item.id === id ? { ...item, hasRecording: false } : item
        ));
      });
      setSelectedWords(new Set());
      setIsBatchMode(false);
      calculateStats(vocab);
      showMessage(t("page_batch_deleted", { count: selectedWords.size }), "info");
    }
  }, [selectedWords, deleteRecording, vocab, calculateStats, showMessage, t]);

  // ─── TOGGLE EXPAND ─────────────────────────────────────────────────

  const toggleExpand = useCallback((id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ─── SCROLL TO TOP ─────────────────────────────────────────────────

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ─── RESET FILTERS ─────────────────────────────────────────────────

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setFilterOption("all");
    setSortOption("default");
    setShowFilters(false);
  }, []);

  const isFiltered = searchQuery !== "" || filterOption !== "all" || sortOption !== "default";

  // ─── RENDER ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent text-gray-900 dark:text-white pb-24">
      <div ref={topRef} className="container-main py-6">
        
        {/* Nuri */}
        <div className="flex items-center gap-4 mb-4">
          <Nuri mood={nuriMood} size={72} glow={nuriMood === "happy"} />
          <div className="flex-1">
            <NuriSpeech
              text={
                nuriMood === "happy"
                  ? t("page_nuri_vocab_ready", { count: filteredVocab.length })
                  : nuriMood === "sad"
                  ? t("page_nuri_no_results")
                  : t("page_nuri_record_prompt")
              }
              mood={nuriMood}
            />
          </div>
          <ThemeToggle />
        </div>

        {/* ─── HEADER ─── */}
        <header className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Headphones size={24} className="text-red-500" />
                <span className="text-gradient">{t("page__audio")}</span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                <span>{t("page__wordstats_total_", { total: vocab.length })}</span>
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                <span className="text-emerald-400">{t("page__audiostats_withaudio_0_", { audio: audioStats?.withAudio || 0 })}</span>
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                <span className="text-blue-400">{t("page__audiostats_withwav_0_wav", { wav: audioStats?.withWAV || 0 })}</span>
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                <span className="text-purple-400">{t("page__audiostats_withrecording_0_", { recording: audioStats?.withRecording || 0 })}</span>
                {isOfflineMode && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                    <span className="text-green-500">{t("page__offline_offlineaudiocount_", { count: offlineAudioCount })}</span>
                  </>
                )}
              </p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {/* Offline Toggle */}
              <button
                onClick={() => setIsOfflineMode(!isOfflineMode)}
                className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1 transition-all ${
                  isOfflineMode
                    ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                    : 'bg-transparent dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-300'
                }`}
                title={isOfflineMode ? t("page_offline_on") : t("page_offline_off")}
              >
                {isOfflineMode ? <WifiOff size={14} /> : <Wifi size={14} />}
                {isOfflineMode ? t("page_offline") : t("page_online")}
              </button>

              {/* View Mode */}
              <div className="flex gap-1 bg-transparent dark:bg-white/10 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === "list" ? "bg-blue-500 text-white" : "hover:bg-white/5 text-text-muted"
                  }`}
                  title={t("page_list")}
                >
                  <List size={14} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === "grid" ? "bg-blue-500 text-white" : "hover:bg-white/5 text-text-muted"
                  }`}
                  title={t("page_grid")}
                >
                  <Grid3x3 size={14} />
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === "compact" ? "bg-blue-500 text-white" : "hover:bg-white/5 text-text-muted"
                  }`}
                  title={t("page_compact")}
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* WAV Voice Selector */}
              {isWAVAvailable && wavClient && (
                <div className="relative">
                  <button
                    onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                    className="px-3 py-2 rounded-xl text-xs font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all flex items-center gap-1"
                  >
                    <Music size={14} />
                    {selectedVoice}
                    <ChevronDown size={12} />
                  </button>
                  <AnimatePresence>
                    {showVoiceSelector && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-1 right-0 z-50 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl p-2 min-w-[140px] shadow-glass backdrop-blur-xl"
                      >
                        {wavClient.getAvailableVoices().map((voice: string) => (
                          <button
                            key={voice}
                            onClick={() => {
                              setSelectedVoice(voice);
                              localStorage.setItem("nurlingo_selected_voice", voice);
                              setShowVoiceSelector(false);
                            }}
                            className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left ${
                              voice === selectedVoice
                                ? "bg-purple-500/30 text-purple-300"
                                : "hover:bg-white/5 text-text-muted"
                            }`}
                          >
                            {voice} {voice === selectedVoice && "✓"}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Generate WAV */}
              {isWAVAvailable && (
                <button
                  onClick={generateAllWAV}
                  disabled={isGeneratingWAV}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                    isGeneratingWAV
                      ? "bg-yellow-500/20 text-yellow-400 cursor-wait"
                      : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                  }`}
                >
                  {isGeneratingWAV ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      {generatingProgress.current}/{generatingProgress.total}
                    </>
                  ) : (
                    <>
                      <Radio size={14} />
                      {t("page_generate_wav")}
                    </>
                  )}
                </button>
              )}

              {/* Stats */}
              <button
                onClick={() => setShowStats(!showStats)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                  showStats
                    ? "bg-indigo-500 text-white"
                    : "bg-transparent dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-300"
                }`}
              >
                <Headphones size={14} />
                <span className="hidden sm:inline">{t("page_stats")}</span>
              </button>

              {/* Filter */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                  showFilters
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-transparent dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-300"
                }`}
              >
                <Filter size={14} />
                <span className="hidden sm:inline">{t("page_filters")}</span>
                {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
              </button>

              {/* Batch Mode */}
              <button
                onClick={() => setIsBatchMode(!isBatchMode)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                  isBatchMode
                    ? "bg-blue-500 text-white"
                    : "bg-transparent dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-300"
                }`}
              >
                <Check size={14} />
                {t("page_select")}
              </button>

              {isFiltered && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-1"
                >
                  <X size={14} />
                  <span className="hidden sm:inline">{t("page_clear")}</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ─── STATS PANEL ─── */}
        <AnimatePresence>
          {showStats && audioStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-soft border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{audioStats.total}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("page_total")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{audioStats.withAudio}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("page_with_audio")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{audioStats.withWAV}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("page_with_wav")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{audioStats.withRecording}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("page_with_recording")}</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                  📚 {Object.keys(audioStats.byLesson).length} {t("page_lessons")}
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
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-soft border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{t("page_filters")}</label>
                    <select
                      value={filterOption}
                      onChange={(e) => setFilterOption(e.target.value as FilterOption)}
                      className="w-full bg-white/5 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      <option value="all">{t("page_all")}</option>
                      <option value="has-recording">{t("page_with_recording")}</option>
                      <option value="no-recording">{t("page_without_recording")}</option>
                      <option value="has-wav">{t("page_with_wav")}</option>
                      <option value="no-wav">{t("page_without_wav")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{t("page_sort")}</label>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="w-full bg-white/5 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      <option value="default">{t("page_default")}</option>
                      <option value="alphabetical">{t("page_alphabetical")}</option>
                      <option value="reverse-alpha">{t("page_reverse_alpha")}</option>
                      <option value="newest">{t("page_newest")}</option>
                      <option value="oldest">{t("page_oldest")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{t("page_search")}</label>
                    <div className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("page_search_words")}
                        className="w-full bg-white/5 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── SEARCH BAR (mobile) ─── */}
        {!showFilters && (
          <div className="relative mb-4 sm:hidden">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("page_search_words_ctrl_k")}
              className="w-full bg-transparent dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-transparent text-gray-500 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* ─── BATCH MODE BAR ─── */}
        {isBatchMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 dark:bg-white/5 backdrop-blur-soft border border-blue-500/30 rounded-xl p-3 mb-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition"
              >
                {selectedWords.size === filteredVocab.length ? t("page_deselect_all") : t("page_select_all")}
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("page_selected")}: <span className="font-bold text-blue-400">{selectedWords.size}</span>
              </span>
            </div>
            <div className="flex gap-2">
              {selectedWords.size > 0 && (
                <button
                  onClick={batchDeleteRecordings}
                  className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30 transition flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  {t("page_delete_recordings")}
                </button>
              )}
              <button
                onClick={() => {
                  setIsBatchMode(false);
                  setSelectedWords(new Set());
                }}
                className="px-3 py-1.5 bg-transparent text-gray-400 rounded-lg text-xs font-medium hover:bg-transparent/60 transition"
              >
                ✕ {t("page_close")}
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── STATS BAR ─── */}
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-soft border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-4 flex items-center justify-between text-sm flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-500 dark:text-gray-400">📚</span>
            <span className="text-gray-900 dark:text-white font-medium">{filteredVocab.length}</span>
            <span className="text-gray-500 dark:text-gray-400">{t("page_shown")}</span>
            <span className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
            <span className="text-gray-500 dark:text-gray-400">🎤 {filteredVocab.filter(d => d.hasRecording).length}</span>
            <span className="text-gray-500 dark:text-gray-400">🔊 {filteredVocab.filter(d => d.hasWAV).length}</span>
            {isOfflineMode && (
              <>
                <span className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                <span className="text-green-500 flex items-center gap-1">
                  <WifiOff size={12} />
                  {offlineAudioCount} {t("page_offline")}
                </span>
              </>
            )}
          </div>
        </div>

        {/* ─── VOCAB LIST ─── */}
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-3" : viewMode === "compact" ? "space-y-1" : "space-y-3"}>
          {filteredVocab.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 col-span-full"
            >
              <div className="text-5xl mb-4">{searchQuery ? "🔍" : "📖"}</div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {searchQuery ? t("page_no_results_query", { query: searchQuery }) : t("page_no_vocab")}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {searchQuery ? t("page_try_different_search") : t("page_no_vocab_message")}
              </p>
              {isFiltered && (
                <button
                  onClick={resetFilters}
                  className="mt-4 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-bold transition"
                >
                  <Filter size={18} className="inline mr-1" />
                  {t("page_clear_filters")}
                </button>
              )}
            </motion.div>
          ) : (
            filteredVocab.map((item, index) => {
              const audioId = getAudioId(item);
              const isExpanded = expandedItems.has(item.id);
              const isFavorite = favorites.has(item.id);
              const isSelected = selectedWords.has(item.id);
              const isCompact = viewMode === "compact";
              const isRecordingThis = isRecording && recordingId === item.id;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.3) }}
                  className={`bg-white/10 dark:bg-white/5 backdrop-blur-soft border ${
                    isSelected ? "border-blue-500" : isFavorite ? "border-yellow-500/30" : "border-gray-200 dark:border-gray-700"
                  } p-${isCompact ? "2" : "4"} rounded-xl transition-all hover:shadow-glass ${isCompact ? "hover:bg-white/15" : ""}`}
                  onClick={() => isBatchMode && toggleSelect(item.id)}
                >
                  {/* ─── HEADER ─── */}
                  <div className={`flex items-center justify-between ${isCompact ? "mb-1" : "mb-2"}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20">
                        {item.id.split('-')[0] || 'VOCAB'}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                        #{audioId}
                      </span>
                      {item.hasRecording && (
                        <span className="text-[8px] text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded-full">
                          🎤
                        </span>
                      )}
                      {item.hasWAV && (
                        <span className="text-[8px] text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded-full">
                          🔊 WAV
                        </span>
                      )}
                      {isFavorite && (
                        <span className="text-[8px] text-yellow-400 bg-yellow-500/20 px-1.5 py-0.5 rounded-full">
                          ⭐
                        </span>
                      )}
                      {isRecordingThis && (
                        <span className="text-[8px] text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded-full animate-pulse">
                          🔴 {t("page_recording")} {recordingDuration}s
                        </span>
                      )}
                      {item.isGenerating && (
                        <span className="text-[8px] text-yellow-400 bg-yellow-500/20 px-1.5 py-0.5 rounded-full animate-pulse">
                          ⏳ {t("page_generating")}...
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className={`p-1 rounded-lg transition-colors ${
                          isFavorite ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"
                        }`}
                      >
                        <Star size={isCompact ? 12 : 14} fill={isFavorite ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(item.id);
                        }}
                        className="p-1 rounded-lg hover:bg-white/5 transition-colors text-gray-500"
                      >
                        {isExpanded ? <ChevronUp size={isCompact ? 14 : 16} /> : <ChevronDown size={isCompact ? 14 : 16} />}
                      </button>
                    </div>
                  </div>

                  {/* ─── CONTENT ─── */}
                  <div className={`${isCompact ? "text-sm" : "text-base"}`}>
                    <div className="font-bold text-gray-900 dark:text-white">{item.hy}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {item.en} / {item.ru}
                    </div>
                  </div>

                  {/* ─── ACTIONS ─── */}
                  <div className={`flex flex-wrap gap-2 ${isCompact ? "mt-1" : "mt-3"}`}>
                    {/* Speak */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(item.hy, item);
                      }}
                      disabled={playing === audioId}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        playing === audioId
                          ? "bg-emerald-600 text-white cursor-wait"
                          : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                      }`}
                    >
                      {playing === audioId ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          ...
                        </>
                      ) : (
                        <>
                          <Volume2 size={12} />
                          {t("page_listen")}
                        </>
                      )}
                    </button>

                    {/* Record */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRecord(item.id);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        isRecordingThis
                          ? "bg-red-500 text-white animate-pulse"
                          : "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                      }`}
                    >
                      {isRecordingThis ? (
                        <>
                          <MicOff size={12} />
                          {recordingDuration}s
                        </>
                      ) : (
                        <>
                          <Mic size={12} />
                          {t("page_record")}
                        </>
                      )}
                    </button>

                    {/* Play Recording */}
                    {item.hasRecording && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayRecording(item.id);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/20 text-green-400 hover:bg-green-500/30 transition flex items-center gap-1"
                      >
                        <Play size={12} />
                        {t("page_play")}
                      </button>
                    )}

                    {/* Delete Recording */}
                    {item.hasRecording && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRecording(item.id);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}

                    {/* Generate WAV */}
                    {isWAVAvailable && !item.hasWAV && !item.isGenerating && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generateWAV(item);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition flex items-center gap-1"
                      >
                        <Radio size={12} />
                        WAV
                      </button>
                    )}
                  </div>

                  {/* ─── EXPANDED ─── */}
                  <AnimatePresence>
                    {isExpanded && !isCompact && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                            <div>{t("page__item_id_", { id: item.id })}</div>
                            <div>🇦🇲 {item.hy}</div>
                            <div>🇬🇧 {item.en}</div>
                            <div>🇷🇺 {item.ru}</div>
                            <div className="flex items-center gap-2">
                              <span>🎵 {item.hasRecording ? t("page_has_recording") : t("page_no_recording")}</span>
                              <span>|</span>
                              <span>🔊 {item.hasWAV ? t("page_has_wav") : t("page_no_wav")}</span>
                            </div>
                            {item.hasRecording && (
                              <button
                                onClick={() => handlePlayRecording(item.id)}
                                className="text-blue-400 hover:text-blue-300 transition text-xs flex items-center gap-1"
                              >
                                <Play size={12} />
                                {t("page_play_recording")}
                              </button>
                            )}
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

        {/* ─── FOOTER ─── */}
        {searchQuery && filteredVocab.length > 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
            {t("page_showing_count", { count: filteredVocab.length, total: vocab.length })}
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
            className="fixed bottom-24 right-6 z-50 bg-white/10 dark:bg-white/5 backdrop-blur-soft border border-gray-200 dark:border-gray-700 p-3.5 rounded-2xl shadow-glass hover:shadow-glass-lg transition-all"
          >
            <ArrowUp size={20} className="text-gray-900 dark:text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}