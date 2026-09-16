// src/lib/hooks/useAudio.ts
// NUR Lingo — Audio Hook for components

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  audioManager,
  AudioPlayOptions,
  LanguageCode,
  AudioProviderType,
  LANGUAGE_TTS_SUPPORT,
} from "@/lib/audio";

// ✅ Import offline audio support - FIXED
// ❌ REMOVED: import { offlineAudioEngine } from "@/lib/offline/OfflineAudioManager";
import { offlineAudioManager } from "@/lib/offline/OfflineAudioManager";
import { offlineLessonEngine } from "@/lib/offline/OfflineLessonEngine";
import { useI18n } from "@/hooks/useI18n";

export function useAudio() {
  const { t } = useI18n();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTTSFallback, setIsTTSFallback] = useState(false);
  const [isMutedState, setIsMutedState] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineAudioCount, setOfflineAudioCount] = useState(0);
  const [offlineStats, setOfflineStats] = useState<{
    total: number;
    lesson: number;
    dictionary: number;
    user: number;
  } | null>(null);

  // ✅ Check offline status with ALL sources
  useEffect(() => {
    const checkOffline = async () => {
      try {
        // Initialize all engines
        await offlineAudioManager.init();
        await offlineLessonEngine.init();
        
        // Get stats from offlineAudioManager (includes all 3 sources)
        const stats = offlineAudioManager.getStats();
        const totalEntries = stats.totalEntries || 0;
        const hasOffline = totalEntries > 0;
        
        setIsOfflineMode(hasOffline);
        setOfflineAudioCount(totalEntries);
        setOfflineStats({
          total: stats.totalEntries || 0,
          lesson: stats.lessonEntries || 0,
          dictionary: stats.dictionaryEntries || 0,
          user: stats.userEntries || 0,
        });
        
        console.log(`📱 Offline audio: ${totalEntries} files available (Lesson: ${stats.lessonEntries}, Dictionary: ${stats.dictionaryEntries}, User: ${stats.userEntries})`);
      } catch (error) {
        console.warn('⚠️ Offline audio init error:', error);
        setIsOfflineMode(false);
      }
    };
    checkOffline();
  }, []);

  // Subscribe to events
  useEffect(() => {
    const unsubPlay = audioManager.on("play", () => {
      setIsSpeaking(true);
      setIsLoading(false);
    });
    const unsubLoading = audioManager.on("loading", () => {
      setIsLoading(true);
    });
    const unsubEnd = audioManager.on("end", () => {
      setIsSpeaking(false);
      setIsLoading(false);
    });
    const unsubStop = audioManager.on("stop", () => {
      setIsSpeaking(false);
      setIsLoading(false);
    });
    const unsubError = audioManager.on("error", () => {
      setIsSpeaking(false);
      setIsLoading(false);
    });

    return () => {
      unsubPlay();
      unsubLoading();
      unsubEnd();
      unsubStop();
      unsubError();
    };
  }, []);

  // ✅ Enhanced speak with offline support (ALL 3 sources)
  const speak = useCallback(async (
    text: string,
    lang: LanguageCode,
    options?: AudioPlayOptions
  ) => {
    setIsLoading(true);
    
    try {
      // ✅ Try offline audio first if available
      if (isOfflineMode) {
        // Try different variations to find audio
        const variations = [
          text.toLowerCase().replace(/\s+/g, '_'),
          text.toLowerCase().replace(/\s+/g, ''),
          text.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          text.split(' ')[0]?.toLowerCase(),
          text, // Original text as fallback
        ];
        
        const gender = 'female';
        let foundPath: string | null = null;
        let foundKey: string | null = null;
        let foundSource: string | null = null;
        
        // Try each variation
        for (const audioId of variations) {
          if (!audioId) continue;
          
          // 1. Try offlineAudioManager (all sources)
          if (offlineAudioManager.hasAudioKey(audioId, lang)) {
            const url = offlineAudioManager.getAudioUrl(audioId, lang);
            if (url) {
              foundPath = url;
              foundKey = audioId;
              foundSource = 'manager';
              break;
            }
          }
          
          // 2. Try offlineLessonEngine (includes dictionary + user)
          if (offlineLessonEngine.hasAudio(audioId, lang as any, gender as any)) {
            const pathFromEngine = offlineLessonEngine.getAudioPath(audioId, lang as any, gender as any);
            if (pathFromEngine) {
              foundPath = pathFromEngine;
              foundKey = audioId;
              foundSource = 'engine';
              break;
            }
          }
        }
        
        // If found, play it
        if (foundPath) {
          try {
            // Check if file exists
            const checkRes = await fetch(foundPath, { method: 'HEAD' });
            if (checkRes.ok) {
              const audio = new Audio(foundPath);
              audio.volume = 1;
              
              await audio.play();
              setIsSpeaking(true);
              setIsTTSFallback(false);
              setIsLoading(false);
              
              // Wait for audio to finish
              await new Promise((resolve) => {
                audio.onended = resolve;
                audio.onerror = resolve;
                // Fallback after 10 seconds
                setTimeout(resolve, 10000);
              });
              
              setIsSpeaking(false);
              return { 
                isTTSFallback: false, 
                provider: 'offline' as AudioProviderType,
                audioId: foundKey,
                source: foundSource,
              };
            }
          } catch (e) {
            console.warn(`Offline audio play failed (${foundSource}), falling back to TTS:`, e);
          }
        }
      }
      
      // ✅ Fallback to normal TTS
      const result = await audioManager.play(text, lang, options);
      setIsTTSFallback(result.isTTSFallback || false);
      return result;
    } catch (error) {
      options?.onError?.(error as Error);
      setIsTTSFallback(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isOfflineMode]);

  const stop = useCallback(() => {
    audioManager.stop();
    offlineAudioManager.stop();
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const getVoices = useCallback(async () => {
    return audioManager.getVoices();
  }, []);

  const isTTSSupported = useCallback((lang: LanguageCode): boolean => {
    return LANGUAGE_TTS_SUPPORT[lang]?.hasTTS || false;
  }, []);

  const preload = useCallback(async (items: Array<{ id: string; lang: LanguageCode }>) => {
    return audioManager.preload(items);
  }, []);

  const getStatus = useCallback(() => {
    return {
      isSpeaking,
      isLoading,
      isTTSFallback,
      isMuted: isMutedState,
      isOfflineMode,
      offlineAudioCount,
      offlineStats,
    };
  }, [isSpeaking, isLoading, isTTSFallback, isMutedState, isOfflineMode, offlineAudioCount, offlineStats]);

  const toggleMute = useCallback(() => {
    setIsMutedState(prev => !prev);
    return !isMutedState;
  }, [isMutedState]);

  const isMuted = useCallback(() => {
    return isMutedState;
  }, [isMutedState]);

  const getProvider = useCallback(() => {
    return null;
  }, []);

  // ✅ Toggle offline mode
  const toggleOffline = useCallback(() => {
    setIsOfflineMode(prev => !prev);
    return !isOfflineMode;
  }, [isOfflineMode]);

  // ✅ Get offline audio count
  const getOfflineCount = useCallback(() => {
    return offlineAudioCount;
  }, [offlineAudioCount]);

  // ✅ Get offline stats
  const getOfflineStats = useCallback(() => {
    return offlineStats;
  }, [offlineStats]);

  // ✅ Check if a specific audio exists offline (ALL sources)
  const hasOfflineAudio = useCallback((text: string, lang: LanguageCode): boolean => {
    if (!isOfflineMode) return false;
    
    const variations = [
      text.toLowerCase().replace(/\s+/g, '_'),
      text.toLowerCase().replace(/\s+/g, ''),
      text.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      text,
    ];
    
    for (const audioId of variations) {
      if (!audioId) continue;
      
      // Check offlineAudioManager (all sources)
      if (offlineAudioManager.hasAudioKey(audioId, lang)) {
        return true;
      }
      
      // Check offlineLessonEngine (dictionary + user)
      if (offlineLessonEngine.hasAudio(audioId, lang as any, 'female')) {
        return true;
      }
    }
    
    return false;
  }, [isOfflineMode]);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    isTTSFallback,
    getVoices,
    isTTSSupported,
    preload,
    getStatus,
    toggleMute,
    isMuted,
    getProvider,
    isOfflineMode,
    offlineAudioCount,
    toggleOffline,
    getOfflineCount,
    getOfflineStats,
    hasOfflineAudio,
  };
}

export default useAudio;