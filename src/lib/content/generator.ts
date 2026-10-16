/**
 * NUR Lingo — Content Generator v2
 *
 * v2 fixes:
 * - Fisher-Yates shuffle (was biased sort)
 * - buildMatchPairs targetAnswer is now JSON (validator-compatible)
 * - buildListening never falls back to source for targetAnswer
 * - getSentenceVariants normalizes punctuation before lookup
 * - Removed unused imports
 * - buildWordOrder handles Armenian ։ and Russian … punctuation
 * - generateReviewChallenge guards against empty lessons
 * - buildMatchPairs filters identical source/target pairs
 * - Hints added to all exercise types
 * - langName handles same-language gracefully
 * - Realistic estimatedMinutes
 * - Named constants for counts
 */

import type {
  LangCode,
  LangPair,
  MultiExercise,
  MultiLesson,
  MultiUnit,
} from "../i18n/multilingual";
import {
  CONTENT_LESSONS,
  WORLDS,
  getAllLessonsOrdered,
  type ContentLesson,
  type PhraseItem,
  type VocabItem,
} from "./database";

// ─── REWARDS & LIMITS ─────────────────────────────────────────────────────

const HAYQ = {
  CORRECT: 10,
  PERFECT_LESSON: 50,
  DIALOGUE: 100,
  WORLD: 500,
} as const;

const LIMITS = {
  MC_VOCAB: 6,
  TRANSLATE_PHRASES: 6,
  WORD_ORDER_PHRASES: 3,
  MATCH_PAIRS_MAX: 6,
  REVIEW_BATCH: 5,
  MIN_BATCH_FOR_REVIEW: 3,
  SECONDS_PER_EXERCISE: 25,
} as const;

// ─── HELPERS ──────────────────────────────────────────────────────────────

function pairToLangs(pair: LangPair): { source: LangCode; target: LangCode } {
  const [s, t] = pair.split("-") as [LangCode, LangCode];
  return { source: s, target: t };
}

/**
 * ✅ FIXED: Fisher-Yates shuffle — uniformly unbiased.
 */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickDistractors<T>(
  pool: T[],
  exclude: T,
  n: number,
  key: (x: T) => string
): T[] {
  const filtered = pool.filter((x) => key(x) !== key(exclude));
  return shuffle(filtered).slice(0, n);
}

/**
 * ✅ Same-language returns "the same language" safely.
 */
function langName(inLang: LangCode, target: LangCode): string {
  const names: Record<LangCode, Record<LangCode, string>> = {
    en: { en: "English", hy: "Armenian", ru: "Russian" },
    hy: { en: "անգլերեն", hy: "հայերեն", ru: "ռուսերեն" },
    ru: { en: "английский", hy: "армянский", ru: "русский" },
  };
  return names[inLang]?.[target] ?? target;
}

/**
 * Normalize text for variant lookup (strip punctuation, lowercase).
 */
