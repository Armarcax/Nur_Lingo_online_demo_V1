// scripts/export-full-curriculum-sequenced.ts
// Run with: npx tsx scripts/export-full-curriculum-sequenced.ts

import * as fs from 'fs';
import * as path from 'path';
import { CONTENT_LESSONS, WORLDS, type ContentLesson } from '../src/lib/content/database';

// ============================================================
// TYPES
// ============================================================

interface ExportedVocab {
  id: string;
  hy: string;
  en: string;
  ru: string;
}

interface ExportedPhrase {
  id: string;
  hy: string;
  en: string;
  ru: string;
  alt?: Record<string, string[]>;
}

interface ExportedTurn {
  speaker: 'nurik' | 'user';
  hy: string;
  en: string;
  ru: string;
}

interface ExportedDialogue {
  id: string;
  title: Record<string, string>;
  turns: ExportedTurn[];
}

interface ExportedLesson {
  id: string;           // w1_l1
  worldId: string;      // w1
  slug: string;
  title: Record<string, string>;
  concept: Record<string, string>;
  difficulty: string;
  order: number;        // 1, 2, 3, ...
  vocabulary: ExportedVocab[];
  phrases: ExportedPhrase[];
  dialogues: ExportedDialogue[];
  stats: {
    totalVocabulary: number;
    totalPhrases: number;
    totalDialogues: number;
    totalTurns: number;
  };
}

interface ExportedWorld {
  id: string;
  order: number;        // 1, 2, 3, ...
  title: Record<string, string>;
  description: Record<string, string>;
  iconEmoji: string;
  colorFrom: string;
  colorTo: string;
  lessons: ExportedLesson[];
}

interface ExportedData {
  exportedAt: string;
  version: string;
  totalWorlds: number;
  totalLessons: number;
  worlds: ExportedWorld[];
  allLessons: ExportedLesson[];
  allVocabulary: ExportedVocab[];
  allPhrases: ExportedPhrase[];
  allDialogues: ExportedDialogue[];
}

// ============================================================
// MAIN FUNCTION
// ============================================================

