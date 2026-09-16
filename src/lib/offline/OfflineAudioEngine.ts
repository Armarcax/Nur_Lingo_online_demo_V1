// src/lib/offline/OfflineLessonEngine.ts

"use client";

import {
  registerExerciseAudio,
  resolveOfflineAudio,
  type OfflineLanguage,
} from './offline-audio-resolver';

// ─── TYPES ────────────────────────────────────────────────────────────

export interface OfflineExercise {
  id: string;
  type: 'multiple_choice' | 'translate' | 'listen_and_speak' | 'word_order' | 'match_pairs';
  order: number;
  difficulty: number;
  points: number;
  prompt: Record<string, string>;
  targetAnswer: string;
  options?: string[];
  audioId?: string;
  hint?: Record<string, string>;
  feedback?: {
    correct: Record<string, string>;
    incorrect: Record<string, string>;
  };
}

export interface OfflineLesson {
  id: string;
  worldId: string;
  order: number;
  difficulty: string;
  category: string;
  title: Record<string, string>;
  concept?: Record<string, string>;
  estimatedMinutes: number;
  prerequisites: string[];
  tags: string[];
  vocabulary: Array<{
    id: string;
    hy: string;
    en: string;
    ru: string;
    audioId: string;
  }>;
  exercises: OfflineExercise[];
}

export interface OfflineWorld {
  id: string;
  title: Record<string, string>;
  description?: Record<string, string>;
  order: number;
  lessons: string[];
}

export interface OfflineProgress {
  completedLessons: string[];
  scores: Record<string, number>;
  totalHayq: number;
}

// ─── MAIN ENGINE ──────────────────────────────────────────────────────

class OfflineLessonEngine {
  private static instance: OfflineLessonEngine;
  private initialized = false;
  private lessons: Map<string, OfflineLesson> = new Map();
  private worlds: Map<string, OfflineWorld> = new Map();
  private combinedMapping: Record<string, string> = {};
  private progress: OfflineProgress = {
    completedLessons: [],
    scores: {},
    totalHayq: 0,
  };

  private constructor() {}

  static getInstance(): OfflineLessonEngine {
    if (!OfflineLessonEngine.instance) {
      OfflineLessonEngine.instance = new OfflineLessonEngine();
    }
    return OfflineLessonEngine.instance;
  }

  async init(forceReload = false): Promise<void> {
    if (this.initialized && !forceReload) return;

    try {
      console.log('📚 Initializing OfflineLessonEngine...');
      await this.loadLessonDictionary();
      this.buildCombinedMapping();
      this.loadProgress();
      this.initialized = true;
      console.log(`✅ OfflineLessonEngine ready: ${this.lessons.size} lessons, ${Object.keys(this.combinedMapping).length} audio entries`);
    } catch (error) {
      console.error('❌ OfflineLessonEngine init failed:', error);
      throw error;
    }
  }

  private async loadLessonDictionary(): Promise<void> {
    try {
      const response = await fetch('/data/lesson-dictionary.json', {
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.lessons && Array.isArray(data.lessons)) {
          for (const lessonData of data.lessons) {
            const lesson = this.normalizeLesson(lessonData);
            this.lessons.set(lesson.id, lesson);
          }
          console.log(`✅ Loaded ${this.lessons.size} lessons from dictionary`);
        } else {
          console.warn('⚠️ No lessons found in dictionary');
          this.loadFallbackLessons();
        }
      } else {
        console.warn('⚠️ Failed to load lesson dictionary, using fallback');
        this.loadFallbackLessons();
      }
    } catch (error) {
      console.warn('⚠️ Error loading lesson dictionary:', error);
      this.loadFallbackLessons();
    }
  }

  private normalizeLesson(data: any): OfflineLesson {
    return {
      id: data.id || 'unknown',
      worldId: data.worldId || 'w1',
      order: data.order || 0,
      difficulty: data.difficulty || 'A1',
      category: data.category || 'general',
      title: data.title || { en: 'Untitled', hy: 'Անվանում', ru: 'Без названия' },
      concept: data.concept,
      estimatedMinutes: data.estimatedMinutes || 10,
      prerequisites: data.prerequisites || [],
      tags: data.tags || [],
      vocabulary: (data.vocabulary || []).map((v: any) => ({
        id: v.id || 'unknown',
        hy: v.hy || '',
        en: v.en || '',
        ru: v.ru || '',
        audioId: v.audioId || v.id || 'unknown',
      })),
      exercises: (data.exercises || []).map((e: any) => ({
        id: e.id || 'unknown',
        type: e.type || 'multiple_choice',
        order: e.order || 0,
        difficulty: e.difficulty || 1,
        points: e.points || 10,
        prompt: e.prompt || { en: '', hy: '', ru: '' },
        targetAnswer: e.targetAnswer || e.correctAnswer || '',
        options: e.options || [],
        audioId: e.audio?.id || e.audioId,
        hint: e.hint,
        feedback: e.feedback,
      })),
    };
  }

