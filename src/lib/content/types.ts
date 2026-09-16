// src/lib/content/types.ts

// ✅ FIXED: Correct import path
import type { LangCode } from "../i18n/multilingual";

export type Tri = Record<LangCode, string>;

export interface VocabItem {
  id: string;
  hy: string;
  en: string;
  ru: string;
  audioId?: string;
  notes?: string;
}

export interface PhraseItem {
  id: string;
  hy: string;
  en: string;
  ru: string;
  alt?: Partial<Record<LangCode, string[]>>;
}

export interface DialogueTurn {
  speaker: "nurik" | "user" | string;
  hy: string;
  en: string;
  ru: string;
  mood?: "happy" | "sad" | "thinking" | "excited" | "angry" | "surprised" | "neutral" | "encouraging";
}

export interface Dialogue {
  id: string;
  title: Tri;
  turns: DialogueTurn[];
}

// ✅ FIXED: added exercise support for match_pairs, word_order, etc.
export interface Exercise {
  id: string;
  type: "fill_in" | "multiple_choice" | "word_order" | "match_pairs" | "listening" | "speaking" | "translate";
  prompt: Tri;
  targetAnswer: string;
  acceptableAnswers?: string[];
  options?: string[];
  words?: string[];           // for word_order
  pairs?: string[][];         // for match_pairs
  ttsText?: string;           // for listening
  ttsLang?: string;
  hint?: Partial<Tri>;
  feedback?: {
    correct: Partial<Tri>;
    incorrect: Partial<Tri>;
  };
}

export interface ContentLesson {
  id: string;
  worldId: string;
  slug: string;
  title: Tri;
  concept: Tri;
  difficulty: "A1" | "A2" | "B1" | "B2";
  vocabulary: VocabItem[];
  phrases: PhraseItem[];
  dialogues: Dialogue[];
  // ✅ FIXED: added optional exercises field
  exercises?: Exercise[];
}

export interface World {
  id: string;
  title: Tri;
  description: Tri;
  iconEmoji: string;
  colorFrom: string;
  colorTo: string;
  lessons: string[];
}

export interface QuickLesson {
  id: string;
  worldId: string;
  slug: string;
  title: Tri;
  concept: Tri;
  difficulty: "A1" | "A2" | "B1" | "B2";
  vocab: Array<[hy: string, en: string, ru: string]>;
  phrases: Array<[hy: string, en: string, ru: string, altEn?: string[]]>;
  dialogues: Array<{
    title: Tri;
    turns: Array<[speaker: "nurik" | "user", hy: string, en: string, ru: string]>;
  }>;
  // ✅ FIXED: added optional exercises field for quick lessons
  exercises?: Exercise[];
}

// ✅ Helper function to check if something is a valid Tri
export function isTri(value: any): value is Tri {
  return value && typeof value === 'object' && 
    typeof value.en === 'string' && 
    typeof value.hy === 'string' && 
    typeof value.ru === 'string';
}

// ✅ Helper function to get string from Tri
export function getTriString(tri: Tri | string | undefined, lang: LangCode): string {
  if (!tri) return "";
  if (typeof tri === 'string') return tri;
  return tri[lang] || tri.en || "";
}