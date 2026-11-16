// src/lib/content/reading-texts.ts

/**
 * READING TEXTS — INDEX FILE
 *
 * Այս ֆայլը միավորում է բոլոր մակարդակների տեքստերը մեկ զանգվածում։
 * Backward compatibility-ի համար վերաարտահանում է նաև տիպերը։
 *
 * Ֆայլային կառուցվածքը.
 *   ├── reading-types.ts       — ընդհանուր TypeScript ինտերֆեյսներ
 *   ├── reading-texts-A1.ts    — A1 մակարդակ
 *   ├── reading-texts-A2.ts    — A2 մակարդակ
 *   ├── reading-texts-B1.ts    — B1 մակարդակ
 *   ├── reading-texts-B2.ts    — B2 մակարդակ (դեռ դատարկ)
 *   └── reading-texts.ts       — այս ֆայլը (index)
 */

// ─── TYPES (re-export for backward compatibility) ─────────────────────
export type {
  ReadingParagraph,
  ReadingVocabulary,
  ReadingQuestion,
  CreativeTask,
  ReadingText,
} from "./reading-types";

// ─── IMPORTS ──────────────────────────────────────────────────────────
import type { ReadingText } from "./reading-types";
import { A1_TEXTS } from "./reading-texts-A1";
import { A2_TEXTS } from "./reading-texts-A2";
import { B1_TEXTS } from "./reading-texts-B1";
import { B2_TEXTS } from "./reading-texts-B2";

// ─── COMBINED LIBRARY ─────────────────────────────────────────────────
/**
 * Բոլոր ընթերցանության տեքստերը՝ ըստ մակարդակների հերթականության.
 * A1 → A2 → B1 → B2
 */
export const READING_TEXTS: ReadingText[] = [
  ...A1_TEXTS,
  ...A2_TEXTS,
  ...B1_TEXTS,
  ...B2_TEXTS,
];

// ─── RE-EXPORT LEVEL ARRAYS ───────────────────────────────────────────
/**
 * Եթե պետք լինի ֆիլտրել ըստ մակարդակի (օրինակ՝ "միայն A1 ցույց տուր")։
 */
export { A1_TEXTS, A2_TEXTS, B1_TEXTS, B2_TEXTS };

// ─── HELPERS ──────────────────────────────────────────────────────────
/**
 * Օգնական ֆունկցիա՝ տեքստերի զտում ըստ մակարդակի։
 */
export function getTextsByLevel(level: "A1" | "A2" | "B1" | "B2"): ReadingText[] {
  return READING_TEXTS.filter((text) => text.level === level);
}

/**
 * Օգնական ֆունկցիա՝ տեքստի որոնում ID-ով։
 */
export function getTextById(id: string): ReadingText | undefined {
  return READING_TEXTS.find((text) => text.id === id);
}

/**
 * Օգնական ֆունկցիա՝ տեքստերի զտում ըստ թեմայի։
 */
export function getTextsByTopic(topic: string): ReadingText[] {
  return READING_TEXTS.filter((text) => text.topics.includes(topic));
}