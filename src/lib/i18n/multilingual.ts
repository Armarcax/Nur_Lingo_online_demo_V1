// lib/i18n/multilingual.ts

/**
 * NUR Lingo — Multilingual Content v2
 * Supports 6 learning directions between Armenian (HY), English (EN), and Russian (RU).
 * 
 * ✅ ALL 6 DIRECTIONS: hy-en, en-hy, ru-hy, hy-ru, en-ru, ru-en
 * ✅ COMPLETE LESSONS: All lessons for each direction
 */

import { generateCurriculumForPair } from "../content/generator";

export type LangCode = "en" | "hy" | "ru";
export type LangPair = "en-hy" | "hy-en" | "ru-hy" | "hy-ru" | "en-ru" | "ru-en";

export interface MultiExercise {
  id: string;
  type: "multiple_choice" | "translate" | "word_order" | "match_pairs" | "listening";
  prompt: Record<LangCode, string>;
  targetAnswer: string;
  acceptableAnswers?: string[];
  options?: string[];
  words?: string[];
  pairs?: Array<[string, string]>;
  ttsText?: string;
  ttsLang?: LangCode;
  hint?: Record<LangCode, string>;
  hayqReward?: number;
}

export interface MultiLesson {
  id: string;
  unitId: string;
  cefr?: string;
  difficulty?: number;
  title: Record<LangCode, string>;
  description: Record<LangCode, string>;
  estimatedMinutes: number;
  hayqTotal: number;
  exercises: MultiExercise[];
}

export interface MultiUnit {
  id: string;
  title: Record<LangCode, string>;
  description: Record<LangCode, string>;
  iconEmoji: string;
  colorFrom: string;
  colorTo: string;
  lessons: string[];
}

// ─── LESSON CACHE ────────────────────────────────────────────────────

const lessonCache = new Map<string, MultiLesson>();

// ─── BASE UNITS ──────────────────────────────────────────────────────

export const MULTI_UNITS: MultiUnit[] = [
  {
    id: "u1",
    title: { 
      en: "Greetings & Basics", 
      hy: "Ողջույններ և Հիմունքներ", 
      ru: "Приветствия и Основы" 
    },
    description: { 
      en: "First words and common phrases", 
      hy: "Առաջին բառերը և տարածված արտահայտությունները", 
      ru: "Первые слова и основные фразы" 
    },
    iconEmoji: "👋", 
    colorFrom: "#D90012", 
    colorTo: "#8b0000",
    lessons: ["l1", "l2", "l3", "l4", "l5"]
  },
  {
    id: "u2",
    title: { 
      en: "I am / You are", 
      hy: "Ես եմ / Դու ես", 
      ru: "Я / Ты" 
    },
    description: { 
      en: "Pronouns and 'to be' verb", 
      hy: "Դերանուններ և «լինել» բայը", 
      ru: "Местоимения и глагол 'быть'" 
    },
    iconEmoji: "👤", 
    colorFrom: "#0033A0", 
    colorTo: "#001a6b",
    lessons: ["l6", "l7", "l8", "l9", "l10"]
  },
  {
    id: "u3",
    title: { 
      en: "Food & Drink", 
      hy: "Սնունդ և ըմպելիք", 
      ru: "Еда и напитки" 
    },
    description: { 
      en: "Essential food vocabulary", 
      hy: "Հիմնական սննդի բառապաշար", 
      ru: "Основные слова о еде" 
    },
    iconEmoji: "🍽️", 
    colorFrom: "#FFA500", 
    colorTo: "#b07800",
    lessons: ["l11", "l12", "l13", "l14", "l15"]
  },
  {
    id: "u4",
    title: { 
      en: "Daily Life", 
      hy: "Ամենօրյա Կյանք", 
      ru: "Повседневная Жизнь" 
    },
    description: { 
      en: "Home, shopping, weather, time", 
      hy: "Տուն, գնումներ, եղանակ, ժամանակ", 
      ru: "Дом, покупки, погода, время" 
    },
    iconEmoji: "🏠", 
    colorFrom: "#0033A0", 
    colorTo: "#001a6b",
    lessons: ["l16", "l17", "l18", "l19", "l20"]
  },
  {
    id: "u5",
    title: { 
      en: "Education & Culture", 
      hy: "Կրթություն և Մշակույթ", 
      ru: "Образование и Культура" 
    },
    description: { 
      en: "School, work, nature, technology", 
      hy: "Դպրոց, աշխատանք, բնություն, տեխնոլոգիա", 
      ru: "Школа, работа, природа, технологии" 
    },
    iconEmoji: "📚", 
    colorFrom: "#7C3AED", 
    colorTo: "#4C1D95",
    lessons: ["l21", "l22", "l23", "l24", "l25"]
  }
];

