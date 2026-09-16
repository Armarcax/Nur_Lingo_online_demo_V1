// src/lib/hooks/useOfflineAudio.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { offlineLessonEngine } from '@/lib/offline/OfflineLessonEngine';
import { offlineAudioManager } from '@/lib/offline/OfflineAudioManager';
import { useI18n } from "@/hooks/useI18n";

// ─── TYPES ────────────────────────────────────────────────────────────

export type Language = 'hy' | 'en' | 'ru';
export type Gender = 'male' | 'female';

export interface ExerciseState {
  id: string;
  type: 'listen-and-speak' | 'listen-and-select' | 'listen-and-repeat' | 'multiple-choice' | 'translate';
  question: string;
  questionArmenian: string;
  audioId: string;
  options?: string[];
  correctAnswer: string;
  isPlaying: boolean;
  isAnswered: boolean;
  selectedAnswer?: string;
  translations?: { hy: string; en: string; ru: string };
}

export interface ExerciseResult {
  isCorrect: boolean;
  audioPlayed: boolean;
  score: number;
  feedback: string;
}

// ─── HOOK ─────────────────────────────────────────────────────────────

export function useOfflineAudio() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<ExerciseState | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);

  // ─── INIT ───────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      try {
        await offlineLessonEngine.init();
        await offlineAudioManager.init();
        setIsAvailable(offlineLessonEngine.isAvailable() || offlineAudioManager.isAvailable());
        setStats(offlineLessonEngine.getStats());
        setProgress(offlineLessonEngine.getProgress());
      } catch (error) {
        console.error('❌ Failed to initialize useOfflineAudio:', error);
      } finally {
        setLoading(false);
      }
    };
    init();

    return () => {
      // Cleanup
    };
  }, []);

  // ─── LESSONS ──────────────────────────────────────────────────────

  const loadLesson = useCallback((lessonId: string) => {
    const lessonData = offlineLessonEngine.getLesson(lessonId);
    setLesson(lessonData);
    return lessonData;
  }, []);

  const getLessons = useCallback((worldId?: string) => {
    return offlineLessonEngine.getLessons(worldId);
  }, []);

  const getWorlds = useCallback(() => {
    return offlineLessonEngine.getWorlds();
  }, []);

  const getVocabulary = useCallback((lessonId: string) => {
    return offlineLessonEngine.getVocabularyForLesson(lessonId);
  }, []);

  // ─── EXERCISES ────────────────────────────────────────────────────

  // ✅ FIX: Use getExercisesForLesson instead of getLessonExercises
  const getExercises = useCallback((lessonId: string) => {
    return offlineLessonEngine.getExercisesForLesson(lessonId);
  }, []);

  const startExercise = useCallback(async (exercise: ExerciseState) => {
    setCurrentExercise(exercise);
    const lang = 'hy';
    await offlineAudioManager.play(exercise.audioId, lang);
  }, []);

  const answerExercise = useCallback(
    async (exercise: ExerciseState, answer: string) => {
      const isCorrect = answer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();
      return {
        isCorrect,
        audioPlayed: false,
        score: isCorrect ? 1 : 0,
        feedback: isCorrect ? '✅ Ճիշտ է!' : '❌ Սխալ է։',
      };
    },
    []
  );

  // ─── AUDIO ──────────────────────────────────────────────────────────

  const playAudio = useCallback((entryId: string, language?: Language, gender?: Gender) => {
    const lang = language || 'hy';
    return offlineAudioManager.play(entryId, lang);
  }, []);

  const stopAudio = useCallback(() => {
    offlineAudioManager.stop();
  }, []);

  const hasAudio = useCallback((entryId: string, language?: Language, gender?: Gender) => {
    const lang = language || 'hy';
    return offlineAudioManager.hasAudioKey(entryId, lang);
  }, []);

  // ─── PROGRESS ──────────────────────────────────────────────────────

  const completeLesson = useCallback((lessonId: string, score: number) => {
    offlineLessonEngine.completeLesson(lessonId, score);
    setStats(offlineLessonEngine.getStats());
    setProgress(offlineLessonEngine.getProgress());
  }, []);

  const getProgress = useCallback(() => {
    return offlineLessonEngine.getProgress();
  }, []);

  const getStats = useCallback(() => {
    return offlineLessonEngine.getStats();
  }, []);

  // ─── PREFERENCES ──────────────────────────────────────────────────

  const getPreferredLanguage = useCallback(() => {
    return 'hy';
  }, []);

  const setPreferredLanguage = useCallback((language: Language) => {
    // Not implemented
  }, []);

  const getPreferredVoice = useCallback(() => {
    return 'female';
  }, []);

  const setPreferredVoice = useCallback((voice: string) => {
    // Not implemented
  }, []);

  const getPreferredGender = useCallback((language: Language) => {
    return 'female';
  }, []);

  const setPreferredGender = useCallback((language: Language, gender: Gender) => {
    // Not implemented
  }, []);

  // ─── MANIFEST ──────────────────────────────────────────────────────

  const getManifest = useCallback((language: Language) => {
    return offlineAudioManager.getLessonManifests?.()?.[language] || null;
  }, []);

  const getMapping = useCallback((language: Language) => {
    return offlineAudioManager.getCombinedMapping?.() || {};
  }, []);

  const getDictionaryManifest = useCallback(() => {
    return offlineAudioManager.getDictionaryManifest?.() || null;
  }, []);

  const getUserManifest = useCallback(() => {
    return offlineAudioManager.getUserManifest?.() || null;
  }, []);

  const getCombinedMapping = useCallback(() => {
    return offlineAudioManager.getCombinedMapping?.() || {};
  }, []);

  // ─── RETURN ───────────────────────────────────────────────────────

  return {
    loading,
    isAvailable,
    lesson,
    currentExercise,
    stats,
    progress,
    loadLesson,
    getLessons,
    getWorlds,
    getVocabulary,
    getExercises,
    startExercise,
    answerExercise,
    playAudio,
    stopAudio,
    hasAudio,
    completeLesson,
    getProgress,
    getStats,
    getPreferredLanguage,
    setPreferredLanguage,
    getPreferredVoice,
    setPreferredVoice,
    getPreferredGender,
    setPreferredGender,
    getManifest,
    getMapping,
    getDictionaryManifest,
    getUserManifest,
    getCombinedMapping,
  };
}