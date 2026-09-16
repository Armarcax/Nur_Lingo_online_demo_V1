// src/lib/content/builders/helpers.ts

import type { VocabItem, PhraseItem, Dialogue, DialogueTurn, ContentLesson, QuickLesson, Tri } from "../types";

export const v = (id: string, hy: string, en: string, ru: string): VocabItem => ({ id, hy, en, ru });
export const p = (
  id: string,
  hy: string,
  en: string,
  ru: string,
  alt?: Partial<Record<"en" | "hy" | "ru", string[]>>
): PhraseItem => ({ id, hy, en, ru, alt });
export const d = (id: string, title: Tri, turns: DialogueTurn[]): Dialogue => ({ id, title, turns });
export const t = (
  speaker: "nurik" | "user",
  hy: string,
  en: string,
  ru: string
): DialogueTurn => ({ speaker, hy, en, ru });

export function expand(q: QuickLesson): ContentLesson {
  return {
    id: q.id,
    worldId: q.worldId,
    slug: q.slug,
    title: q.title,
    concept: q.concept,
    difficulty: q.difficulty,
    vocabulary: q.vocab.map(([h, e, r], i) => v(`${q.id}_v${i}`, h, e, r)),
    phrases: q.phrases.map(([h, e, r, altEn], i) =>
      p(`${q.id}_p${i}`, h, e, r, altEn ? { en: altEn } : undefined)
    ),
    dialogues: q.dialogues.map((dl, i) =>
      d(`${q.id}_d${i}`, dl.title,
        dl.turns.map(([s, h, e, r]) => t(s, h, e, r))
      )
    ),
  };
}

export function qL(
  id: string,
  worldId: string,
  slug: string,
  enT: string,
  hyT: string,
  ruT: string,
  conceptEn: string,
  vocab: Array<[string, string, string]>,
  phrases: Array<[string, string, string, string[]?]>,
  dialogues: Array<{
    title: Tri;
    turns: Array<["nurik" | "user", string, string, string]>;
  }>
): QuickLesson {
  return {
    id,
    worldId,
    slug,
    difficulty: "A1",
    title: { en: enT, hy: hyT, ru: ruT },
    concept: { en: conceptEn, hy: conceptEn, ru: conceptEn },
    vocab,
    phrases,
    dialogues,
  };
}