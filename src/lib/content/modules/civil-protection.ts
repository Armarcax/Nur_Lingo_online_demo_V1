// NUR Lingo — «Քաղաքացիական պաշտպանություն» մոդուլ (ստուգված հարցաշար, 198 հարց)
// Տվյալները գեներացվում են՝ scripts/build-civil-protection.py

import raw from "./civil-protection.json";

export type Lang = "hy" | "en" | "ru";
export type Tri = Record<Lang, string>;
export type Mode = "quiz" | "cards";

export interface CPSource { title: string; url: string }
export interface CPQuestion {
  id: number;
  topicId: string;
  question: Tri;
  answer: Tri;
  status: Tri;
  sources: CPSource[];
  distractors: number[];
  note?: Tri;
}
export interface CPLesson { id: string; title: Tri; questionIds: number[] }
export interface CPTopic {
  id: string; icon: string; color: string; title: Tri;
  questionCount: number; lessons: CPLesson[];
}
interface CPData {
  version: string; title: Tri; sourceNote: Tri;
  stats: { questions: number; topics: number; lessons: number };
  topics: CPTopic[];
  questions: Record<string, CPQuestion>;
}

export const CP = raw as unknown as CPData;

export const LANG_META: { code: Lang; flag: string }[] = [
  { code: "hy", flag: "🇦🇲" },
  { code: "en", flag: "🇬🇧" },
  { code: "ru", flag: "🇷🇺" },
];

export const UI: Record<Lang, Record<string, string>> = {
  hy: {
    pageTitle: "Քաղաքացիական պաշտպանություն",
    back: "Ետ", lessonWord: "դաս", questionWord: "հարց",
    progress: "Առաջընթաց",
    disclaimer: "Նյութը կրթական է և չի փոխարինում գործնական վերապատրաստմանը կամ մասնագետի օգնությանը։ Արտակարգ իրավիճակում դիմեք շտապ ծառայություններին։",
    check: "Ստուգել", next: "Շարունակել", reveal: "Ցույց տալ պատասխանը",
    knew: "Գիտեի", didnt: "Չգիտեի",
    correct: "Ճիշտ է", wrong: "Սխալ է", correctAnswer: "Ճիշտ պատասխան",
    sources: "Աղբյուրներ", status: "Կարգավիճակ",
    modeQuiz: "Թեստ", modeCards: "Քարտեր",
    done: "Դասն ավարտված է", score: "Ճիշտ՝ առաջին փորձով",
    again: "Կրկնել", toTopics: "Թեմաներ",
    repeatNote: "Սխալվածները կրկնվում են վերջում։",
    notFound: "Դասը չի գտնվել",
  },
  en: {
    pageTitle: "Civil Protection",
    back: "Back", lessonWord: "lessons", questionWord: "questions",
    progress: "Progress",
    disclaimer: "This material is educational and does not replace hands-on training or professional help. In an emergency, contact the emergency services.",
    check: "Check", next: "Continue", reveal: "Show answer",
    knew: "I knew it", didnt: "I didn't know",
    correct: "Correct", wrong: "Incorrect", correctAnswer: "Correct answer",
    sources: "Sources", status: "Status",
    modeQuiz: "Quiz", modeCards: "Cards",
    done: "Lesson complete", score: "Correct on first try",
    again: "Repeat", toTopics: "Topics",
    repeatNote: "Missed questions come back at the end.",
    notFound: "Lesson not found",
  },
  ru: {
    pageTitle: "Гражданская защита",
    back: "Назад", lessonWord: "уроков", questionWord: "вопросов",
    progress: "Прогресс",
    disclaimer: "Материал носит образовательный характер и не заменяет практическую подготовку или помощь специалиста. В чрезвычайной ситуации обращайтесь в экстренные службы.",
    check: "Проверить", next: "Продолжить", reveal: "Показать ответ",
    knew: "Знал", didnt: "Не знал",
    correct: "Верно", wrong: "Неверно", correctAnswer: "Правильный ответ",
    sources: "Источники", status: "Статус",
    modeQuiz: "Тест", modeCards: "Карточки",
    done: "Урок завершён", score: "Верно с первой попытки",
    again: "Повторить", toTopics: "Темы",
    repeatNote: "Ошибки повторяются в конце.",
    notFound: "Урок не найден",
  },
};

// ─── Հարցերի և դասերի հասանելիություն ─────────────────────────────────────────

export function getQuestion(id: number): CPQuestion | undefined {
  return CP.questions[String(id)];
}

export function getLesson(lessonId: string): { topic: CPTopic; lesson: CPLesson } | null {
  for (const topic of CP.topics) {
    const lesson = topic.lessons.find((l) => l.id === lessonId);
    if (lesson) return { topic, lesson };
  }
  return null;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Վերադարձնում է 4 տարբերակ՝ հարցերի id-ներով (յուրաքանչյուրի պատասխանի տեքստն է ցուցադրվում)։ Հերթականությունը կայուն է։ */
export function buildOptions(qid: number): number[] {
  const q = getQuestion(qid);
  if (!q) return [];
  const ids = [qid, ...q.distractors];
  const rnd = mulberry32(qid * 2654435761);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

// ─── Պահպանում (localStorage) ───────────────────────────────────────────────

const SCORES_KEY = "nur_cp_scores_v1";
const DONE_KEY = "nur_completed";
const SEEDS_KEY = "nur_lingo_seeds_v4";
const CFG_KEY = "nur_lang_config";
const MODE_KEY = "nur_cp_mode";
const LANG_KEY = "nur_cp_lang";

export type Scores = Record<string, { best: number; total: number }>;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* անտեսել */
  }
}

export function loadScores(): Scores {
  return readJSON<Scores>(SCORES_KEY, {});
}

export function loadContentLang(): Lang {
  const saved = readJSON<string>(LANG_KEY, "");
  if (saved === "hy" || saved === "en" || saved === "ru") return saved;
  const cfg = readJSON<{ native?: string }>(CFG_KEY, {});
  return cfg.native === "en" || cfg.native === "ru" ? cfg.native : "hy";
}

export function saveContentLang(l: Lang) {
  writeJSON(LANG_KEY, l);
}

export function loadMode(): Mode {
  return readJSON<string>(MODE_KEY, "quiz") === "cards" ? "cards" : "quiz";
}

export function saveMode(m: Mode) {
  writeJSON(MODE_KEY, m);
}

/** Պահպանում է արդյունքը։ HAYQ տրվում է միայն լավագույն արդյունքի բարելավման համար (10 / ճիշտ պատասխան)։ */
export function saveResult(lessonId: string, correct: number, total: number): number {
  const scores = loadScores();
  const prev = scores[lessonId]?.best ?? 0;
  const award = Math.max(0, correct - prev) * 10;
  scores[lessonId] = { best: Math.max(prev, correct), total };
  writeJSON(SCORES_KEY, scores);

  if (award > 0) {
    const seeds = readJSON<Record<string, unknown>>(SEEDS_KEY, {});
    seeds.hayq = (typeof seeds.hayq === "number" ? seeds.hayq : 0) + award;
    writeJSON(SEEDS_KEY, seeds);
  }
  const done = readJSON<string[]>(DONE_KEY, []);
  if (!done.includes(lessonId)) {
    done.push(lessonId);
    writeJSON(DONE_KEY, done);
  }
  return award;
}
