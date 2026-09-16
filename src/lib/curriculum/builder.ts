// src/lib/curriculum/builder.ts

import { LEXICON, lookupArmenian, lookupEnglish } from "../lexicon/dictionary";
import type { LangPair, MultiExercise } from "../i18n/multilingual";
import { TOPICS } from "./topics";
import type {
  CourseContent,
  ModuleContent,
  LessonContent,
  VocabularyEntry,
  DialogueScenario,
  MultiText,
  LangCode,
  TopicSpec,
} from "./types";

const LESSON_SIZE = 6;

// ─── HELPERS ─────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getWordTranslation(word: string, lang: LangCode): string {
  // Try dictionary lookup first
  const entry = lookupArmenian(word);
  if (entry) {
    if (lang === "hy") return entry.word;
    if (lang === "en") return entry.english[0] || word;
    if (lang === "ru") return entry.english[0] || word; // fallback
  }

  // Fallback: return word itself
  return word;
}

function createMultiText(word: string): MultiText {
  // Try to find in LEXICON
  const entry = lookupArmenian(word);
  if (entry) {
    return {
      en: entry.english[0] || word,
      hy: entry.word,
      ru: entry.english[0] || word, // fallback to English
    };
  }

  // If not found, use word for all languages
  return { en: word, hy: word, ru: word };
}

// ─── BUILD EXERCISES ─────────────────────────────────────────────────

function buildExercisesForVocab(
  lessonId: string,
  vocab: VocabularyEntry[],
  pair: LangPair,
): MultiExercise[] {
  const [src, tgt] = pair.split("-") as [LangCode, LangCode];
  const ex: MultiExercise[] = [];

  // ─── CREATE A DEDUPED LIST FOR DISTRACTORS ──────────────────────
  // This ensures we don't use duplicate target words as distractors
  const uniqueTargetWords: string[] = [];
  const uniqueVocab: VocabularyEntry[] = [];
  
  for (const v of vocab) {
    const target = v.word[tgt];
    if (!uniqueTargetWords.includes(target)) {
      uniqueTargetWords.push(target);
      uniqueVocab.push(v);
    }
  }

  vocab.forEach((v, i) => {
    const target = v.word[tgt];
    const prompt = v.word[src];
    
    // ─── GET DISTRACTORS WITH UNIQUE TARGET WORDS ──────────────────
    // Filter out the current word and any words with the same target translation
    const availableDistractors = uniqueVocab.filter(x => 
      x.id !== v.id && 
      x.word[tgt] !== target
    );
    
    // Shuffle and take up to 3 distractors
    const shuffledDistractors = shuffle([...availableDistractors]);
    const distractors = shuffledDistractors
      .slice(0, 3)
      .map(x => x.word[tgt]);
    
    // Ensure we have exactly 3 distractors (pad with fallbacks if needed)
    let finalDistractors = [...distractors];
    while (finalDistractors.length < 3) {
      // Find a fallback distractor from the full vocabulary
      const fallback = vocab.find(x => 
        x.id !== v.id && 
        x.word[tgt] !== target && 
        !finalDistractors.includes(x.word[tgt])
      );
      if (fallback) {
        finalDistractors.push(fallback.word[tgt]);
      } else {
        // If no more unique distractors, break to avoid infinite loop
        break;
      }
    }
    
    const options = shuffle([target, ...finalDistractors]);

    // Multiple choice
    ex.push({
      id: `${lessonId}_mc_${i}`,
      type: "multiple_choice",
      prompt: {
        en: `Choose the meaning of "${v.word.en}"`,
        hy: `Ընտրիր "${v.word.hy}"-ի թարգմանությունը`,
        ru: `Выбери перевод "${v.word.ru}"`,
      },
      options,
      targetAnswer: target,
      acceptableAnswers: [target],
      hayqReward: 5,
    });

    // Translate
    ex.push({
      id: `${lessonId}_tr_${i}`,
      type: "translate",
      prompt: {
        en: `Translate: "${prompt}"`,
        hy: `Թարգմանիր՝ "${prompt}"`,
        ru: `Переведи: "${prompt}"`,
      },
      targetAnswer: target,
      acceptableAnswers: [target],
      hayqReward: 10,
    });
  });

  // ─── MATCH PAIRS ──────────────────────────────────────────────────
  // ✅ FIX: Ensure all pairs have unique target values
  if (vocab.length >= 4) {
    // Get unique words for matching (avoid duplicates)
    const uniquePairs: [string, string][] = [];
    const usedTargets: string[] = [];
    
    for (const v of vocab.slice(0, 4)) {
      const left = v.word[src];
      const right = v.word[tgt];
      // Skip if this target is already used
      if (!usedTargets.includes(right)) {
        uniquePairs.push([left, right]);
        usedTargets.push(right);
      }
    }
    
    // If we have at least 2 unique pairs, add the exercise
    if (uniquePairs.length >= 2) {
      ex.push({
        id: `${lessonId}_match`,
        type: "match_pairs",
        prompt: {
          en: "Match the pairs",
          hy: "Կապիր զույգերը",
          ru: "Сопоставь пары",
        },
        targetAnswer: "",
        pairs: uniquePairs,
        hayqReward: 15,
      });
    }
  }

  return ex;
}