// ─── GET LESSONS FOR PAIR ──────────────────────────────────────────

export function getLessonsForPair(pair: LangPair): { units: MultiUnit[]; lessons: MultiLesson[] } {
  // ✅ Get generated lessons
  const generated = generateCurriculumForPair(pair);
  
  // ✅ Get direction-specific lessons
  const directionLessons = getDirectionLessons(pair);
  
  // ✅ Combine: generated + direction-specific
  const seen = new Set(generated.lessons.map(l => l.id));
  const allLessons = [...generated.lessons];
  
  for (const lesson of directionLessons) {
    if (!seen.has(lesson.id)) {
      allLessons.push(lesson);
      seen.add(lesson.id);
    }
  }
  
  // ✅ Cache lessons
  for (const lesson of allLessons) {
    if (!lessonCache.has(lesson.id)) {
      lessonCache.set(lesson.id, lesson);
    }
  }
  
  // ✅ Units
  const unitMap = new Map<string, MultiUnit>();
  for (const u of [...generated.units, ...MULTI_UNITS]) {
    if (!unitMap.has(u.id)) unitMap.set(u.id, u);
  }
  const units = Array.from(unitMap.values()).filter(u => 
    allLessons.some(l => l.unitId === u.id)
  );
  
  return {
    units,
    lessons: allLessons,
  };
}

// ─── GET DIRECTION LESSONS ─────────────────────────────────────────

function getDirectionLessons(pair: LangPair): MultiLesson[] {
  switch (pair) {
    case "hy-en": return getHyEnLessons();
    case "en-hy": return getEnHyLessons();
    case "ru-hy": return getRuHyLessons();
    case "hy-ru": return getHyRuLessons();
    case "en-ru": return getEnRuLessons();
    case "ru-en": return getRuEnLessons();
    default: return [];
  }
}

// ─── HY→EN LESSONS (Հայերենից Անգլերեն) ──────────────────────────

function getHyEnLessons(): MultiLesson[] {
  return [
    {
      id: "hyen_l1",
      unitId: "u1",
      cefr: "A1",
      difficulty: 1,
      title: {
        hy: "Ողջույններ",
        en: "Greetings",
        ru: "Приветствия"
      },
      description: {
        hy: "Սովորեք ողջունել և ներկայանալ",
        en: "Learn to greet and introduce yourself",
        ru: "Научитесь здороваться и представляться"
      },
      estimatedMinutes: 10,
      hayqTotal: 50,
      exercises: [
        {
          id: "hyen_l1_e1",
          type: "multiple_choice",
          prompt: {
            hy: "Ինչպե՞ս ասել «hello» հայերեն",
            en: "How to say 'hello' in Armenian",
            ru: "Как сказать 'hello' по-армянски"
          },
          targetAnswer: "բարև",
          acceptableAnswers: ["բարև", "ողջույն"],
          options: ["բարև", "ցտեսություն", "շնորհակալություն", "կներեք"],
          hayqReward: 10
        },
        {
          id: "hyen_l1_e2",
          type: "translate",
          prompt: {
            hy: "Թարգմանեք «good morning»",
            en: "Translate 'good morning'",
            ru: "Переведите 'good morning'"
          },
          targetAnswer: "բարի լույս",
          acceptableAnswers: ["բարի լույս"],
          hayqReward: 10
        },
        {
          id: "hyen_l1_e3",
          type: "listening",
          prompt: {
            hy: "Լսեք և գրեք ձեր լսածը",
            en: "Listen and write what you hear",
            ru: "Прослушайте и запишите"
          },
          targetAnswer: "բարի լույս",
          ttsText: "բարի լույս",
          ttsLang: "hy",
          hayqReward: 15
        }
      ]
    }
  ];
}

