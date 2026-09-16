// scripts/keep-only-audio-exercises.js
// Run: node scripts/keep-only-audio-exercises.js

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('   🧹 KEEP ONLY AUDIO EXERCISES');
console.log('   Removing exercises without audio');
console.log('========================================\n');

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

// ─── SAVE DICTIONARY ──────────────────────────────────────────────

function saveDictionary(data) {
  const dictPath = path.join(process.cwd(), 'data/dictionaries/lesson-dictionary.json');
  const backupPath = path.join(process.cwd(), 'data/dictionaries/lesson-dictionary-backup-keep.json');
  if (fs.existsSync(dictPath)) {
    fs.copyFileSync(dictPath, backupPath);
    console.log(`✅ Backup saved: ${backupPath}`);
  }
  
  fs.writeFileSync(dictPath, JSON.stringify(data, null, 2));
  console.log(`✅ Dictionary saved: ${dictPath}`);
}

// ─── MAIN ────────────────────────────────────────────────────────────

function main() {
  const mapping = getExerciseToAudio();
  console.log(`📋 Total mappings: ${Object.keys(mapping).length}`);
  
  const dictionary = getDictionary();
  if (!dictionary) return;
  
  // Get lessons
  let lessons = [];
  if (Array.isArray(dictionary.lessons)) {
    lessons = dictionary.lessons;
  } else if (dictionary.lessons && typeof dictionary.lessons === 'object') {
    lessons = Object.values(dictionary.lessons);
  }
  
  console.log(`📚 Total lessons: ${lessons.length}\n`);
  
  // ─── PROCESS EACH LESSON ──────────────────────────────────────────
  
  let totalRemoved = 0;
  let lessonsUpdated = 0;
  const targetLessons = ['w1_l2', 'w1_l3'];
  
  for (const lesson of lessons) {
    const lessonId = lesson.id;
    
    // Only process target lessons
    if (!targetLessons.includes(lessonId)) continue;
    
    const exercises = lesson.exercises || [];
    const kept = [];
    let removed = 0;
    
    console.log(`\n📝 ${lessonId}: ${exercises.length} exercises`);
    
    for (const ex of exercises) {
      if (mapping[ex.id]) {
        kept.push(ex);
      } else {
        removed++;
        totalRemoved++;
      }
    }
    
    if (removed > 0) {
      lesson.exercises = kept;
      // Re-sort and update order
      lesson.exercises.sort((a, b) => {
        const aNum = parseInt(a.id.match(/\d+$/)?.[0] || '0');
        const bNum = parseInt(b.id.match(/\d+$/)?.[0] || '0');
        return aNum - bNum;
      });
      lesson.exercises.forEach((ex, i) => {
        ex.order = i;
      });
      lessonsUpdated++;
      console.log(`  ✅ Kept ${kept.length} exercises, removed ${removed}`);
    } else {
      console.log(`  ✅ All ${exercises.length} exercises have audio`);
    }
  }
  
  // ─── SAVE ──────────────────────────────────────────────────────────
  
  if (Array.isArray(dictionary.lessons)) {
    dictionary.lessons = lessons;
  } else {
    const newLessons = {};
    for (const lesson of lessons) {
      newLessons[lesson.id] = lesson;
    }
    dictionary.lessons = newLessons;
  }
  
  saveDictionary(dictionary);
  
  // ─── VERIFY ────────────────────────────────────────────────────────
  
  console.log('\n🔍 VERIFYING RESULTS:');
  console.log('─'.repeat(60));
  
  const w1l2 = lessons.find(l => l.id === 'w1_l2');
  if (w1l2) {
    console.log(`\n📝 w1_l2: ${w1l2.exercises.length} exercises`);
    for (const ex of w1l2.exercises) {
      const hasAudio = mapping[ex.id] ? '✅' : '❌';
      console.log(`  ${hasAudio} ${ex.id} → ${mapping[ex.id] || 'NOT FOUND'}`);
    }
  }
  
  const w1l3 = lessons.find(l => l.id === 'w1_l3');
  if (w1l3) {
    console.log(`\n📝 w1_l3: ${w1l3.exercises.length} exercises`);
    for (const ex of w1l3.exercises) {
      const hasAudio = mapping[ex.id] ? '✅' : '❌';
      console.log(`  ${hasAudio} ${ex.id} → ${mapping[ex.id] || 'NOT FOUND'}`);
    }
  }
  
  // ─── SUMMARY ──────────────────────────────────────────────────────
  
  console.log('\n📊 SUMMARY:');
  console.log(`  Lessons updated: ${lessonsUpdated}`);
  console.log(`  Exercises removed: ${totalRemoved}`);
  
  let totalExercises = 0;
  let totalWithAudio = 0;
  
  for (const lesson of lessons) {
    totalExercises += lesson.exercises.length;
    for (const ex of lesson.exercises) {
      if (mapping[ex.id]) totalWithAudio++;
    }
  }
  
  console.log(`  Total exercises: ${totalExercises}`);
  console.log(`  With audio: ${totalWithAudio}`);
  console.log(`  Coverage: ${((totalWithAudio / totalExercises) * 100).toFixed(1)}%`);
  
  console.log('\n🎉 Done!');
}

main();