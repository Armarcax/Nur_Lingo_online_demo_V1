// src/lib/content/database.ts
//
// Pure content data + lookups. NO React hooks, NO client-side needs.
//
// v2 fixes:
// - Removed "use client" (data-only file → stays in server bundle)
// - Removed unused useI18n import
// - Removed `as any` cast
// - getAllLessonsOrdered: O(n) via Map lookup
// - Validation logs gated behind explicit opt-in (not auto-run)
// - getAudioId: safe for non-numeric IDs

import type { ContentLesson, VocabItem } from "./types";
import { FIXED_AUDIO_IDS } from "./audio-ids";
import { WORLDS } from "./worlds";
import { NUMBERS_1_10 } from "./numbers";

// Import all lesson builders
import { W1_LESSONS } from "./builders/world1";
import { W1_QUICK_LESSONS } from "./builders/world1_quick";
import { W2_LESSONS } from "./builders/world2";
import { W3_LESSONS } from "./builders/world3";
import { W4_LESSONS } from "./builders/world4";
import { W5_LESSONS } from "./builders/world5";
import { W6_LESSONS } from "./builders/world6";
import { W7_LESSONS } from "./builders/world7";
import { W8_LESSONS } from "./builders/world8";
import { W9_LESSONS } from "./builders/world9";
import { W10_LESSONS } from "./builders/world10";

// ─── DEBUG HELPER ─────────────────────────────────────────────────────────

const DEBUG = process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_VERBOSE_DB === "1";

function devLog(msg: string, ...args: unknown[]): void {
  if (DEBUG) console.log(msg, ...args);
}

function devWarn(msg: string, ...args: unknown[]): void {
  if (DEBUG) console.warn(msg, ...args);
}

// ─── ALL LESSONS ──────────────────────────────────────────────────────────

export const CONTENT_LESSONS: ContentLesson[] = [
  ...W1_LESSONS,
  ...W1_QUICK_LESSONS,
  ...W2_LESSONS,
  ...W3_LESSONS,
  ...W4_LESSONS,
  ...W5_LESSONS,
  ...W6_LESSONS,
  ...W7_LESSONS,
  ...W8_LESSONS,
  ...W9_LESSONS,
  ...W10_LESSONS,
] as ContentLesson[];

// ✅ Pre-built Map for O(1) lookups
const LESSON_BY_ID = new Map<string, ContentLesson>(
  CONTENT_LESSONS.map((l) => [l.id, l])
);

// ─── VALIDATION (explicit call only) ──────────────────────────────────────

export function validateContentLessons(): { valid: number; invalid: string[] } {
  const invalid: string[] = [];
  let valid = 0;

  for (const lesson of CONTENT_LESSONS) {
    const errors: string[] = [];

    if (!lesson.id) errors.push("Missing id");
    if (!lesson.vocabulary || !Array.isArray(lesson.vocabulary)) {
      errors.push("Invalid vocabulary");
    } else if (lesson.vocabulary.length === 0) {
      errors.push("Empty vocabulary");
    }

    if (!lesson.phrases || !Array.isArray(lesson.phrases)) {
      errors.push("Invalid phrases");
    } else if (lesson.phrases.length === 0) {
      errors.push("Empty phrases");
    }

    if (!lesson.dialogues || !Array.isArray(lesson.dialogues)) {
      errors.push("Invalid dialogues");
    } else if (lesson.dialogues.length === 0) {
      errors.push("Empty dialogues");
    }

    if (errors.length === 0) {
      valid++;
    } else {
      invalid.push(`${lesson.id || "unknown"}: ${errors.join(", ")}`);
    }
  }

  devLog(`✅ Valid lessons: ${valid}`);
  if (invalid.length > 0) {
    devWarn(`❌ Invalid lessons (${invalid.length}):\n${invalid.join("\n")}`);
  }

  return { valid, invalid };
}

// ─── AUDIO ID MAPPING ─────────────────────────────────────────────────────

export function getAudioId(item: VocabItem): string {
  if (item.audioId && /^\d+$/.test(item.audioId)) {
    return item.audioId.padStart(6, "0");
  }
  if (item.audioId) {
    // Non-numeric: return as-is (already a valid id string)
    return item.audioId;
  }

  const fixedId = FIXED_AUDIO_IDS[item.id];
  if (fixedId) return fixedId;

  devWarn(`⚠️ No audio ID for: ${item.id} (${item.hy})`);
  return "000000";
}

// ─── AUDIO VALIDATION (explicit call only) ────────────────────────────────

export function validateAllAudioIds(): { missing: string[]; total: number } {
  const missing: string[] = [];
  let total = 0;

  for (const lesson of CONTENT_LESSONS) {
    for (const vocab of lesson.vocabulary) {
      total++;
      if (!vocab.audioId && !FIXED_AUDIO_IDS[vocab.id]) {
        missing.push(`${vocab.id} (${vocab.hy})`);
      }
    }
  }

  if (missing.length > 0) {
    devWarn(`⚠️ ${missing.length} vocabulary items missing audio IDs:\n${missing.join("\n")}`);
  } else {
    devLog(`✅ All ${total} vocabulary items have audio IDs`);
  }

  return { missing, total };
}

// ─── LOOKUP HELPERS ───────────────────────────────────────────────────────

export { WORLDS, getWorlds, getWorldById } from "./worlds";
export { NUMBERS_1_10 } from "./numbers";

export const getContentLessonById = (id: string): ContentLesson | undefined =>
  LESSON_BY_ID.get(id);

export const getLessonsForWorld = (worldId: string): ContentLesson[] =>
  CONTENT_LESSONS.filter((l) => l.worldId === worldId);

/**
 * ✅ FIXED: O(n) via pre-built Map.
 * Previously: O(n×m) with `.find()` inside the loop.
 */
export function getAllLessonsOrdered(): ContentLesson[] {
  const out: ContentLesson[] = [];
  for (const w of WORLDS) {
    for (const id of w.lessons) {
      const l = LESSON_BY_ID.get(id);
      if (l) out.push(l);
    }
  }
  return out;
}

// ─── RE-EXPORT TYPES ──────────────────────────────────────────────────────

export type {
  Tri,
  VocabItem,
  PhraseItem,
  DialogueTurn,
  Dialogue,
  ContentLesson,
  World,
  QuickLesson,
} from "./types";