// scripts/build-lesson-dictionary-v3.ts
// Run: npx tsx scripts/build-lesson-dictionary-v3.ts

import fs from "fs";
import path from "path";

import { W1_LESSONS } from "../src/lib/content/builders/world1";
import { W1_QUICK_LESSONS } from "../src/lib/content/builders/world1_quick";
import { W2_LESSONS } from "../src/lib/content/builders/world2";
import { W3_LESSONS } from "../src/lib/content/builders/world3";
import { W4_LESSONS } from "../src/lib/content/builders/world4";
import { W5_LESSONS } from "../src/lib/content/builders/world5";
import { W6_LESSONS } from "../src/lib/content/builders/world6";
import { W7_LESSONS } from "../src/lib/content/builders/world7";
import { W8_LESSONS } from "../src/lib/content/builders/world8";
import { W9_LESSONS } from "../src/lib/content/builders/world9";
import { W10_LESSONS } from "../src/lib/content/builders/world10";

// ============================================================
// TYPES
// ============================================================

interface VocabItem {
  id: string;
  hy: string;
  en: string;
  ru: string;
}

interface LessonLike {
  id: string;
  worldId: string;
  slug: string;
  title: any;
  concept: any;
  difficulty: string;
  vocabulary: VocabItem[];
  phrases: any[];
  dialogues: any[];
}

type WorldGroup = {
  worldLabel: string;
  lessons: LessonLike[];
};

// ============================================================
// CONFIG
// ============================================================

const WORLDS: WorldGroup[] = [
  { worldLabel: "world1.ts", lessons: W1_LESSONS as LessonLike[] },
  { worldLabel: "world1_quick.ts", lessons: W1_QUICK_LESSONS as LessonLike[] },
  { worldLabel: "world2.ts", lessons: W2_LESSONS as LessonLike[] },
  { worldLabel: "world3.ts", lessons: W3_LESSONS as LessonLike[] },
  { worldLabel: "world4.ts", lessons: W4_LESSONS as LessonLike[] },
  { worldLabel: "world5.ts", lessons: W5_LESSONS as LessonLike[] },
  { worldLabel: "world6.ts", lessons: W6_LESSONS as LessonLike[] },
  { worldLabel: "world7.ts", lessons: W7_LESSONS as LessonLike[] },
  { worldLabel: "world8.ts", lessons: W8_LESSONS as LessonLike[] },
  { worldLabel: "world9.ts", lessons: W9_LESSONS as LessonLike[] },
  { worldLabel: "world10.ts", lessons: W10_LESSONS as LessonLike[] },
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'greetings': ['greet', 'hello', 'hi', 'morning', 'evening', 'welcome', 'meet'],
  'family': ['family', 'mother', 'father', 'sister', 'brother', 'parent', 'child'],
  'food': ['food', 'eat', 'drink', 'meal', 'restaurant', 'cook', 'bread', 'water'],
  'travel': ['travel', 'go', 'come', 'arrive', 'depart', 'airport', 'hotel'],
  'work': ['work', 'job', 'office', 'meeting', 'business', 'profession'],
  'school': ['school', 'study', 'learn', 'teacher', 'student', 'class'],
  'health': ['health', 'doctor', 'hospital', 'medicine', 'pain'],
  'shopping': ['shop', 'buy', 'sell', 'store', 'market', 'price'],
  'time': ['time', 'day', 'week', 'month', 'year', 'hour', 'minute'],
};

const DIFFICULTY_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// ============================================================
// HELPERS
// ============================================================

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function detectCategory(lesson: LessonLike): string {
  const title = lesson.title?.en?.toLowerCase() || '';
  const concept = lesson.concept?.en?.toLowerCase() || '';
  const text = title + ' ' + concept;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }
  return 'general';
}

function extractTags(lesson: LessonLike): string[] {
  const tags: string[] = [];
  const title = lesson.title?.en?.toLowerCase() || '';
  const concept = lesson.concept?.en?.toLowerCase() || '';
  const text = title + ' ' + concept;

  if (lesson.difficulty) tags.push(lesson.difficulty.toLowerCase());
  const cat = detectCategory(lesson);
  if (cat !== 'general') tags.push(cat);
  if (text.includes('basic') || text.includes('beginner')) tags.push('beginner');
  if (text.includes('intermediate')) tags.push('intermediate');
  if (text.includes('advanced')) tags.push('advanced');

  return [...new Set(tags)];
}

