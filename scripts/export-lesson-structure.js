// scripts/export-lesson-structure.js
// Run: node scripts/export-lesson-structure.js

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('   📤 EXPORT LESSON STRUCTURE');
console.log('========================================\n');

// ─── READ DICTIONARY ──────────────────────────────────────────────

function getDictionary() {
  const dictPath = path.join(process.cwd(), 'data/dictionaries/lesson-dictionary.json');
  if (!fs.existsSync(dictPath)) {
    console.log(`❌ Dictionary not found: ${dictPath}`);
    return null;
  }
  const content = fs.readFileSync(dictPath, 'utf-8');
  return JSON.parse(content);
}

// ─── READ MAPPING ──────────────────────────────────────────────────

function getExerciseToAudio() {
  const filePath = path.join(process.cwd(), 'src/lib/content/audio-mapping.ts');
  const content = fs.readFileSync(filePath, 'utf-8');
  const regex = /export const EXERCISE_TO_AUDIO\s*:\s*Record<string,\s*string>\s*=\s*{([\s\S]*?)};/;
  const match = content.match(regex);
  
  if (!match) return {};
  
  const block = match[1];
  const lineRegex = /['"](\w+)['"]\s*:\s*['"](\w+)['"]/g;
  const result = {};
  let lineMatch;
  
  while ((lineMatch = lineRegex.exec(block)) !== null) {
    result[lineMatch[1]] = lineMatch[2];
  }
  
  return result;
}

// ─── MAIN ────────────────────────────────────────────────────────────

function main() {
  const dictionary = getDictionary();
  if (!dictionary) return;
  
  const mapping = getExerciseToAudio();
  console.log(`📋 Total mappings: ${Object.keys(mapping).length}`);
  
  // Get lessons array
  let lessons = [];
  if (Array.isArray(dictionary.lessons)) {
    lessons = dictionary.lessons;
  } else if (dictionary.lessons && typeof dictionary.lessons === 'object') {
    lessons = Object.values(dictionary.lessons);
  }
  
  console.log(`📚 Total lessons: ${lessons.length}\n`);
  
  // ─── EXPORT STRUCTURE ────────────────────────────────────────────
  
  const structure = {
    timestamp: new Date().toISOString(),
    totalLessons: lessons.length,
    lessons: {}
  };
  
  for (const lesson of lessons) {
    const lessonId = lesson.id;
    const exercises = lesson.exercises || [];
    const vocabulary = lesson.vocabulary || [];
    
    structure.lessons[lessonId] = {
      id: lessonId,
      worldId: lesson.worldId || '',
      order: lesson.order || 0,
      difficulty: lesson.difficulty || '',
      category: lesson.category || '',
      title: lesson.title || {},
      concept: lesson.concept || {},
      estimatedMinutes: lesson.estimatedMinutes || 10,
      tags: lesson.tags || [],
      vocabularyCount: vocabulary.length,
      exercisesCount: exercises.length,
      vocabulary: vocabulary.map(v => ({
        id: v.id,
        hy: v.hy,
        en: v.en,
        ru: v.ru || '',
        audioId: v.audioId || '',
        hasAudio: !!mapping[v.audioId] || !!mapping[v.id]
      })),
      exercises: exercises.map(ex => ({
        id: ex.id,
        type: ex.type || '',
        order: ex.order || 0,
        difficulty: ex.difficulty || 1,
        points: ex.points || 10,
        prompt: ex.prompt || {},
        targetAnswer: ex.targetAnswer || ex.correctAnswer || '',
        options: ex.options || [],
        acceptableAnswers: ex.acceptableAnswers || [],
        audioId: ex.audioId || '',
        hasAudio: !!mapping[ex.id] || !!mapping[ex.audioId],
        hint: ex.hint || {},
        feedback: ex.feedback || {}
      }))
    };
  }
  
  // ─── SAVE REPORT ──────────────────────────────────────────────────
  
  const reportPath = path.join(process.cwd(), 'lesson-structure-export.json');
  fs.writeFileSync(reportPath, JSON.stringify(structure, null, 2));
  console.log(`✅ Structure exported: ${reportPath}`);
  
  // ─── PRINT SUMMARY ───────────────────────────────────────────────
  
  console.log('\n📊 SUMMARY BY LESSON:');
  console.log('─'.repeat(60));
  
  for (const [lessonId, data] of Object.entries(structure.lessons)) {
    const withAudio = data.exercises.filter(e => e.hasAudio).length;
    const total = data.exercises.length;
    console.log(`  ${lessonId}: ${total} exercises, ${withAudio} with audio (${((withAudio/total)*100).toFixed(1)}%)`);
  }
  
  // ─── FIND LESSONS WITHOUT AUDIO ──────────────────────────────────
  
  console.log('\n⚠️ LESSONS WITH MISSING AUDIO:');
  console.log('─'.repeat(60));
  
  let hasMissing = false;
  for (const [lessonId, data] of Object.entries(structure.lessons)) {
    const missing = data.exercises.filter(e => !e.hasAudio);
    if (missing.length > 0) {
      hasMissing = true;
      console.log(`  ${lessonId}: ${missing.length} missing`);
      for (const ex of missing.slice(0, 3)) {
        console.log(`    ${ex.id} → audioId: ${ex.audioId || 'NONE'}`);
      }
      if (missing.length > 3) {
        console.log(`    ... and ${missing.length - 3} more`);
      }
    }
  }
  
  if (!hasMissing) {
    console.log('  ✅ All lessons have audio!');
  }
  
  // ─── SAVE CSV ─────────────────────────────────────────────────────
  
  let csv = 'Lesson,Exercise ID,Type,Prompt,Answer,Audio ID,Has Audio\n';
  for (const [lessonId, data] of Object.entries(structure.lessons)) {
    for (const ex of data.exercises) {
      const prompt = (ex.prompt.hy || ex.prompt.en || '').replace(/,/g, ';');
      const answer = (ex.targetAnswer || '').replace(/,/g, ';');
      csv += `${lessonId},${ex.id},${ex.type},"${prompt}","${answer}",${ex.audioId || 'NONE'},${ex.hasAudio ? 'YES' : 'NO'}\n`;
    }
  }
  
  const csvPath = path.join(process.cwd(), 'lesson-structure.csv');
  fs.writeFileSync(csvPath, csv);
  console.log(`\n✅ CSV exported: ${csvPath}`);
  
  console.log('\n🎉 Done!');
}

main();