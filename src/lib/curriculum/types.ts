// src/lib/curriculum/types.ts

import type { LangPair, MultiExercise } from "../i18n/multilingual";

export type LangCode = "en" | "hy" | "ru";

export interface MultiText {
  en: string;
  hy: string;
  ru: string;
}

export interface VocabularyEntry {
  id: string;
  word: MultiText;
  hint?: MultiText;
  image?: string;
  audio?: string;
}

export interface PhraseEntry {
  id: string;
  text: MultiText;
  context?: string;
}

export interface DialogueTurn {
  speaker: "nuri" | "user";
  text: MultiText;
  expectedReplyHints?: MultiText;
}

export interface DialogueScenario {
  id: string;
  title: MultiText;
  scenario: "restaurant" | "airport" | "hotel" | "interview" | "shopping" | "doctor" | "everyday";
  turns: DialogueTurn[];
  hayqReward: number;
}

export type LessonPhase = "learn" | "practice" | "review" | "challenge" | "dialogue" | "assessment";

export interface LessonContent {
  id: string;
  moduleId: string;
  order: number;
  title: MultiText;
  description?: MultiText;
  estimatedMinutes: number;
  vocabulary: VocabularyEntry[];
  phrases: PhraseEntry[];
  exercises: MultiExercise[];
  dialogues: DialogueScenario[];
  rewards: { baseHAYQ: number; perfectBonus: number };
}

export interface ModuleContent {
  id: string;
  courseId: string;
  order: number;
  title: MultiText;
  description: MultiText;
  icon: string;
  lessons: LessonContent[];
}

export interface CourseContent {
  id: string;
  pair: LangPair;
  title: MultiText;
  modules: ModuleContent[];
}

export interface TopicSpec {
  id: string;
  title: MultiText;
  icon: string;
  words: string[];
  phrases?: PhraseEntry[];
  dialogues?: DialogueScenario[];
}

// ─── NUR Lingo Compatibility ────────────────────────────────────────

/**
 * Convert MultiText to Record for compatibility with NUR Lingo
 */
export function multiTextToRecord(mt: MultiText): Record<LangCode, string> {
  return { en: mt.en, hy: mt.hy, ru: mt.ru };
}

/**
 * Convert Record to MultiText for compatibility with Lingo-hub
 */
export function recordToMultiText(record: Record<LangCode, string>): MultiText {
  return { en: record.en, hy: record.hy, ru: record.ru };
}