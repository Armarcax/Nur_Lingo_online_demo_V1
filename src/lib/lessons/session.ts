/**
 * NUR Lingo — Lesson Session Manager
 * Complete session management with exit/resume, mistake tracking, smart retry,
 * and attempt tracking for each exercise
 * 
 * Merged from v1 (stability) + v2 (advanced features)
 */

import type { MultiExercise, LangPair } from "../i18n/multilingual";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const SESSION_KEY = "nur_lesson_session_v1";
const MISTAKES_KEY = "nur_lesson_mistakes_v1";
const ATTEMPTS_KEY = "nur_lesson_attempts_v1";

const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_MAX_ATTEMPTS = 4;

// ─── SESSION TYPES ──────────────────────────────────────────────────────────

export interface LessonSession {
  lessonId: string;
  pair: LangPair;
  stepIndex: number;
  totalSteps: number;
  hayqEarned: number;
  correctCount: number;
  startedAt: number;
  updatedAt: number;
}

export interface MistakeRecord {
  exerciseId: string;
  exercise: MultiExercise;
  attempts: number;
  revealed: boolean;
  lastAttemptAt?: number;
}

export interface AttemptTracker {
  [questionId: string]: {
    attempts: number;
    maxAttempts: number;
    lastAttemptAt?: number;
  };
}

// ─── SESSION MANAGEMENT ─────────────────────────────────────────────────────

export function saveSession(s: LessonSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ 
      ...s, 
      updatedAt: Date.now() 
    }));
  } catch (error) {
    console.warn("[NUR] Failed to save session:", error);
  }
}

export function loadSession(): LessonSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    
    const s = JSON.parse(raw) as LessonSession;
    
    // Auto-expire after 24 hours
    if (Date.now() - s.updatedAt > SESSION_EXPIRY_MS) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    return s;
  } catch (error) {
    console.warn("[NUR] Failed to load session:", error);
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function updateSessionProgress(
  session: LessonSession,
  stepIndex: number,
  hayqEarned: number,
  correctCount: number
): LessonSession {
  return {
    ...session,
    stepIndex,
    hayqEarned: session.hayqEarned + hayqEarned,
    correctCount: session.correctCount + correctCount,
    updatedAt: Date.now(),
  };
}

export function isSessionActive(session: LessonSession | null): boolean {
  if (!session) return false;
  return Date.now() - session.updatedAt < SESSION_EXPIRY_MS;
}

export function getSessionProgress(session: LessonSession): number {
  if (session.totalSteps === 0) return 0;
  return Math.min(100, (session.stepIndex / session.totalSteps) * 100);
}

// ─── MISTAKE TRACKING ──────────────────────────────────────────────────────

export function logMistake(
  lessonId: string,
  ex: MultiExercise,
  attempts: number,
  revealed: boolean
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(MISTAKES_KEY);
    const all: Record<string, MistakeRecord[]> = raw ? JSON.parse(raw) : {};
    const list = all[lessonId] ?? [];
    const existing = list.findIndex((m) => m.exerciseId === ex.id);
    
    const rec: MistakeRecord = {
      exerciseId: ex.id,
      exercise: ex,
      attempts,
      revealed,
      lastAttemptAt: Date.now(),
    };
    
    if (existing >= 0) {
      list[existing] = rec;
    } else {
      list.push(rec);
    }
    
    all[lessonId] = list;
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(all));
  } catch (error) {
    console.warn("[NUR] Failed to log mistake:", error);
  }
}

export function getMistakes(lessonId: string): MistakeRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MISTAKES_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Record<string, MistakeRecord[]>;
    return all[lessonId] ?? [];
  } catch (error) {
    console.warn("[NUR] Failed to get mistakes:", error);
    return [];
  }
}

export function clearMistakes(lessonId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(MISTAKES_KEY);
    if (!raw) return;
    const all = JSON.parse(raw) as Record<string, MistakeRecord[]>;
    delete all[lessonId];
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(all));
  } catch (error) {
    console.warn("[NUR] Failed to clear mistakes:", error);
  }
}

export function clearAllMistakes(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MISTAKES_KEY);
}

export function getMistakeCount(lessonId: string): number {
  return getMistakes(lessonId).length;
}

export function getMistakeRate(lessonId: string, totalExercises: number): number {
  if (totalExercises === 0) return 0;
  return getMistakeCount(lessonId) / totalExercises;
}

// ─── SMART RETRY ────────────────────────────────────────────────────────────

export function buildRetryQueue(lessonId: string): MultiExercise[] {
  return getMistakes(lessonId).map((m) => ({
    ...m.exercise,
    id: `${m.exercise.id}_retry_${Date.now()}`,
  }));
}

