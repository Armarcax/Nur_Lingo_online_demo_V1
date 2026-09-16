// src/app/user-dictionary/page.tsx
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  User,
  X,
  Plus,
  Play,
  Volume2,
  Loader2,
  ArrowUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Music,
  Radio,
  Speaker,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trash2,
  Edit,
  Save,
  Filter,
  SortAsc,
  SortDesc,
  Copy,
  Check,
  Globe,
  FileJson,
  Upload,
  Star,
  Heart,
  Wifi,
  WifiOff,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Nuri, { NuriSpeech, type NuriMood } from "@/components/Nuri";
import ThemeToggle from "@/components/ThemeToggle";
import { useNuri } from "@/hooks/useNuri";
import { useAudioManager } from "@/lib/hooks/useAudioManager";
import { getWavClient, WavClient } from "@/lib/audio/WavClient";
import type { LangCode } from "@/lib/i18n/multilingual";
import type { LanguageCode } from "@/lib/audio";
import { useI18n } from "@/hooks/useI18n";

import userDictData from "../../../data/dictionaries/user-dictionary-fixed.json";

interface UserDictionaryEntry {
  id: string;
  hy: string;
  en: string;
  ru: string;
  type: string;
  isUserAdded: boolean;
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
  audioGenerated?: boolean;
  translationSource?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  isFavorite?: boolean;
}

interface ActivePlay {
  wordId: string;
  lang: LangCode;
  source: "mp3" | "wav" | "tts";
}

interface WordStats {
  total: number;
  userAdded: number;
  hasAudio: number;
  hasWAV: number;
  byLanguage: { [key: string]: number };
}

