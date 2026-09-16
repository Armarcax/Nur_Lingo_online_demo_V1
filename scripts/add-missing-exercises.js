// scripts/add-missing-exercises.js
// Run: node scripts/add-missing-exercises.js

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('   ➕ ADD MISSING EXERCISES');
console.log('   Adding exercises from mapping to dictionary');
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
  const backupPath = path.join(process.cwd(), 'data/dictionaries/lesson-dictionary-backup-add.json');
  if (fs.existsSync(dictPath)) {
    fs.copyFileSync(dictPath, backupPath);
    console.log(`✅ Backup saved: ${backupPath}`);
  }
  
  fs.writeFileSync(dictPath, JSON.stringify(data, null, 2));
  console.log(`✅ Dictionary saved: ${dictPath}`);
}

// ─── GET MAPPING FOR LESSON ──────────────────────────────────────

function getMappingForLesson(lessonId, mapping) {
  const result = [];
  for (const [key, value] of Object.entries(mapping)) {
    if (key.startsWith(lessonId)) {
      result.push({ id: key, audioId: value });
    }
  }
  return result.sort((a, b) => a.id.localeCompare(b.id));
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
  
  // ─── ADD MISSING EXERCISES ──────────────────────────────────────
  
  let totalAdded = 0;
  let lessonsUpdated = 0;
  
  // Specifically target w1_l2 and w1_l3
  const targetLessons = ['w1_l2', 'w1_l3'];
  
  for (const lesson of lessons) {
    const lessonId = lesson.id;
    
    // Only process target lessons
    if (!targetLessons.includes(lessonId)) continue;
    
    const lessonMapping = getMappingForLesson(lessonId, mapping);
    const existingIds = new Set(lesson.exercises.map(ex => ex.id));
    
    console.log(`\n📝 ${lessonId}: ${lesson.exercises.length} existing, ${lessonMapping.length} in mapping`);
    
    let added = 0;
    
    // Add missing exercises from mapping
    for (const mapEx of lessonMapping) {
      if (!existingIds.has(mapEx.id)) {
        // Create a new exercise from mapping
        const newExercise = {
          id: mapEx.id,
          type: 'multiple_choice',
          order: lesson.exercises.length + added,
          difficulty: 1,
          points: 10,
          prompt: {
            en: `Exercise ${mapEx.id}`,
            hy: `Վարժություն ${mapEx.id}`,
            ru: `Упражнение ${mapEx.id}`
          },
          targetAnswer: '',
          options: [],
          audioId: mapEx.audioId,
          hint: {},
          feedback: {
            correct: {},
            incorrect: {}
          }
        };
        
        lesson.exercises.push(newExercise);
        added++;
        totalAdded++;
      }
    }
    
    if (added > 0) {
      lessonsUpdated++;
      // Re-sort exercises by order
      lesson.exercises.sort((a, b) => {
        const aNum = parseInt(a.id.match(/\d+$/)?.[0] || '0');
        const bNum = parseInt(b.id.match(/\d+$/)?.[0] || '0');
        return aNum - bNum;
      });
      // Update order
      lesson.exercises.forEach((ex, i) => {
        ex.order = i;
      });
      console.log(`  ✅ Added ${added} exercises`);
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
    let withAudio = 0;
    for (const ex of w1l2.exercises.slice(0, 5)) {
      const hasAudio = mapping[ex.id] ? '✅' : '❌';
      if (mapping[ex.id]) withAudio++;
      console.log(`  ${hasAudio} ${ex.id} → ${mapping[ex.id] || 'NOT FOUND'}`);
    }
    console.log(`  ✅ ${withAudio}/${w1l2.exercises.length} with audio`);
  }
  
  const w1l3 = lessons.find(l => l.id === 'w1_l3');
  if (w1l3) {
    console.log(`\n📝 w1_l3: ${w1l3.exercises.length} exercises`);
    let withAudio = 0;
    for (const ex of w1l3.exercises.slice(0, 5)) {
      const hasAudio = mapping[ex.id] ? '✅' : '❌';
      if (mapping[ex.id]) withAudio++;
      console.log(`  ${hasAudio} ${ex.id} → ${mapping[ex.id] || 'NOT FOUND'}`);
    }
    console.log(`  ✅ ${withAudio}/${w1l3.exercises.length} with audio`);
  }
  
  // ─── SUMMARY ──────────────────────────────────────────────────────
  
  console.log('\n📊 SUMMARY:');
  console.log(`  Lessons updated: ${lessonsUpdated}`);
  console.log(`  Exercises added: ${totalAdded}`);
  
  // Check final coverage
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