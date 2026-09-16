// src/lib/hooks/useLessonAudio.ts

import { useState, useEffect, useCallback, useRef } from "react";
import {
  loadAudioConfig,
  saveAudioConfig,
  DEFAULT_AUDIO_CONFIG,
  type LessonAudioConfig,
} from "@/lib/audio/LessonAudio";
import type { MultiExercise } from "@/lib/i18n/multilingual";
import { offlineAudioManager } from "@/lib/offline/OfflineAudioManager";
import { offlineLessonEngine } from "@/lib/offline/OfflineLessonEngine";
import { loadLangConfig } from "@/lib/i18n/index";
import { 
  resolveOfflineAudio, 
  hasOfflineAudio,
  getOfflineAudioUrl,
} from "@/lib/offline/offline-audio-resolver";
import { EXERCISE_TO_AUDIO } from "@/lib/content/audio-mapping";

// ─── TYPES ────────────────────────────────────────────────────────────

export interface AudioPlayOptions {
  text: string;
  lang: string;
  speed?: number;
  voice?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  exerciseId?: string;
  exerciseType?: string;
}

interface UseLessonAudioReturn {
  config: LessonAudioConfig;
  updateConfig: (config: Partial<LessonAudioConfig>) => void;
  isEnabled: boolean;
  isSpeaking: boolean;
  speak: (options: AudioPlayOptions) => Promise<void>;
  speakQuestion: (exercise: MultiExercise, lang: string) => Promise<void>;
  speakAnswer: (exercise: MultiExercise, lang: string) => Promise<void>;
  speakCorrect: (exercise: MultiExercise, lang: string) => Promise<void>;
  speakFeedback: (exercise: MultiExercise, isCorrect: boolean, lang: string) => Promise<void>;
  playExerciseAudio: (exercise: MultiExercise, lang: string) => Promise<void>;
  stop: () => void;
  toggleEnabled: () => void;
  getOfflineStats?: () => {
    total: number;
    lesson: number;
    dictionary: number;
    user: number;
  } | null;
  isOfflineAvailable?: boolean;
}

// ─── AUDIO PATHS ─────────────────────────────────────────────────────

const AUDIO_PATHS: Record<string, string> = {
  hy: '/audio/offline/hy_Ani/',
  en: '/audio/offline/en_female/',
  ru: '/audio/offline/ru_female/',
};

// ─── GREETING ALIASES ──────────────────────────────────────────────

const GREETING_ALIASES: Record<string, string[]> = {
  'hello': ['greet_hello', 'hello', 'hi', 'hey'],
  'hi': ['greet_hi', 'hi', 'hello', 'hey'],
  'goodbye': ['greet_bye', 'goodbye', 'bye', 'see_you'],
  'bye': ['greet_bye', 'goodbye', 'bye', 'see_you'],
  'morning': ['greet_morning', 'morning', 'good_morning'],
  'evening': ['greet_evening', 'evening', 'good_evening'],
  'night': ['greet_night', 'night', 'good_night'],
  'day': ['greet_day', 'day', 'good_day'],
  'thank you': ['greet_pleasure', 'thank_you', 'thanks', 'thank'],
  'thanks': ['greet_pleasure', 'thank_you', 'thanks', 'thank'],
  'welcome': ['greet_welcome', 'welcome'],
  'see you': ['greet_seeyou', 'seeyou', 'see_you'],
  'friend': ['greet_friend', 'friend'],
  'nice': ['greet_nice', 'nice_to_meet_you'],
  'too': ['greet_too', 'you_too'],
  'what': ['greet_what', 'what'],
  'name': ['greet_name', 'name', 'my_name_is'],
  'how': ['greet_how', 'how', 'how_are_you'],
  'good': ['greet_good', 'good', 'fine'],
  'fine': ['greet_fine', 'fine', 'good'],
  'bad': ['greet_bad', 'bad'],
  'okay': ['greet_okay', 'okay', 'ok'],
  'please': ['greet_please', 'please'],
  'sorry': ['greet_sorry', 'sorry'],
  'yes': ['greet_yes', 'yes'],
  'no': ['greet_no', 'no'],
  'mr': ['greet_mr', 'mr', 'mister'],
  'mrs': ['greet_mrs', 'mrs', 'misses'],
  'meet': ['greet_meet', 'meet', 'nice_to_meet_you'],
  'pleasure': ['greet_pleasure', 'pleasure'],
  'again': ['greet_again', 'again'],
  'long_time': ['greet_long_time', 'long_time', 'long_time_no_see'],
  'formal': ['g_formal', 'formal', 'polite'],
  'informal': ['g_informal', 'informal', 'casual'],
  'handshake': ['g_handshake', 'handshake'],
  'hug': ['g_hug', 'hug'],
  'kiss': ['g_kiss', 'kiss'],
  'wave': ['g_wave', 'wave'],
  'smile': ['g_smile', 'smile'],
  'polite': ['g_polite', 'polite'],
  'rude': ['g_rude', 'rude'],
  'respect': ['g_respect', 'respect'],
  'elder': ['g_elder', 'elder', 'old'],
  'young': ['g_young', 'young'],
  'stranger': ['g_stranger', 'stranger'],
  'neighbor': ['g_neighbor', 'neighbor'],
  'colleague': ['g_colleague', 'colleague'],
  'boss': ['g_boss', 'boss'],
  'guest': ['g_guest', 'guest'],
  'host': ['g_host', 'host'],
  'how_are': ['g_how_are', 'how_are_you'],
  'what_news': ['g_what_news', 'whats_new'],
  'take_care': ['g_take_care', 'take_care'],
  'have_good': ['g_have_good', 'have_a_good'],
  'god_be': ['g_god_be', 'god_be_with'],
};

