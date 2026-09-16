"use client";

import { useState, useCallback } from 'react';

export function useCanonicalOfflineAudio() {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCount, setAudioCount] = useState(0);
  const [manifestLoaded, setManifestLoaded] = useState(true);

  const playAudio = useCallback(async (id: string, lang?: string) => {
    console.warn('Offline audio is disabled');
    return false;
  }, []);

  const stopAudio = useCallback(() => {
    console.warn('Offline audio is disabled');
  }, []);

  const toggleOfflineMode = useCallback(() => {
    console.warn('Offline mode is disabled');
  }, []);

  const getVoice = useCallback((lang: string) => 'female', []);
  const setVoice = useCallback((lang: string, gender: string) => {}, []);
  const hasAudio = useCallback((id: string, lang?: string) => false, []);

  return {
    isOfflineMode,
    isPlaying,
    audioCount,
    manifestLoaded,
    playAudio,
    stopAudio,
    toggleOfflineMode,
    getVoice,
    setVoice,
    hasAudio,
  };
}
