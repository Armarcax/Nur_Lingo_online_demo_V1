// src/lib/hooks/useAudioEngine.ts
// NUR Lingo — React Hook for Audio Engine

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  audioManager,
  AudioPlayOptions,
  AudioPlayResult,
  AudioProviderType,
  LanguageCode,
  AudioSettings,
  PlaybackState,
} from "@/lib/audio";
import { offlineAudioManager } from "@/lib/offline/OfflineAudioManager";
import { offlineLessonEngine } from "@/lib/offline/OfflineLessonEngine";
import { useI18n } from "@/hooks/useI18n";

export interface UseAudioEngineState {
  /** Current playback state */
  state: PlaybackState;
  /** Currently playing audio ID */
  currentId: string | null;
  /** Provider used for current playback */
  provider: AudioProviderType | null;
  /** Whether TTS fallback was used */
  isTTSFallback: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether offline audio is available */
  isOfflineAvailable: boolean;
  /** Total number of offline audio files */
  offlineCount: number;
  /** Detailed offline stats */
  offlineStats: {
    total: number;
    lesson: number;
    dictionary: number;
    user: number;
  } | null;
}

export interface UseAudioEngineActions {
  /** Play audio for text/word */
  play: (text: string, lang: LanguageCode, options?: AudioPlayOptions) => Promise<AudioPlayResult>;
  /** Stop current playback */
  stop: () => void;
  /** Check if audio exists for ID */
  hasAudio: (id: string, lang: LanguageCode) => Promise<boolean>;
  /** Preload audio files */
  preload: (items: Array<{ id: string; lang: LanguageCode }>) => Promise<void>;
  /** Get current settings */
  getSettings: () => AudioSettings;
  /** Update settings */
  updateSettings: (updates: Partial<AudioSettings>) => AudioSettings;
  /** Check if specific item is playing */
  isPlayingItem: (id: string, lang: LanguageCode) => boolean;
  /** Get current playback state */
  getState: () => PlaybackState;
  /** Reset audio engine */
  reset: () => void;
  /** Check if audio exists offline */
  hasOfflineAudio: (id: string, lang: LanguageCode) => boolean;
  /** Get offline stats */
  getOfflineStats: () => { isOfflineAvailable: boolean; offlineCount: number; offlineStats: any };
}

export type UseAudioEngineReturn = UseAudioEngineState & UseAudioEngineActions;

/**
 * React hook for the Audio Engine
 *
 * Provides reactive state and actions for audio playback.
 *
 * @example
 * const audio = useAudioEngine();
 *
 * // Play audio
 * await audio.play("բարև", "hy", { id: "000001" });
 *
 * // Check state
 * if (audio.state === PlaybackState.PLAYING) {
 *   audio.stop();
 * }
 */