// ─── HELPERS ─────────────────────────────────────────────────────────

function getPromptText(exercise: MultiExercise, lang: string): string {
  if (exercise.prompt && typeof exercise.prompt === 'object') {
    const prompt = exercise.prompt as Record<string, string>;
    return prompt[lang] || prompt.en || "";
  }
  return "";
}

function getTargetAnswer(exercise: MultiExercise): string {
  return exercise.targetAnswer || "";
}

function getEncouragement(lang: string, isCorrect: boolean): string {
  const encouragements: Record<string, Record<string, string[]>> = {
    hy: {
      true: ["🌟 Կատարյալ!", "🏆 HAYQ վաստակեցիր!", "✅ Շատ լավ!"],
      false: ["💪 Մի տխրիր!", "🔄 Կրկնիր, և կստացվի!", "📖 Եկեք նորից փորձենք"],
    },
    en: {
      true: ["🌟 Perfect!", "🏆 Wow!", "✅ Very good!"],
      false: ["💪 Don't be sad!", "🔄 Try again!", "📖 Let's try again"],
    },
    ru: {
      true: ["🌟 Отлично!", "🏆 Вау!", "✅ Очень хорошо!"],
      false: ["💪 Не грусти!", "🔄 Попробуй снова!", "📖 Давай попробуем вместе"],
    },
  };

  const langMessages = encouragements[lang];
  if (!langMessages) {
    return isCorrect ? "✅ Correct!" : "❌ Try again";
  }

  const key = isCorrect ? "true" : "false";
  const list = langMessages[key] || langMessages["true"];
  return list[Math.floor(Math.random() * list.length)];
}

// ─── IS VALID AUDIO URL ─────────────────────────────────────────────

function isValidAudioUrl(url: string): boolean {
  if (!url) return false;
  if (url === 'true' || url === 'false' || url === 'undefined') return false;
  
  const validExtensions = ['.mp3', '.wav', '.ogg'];
  const hasValidExtension = validExtensions.some(ext => url.endsWith(ext));
  if (!hasValidExtension) return false;
  
  if (url.startsWith('/audio/') || url.startsWith('http')) {
    return true;
  }
  
  return false;
}

// ─── HOOK ────────────────────────────────────────────────────────────

