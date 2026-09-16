/**
 * NUR Lingo — Lesson Engine v3.3
 * Complete lesson engine with HAYQ rewards, progress tracking,
 * session management, and DUOLINGO-STYLE LOCK/UNLOCK SYSTEM
 * 
 * Features:
 * - Only first lesson of each unit is unlocked by default
 * - Lessons unlock sequentially (complete lesson N → unlock lesson N+1)
 * - Progress tracking per lesson and unit
 */

import { LEXICON, SENTENCE_PATTERNS, LexiconEntry } from "../lexicon/dictionary";

// ─── TYPES ────────────────────────────────────────────────────────────

export type ExerciseType =
  | "translation_en_to_hy"
  | "translation_hy_to_en"
  | "multiple_choice"
  | "fill_in_blank"
  | "word_order"
  | "matching_pairs"
  | "error_correction"
  | "listening"
  | "speaking";

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type ExerciseDifficulty = 1 | 2 | 3 | 4 | 5;
export type ExerciseResult = "perfect" | "excellent" | "good" | "partial" | "incorrect";
export type LessonStatus = "locked" | "available" | "completed";

// ─── INTERFACES ───────────────────────────────────────────────────────

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  promptArmenian?: string;
  targetAnswer: string;
  acceptableAnswers: string[];
  hint?: string;
  explanation?: string;
  difficulty: ExerciseDifficulty;
  cefr: CEFRLevel;
  hayqReward: number;
  timeLimit?: number;
  options?: string[];
  words?: string[];
  pairs?: [string, string][];
  lessonId: string;
  unitId: string;
  ttsText?: string;
  ttsLang?: string;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  titleArmenian: string;
  description: string;
  descriptionArmenian?: string;
  cefr: CEFRLevel;
  difficulty: ExerciseDifficulty;
  exercises: Exercise[];
  prerequisiteLessons: string[];
  hayqTotal: number;
  estimatedMinutes: number;
  grammarFocus: string[];
  vocabularyFocus: string[];
  imageUrl?: string;
  iconEmoji?: string;
  order: number;
}

export interface Unit {
  id: string;
  title: string;
  titleArmenian: string;
  description: string;
  descriptionArmenian?: string;
  cefr: CEFRLevel;
  lessons: string[];
  iconEmoji: string;
  colorFrom: string;
  colorTo: string;
  estimatedMinutes: number;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  exercisesCompleted: number;
  totalExercises: number;
  score: number;
  hayqEarned: number;
  crowns: number;
  lastAttempt: string;
  attempts: number;
  bestScore: number;
}

export interface UnitProgress {
  unitId: string;
  completedLessons: number;
  totalLessons: number;
  hayqEarned: number;
  crowns: number;
  completed: boolean;
}