// ─── EN→HY LESSONS (Անգլերենից Հայերեն) ──────────────────────────

function getEnHyLessons(): MultiLesson[] {
  return [
    {
      id: "enhy_l1",
      unitId: "u1",
      cefr: "A1",
      difficulty: 1,
      title: {
        en: "Greetings",
        hy: "Ողջույններ",
        ru: "Приветствия"
      },
      description: {
        en: "Learn to greet and introduce yourself",
        hy: "Սովորեք ողջունել և ներկայանալ",
        ru: "Научитесь здороваться и представляться"
      },
      estimatedMinutes: 10,
      hayqTotal: 50,
      exercises: [
        {
          id: "enhy_l1_e1",
          type: "multiple_choice",
          prompt: {
            en: "What is 'hello' in Armenian?",
            hy: "Ի՞նչ է 'hello'-ը հայերեն",
            ru: "Что такое 'hello' по-армянски"
          },
          targetAnswer: "բարև",
          acceptableAnswers: ["բարև", "ողջույն"],
          options: ["բարև", "goodbye", "thank you", "sorry"],
          hayqReward: 10
        },
        {
          id: "enhy_l1_e2",
          type: "translate",
          prompt: {
            en: "Translate 'good morning' to Armenian",
            hy: "Թարգմանեք 'good morning'-ը հայերեն",
            ru: "Переведите 'good morning' на армянский"
          },
          targetAnswer: "բարի լույս",
          acceptableAnswers: ["բարի լույս"],
          hayqReward: 10
        },
        {
          id: "enhy_l1_e3",
          type: "listening",
          prompt: {
            en: "Listen and write what you hear",
            hy: "Լսեք և գրեք ձեր լսածը",
            ru: "Прослушайте и запишите"
          },
          targetAnswer: "բարև ձեզ",
          ttsText: "բարև ձեզ",
          ttsLang: "hy",
          hayqReward: 15
        }
      ]
    }
  ];
}

// ─── RU→HY LESSONS (Ռուսերենից Հայերեն) ──────────────────────────

function getRuHyLessons(): MultiLesson[] {
  return [
    {
      id: "ruhy_l1",
      unitId: "u1",
      cefr: "A1",
      difficulty: 1,
      title: {
        ru: "Приветствия",
        hy: "Ողջույններ",
        en: "Greetings"
      },
      description: {
        ru: "Научитесь здороваться и представляться",
        hy: "Սովորեք ողջունել և ներկայանալ",
        en: "Learn to greet and introduce yourself"
      },
      estimatedMinutes: 10,
      hayqTotal: 50,
      exercises: [
        {
          id: "ruhy_l1_e1",
          type: "multiple_choice",
          prompt: {
            ru: "Как сказать 'hello' по-армянски?",
            hy: "Ի՞նչ է 'hello'-ը հայերեն",
            en: "What is 'hello' in Armenian?"
          },
          targetAnswer: "բարև",
          acceptableAnswers: ["բարև", "ողջույն"],
          options: ["բարև", "до свидания", "спасибо", "извините"],
          hayqReward: 10
        },
        {
          id: "ruhy_l1_e2",
          type: "translate",
          prompt: {
            ru: "Переведите 'good morning' на армянский",
            hy: "Թարգմանեք 'good morning'-ը հայերեն",
            en: "Translate 'good morning' to Armenian"
          },
          targetAnswer: "բարի լույս",
          acceptableAnswers: ["բարի լույս"],
          hayqReward: 10
        }
      ]
    }
  ];
}

// ─── HY→RU LESSONS (Հայերենից Ռուսերեն) ──────────────────────────