function exportFullCurriculumSequenced() {
  console.log('📚 Exporting full curriculum with sequenced IDs...\n');

  const data: ExportedData = {
    exportedAt: new Date().toISOString(),
    version: '2.0',
    totalWorlds: 0,
    totalLessons: 0,
    worlds: [],
    allLessons: [],
    allVocabulary: [],
    allPhrases: [],
    allDialogues: [],
  };

  // ============================================================
  // PROCESS WORLDS WITH ORDER
  // ============================================================

  for (let wIndex = 0; wIndex < WORLDS.length; wIndex++) {
    const world = WORLDS[wIndex];
    const worldLessons = CONTENT_LESSONS.filter(l => l.worldId === world.id);
    
    if (worldLessons.length === 0) continue;

    const exportedWorld: ExportedWorld = {
      id: world.id,
      order: wIndex + 1,
      title: world.title,
      description: world.description,
      iconEmoji: world.iconEmoji,
      colorFrom: world.colorFrom,
      colorTo: world.colorTo,
      lessons: [],
    };

    // ============================================================
    // PROCESS LESSONS WITH ORDER
    // ============================================================

    for (let lIndex = 0; lIndex < worldLessons.length; lIndex++) {
      const lesson = worldLessons[lIndex];
      
      // Generate sequential ID: w1_l1, w1_l2, w2_l1, etc.
      const lessonId = `${world.id}_l${lIndex + 1}`;

      const exportedLesson: ExportedLesson = {
        id: lessonId,
        worldId: world.id,
        slug: lesson.slug,
        title: lesson.title,
        concept: lesson.concept,
        difficulty: lesson.difficulty,
        order: lIndex + 1,
        vocabulary: lesson.vocabulary.map((v, vIndex) => ({
          id: `${lessonId}_v${vIndex}`,  // w1_l1_v0, w1_l1_v1, ...
          hy: v.hy || '',
          en: v.en || '',
          ru: v.ru || '',
        })),
        phrases: lesson.phrases.map((p, pIndex) => ({
          id: `${lessonId}_p${pIndex}`,  // w1_l1_p0, w1_l1_p1, ...
          hy: p.hy || '',
          en: p.en || '',
          ru: p.ru || '',
          alt: p.alt || undefined,
        })),
        dialogues: lesson.dialogues.map((d, dIndex) => ({
          id: `${lessonId}_d${dIndex}`,  // w1_l1_d0, w1_l1_d1, ...
          title: d.title,
          turns: d.turns.map((t, tIndex) => ({
            speaker: t.speaker as 'nurik' | 'user',
            hy: t.hy || '',
            en: t.en || '',
            ru: t.ru || '',
          })),
        })),
        stats: {
          totalVocabulary: lesson.vocabulary.length,
          totalPhrases: lesson.phrases.length,
          totalDialogues: lesson.dialogues.length,
          totalTurns: lesson.dialogues.reduce((sum, d) => sum + d.turns.length, 0),
        },
      };

      exportedWorld.lessons.push(exportedLesson);
      data.allLessons.push(exportedLesson);
      
      // Collect all vocabulary with sequential IDs
      for (const v of exportedLesson.vocabulary) {
        data.allVocabulary.push(v);
      }
      
      // Collect all phrases with sequential IDs
      for (const p of exportedLesson.phrases) {
        data.allPhrases.push(p);
      }
      
      // Collect all dialogues with sequential IDs
      for (const d of exportedLesson.dialogues) {
        data.allDialogues.push(d);
      }
    }

    data.worlds.push(exportedWorld);
    data.totalLessons += worldLessons.length;
    data.totalWorlds++;
  }

  // ============================================================
  // GENERATE EXERCISE MAPPING
  // ============================================================

  const exerciseMapping: Record<string, { lessonId: string; index: number; type: string; dictionaryId: string }> = {};
  let exerciseCounter = 0;

  for (const lesson of data.allLessons) {
    // Map vocabulary to exercises
    for (const v of lesson.vocabulary) {
      exerciseMapping[`${lesson.id}_e${exerciseCounter}`] = {
        lessonId: lesson.id,
        index: exerciseCounter,
        type: 'vocab',
        dictionaryId: v.id,
      };
      exerciseCounter++;
    }
    
    // Map phrases to exercises
    for (const p of lesson.phrases) {
      exerciseMapping[`${lesson.id}_e${exerciseCounter}`] = {
        lessonId: lesson.id,
        index: exerciseCounter,
        type: 'phrase',
        dictionaryId: p.id,
      };
      exerciseCounter++;
    }
    
    // Map dialogues to exercises
    for (const d of lesson.dialogues) {
      exerciseMapping[`${lesson.id}_e${exerciseCounter}`] = {
        lessonId: lesson.id,
        index: exerciseCounter,
        type: 'dialogue',
        dictionaryId: d.id,
      };
      exerciseCounter++;
    }
  }

  // ============================================================
  // SAVE JSON
  // ============================================================

  const jsonPath = path.join(__dirname, '../exported-curriculum-sequenced.json');
  fs.writeFileSync(jsonPath, JSON.stringify({
    ...data,
    exerciseMapping,
    totalExercises: exerciseCounter,
  }, null, 2));
  console.log(`✅ JSON saved: ${jsonPath}`);

  // ============================================================
  // GENERATE SIMPLE EXERCISE LIST
  // ============================================================

  const exerciseList = Object.entries(exerciseMapping).map(([exerciseId, info]) => ({
    exerciseId,
    lessonId: info.lessonId,
    index: info.index,
    type: info.type,
    dictionaryId: info.dictionaryId,
  }));

  const exercisePath = path.join(__dirname, '../exercises-list.json');
  fs.writeFileSync(exercisePath, JSON.stringify(exerciseList, null, 2));
  console.log(`✅ Exercise list saved: ${exercisePath}`);

  // ============================================================
  // GENERATE AUDIO MAPPING
  // ============================================================

  const audioMapping: Record<string, string> = {};
  for (const [exerciseId, info] of Object.entries(exerciseMapping)) {
    audioMapping[exerciseId] = info.dictionaryId;
  }

  const audioPath = path.join(__dirname, '../src/lib/content/audio-mapping-generated.ts');
  const audioContent = `// Auto-generated from curriculum export
// Generated at: ${new Date().toISOString()}
// Total exercises: ${Object.keys(audioMapping).length}

export const EXERCISE_TO_DICTIONARY: Record<string, string> = {
${Object.entries(audioMapping)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([key, value]) => `  '${key}': '${value}',`)
  .join('\n')}
};

export const DICTIONARY_IDS = [
${data.allVocabulary.map(v => `  '${v.id}',`).join('\n')}
${data.allPhrases.map(p => `  '${p.id}',`).join('\n')}
${data.allDialogues.map(d => `  '${d.id}',`).join('\n')}
];

export function getDictionaryId(exerciseId: string): string | null {
  return EXERCISE_TO_DICTIONARY[exerciseId] || null;
}
`;
  fs.writeFileSync(audioPath, audioContent, 'utf-8');
  console.log(`✅ Audio mapping saved: ${audioPath}`);

  // ============================================================
  // GENERATE MARKDOWN
  // ============================================================

  let markdown = `# 📚 NUR Lingo - Full Curriculum (Sequenced)\n\n`;
  markdown += `**Exported at:** ${new Date().toISOString()}\n\n`;
  markdown += `**Total:** ${data.totalLessons} lessons, ${data.totalWorlds} worlds, ${exerciseCounter} exercises\n\n`;
  markdown += `---\n\n`;

  for (const world of data.worlds) {
    markdown += `## ${world.order}. ${world.iconEmoji} ${world.title.en} / ${world.title.hy} / ${world.title.ru}\n\n`;
    markdown += `*${world.description.en} / ${world.description.hy} / ${world.description.ru}*\n\n`;

    for (const lesson of world.lessons) {
      markdown += `### ${lesson.order}. 📖 ${lesson.title.en} / ${lesson.title.hy} / ${lesson.title.ru}\n\n`;
      markdown += `**ID:** \`${lesson.id}\` | **Difficulty:** ${lesson.difficulty}\n\n`;
      markdown += `*${lesson.concept.en} / ${lesson.concept.hy} / ${lesson.concept.ru}*\n\n`;
      markdown += `**Exercises:** ${lesson.vocabulary.length + lesson.phrases.length + lesson.dialogues.length}\n\n`;

      // Vocabulary
      if (lesson.vocabulary.length > 0) {
        markdown += `#### 📖 Vocabulary (${lesson.vocabulary.length})\n\n`;
        markdown += `| ID | Հայերեն | English | Русский |\n`;
        markdown += `|----|---------|---------|---------|\n`;
        lesson.vocabulary.forEach((v) => {
          markdown += `| \`${v.id}\` | ${v.hy} | ${v.en} | ${v.ru} |\n`;
        });
        markdown += `\n`;
      }

      // Phrases
      if (lesson.phrases.length > 0) {
        markdown += `#### 💬 Phrases (${lesson.phrases.length})\n\n`;
        markdown += `| ID | Հայերեն | English | Русский |\n`;
        markdown += `|----|---------|---------|---------|\n`;
        lesson.phrases.forEach((p) => {
          markdown += `| \`${p.id}\` | ${p.hy} | ${p.en} | ${p.ru} |\n`;
        });
        markdown += `\n`;
      }

      // Dialogues
      if (lesson.dialogues.length > 0) {
        markdown += `#### 🗣️ Dialogues (${lesson.dialogues.length})\n\n`;
        for (const dialogue of lesson.dialogues) {
          markdown += `##### \`${dialogue.id}\` - ${dialogue.title.en} / ${dialogue.title.hy} / ${dialogue.title.ru}\n\n`;
          for (const turn of dialogue.turns) {
            const speaker = turn.speaker === 'nurik' ? '🐿️ Nurik' : '🧑 You';
            markdown += `**${speaker}:**\n`;
            markdown += `- 🇦🇲 ${turn.hy}\n`;
            markdown += `- 🇬🇧 ${turn.en}\n`;
            markdown += `- 🇷🇺 ${turn.ru}\n\n`;
          }
        }
      }

      markdown += `---\n\n`;
    }
  }

  const mdPath = path.join(__dirname, '../exported-curriculum-sequenced.md');
  fs.writeFileSync(mdPath, markdown);
  console.log(`✅ Markdown saved: ${mdPath}`);

  // ============================================================
  // GENERATE CSV
  // ============================================================

  // Vocabulary CSV
  let vocabCSV = 'ID,LessonID,WorldID,HY,EN,RU\n';
  for (const v of data.allVocabulary) {
    const lesson = data.allLessons.find(l => l.id === v.id.split('_').slice(0, 2).join('_'));
    vocabCSV += `${v.id},${lesson?.id || ''},${lesson?.worldId || ''},${v.hy},${v.en},${v.ru}\n`;
  }
  const vocabCSVPath = path.join(__dirname, '../vocabulary-export.csv');
  fs.writeFileSync(vocabCSVPath, vocabCSV);
  console.log(`✅ Vocabulary CSV saved: ${vocabCSVPath}`);

  // Phrases CSV
  let phraseCSV = 'ID,LessonID,WorldID,HY,EN,RU\n';
  for (const p of data.allPhrases) {
    const lesson = data.allLessons.find(l => l.id === p.id.split('_').slice(0, 2).join('_'));
    phraseCSV += `${p.id},${lesson?.id || ''},${lesson?.worldId || ''},${p.hy},${p.en},${p.ru}\n`;
  }
  const phraseCSVPath = path.join(__dirname, '../phrases-export.csv');
  fs.writeFileSync(phraseCSVPath, phraseCSV);
  console.log(`✅ Phrases CSV saved: ${phraseCSVPath}`);

  // ============================================================
  // SUMMARY
  // ============================================================

  console.log('\n📊 EXPORT SUMMARY:');
  console.log(`   Total Worlds: ${data.totalWorlds}`);
  console.log(`   Total Lessons: ${data.totalLessons}`);
  console.log(`   Total Vocabulary: ${data.allVocabulary.length}`);
  console.log(`   Total Phrases: ${data.allPhrases.length}`);
  console.log(`   Total Dialogues: ${data.allDialogues.length}`);
  console.log(`   Total Exercises: ${exerciseCounter}`);

  console.log('\n📁 Files generated:');
  console.log(`   📄 exported-curriculum-sequenced.json`);
  console.log(`   📄 exported-curriculum-sequenced.md`);
  console.log(`   📄 exercises-list.json`);
  console.log(`   📄 src/lib/content/audio-mapping-generated.ts`);
  console.log(`   📄 vocabulary-export.csv`);
  console.log(`   📄 phrases-export.csv`);

  console.log('\n📝 ID FORMATS:');
  console.log(`   Lesson:   w1_l1, w1_l2, w2_l1, ...`);
  console.log(`   Vocab:    w1_l1_v0, w1_l1_v1, ...`);
  console.log(`   Phrase:   w1_l1_p0, w1_l1_p1, ...`);
  console.log(`   Dialogue: w1_l1_d0, w1_l1_d1, ...`);
  console.log(`   Exercise: w1_l1_e0, w1_l1_e1, ...`);

  console.log('\n🎯 DONE!');
}

// ============================================================
// RUN
// ============================================================

try {
  exportFullCurriculumSequenced();
} catch (error) {
  console.error('❌ Error:', error);
}