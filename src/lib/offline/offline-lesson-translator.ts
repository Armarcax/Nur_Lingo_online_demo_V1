// src/lib/offline/offline-lesson-translator.ts
//
// Translates Professional-mode offline lessons from English to the target
// language by looking up words in the lesson's vocabulary.
//
// v2 fixes:
// - Translate hint (was skipped)
// - Translate feedback.correct/incorrect (was skipped)
// - fixPromptWord now handles MULTIPLE quoted words per prompt
// - fixPromptWord supports «…», „…", "…", '…' quote styles
// - Translate words[] (word_order) if present
// - Translate pairs[] (match_pairs) if present
// - Warn when word not found in vocabulary (was silent)
// - Optional title/concept translation
// - Better stats reporting

import type { OfflineLesson, OfflineExercise } from "./OfflineLessonEngine";

type LangCode = "hy" | "en" | "ru";

interface VocabEntry {
  hy: string;
  en: string;
  ru: string;
}

// ─── VOCAB LOOKUP ───────────────────────────────────────────────────

/**
 * Build a lookup map keyed by ALL 3 languages.
 * Includes singular/plural variants and a lowercased normalized form.
 */
function buildVocabLookup(lesson: OfflineLesson): Map<string, VocabEntry> {
  const map = new Map<string, VocabEntry>();

  for (const v of lesson.vocabulary || []) {
    if (!v) continue;
    const entry: VocabEntry = {
      hy: v.hy || "",
      en: v.en || "",
      ru: v.ru || "",
    };

    for (const lg of ["hy", "en", "ru"] as const) {
      const word = v[lg];
      if (!word) continue;
      const key = normalizeKey(word);
      if (!map.has(key)) {
        map.set(key, entry);
      }
    }
  }

  return map;
}

function normalizeKey(word: string): string {
  return String(word)
    .toLowerCase()
    .trim()
    // Strip surrounding punctuation but keep inner hyphens
    .replace(/^[«»""''`´.,!?;:։՝]+|[«»""''`´.,!?;:։՝]+$/g, "")
    .trim();
}

// ─── TRANSLATE WORD ────────────────────────────────────────────────

/**
 * Translate a single word to the target language.
 * Returns the original if no translation found.
 */
function translateWord(
  word: string,
  lang: LangCode,
  lookup: Map<string, VocabEntry>,
  warnMissing = false
): string {
  if (!word) return word;
  if (lang === "en") return word;

  const key = normalizeKey(word);
  const entry = lookup.get(key);
  if (entry && entry[lang]) {
    return entry[lang];
  }
  if (warnMissing) {
    console.warn(
      `⚠️ [Translator] No ${lang} translation for "${word}" (key: "${key}")`
    );
  }
  return word;
}

// ─── PROMPT WORD FIX ──────────────────────────────────────────────

/**
 * Quote-style matchers:
 * - "..." (straight double)
 * - «...» (Armenian/Russian guillemets)
 * - „..." (Russian/German low-high)
 * - '...' (straight single)
 * - '...' (curly single)
 *
 * Also handles quotes with any content inside.
 */
const QUOTE_PATTERNS: Array<{ regex: RegExp; open: string; close: string }> = [
  { regex: /"([^"]+)"/g, open: '"', close: '"' },
  { regex: /«([^»]+)»/g, open: "«", close: "»" },
  { regex: /„([^""]+)"/g, open: "„", close: '"' },
  { regex: /'([^']+)'/g, open: "'", close: "'" },
  { regex: /'([^']+)'/g, open: "'", close: "'" },
];

/**
 * Fix ALL quoted words in a prompt so they match the prompt's language.
 * Returns the fixed prompt and the count of replacements.
 */
function fixPromptWords(
  prompt: string,
  lang: LangCode,
  lookup: Map<string, VocabEntry>
): { result: string; fixedCount: number } {
  if (!prompt) return { result: prompt, fixedCount: 0 };

  let fixedCount = 0;
  let current = prompt;

  for (const { regex, open, close } of QUOTE_PATTERNS) {
    current = current.replace(regex, (match, inner: string) => {
      const originalWord = inner.trim();
      const key = normalizeKey(originalWord);
      const entry = lookup.get(key);

      if (!entry || !entry[lang]) {
        return match; // no translation, leave as-is
      }

      if (entry[lang] === originalWord) {
        return match; // same word (e.g., already in target lang)
      }

      fixedCount += 1;
      return `${open}${entry[lang]}${close}`;
    });
  }

  return { result: current, fixedCount };
}

// ─── GENERIC HELPERS ──────────────────────────────────────────────

/** Translate a `Record<lang, string>` (hint, feedback, etc.) */
function translateLocalizedRecord(
  record: Record<string, string> | undefined,
  lang: LangCode,
  lookup: Map<string, VocabEntry>
): Record<string, string> | undefined {
  if (!record) return record;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(record)) {
    if (typeof v !== "string") {
      out[k] = v as unknown as string;
      continue;
    }
    // For each language-specific entry, fix quoted words inside it
    const { result } = fixPromptWords(v, k as LangCode, lookup);
    out[k] = result;
  }
  return out;
}