function getHyRuLessons(): MultiLesson[] {
  return [
    {
      id: "hyru_l1",
      unitId: "u1",
      cefr: "A1",
      difficulty: 1,
      title: {
        hy: "Ողջույններ",
        ru: "Приветствия",
        en: "Greetings"
      },
      description: {
        hy: "Սովորեք ողջունել և ներկայանալ",
        ru: "Научитесь здороваться и представляться",
        en: "Learn to greet and introduce yourself"
      },
      estimatedMinutes: 10,
      hayqTotal: 50,
      exercises: [
        {
          id: "hyru_l1_e1",
          type: "multiple_choice",
          prompt: {
            hy: "Ինչպե՞ս ասել «привет» հայերեն",
            ru: "Как сказать 'привет' по-армянски",
            en: "How to say 'привет' in Armenian"
          },
          targetAnswer: "բարև",
          acceptableAnswers: ["բարև", "ողջույն"],
          options: ["բարև", "до свидания", "спасибо", "извините"],
          hayqReward: 10
        }
      ]
    }
  ];
}

// ─── EN→RU LESSONS (Անգլերենից Ռուսերեն) ──────────────────────────

function getEnRuLessons(): MultiLesson[] {
  return [
    {
      id: "enru_l1",
      unitId: "u1",
      cefr: "A1",
      difficulty: 1,
      title: {
        en: "Greetings",
        ru: "Приветствия",
        hy: "Ողջույններ"
      },
      description: {
        en: "Learn to greet in Russian",
        ru: "Научитесь здороваться на русском",
        hy: "Սովորեք ողջունել ռուսերեն"
      },
      estimatedMinutes: 10,
      hayqTotal: 50,
      exercises: [
        {
          id: "enru_l1_e1",
          type: "multiple_choice",
          prompt: {
            en: "What is 'hello' in Russian?",
            ru: "Как будет 'hello' на русском?",
            hy: "Ի՞նչ է 'hello'-ը ռուսերեն"
          },
          targetAnswer: "привет",
          acceptableAnswers: ["привет", "здравствуй"],
          options: ["привет", "пока", "спасибо", "извините"],
          hayqReward: 10
        }
      ]
    }
  ];
}

// ─── RU→EN LESSONS (Ռուսերենից Անգլերեն) ──────────────────────────

function getRuEnLessons(): MultiLesson[] {
  return [
    {
      id: "ruen_l1",
      unitId: "u1",
      cefr: "A1",
      difficulty: 1,
      title: {
        ru: "Приветствия",
        en: "Greetings",
        hy: "Ողջույններ"
      },
      description: {
        ru: "Научитесь здороваться на английском",
        en: "Learn to greet in English",
        hy: "Սովորեք ողջունել անգլերեն"
      },
      estimatedMinutes: 10,
      hayqTotal: 50,
      exercises: [
        {
          id: "ruen_l1_e1",
          type: "multiple_choice",
          prompt: {
            ru: "Как будет 'привет' на английском?",
            en: "What is 'привет' in English?",
            hy: "Ի՞նչ է 'привет'-ը անգլերեն"
          },
          targetAnswer: "hello",
          acceptableAnswers: ["hello", "hi"],
          options: ["hello", "goodbye", "thank you", "sorry"],
          hayqReward: 10
        }
      ]
    }
  ];
}

// ─── GET LESSON BY ID ──────────────────────────────────────────────

export function getLessonById(pair: LangPair, lessonId: string): MultiLesson | null {
  // ✅ Check cache
  if (lessonCache.has(lessonId)) {
    const cached = lessonCache.get(lessonId)!;
    console.log(`✅ Using cached lesson: ${lessonId}`);
    return convertLessonForPair(cached, pair);
  }
  
  // ✅ Load from generator
  const { lessons } = getLessonsForPair(pair);
  const lesson = lessons.find(l => l.id === lessonId);
  
  if (!lesson) {
    console.warn(`❌ Lesson not found: ${lessonId}`);
    return null;
  }
  
  // ✅ Cache
  lessonCache.set(lessonId, lesson);
  
  return convertLessonForPair(lesson, pair);
}

// ─── CONVERT LESSON FOR PAIR ──────────────────────────────────────