function getLessonOrder(lessonId: string): number {
  const match = lessonId.match(/l(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function getWorldNumber(worldId: string): number {
  const num = parseInt(worldId.replace('w', ''));
  return isNaN(num) ? 0 : num;
}

// ============================================================
// EXERCISE GENERATION (FIXED - UNIQUE AUDIO IDs)
// ============================================================

function buildExercisesV3(lesson: LessonLike, lessonId: string): any[] {
  const exercises: any[] = [];
  const vocab = lesson.vocabulary || [];

  vocab.forEach((v, i) => {
    const target = v.en;
    const distractors = shuffle(
      vocab.filter((x) => x.id !== v.id && x.en !== target)
    )
      .map((x) => x.en)
      .filter((word, idx, arr) => arr.indexOf(word) === idx)
      .slice(0, 3);

    const options = shuffle([target, ...distractors]);

    // ✅ Multiple Choice - UNIQUE audio ID
    exercises.push({
      id: `${lessonId}_mc_${i}`,
      type: 'multiple_choice',
      order: i * 2,
      difficulty: 1,
      points: 10,
      prompt: {
        en: `Choose the meaning of "${v.en}"`,
        hy: `Ընտրիր "${v.hy}"-ի թարգմանությունը`,
        ru: `Выбери перевод "${v.ru}"`,
      },
      audio: {
        id: `${v.id}_mc`,  // ✅ UNIQUE
        languages: ['en', 'hy', 'ru'],
        voices: ['male', 'female'],
      },
      options,
      correctAnswer: target,
      hint: {
        en: `"${v.en}" means "${v.hy}" in Armenian`,
        hy: `"${v.en}"-ը հայերեն նշանակում է "${v.hy}"`,
        ru: `"${v.en}" по-армянски означает "${v.hy}"`,
      },
      feedback: {
        correct: {
          en: `✅ Correct! "${v.en}" is "${v.hy}"`,
          hy: `✅ Ճիշտ է! "${v.en}"-ը "${v.hy}" է`,
          ru: `✅ Правильно! "${v.en}" это "${v.hy}"`,
        },
        incorrect: {
          en: `❌ Not quite. "${v.en}" means "${v.hy}"`,
          hy: `❌ Ոչ. "${v.en}"-ը նշանակում է "${v.hy}"`,
          ru: `❌ Не совсем. "${v.en}" означает "${v.hy}"`,
        },
      },
    });

    // ✅ Translate - UNIQUE audio ID
    exercises.push({
      id: `${lessonId}_tr_${i}`,
      type: 'translate',
      order: i * 2 + 1,
      difficulty: 2,
      points: 15,
      prompt: {
        en: `Translate: "${v.hy}"`,
        hy: `Թարգմանիր՝ "${v.hy}"`,
        ru: `Переведи: "${v.hy}"`,
      },
      audio: {
        id: `${v.id}_tr`,  // ✅ UNIQUE
        languages: ['hy', 'en', 'ru'],
        voices: ['male', 'female'],
      },
      correctAnswer: target,
      acceptableAnswers: [target],
      hint: {
        en: `"${v.hy}" means "${v.en}" in English`,
        hy: `"${v.hy}"-ը անգլերեն նշանակում է "${v.en}"`,
        ru: `"${v.hy}" по-английски означает "${v.en}"`,
      },
      feedback: {
        correct: {
          en: `✅ Correct! "${v.hy}" is "${v.en}"`,
          hy: `✅ Ճիշտ է! "${v.hy}"-ը "${v.en}" է`,
          ru: `✅ Правильно! "${v.hy}" это "${v.en}"`,
        },
        incorrect: {
          en: `❌ "${v.hy}" means "${v.en}"`,
          hy: `❌ "${v.hy}"-ը նշանակում է "${v.en}"`,
          ru: `❌ "${v.hy}" означает "${v.en}"`,
        },
      },
    });
  });

  // ✅ Match Pairs - UNIQUE audio ID
  if (vocab.length >= 4) {
    const pairs = vocab.slice(0, 6).map((v) => [v.hy, v.en] as [string, string]);
    exercises.push({
      id: `${lessonId}_match`,
      type: 'match_pairs',
      order: vocab.length * 2,
      difficulty: 2,
      points: 20,
      prompt: {
        en: 'Match the Armenian words with their English translations',
        hy: 'Կապիր հայերեն բառերը անգլերեն թարգմանությունների հետ',
        ru: 'Сопоставь армянские слова с английскими переводами',
      },
      audio: {
        id: `${lessonId}_match`,  // ✅ UNIQUE
        languages: ['hy', 'en'],
        voices: ['male', 'female'],
      },
      pairs: pairs,
      hint: {
        en: 'Match each Armenian word with its English equivalent',
        hy: 'Յուրաքանչյուր հայերեն բառին համապատասխանեցրու անգլերեն թարգմանությունը',
        ru: 'Сопоставь каждое армянское слово с его английским эквивалентом',
      },
      feedback: {
        correct: {
          en: '✅ Perfect! All pairs matched correctly! 🎉',
          hy: '✅ Հիանալի! Բոլոր զույգերը ճիշտ են! 🎉',
          ru: '✅ Отлично! Все пары сопоставлены правильно! 🎉',
        },
        incorrect: {
          en: '❌ Some pairs are wrong. Try again! 💪',
          hy: '❌ Որոշ զույգեր սխալ են: Փորձիր նորից! 💪',
          ru: '❌ Некоторые пары неверны. Попробуй снова! 💪',
        },
      },
    });
  }

  return exercises;
}

// ============================================================
// BUILD
// ============================================================

function buildDictionary() {
  console.log('\n📚 Building lesson-dictionary.json v3.0 (FIXED)\n');

  const allLessons: any[] = [];
  let totalExercises = 0;
  let totalVocabulary = 0;
  let totalAudioFiles = 0;
  const allCategories = new Set<string>();
  const allLanguages = new Set<string>(['en', 'hy', 'ru']);
  const allDifficulties = new Set<string>();
  const audioIdSet = new Set<string>();

  for (const group of WORLDS) {
    let groupVocab = 0;
    let groupExercises = 0;

    for (const lesson of group.lessons) {
      if (!lesson || !lesson.id) {
        console.warn(`   ⚠️  ${group.worldLabel}: skipping lesson with no id`);
        continue;
      }

      const category = detectCategory(lesson);
      const tags = extractTags(lesson);
      const exercises = buildExercisesV3(lesson, lesson.id);

      const newLesson = {
        id: lesson.id,
        worldId: lesson.worldId,
        order: getLessonOrder(lesson.id),
        difficulty: lesson.difficulty || 'A1',
        category: category,
        title: lesson.title || { en: 'Lesson', hy: 'Դաս', ru: 'Урок' },
        concept: lesson.concept || { en: '', hy: '', ru: '' },
        estimatedMinutes: 10,
        prerequisites: [],
        tags: tags,
        vocabulary: lesson.vocabulary || [],
        exercises: exercises,
      };

      allLessons.push(newLesson);
      allCategories.add(category);
      allDifficulties.add(lesson.difficulty || 'A1');

      // ✅ Count vocabulary (NOT exercises)
      groupVocab += (lesson.vocabulary || []).length;
      
      // ✅ Count exercises correctly
      groupExercises += exercises.length;
      totalExercises += exercises.length;
      totalVocabulary += (lesson.vocabulary || []).length;

      // ✅ Count UNIQUE audio files
      for (const ex of exercises) {
        if (ex.audio && ex.audio.id) {
          audioIdSet.add(ex.audio.id);
        }
      }
      for (const v of lesson.vocabulary || []) {
        if (v.id) {
          audioIdSet.add(v.id);  // vocabulary items have audio too
        }
      }
    }

    console.log(
      `  ${group.worldLabel.padEnd(18)} lessons=${String(group.lessons.length).padEnd(3)} vocab=${String(groupVocab).padEnd(4)} exercises=${groupExercises}`
    );
  }

  totalAudioFiles = audioIdSet.size;

  // Sort lessons
  allLessons.sort((a, b) => {
    const worldA = getWorldNumber(a.worldId);
    const worldB = getWorldNumber(b.worldId);
    if (worldA !== worldB) return worldA - worldB;
    return a.order - b.order;
  });

  const output = {
    version: '3.0',
    generatedAt: new Date().toISOString(),
    metadata: {
      totalLessons: allLessons.length,
      totalExercises: totalExercises,
      totalVocabulary: totalVocabulary,
      totalAudioFiles: totalAudioFiles,
      languages: Array.from(allLanguages),
      difficultyLevels: Array.from(allDifficulties).sort(
        (a, b) => DIFFICULTY_ORDER.indexOf(a) - DIFFICULTY_ORDER.indexOf(b)
      ),
      categories: Array.from(allCategories),
    },
    lessons: allLessons,
  };

  // Write output
  const outPaths = [
    path.join(process.cwd(), 'data', 'dictionary', 'master', 'lesson-dictionary.json'),
    path.join(process.cwd(), 'public', 'data', 'lesson-dictionary.json'),
  ];

  for (const outPath of outPaths) {
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
    const size = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`💾 Wrote ${outPath} (${size} KB)`);
  }

  console.log('\n📊 SUMMARY');
  console.log('──────────────────────────────────────────');
  console.log(`  Lessons: ${allLessons.length}`);
  console.log(`  Exercises: ${totalExercises}`);
  console.log(`  Vocabulary: ${totalVocabulary}`);
  console.log(`  Audio Files: ${totalAudioFiles} (UNIQUE)`);
  console.log(`  Categories: ${Array.from(allCategories).join(', ')}`);
  console.log(`  Difficulty Levels: ${Array.from(allDifficulties).join(', ')}`);
  console.log(`  Languages: ${Array.from(allLanguages).join(', ')}`);
  console.log('\n✅ Done.\n');
}

// ============================================================
// RUN
// ============================================================

buildDictionary();