// scripts/build-lesson-dictionary.ts
//
// Merges every world's lesson content (src/lib/content/builders/world*.ts)
// into one unified data/dictionaries/lesson-dictionary.json (and a copy
// under public/data/ for client-side fetches), generating exercises for
// each lesson along the way.
//
// Run with:  npx tsx scripts/build-lesson-dictionary.ts
// (install tsx once if you don't have it:  npm i -D tsx)

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

// ─── TYPES ─────────────────────────────────────────────────────────────

interface VocabItem { id: string; hy: string; en: string; ru: string }
interface PhraseItem { id: string; hy: string; en: string; ru: string; alt?: any }
interface DialogueTurn { speaker: string; hy: string; en: string; ru: string }
interface Dialogue { id: string; title: any; turns: DialogueTurn[] }
interface LessonLike {
  id: string;
  worldId: string;
  slug: string;
  title: any;
  concept: any;
  difficulty: string;
  vocabulary: VocabItem[];
  phrases: PhraseItem[];
  dialogues: Dialogue[];
}

type WorldGroup = { worldLabel: string; lessons: LessonLike[] };

// ─── GATHER EVERY WORLD ─────────────────────────────────────────────────

// ✅ Use 'any' to bypass type checking issues
const WORLDS: WorldGroup[] = [
  { worldLabel: "world1.ts", lessons: W1_LESSONS as any },
  { worldLabel: "world1_quick.ts", lessons: W1_QUICK_LESSONS as any },
  { worldLabel: "world2.ts", lessons: W2_LESSONS as any },
  { worldLabel: "world3.ts", lessons: W3_LESSONS as any },
  { worldLabel: "world4.ts", lessons: W4_LESSONS as any },
  { worldLabel: "world5.ts", lessons: W5_LESSONS as any },
  { worldLabel: "world6.ts", lessons: W6_LESSONS as any },
  { worldLabel: "world7.ts", lessons: W7_LESSONS as any },
  { worldLabel: "world8.ts", lessons: W8_LESSONS as any },
  { worldLabel: "world9.ts", lessons: W9_LESSONS as any },
  { worldLabel: "world10.ts", lessons: W10_LESSONS as any },
];

// ─── EXERCISE GENERATION ────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildExercises(lesson: any): any[] {
  const exercises: any[] = [];
  const vocab = lesson.vocabulary || [];

  vocab.forEach((v: any, i: number) => {
    const target = v.en;
    const distractors = shuffle(
      vocab.filter((x: any) => x.id !== v.id && x.en !== target)
    )
      .map((x: any) => x.en)
      .filter((word: string, idx: number, arr: string[]) => arr.indexOf(word) === idx)
      .slice(0, 3);
    const options = shuffle([target, ...distractors]);

    exercises.push({
      id: `${lesson.id}_mc_${i}`,
      type: "multiple_choice",
      prompt: {
        en: `Choose the meaning of "${v.en}"`,
        hy: `Ընտրիր "${v.hy}"-ի թարգմանությունը`,
        ru: `Выбери перевод "${v.ru}"`,
      },
      options,
      targetAnswer: target,
      acceptableAnswers: [target],
      hayqReward: 5,
    });

    exercises.push({
      id: `${lesson.id}_tr_${i}`,
      type: "translate",
      prompt: {
        en: `Translate: "${v.hy}"`,
        hy: `Թարգմանիր՝ "${v.hy}"`,
        ru: `Переведи: "${v.hy}"`,
      },
      targetAnswer: target,
      acceptableAnswers: [target],
      hayqReward: 10,
    });
  });

  if (vocab.length >= 4) {
    exercises.push({
      id: `${lesson.id}_match`,
      type: "match_pairs",
      prompt: {
        en: "Match the pairs",
        hy: "Կապիր զույգերը",
        ru: "Сопоставь пары",
      },
      targetAnswer: "",
      pairs: vocab.slice(0, 6).map((v: any) => [v.hy, v.en] as [string, string]),
      hayqReward: 15,
    });
  }

  return exercises;
}

// ─── MERGE + DIAGNOSTICS ─────────────────────────────────────────────────

const lessons: Record<string, any> = {};
let totalLessons = 0;
let duplicateIds = 0;

console.log("\n📚 Building lesson-dictionary.json\n");

for (const group of WORLDS) {
  let vocabCount = 0;
  let phraseCount = 0;
  let dialogueCount = 0;

  for (const lesson of group.lessons) {
    if (!lesson || !lesson.id) {
      console.warn(`   ⚠️  ${group.worldLabel}: skipping a lesson with no id`);
      continue;
    }

    const vLen = (lesson.vocabulary || []).length;
    const pLen = (lesson.phrases || []).length;
    const dLen = (lesson.dialogues || []).length;
    vocabCount += vLen;
    phraseCount += pLen;
    dialogueCount += dLen;

    if (lessons[lesson.id]) {
      duplicateIds++;
      console.warn(`   ⚠️  Duplicate lesson id "${lesson.id}" (from ${group.worldLabel}) -- overwriting previous entry`);
    }

    lessons[lesson.id] = {
      id: lesson.id,
      worldId: lesson.worldId,
      slug: lesson.slug,
      title: lesson.title,
      concept: lesson.concept,
      difficulty: lesson.difficulty,
      vocabulary: lesson.vocabulary || [],
      phrases: lesson.phrases || [],
      dialogues: lesson.dialogues || [],
      exercises: buildExercises(lesson),
    };
    totalLessons++;
  }

  const flag = vocabCount === 0 ? "❌" : vocabCount < group.lessons.length * 3 ? "⚠️ " : "✅";
  console.log(
    `${flag} ${group.worldLabel.padEnd(18)} lessons=${String(group.lessons.length).padEnd(3)} vocab=${String(vocabCount).padEnd(4)} phrases=${String(phraseCount).padEnd(4)} dialogues=${dialogueCount}`
  );
}

console.log(`\nTotal lessons: ${totalLessons}${duplicateIds ? `  (⚠️ ${duplicateIds} duplicate ids overwritten -- check the warnings above)` : ""}\n`);

// ─── WRITE OUTPUT ─────────────────────────────────────────────────────

const output = {
  version: "2.0",
  generatedAt: new Date().toISOString(),
  totalLessons,
  lessons,
};

const outPaths = [
  path.join(process.cwd(), "data", "dictionaries", "lesson-dictionary.json"),
  path.join(process.cwd(), "public", "data", "lesson-dictionary.json"),
];

for (const outPath of outPaths) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`💾 Wrote ${outPath}`);
}

console.log("\n✅ Done.\n");