function convertLessonForPair(lesson: MultiLesson, pair: LangPair): MultiLesson {
  const [native, learning] = pair.split('-') as [LangCode, LangCode];
  
  console.log(`📚 Converting: ${lesson.id} | ${native}→${learning}`);
  
  return {
    ...lesson,
    exercises: lesson.exercises.map(ex => {
      // ✅ PROMPT: Native language
      const promptText = ex.prompt?.[native] || ex.prompt?.[learning] || ex.prompt?.en || '';
      
      // ✅ ANSWER: Learning language
      let answerText = getAnswerInLearning(ex, learning, native);
      
      // ✅ HINT: Native language
      const hintText = ex.hint?.[native] || ex.hint?.[learning] || ex.hint?.en || '';
      
      // ✅ TTS: Learning language for listening
      const ttsLang = ex.type === 'listening' ? learning : undefined;
      const ttsText = ex.type === 'listening' ? (ex.ttsText || promptText) : undefined;
      
      return {
        ...ex,
        prompt: {
          ...ex.prompt,
          [native]: promptText,
        },
        targetAnswer: answerText,
        hint: ex.hint ? {
          ...ex.hint,
          [native]: hintText,
        } : undefined,
        ttsLang: ttsLang || ex.ttsLang,
        ttsText: ttsText || ex.ttsText,
      };
    }),
  };
}

// ─── GET ANSWER IN LEARNING ────────────────────────────────────────

function getAnswerInLearning(ex: MultiExercise, learning: LangCode, native: LangCode): string {
  const answer = ex.targetAnswer || '';
  
  // ✅ If already in learning language
  if (isLanguage(answer, learning)) {
    return answer;
  }
  
  // ✅ Try prompt in learning
  const promptInLearning = ex.prompt?.[learning];
  if (promptInLearning && isLanguage(promptInLearning, learning)) {
    return promptInLearning;
  }
  
  // ✅ Try acceptable answers
  const acceptable = ex.acceptableAnswers?.find(a => isLanguage(a, learning));
  if (acceptable) {
    return acceptable;
  }
  
  // ✅ Fallback: native
  return ex.prompt?.[native] || answer;
}

// ─── LANGUAGE DETECTION ────────────────────────────────────────────

function isLanguage(text: string, lang: LangCode): boolean {
  if (!text) return false;
  
  switch (lang) {
    case 'hy':
      return /[Ա-Ֆա-ֆ]/.test(text);
    case 'ru':
      return /[А-Яа-я]/.test(text);
    case 'en':
      return /[A-Za-z]/.test(text) && !/[Ա-Ֆա-ֆА-Яа-я]/.test(text);
    default:
      return true;
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────

export function getUnitsForPair(pair: LangPair): MultiUnit[] {
  return getLessonsForPair(pair).units;
}

export function getAllLessonsForPair(pair: LangPair): MultiLesson[] {
  return getLessonsForPair(pair).lessons;
}

export function getLanguagesFromPair(pair: LangPair): { native: LangCode; learning: LangCode } {
  const [native, learning] = pair.split('-') as [LangCode, LangCode];
  return { native, learning };
}

export function isValidPair(pair: string): pair is LangPair {
  return ['en-hy', 'hy-en', 'ru-hy', 'hy-ru', 'en-ru', 'ru-en'].includes(pair);
}

export function getPromptInNative(exercise: MultiExercise, nativeLang: LangCode): string {
  return exercise.prompt?.[nativeLang] || exercise.prompt?.en || '';
}

export function getAnswerInLearningPublic(exercise: MultiExercise, learningLang: LangCode): string {
  return getAnswerInLearning(exercise, learningLang, 'en');
}

export function getTranslationForPair(
  text: string,
  fromLang: LangCode,
  toLang: LangCode,
  translations?: Record<LangCode, string>
): string {
  if (!translations) return text;
  return translations[toLang] || translations[fromLang] || text;
}

export function clearLessonCache(): void {
  lessonCache.clear();
  console.log('🗑️ Lesson cache cleared');
}

export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: lessonCache.size,
    keys: Array.from(lessonCache.keys()),
  };
}