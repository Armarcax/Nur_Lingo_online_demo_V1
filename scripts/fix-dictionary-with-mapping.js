// scripts/fix-dictionary-with-mapping.js
// Run: node scripts/fix-dictionary-with-mapping.js

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('   🔧 FIX DICTIONARY WITH MAPPING');
console.log('   Aligning exercise IDs with audio mapping');
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
  // Backup
  const backupPath = path.join(process.cwd(), 'data/dictionaries/lesson-dictionary-backup-fixed.json');
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
  
  // ─── UPDATE EACH LESSON ──────────────────────────────────────────
  
  let totalUpdated = 0;
  let lessonsUpdated = 0;
  
  for (const lesson of lessons) {
    const lessonId = lesson.id;
    const lessonMapping = getMappingForLesson(lessonId, mapping);
    
    if (lessonMapping.length === 0) {
      console.log(`⚠️ No mapping found for ${lessonId}`);
      continue;
    }
    
    const exercises = lesson.exercises || [];
    let updated = 0;
    
    console.log(`\n📝 ${lessonId}: ${exercises.length} exercises, ${lessonMapping.length} in mapping`);
    
    // Update each exercise
    for (let i = 0; i < Math.min(exercises.length, lessonMapping.length); i++) {
      const oldId = exercises[i].id;
      const newId = lessonMapping[i].id;
      const audioId = lessonMapping[i].audioId;
      
      // Update ID
      if (oldId !== newId) {
        exercises[i].id = newId;
        updated++;
      }
      
      // Update audioId
      exercises[i].audioId = audioId;
    }
    
    if (updated > 0) {
      lessonsUpdated++;
      totalUpdated += updated;
      console.log(`  ✅ Updated ${updated} exercise IDs`);
    }
  }
  
  // ─── SAVE ──────────────────────────────────────────────────────────
  
  // Reconstruct dictionary
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
  
  console.log('\n🔍 VERIFYING w1_l1:');
  const w1l1 = lessons.find(l => l.id === 'w1_l1');
  if (w1l1) {
    console.log(`  ${w1l1.exercises.length} exercises:`);
    let withAudio = 0;
    for (const ex of w1l1.exercises) {
      const hasAudio = mapping[ex.id] ? '✅' : '❌';
      if (mapping[ex.id]) withAudio++;
      console.log(`    ${hasAudio} ${ex.id} → ${mapping[ex.id] || 'NOT FOUND'}`);
    }
    console.log(`  ✅ ${withAudio}/${w1l1.exercises.length} with audio`);
  }
  
  console.log('\n📊 SUMMARY:');
  console.log(`  Lessons updated: ${lessonsUpdated}/${lessons.length}`);
  console.log(`  Exercises updated: ${totalUpdated}`);
  
  // ─── CHECK FOR REMAINING ISSUES ──────────────────────────────────
  
  let remainingIssues = 0;
  let issueLessons = [];
  
  for (const lesson of lessons) {
    let lessonIssues = 0;
    for (const ex of lesson.exercises || []) {
      if (!mapping[ex.id]) {
        lessonIssues++;
        remainingIssues++;
      }
    }
    if (lessonIssues > 0) {
      issueLessons.push({ lesson: lesson.id, issues: lessonIssues });
    }
  }
  
  if (remainingIssues === 0) {
    console.log('  ✅ No remaining issues! All exercises have audio.');
  } else {
    console.log(`  ⚠️ ${remainingIssues} exercises still have issues:`);
    for (const il of issueLessons.slice(0, 5)) {
      console.log(`    ${il.lesson}: ${il.issues} issues`);
    }
    if (issueLessons.length > 5) {
      console.log(`    ... and ${issueLessons.length - 5} more lessons`);
    }
  }
  
  console.log('\n🎉 Done!');
}

main();