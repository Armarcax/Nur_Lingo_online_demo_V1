// src/lib/offline/offline-lesson-translator.ts
// Translates Professional-mode offline lessons from English to the target language
// by looking up words in the lesson's vocabulary.
//
// Why: lesson-dictionary.json stores options and correctAnswer only in English.
// But each lesson's vocabulary contains all 3 languages. This translator uses
// that vocabulary as a lookup to translate at runtime.

import type { OfflineLesson, OfflineExercise } from './OfflineLessonEngine';

type LangCode = 'hy' | 'en' | 'ru';

interface VocabEntry {
  hy: string;
  en: string;
  ru: string;
}

function buildVocabLookup(lesson: OfflineLesson): Map<string, VocabEntry> {
  const map = new Map<string, VocabEntry>();
  for (const v of lesson.vocabulary || []) {
    if (!v.en) continue;
    const key = String(v.en).toLowerCase().trim();
    if (!map.has(key)) {
      map.set(key, {
        hy: v.hy || '',
        en: v.en || '',
        ru: v.ru || '',
      });
    }
  }
  return map;
}

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

export function translateOfflineLessonForLang(
  lesson: OfflineLesson,
  lang: LangCode
): OfflineLesson {
  if (lang === 'en') return lesson;

  const lookup = buildVocabLookup(lesson);

  if (lookup.size === 0) {
    console.warn(
      `⚠️ [Translator] ${lesson.id}: no vocabulary found, skipping translation`
    );
    return lesson;
  }

  let translated = 0;
  let total = 0;

  const translatedExercises: OfflineExercise[] = lesson.exercises.map((ex) => {
    total += 1 + (ex.options?.length || 0);

    const translatedOptions = ex.options?.map((opt) => {
      const t = translateWord(opt, lang, lookup);
      if (t !== opt) translated += 1;
      return t;
    });

    const newAnswer = translateWord(ex.targetAnswer, lang, lookup);
    if (newAnswer !== ex.targetAnswer) translated += 1;

    return {
      ...ex,
      options: translatedOptions,
      targetAnswer: newAnswer,
    };
  });

  if (translated > 0) {
    console.log(
      `🌐 [Translator] ${lesson.id}: translated ${translated}/${total} items to "${lang}"`
    );
  } else {
    console.warn(
      `⚠️ [Translator] ${lesson.id}: no words matched vocabulary for lang="${lang}"`
    );
  }

  return {
    ...lesson,
    exercises: translatedExercises,
  };
}

export default { translateOfflineLessonForLang };