export function useAudioEngine(): UseAudioEngineReturn {
  const { t } = useI18n();
  const [state, setState] = useState<UseAudioEngineState>({
    state: PlaybackState.IDLE,
    currentId: null,
    provider: null,
    isTTSFallback: false,
    error: null,
    isOfflineAvailable: false,
    offlineCount: 0,
    offlineStats: null,
  });

  const playKeyRef = useRef<string | null>(null);

  // ✅ Initialize offline with ALL 3 sources
  useEffect(() => {
    const initOffline = async () => {
      try {
        await offlineAudioManager.init();
        await offlineLessonEngine.init();
        const stats = offlineAudioManager.getStats();
        
        setState(prev => ({
          ...prev,
          isOfflineAvailable: stats.totalEntries > 0,
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

  // Subscribe to audio events
  useEffect(() => {
    const unsubPlay = audioManager.on("play", (data) => {
      setState((prev) => ({
        ...prev,
        state: PlaybackState.PLAYING,
        currentId: data?.id || null,
        provider: data?.provider || null,
        error: null,
      }));
    });

    const unsubEnd = audioManager.on("end", () => {
      setState((prev) => ({
        ...prev,
        state: PlaybackState.IDLE,
        currentId: null,
        provider: null,
        isTTSFallback: false,
      }));
    });

    const unsubStop = audioManager.on("stop", () => {
      setState((prev) => ({
        ...prev,
        state: PlaybackState.IDLE,
      }));
    });

    const unsubError = audioManager.on("error", (data) => {
      setState((prev) => ({
        ...prev,
        state: PlaybackState.ERROR,
        error: data?.error?.message || "Unknown audio error",
      }));
    });

    const unsubLoad = audioManager.on("loading", () => {
      setState((prev) => ({
        ...prev,
        state: PlaybackState.LOADING,
        error: null,
      }));
    });

    return () => {
      unsubPlay();
      unsubEnd();
      unsubStop();
      unsubError();
      unsubLoad();
    };
  }, []);

  // Play function with offline support
  const play = useCallback(async (
    text: string,
    lang: LanguageCode,
    options: AudioPlayOptions = {}
  ): Promise<AudioPlayResult> => {
    const key = options.id ? `${options.id}-${lang}` : `tts-${text}-${lang}`;
    playKeyRef.current = key;

    setState((prev) => ({
      ...prev,
      state: PlaybackState.LOADING,
      error: null,
    }));

    // ✅ Try offline audio first (ALL 3 sources)
    if (state.isOfflineAvailable && options.id) {
      try {
        const variations = [
          options.id,
          options.id.toLowerCase().replace(/\s+/g, '_'),
          options.id.replace(/[^a-zA-Z0-9]/g, '_'),
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
                state: PlaybackState.PLAYING,
                currentId: id,
                provider: AudioProviderType.MP3,
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
              
              setState(prev => ({
                ...prev,
                state: PlaybackState.IDLE,
                currentId: null,
                provider: null,
              }));
              playKeyRef.current = null;
              return {
                provider: AudioProviderType.MP3,
                isTTSFallback: false,
                completed: true,
              };
            } catch (e) {
              console.warn('Offline manager play failed:', e);
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
                  state: PlaybackState.PLAYING,
                  currentId: id,
                  provider: AudioProviderType.MP3,
                  isTTSFallback: false,
                }));
                
                await new Promise((resolve) => {
                  audio.onended = resolve;
                  audio.onerror = resolve;
                  setTimeout(resolve, 10000);
                });
                
                setState(prev => ({
                  ...prev,
                  state: PlaybackState.IDLE,
                  currentId: null,
                  provider: null,
                }));
                playKeyRef.current = null;
                return {
                  provider: AudioProviderType.MP3,
                  isTTSFallback: false,
                  completed: true,
                };
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
      const result = await audioManager.play(text, lang, options);
      setState((prev) => ({
        ...prev,
        isTTSFallback: result.isTTSFallback || false,
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Audio error";
      setState((prev) => ({
        ...prev,
        state: PlaybackState.ERROR,
        error: errorMessage,
      }));
      throw error;
    }
  }, [state.isOfflineAvailable]);

  // Stop function
  const stop = useCallback(() => {
    audioManager.stop();
    offlineAudioManager.stop();
    playKeyRef.current = null;
    setState((prev) => ({
      ...prev,
      state: PlaybackState.IDLE,
      currentId: null,
    }));
  }, []);

  // Check audio exists
  const hasAudio = useCallback(async (id: string, lang: LanguageCode): Promise<boolean> => {
    return audioManager.hasAudio(id, lang);
  }, []);

  // Preload
  const preload = useCallback(async (items: Array<{ id: string; lang: LanguageCode }>): Promise<void> => {
    return audioManager.preload(items);
  }, []);

  // Get settings
  const getSettings = useCallback((): AudioSettings => {
    return audioManager.getSettings();
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<AudioSettings>): AudioSettings => {
    return audioManager.updateSettings(updates);
  }, []);

  // Check if item is playing
  const isPlayingItem = useCallback((id: string, lang: LanguageCode): boolean => {
    return audioManager.isPlayingItem(id, lang) || 
           (state.currentId === id && state.state === PlaybackState.PLAYING);
  }, [state.currentId, state.state]);

  // Get current playback state
  const getState = useCallback((): PlaybackState => {
    return state.state;
  }, [state.state]);

  // Reset audio engine
  const reset = useCallback(() => {
    audioManager.stop();
    offlineAudioManager.stop();
    playKeyRef.current = null;
    setState({
      state: PlaybackState.IDLE,
      currentId: null,
      provider: null,
      isTTSFallback: false,
      error: null,
      isOfflineAvailable: state.isOfflineAvailable,
      offlineCount: state.offlineCount,
      offlineStats: state.offlineStats,
    });
  }, [state.isOfflineAvailable, state.offlineCount, state.offlineStats]);

  // ✅ Check if audio exists offline (ALL sources)
  const hasOfflineAudio = useCallback((id: string, lang: LanguageCode): boolean => {
    if (!state.isOfflineAvailable) return false;
    
    const variations = [
      id,
      id.toLowerCase().replace(/\s+/g, '_'),
      id.replace(/[^a-zA-Z0-9]/g, '_'),
    ];
    
    for (const audioId of variations) {
      if (!audioId) continue;
      
      if (offlineAudioManager.hasAudioKey(audioId, lang)) return true;
      if (offlineLessonEngine.hasAudio(audioId, lang as any, 'female')) return true;
    }
    
    return false;
  }, [state.isOfflineAvailable]);

  // ✅ Get offline stats
  const getOfflineStats = useCallback(() => {
    return {
      isOfflineAvailable: state.isOfflineAvailable,
      offlineCount: state.offlineCount,
      offlineStats: state.offlineStats,
    };
  }, [state.isOfflineAvailable, state.offlineCount, state.offlineStats]);

  return {
    ...state,
    play,
    stop,
    hasAudio,
    preload,
    getSettings,
    updateSettings,
    isPlayingItem,
    getState,
    reset,
    hasOfflineAudio,
    getOfflineStats,
  };
}

// ✅ Default export for compatibility
export default useAudioEngine;