export function useLessonAudio(): UseLessonAudioReturn {
  const [config, setConfig] = useState<LessonAudioConfig>(() => loadAudioConfig());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineStats, setOfflineStats] = useState<{
    total: number;
    lesson: number;
    dictionary: number;
    user: number;
  } | null>(null);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const isMountedRef = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioPlayingRef = useRef(false);
  const lastPlayedKeyRef = useRef<string>('');

  // ─── INIT OFFLINE ──────────────────────────────────────────────────

  useEffect(() => {
    const initOffline = async () => {
      try {
        await offlineAudioManager.init();
        await offlineLessonEngine.init();
        
        const stats = offlineAudioManager.getStats();
        setIsOfflineMode(stats.totalEntries > 0);
        setIsOfflineReady(true);
        setOfflineStats({
          total: stats.totalEntries || 0,
          lesson: stats.lessonEntries || 0,
          dictionary: stats.dictionaryEntries || 0,
          user: stats.userEntries || 0,
        });
        console.log(`📱 Offline mode: ${stats.totalEntries} entries`);
      } catch (e) {
        console.warn('⚠️ Offline init error:', e);
        setIsOfflineReady(true);
      }
    };
    initOffline();
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (typeof window !== "undefined") {
      speechSynthRef.current = window.speechSynthesis;
    }
    return () => {
      isMountedRef.current = false;
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const updateConfig = useCallback((newConfig: Partial<LessonAudioConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      saveAudioConfig(updated);
      return updated;
    });
  }, []);

  const toggleEnabled = useCallback(() => {
    updateConfig({ mode: config.mode === "off" ? "on" : "off" });
  }, [config.mode, updateConfig]);

  const stop = useCallback(() => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (offlineAudioManager.isPlaying()) {
      offlineAudioManager.stop();
    }
    setIsSpeaking(false);
    isAudioPlayingRef.current = false;
  }, []);

  // ─── GENERATE AUDIO KEYS ───────────────────────────────────────────

  const generateAudioKeys = useCallback((text: string, lang: string, exerciseId?: string): string[] => {
    const keys: string[] = [];
    
    // 1. Exercise ID
    if (exerciseId) {
      keys.push(exerciseId);
      keys.push(`${lang}_${exerciseId}`);
      keys.push(`${exerciseId}_answer`);
      keys.push(`${lang}_${exerciseId}_answer`);
      
      const baseId = exerciseId.replace(/_(mc|tr|listening|word_order|match_pairs|e)_\d+$/, '');
      if (baseId !== exerciseId) {
        keys.push(baseId);
        keys.push(`${lang}_${baseId}`);
        keys.push(`${baseId}_answer`);
        keys.push(`${lang}_${baseId}_answer`);
      }
    }
    
    // 2. From text - clean
    const cleanText = text.toLowerCase().trim();
    const textKey = cleanText.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
    if (textKey) {
      keys.push(textKey);
      keys.push(`${lang}_${textKey}`);
      keys.push(`${textKey}_answer`);
      keys.push(`${lang}_${textKey}_answer`);
    }
    
    // 3. First word
    const firstWord = cleanText.split(' ')[0];
    if (firstWord && firstWord.length > 1) {
      keys.push(firstWord);
      keys.push(`${lang}_${firstWord}`);
      keys.push(`${firstWord}_answer`);
      keys.push(`${lang}_${firstWord}_answer`);
    }
    
    // 4. Numeric ID
    const numericMatch = text.match(/\d{6}/);
    if (numericMatch) {
      keys.push(numericMatch[0]);
      keys.push(`${lang}_${numericMatch[0]}`);
    }
    
    // 5. Greeting aliases
    const lowerText = cleanText.toLowerCase();
    for (const [aliasKey, variations] of Object.entries(GREETING_ALIASES)) {
      if (lowerText.includes(aliasKey) || variations.some(v => lowerText.includes(v))) {
        for (const variation of variations) {
          keys.push(variation);
          keys.push(`${lang}_${variation}`);
          keys.push(`${variation}_answer`);
          keys.push(`${lang}_${variation}_answer`);
        }
        break;
      }
    }
    
    // 6. Try to find in EXERCISE_TO_AUDIO directly
    for (const [exKey, audioId] of Object.entries(EXERCISE_TO_AUDIO)) {
      if (cleanText.includes(exKey.toLowerCase()) || exKey.toLowerCase().includes(cleanText)) {
        keys.push(audioId);
        keys.push(`${lang}_${audioId}`);
        keys.push(`${audioId}_answer`);
        keys.push(`${lang}_${audioId}_answer`);
        break;
      }
    }
    
    // Remove duplicates and invalid keys
    return [...new Set(keys)].filter(key => key && key.length > 1 && key !== '_' && key !== ' ');
  }, []);

  // ─── FIND AUDIO URL ───────────────────────────────────────────────

  const findAudioUrl = useCallback((key: string, lang: string): string | null => {
    // Skip invalid keys
    if (!key || key === '_' || key === ' ' || key.length < 2) {
      return null;
    }

    // Skip generic fallback keys that don't exist
    const invalidKeys = ['_', '__', '___', 'answer', 'answer_', '_answer'];
    if (invalidKeys.includes(key) || key.startsWith('_') || key.endsWith('_')) {
      return null;
    }

    // ✅ 1. Use resolveOfflineAudio (primary)
    try {
      const result = resolveOfflineAudio(key, lang as any);
      if (result && result.url && isValidAudioUrl(result.url)) {
        console.log(`✅ Found via resolver: ${key} → ${result.url}`);
        return result.url;
      }
    } catch (e) {
      // Continue
    }
    
    // ✅ 2. Check EXERCISE_TO_AUDIO directly
    try {
      const audioId = EXERCISE_TO_AUDIO[key as keyof typeof EXERCISE_TO_AUDIO];
      if (audioId) {
        const folder = AUDIO_PATHS[lang] || AUDIO_PATHS.hy;
        const url = `${folder}${audioId}.mp3`;
        console.log(`✅ Found via EXERCISE_TO_AUDIO: ${key} → ${url}`);
        return url;
      }
    } catch (e) {
      // Continue
    }
    
    // ✅ 3. Try with _answer suffix (only if key is valid)
    const answerKey = `${key}_answer`;
    try {
      const answerAudioId = EXERCISE_TO_AUDIO[answerKey as keyof typeof EXERCISE_TO_AUDIO];
      if (answerAudioId) {
        const folder = AUDIO_PATHS[lang] || AUDIO_PATHS.hy;
        const url = `${folder}${answerAudioId}.mp3`;
        console.log(`✅ Found via answer key: ${answerKey} → ${url}`);
        return url;
      }
    } catch (e) {
      // Continue
    }
    
    // ✅ 4. Try with language prefix
    const langKey = `${lang}_${key}`;
    try {
      const langAudioId = EXERCISE_TO_AUDIO[langKey as keyof typeof EXERCISE_TO_AUDIO];
      if (langAudioId) {
        const folder = AUDIO_PATHS[lang] || AUDIO_PATHS.hy;
        const url = `${folder}${langAudioId}.mp3`;
        console.log(`✅ Found via lang key: ${langKey} → ${url}`);
        return url;
      }
    } catch (e) {
      // Continue
    }
    
    // ✅ 5. Try direct file path (only for valid audio keys)
    const isValidAudioKey = /^\d{6}$/.test(key) || 
                            /^[a-z_]+$/.test(key) ||
                            key.startsWith('greet_') ||
                            /^w\d+_l\d+_/.test(key);
    
    if (isValidAudioKey && !invalidKeys.includes(key)) {
      const folder = AUDIO_PATHS[lang] || AUDIO_PATHS.hy;
      const directUrl = `${folder}${key}.mp3`;
      return directUrl;
    }
    
    return null;
  }, []);

  // ─── TRY PLAY AUDIO FILE ──────────────────────────────────────────

  const tryPlayAudioFile = useCallback((url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        // ✅ Validate URL
        if (!isValidAudioUrl(url)) {
          console.warn('❌ Invalid audio URL:', url);
          resolve(false);
          return;
        }

        // ✅ Prevent overlapping audio
        if (isAudioPlayingRef.current) {
          console.warn('⏳ Audio already playing, skipping');
          resolve(false);
          return;
        }

        const audio = new Audio(url);
        audioRef.current = audio;
        audio.volume = 1;

        let resolved = false;

        const onEnd = () => {
          if (!resolved) {
            resolved = true;
            isAudioPlayingRef.current = false;
            resolve(true);
          }
        };

        const onError = (e: any) => {
          if (!resolved) {
            resolved = true;
            isAudioPlayingRef.current = false;
            console.warn('❌ Audio error:', url, e);
            resolve(false);
          }
        };

        audio.onended = onEnd;
        audio.onerror = onError;

        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            isAudioPlayingRef.current = false;
            resolve(false);
          }
        }, 15000);

        isAudioPlayingRef.current = true;
        audio.play().catch((e) => {
          if (!resolved) {
            resolved = true;
            isAudioPlayingRef.current = false;
            console.warn('❌ Play failed:', url, e);
            resolve(false);
          }
          clearTimeout(timeout);
        });
      } catch (e) {
        isAudioPlayingRef.current = false;
        resolve(false);
      }
    });
  }, []);

  // ─── BROWSER TTS ──────────────────────────────────────────────────

  const browserTTS = useCallback((
    text: string,
    lang: string,
    speed: number,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> => {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      if (!synth) {
        resolve();
        return;
      }

      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hy' ? 'hy-AM' : lang === 'ru' ? 'ru-RU' : 'en-US';
      utterance.rate = speed || 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      try {
        const voices = synth.getVoices();
        let voiceMatch = null;
        if (lang === 'en') {
          voiceMatch = voices.find(v => v.lang.startsWith('en'));
        } else if (lang === 'ru') {
          voiceMatch = voices.find(v => v.lang.startsWith('ru'));
        } else {
          voiceMatch = voices.find(v => v.lang.startsWith('hy'));
        }
        if (voiceMatch) {
          utterance.voice = voiceMatch;
        }
      } catch {
        // Ignore
      }

      onStart?.();

      utterance.onend = () => {
        onEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        if (event.error === "canceled" || event.error === "interrupted") {
          resolve();
          return;
        }
        if (event.error === "not-allowed") {
          console.warn('🔇 TTS not allowed by browser');
          resolve();
          return;
        }
        console.warn('TTS error:', event.error);
        onError?.(new Error(event.error));
        resolve();
      };

      try {
        synth.speak(utterance);
      } catch (error) {
        console.warn('TTS speak error:', error);
        resolve();
      }
    });
  }, []);

  // ─── SMART HYBRID SPEAK ───────────────────────────────────────────

  const speak = useCallback((options: AudioPlayOptions): Promise<void> => {
    return new Promise((resolve) => {
      if (config.mode === "off") {
        resolve();
        return;
      }

      const { text, lang, speed = config.speed, onStart, onEnd, onError, exerciseId } = options;

      if (!text || text.trim().length === 0) {
        resolve();
        return;
      }

      // ✅ Skip if same text is already playing
      const playKey = `${text}_${lang}`;
      if (lastPlayedKeyRef.current === playKey && isAudioPlayingRef.current) {
        console.log('🔄 Skipping duplicate audio:', text);
        resolve();
        return;
      }

      async function smartSpeak() {
        // ✅ 1. TRY OFFLINE AUDIO (primary)
        if (isOfflineReady) {
          const keys = generateAudioKeys(text, lang, exerciseId);
          console.log(`🔍 Trying offline for "${text}" (${lang}): ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? ` ... (${keys.length} total)` : ''}`);

          for (const key of keys) {
            if (!key) continue;

            // Skip invalid keys
            const invalidKeys = ['_', '__', '___', 'answer', 'answer_', '_answer'];
            if (invalidKeys.includes(key) || key.startsWith('_') || key.endsWith('_')) {
              continue;
            }

            const url = findAudioUrl(key, lang);
            if (url && isValidAudioUrl(url)) {
              console.log(`✅ Attempting offline: ${url}`);
              setIsSpeaking(true);
              onStart?.();

              lastPlayedKeyRef.current = playKey;
              const played = await tryPlayAudioFile(url);

              if (isMountedRef.current) setIsSpeaking(false);
              onEnd?.();

              if (played) {
                resolve();
                return;
              }
            }
          }
        }

        // ✅ 2. TRY GENERATE-TTS API
        if (text && text.trim().length > 0 && text.length < 500) {
          try {
            console.log(`🌐 Trying online TTS for: "${text}"`);
            const response = await fetch('/api/generate-tts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text, language: lang }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.url && isValidAudioUrl(data.url)) {
                console.log(`✅ TTS API: ${data.url}`);
                setIsSpeaking(true);
                onStart?.();

                lastPlayedKeyRef.current = playKey;
                const played = await tryPlayAudioFile(data.url);

                if (isMountedRef.current) setIsSpeaking(false);
                onEnd?.();

                if (played) {
                  resolve();
                  return;
                }
              }
            }
          } catch (e) {
            console.warn('TTS API failed:', e);
          }
        }

        // ✅ 3. FALLBACK: Browser TTS (only if not already playing)
        if (text && text.trim().length > 0 && text.length < 500 && !isAudioPlayingRef.current) {
          console.log(`🗣️ Browser TTS for: "${text}"`);
          await browserTTS(text, lang, speed, onStart, onEnd, onError);
        }
        resolve();
      }

      smartSpeak().catch(() => {
        if (text && text.trim().length > 0 && text.length < 500) {
          browserTTS(text, lang, speed, onStart, onEnd, onError)
            .then(resolve)
            .catch(() => resolve());
        } else {
          resolve();
        }
      });
    });
  }, [config.mode, config.speed, isOfflineReady, browserTTS, generateAudioKeys, findAudioUrl, tryPlayAudioFile]);

  // ─── SPEAK QUESTION ────────────────────────────────────────────────

  const speakQuestion = useCallback(async (exercise: MultiExercise, lang: string) => {
    if (config.mode === "off" || !config.autoPlayQuestions) return;
    const text = getPromptText(exercise, lang);
    if (text) {
      await speak({ 
        text, 
        lang, 
        speed: config.speed,
        exerciseId: exercise.id,
      });
    }
  }, [config.mode, config.autoPlayQuestions, config.speed, speak]);

  // ─── SPEAK ANSWER ──────────────────────────────────────────────────

  const speakAnswer = useCallback(async (exercise: MultiExercise, lang: string) => {
    if (config.mode === "off" || !config.autoPlayAnswers) return;
    const text = getTargetAnswer(exercise);
    if (text) {
      const answerId = `${exercise.id}_answer`;
      await speak({ 
        text, 
        lang, 
        speed: config.speed,
        exerciseId: answerId,
      });
    }
  }, [config.mode, config.autoPlayAnswers, config.speed, speak]);

  // ─── SPEAK CORRECT ─────────────────────────────────────────────────

  const speakCorrect = useCallback(async (exercise: MultiExercise, lang: string) => {
    if (config.mode === "off" || !config.autoPlayCorrect) return;
    
    const targetLang = loadLangConfig()?.learning || 'hy';
    const answerText = exercise.targetAnswer;
    
    if (answerText) {
      const answerId = `${exercise.id}_answer`;
      await speak({ 
        text: answerText, 
        lang: targetLang, 
        speed: config.speed,
        exerciseId: answerId,
      });
    }
    
    setTimeout(async () => {
      const encouragement = getEncouragement(lang, true);
      await speak({ text: encouragement, lang, speed: config.speed });
    }, 600);
  }, [config.mode, config.autoPlayCorrect, config.speed, speak]);

  // ─── SPEAK FEEDBACK ────────────────────────────────────────────────

  const speakFeedback = useCallback(async (exercise: MultiExercise, isCorrect: boolean, lang: string) => {
    if (config.mode === "off" || !config.autoPlayFeedback) return;
    const targetLang = lang || "hy";
    if (isCorrect) {
      const answerText = getTargetAnswer(exercise);
      if (answerText) {
        const answerId = `${exercise.id}_answer`;
        await speak({ 
          text: answerText, 
          lang: targetLang, 
          speed: config.speed,
          exerciseId: answerId,
        });
      }
    }
    setTimeout(async () => {
      const feedbackText = isCorrect ? "✅ Ճիշտ է!" : "❌ Սխալ է, փորձիր նորից";
      await speak({ text: feedbackText, lang, speed: config.speed });
      setTimeout(async () => {
        const encouragement = getEncouragement(lang, isCorrect);
        await speak({ text: encouragement, lang, speed: config.speed });
      }, 600);
    }, 600);
  }, [config.mode, config.autoPlayFeedback, config.speed, speak]);

  // ─── PLAY EXERCISE AUDIO ───────────────────────────────────────────

  const playExerciseAudio = useCallback(async (exercise: MultiExercise, lang: string) => {
    if (config.mode === "off") return;
    if (exercise.type === "listening" && exercise.ttsText) {
      await speak({
        text: exercise.ttsText,
        lang: exercise.ttsLang || lang,
        speed: 0.7,
        exerciseId: exercise.id,
      });
      return;
    }
    const text = getPromptText(exercise, lang);
    if (text) {
      await speak({ text, lang, speed: config.speed, exerciseId: exercise.id });
    }
  }, [config.mode, config.speed, speak]);

  const getOfflineStats = useCallback(() => offlineStats, [offlineStats]);

  const isOfflineAvailable = isOfflineMode;
  const isEnabled = config.mode !== "off";

  return {
    config,
    updateConfig,
    isEnabled,
    isSpeaking,
    speak,
    speakQuestion,
    speakAnswer,
    speakCorrect,
    speakFeedback,
    playExerciseAudio,
    stop,
    toggleEnabled,
    getOfflineStats,
    isOfflineAvailable,
  };
}