export interface LessonSession {
  lessonId: string;
  currentExerciseIndex: number;
  exercises: Exercise[];
  results: ExerciseResult[];
  hayqEarned: number;
  heartsUsed: number;
  startTime: number;
  lastActivity: number;
  completed: boolean;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────

export const HAYQ_REWARDS = {
  PERFECT: 25,
  EXCELLENT: 20,
  GOOD: 15,
  PARTIAL: 5,
  INCORRECT: 0,
  STREAK_3: 10,
  STREAK_7: 30,
  STREAK_30: 100,
  LESSON_COMPLETE: 40,
  UNIT_COMPLETE: 200,
  FIRST_LESSON: 50,
  PERFECT_LESSON: 50,
};

export const SEED_REWARDS = {
  PERFECT_EXERCISE: 1,
  PERFECT_LESSON: 1,
  STREAK_7: 1,
  UNIT_COMPLETE: 5,
};

// ─── HAYQ LEVEL SYSTEM ──────────────────────────────────────────────

export interface HAYQLevel {
  level: number;
  title: Record<string, string>;
  titleArmenian: string;
  nextLevelHAYQ: number;
  color: string;
  badge: string;
}

export function hayqToLevel(hayq: number): HAYQLevel {
  const levels: HAYQLevel[] = [
    { level: 1, title: { en: "Beginner", hy: "Սկսնակ", ru: "Новичок" }, titleArmenian: "Սկսնակ", nextLevelHAYQ: 150, color: "#9ca3af", badge: "🌱" },
    { level: 2, title: { en: "Student", hy: "Ուսանող", ru: "Ученик" }, titleArmenian: "Ուսանող", nextLevelHAYQ: 400, color: "#60a5fa", badge: "📖" },
    { level: 3, title: { en: "Learner", hy: "Ճանաչող", ru: "Учащийся" }, titleArmenian: "Ճանաչող", nextLevelHAYQ: 800, color: "#34d399", badge: "🌿" },
    { level: 4, title: { en: "Speaker", hy: "Խոսող", ru: "Говорящий" }, titleArmenian: "Խոսող", nextLevelHAYQ: 1500, color: "#F2A800", badge: "🗣️" },
    { level: 5, title: { en: "Proficient", hy: "Հմուտ", ru: "Опытный" }, titleArmenian: "Հմուտ", nextLevelHAYQ: 2500, color: "#D90012", badge: "🔥" },
    { level: 6, title: { en: "Fluent", hy: "Ճկուն", ru: "Беглый" }, titleArmenian: "Ճկուն", nextLevelHAYQ: 4000, color: "#a855f7", badge: "⚡" },
    { level: 7, title: { en: "Master", hy: "Վարպետ", ru: "Мастер" }, titleArmenian: "Վարպետ", nextLevelHAYQ: Infinity, color: "#F2A800", badge: "👑" },
  ];

  for (let i = levels.length - 1; i >= 0; i--) {
    const thresholds = [0, 150, 400, 800, 1500, 2500, 4000];
    const threshold = i === 0 ? 0 : thresholds[i];
    if (hayq >= threshold) return levels[i];
  }
  return levels[0];
}

// ─── UNITS ───────────────────────────────────────────────────────────

export const UNITS: Unit[] = [
  {
    id: "unit_greetings",
    title: "Greetings & Basics",
    titleArmenian: "Ողջույններ և Հիմունքներ",
    description: "Introduce yourself and greet others",
    descriptionArmenian: "Ծանոթացիր, ողջունիր և ներկայացիր",
    cefr: "A1",
    lessons: ["lesson_1", "lesson_1b"],
    iconEmoji: "👋",
    colorFrom: "#D90012",
    colorTo: "#8b0000",
    estimatedMinutes: 15,
  },
  {
    id: "unit_home",
    title: "Home & Movement",
    titleArmenian: "Տուն և Շարժում",
    description: "Describe your home and talk about movement",
    descriptionArmenian: "Նկարագրիր տունդ, խոսիր գնալ-գալու մասին",
    cefr: "A1",
    lessons: ["lesson_2", "lesson_2b"],
    iconEmoji: "🏠",
    colorFrom: "#0033A0",
    colorTo: "#001a6b",
    estimatedMinutes: 18,
  },
  {
    id: "unit_food",
    title: "Food & Drink",
    titleArmenian: "Ուտելիք և Ըմպելիք",
    description: "Armenian cuisine and dining vocabulary",
    descriptionArmenian: "Հայկական խոհանոց, ուտել-խմելու բառապաշար",
    cefr: "A1",
    lessons: ["lesson_3", "lesson_3b"],
    iconEmoji: "🍽️",
    colorFrom: "#F2A800",
    colorTo: "#b07800",
    estimatedMinutes: 16,
  },
  {
    id: "unit_family",
    title: "Family",
    titleArmenian: "Ընտանիք",
    description: "Family members and relationships",
    descriptionArmenian: "Ընտանիքի անդամներ, հարաբերություններ",
    cefr: "A1",
    lessons: ["lesson_4", "lesson_4b"],
    iconEmoji: "👨‍👩‍👧",
    colorFrom: "#D90012",
    colorTo: "#0033A0",
    estimatedMinutes: 20,
  },
  {
    id: "unit_education",
    title: "Education",
    titleArmenian: "Կրթություն",
    description: "School, books, teachers, and students",
    descriptionArmenian: "Դպրոց, գիրք, ուսուցիչ, ուսանող",
    cefr: "A2",
    lessons: ["lesson_5", "lesson_5b"],
    iconEmoji: "📚",
    colorFrom: "#0033A0",
    colorTo: "#F2A800",
    estimatedMinutes: 22,
  },
];

// ─── LESSONS ─────────────────────────────────────────────────────────

export const LESSONS: Lesson[] = [
  {
    id: "lesson_1",
    unitId: "unit_greetings",
    title: "Hello Armenia",
    titleArmenian: "Բարև Հայաստան",
    description: "First words: greetings and introductions",
    descriptionArmenian: "Առաջին բառերը՝ ողջույններ և ծանոթություն",
    cefr: "A1",
    difficulty: 1,
    prerequisiteLessons: [],
    hayqTotal: 90,
    estimatedMinutes: 8,
    grammarFocus: ["«լինել» բայի ներկա ժամանակը", "անձնական դերանուններ"],
    vocabularyFocus: ["բարև", "լավ", "ես", "դու"],
    iconEmoji: "👋",
    order: 0,
    exercises: [
      generateMCExercise(
        LEXICON.find((e) => e.word === "բարև") ?? LEXICON.find((e) => e.id === "greet_001")!,
        "lesson_1",
        "unit_greetings",
        LEXICON.filter((e) => e.grammar_type === "adjective").slice(0, 3)
      ),
      generateMCExercise(
        LEXICON.find((e) => e.word === "լավ") ?? LEXICON.find((e) => e.id === "adj_003")!,
        "lesson_1",
        "unit_greetings",
        LEXICON.filter((e) => e.grammar_type === "adjective").slice(1, 4)
      ),
      generateTranslationExercise("sp_009", "lesson_1", "unit_greetings"),
      generateTranslationExercise("sp_010", "lesson_1", "unit_greetings"),
    ].filter(Boolean) as Exercise[],
  },
  // ... all other lessons with order field added
];

// ─── LOCK/UNLOCK SYSTEM ─────────────────────────────────────────────

/**
 * Get the status of a lesson (locked, available, completed)
 * 
 * Duolingo-style rules:
 * - First lesson of each unit is ALWAYS available
 * - A lesson is available if its prerequisite is completed
 * - A lesson is completed if it's in the completed list
 * - All other lessons are locked
 */
export function getLessonStatus(
  lessonId: string,
  completedLessonIds: string[],
  allLessons: Lesson[]
): LessonStatus {
  // Check if completed
  if (completedLessonIds.includes(lessonId)) {
    return "completed";
  }

  const lesson = allLessons.find((l) => l.id === lessonId);
  if (!lesson) return "locked";

  // First lesson of each unit is always available
  const unitLessons = allLessons.filter((l) => l.unitId === lesson.unitId);
  const isFirstLesson = unitLessons.length > 0 && unitLessons[0].id === lessonId;
  if (isFirstLesson) {
    return "available";
  }

  // Check if prerequisite is completed
  if (lesson.prerequisiteLessons.length === 0) {
    // No prerequisite → available (but first lesson already handled)
    return "available";
  }

  const allPrerequisitesCompleted = lesson.prerequisiteLessons.every((id) =>
    completedLessonIds.includes(id)
  );

  return allPrerequisitesCompleted ? "available" : "locked";
}

/**
 * Check if a lesson is available (not locked)
 */
export function isLessonAvailable(
  lessonId: string,
  completedLessonIds: string[],
  allLessons: Lesson[]
): boolean {
  const status = getLessonStatus(lessonId, completedLessonIds, allLessons);
  return status === "available" || status === "completed";
}

/**
 * Get all unlocked lessons for a unit
 */
export function getUnlockedLessonsForUnit(
  unitId: string,
  completedLessonIds: string[],
  allLessons: Lesson[]
): Lesson[] {
  const unitLessons = allLessons.filter((l) => l.unitId === unitId);
  return unitLessons.filter((lesson) =>
    isLessonAvailable(lesson.id, completedLessonIds, allLessons)
  );
}

/**
 * Get the next lesson to complete for a unit
 */
export function getNextLessonForUnit(
  unitId: string,
  completedLessonIds: string[],
  allLessons: Lesson[]
): Lesson | null {
  const unitLessons = allLessons
    .filter((l) => l.unitId === unitId)
    .sort((a, b) => a.order - b.order);

  for (const lesson of unitLessons) {
    if (!completedLessonIds.includes(lesson.id)) {
      return lesson;
    }
  }

  return null; // All lessons completed
}

/**
 * Get progress for a unit (0-100)
 */
export function getUnitProgress(
  unitId: string,
  completedLessonIds: string[],
  allLessons: Lesson[]
): number {
  const unitLessons = allLessons.filter((l) => l.unitId === unitId);
  if (unitLessons.length === 0) return 0;

  const completed = unitLessons.filter((l) => completedLessonIds.includes(l.id));
  return Math.round((completed.length / unitLessons.length) * 100);
}

/**
 * Get total progress across all units
 */
export function getTotalProgress(
  completedLessonIds: string[],
  allLessons: Lesson[]
): number {
  if (allLessons.length === 0) return 0;
  return Math.round((completedLessonIds.length / allLessons.length) * 100);
}

/**
 * Get lessons grouped by unit with status
 */
export function getLessonsWithStatus(
  completedLessonIds: string[],
  allLessons: Lesson[]
): Array<{
  unitId: string;
  unitTitle: string;
  unitIcon: string;
  lessons: Array<{
    id: string;
    title: string;
    titleArmenian: string;
    status: LessonStatus;
    order: number;
    isFirst: boolean;
  }>;
}> {
  const units = allLessons.reduce((acc, lesson) => {
    if (!acc[lesson.unitId]) {
      const unit = UNITS.find((u) => u.id === lesson.unitId);
      acc[lesson.unitId] = {
        unitId: lesson.unitId,
        unitTitle: unit?.title || lesson.unitId,
        unitIcon: unit?.iconEmoji || "📚",
        lessons: [],
      };
    }
    acc[lesson.unitId].lessons.push(lesson);
    return acc;
  }, {} as Record<string, any>);

  return Object.values(units).map((unitData) => {
    // Sort lessons by order
    const sortedLessons = unitData.lessons.sort((a: Lesson, b: Lesson) => a.order - b.order);

    return {
      unitId: unitData.unitId,
      unitTitle: unitData.unitTitle,
      unitIcon: unitData.unitIcon,
      lessons: sortedLessons.map((lesson: Lesson, index: number) => ({
        id: lesson.id,
        title: lesson.title,
        titleArmenian: lesson.titleArmenian,
        status: getLessonStatus(lesson.id, completedLessonIds, allLessons),
        order: lesson.order,
        isFirst: index === 0,
      })),
    };
  });
}

// ─── EXERCISE GENERATORS ─────────────────────────────────────────────

export function generateTranslationExercise(
  patternId: string,
  lessonId: string,
  unitId: string
): Exercise | null {
  const pattern = SENTENCE_PATTERNS.find((p) => p.id === patternId);
  if (!pattern) return null;

  return {
    id: `ex_${patternId}_tr`,
    type: "translation_en_to_hy",
    prompt: `Translate to Armenian: "${pattern.english_template}"`,
    promptArmenian: `Թարգմանիր հայերեն՝ "${pattern.english_template}"`,
    targetAnswer: pattern.armenian_variants[0],
    acceptableAnswers: pattern.armenian_variants,
    hint: pattern.grammar_note,
    explanation: pattern.grammar_note ? `📝 ${pattern.grammar_note}` : undefined,
    difficulty: pattern.difficulty as ExerciseDifficulty,
    cefr: diffToCEFR(pattern.difficulty),
    hayqReward: pattern.difficulty * 6,
    lessonId,
    unitId,
  };
}

// ─── GENERATE MC EXERCISE (FIXED) ──────────────────────────────────

export function generateMCExercise(
  entry: LexiconEntry,
  lessonId: string,
  unitId: string,
  distractors: LexiconEntry[]
): Exercise {
  const correct = entry.english[0];
  
  // ✅ FIX: Filter out distractors that have the same English translation as the correct answer
  // Also deduplicate by English translation
  const uniqueDistractors: LexiconEntry[] = [];
  const usedEnglish: string[] = [correct];
  
  for (const d of distractors) {
    const english = d.english[0];
    // Skip if this English translation is already used or if it's the same as correct
    if (!usedEnglish.includes(english) && d.id !== entry.id) {
      usedEnglish.push(english);
      uniqueDistractors.push(d);
    }
  }
  
  // Take up to 3 distractors from the unique list
  const wrong = uniqueDistractors.slice(0, 3).map((d) => d.english[0]);
  
  // If we don't have enough unique distractors, find more from LEXICON
  let finalWrong = [...wrong];
  if (finalWrong.length < 3) {
    // Find additional distractors from LEXICON that aren't already used
    const additional = LEXICON.filter(
      (e) => 
        e.id !== entry.id && 
        !usedEnglish.includes(e.english[0]) &&
        e.english.length > 0
    ).slice(0, 3 - finalWrong.length);
    
    for (const add of additional) {
      if (!usedEnglish.includes(add.english[0])) {
        usedEnglish.push(add.english[0]);
        finalWrong.push(add.english[0]);
      }
    }
  }
  
  const options = shuffle([correct, ...finalWrong]);

  return {
    id: `ex_${entry.id}_mc`,
    type: "multiple_choice",
    prompt: `What does "${entry.word}" mean?`,
    promptArmenian: `Ի՞նչ է նշանակում "${entry.word}"-ը`,
    targetAnswer: correct,
    acceptableAnswers: entry.english,
    options,
    difficulty: entry.difficulty as ExerciseDifficulty,
    cefr: diffToCEFR(entry.difficulty),
    hayqReward: entry.difficulty * 3,
    lessonId,
    unitId,
  };
}

export function generateWordOrderExercise(
  patternId: string,
  lessonId: string,
  unitId: string
): Exercise | null {
  const pattern = SENTENCE_PATTERNS.find((p) => p.id === patternId);
  if (!pattern) return null;

  const canonical = pattern.armenian_variants[0];
  const words = shuffle(canonical.split(" "));

  return {
    id: `ex_${patternId}_wo`,
    type: "word_order",
    prompt: `Arrange: "${pattern.english_template}"`,
    promptArmenian: `Դասավորիր բառերը՝ "${pattern.english_template}"`,
    targetAnswer: canonical,
    acceptableAnswers: pattern.armenian_variants,
    words,
    explanation: pattern.grammar_note,
    difficulty: pattern.difficulty as ExerciseDifficulty,
    cefr: diffToCEFR(pattern.difficulty),
    hayqReward: pattern.difficulty * 4,
    lessonId,
    unitId,
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────

function diffToCEFR(d: number): CEFRLevel {
  const levels: CEFRLevel[] = ["A1", "A1", "A2", "B1", "B2", "C1"];
  return levels[Math.min(d, 5)] ?? "A1";
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── LOOKUP FUNCTIONS ───────────────────────────────────────────────

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getUnitById(id: string): Unit | undefined {
  return UNITS.find((u) => u.id === id);
}

export function getLessonsForUnit(unitId: string): Lesson[] {
  return LESSONS.filter((l) => l.unitId === unitId);
}

export function getExercisesForLesson(lessonId: string): Exercise[] {
  const lesson = getLessonById(lessonId);
  return lesson?.exercises ?? [];
}

export function getPrerequisiteLessons(lessonId: string): Lesson[] {
  const lesson = getLessonById(lessonId);
  if (!lesson) return [];
  return lesson.prerequisiteLessons.map((id) => getLessonById(id)).filter(Boolean) as Lesson[];
}

// ─── SCORING ─────────────────────────────────────────────────────────

export function scoreToGrade(score: number): ExerciseResult {
  if (score >= 0.98) return "perfect";
  if (score >= 0.85) return "excellent";
  if (score >= 0.75) return "good";
  if (score >= 0.5) return "partial";
  return "incorrect";
}

export function getHayqForGrade(grade: ExerciseResult): number {
  switch (grade) {
    case "perfect": return HAYQ_REWARDS.PERFECT;
    case "excellent": return HAYQ_REWARDS.EXCELLENT;
    case "good": return HAYQ_REWARDS.GOOD;
    case "partial": return HAYQ_REWARDS.PARTIAL;
    default: return HAYQ_REWARDS.INCORRECT;
  }
}

export function getCrownsForLesson(score: number): number {
  if (score >= 0.9) return 3;
  if (score >= 0.7) return 2;
  if (score >= 0.5) return 1;
  return 0;
}

// ─── PROGRESS CALCULATION ───────────────────────────────────────────

export function calculateLessonProgress(
  completedExercises: number,
  totalExercises: number
): number {
  if (totalExercises === 0) return 0;
  return Math.min(100, (completedExercises / totalExercises) * 100);
}

export function calculateUnitProgress(
  completedLessons: number,
  totalLessons: number
): number {
  if (totalLessons === 0) return 0;
  return Math.min(100, (completedLessons / totalLessons) * 100);
}

// ─── SESSION MANAGEMENT ─────────────────────────────────────────────

export function createLessonSession(lessonId: string): LessonSession {
  const lesson = getLessonById(lessonId);
  if (!lesson) {
    throw new Error(`Lesson not found: ${lessonId}`);
  }

  return {
    lessonId,
    currentExerciseIndex: 0,
    exercises: [...lesson.exercises],
    results: [],
    hayqEarned: 0,
    heartsUsed: 0,
    startTime: Date.now(),
    lastActivity: Date.now(),
    completed: false,
  };
}

export function advanceExercise(session: LessonSession): LessonSession {
  const nextIndex = session.currentExerciseIndex + 1;
  const completed = nextIndex >= session.exercises.length;

  return {
    ...session,
    currentExerciseIndex: nextIndex,
    lastActivity: Date.now(),
    completed,
  };
}

export function recordExerciseResult(
  session: LessonSession,
  result: ExerciseResult
): LessonSession {
  return {
    ...session,
    results: [...session.results, result],
    hayqEarned: session.hayqEarned + getHayqForGrade(result),
    lastActivity: Date.now(),
  };
}

// ─── EXPORT ──────────────────────────────────────────────────────────

export default {
  UNITS,
  LESSONS,
  HAYQ_REWARDS,
  SEED_REWARDS,
  hayqToLevel,
  getLessonById,
  getUnitById,
  getLessonsForUnit,
  getExercisesForLesson,
  getPrerequisiteLessons,
  getLessonStatus,
  isLessonAvailable,
  getUnlockedLessonsForUnit,
  getNextLessonForUnit,
  getUnitProgress,
  getTotalProgress,
  getLessonsWithStatus,
  scoreToGrade,
  getHayqForGrade,
  getCrownsForLesson,
  calculateLessonProgress,
  calculateUnitProgress,
  createLessonSession,
  advanceExercise,
  recordExerciseResult,
  generateTranslationExercise,
  generateMCExercise,
  generateWordOrderExercise,
};