const LANGS: { code: LangCode; label: string; flag: string; color: string; bg: string; textColor: string }[] = [
  { code: "hy", label: "ՀԱՅԵՐԵՆ", flag: "🇦🇲", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", textColor: "text-red-300" },
  { code: "en", label: "ENGLISH", flag: "🇬🇧", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", textColor: "text-blue-300" },
  { code: "ru", label: "РУССКИЙ", flag: "🇷🇺", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", textColor: "text-green-300" },
];

const STORAGE_KEYS = {
  USER_WORDS: "nurlingo_user_dictionary",
  USER_MANIFEST: "nurlingo_user_manifest",
  SELECTED_VOICE: "nurlingo_selected_voice",
  VIEW_PREFERENCES: "nurlingo_user_preferences",
  DICTIONARY_BACKUP: "nurlingo_dictionary_backup",
  USER_FAVORITES: "nurlingo_user_favorites",
};

type SortOption = "newest" | "oldest" | "alphabetical" | "reverse-alpha" | "favorites";
type FilterOption = "all" | "user" | "system" | "has-audio" | "no-audio" | "has-wav" | "favorites";

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("hy-AM", { 
      year: "numeric", 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return dateString;
  }
};

const generateId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `900${timestamp}${random}`.slice(0, 10);
};

export default function UserDictionaryPage() {
  const { play, stop, isPlaying, isLoading } = useAudioManager();
  const { setPage } = useNuri();
  const { t } = useI18n();
  
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
  
  const showMessage = useCallback((text: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage(text);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  }, []);
  
  useEffect(() => setPage("dictionary"), [setPage]);

  const [words, setWords] = useState<UserDictionaryEntry[]>([]);
  const [filteredWords, setFilteredWords] = useState<UserDictionaryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePlay, setActivePlay] = useState<ActivePlay | null>(null);
  const [nuriMood, setNuriMood] = useState<NuriMood>("idle");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isWAVAvailable, setIsWAVAvailable] = useState(false);
  const [wavClient, setWavClient] = useState<WavClient | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("Avet");
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ hy: string; en: string; ru: string; tags?: string[]; category?: string; difficulty?: "easy" | "medium" | "hard" } | null>(null);
  const [wavStatus, setWavStatus] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [wordStats, setWordStats] = useState<WordStats>({
    total: 0,
    userAdded: 0,
    hasAudio: 0,
    hasWAV: 0,
    byLanguage: { hy: 0, en: 0, ru: 0 }
  });
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const [showAddWord, setShowAddWord] = useState(false);
  const [newWordHy, setNewWordHy] = useState("");
  const [newWordEn, setNewWordEn] = useState("");
  const [newWordRu, setNewWordRu] = useState("");
  const [newWordTags, setNewWordTags] = useState("");
  const [newWordCategory, setNewWordCategory] = useState("");
  const [addWordStatus, setAddWordStatus] = useState<"idle" | "saving" | "success" | "error" | "duplicate">("idle");
  const [addWordMessage, setAddWordMessage] = useState("");

  const topRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_FAVORITES);
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
    } catch {
      // Ignore
    }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(STORAGE_KEYS.USER_FAVORITES, JSON.stringify([...next]));
      
      setWords(prevWords => 
        prevWords.map(w => 
          w.id === id ? { ...w, isFavorite: next.has(id) } : w
        )
      );
      
      return next;
    });
  }, []);

  const getNextId = useCallback(() => {
    const maxId = words.reduce((max, w) => {
      const num = parseInt(w.id);
      return num > max ? num : max;
    }, 900000);
    return String(maxId + 1);
  }, [words]);

  const loadWords = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_WORDS);
      let data: UserDictionaryEntry[] = [];

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            data = parsed.map(w => ({
              ...w,
              isFavorite: favorites.has(w.id)
            }));
            console.log(`✅ Loaded ${data.length} words from localStorage`);
          }
        } catch (e) {
          console.warn("Failed to parse localStorage, falling back to JSON");
        }
      }

      if (data.length === 0) {
        const rawData = userDictData as any[];
        data = rawData.map((w: any) => ({
          id: w.id || w.word_id || generateId(),
          hy: w.hy || "",
          en: w.en || "",
          ru: w.ru || "",
          type: w.type || "user",
          isUserAdded: w.isUserAdded !== undefined ? w.isUserAdded : true,
          audioGenerated: w.audioGenerated !== undefined ? w.audioGenerated : true,
          translationSource: w.translationSource || "auto",
          createdAt: w.createdAt || new Date().toISOString(),
          updatedAt: w.updatedAt || new Date().toISOString(),
          tags: w.tags || [],
          category: w.category || "general",
          difficulty: w.difficulty || "medium",
          isFavorite: favorites.has(w.id || w.word_id),
          audio: {
            hy: w.audio?.hy || `/audio/hy_user/${w.id || w.word_id}.mp3`,
            en: w.audio?.en || `/audio/en_user/${w.id || w.word_id}.mp3`,
            ru: w.audio?.ru || `/audio/ru_user/${w.id || w.word_id}.mp3`,
          }
        }));
        console.log(`✅ Loaded ${data.length} words from JSON`);
      }

      data.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      
      setWords(data);
      setFilteredWords(data);
      updateStats(data);
      
      localStorage.setItem(STORAGE_KEYS.USER_WORDS, JSON.stringify(data));
      
      const manifest: any = {
        schemaVersion: 2,
        lastUpdated: new Date().toISOString(),
        totalEntries: data.length,
        entries: {}
      };
      for (const word of data) {
        manifest.entries[word.id] = {
          hy: word.audio?.hy || `/audio/hy_user/${word.id}.mp3`,
          en: word.audio?.en || `/audio/en_user/${word.id}.mp3`,
          ru: word.audio?.ru || `/audio/ru_user/${word.id}.mp3`,
        };
      }
      localStorage.setItem(STORAGE_KEYS.USER_MANIFEST, JSON.stringify(manifest));
      
      setIsLoadingData(false);
    } catch (error) {
      console.error("Failed to load user dictionary:", error);
      setIsLoadingData(false);
      showMessage(t("page_load_failed"), "error");
    }
  }, [favorites, showMessage, t]);

  const updateStats = useCallback((data: UserDictionaryEntry[]) => {
    const stats: WordStats = {
      total: data.length,
      userAdded: data.filter(w => w.isUserAdded).length,
      hasAudio: data.filter(w => w.audio && (w.audio.hy || w.audio.en || w.audio.ru)).length,
      hasWAV: data.filter(w => w.hasWAV).length,
      byLanguage: {
        hy: data.filter(w => w.hy).length,
        en: data.filter(w => w.en).length,
        ru: data.filter(w => w.ru).length,
      }
    };
    setWordStats(stats);
  }, []);

  const saveWords = useCallback((newWords: UserDictionaryEntry[]) => {
    localStorage.setItem(STORAGE_KEYS.USER_WORDS, JSON.stringify(newWords));
    setWords(newWords);
    updateStats(newWords);
    
    const manifest = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_MANIFEST) || '{"entries":{}}');
    manifest.schemaVersion = 2;
    manifest.lastUpdated = new Date().toISOString();
    manifest.totalEntries = newWords.length;
    
    for (const word of newWords) {
      manifest.entries[word.id] = {
        hy: word.audio?.hy || `/audio/hy_user/${word.id}.mp3`,
        en: word.audio?.en || `/audio/en_user/${word.id}.mp3`,
        ru: word.audio?.ru || `/audio/ru_user/${word.id}.mp3`,
        tags: word.tags || [],
        category: word.category || "general",
        difficulty: word.difficulty || "medium",
      };
    }
    localStorage.setItem(STORAGE_KEYS.USER_MANIFEST, JSON.stringify(manifest));

    try {
      const backup = {
        timestamp: new Date().toISOString(),
        version: "2.0",
        words: newWords,
        stats: wordStats
      };
      localStorage.setItem(STORAGE_KEYS.DICTIONARY_BACKUP, JSON.stringify(backup));
    } catch (e) {
      console.warn("Failed to create backup:", e);
    }
  }, [updateStats, wordStats]);

  const filteredAndSortedWords = useMemo(() => {
    let result = [...words];

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (w) =>
          w.hy.toLowerCase().includes(q) ||
          w.en.toLowerCase().includes(q) ||
          w.ru.toLowerCase().includes(q) ||
          w.id.includes(q) ||
          (w.tags && w.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    switch (filterOption) {
      case "user":
        result = result.filter(w => w.isUserAdded);
        break;
      case "system":
        result = result.filter(w => !w.isUserAdded);
        break;
      case "has-audio":
        result = result.filter(w => w.audio && (w.audio.hy || w.audio.en || w.audio.ru));
        break;
      case "no-audio":
        result = result.filter(w => !w.audio || (!w.audio.hy && !w.audio.en && !w.audio.ru));
        break;
      case "has-wav":
        result = result.filter(w => w.hasWAV);
        break;
      case "favorites":
        result = result.filter(w => favorites.has(w.id));
        break;
      default:
        break;
    }

    switch (sortOption) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        break;
      case "alphabetical":
        result.sort((a, b) => a.hy.localeCompare(b.hy));
        break;
      case "reverse-alpha":
        result.sort((a, b) => b.hy.localeCompare(a.hy));
        break;
      case "favorites":
        result.sort((a, b) => (favorites.has(b.id) ? 1 : 0) - (favorites.has(a.id) ? 1 : 0));
        break;
      default:
        break;
    }

    setNuriMood(result.length === 0 ? (searchQuery ? "sad" : "idle") : "happy");
    return result;
  }, [words, searchQuery, filterOption, sortOption, favorites]);

  useEffect(() => {
    setFilteredWords(filteredAndSortedWords);
  }, [filteredAndSortedWords]);

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
        }
      } catch {
        setIsWAVAvailable(false);
      }
    };
    initWAV();
  }, []);

  const changeVoice = useCallback((voice: string) => {
    setSelectedVoice(voice);
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_VOICE, voice);
    } catch {
      // Ignore
    }
    setShowVoiceSelector(false);
    setWavStatus(t("page_voice_changed_to", { voice }));
  }, [t]);

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

  const handleSpeak = useCallback(
    async (item: UserDictionaryEntry, lang: LangCode) => {
      const text = item[lang] || "";
      
      if (!text) {
        showMessage(t("page_text_empty"), "error");
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
  };

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const copyId = useCallback((id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showMessage(t("page_id_copied"), "info");
  }, [showMessage, t]);

  const handleAddWord = useCallback(() => {
    const hy = newWordHy.trim();
    const en = newWordEn.trim();
    const ru = newWordRu.trim();

    if (!hy) {
      setAddWordStatus("error");
      setAddWordMessage(t("page_hy_required"));
      return;
    }

    const exists = words.some(w => w.hy.toLowerCase() === hy.toLowerCase());
    if (exists) {
      setAddWordStatus("duplicate");
      setAddWordMessage(t("page_word_exists", { word: hy }));
      return;
    }

    setAddWordStatus("saving");

    const newId = getNextId();
    const tags = newWordTags.split(",").map(t => t.trim()).filter(Boolean);
    const category = newWordCategory.trim() || "general";

    const newWord: UserDictionaryEntry = {
      id: newId,
      hy,
      en: en || hy,
      ru: ru || hy,
      type: "user",
      isUserAdded: true,
      audioGenerated: true,
      translationSource: "manual",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: tags.length > 0 ? tags : undefined,
      category,
      difficulty: "medium",
      isFavorite: false,
      audio: {
        hy: `/audio/hy_user/${newId}.mp3`,
        en: `/audio/en_user/${newId}.mp3`,
        ru: `/audio/ru_user/${newId}.mp3`,
      }
    };

    const updated = [...words, newWord];
    saveWords(updated);

    setAddWordStatus("success");
    setAddWordMessage(t("page_word_added", { word: hy, id: newId }));
    showMessage(t("page_word_added_to_dict", { word: hy }), "success");

    setTimeout(() => {
      setShowAddWord(false);
      setNewWordHy("");
      setNewWordEn("");
      setNewWordRu("");
      setNewWordTags("");
      setNewWordCategory("");
      setAddWordStatus("idle");
      setAddWordMessage("");
    }, 1500);
  }, [newWordHy, newWordEn, newWordRu, newWordTags, newWordCategory, words, getNextId, saveWords, showMessage, t]);

  const handleDelete = useCallback((id: string) => {
    if (confirm(t("page_confirm_delete"))) {
      const updated = words.filter(w => w.id !== id);
      saveWords(updated);
      setWavStatus(t("page_deleted_prefix") + " " + t("page_word_deleted"));
      showMessage(t("page_word_deleted_success"), "success");
    }
  }, [words, saveWords, showMessage, t]);

  const handleBatchDelete = useCallback(() => {
    if (selectedWords.size === 0) return;
    if (confirm(t("page_confirm_batch_delete", { count: selectedWords.size }))) {
      const updated = words.filter(w => !selectedWords.has(w.id));
      saveWords(updated);
      setSelectedWords(new Set());
      setIsBatchMode(false);
      showMessage(t("page_batch_deleted", { count: selectedWords.size }), "success");
    }
  }, [selectedWords, words, saveWords, showMessage, t]);

  const startEdit = useCallback((word: UserDictionaryEntry) => {
    setEditingId(word.id);
    setEditData({ 
      hy: word.hy, 
      en: word.en, 
      ru: word.ru,
      tags: word.tags,
      category: word.category,
      difficulty: word.difficulty
    });
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingId || !editData) return;
    if (!editData.hy.trim()) {
      setWavStatus(t("page_error_prefix") + t("page_hy_required"));
      return;
    }

    const updated = words.map(w => 
      w.id === editingId 
        ? { 
            ...w, 
            hy: editData.hy.trim(), 
            en: editData.en.trim() || editData.hy.trim(),
            ru: editData.ru.trim() || editData.hy.trim(),
            tags: editData.tags || w.tags,
            category: editData.category || w.category,
            difficulty: editData.difficulty || w.difficulty,
            updatedAt: new Date().toISOString(),
          }
        : w
    );
    saveWords(updated);
    setEditingId(null);
    setEditData(null);
    setWavStatus(t("page_updated_prefix") + " " + t("page_word_updated"));
    showMessage(t("page_word_updated_success"), "success");
  }, [editingId, editData, words, saveWords, showMessage, t]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditData(null);
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const exportData = {
        version: "2.0",
        exportedAt: new Date().toISOString(),
        totalWords: words.length,
        words: words.map(w => ({
          ...w,
          wavAudio: undefined,
        })),
        stats: wordStats,
        favorites: [...favorites]
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nurlingo-user-dictionary-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showMessage(t("page_export_success", { count: words.length }), "success");
    } catch (error) {
      console.error("Export failed:", error);
      showMessage(t("page_export_failed"), "error");
    } finally {
      setIsExporting(false);
    }
  }, [words, wordStats, favorites, showMessage, t]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        let importedWords: UserDictionaryEntry[] = [];
        
        if (data.version && data.words && Array.isArray(data.words)) {
          importedWords = data.words;
        } else if (Array.isArray(data)) {
          importedWords = data;
        } else {
          throw new Error("Invalid format");
        }

        if (importedWords.length === 0) {
          showMessage(t("page_warning_prefix") + t("page_import_empty"), "info");
          return;
        }

        const existingIds = new Set(words.map(w => w.id));
        const newWords = importedWords.filter(w => !existingIds.has(w.id));
        
        if (newWords.length === 0) {
          showMessage(t("page_warning_prefix") + t("page_import_all_exist"), "info");
          return;
        }

        const updated = [...words, ...newWords];
        saveWords(updated);
        showMessage(t("page_import_success", { count: newWords.length }), "success");
      } catch (error) {
        console.error("Import failed:", error);
        showMessage(t("page_import_failed"), "error");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  }, [words, saveWords, showMessage, t]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedWords(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedWords.size === filteredWords.length) {
      setSelectedWords(new Set());
    } else {
      setSelectedWords(new Set(filteredWords.map(w => w.id)));
    }
  }, [selectedWords, filteredWords]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        if (showAddWord) {
          setShowAddWord(false);
          setAddWordStatus("idle");
          setAddWordMessage("");
        }
        if (editingId) {
          cancelEdit();
        }
        if (searchQuery) {
          setSearchQuery("");
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "a" && !e.target) {
        if (isBatchMode) {
          e.preventDefault();
          toggleSelectAll();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showAddWord, editingId, searchQuery, isBatchMode, toggleSelectAll, cancelEdit]);

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-transparent dark:bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t("page_loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent text-gray-900 dark:text-white pb-24">
      <div ref={topRef} className="container-main py-6">

        <header className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Nuri mood={nuriMood} size={72} glow={nuriMood === "happy"} />
            <div className="flex-1">
              <NuriSpeech
                text={
                  nuriMood === "happy"
                    ? t("page_nuri_happy", { count: wordStats.total })
                    : nuriMood === "sad"
                    ? t("page_nuri_sad")
                    : t("page_nuri_idle")
                }
                mood={nuriMood}
              />
            </div>
            <ThemeToggle />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen size={24} className="text-yellow-500" />
                <span className="text-gradient">{t("page_title")}</span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                <span>{t("page__wordstats_total_", { total: wordStats.total })}</span>
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                <span>{t("page__wordstats_useradded_", { count: wordStats.userAdded })}</span>
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                <span>{t("page__wordstats_hasaudio_", { count: wordStats.hasAudio })}</span>
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                <span>{t("page_favorites_count", { count: favorites.size })}</span>
                {isWAVAvailable && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                    <span className="text-emerald-500">🔊 WAV</span>
                  </>
                )}
              </p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
                className="px-3 py-2 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl text-xs font-medium hover:bg-white/50 dark:hover:bg-gray-800/80 transition-all border border-white/20 dark:border-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                title={viewMode === "list" ? t("page_grid_view") : t("page_list_view")}
              >
                {viewMode === "list" ? "📋" : "📐"}
              </button>

              {isWAVAvailable && wavClient && (
                <div className="relative">
                  <button
                    onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                    className="px-3 py-2 rounded-xl text-xs font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all flex items-center gap-1"
                    title="Select voice"
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

              <button
                onClick={() => setShowAddWord(true)}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-xl text-sm font-bold transition text-white flex items-center gap-1 shadow-[0_4px_16px_rgba(234,179,8,0.3)]"
              >
                <Plus size={16} />
                {t("page_add")}
              </button>

              <button
                onClick={() => setIsBatchMode(!isBatchMode)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                  isBatchMode 
                    ? "bg-blue-500 text-white shadow-[0_4px_16px_rgba(59,130,246,0.3)]" 
                    : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-gray-800/80 border border-white/20 dark:border-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                }`}
              >
                <Check size={14} />
                {t("page_select")}
              </button>

              <button
                onClick={handleExport}
                disabled={isExporting || words.length === 0}
                className="px-3 py-2 bg-green-500/20 text-green-400 rounded-xl text-xs font-medium hover:bg-green-500/30 transition-all flex items-center gap-1 disabled:opacity-50 border border-green-500/20"
              >
                {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                {t("page_export")}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-xl text-xs font-medium hover:bg-purple-500/30 transition-all flex items-center gap-1 disabled:opacity-50 border border-purple-500/20"
              >
                {isImporting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {t("page_import")}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />

              <button
                onClick={loadWords}
                className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-xs font-medium hover:bg-blue-500/30 transition-all flex items-center gap-1 border border-blue-500/20"
                title={t("page_reload_from_json")}
              >
                <RefreshCw size={14} />
                {t("page_reload")}
              </button>

              <Link
                href="/dictionary"
                className="px-4 py-2 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-gray-800/80 rounded-xl text-sm font-medium transition text-gray-700 dark:text-gray-300 flex items-center gap-1 border border-white/20 dark:border-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
              >
                <Sparkles size={16} />
                {t("page_main")}
              </Link>
            </div>
          </div>
          
          {wavStatus && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${
              wavStatus.includes("✅") ? "text-emerald-500" : 
              wavStatus.includes("❌") ? "text-red-500" : 
              wavStatus.includes("⏳") ? "text-yellow-500" :
              "text-blue-500"
            }`}>
              {wavStatus.includes("✅") && <CheckCircle size={12} />}
              {wavStatus.includes("❌") && <AlertCircle size={12} />}
              {wavStatus.includes("⏳") && <Loader2 size={12} className="animate-spin" />}
              {wavStatus}
            </p>
          )}
        </header>

        <div className="space-y-3 mb-4">
          <div className="relative">
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
              className="w-full bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                showFilters 
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" 
                  : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
              }`}
            >
              <Filter size={14} />
              {t("page_filters")}
              {(filterOption !== "all" || sortOption !== "newest") && (
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              )}
            </button>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full flex flex-wrap gap-2 p-3 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
              >
                <select
                  value={filterOption}
                  onChange={(e) => setFilterOption(e.target.value as FilterOption)}
                  className="px-3 py-1.5 bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="all">{t("page_all")}</option>
                  <option value="user">{t("page_user")}</option>
                  <option value="system">{t("page_system")}</option>
                  <option value="has-audio">{t("page_has_audio")}</option>
                  <option value="no-audio">{t("page_no_audio")}</option>
                  <option value="has-wav">{t("page_has_wav")}</option>
                  <option value="favorites">{t("page_favorites")}</option>
                </select>

                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="px-3 py-1.5 bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="newest">{t("page_newest")}</option>
                  <option value="oldest">{t("page_oldest")}</option>
                  <option value="alphabetical">{t("page_alphabetical")}</option>
                  <option value="reverse-alpha">{t("page_reverse_alpha")}</option>
                  <option value="favorites">{t("page_favorites")}</option>
                </select>

                {(filterOption !== "all" || sortOption !== "newest") && (
                  <button
                    onClick={() => {
                      setFilterOption("all");
                      setSortOption("newest");
                    }}
                    className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    ✕ {t("page_clear")}
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {isBatchMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-3 mb-4 flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition"
              >
                {selectedWords.size === filteredWords.length ? t("page_deselect_all") : t("page_select_all")}
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("page_selected")}: <span className="font-bold text-blue-400">{selectedWords.size}</span>
              </span>
            </div>
            <div className="flex gap-2">
              {selectedWords.size > 0 && (
                <button
                  onClick={handleBatchDelete}
                  className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30 transition flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  {t("page_delete")}
                </button>
              )}
              <button
                onClick={() => {
                  setIsBatchMode(false);
                  setSelectedWords(new Set());
                }}
                className="px-3 py-1.5 bg-white/20 dark:bg-gray-800/80 text-gray-400 rounded-lg text-xs font-medium hover:bg-white/30 dark:hover:bg-gray-700 transition"
              >
                ✕ {t("page_close")}
              </button>
            </div>
          </motion.div>
        )}

        <div className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-xl p-3 mb-4 flex items-center justify-between text-sm flex-wrap gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-500 dark:text-gray-400">📚</span>
            <span className="text-gray-900 dark:text-white font-medium">{filteredWords.length}</span>
            <span className="text-gray-500 dark:text-gray-400">{t("page_words_shown")}</span>
            <span className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
            <span className="text-gray-500 dark:text-gray-400">{t("page__wordstats_bylanguage_hy_", { count: wordStats.byLanguage.hy })}</span>
            <span className="text-gray-500 dark:text-gray-400">{t("page__wordstats_bylanguage_en_", { count: wordStats.byLanguage.en })}</span>
            <span className="text-gray-500 dark:text-gray-400">{t("page__wordstats_bylanguage_ru_", { count: wordStats.byLanguage.ru })}</span>
            <span className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
            <span className="text-yellow-500">⭐ {favorites.size}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 dark:text-gray-400">{t("page__id_")}</span>
            <span className="text-gray-900 dark:text-white font-mono">
              {words.length > 0 ? `${words[0]?.id} - ${words[words.length-1]?.id}` : "—"}
            </span>
          </div>
        </div>

        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-3"}>
          {filteredWords.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 col-span-full"
            >
              <div className="text-5xl mb-4">{searchQuery ? "🔍" : "📖"}</div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {searchQuery ? t("page_no_results_query", { query: searchQuery }) : t("page_no_words")}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {searchQuery ? t("page_try_different_search") : t("page_add_first_word")}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowAddWord(true)}
                  className="mt-4 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-xl text-white font-bold transition shadow-[0_4px_16px_rgba(234,179,8,0.3)]"
                >
                  <Plus size={18} className="inline mr-1" />
                  {t("page_add_word")}
                </button>
              )}
            </motion.div>
          ) : (
            filteredWords.map((item, index) => {
              const isUserWord = item.isUserAdded;
              const isExpanded = expandedItems.has(item.id);
              const isEditing = editingId === item.id;
              const hasAudio = item.audio && (item.audio.hy || item.audio.en || item.audio.ru);
              const isSelected = selectedWords.has(item.id);
              const isCopied = copiedId === item.id;
              const isFavorite = favorites.has(item.id);
              const hasWAV = item.hasWAV;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.3) }}
                  className={`bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border ${
                    isSelected ? "border-blue-500" : isFavorite ? "border-yellow-500/50" : "border-white/20 dark:border-white/5"
                  } p-4 rounded-xl transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] relative`}
                  onClick={() => isBatchMode && toggleSelect(item.id)}
                >
                  {isBatchMode && (
                    <div className="absolute top-2 right-2">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? "bg-blue-500 border-blue-500" : "border-gray-400"
                      }`}>
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-yellow-500/20 text-yellow-500 border-yellow-500/20">
                        {isUserWord ? t("page_user_badge") : t("page_system_badge")}
                      </span>
                      <button
                        onClick={() => copyId(item.id)}
                        className="text-[10px] text-gray-500 dark:text-gray-400 font-mono hover:text-yellow-500 transition flex items-center gap-0.5"
                      >
                        #{item.id}
                        {isCopied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                      </button>
                      {isFavorite && (
                        <span className="text-[8px] text-yellow-400 bg-yellow-500/20 px-1.5 py-0.5 rounded-full">
                          ⭐
                        </span>
                      )}
                      {item.audioGenerated && (
                        <span className="text-[8px] text-emerald-500 bg-emerald-500/20 px-1.5 py-0.5 rounded-full">
                          AUDIO ✓
                        </span>
                      )}
                      {hasAudio && (
                        <span className="text-[8px] text-emerald-500 bg-emerald-500/20 px-1.5 py-0.5 rounded-full">
                          MP3
                        </span>
                      )}
                      {hasWAV && (
                        <span className="text-[8px] text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded-full">
                          WAV
                        </span>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <span className="text-[8px] text-gray-400 bg-gray-500/20 px-1.5 py-0.5 rounded-full">
                          {item.tags.join(", ")}
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
                        title={isFavorite ? t("page_remove_favorite") : t("page_add_favorite")}
                      >
                        <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
                      </button>
                      {!isEditing && !isBatchMode && (
                        <>
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800 transition-colors text-blue-400"
                            title={t("page_edit")}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800 transition-colors text-red-400"
                            title={t("page_delete")}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="p-1 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800 transition-colors text-gray-500"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {LANGS.map(({ code, label, flag, color, bg, textColor }) => {
                      const playing = isWordPlaying(item.id, code);
                      const loading = activePlay?.wordId === item.id && activePlay.lang === code && isLoading;
                      const text = item[code] || "—";
                      const audioUrl = item.audio?.[code] || null;

                      let sourceLabel = "";
                      if (code === "hy") {
                        sourceLabel = hasWAV ? "WAV" : "WAV API";
                      } else if (code === "en") {
                        sourceLabel = "TTS";
                      } else if (code === "ru") {
                        sourceLabel = "TTS";
                      }

                      return (
                        <div
                          key={code}
                          className={`flex items-center justify-between gap-3 p-2 rounded-xl transition-all hover:bg-white/5`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className={`text-[10px] font-bold mb-0.5 ${color}`}>
                              {flag} {label}
                              {audioUrl && (
                                <span className="ml-1.5 text-[8px] text-emerald-500">🎵</span>
                              )}
                              {code === "hy" && hasWAV && (
                                <span className="ml-1.5 text-[8px] text-blue-400">🔊 WAV</span>
                              )}
                              {code === "hy" && !hasWAV && isWAVAvailable && (
                                <span className="ml-1.5 text-[8px] text-purple-400">✨ WAV API</span>
                              )}
                              {code === "en" && (
                                <span className="ml-1.5 text-[8px] text-blue-400">🔊 TTS</span>
                              )}
                              {code === "ru" && (
                                <span className="ml-1.5 text-[8px] text-green-400">🔊 TTS</span>
                              )}
                              <span className="ml-1.5 text-[8px] text-gray-400">
                                [{sourceLabel}]
                              </span>
                            </div>
                            {isEditing && editingId === item.id ? (
                              <input
                                value={code === 'hy' ? editData?.hy || '' : code === 'en' ? editData?.en || '' : code === 'ru' ? editData?.ru || '' : ''}
                                onChange={(e) => setEditData(prev => ({ ...prev!, [code]: e.target.value }))}
                                className="w-full bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-lg px-2 py-1 text-lg font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder={`${label}...`}
                                autoFocus={code === 'hy'}
                              />
                            ) : (
                              <div className={`text-lg font-semibold truncate ${text === "—" ? "text-gray-500 dark:text-gray-500" : "text-gray-900 dark:text-white"}`}>
                                {text}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleSpeak(item, code)}
                            disabled={text === "—" || isEditing}
                            className={`relative flex-shrink-0 w-11 h-11 rounded-xl transition-all flex items-center justify-center ${
                              playing
                                ? "bg-emerald-500 text-white"
                                : loading
                                ? "bg-yellow-500/30 text-yellow-400 animate-pulse"
                                : text === "—" || isEditing
                                ? "bg-white/5 text-gray-500/30 cursor-not-allowed"
                                : "bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-gray-800/80 border border-white/20 dark:border-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                            }`}
                            title={code === "hy" ? "WAV (հայերեն)" : code === "en" ? "TTS (անգլերեն)" : "TTS (ռուսերեն)"}
                          >
                            {loading ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : playing ? (
                              <Volume2 size={18} />
                            ) : (
                              <Play size={16} />
                            )}
                            {code === "hy" && hasWAV && !playing && (
                              <span className="absolute -top-1 -right-1 text-[8px] bg-blue-500 text-white rounded-full px-1 font-bold">
                                WAV
                              </span>
                            )}
                            {code === "hy" && !hasWAV && !playing && isWAVAvailable && (
                              <span className="absolute -top-1 -right-1 text-[8px] bg-purple-500 text-white rounded-full px-1 font-bold">
                                API
                              </span>
                            )}
                            {code === "en" && !playing && (
                              <span className="absolute -top-1 -right-1 text-[8px] bg-blue-500 text-white rounded-full px-1 font-bold">
                                TTS
                              </span>
                            )}
                            {code === "ru" && !playing && (
                              <span className="absolute -top-1 -right-1 text-[8px] bg-green-500 text-white rounded-full px-1 font-bold">
                                TTS
                              </span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {isEditing && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-bold text-white transition flex items-center gap-1 shadow-[0_4px_16px_rgba(16,185,129,0.3)]"
                      >
                        <Save size={14} />
                        {t("page_save")}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-gray-800/80 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 transition border border-white/20 dark:border-white/5"
                      >
                        {t("page_cancel")}
                      </button>
                    </div>
                  )}

                  <AnimatePresence>
                    {isExpanded && !isEditing && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-white/20 dark:border-white/5 space-y-2">
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                            <span>{t("page__item_id_", { id: item.id })}</span>
                            <span>{t("page__item_type_user_", { type: item.type || "user" })}</span>
                            <span>{t("page__item_isuseradded_user_added_system_", { isUser: item.isUserAdded ? t("page_user") : t("page_system") })}</span>
                            {item.translationSource && (
                              <span>{t("page__item_translationsource_", { source: item.translationSource })}</span>
                            )}
                            {item.category && (
                              <span>{t("page__item_category_", { category: item.category })}</span>
                            )}
                            {item.difficulty && (
                              <span>{t("page__item_difficulty_", { difficulty: item.difficulty })}</span>
                            )}
                            <Clock size={12} />
                            <span>{t("page__formatdate_item_createdat_", { date: formatDate(item.createdAt) })}</span>
                            {item.updatedAt && item.updatedAt !== item.createdAt && (
                              <span className="ml-3">{t("page__formatdate_item_updatedat_", { date: formatDate(item.updatedAt) })}</span>
                            )}
                          </div>
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {item.tags.map(tag => (
                                <span key={tag} className="text-[8px] bg-white/20 dark:bg-gray-800/80 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {searchQuery && filteredWords.length > 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
            {t("page_showing_count", { count: filteredWords.length, total: words.length })}
          </div>
        )}
      </div>

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

      <AnimatePresence>
        {showAddWord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddWord(false);
                setAddWordStatus("idle");
                setAddWordMessage("");
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white/40 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            >
              <div className="sticky top-0 bg-white/40 dark:bg-gray-900/50 backdrop-blur-xl border-b border-white/20 dark:border-white/5 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Plus size={20} className="text-yellow-500" />
                  {t("page_add_new_word")}
                  <span className="text-xs font-normal text-gray-500">{t("page__id_getnextid_", { id: getNextId() })}</span>
                </h2>
                <button
                  onClick={() => {
                    setShowAddWord(false);
                    setAddWordStatus("idle");
                    setAddWordMessage("");
                  }}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{t("page_hy_label")}</label>
                  <input
                    value={newWordHy}
                    onChange={(e) => setNewWordHy(e.target.value)}
                    className="w-full bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 dark:text-white text-lg placeholder-gray-400"
                    placeholder={t("page_hy_placeholder")}
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleAddWord()}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{t("page_en_label")}</label>
                  <input
                    value={newWordEn}
                    onChange={(e) => setNewWordEn(e.target.value)}
                    className="w-full bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder={t("page_en_placeholder")}
                    onKeyDown={(e) => e.key === "Enter" && handleAddWord()}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{t("page_ru_label")}</label>
                  <input
                    value={newWordRu}
                    onChange={(e) => setNewWordRu(e.target.value)}
                    className="w-full bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder={t("page_ru_placeholder")}
                    onKeyDown={(e) => e.key === "Enter" && handleAddWord()}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{t("page__tags_")}</label>
                  <input
                    value={newWordTags}
                    onChange={(e) => setNewWordTags(e.target.value)}
                    className="w-full bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder={t("page__verb_food_travel")}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{t("page__category")}</label>
                  <input
                    value={newWordCategory}
                    onChange={(e) => setNewWordCategory(e.target.value)}
                    className="w-full bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder={t("page__general_food_travel")}
                  />
                </div>

                {addWordMessage && (
                  <div className={`text-sm font-medium ${
                    addWordStatus === "success" ? "text-emerald-500" :
                    addWordStatus === "error" || addWordStatus === "duplicate" ? "text-red-500" :
                    "text-yellow-500"
                  }`}>
                    {addWordMessage}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleAddWord}
                    disabled={addWordStatus === "saving"}
                    className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 rounded-xl font-black transition text-white flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(234,179,8,0.3)]"
                  >
                    {addWordStatus === "saving" ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {t("page_saving")}
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        {t("page_add")}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddWord(false);
                      setAddWordStatus("idle");
                      setAddWordMessage("");
                    }}
                    className="px-6 py-3 bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-gray-800/80 rounded-xl font-bold transition text-gray-900 dark:text-white border border-white/20 dark:border-white/5"
                  >
                    {t("page_cancel")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}