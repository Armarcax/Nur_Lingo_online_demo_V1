// scripts/verify-audio-matching.js
// Run: node scripts/verify-audio-matching.js

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('   🔍 AUDIO MATCHING VERIFICATION');
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

// ─── GET AUDIO FILES ─────────────────────────────────────────────────

function getAudioFiles(voice) {
  const dir = path.join(process.cwd(), 'public/audio/offline', voice);
  const files = new Set();
  
  if (fs.existsSync(dir)) {
    const items = fs.readdirSync(dir).filter(f => f.endsWith('.mp3'));
    for (const item of items) {
      files.add(item.replace('.mp3', ''));
    }
  }
  
  return files;
}

// ─── MAIN ────────────────────────────────────────────────────────────

function main() {
  const mapping = getExerciseToAudio();
  const entries = Object.entries(mapping);
  
  console.log(`📋 Total mappings: ${entries.length}`);
  
  // 1. Check if all exercises have unique audio IDs
  const audioIdCount = {};
  for (const [exerciseId, audioId] of entries) {
    if (!audioIdCount[audioId]) audioIdCount[audioId] = [];
    audioIdCount[audioId].push(exerciseId);
  }
  
  const uniqueAudioIds = Object.keys(audioIdCount).length;
  console.log(`🎵 Unique audio IDs: ${uniqueAudioIds}`);
  
  // 2. Find duplicates (multiple exercises with same audio ID)
  const duplicates = {};
  for (const [audioId, exercises] of Object.entries(audioIdCount)) {
    if (exercises.length > 1) {
      duplicates[audioId] = exercises;
    }
  }
  
  console.log(`📊 Duplicate audio IDs: ${Object.keys(duplicates).length}`);
  
  // 3. Check by lesson
  const lessonAudio = {};
  for (const [exerciseId, audioId] of entries) {
    const match = exerciseId.match(/^(w\d+_l\d+)/);
    if (match) {
      const lesson = match[1];
      if (!lessonAudio[lesson]) lessonAudio[lesson] = new Set();
      lessonAudio[lesson].add(audioId);
    }
  }
  
  console.log(`📚 Lessons: ${Object.keys(lessonAudio).length}`);
  
  // 4. Check audio file existence
  const hyFiles = getAudioFiles('hy_Ani');
  const enFiles = getAudioFiles('en_female');
  const ruFiles = getAudioFiles('ru_female');
  
  let hyMissing = 0;
  let enMissing = 0;
  let ruMissing = 0;
  
  for (const [exerciseId, audioId] of entries) {
    if (!hyFiles.has(audioId)) hyMissing++;
    if (!enFiles.has(audioId)) enMissing++;
    if (!ruFiles.has(audioId)) ruMissing++;
  }
  
  console.log('\n🎵 VOICE FILES:');
  console.log(`  hy_Ani: ${hyFiles.size} files (${hyMissing} missing)`);
  console.log(`  en_female: ${enFiles.size} files (${enMissing} missing)`);
  console.log(`  ru_female: ${ruFiles.size} files (${ruMissing} missing)`);
  
  // 5. Show sample of duplicates
  if (Object.keys(duplicates).length > 0) {
    console.log('\n⚠️ DUPLICATE AUDIO IDs:');
    let count = 0;
    for (const [audioId, exercises] of Object.entries(duplicates)) {
      if (count >= 10) break;
      console.log(`  ${audioId} → ${exercises.slice(0, 3).join(', ')}${exercises.length > 3 ? ` ... (${exercises.length})` : ''}`);
      count++;
    }
    if (Object.keys(duplicates).length > 10) {
      console.log(`  ... and ${Object.keys(duplicates).length - 10} more`);
    }
  }
  
  // 6. Check if each lesson has distinct audio IDs
  console.log('\n📚 LESSON AUDIO UNIQUENESS:');
  let lessonsWithUnique = 0;
  let lessonsWithDuplicates = 0;
  for (const [lesson, audioIds] of Object.entries(lessonAudio)) {
    if (audioIds.size === 17) {
      lessonsWithUnique++;
    } else if (audioIds.size > 0) {
      lessonsWithDuplicates++;
      // Show sample
      if (lessonsWithDuplicates <= 5) {
        console.log(`  ⚠️ ${lesson}: ${audioIds.size}/17 unique audio IDs`);
      }
    }
  }
  
  console.log(`\n  ✅ Lessons with 17 unique audio IDs: ${lessonsWithUnique}`);
  console.log(`  ⚠️ Lessons with duplicate audio IDs: ${lessonsWithDuplicates}`);
  
  // 7. Check specific lessons
  console.log('\n🔍 SPECIFIC LESSON CHECK:');
  const testLessons = ['w1_l1', 'w1_l2', 'w1_l3', 'w2_l1', 'w10_l1'];
  for (const lesson of testLessons) {
    const exercises = entries.filter(([id]) => id.startsWith(lesson));
    const audioIds = exercises.map(([, audioId]) => audioId);
    const unique = new Set(audioIds);
    console.log(`  ${lesson}: ${exercises.length} exercises, ${unique.size} unique audio IDs`);
    if (unique.size < exercises.length) {
      console.log(`    ⚠️ ${exercises.length - unique.size} duplicates`);
    }
  }
  
  // 8. Check w1_l1 specifically
  console.log('\n📝 w1_l1 EXERCISES:');
  const w1l1 = entries.filter(([id]) => id.startsWith('w1_l1'));
  for (const [id, audioId] of w1l1) {
    const hasHy = hyFiles.has(audioId);
    const hasEn = enFiles.has(audioId);
    console.log(`  ${id} → ${audioId} ${hasHy ? '✅' : '❌'} hy ${hasEn ? '✅' : '❌'} en`);
  }
  
  // 9. Check w1_l2
  console.log('\n📝 w1_l2 EXERCISES:');
  const w1l2 = entries.filter(([id]) => id.startsWith('w1_l2'));
  for (const [id, audioId] of w1l2) {
    const hasHy = hyFiles.has(audioId);
    const hasEn = enFiles.has(audioId);
    console.log(`  ${id} → ${audioId} ${hasHy ? '✅' : '❌'} hy ${hasEn ? '✅' : '❌'} en`);
  }
  
  // 10. SUMMARY
  console.log('\n' + '═'.repeat(60));
  console.log('📊 FINAL SUMMARY:');
  console.log(`  Total mappings: ${entries.length}`);
  console.log(`  Unique audio IDs: ${uniqueAudioIds}`);
  console.log(`  Duplicate audio IDs: ${Object.keys(duplicates).length}`);
  console.log(`  Lessons: ${Object.keys(lessonAudio).length}`);
  console.log(`  Lessons with unique audio: ${lessonsWithUnique}/${Object.keys(lessonAudio).length}`);
  
  if (lessonsWithUnique === Object.keys(lessonAudio).length && Object.keys(duplicates).length === 0) {
    console.log('\n✅ PERFECT! Every exercise has a unique audio ID.');
    console.log('   Each audio file correctly matches its exercise.');
  } else if (Object.keys(duplicates).length > 0) {
    console.log(`\n⚠️ ${Object.keys(duplicates).length} audio IDs are used by multiple exercises.`);
    console.log('   This means the SAME audio file is used for different exercises.');
    console.log('   This is expected if exercises share the same vocabulary word.');
  }
  
  console.log('════════════════════════════════════════════════════════');
}

main();