// ─── BUILD LESSONS ──────────────────────────────────────────────────

function buildLessons(
  moduleId: string,
  topicId: string,
  words: string[],
  pair: LangPair,
): LessonContent[] {
  const lessons: LessonContent[] = [];
  let order = 1;

  for (let i = 0; i < words.length; i += LESSON_SIZE) {
    const chunk = words.slice(i, i + LESSON_SIZE);
    if (chunk.length < 3) break;

    const lessonId = `${moduleId}_l${order}`;
    const vocab: VocabularyEntry[] = chunk.map((word, idx) => ({
      id: `${lessonId}_v${idx}`,
      word: createMultiText(word),
    }));

    const exercises = buildExercisesForVocab(lessonId, vocab, pair);

    lessons.push({
      id: lessonId,
      moduleId,
      order,
      title: {
        en: `${topicId.replace(/_/g, " ")} — Part ${order}`,
        hy: `Մաս ${order}`,
        ru: `Часть ${order}`,
      },
      estimatedMinutes: 5,
      vocabulary: vocab,
      phrases: [],
      exercises,
      dialogues: [],
      rewards: { baseHAYQ: 50, perfectBonus: 25 },
    });
    order++;
  }

  return lessons;
}

// ─── BUILD DIALOGUE ─────────────────────────────────────────────────

function buildDialogue(topicId: string): DialogueScenario | null {
  const map: Record<string, DialogueScenario["scenario"]> = {
    food_dining: "restaurant",
    travel: "hotel",
    transport: "airport",
    work: "interview",
    shopping: "shopping",
    health: "doctor",
    social_communication: "everyday",
  };

  const scenario = map[topicId];
  if (!scenario) return null;

  return {
    id: `${topicId}_dlg`,
    title: {
      en: `${scenario} dialogue`,
      hy: `Երկխոսություն`,
      ru: `Диалог`,
    },
    scenario,
    turns: [],
    hayqReward: 100,
  };
}

// ─── CACHE ──────────────────────────────────────────────────────────

const CACHE = new Map<LangPair, CourseContent>();

// ─── MAIN BUILD FUNCTION ────────────────────────────────────────────

export function buildCourse(pair: LangPair): CourseContent {
  const cached = CACHE.get(pair);
  if (cached) return cached;

  const courseId = `course_${pair}`;
  const modules: ModuleContent[] = TOPICS.map((t, i) => {
    const moduleId = `${courseId}_${t.id}`;
    const lessons = buildLessons(moduleId, t.id, t.words, pair);

    // Add dialogue to last lesson if available
    const dlg = buildDialogue(t.id);
    if (dlg && lessons.length > 0) {
      lessons[lessons.length - 1].dialogues.push(dlg);
    }

    return {
      id: moduleId,
      courseId,
      order: i + 1,
      title: t.title,
      description: t.title,
      icon: t.icon,
      lessons,
    };
  }).filter(m => m.lessons.length > 0);

  const course: CourseContent = {
    id: courseId,
    pair,
    title: {
      en: "NUR Lingo Course",
      hy: "ՆՈՒՐ Լինգո Դասընթաց",
      ru: "Курс NUR Lingo",
    },
    modules,
  };

  CACHE.set(pair, course);
  return course;
}

// ─── LOOKUP FUNCTIONS ───────────────────────────────────────────────

export function getModule(pair: LangPair, moduleId: string): ModuleContent | null {
  return buildCourse(pair).modules.find(m => m.id === moduleId) ?? null;
}

export function getLesson(pair: LangPair, lessonId: string): LessonContent | null {
  for (const m of buildCourse(pair).modules) {
    const l = m.lessons.find(x => x.id === lessonId);
    if (l) return l;
  }
  return null;
}

export function courseStats(pair: LangPair) {
  const c = buildCourse(pair);
  const totalLessons = c.modules.reduce((s, m) => s + m.lessons.length, 0);
  const totalExercises = c.modules.reduce(
    (s, m) => s + m.lessons.reduce((s2, l) => s2 + l.exercises.length, 0),
    0
  );
  return {
    modules: c.modules.length,
    lessons: totalLessons,
    exercises: totalExercises,
  };
}

// ─── NUR Lingo COMPATIBILITY ────────────────────────────────────────

/**
 * Get course for NUR Lingo's database format
 */
export function getCourseForDatabase(pair: LangPair): any {
  const course = buildCourse(pair);
  return {
    units: course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      iconEmoji: m.icon,
      lessons: m.lessons.map((l) => l.id),
    })),
    lessons: course.modules.flatMap((m) =>
      m.lessons.map((l) => ({
        id: l.id,
        unitId: m.id,
        title: l.title,
        concept: l.title,
        difficulty: "A1" as const,
        vocabulary: l.vocabulary.map((v) => ({
          id: v.id,
          hy: v.word.hy,
          en: v.word.en,
          ru: v.word.ru,
        })),
        phrases: l.phrases.map((p) => ({
          id: p.id,
          hy: p.text.hy,
          en: p.text.en,
          ru: p.text.ru,
        })),
        dialogues: l.dialogues.map((d) => ({
          id: d.id,
          title: d.title,
          turns: d.turns,
        })),
        exercises: l.exercises,
      }))
    ),
  };
}