// src/lib/content/types.ts
//
// Content type definitions for NUR Lingo content database.
//
// v2 fixes:
// - DialogueTurn.speaker: named union instead of collapsing "| string"
// - difficulty: include C1/C2 (matches generator.ts)
// - ttsLang: LangCode instead of loose string
// - isTri: unknown instead of any
// - pairs: proper tuple type [string, string]
// - Exercise.type: aligned with MultiExercise
// - Mood: exported as const for reuse
// - getTriString: handle edge cases

import type { LangCode } from "../i18n/multilingual";

// ─── BASIC ────────────────────────────────────────────────────────────

/** Trilingual string: same content in EN, HY, RU */
export type Tri = Record<LangCode, string>;

/** CEFR difficulty levels supported by content */
export type Difficulty = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/** Dialogue speaker — extensible via string but with known values hinted */
export type Speaker = "nurik" | "user" | (string & {});

/** Nuri's emotion states */
export const MOODS = [
  "happy",
  "sad",
  "thinking",
  "excited",
  "angry",
  "surprised",
  "neutral",
  "encouraging",
] as const;

export type Mood = (typeof MOODS)[number];

/** Exercise type — aligned with MultiExercise.type + extras */
export type ExerciseType =
  | "multiple_choice"
  | "translate"
  | "word_order"
  | "match_pairs"
  | "listening"
  | "speaking"
  | "fill_in";

// ─── VOCABULARY ───────────────────────────────────────────────────────

export interface VocabItem {
  id: string;
  hy: string;
  en: string;
  ru: string;
  audioId?: string;
  notes?: string;
}

// ─── PHRASES ──────────────────────────────────────────────────────────

export interface PhraseItem {
  id: string;
  hy: string;
  en: string;
  ru: string;
  /** Additional accepted alternative answers per language */
  alt?: Partial<Record<LangCode, string[]>>;
}

// ─── DIALOGUES ────────────────────────────────────────────────────────

export interface DialogueTurn {
  speaker: Speaker;
  hy: string;
  en: string;
  ru: string;
  mood?: Mood;
}

export interface Dialogue {
  id: string;
  title: Tri;
  turns: DialogueTurn[];
}

// ─── EXERCISES ────────────────────────────────────────────────────────

/** A single pair for match_pairs exercises */
export type Pair = [left: string, right: string];

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: Tri;
  targetAnswer: string;
  acceptableAnswers?: string[];
  options?: string[];
  /** For word_order: shuffled words to arrange */
  words?: string[];
  /** For match_pairs: list of [left, right] tuples */
  pairs?: Pair[];
  /** For listening: text to be spoken */
  ttsText?: string;
  /** For listening: language of the TTS */
  ttsLang?: LangCode;
  hint?: Partial<Tri>;
  feedback?: {
    correct: Partial<Tri>;
    incorrect: Partial<Tri>;
  };
}

// ─── LESSONS ──────────────────────────────────────────────────────────

export interface ContentLesson {
  id: string;
  worldId: string;
  slug: string;
  title: Tri;
  concept: Tri;
  difficulty: Difficulty;
  vocabulary: VocabItem[];
  phrases: PhraseItem[];
  dialogues: Dialogue[];
  exercises?: Exercise[];
}

// ─── WORLDS ───────────────────────────────────────────────────────────

export interface World {
  id: string;
  title: Tri;
  description: Tri;
  iconEmoji: string;
  colorFrom: string;
  colorTo: string;
  lessons: string[];
}

// ─── QUICK LESSONS ────────────────────────────────────────────────────

/** Shorthand tuple for quick lesson vocab: [hy, en, ru] */
export type QuickVocabTuple = [hy: string, en: string, ru: string];

/** Shorthand tuple for quick lesson phrases: [hy, en, ru, altEn?] */
export type QuickPhraseTuple = [
  hy: string,
  en: string,
  ru: string,
  altEn?: string[]
];

/** Shorthand tuple for quick lesson dialogue turns */
export type QuickDialogueTurnTuple = [
  speaker: "nurik" | "user",
  hy: string,
  en: string,
  ru: string
];

export interface QuickLesson {
  id: string;
  worldId: string;
  slug: string;
  title: Tri;
  concept: Tri;
  difficulty: Difficulty;
  vocab: QuickVocabTuple[];
  phrases: QuickPhraseTuple[];
  dialogues: Array<{
    title: Tri;
    turns: QuickDialogueTurnTuple[];
  }>;
  exercises?: Exercise[];
}

// ─── TYPE GUARDS ──────────────────────────────────────────────────────

/**
 * Type guard for Tri (trilingual string).
 * ✅ Uses `unknown` instead of `any` for safety.
 */
export function isTri(value: unknown): value is Tri {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.en === "string" &&
    typeof v.hy === "string" &&
    typeof v.ru === "string"
  );
}

/**
 * Extract a localized string from a Tri.
 * ✅ Handles string, undefined, and empty values gracefully.
 */
export function getTriString(
  tri: Tri | string | undefined,
  lang: LangCode
): string {
  if (!tri) return "";
  if (typeof tri === "string") return tri;

  const primary = tri[lang];
  if (primary && primary.length > 0) return primary;

  // Fallback chain: en → hy → ru → first non-empty
  for (const fallbackLang of ["en", "hy", "ru"] as const) {
    const v = tri[fallbackLang];
    if (v && v.length > 0) return v;
  }
  return "";
}

// ─── ADDITIONAL GUARDS ────────────────────────────────────────────────

/** Type guard for a Pair tuple */
export function isPair(value: unknown): value is Pair {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "string" &&
    typeof value[1] === "string"
  );
}

/** Type guard for a Mood value */
export function isMood(value: unknown): value is Mood {
  return typeof value === "string" && (MOODS as readonly string[]).includes(value);
}