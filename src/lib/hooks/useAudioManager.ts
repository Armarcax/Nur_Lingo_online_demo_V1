// src/lib/hooks/useAudioManager.ts
// NUR Lingo — React Hook for Audio (uses AudioEngine internally)

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  audioManager,
  AudioPlayResult,
  AudioProviderType,
  LanguageCode,
} from "@/lib/audio";
import { offlineAudioManager } from "@/lib/offline/OfflineAudioManager";
import { offlineLessonEngine } from "@/lib/offline/OfflineLessonEngine";
import { useI18n } from "@/hooks/useI18n";

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  source: AudioProviderType | null;
  isTTSFallback: boolean;
  isOffline: boolean;
  offlineCount: number;
  offlineStats?: {
    total: number;
    lesson: number;
    dictionary: number;
    user: number;
  } | null;
}

export function useAudioManager() {
  const { t } = useI18n();
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    isLoading: false,
    source: null,
    isTTSFallback: false,
    isOffline: false,
    offlineCount: 0,
    offlineStats: null,
  });

  const currentKey = useRef<string | null>(null);

  // ✅ Initialize offline with ALL 3 sources
  useEffect(() => {
    const initOffline = async () => {
      try {
        await offlineAudioManager.init();
        await offlineLessonEngine.init();
        const stats = offlineAudioManager.getStats();
        setState(prev => ({
          ...prev,
          isOffline: stats.totalEntries > 0,
          offlineCount: stats.totalEntries || 0,
          offlineStats: {
            total: stats.totalEntries || 0,
            lesson: stats.lessonEntries || 0,
            dictionary: stats.dictionaryEntries || 0,
            user: stats.userEntries || 0,
          },
        }));
        console.log(`📱 Offline audio: ${stats.totalEntries} entries (Lesson: ${stats.lessonEntries}, Dictionary: ${stats.dictionaryEntries}, User: ${stats.userEntries})`);
      } catch (e) {
        console.warn('⚠️ Offline init error:', e);
      }
    };
    initOffline();
  }, []);

  // Subscribe to audio events for reactive state
  useEffect(() => {
    const unsubPlay = audioManager.on("play", (data) => {
      setState((s) => ({
        ...s,
        isPlaying: true,
        isLoading: false,
        source: data.provider,
      }));
    });

    const unsubLoad = audioManager.on("loading", () => {
      setState(prev => ({ ...prev, isPlaying: false, isLoading: true, source: null, isTTSFallback: false }));
    });

    const unsubStop = audioManager.on("stop", () => {
      setState(prev => ({ ...prev, isPlaying: false, isLoading: false, source: null, isTTSFallback: false }));
    });

    const unsubEnd = audioManager.on("end", () => {
      currentKey.current = null;
      setState(prev => ({ ...prev, isPlaying: false, isLoading: false, source: null, isTTSFallback: false }));
    });

    const unsubError = audioManager.on("error", () => {
      currentKey.current = null;
      setState(prev => ({ ...prev, isPlaying: false, isLoading: false, source: null, isTTSFallback: false }));
    });

    return () => {
      unsubPlay();
      unsubLoad();
      unsubStop();
      unsubEnd();
      unsubError();
    };
  }, []);

  // ✅ Enhanced play with offline support (ALL 3 sources)
  const play = useCallback(async (
    text: string,
    lang: LanguageCode,
    audioId: string | undefined,
    key?: string
  ): Promise<AudioPlayResult | void> => {
    const playKey = key ?? `${audioId}-${lang}`;

    // Toggle off if same key is playing
    if (currentKey.current === playKey && state.isPlaying) {
      audioManager.stop();
      currentKey.current = null;
      setState(prev => ({ ...prev, isPlaying: false, isLoading: false, source: null, isTTSFallback: false }));
      return;
    }

    currentKey.current = playKey;
    setState(prev => ({ ...prev, isPlaying: false, isLoading: true, source: null, isTTSFallback: false }));

    // ✅ Try offline audio first if available (ALL sources)
    if (state.isOffline && audioId) {
      try {
        // Try different variations
        const variations = [
          audioId,
          audioId.toLowerCase().replace(/\s+/g, '_'),
          audioId.replace(/[^a-zA-Z0-9]/g, '_'),
          text.toLowerCase().replace(/\s+/g, '_'),
        ];

        let played = false;
        for (const id of variations) {
          if (!id) continue;

          // 1. Try offlineAudioManager (all sources)
          if (offlineAudioManager.hasAudioKey(id, lang)) {
            try {
              await offlineAudioManager.play(id, lang);
              played = true;
              setState(prev => ({
                ...prev,
                isPlaying: true,
                isLoading: false,
                source: AudioProviderType.MP3,
                isTTSFallback: false,
              }));
              
              await new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                  if (!offlineAudioManager.isPlaying()) {
                    clearInterval(checkInterval);
                    resolve(null);
                  }
                }, 300);
                setTimeout(() => {
                  clearInterval(checkInterval);
                  resolve(null);
                }, 10000);
              });
              
              setState(prev => ({ ...prev, isPlaying: false, isLoading: false, source: null, isTTSFallback: false }));
              currentKey.current = null;
              return;
            } catch (e) {
              console.warn('Offline play failed:', e);
            }
          }

          // 2. Try offlineLessonEngine (dictionary + user)
          if (!played) {
            const path = offlineLessonEngine.getAudioPath(id, lang as any, 'female');
            if (path) {
              try {
                const audio = new Audio(path);
                audio.volume = 1;
                await audio.play();
                played = true;
                setState(prev => ({
                  ...prev,
                  isPlaying: true,
                  isLoading: false,
                  source: AudioProviderType.MP3,
                  isTTSFallback: false,
                }));
                
                await new Promise((resolve) => {
                  audio.onended = resolve;
                  audio.onerror = resolve;
                  setTimeout(resolve, 10000);
                });
                
                setState(prev => ({ ...prev, isPlaying: false, isLoading: false, source: null, isTTSFallback: false }));
                currentKey.current = null;
                return;
              } catch (e) {
                console.warn('Lesson engine play failed:', e);
              }
            }
          }
        }
      } catch (e) {
        console.warn('Offline audio error:', e);
      }
    }

    // ✅ Fallback to normal audio manager
    try {
      const result = await audioManager.play(text, lang, {
        id: audioId,
        volume: audioManager.getSettings().volume,
        rate: audioManager.getSettings().rate,
        onSource: (src) => {
          setState(prev => ({
            ...prev,
            source: src,
            isTTSFallback: src === AudioProviderType.BROWSER_TTS,
          }));
        },
      });

      setState(prev => ({
        ...prev,
        isPlaying: true,
        isLoading: false,
        source: result.provider,
        isTTSFallback: result.isTTSFallback,
      }));

      return result;
    } catch {
      currentKey.current = null;
      setState(prev => ({ ...prev, isPlaying: false, isLoading: false, source: null, isTTSFallback: false }));
    }
  }, [state.isPlaying, state.isOffline]);

  const stop = useCallback(() => {
    audioManager.stop();
    offlineAudioManager.stop();
    currentKey.current = null;
    setState(prev => ({ ...prev, isPlaying: false, isLoading: false, source: null, isTTSFallback: false }));
  }, []);

  const preload = useCallback((items: Array<{ id: string; lang: LanguageCode }>) => {
    audioManager.preload(items);
  }, []);

  // ✅ Check if specific audio exists offline (ALL sources)
  const hasOfflineAudio = useCallback((audioId: string, lang: LanguageCode): boolean => {
    if (!state.isOffline) return false;
    
    const variations = [
      audioId,
      audioId.toLowerCase().replace(/\s+/g, '_'),
      audioId.replace(/[^a-zA-Z0-9]/g, '_'),
    ];
    
    for (const id of variations) {
      if (!id) continue;
      
      // Check offlineAudioManager (all sources)
      if (offlineAudioManager.hasAudioKey(id, lang)) return true;
      
      // Check offlineLessonEngine (dictionary + user)
      if (offlineLessonEngine.hasAudio(id, lang as any, 'female')) return true;
    }
    
    return false;
  }, [state.isOffline]);

  // ✅ Get offline stats
  const getOfflineStats = useCallback(() => {
    return {
      isOffline: state.isOffline,
      offlineCount: state.offlineCount,
      offlineStats: state.offlineStats,
    };
  }, [state.isOffline, state.offlineCount, state.offlineStats]);

  return {
    ...state,
    play,
    stop,
    preload,
    activeKey: currentKey.current,
    hasOfflineAudio,
    getOfflineStats,
  };
}