// src/lib/hooks/useOfflineManagers.ts
'use client';

import { useEffect, useState } from 'react';
import { useI18n } from "@/hooks/useI18n";

export function useOfflineManagers() {
  const { t } = useI18n();
  const [managers, setManagers] = useState<{
    audioManager: any;
    lessonEngine: any;
    isReady: boolean;
  }>({
    audioManager: null,
    lessonEngine: null,
    isReady: false,
  });

  useEffect(() => {
    let mounted = true;

    async function initManagers() {
      try {
        const { offlineAudioManager } = await import('@/lib/offline/OfflineAudioManager');
        const { offlineLessonEngine } = await import('@/lib/offline/OfflineLessonEngine');

        if (mounted) {
          setManagers({
            audioManager: offlineAudioManager,
            lessonEngine: offlineLessonEngine,
            isReady: true,
          });
        }
      } catch (error) {
        console.error('Failed to load offline managers:', error);
      }
    }

    initManagers();

    return () => {
      mounted = false;
    };
  }, []);

  return managers;
}