// src/lib/offline/offline-lesson-translator.ts
// Translates Professional-mode offline lessons from English to the target language
// by looking up words in the lesson's vocabulary.
//
// Fixes THREE issues:
// 1. options[] — hardcoded English → target language
// 2. targetAnswer — hardcoded English → target language
// 3. prompt.[lang] — word inside quotes is always Armenian, needs
//    to match the prompt's own language

import type { OfflineLesson, OfflineExercise } from './OfflineLessonEngine';

type LangCode = 'hy' | 'en' | 'ru';

interface VocabEntry {
  hy: string;
  en: string;
  ru: string;
}

// Build a lookup map keyed by ALL 3 languages
function buildVocabLookup(lesson: OfflineLesson): Map<string, VocabEntry> {
  const map = new Map<string, VocabEntry>();

  for (const v of lesson.vocabulary || []) {
    if (!v) continue;
    const entry: VocabEntry = {
      hy: v.hy || '',
      en: v.en || '',
      ru: v.ru || '',
    };

    for (const lg of ['hy', 'en', 'ru'] as const) {
      const word = v[lg];
      if (!word) continue;
      const key = String(word).toLowerCase().trim();
      if (!map.has(key)) {
        map.set(key, entry);
      }
    }
  }

  return map;
}

// Translate a word to the target language (skip if already target lang)
function translateWord(
  word: string,
  lang: LangCode,
  lookup: Map<string, VocabEntry>
): string {
  if (!word) return word;
  if (lang === 'en') return word;

  const key = String(word).toLowerCase().trim();
  const entry = lookup.get(key);
  if (entry && entry[lang]) {
    return entry[lang];
  }
  return word;
}

// Fix the word inside quotes in a prompt so it matches the prompt's language
function fixPromptWord(
  prompt: string,
  lang: LangCode,
  lookup: Map<string, VocabEntry>
): string {
  if (!prompt) return prompt;

  // Match the first "word" in the prompt (straight double quotes)
  const regex = /"([^"]+)"/;
  const match = prompt.match(regex);
  if (!match) return prompt;

  const originalWord = match[1].trim();
  const key = originalWord.toLowerCase().trim();
  const entry = lookup.get(key);

  if (!entry || !entry[lang]) {
    return prompt; // word not in vocab, leave as-is
  }

  // Replace the word inside the quotes
  return prompt.replace(match[0], `"${entry[lang]}"`);
}

/**
 * Translate an offline lesson to the target language.
 *
 * @param lesson - Raw offline lesson from OfflineLessonEngine
 * @param lang   - Target (learning) language
 * @returns      - Translated lesson
 */
export function translateOfflineLessonForLang(
  lesson: OfflineLesson,
  lang: LangCode
): OfflineLesson {
  const lookup = buildVocabLookup(lesson);

  if (lookup.size === 0) {
    console.warn(
      `⚠️ [Translator] ${lesson.id}: no vocabulary found, skipping`
    );
    return lesson;
  }

  let translatedWords = 0;
  let totalWords = 0;
  let fixedPrompts = 0;

  const translatedExercises: OfflineExercise[] = lesson.exercises.map((ex) => {
    // ─── 1. OPTIONS ─────────────────────────────────────────────
    totalWords += 1 + (ex.options?.length || 0);

    let translatedOptions = ex.options;
    if (lang !== 'en' && ex.options) {
      translatedOptions = ex.options.map((opt) => {
        const t = translateWord(opt, lang, lookup);
        if (t !== opt) translatedWords += 1;
        return t;
      });
    }

    // ─── 2. TARGET ANSWER ───────────────────────────────────────
    let newAnswer = ex.targetAnswer;
    if (lang !== 'en' && ex.targetAnswer) {
      newAnswer = translateWord(ex.targetAnswer, lang, lookup);
      if (newAnswer !== ex.targetAnswer) translatedWords += 1;
    }

    // ─── 3. PROMPT WORDS ────────────────────────────────────────
    // Fix the word inside each prompt language so it matches that language
    let newPrompt = ex.prompt;
    if (ex.prompt && typeof ex.prompt === 'object') {
      const fixedPrompt: Record<string, string> = {};
      for (const [promptLang, text] of Object.entries(ex.prompt)) {
        if (typeof text !== 'string') {
          fixedPrompt[promptLang] = text as unknown as string;
          continue;
        }
        const fixed = fixPromptWord(text, promptLang as LangCode, lookup);
        if (fixed !== text) fixedPrompts += 1;
        fixedPrompt[promptLang] = fixed;
      }
      newPrompt = fixedPrompt;
    }

    return {
      ...ex,
      prompt: newPrompt,
      options: translatedOptions,
      targetAnswer: newAnswer,
    };
  });

  console.log(
    `🌐 [Translator] ${lesson.id}: ${translatedWords}/${totalWords} words → "${lang}", ${fixedPrompts} prompts fixed`
  );

  return {
    ...lesson,
    exercises: translatedExercises,
  };
}

export default { translateOfflineLessonForLang };