"use client";

// src/lib/content/database.ts

import type { ContentLesson, VocabItem } from "./types";
import { FIXED_AUDIO_IDS } from "./audio-ids";
import { WORLDS } from "./worlds";
import { NUMBERS_1_10 } from "./numbers";
import { useI18n } from "@/hooks/useI18n";

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

// ─── All lessons combined ──────────────────────────────────────────────────

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
] as any;

// ─── Validation ─────────────────────────────────────────────────────────────

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

  console.log(`✅ Valid lessons: ${valid}`);
  if (invalid.length > 0) {
    console.warn(`❌ Invalid lessons (${invalid.length}):`);
    console.warn(invalid.join("\n"));
  }

  return { valid, invalid };
}

// ✅ DEVELOPMENT-ՈՒՄ ԱՎՏՈՄԱՏ VALIDATION
if (process.env.NODE_ENV === "development") {
  validateContentLessons();
}

// ─── Audio ID mapping (STABLE) ─────────────────────────────────────────────

export function getAudioId(item: VocabItem): string {
  if (item.audioId) return item.audioId.padStart(6, "0");

  const fixedId = FIXED_AUDIO_IDS[item.id];
  if (fixedId) return fixedId;

  console.warn(`⚠️ No audio ID for: ${item.id} (${item.hy})`);
  return '000000';
}

// ─── Validation ─────────────────────────────────────────────────────────────

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
    console.warn(`⚠️ ${missing.length} vocabulary items missing audio IDs:`);
    console.warn(missing.join("\n"));
  } else {
    console.log(`✅ All ${total} vocabulary items have audio IDs`);
  }

  return { missing, total };
}

// ─── Lookup helpers ────────────────────────────────────────────────────────

export { WORLDS, getWorlds, getWorldById } from "./worlds";
export { NUMBERS_1_10 } from "./numbers";

export const getContentLessonById = (id: string) => CONTENT_LESSONS.find((l) => l.id === id);
export const getLessonsForWorld = (worldId: string) =>
  CONTENT_LESSONS.filter((l) => l.worldId === worldId);

export function getAllLessonsOrdered(): ContentLesson[] {
  const out: ContentLesson[] = [];
  for (const w of WORLDS) {
    for (const id of w.lessons) {
      const l = CONTENT_LESSONS.find((x) => x.id === id);
      if (l) out.push(l);
    }
  }
  return out;
}

// ─── Re-export types ──────────────────────────────────────────────────────

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