// ─── MAIN FUNCTION ────────────────────────────────────────────────

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

  let translatedOptionsCount = 0;
  let translatedAnswersCount = 0;
  let totalOptionsCount = 0;
  let fixedPromptsCount = 0;
  let missingTranslations = 0;

  const translatedExercises: OfflineExercise[] = lesson.exercises.map((ex) => {
    // ─── 1. OPTIONS ─────────────────────────────────────────────
    let translatedOptions = ex.options;
    if (lang !== "en" && Array.isArray(ex.options)) {
      totalOptionsCount += ex.options.length;
      translatedOptions = ex.options.map((opt) => {
        const t = translateWord(opt, lang, lookup);
        if (t !== opt) translatedOptionsCount += 1;
        else if (lang !== "en") missingTranslations += 1;
        return t;
      });
    }

    // ─── 2. TARGET ANSWER ───────────────────────────────────────
    let newAnswer = ex.targetAnswer;
    if (lang !== "en" && ex.targetAnswer) {
      newAnswer = translateWord(ex.targetAnswer, lang, lookup);
      if (newAnswer !== ex.targetAnswer) translatedAnswersCount += 1;
      else missingTranslations += 1;
    }

    // ─── 3. PROMPT WORDS ────────────────────────────────────────
    let newPrompt = ex.prompt;
    if (ex.prompt && typeof ex.prompt === "object") {
      const fixedPrompt: Record<string, string> = {};
      for (const [promptLang, text] of Object.entries(ex.prompt)) {
        if (typeof text !== "string") {
          fixedPrompt[promptLang] = text as unknown as string;
          continue;
        }
        const { result, fixedCount } = fixPromptWords(
          text,
          promptLang as LangCode,
          lookup
        );
        fixedPromptsCount += fixedCount;
        fixedPrompt[promptLang] = result;
      }
      newPrompt = fixedPrompt;
    }

    // ─── 4. HINT ────────────────────────────────────────────────
    const newHint = translateLocalizedRecord(ex.hint, lang, lookup);

    // ─── 5. FEEDBACK ────────────────────────────────────────────
    let newFeedback = ex.feedback;
    if (ex.feedback) {
      newFeedback = {
        correct: translateLocalizedRecord(
          ex.feedback.correct,
          lang,
          lookup
        ) as Record<string, string>,
        incorrect: translateLocalizedRecord(
          ex.feedback.incorrect,
          lang,
          lookup
        ) as Record<string, string>,
      };
    }

    // ─── 6. words[] (word_order) ────────────────────────────────
    // Not in OfflineExercise type, but defensive check for runtime data
    const exAny = ex as unknown as Record<string, unknown>;
    let newWords = exAny.words as string[] | undefined;
    if (lang !== "en" && Array.isArray(newWords)) {
      newWords = newWords.map((w) => translateWord(w, lang, lookup));
    }

    // ─── 7. pairs[] (match_pairs) ───────────────────────────────
    let newPairs = exAny.pairs as Array<[string, string]> | undefined;
    if (lang !== "en" && Array.isArray(newPairs)) {
      newPairs = newPairs.map((pair) => {
        if (!Array.isArray(pair) || pair.length !== 2) return pair;
        return [
          translateWord(pair[0], lang, lookup),
          translateWord(pair[1], lang, lookup),
        ] as [string, string];
      });
    }

    return {
      ...ex,
      prompt: newPrompt,
      options: translatedOptions,
      targetAnswer: newAnswer,
      hint: newHint,
      feedback: newFeedback,
      ...(newWords ? { words: newWords } : {}),
      ...(newPairs ? { pairs: newPairs } : {}),
    } as OfflineExercise;
  });

  // ─── 8. TITLE / CONCEPT (optional translation) ─────────────────
  // Only fix quoted words in title/concept if they contain them.
  // Full translation needs a real translator; we skip that here.
  let newTitle = lesson.title;
  let newConcept = lesson.concept;

  if (lesson.title) {
    const t: Record<string, string> = {};
    for (const [k, v] of Object.entries(lesson.title)) {
      if (typeof v !== "string") {
        t[k] = v as unknown as string;
        continue;
      }
      t[k] = fixPromptWords(v, k as LangCode, lookup).result;
    }
    newTitle = t;
  }
  if (lesson.concept) {
    const c: Record<string, string> = {};
    for (const [k, v] of Object.entries(lesson.concept)) {
      if (typeof v !== "string") {
        c[k] = v as unknown as string;
        continue;
      }
      c[k] = fixPromptWords(v, k as LangCode, lookup).result;
    }
    newConcept = c;
  }

  // ─── LOG ────────────────────────────────────────────────────
  console.log(
    `🌐 [Translator] ${lesson.id} → ${lang}: ` +
      `${translatedOptionsCount}/${totalOptionsCount} options, ` +
      `${translatedAnswersCount} answers, ` +
      `${fixedPromptsCount} quoted words in prompts` +
      (missingTranslations > 0
        ? `, ⚠️ ${missingTranslations} missing`
        : "")
  );

  return {
    ...lesson,
    title: newTitle,
    concept: newConcept,
    exercises: translatedExercises,
  };
}

export default { translateOfflineLessonForLang };