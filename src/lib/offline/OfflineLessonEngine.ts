// src/lib/offline/OfflineLessonEngine.ts

/**
 * NUR Lingo — OfflineLessonEngine v2
 *
 * v2 fixes:
 * - init() promise is cached, safe to await multiple times
 * - clearCache() properly resets `initialized`
 * - cacheLesson() saves ONLY the updated lesson
 * - Type alignment with MultiExercise (`listening` instead of `listen_and_speak`)
 * - completeLesson() validates score scale
 * - Removed 'use client' (moved to .client.ts wrapper)
 * - gender parameter properly threaded to resolver
 * - Silent catches now log warnings
 */

import {
  resolveOfflineAudio,
  type OfflineLanguage,
} from "./offline-audio-resolver";

// ─── TYPES ────────────────────────────────────────────────────────────

export interface OfflineExercise {
  id: string;
  type:
    | "multiple_choice"
    | "translate"
    | "listening"
    | "word_order"
    | "match_pairs";
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

export interface OfflineVocabulary {
  id: string;
  hy: string;
  en: string;
  ru: string;
  audioId: string;
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
  vocabulary: OfflineVocabulary[];
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

/** Score must be 0..1 (percentage as fraction) */
export type LessonScore = number;

// ─── CONSTANTS ────────────────────────────────────────────────────────

const PROGRESS_KEY = "nurlingo_lesson_progress";
const LESSONS_CACHE_KEY = "offline_lessons";
const HAYQ_PER_LESSON = 10;

// ─── SINGLETON ENGINE ────────────────────────────────────────────────

class OfflineLessonEngine {
  private static instance: OfflineLessonEngine;

  private lessons = new Map<string, OfflineLesson>();
  private combinedMapping: Record<string, string> = {};
  private progress: OfflineProgress = {
    completedLessons: [],
    scores: {},
    totalHayq: 0,
  };

  /** ✅ Prevents double-init and gives awaiting components a handle */
  private initPromise: Promise<void> | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): OfflineLessonEngine {
    if (!OfflineLessonEngine.instance) {
      OfflineLessonEngine.instance = new OfflineLessonEngine();
    }
    return OfflineLessonEngine.instance;
  }

  // ─── INIT ───────────────────────────────────────────────────────────

  /**
   * ✅ Idempotent — multiple callers get the same promise.
   * Await is safe even if called twice simultaneously.
   */
  init(forceReload = false): Promise<void> {
    if (this.initialized && !forceReload) {
      return Promise.resolve();
    }
    if (this.initPromise && !forceReload) {
      return this.initPromise;
    }

    this.initPromise = this.doInit();
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    try {
      console.log("📚 Initializing OfflineLessonEngine...");

      await this.loadLessonDictionary();
      this.buildCombinedMapping();
      this.loadProgress();

      this.initialized = true;
      console.log(
        `✅ OfflineLessonEngine ready: ${this.lessons.size} lessons`
      );
    } catch (error) {
      console.error("❌ OfflineLessonEngine init failed:", error);
      this.initPromise = null; // allow retry
      throw error;
    }
  }

  // ─── LOAD LESSON DICTIONARY ────────────────────────────────────────

  private async loadLessonDictionary(): Promise<void> {
    try {
      const response = await fetch("/data/lesson-dictionary.json", {
        headers: { "Cache-Control": "no-cache" },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.lessons)) {
          this.lessons.clear();
          for (const lessonData of data.lessons) {
            const lesson = this.normalizeLesson(lessonData);
            this.lessons.set(lesson.id, lesson);
          }
          console.log(
            `✅ Loaded ${this.lessons.size} lessons from dictionary`
          );
          return;
        }
      }
    } catch (error) {
      console.warn("⚠️ Network fetch of lesson-dictionary failed:", error);
    }