export function buildRetryQueueWithPriority(lessonId: string): MultiExercise[] {
  const mistakes = getMistakes(lessonId);
  // Sort by attempts (most attempts first) and then by lastAttemptAt
  return mistakes
    .sort((a, b) => {
      if (a.attempts !== b.attempts) return b.attempts - a.attempts;
      return (a.lastAttemptAt || 0) - (b.lastAttemptAt || 0);
    })
    .map((m) => ({
      ...m.exercise,
      id: `${m.exercise.id}_retry_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    }));
}

export function hasMistakes(lessonId: string): boolean {
  return getMistakeCount(lessonId) > 0;
}

// ─── ATTEMPT TRACKING ───────────────────────────────────────────────────────

export function recordAttempt(
  tracker: AttemptTracker,
  questionId: string,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS
): { attemptsLeft: number; isFailed: boolean } {
  const current = tracker[questionId]?.attempts || 0;
  const newAttempts = current + 1;
  
  tracker[questionId] = {
    attempts: newAttempts,
    maxAttempts,
    lastAttemptAt: Date.now(),
  };
  
  const attemptsLeft = maxAttempts - newAttempts;
  const isFailed = newAttempts >= maxAttempts;
  
  return { attemptsLeft, isFailed };
}

export function resetAttempts(tracker: AttemptTracker, questionId: string): void {
  delete tracker[questionId];
}

export function resetAllAttempts(tracker: AttemptTracker): void {
  Object.keys(tracker).forEach((key) => delete tracker[key]);
}

export function getAttemptCount(tracker: AttemptTracker, questionId: string): number {
  return tracker[questionId]?.attempts || 0;
}

export function getAttemptsLeft(tracker: AttemptTracker, questionId: string): number {
  const record = tracker[questionId];
  if (!record) return DEFAULT_MAX_ATTEMPTS;
  return Math.max(0, record.maxAttempts - record.attempts);
}

export function isQuestionFailed(tracker: AttemptTracker, questionId: string): boolean {
  const record = tracker[questionId];
  if (!record) return false;
  return record.attempts >= record.maxAttempts;
}

// ─── SAVE/LOAD ATTEMPT TRACKER ─────────────────────────────────────────────

export function saveAttemptTracker(tracker: AttemptTracker): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(tracker));
  } catch (error) {
    console.warn("[NUR] Failed to save attempt tracker:", error);
  }
}

export function loadAttemptTracker(): AttemptTracker | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AttemptTracker;
  } catch (error) {
    console.warn("[NUR] Failed to load attempt tracker:", error);
    return null;
  }
}

export function clearAttemptTracker(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ATTEMPTS_KEY);
}

// ─── COMPOSITE HELPERS ──────────────────────────────────────────────────────

export interface SessionSummary {
  lessonId: string;
  totalExercises: number;
  completed: number;
  progress: number;
  hayqEarned: number;
  correctCount: number;
  mistakes: number;
  attempts: number;
}

export function getSessionSummary(
  session: LessonSession | null,
  lessonId: string,
  totalExercises: number
): SessionSummary {
  if (!session) {
    return {
      lessonId,
      totalExercises,
      completed: 0,
      progress: 0,
      hayqEarned: 0,
      correctCount: 0,
      mistakes: getMistakeCount(lessonId),
      attempts: 0,
    };
  }

  const mistakes = getMistakeCount(lessonId);

  return {
    lessonId,
    totalExercises,
    completed: session.stepIndex,
    progress: getSessionProgress(session),
    hayqEarned: session.hayqEarned,
    correctCount: session.correctCount,
    mistakes,
    attempts: session.stepIndex, // each step is an attempt
  };
}

// ─── CLEANUP ────────────────────────────────────────────────────────────────

export function clearAllSessionData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(MISTAKES_KEY);
  localStorage.removeItem(ATTEMPTS_KEY);
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────

export default {
  // Session
  saveSession,
  loadSession,
  clearSession,
  updateSessionProgress,
  isSessionActive,
  getSessionProgress,
  
  // Mistakes
  logMistake,
  getMistakes,
  clearMistakes,
  clearAllMistakes,
  getMistakeCount,
  getMistakeRate,
  
  // Retry
  buildRetryQueue,
  buildRetryQueueWithPriority,
  hasMistakes,
  
  // Attempts
  recordAttempt,
  resetAttempts,
  resetAllAttempts,
  getAttemptCount,
  getAttemptsLeft,
  isQuestionFailed,
  
  // Attempt storage
  saveAttemptTracker,
  loadAttemptTracker,
  clearAttemptTracker,
  
  // Composite
  getSessionSummary,
  clearAllSessionData,
};