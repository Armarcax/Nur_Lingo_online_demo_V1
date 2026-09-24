/**
 * NUR Lingo — Content Generator
 * Turns the unified ContentLesson database into MultiLesson[] for any LangPair.
 * Plugs into the existing engine; no UI/architecture changes.
 *
 * Merged from v1 (stability) + v2 (advanced features: synonyms, sentence patterns)
 */

import type { LangCode, LangPair, MultiExercise, MultiLesson, MultiUnit } from "../i18n/multilingual";
import {
  CONTENT_LESSONS,
  WORLDS,
  getAllLessonsOrdered,
  type ContentLesson,
  type PhraseItem,
  type VocabItem,
} from "./database";

// ✅ ՈՒՂՂՎԱԾ IMPORT
import { lookupArmenian, getSynonyms, lookupSentencePattern } from "../lexicon/dictionary";

// ─── HAYQ REWARDS ──────────────────────────────────────────────────────────

const HAYQ = {
  CORRECT: 10,
  PERFECT_LESSON: 50,
  DIALOGUE: 100,
  WORLD: 500,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function pairToLangs(pair: LangPair): { source: LangCode; target: LangCode } {
  const [s, t] = pair.split("-") as [LangCode, LangCode];
  return { source: s, target: t };
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickDistractors<T>(pool: T[], exclude: T, n: number, key: (x: T) => string): T[] {
  const filtered = pool.filter((x) => key(x) !== key(exclude));
  return shuffle(filtered).slice(0, n);
}

function langName(inLang: LangCode, target: LangCode): string {
  const names: Record<LangCode, Record<LangCode, string>> = {
    en: { en: "English", hy: "Armenian", ru: "Russian" },
    hy: { en: "անգլերեն", hy: "հայերեն", ru: "ռուսերեն" },
    ru: { en: "английский", hy: "армянский", ru: "русский" },
  };
  return names[inLang][target];
}

// ─── DICTIONARY HELPERS ─────────────────────────────────────────────────────

function getWordSynonyms(word: string, target: LangCode): string[] {
  const manualSynonyms: Record<string, Record<LangCode, string[]>> = {
    "բարև": { hy: ["ողջույն", "բարի լույս"], en: [], ru: [] },
    "ողջույն": { hy: ["բարև", "բարի լույս"], en: [], ru: [] },
    "շնորհակալություն": { hy: ["շնորհակալ եմ", "մերսի"], en: [], ru: [] },
    "այո": { hy: ["հա", "համաձայն"], en: [], ru: [] },
    "ոչ": { hy: ["չէ", "չեմ"], en: [], ru: [] },
    "լավ": { hy: ["կարգին", "նորմալ", "օքեյ"], en: [], ru: [] },
    "hello": { en: ["hi", "hey", "good morning", "greetings"], hy: [], ru: [] },
    "thank you": { en: ["thanks", "thanks a lot", "many thanks"], hy: [], ru: [] },
    "yes": { en: ["yeah", "sure", "okay", "yep"], hy: [], ru: [] },
    "no": { en: ["nope", "nah", "not"], hy: [], ru: [] },
    "good": { en: ["fine", "great", "excellent", "okay"], hy: [], ru: [] },
    "привет": { ru: ["здравствуй", "здравствуйте", "добрый день"], en: [], hy: [] },
    "спасибо": { ru: ["благодарю", "мерси"], en: [], hy: [] },
    "да": { ru: ["ага", "так", "конечно"], en: [], hy: [] },
    "нет": { ru: ["не", "никак"], en: [], hy: [] },
    "хорошо": { ru: ["отлично", "прекрасно", "нормально"], en: [], hy: [] },
  };

  const key = word.toLowerCase().trim();
  return manualSynonyms[key]?.[target] || [];
}

function getSentenceVariants(phrase: string, target: LangCode): string[] {
  const patterns: Record<string, Record<LangCode, string[]>> = {
    "how are you": {
      en: ["how are you", "how're you", "how are you doing"],
      hy: ["ինչպես ես", "ինչպե՞ս ես", "ինչպես եք"],
      ru: ["как дела", "как ты", "как поживаешь"],
    },
    "what is your name": {
      en: ["what is your name", "what's your name", "who are you"],
      hy: ["ինչ է քո անունը", "անունդ ինչ է", "ով ես դու"],
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
    "goodbye": {
      en: ["goodbye", "bye", "see you"],
      hy: ["ցտեսություն", "կտեսնվենք"],
      ru: ["до свидания", "пока"],
    },
  };

  const key = phrase.toLowerCase().trim();
  return patterns[key]?.[target] || [];
}

// ─── EXERCISE BUILDERS ──────────────────────────────────────────────────────

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
    console.warn(`⚠️ buildMC: missing "${target}" for vocab item "${v.id}" (${v.hy}) in lesson ${lesson.id}`);
    return null;
  }

  const distractors = pickDistractors(vocabPool, v, 3, (x) => x.id)
    .map((d) => d[target])
    .filter(Boolean);
  const options = shuffle([correct, ...distractors]);
  const synonyms = getWordSynonyms(v[target], target);

  return {
    id: `${lesson.id}_e${idx}`,
    type: "multiple_choice",
    prompt: {
      en: `What is "${v.en}" in ${langName("en", target)}?`,
      hy: `Ի՞նչ է «${v.hy}»-ն ${langName("hy", target)}:`,
      ru: `Как «${v.ru}» по-${langName("ru", target).toLowerCase()}?`,
    },
    targetAnswer: correct,
    acceptableAnswers: [correct, ...synonyms].filter(Boolean),
    options,
    hayqReward: HAYQ.CORRECT,
    hint: {
      en: `Think about the ${langName("en", target)} translation of "${v.en}"`,
      hy: `Մտածիր "${v.hy}"-ի ${langName("hy", target)} թարգմանության մասին`,
      ru: `Подумай о переводе "${v.ru}" на ${langName("ru", target).toLowerCase()}`,
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
    console.warn(`⚠️ buildTranslate: missing "${target}" for phrase "${ph.id}" in lesson ${lesson.id}`);
    return null;
  }

  const altsTarget = ph.alt?.[target] ?? [];
  const patternVariants = getSentenceVariants(ph.en, target);
  const allAnswers = [targetAnswer, ...altsTarget, ...patternVariants];
  const uniqueAnswers = [...new Set(allAnswers.filter(Boolean))];

  return {
    id: `${lesson.id}_e${idx}`,
    type: "translate",
    prompt: {
      en: `Translate to ${langName("en", target)}: "${ph.en}"`,
      hy: `Թարգմանի՛ր ${langName("hy", target)}՝ «${ph.hy}»։`,
      ru: `Переведите на ${langName("ru", target).toLowerCase()}: «${ph.ru}»`,
    },
    targetAnswer,
    acceptableAnswers: uniqueAnswers,
    hayqReward: HAYQ.CORRECT,
    hint: {
      en: `Translate to ${langName("en", target)}`,
      hy: `Թարգմանիր ${langName("hy", target)}`,
      ru: `Переведи на ${langName("ru", target).toLowerCase()}`,
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
    console.warn(`⚠️ buildWordOrder: missing "${target}" for phrase "${ph.id}" in lesson ${lesson.id}`);
    return null;
  }

  const words = sentence.replace(/[.!?,;:«»"]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length < 2) return null;

  const patternVariants = getSentenceVariants(ph.en, target);
  const altsTarget = ph.alt?.[target] ?? [];
  const allAnswers = [sentence, ...altsTarget, ...patternVariants];
  const uniqueAnswers = [...new Set(allAnswers.filter(Boolean))];

  return {
    id: `${lesson.id}_e${idx}`,
    type: "word_order",
    prompt: {
      en: `Arrange the words: "${ph.en}"`,
      hy: `Դասավորի՛ր բառերը՝ «${ph.hy}»։`,
      ru: `Расставьте слова: «${ph.ru}»`,
    },
    targetAnswer: sentence,
    acceptableAnswers: uniqueAnswers,
    words: shuffle(words),
    hayqReward: HAYQ.CORRECT,
  };
}

function buildMatchPairs(
  lesson: ContentLesson,
  idx: number,
  source: LangCode,
  target: LangCode
): MultiExercise | null {
  if (!lesson.vocabulary || lesson.vocabulary.length === 0) {
    return null;
  }

  const pairs = lesson.vocabulary
    .slice(0, 6)
    .map((v) => {
      const s = v[source];
      const t = v[target];
      if (!s || !t) return null;
      return [s, t] as [string, string];
    })
    .filter((p): p is [string, string] => p !== null);

  if (pairs.length < 2) return null;

  return {
    id: `${lesson.id}_e${idx}`,
    type: "match_pairs",
    prompt: {
      en: `Match the words:`,
      hy: `Համապատասխանեցրու բառերը։`,
      ru: `Соедините слова:`,
    },
    targetAnswer: pairs.map((p) => p[1]).join("|"),
    acceptableAnswers: [],
    pairs: shuffle(pairs),
    hayqReward: HAYQ.CORRECT * 2,
  };
}

// ============================================================
// ✅ BUILD LISTENING - FULLY FIXED for both array and object turns
// ============================================================

function buildListening(
  lesson: ContentLesson,
  idx: number,
  source: LangCode,
  target: LangCode
): MultiExercise | null {
  // 1. Ստուգել lesson-ի վավերականությունը
  if (!lesson) {
    console.warn(`⚠️ buildListening: lesson is undefined`);
    return null;
  }

  if (!lesson.dialogues || lesson.dialogues.length === 0) {
    console.warn(`⚠️ buildListening: no dialogues in lesson ${lesson.id}`);
    return null;
  }

  const firstDialogue = lesson.dialogues[0];
  if (!firstDialogue) {
    console.warn(`⚠️ buildListening: first dialogue is undefined in lesson ${lesson.id}`);
    return null;
  }

  // ✅ Get turns - handle both array and object
  let turns = firstDialogue.turns;
  if (!turns) {
    console.warn(`⚠️ buildListening: no turns in dialogue ${firstDialogue.id}`);
    return null;
  }

  // If turns is an object with numeric keys, convert to array
  if (!Array.isArray(turns) && typeof turns === 'object') {
    turns = Object.values(turns);
  }

  if (!Array.isArray(turns) || turns.length === 0) {
    console.warn(`⚠️ buildListening: turns is not an array or empty in dialogue ${firstDialogue.id}`);
    return null;
  }

  const lastTurn = turns[turns.length - 1];
  if (!lastTurn) {
    console.warn(`⚠️ buildListening: last turn is undefined in dialogue ${firstDialogue.id}`);
    return null;
  }

  // ✅ Helper function to extract text from a turn (works with both array and object)
  function extractTurnText(turn: any, lang: LangCode): string | null {
    if (!turn) return null;
    
    // If turn is an array: [speaker, text] or [speaker, text, extra]
    if (Array.isArray(turn)) {
      // Try to find text by language in array elements
      for (const item of turn) {
        if (typeof item === 'string' && item.length > 0) {
          // If it's a string and not a known speaker name, assume it's text
          const lower = item.toLowerCase().trim();
          if (lower !== 'nurik' && lower !== 'user' && lower !== 'nuri' && 
              lower !== 'you' && lower !== 'nurlingo' && lower !== 'nur') {
            return item;
          }
        }
      }
      // If no text found, return the last string in the array
      for (let i = turn.length - 1; i >= 0; i--) {
        if (typeof turn[i] === 'string' && turn[i].length > 0) {
          return turn[i];
        }
      }
      return null;
    }
    
    // If turn is an object
    if (typeof turn === 'object') {
      // Try direct language keys
      if (turn[lang] && typeof turn[lang] === 'string') {
        return turn[lang];
      }
      // Try other common keys
      if (turn.text && typeof turn.text === 'string') return turn.text;
      if (turn.content && typeof turn.content === 'string') return turn.content;
      if (turn.message && typeof turn.message === 'string') return turn.message;
      if (turn.sentence && typeof turn.sentence === 'string') return turn.sentence;
      
      // Try to find any string value in the object
      for (const key of Object.keys(turn)) {
        if (typeof turn[key] === 'string' && turn[key].length > 0) {
          // Skip speaker-related keys
          if (key === 'speaker' || key === 'speakerName' || key === 'role' || 
              key === 'id' || key === 'type' || key === 'lang') {
            continue;
          }
          return turn[key];
        }
      }
      return null;
    }
    
    // If turn is a string
    if (typeof turn === 'string') {
      return turn;
    }
    
    return null;
  }

  // ✅ Helper function to extract speaker from a turn
  function extractSpeaker(turn: any): string {
    if (!turn) return 'unknown';
    
    // If turn is an array: [speaker, text]
    if (Array.isArray(turn) && turn.length > 0) {
      const first = String(turn[0] || '').toLowerCase();
      if (first === 'nurik' || first === 'nuri' || first === 'nur') return 'Nurik';
      if (first === 'user' || first === 'you' || first === 'student') return 'You';
      return first || 'unknown';
    }
    
    // If turn is an object
    if (typeof turn === 'object') {
      if (turn.speaker) {
        const sp = String(turn.speaker).toLowerCase();
        if (sp === 'nurik' || sp === 'nuri' || sp === 'nur') return 'Nurik';
        if (sp === 'user' || sp === 'you' || sp === 'student') return 'You';
        return turn.speaker;
      }
      if (turn.speakerName) return turn.speakerName;
      if (turn.role) return turn.role;
      if (turn.id) return turn.id;
    }
    
    return 'unknown';
  }

  // ✅ Extract text from last turn
  const targetText = extractTurnText(lastTurn, target);
  const sourceText = extractTurnText(lastTurn, source);
  const finalTargetText = targetText || sourceText;

  if (!finalTargetText) {
    console.warn(`⚠️ buildListening: missing both "${target}" and "${source}" for turn in lesson ${lesson.id}`);
    console.warn(`   Turn type: ${Array.isArray(lastTurn) ? 'array' : typeof lastTurn}`);
    console.warn(`   Turn value:`, lastTurn);
    return null;
  }

  // ✅ Build TTS text from all turns
  const ttsParts: string[] = [];
  for (let i = 0; i < turns.length; i++) {
    const t = turns[i];
    const text = extractTurnText(t, target) || extractTurnText(t, source);
    if (text) {
      const speaker = extractSpeaker(t);
      const displayName = speaker === 'Nurik' || speaker === 'nurik' ? 'Nurik' :
                          speaker === 'You' || speaker === 'you' ? 'You' :
                          speaker === 'Nuri' || speaker === 'nuri' ? 'Nuri' : speaker;
      ttsParts.push(`${displayName}: ${text}`);
    }
  }

  if (ttsParts.length === 0) {
    console.warn(`⚠️ buildListening: no valid turns for TTS in lesson ${lesson.id}`);
    return null;
  }

  const ttsText = ttsParts.join(" ");

  // ✅ Get speaker name for prompt
  const speaker = extractSpeaker(lastTurn);
  const speakerName = speaker === 'Nurik' || speaker === 'nurik' ? 'Nurik' :
                      speaker === 'You' || speaker === 'you' ? 'the user' :
                      speaker === 'Nuri' || speaker === 'nuri' ? 'Nuri' : speaker;
  
  const speakerNameHy = speaker === 'Nurik' || speaker === 'nurik' ? 'Նուրիկը' :
                        speaker === 'You' || speaker === 'you' ? 'օգտատերը' :
                        speaker === 'Nuri' || speaker === 'nuri' ? 'Նուրին' : speaker;
  
  const speakerNameRu = speaker === 'Nurik' || speaker === 'nurik' ? 'Нурик' :
                        speaker === 'You' || speaker === 'you' ? 'пользователь' :
                        speaker === 'Nuri' || speaker === 'nuri' ? 'Нури' : speaker;

  return {
    id: `${lesson.id}_e${idx}`,
    type: "listening",
    prompt: {
      en: `🎧 Listen to the dialogue and answer: What did ${speakerName} say at the end?`,
      hy: `🎧 Լսիր երկխոսությունը և պատասխանիր՝ Ի՞նչ ասաց ${speakerNameHy} վերջում։`,
      ru: `🎧 Прослушайте диалог и ответьте: Что сказал ${speakerNameRu} в конце?`,
    },
    ttsText: ttsText,
    ttsLang: target || source,
    targetAnswer: finalTargetText,
    acceptableAnswers: [
      finalTargetText,
      finalTargetText.toLowerCase(),
      finalTargetText.trim(),
      finalTargetText.toLowerCase().trim(),
    ],
    hayqReward: HAYQ.DIALOGUE,
  };
}

// ─── LESSON GENERATOR ──────────────────────────────────────────────────────

function generateExercises(lesson: ContentLesson, source: LangCode, target: LangCode): MultiExercise[] {
  const out: MultiExercise[] = [];

  if (!lesson) {
    console.warn("⚠️ Lesson is undefined");
    return out;
  }

  if (!lesson.vocabulary || !Array.isArray(lesson.vocabulary)) {
    console.warn(`⚠️ Lesson ${lesson.id} has invalid vocabulary`);
    return out;
  }

  if (!lesson.phrases || !Array.isArray(lesson.phrases)) {
    console.warn(`⚠️ Lesson ${lesson.id} has invalid phrases`);
    return out;
  }

  if (!lesson.dialogues || !Array.isArray(lesson.dialogues)) {
    console.warn(`⚠️ Lesson ${lesson.id} has invalid dialogues`);
    return out;
  }

  let exCounter = 0;

  // 1) Multiple choice on vocabulary (first 6 items)
  const vocabCount = Math.min(6, lesson.vocabulary.length);
  for (let i = 0; i < vocabCount; i++) {
    const vocab = lesson.vocabulary[i];
    if (vocab) {
      const ex = buildMC(vocab, exCounter, lesson, source, target, lesson.vocabulary);
      if (ex) {
        out.push(ex);
        exCounter++;
      }
    }
  }

  // 2) Translation on phrases (first 6 phrases)
  const phraseCount = Math.min(6, lesson.phrases.length);
  for (let i = 0; i < phraseCount; i++) {
    const phrase = lesson.phrases[i];
    if (phrase) {
      const ex = buildTranslate(phrase, exCounter, lesson, source, target);
      if (ex) {
        out.push(ex);
        exCounter++;
      }
    }
  }

  // 3) Word order on shorter phrases (next 3)
  for (let i = 6; i < Math.min(9, lesson.phrases.length); i++) {
    const phrase = lesson.phrases[i];
    if (phrase) {
      const ex = buildWordOrder(phrase, exCounter, lesson, source, target);
      if (ex) {
        out.push(ex);
        exCounter++;
      }
    }
  }

  // 4) Match pairs from vocabulary
  if (lesson.vocabulary.length >= 2) {
    const mp = buildMatchPairs(lesson, exCounter, source, target);
    if (mp) {
      out.push(mp);
      exCounter++;
    }
  }

  // 5) Listening on the first dialogue
  if (lesson.dialogues.length > 0) {
    const li = buildListening(lesson, exCounter, source, target);
    if (li) {
      out.push(li);
      exCounter++;
    }
  }

  return out;
}

export function contentLessonToMulti(lesson: ContentLesson, pair: LangPair): MultiLesson {
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

  return {
    id: lesson.id,
    unitId: lesson.worldId,
    cefr: lesson.difficulty,
    difficulty: difficultyMap[lesson.difficulty] ?? 1,
    title: lesson.title as any,
    description: lesson.concept as any,
    estimatedMinutes: 8,
    hayqTotal: HAYQ.PERFECT_LESSON + exercises.length * HAYQ.CORRECT,
    exercises,
  };
}

// ─── REVIEW CHALLENGES ─────────────────────────────────────────────────────

export function generateReviewChallenge(
  lessons: ContentLesson[],
  pair: LangPair,
  reviewIndex: number
): MultiLesson {
  const { source, target } = pairToLangs(pair);
  const allVocab = lessons.flatMap((l) => l.vocabulary);
  const allPhrases = lessons.flatMap((l) => l.phrases);
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

  const difficultyMap: Record<string, number> = {
    A1: 1,
    A2: 2,
    B1: 3,
    B2: 4,
    C1: 5,
    C2: 5,
  };
  const lastLesson = lessons[lessons.length - 1];

  return {
    id: `review_${reviewIndex}_${lessons[0].id}`,
    unitId: lessons[0].worldId,
    cefr: lastLesson.difficulty,
    difficulty: difficultyMap[lastLesson.difficulty] ?? 2,
    title: {
      en: `Review Challenge ${reviewIndex}`,
      hy: `Կրկնության մարտահրավեր ${reviewIndex}`,
      ru: `Повторение ${reviewIndex}`,
    } as any,
    description: {
      en: `Mixed practice from lessons ${lessons[0].id} – ${lastLesson.id}`,
      hy: `Խառը պրակտիկա նախորդ դասերից`,
      ru: `Смешанная практика предыдущих уроков`,
    } as any,
    estimatedMinutes: 10,
    hayqTotal: HAYQ.PERFECT_LESSON + exercises.length * HAYQ.CORRECT,
    exercises,
  };
}

// ─── PUBLIC API ─────────────────────────────────────────────────────────────

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
    if (batch.length === 5) {
      reviewCounter++;
      lessons.push(generateReviewChallenge(batch, pair, reviewCounter));
      batch = [];
    }
  }

  if (batch.length >= 3) {
    reviewCounter++;
    lessons.push(generateReviewChallenge(batch, pair, reviewCounter));
  }

  const units: MultiUnit[] = WORLDS.map((w) => ({
    id: w.id,
    title: w.title as any,
    description: w.description as any,
    iconEmoji: w.iconEmoji,
    colorFrom: w.colorFrom,
    colorTo: w.colorTo,
    lessons: lessons.filter((l) => l.unitId === w.id).map((l) => l.id),
  }));

  return { units, lessons };
}

export { CONTENT_LESSONS, WORLDS };
export type { ContentLesson };