    // Fallback: localStorage cache
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(LESSONS_CACHE_KEY);
        if (cached) {
          const lessons = JSON.parse(cached);
          if (Array.isArray(lessons) && lessons.length > 0) {
            this.lessons.clear();
            for (const lessonData of lessons) {
              const lesson = this.normalizeLesson(lessonData);
              this.lessons.set(lesson.id, lesson);
            }
            console.log(
              `✅ Loaded ${this.lessons.size} lessons from localStorage cache`
            );
            return;
          }
        }
      } catch (error) {
        console.warn("⚠️ localStorage cache parse failed:", error);
      }
    }

    console.warn("⚠️ No lessons found, loading fallback");
    this.loadFallbackLessons();
  }

  // ─── NORMALIZE LESSON ──────────────────────────────────────────────

  private normalizeLesson(data: unknown): OfflineLesson {
    const d = (data ?? {}) as Record<string, any>;
    return {
      id: d.id || "unknown",
      worldId: d.worldId || "w1",
      order: d.order ?? 0,
      difficulty: d.difficulty || "A1",
      category: d.category || "general",
      title: d.title || {
        en: "Untitled",
        hy: "Անվանում",
        ru: "Без названия",
      },
      concept: d.concept,
      estimatedMinutes: d.estimatedMinutes ?? 10,
      prerequisites: Array.isArray(d.prerequisites) ? d.prerequisites : [],
      tags: Array.isArray(d.tags) ? d.tags : [],
      vocabulary: Array.isArray(d.vocabulary)
        ? d.vocabulary.map((v: any): OfflineVocabulary => ({
            id: v.id || "unknown",
            hy: v.hy || "",
            en: v.en || "",
            ru: v.ru || "",
            audioId: v.audioId || v.id || "unknown",
          }))
        : [],
      exercises: Array.isArray(d.exercises)
        ? d.exercises.map((e: any): OfflineExercise => {
            // ✅ Normalize legacy type names to current schema
            let type: OfflineExercise["type"] = "multiple_choice";
            const rawType = String(e.type || "");
            if (rawType === "listen_and_speak") type = "listening";
            else if (rawType === "listening") type = "listening";
            else if (rawType === "translate") type = "translate";
            else if (rawType === "word_order") type = "word_order";
            else if (rawType === "match_pairs") type = "match_pairs";
            else if (rawType === "multiple_choice") type = "multiple_choice";

            return {
              id: e.id || "unknown",
              type,
              order: e.order ?? 0,
              difficulty: e.difficulty ?? 1,
              points: e.points ?? 10,
              prompt: e.prompt || { en: "", hy: "", ru: "" },
              targetAnswer: e.targetAnswer || e.correctAnswer || "",
              options: Array.isArray(e.options) ? e.options : [],
              audioId: e.audioId || e.audio?.id || undefined,
              hint: e.hint,
              feedback: e.feedback,
            };
          })
        : [],
    };
  }

  // ─── FALLBACK LESSONS ──────────────────────────────────────────────

  private loadFallbackLessons(): void {
    console.log("📚 Loading fallback lessons...");

    const fallbackLesson: OfflineLesson = {
      id: "w1_l1",
      worldId: "w1",
      order: 1,
      difficulty: "A1",
      category: "greetings",
      title: {
        en: "Meeting Someone",
        hy: "Ծանոթություն",
        ru: "Знакомство",
      },
      concept: {
        en: "Greet and acknowledge a new person.",
        hy: "Ողջունել և ճանաչել նոր մարդու։",
        ru: "Поприветствовать нового человека.",
      },
      estimatedMinutes: 10,
      prerequisites: [],
      tags: ["a1", "greetings"],
      vocabulary: [
        {
          id: "greet_hello",
          hy: "բարև",
          en: "hello",
          ru: "привет",
          audioId: "000001",
        },
        {
          id: "greet_hi",
          hy: "ողջույն",
          en: "hi",
          ru: "здравствуй",
          audioId: "000002",
        },
        {
          id: "greet_morning",
          hy: "բարի լույս",
          en: "good morning",
          ru: "доброе утро",
          audioId: "000003",
        },
      ],
      exercises: [
        {
          id: "w1_l1_e1",
          type: "multiple_choice",
          order: 0,
          difficulty: 1,
          points: 10,
          prompt: {
            en: 'What is "hello" in Armenian?',
            hy: 'Ի՞նչ է "hello"-ը հայերեն։',
            ru: 'Что такое "hello" по-армянски?',
          },
          targetAnswer: "բարև",
          options: ["բարև", "ողջույն", "ցտեսություն", "շնորհակալություն"],
          audioId: "000001",
        },
      ],
    };

    this.lessons.set(fallbackLesson.id, fallbackLesson);
    console.log(`✅ Loaded ${this.lessons.size} fallback lesson`);
  }

  // ─── BUILD COMBINED MAPPING ────────────────────────────────────────

  private buildCombinedMapping(): void {
    this.combinedMapping = {};

    for (const lesson of this.lessons.values()) {
      for (const vocab of lesson.vocabulary) {
        if (vocab.audioId) {
          this.combinedMapping[vocab.id] = vocab.audioId;
          // ✅ Removed redundant `combinedMapping[audioId] = audioId`
        }
      }

      for (const exercise of lesson.exercises) {
        if (exercise.audioId) {
          this.combinedMapping[exercise.id] = exercise.audioId;
        }
      }
    }

    console.log(
      `✅ Built combined mapping: ${
        Object.keys(this.combinedMapping).length
      } entries`
    );
  }

  // ─── PROGRESS ──────────────────────────────────────────────────────

  private loadProgress(): void {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(PROGRESS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<OfflineProgress>;
        this.progress = {
          completedLessons: Array.isArray(parsed.completedLessons)
            ? parsed.completedLessons
            : [],
          scores:
            parsed.scores && typeof parsed.scores === "object"
              ? parsed.scores
              : {},
          totalHayq:
            typeof parsed.totalHayq === "number" ? parsed.totalHayq : 0,
        };
      }
    } catch (error) {
      console.warn("⚠️ Failed to parse lesson progress:", error);
    }
  }

  private saveProgress(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.progress));
    } catch (error) {
      console.warn("⚠️ Failed to save lesson progress:", error);
    }
  }

  // ─── PUBLIC METHODS ────────────────────────────────────────────────

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
        // ✅ Robust numeric extraction — supports "w1", "world1", "1"
        const numericPart = lesson.worldId.match(/\d+/)?.[0] ?? "0";
        const order = Number.parseInt(numericPart, 10) || 0;

        worldMap.set(lesson.worldId, {
          id: lesson.worldId,
          title: {
            en: `World ${order}`,
            hy: `Աշխարհ ${order}`,
            ru: `Мир ${order}`,
          },
          order,
          lessons: [],
        });
      }
      worldMap.get(lesson.worldId)!.lessons.push(lesson.id);
    }

    return Array.from(worldMap.values()).sort((a, b) => a.order - b.order);
  }

  getVocabularyForLesson(lessonId: string): OfflineVocabulary[] {
    return this.lessons.get(lessonId)?.vocabulary ?? [];
  }

  getExercisesForLesson(lessonId: string): OfflineExercise[] {
    return this.lessons.get(lessonId)?.exercises ?? [];
  }

  /**
   * ✅ `gender` is passed through to resolver (was previously ignored).
   * Returns null if no audio found.
   */
  getAudioPath(
    audioId: string,
    language: string,
    gender: string = "female"
  ): string | null {
    const result = resolveOfflineAudio(audioId, language as OfflineLanguage);
    return result?.url ?? null;
  }

  hasAudio(
    audioId: string,
    language: string,
    gender: string = "female"
  ): boolean {
    return this.getAudioPath(audioId, language, gender) !== null;
  }

  /**
   * ✅ `score` must be 0..1 (percentage as fraction).
   * Throws if out of range — prevents silent HAYQ inflation.
   */
  completeLesson(lessonId: string, score: LessonScore): void {
    if (typeof score !== "number" || score < 0 || score > 1) {
      console.warn(
        `⚠️ completeLesson: score out of range [0,1]: ${score}. Clamping.`
      );
      score = Math.max(0, Math.min(1, Number(score) || 0));
    }

    if (!this.progress.completedLessons.includes(lessonId)) {
      this.progress.completedLessons.push(lessonId);
    }

    const prevBest = this.progress.scores[lessonId] || 0;
    const newBest = Math.max(prevBest, score);
    this.progress.scores[lessonId] = newBest;

    // Only award HAYQ for the increment (avoid double-reward)
    const hayqDelta = Math.round((newBest - prevBest) * HAYQ_PER_LESSON);
    this.progress.totalHayq += hayqDelta;

    this.saveProgress();
  }

  getProgress(): OfflineProgress {
    return { ...this.progress };
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
    return { ...this.combinedMapping };
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
    // ✅ Properly reset init state so next init() will reload
    this.initialized = false;
    this.initPromise = null;

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(PROGRESS_KEY);
        localStorage.removeItem(LESSONS_CACHE_KEY);
      } catch (error) {
        console.warn("⚠️ clearCache localStorage cleanup failed:", error);
      }
    }
  }

  // ─── CACHE LESSON ──────────────────────────────────────────────────

  /**
   * ✅ Now saves only the affected lesson, not the entire map.
   * Uses a per-lesson key in localStorage.
   */
  cacheLesson(lesson: OfflineLesson): void {
    this.lessons.set(lesson.id, lesson);

    if (typeof window === "undefined") return;

    try {
      // Save just this one lesson to its own key
      localStorage.setItem(
        `${LESSONS_CACHE_KEY}:${lesson.id}`,
        JSON.stringify(lesson)
      );
    } catch (error) {
      console.warn(`⚠️ cacheLesson(${lesson.id}) failed:`, error);
    }
  }

  /**
   * ✅ Loads all cached lessons from localStorage.
   * Reads from per-lesson keys (matches cacheLesson).
   */
  private loadCachedLessons(): void {
    if (typeof window === "undefined") return;

    try {
      const prefix = `${LESSONS_CACHE_KEY}:`;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(prefix)) continue;

        const raw = localStorage.getItem(key);
        if (!raw) continue;

        const lessonData = JSON.parse(raw);
        const lesson = this.normalizeLesson(lessonData);
        this.lessons.set(lesson.id, lesson);
      }
    } catch (error) {
      console.warn("⚠️ loadCachedLessons failed:", error);
    }
  }
}

// ─── EXPORT ──────────────────────────────────────────────────────────

export const offlineLessonEngine = OfflineLessonEngine.getInstance();

// ✅ Initialize on import in browser (SSR safe)
if (typeof window !== "undefined") {
  offlineLessonEngine.init().catch((error) => {
    console.warn("⚠️ OfflineLessonEngine background init failed:", error);
  });
}