function normalizeForLookup(s: string): string {
  return s
    .toLowerCase()
    .replace(/[«»""''`´.,!?;:։՝…—-]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── SYNONYMS & VARIANTS ─────────────────────────────────────────────────

const MANUAL_SYNONYMS: Record<string, Partial<Record<LangCode, string[]>>> = {
  "բարև": { hy: ["ողջույն", "բարի լույս"] },
  "ողջույն": { hy: ["բարև", "բարի լույս"] },
  "շնորհակալություն": { hy: ["շնորհակալ եմ", "մերսի"] },
  "այո": { hy: ["հա", "համաձայն"] },
  "ոչ": { hy: ["չէ", "չեմ"] },
  "լավ": { hy: ["կարգին", "նորմալ", "օքեյ"] },
  hello: { en: ["hi", "hey", "good morning", "greetings"] },
  "thank you": { en: ["thanks", "thanks a lot", "many thanks"] },
  yes: { en: ["yeah", "sure", "okay", "yep"] },
  no: { en: ["nope", "nah", "not"] },
  good: { en: ["fine", "great", "excellent", "okay"] },
  привет: { ru: ["здравствуй", "здравствуйте", "добрый день"] },
  спасибо: { ru: ["благодарю", "мерси"] },
  да: { ru: ["ага", "так", "конечно"] },
  нет: { ru: ["не", "никак"] },
  хорошо: { ru: ["отлично", "прекрасно", "нормально"] },
};

function getWordSynonyms(word: string, target: LangCode): string[] {
  if (!word || !target) return [];
  const key = normalizeForLookup(word);
  return MANUAL_SYNONYMS[key]?.[target] ?? [];
}

const SENTENCE_VARIANTS: Record<string, Partial<Record<LangCode, string[]>>> = {
  "how are you": {
    en: ["how are you", "how're you", "how are you doing"],
    hy: ["ինչպես ես", "ինչպես եք"],
    ru: ["как дела", "как ты", "как поживаешь"],
  },
  "what is your name": {
    en: ["what is your name", "what's your name", "who are you"],
    hy: ["ինչ է քո անունը", "անունդ ինչ է"],
    ru: ["как тебя зовут", "твое имя", "кто ты"],
  },
  "nice to meet you": {
    en: ["nice to meet you", "pleased to meet you", "good to meet you"],
    hy: ["հաճելի է ծանոթանալ", "ուրախ եմ ծանոթանալ"],
    ru: ["приятно познакомиться", "рад познакомиться"],
  },
  "thank you": {
    en: ["thank you", "thanks", "thank you very much"],
    hy: ["շնորհակալություն", "շնորհակալ եմ", "մերսի"],
    ru: ["спасибо", "благодарю", "спасибо большое"],
  },
  "good morning": {
    en: ["good morning", "morning"],
    hy: ["բարի լույս", "բարի առավոտ"],
    ru: ["доброе утро"],
  },
  goodbye: {
    en: ["goodbye", "bye", "see you"],
    hy: ["ցտեսություն", "կտեսնվենք"],
    ru: ["до свидания", "пока"],
  },
};

/**
 * ✅ FIXED: normalize key so "How are you?" matches "how are you".
 */
function getSentenceVariants(phrase: string, target: LangCode): string[] {
  if (!phrase || !target) return [];
  const key = normalizeForLookup(phrase);
  return SENTENCE_VARIANTS[key]?.[target] ?? [];
}

/**
 * Build a "first···last" hint. Falls back gracefully for short words.
 */
function wordHint(word: string, dots = "···"): string {
  if (!word || word.length < 3) return word;
  const first = word[0];
  const last = word[word.length - 1];
  return `${first}${dots}${last}`;
}

// ─── EXERCISE BUILDERS ───────────────────────────────────────────────────

function buildMC(
  v: VocabItem,
  idx: number,
  lesson: ContentLesson,
  source: LangCode,
  target: LangCode,
  vocabPool: VocabItem[]
): MultiExercise | null {
  if (!v) {
    console.warn(`⚠️ buildMC: vocab item is undefined for lesson ${lesson.id}`);
    return null;
  }

  const correct = v[target];
  if (!correct) {
    console.warn(
      `⚠️ buildMC: missing "${target}" for vocab item "${v.id}" in lesson ${lesson.id}`
    );
    return null;
  }

  const distractors = pickDistractors(vocabPool, v, 3, (x) => x.id)
    .map((d) => d[target])
    .filter((x): x is string => Boolean(x));

  if (distractors.length < 2) {
    console.warn(
      `⚠️ buildMC: not enough distractors for "${v.id}" in lesson ${lesson.id}`
    );
    return null;
  }

  const options = shuffle([correct, ...distractors]);
  const synonyms = getWordSynonyms(correct, target);

  // ✅ Prompt shows the source word
  const sourceWord =
    source === target
      ? v[target]
      : v[source] || v.en || v.hy || v.ru;

  return {
    id: `${lesson.id}_e${idx}`,
    type: "multiple_choice",
    prompt: {
      en:
        target === "en"
          ? `What is "${sourceWord}" in English?`
          : `What is "${sourceWord}" in ${langName("en", target)}?`,
      hy:
        target === "hy"
          ? `Ի՞նչ է «${sourceWord}»-ն հայերեն։`
          : `Ի՞նչ է «${sourceWord}»-ն ${langName("hy", target)}։`,
      ru:
        target === "ru"
          ? `Как «${sourceWord}» по-русски?`
          : `Как «${sourceWord}» по-${langName("ru", target).toLowerCase()}?`,
    },
    targetAnswer: correct,
    acceptableAnswers: Array.from(new Set([correct, ...synonyms].filter(Boolean))),
    options,
    hayqReward: HAYQ.CORRECT,
    hint: {
      en: `Hint: ${wordHint(correct)}`,
      hy: `Հուշում՝ ${wordHint(correct)}`,
      ru: `Подсказка: ${wordHint(correct)}`,
    },
  };
}

function buildTranslate(
  ph: PhraseItem,
  idx: number,
  lesson: ContentLesson,
  source: LangCode,
  target: LangCode
): MultiExercise | null {
  if (!ph) {
    console.warn(`⚠️ buildTranslate: phrase item is undefined for lesson ${lesson.id}`);
    return null;
  }

  const targetAnswer = ph[target];
  if (!targetAnswer) {
    console.warn(
      `⚠️ buildTranslate: missing "${target}" for phrase "${ph.id}" in lesson ${lesson.id}`
    );
    return null;
  }

  const altsTarget = ph.alt?.[target] ?? [];
  const patternVariants = getSentenceVariants(ph.en || ph[source] || "", target);
  const allAnswers = [targetAnswer, ...altsTarget, ...patternVariants];
  const uniqueAnswers = Array.from(new Set(allAnswers.filter(Boolean)));

  const sourcePhrase = ph[source] || ph.en || ph.hy || ph.ru || "";

  return {
    id: `${lesson.id}_e${idx}`,
    type: "translate",
    prompt: {
      en:
        target === "en"
          ? `Translate to English: "${sourcePhrase}"`
          : `Translate to ${langName("en", target)}: "${sourcePhrase}"`,
      hy: `Թարգմանի՛ր ${langName("hy", target)}՝ «${sourcePhrase}»։`,
      ru: `Переведите на ${langName("ru", target).toLowerCase()}: «${sourcePhrase}»`,
    },
    targetAnswer,
    acceptableAnswers: uniqueAnswers,
    hayqReward: HAYQ.CORRECT,
    hint: {
      en: `Hint: ${wordHint(targetAnswer)}`,
      hy: `Հուշում՝ ${wordHint(targetAnswer)}`,
      ru: `Подсказка: ${wordHint(targetAnswer)}`,
    },
  };
}

function buildWordOrder(
  ph: PhraseItem,
  idx: number,
  lesson: ContentLesson,
  source: LangCode,
  target: LangCode
): MultiExercise | null {
  if (!ph) {
    console.warn(`⚠️ buildWordOrder: phrase item is undefined for lesson ${lesson.id}`);
    return null;
  }

  const sentence = ph[target];
  if (!sentence) {
    console.warn(
      `⚠️ buildWordOrder: missing "${target}" for phrase "${ph.id}" in lesson ${lesson.id}`
    );
    return null;
  }

  // ✅ FIXED: include Armenian ։ and Russian …
  const words = sentence
    .replace(/[.!?,;:«»""'`´…։՝—-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length < 2) return null;

  const patternVariants = getSentenceVariants(ph.en || ph[source] || "", target);
  const altsTarget = ph.alt?.[target] ?? [];
  const allAnswers = [sentence, ...altsTarget, ...patternVariants];
  const uniqueAnswers = Array.from(new Set(allAnswers.filter(Boolean)));

  const sourcePhrase = ph[source] || ph.en || ph.hy || ph.ru || "";

  return {
    id: `${lesson.id}_e${idx}`,
    type: "word_order",
    prompt: {
      en: `Arrange the words: "${sourcePhrase}"`,
      hy: `Դասավորի՛ր բառերը՝ «${sourcePhrase}»։`,
      ru: `Расставьте слова: «${sourcePhrase}»`,
    },
    targetAnswer: sentence,
    acceptableAnswers: uniqueAnswers,
    words: shuffle(words),
    hayqReward: HAYQ.CORRECT,
    hint: {
      en: `Hint: starts with "${words[0]}"`,
      hy: `Հուշում՝ սկսվում է «${words[0]}» բառով`,
      ru: `Подсказка: начинается с "${words[0]}"`,
    },
  };
}

function buildMatchPairs(
  lesson: ContentLesson,
  idx: number,
  source: LangCode,
  target: LangCode
): MultiExercise | null {
  if (!lesson.vocabulary || lesson.vocabulary.length === 0) return null;

  // ✅ FIXED: filter pairs where source === target (identical word)
  const rawPairs = lesson.vocabulary
    .slice(0, LIMITS.MATCH_PAIRS_MAX)
    .map((v) => {
      const s = v[source];
      const t = v[target];
      if (!s || !t) return null;
      if (s.toLowerCase() === t.toLowerCase()) return null; // skip identical
      return [s, t] as [string, string];
    })
    .filter((p): p is [string, string] => p !== null);

  if (rawPairs.length < 2) return null;

  const shuffledPairs = shuffle(rawPairs);

  // ✅ FIXED: JSON format compatible with validate/route.ts
  const targetAnswerJson = JSON.stringify(
    Object.fromEntries(shuffledPairs.map(([s, t]) => [s, t]))
  );

  return {
    id: `${lesson.id}_e${idx}`,
    type: "match_pairs",
    prompt: {
      en: `Match the words:`,
      hy: `Համապատասխանեցրու բառերը։`,
      ru: `Соедините слова:`,
    },
    targetAnswer: targetAnswerJson,
    acceptableAnswers: [],
    pairs: shuffledPairs,
    hayqReward: HAYQ.CORRECT * 2,
    hint: {
      en: `${shuffledPairs.length} pairs to match`,
      hy: `${shuffledPairs.length} զույգ`,
      ru: `${shuffledPairs.length} пар`,
    },
  };
}

// ─── LISTENING (from dialogues) ─────────────────────────────────────────

interface TurnLike {
  [key: string]: unknown;
}

const SPEAKER_ALIASES = {
  nurik: ["nurik", "nuri", "nur"],
  user: ["user", "you", "student"],
} as const;

function resolveSpeaker(raw: string): "Nurik" | "You" | string {
  const lower = String(raw || "").toLowerCase().trim();
  if (SPEAKER_ALIASES.nurik.includes(lower as any)) return "Nurik";
  if (SPEAKER_ALIASES.user.includes(lower as any)) return "You";
  return raw || "unknown";
}

function extractTurnText(turn: unknown, lang: LangCode): string | null {
  if (!turn) return null;

  if (Array.isArray(turn)) {
    // Heuristic: prefer strings that don't look like a speaker
    for (const item of turn) {
      if (typeof item !== "string" || !item) continue;
      const lower = item.toLowerCase().trim();
      if (
        !SPEAKER_ALIASES.nurik.includes(lower as any) &&
        !SPEAKER_ALIASES.user.includes(lower as any)
      ) {
        return item;
      }
    }
    // Fallback: last string
    for (let i = turn.length - 1; i >= 0; i--) {
      if (typeof turn[i] === "string" && (turn[i] as string).length > 0) {
        return turn[i] as string;
      }
    }
    return null;
  }

  if (typeof turn === "object") {
    const t = turn as TurnLike;
    if (typeof t[lang] === "string") return t[lang] as string;
    for (const key of ["text", "content", "message", "sentence"]) {
      if (typeof t[key] === "string") return t[key] as string;
    }
    for (const key of Object.keys(t)) {
      if (["speaker", "speakerName", "role", "id", "type", "lang"].includes(key)) {
        continue;
      }
      if (typeof t[key] === "string" && (t[key] as string).length > 0) {
        return t[key] as string;
      }
    }
    return null;
  }

  if (typeof turn === "string") return turn;
  return null;
}

function extractSpeaker(turn: unknown): string {
  if (!turn) return "unknown";
  if (Array.isArray(turn) && turn.length > 0) {
    return resolveSpeaker(String(turn[0] || ""));
  }
  if (typeof turn === "object") {
    const t = turn as TurnLike;
    if (typeof t.speaker === "string") return resolveSpeaker(t.speaker);
    if (typeof t.speakerName === "string") return t.speakerName as string;
    if (typeof t.role === "string") return t.role as string;
  }
  return "unknown";
}

function buildListening(
  lesson: ContentLesson,
  idx: number,
  source: LangCode,
  target: LangCode
): MultiExercise | null {
  if (!lesson?.dialogues?.length) return null;

  const firstDialogue = lesson.dialogues[0];
  if (!firstDialogue) return null;

  let turns = firstDialogue.turns as unknown;
  if (!turns) return null;

  if (!Array.isArray(turns) && typeof turns === "object") {
    turns = Object.values(turns as Record<string, unknown>);
  }
  if (!Array.isArray(turns) || turns.length === 0) return null;

  const lastTurn = turns[turns.length - 1];
  if (!lastTurn) return null;

  // ✅ FIXED: target text ONLY — no source fallback for targetAnswer
  const targetText = extractTurnText(lastTurn, target);
  if (!targetText) {
    console.warn(
      `⚠️ buildListening: no ${target} text in last turn (lesson ${lesson.id})`
    );
    return null;
  }

  // Build TTS text — prefer target, fallback to source for comprehension aid
  const ttsParts: string[] = [];
  for (const t of turns) {
    const text = extractTurnText(t, target) || extractTurnText(t, source);
    if (!text) continue;
    const speaker = extractSpeaker(t);
    ttsParts.push(`${speaker}: ${text}`);
  }

  if (ttsParts.length === 0) return null;

  const ttsText = ttsParts.join(" ");

  const speaker = extractSpeaker(lastTurn);
  const speakerEn =
    speaker === "Nurik" ? "Nurik" : speaker === "You" ? "the user" : speaker;
  const speakerHy =
    speaker === "Nurik" ? "Նուրիկը" : speaker === "You" ? "օգտատերը" : speaker;
  const speakerRu =
    speaker === "Nurik" ? "Нурик" : speaker === "You" ? "пользователь" : speaker;

  return {
    id: `${lesson.id}_e${idx}`,
    type: "listening",
    prompt: {
      en: `🎧 Listen to the dialogue and answer: What did ${speakerEn} say at the end?`,
      hy: `🎧 Լսիր երկխոսությունը և պատասխանիր՝ Ի՞նչ ասաց ${speakerHy} վերջում։`,
      ru: `🎧 Прослушайте диалог и ответьте: Что сказал ${speakerRu} в конце?`,
    },
    ttsText,
    ttsLang: target,
    targetAnswer: targetText,
    // ✅ Removed redundant lowercase variants (validator normalizes)
    acceptableAnswers: [targetText],
    hayqReward: HAYQ.DIALOGUE,
    hint: {
      en: `Hint: ${wordHint(targetText)}`,
      hy: `Հուշում՝ ${wordHint(targetText)}`,
      ru: `Подсказка: ${wordHint(targetText)}`,
    },
  };
}

// ─── LESSON GENERATOR ──────────────────────────────────────────────────

function generateExercises(
  lesson: ContentLesson,
  source: LangCode,
  target: LangCode
): MultiExercise[] {
  const out: MultiExercise[] = [];

  if (!lesson) {
    console.warn("⚠️ generateExercises: lesson is undefined");
    return out;
  }
  if (!Array.isArray(lesson.vocabulary)) {
    console.warn(`⚠️ ${lesson.id}: invalid vocabulary`);
    return out;
  }
  if (!Array.isArray(lesson.phrases)) {
    console.warn(`⚠️ ${lesson.id}: invalid phrases`);
    return out;
  }

  let exCounter = 0;

  // 1. Multiple choice on vocabulary
  const vocabCount = Math.min(LIMITS.MC_VOCAB, lesson.vocabulary.length);
  for (let i = 0; i < vocabCount; i++) {
    const ex = buildMC(lesson.vocabulary[i], exCounter, lesson, source, target, lesson.vocabulary);
    if (ex) {
      out.push(ex);
      exCounter++;
    }
  }

  // 2. Translation on phrases
  const translateCount = Math.min(LIMITS.TRANSLATE_PHRASES, lesson.phrases.length);
  for (let i = 0; i < translateCount; i++) {
    const ex = buildTranslate(lesson.phrases[i], exCounter, lesson, source, target);
    if (ex) {
      out.push(ex);
      exCounter++;
    }
  }

  // 3. Word order on next phrases
  const woEnd = Math.min(
    LIMITS.TRANSLATE_PHRASES + LIMITS.WORD_ORDER_PHRASES,
    lesson.phrases.length
  );
  for (let i = LIMITS.TRANSLATE_PHRASES; i < woEnd; i++) {
    const ex = buildWordOrder(lesson.phrases[i], exCounter, lesson, source, target);
    if (ex) {
      out.push(ex);
      exCounter++;
    }
  }

  // 4. Match pairs
  if (lesson.vocabulary.length >= 2) {
    const ex = buildMatchPairs(lesson, exCounter, source, target);
    if (ex) {
      out.push(ex);
      exCounter++;
    }
  }

  // 5. Listening from first dialogue
  if (Array.isArray(lesson.dialogues) && lesson.dialogues.length > 0) {
    const ex = buildListening(lesson, exCounter, source, target);
    if (ex) {
      out.push(ex);
      exCounter++;
    }
  }

  return out;
}

export function contentLessonToMulti(
  lesson: ContentLesson,
  pair: LangPair
): MultiLesson {
  const { source, target } = pairToLangs(pair);
  const exercises = generateExercises(lesson, source, target);

  const difficultyMap: Record<string, number> = {
    A1: 1,
    A2: 2,
    B1: 3,
    B2: 4,
    C1: 5,
    C2: 5,
  };

  // ✅ Realistic: 25 sec per exercise, min 5 min
  const estimatedMinutes = Math.max(
    5,
    Math.ceil((exercises.length * LIMITS.SECONDS_PER_EXERCISE) / 60)
  );

  return {
    id: lesson.id,
    unitId: lesson.worldId,
    cefr: lesson.difficulty,
    difficulty: difficultyMap[lesson.difficulty] ?? 1,
    title: lesson.title as Record<LangCode, string>,
    description: lesson.concept as Record<LangCode, string>,
    estimatedMinutes,
    hayqTotal: HAYQ.PERFECT_LESSON + exercises.length * HAYQ.CORRECT,
    exercises,
  };
}

// ─── REVIEW CHALLENGES ─────────────────────────────────────────────────

export function generateReviewChallenge(
  lessons: ContentLesson[],
  pair: LangPair,
  reviewIndex: number
): MultiLesson | null {
  // ✅ FIXED: guard
  if (!lessons || lessons.length === 0) {
    console.warn(`⚠️ generateReviewChallenge: empty lessons array`);
    return null;
  }

  const { source, target } = pairToLangs(pair);
  const allVocab = lessons.flatMap((l) => l.vocabulary ?? []);
  const allPhrases = lessons.flatMap((l) => l.phrases ?? []);

  if (allVocab.length === 0 && allPhrases.length === 0) {
    console.warn(`⚠️ generateReviewChallenge: no vocab or phrases to review`);
    return null;
  }

  const exercises: MultiExercise[] = [];
  let exCounter = 0;

  const vocabPicks = shuffle(allVocab).slice(0, 5);
  vocabPicks.forEach((v) => {
    const ex = buildMC(v, exCounter, lessons[0], source, target, allVocab);
    if (ex) {
      exercises.push(ex);
      exCounter++;
    }
  });

  const phrasePicks = shuffle(allPhrases).slice(0, 5);
  phrasePicks.forEach((ph) => {
    const ex = buildTranslate(ph, exCounter, lessons[0], source, target);
    if (ex) {
      exercises.push(ex);
      exCounter++;
    }
  });

  if (exercises.length === 0) return null;

  const difficultyMap: Record<string, number> = {
    A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 5,
  };
  const lastLesson = lessons[lessons.length - 1];

  const estimatedMinutes = Math.max(
    5,
    Math.ceil((exercises.length * LIMITS.SECONDS_PER_EXERCISE) / 60)
  );

  return {
    id: `review_${reviewIndex}_${lessons[0].id}`,
    unitId: lessons[0].worldId,
    cefr: lastLesson.difficulty,
    difficulty: difficultyMap[lastLesson.difficulty] ?? 2,
    title: {
      en: `Review Challenge ${reviewIndex}`,
      hy: `Կրկնության մարտահրավեր ${reviewIndex}`,
      ru: `Повторение ${reviewIndex}`,
    } as Record<LangCode, string>,
    description: {
      en: `Mixed practice from lessons ${lessons[0].id} – ${lastLesson.id}`,
      hy: `Խառը պրակտիկա նախորդ դասերից`,
      ru: `Смешанная практика предыдущих уроков`,
    } as Record<LangCode, string>,
    estimatedMinutes,
    hayqTotal: HAYQ.PERFECT_LESSON + exercises.length * HAYQ.CORRECT,
    exercises,
  };
}

// ─── PUBLIC API ────────────────────────────────────────────────────────

export function generateCurriculumForPair(pair: LangPair): {
  units: MultiUnit[];
  lessons: MultiLesson[];
} {
  const ordered = getAllLessonsOrdered();
  const lessons: MultiLesson[] = [];

  let reviewCounter = 0;
  let batch: ContentLesson[] = [];

  for (const l of ordered) {
    lessons.push(contentLessonToMulti(l, pair));
    batch.push(l);

    if (batch.length === LIMITS.REVIEW_BATCH) {
      reviewCounter++;
      const review = generateReviewChallenge(batch, pair, reviewCounter);
      if (review) lessons.push(review);
      batch = [];
    }
  }

  if (batch.length >= LIMITS.MIN_BATCH_FOR_REVIEW) {
    reviewCounter++;
    const review = generateReviewChallenge(batch, pair, reviewCounter);
    if (review) lessons.push(review);
  }

  const units: MultiUnit[] = WORLDS.map((w) => ({
    id: w.id,
    title: w.title as Record<LangCode, string>,
    description: w.description as Record<LangCode, string>,
    iconEmoji: w.iconEmoji,
    colorFrom: w.colorFrom,
    colorTo: w.colorTo,
    lessons: lessons.filter((l) => l.unitId === w.id).map((l) => l.id),
  }));

  return { units, lessons };
}

export { CONTENT_LESSONS, WORLDS };
export type { ContentLesson };