  private loadFallbackLessons(): void {
    console.log('📚 Loading fallback lessons...');

    const fallbackLesson: OfflineLesson = {
      id: 'w1_l1',
      worldId: 'w1',
      order: 1,
      difficulty: 'A1',
      category: 'greetings',
      title: {
        en: 'Meeting Someone',
        hy: 'Ծանոթություն',
        ru: 'Знакомство',
      },
      concept: {
        en: 'Greet and acknowledge a new person.',
        hy: 'Ողջունել և ճանաչել նոր մարդու։',
        ru: 'Поприветствовать нового человека.',
      },
      estimatedMinutes: 10,
      prerequisites: [],
      tags: ['a1', 'greetings'],
      vocabulary: [
        { id: 'greet_hello', hy: 'բարև', en: 'hello', ru: 'привет', audioId: '000001' },
        { id: 'greet_hi', hy: 'ողջույն', en: 'hi', ru: 'здравствуй', audioId: '000002' },
        { id: 'greet_morning', hy: 'բարի լույս', en: 'good morning', ru: 'доброе утро', audioId: '000003' },
      ],
      exercises: [
        {
          id: 'w1_l1_e1',
          type: 'multiple_choice',
          order: 0,
          difficulty: 1,
          points: 10,
          prompt: {
            en: 'What is "hello" in Armenian?',
            hy: 'Ի՞նչ է "hello"-ը հայերեն։',
            ru: 'Что такое "hello" по-армянски?',
          },
          targetAnswer: 'բարև',
          options: ['բարև', 'ողջույն', 'ցտեսություն', 'շնորհակալություն'],
          audioId: '000001',
        },
      ],
    };

    this.lessons.set(fallbackLesson.id, fallbackLesson);
    console.log(`✅ Loaded ${this.lessons.size} fallback lesson`);
  }

  private buildCombinedMapping(): void {
    this.combinedMapping = {};

    for (const [id, lesson] of this.lessons) {
      if (lesson.vocabulary && Array.isArray(lesson.vocabulary)) {
        for (const vocab of lesson.vocabulary) {
          if (vocab && vocab.audioId) {
            this.combinedMapping[vocab.id] = vocab.audioId;
            this.combinedMapping[vocab.audioId] = vocab.audioId;
          }
        }
      }

      if (lesson.exercises && Array.isArray(lesson.exercises)) {
        for (const exercise of lesson.exercises) {
          if (exercise) {
            if (exercise.audioId) {
              this.combinedMapping[exercise.id] = exercise.audioId;
              this.combinedMapping[exercise.audioId] = exercise.audioId;
              registerExerciseAudio(exercise.id, exercise.audioId);
            }
          }
        }
      }
    }

    console.log(`✅ Built combined mapping: ${Object.keys(this.combinedMapping).length} entries`);
  }

  private loadProgress(): void {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nurlingo_lesson_progress');
        if (saved) {
          this.progress = JSON.parse(saved);
        }
      } catch (e) {}
    }
  }

  private saveProgress(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nurlingo_lesson_progress', JSON.stringify(this.progress));
      } catch (e) {}
    }
  }

  getLesson(lessonId: string): OfflineLesson | undefined {
    return this.lessons.get(lessonId);
  }

  getLessons(worldId?: string): OfflineLesson[] {
    const result: OfflineLesson[] = [];
    for (const lesson of this.lessons.values()) {
      if (worldId && lesson.worldId !== worldId) continue;
      result.push(lesson);
    }
    return result.sort((a, b) => a.order - b.order);
  }

  getWorlds(): OfflineWorld[] {
    const worldMap = new Map<string, OfflineWorld>();

    for (const lesson of this.lessons.values()) {
      if (!worldMap.has(lesson.worldId)) {
        worldMap.set(lesson.worldId, {
          id: lesson.worldId,
          title: {
            en: `World ${lesson.worldId.replace('w', '')}`,
            hy: `Աշխարհ ${lesson.worldId.replace('w', '')}`,
            ru: `Мир ${lesson.worldId.replace('w', '')}`,
          },
          order: parseInt(lesson.worldId.replace('w', '')) || 0,
          lessons: [],
        });
      }
      worldMap.get(lesson.worldId)?.lessons.push(lesson.id);
    }

    return Array.from(worldMap.values()).sort((a, b) => a.order - b.order);
  }

  getVocabularyForLesson(lessonId: string): OfflineLesson['vocabulary'] {
    const lesson = this.lessons.get(lessonId);
    return lesson?.vocabulary || [];
  }

  getExercisesForLesson(lessonId: string): OfflineExercise[] {
    const lesson = this.lessons.get(lessonId);
    return lesson?.exercises || [];
  }

  getAudioPath(audioId: string, language: string, gender: string): string | null {
    return resolveOfflineAudio(audioId, language as OfflineLanguage)?.url || null;
  }

  hasAudio(audioId: string, language: string, gender: string): boolean {
    return this.getAudioPath(audioId, language, gender) !== null;
  }

  completeLesson(lessonId: string, score: number): void {
    if (!this.progress.completedLessons.includes(lessonId)) {
      this.progress.completedLessons.push(lessonId);
    }
    this.progress.scores[lessonId] = Math.max(this.progress.scores[lessonId] || 0, score);
    this.progress.totalHayq += score * 10;
    this.saveProgress();
  }

  getProgress(): OfflineProgress {
    return this.progress;
  }

  getStats(): {
    totalLessons: number;
    completed: number;
    progress: number;
    audioEntries: number;
    worlds: number;
  } {
    const total = this.lessons.size;
    const completed = this.progress.completedLessons.length;
    return {
      totalLessons: total,
      completed,
      progress: total > 0 ? (completed / total) * 100 : 0,
      audioEntries: Object.keys(this.combinedMapping).length,
      worlds: this.getWorlds().length,
    };
  }

  getCombinedMapping(): Record<string, string> {
    return this.combinedMapping;
  }

  isAvailable(): boolean {
    return this.initialized && this.lessons.size > 0;
  }

  clearCache(): void {
    this.combinedMapping = {};
    this.progress = {
      completedLessons: [],
      scores: {},
      totalHayq: 0,
    };
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nurlingo_lesson_progress');
    }
  }
}

export const offlineLessonEngine = OfflineLessonEngine.getInstance();

if (typeof window !== 'undefined') {
  offlineLessonEngine.init().catch(() => {});
}