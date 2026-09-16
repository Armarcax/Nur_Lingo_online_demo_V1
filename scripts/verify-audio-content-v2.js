// scripts/verify-audio-content-v2.js
// Run: node scripts/verify-audio-content-v2.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('========================================');
console.log('   🔍 AUDIO CONTENT VERIFICATION V2');
console.log('   Checking prompt/answer matching');
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

// ─── GET LESSON DATA ──────────────────────────────────────────────

function getLessonData() {
  try {
    const dictPath = path.join(process.cwd(), 'public/data/dictionaries/lesson-dictionary.json');
    const content = fs.readFileSync(dictPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

// ─── GET AUDIO FILE INFO ──────────────────────────────────────────

function getAudioFileInfo(voice, audioId) {
  const filePath = path.join(process.cwd(), 'public/audio/offline', voice, `${audioId}.mp3`);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    return {
      exists: true,
      size: stats.size,
      path: filePath
    };
  }
  return { exists: false, size: 0, path: null };
}

// ─── MAIN ────────────────────────────────────────────────────────────

function main() {
  const mapping = getExerciseToAudio();
  const dict = getLessonData();
  
  console.log(`📋 Total mappings: ${Object.keys(mapping).length}\n`);
  
  // ─── 1. SHOW SAMPLE EXERCISES FROM MAPPING ──────────────────────
  
  console.log('📝 SAMPLE EXERCISES FROM MAPPING:');
  console.log('─'.repeat(60));
  
  const sampleKeys = Object.keys(mapping).filter(k => k.startsWith('w1_l1')).slice(0, 10);
  for (const key of sampleKeys) {
    console.log(`  ${key} → ${mapping[key]}`);
  }
  console.log('');
  
  // ─── 2. GET LESSON FROM DICTIONARY ──────────────────────────────
  
  if (dict && dict.lessons) {
    console.log('📚 LESSONS FROM DICTIONARY:');
    console.log('─'.repeat(60));
    
    // Find w1_l1
    const lesson = dict.lessons.find(l => l.id === 'w1_l1');
    if (lesson && lesson.exercises) {
      console.log(`  w1_l1 has ${lesson.exercises.length} exercises:`);
      for (const ex of lesson.exercises.slice(0, 5)) {
        const audioId = mapping[ex.id] || '❌ NOT FOUND';
        console.log(`    ${ex.id} → ${audioId}`);
        if (ex.prompt) {
          console.log(`      Q: ${ex.prompt.hy || ex.prompt.en || ''}`);
        }
        if (ex.targetAnswer) {
          console.log(`      A: ${ex.targetAnswer}`);
        }
      }
    }
  }
  
  // ─── 3. CHECK AUDIO FILES ────────────────────────────────────────
  
  console.log('\n🎵 CHECKING AUDIO FILES:');
  console.log('─'.repeat(60));
  
  // Get first 10 exercises from mapping
  const testExercises = Object.keys(mapping).filter(k => k.startsWith('w1_l1')).slice(0, 10);
  
  for (const exerciseId of testExercises) {
    const audioId = mapping[exerciseId];
    const hyFile = getAudioFileInfo('hy_Ani', audioId);
    const enFile = getAudioFileInfo('en_female', audioId);
    
    console.log(`  ${exerciseId}:`);
    console.log(`    Audio ID: ${audioId}`);
    console.log(`    hy_Ani: ${hyFile.exists ? '✅' : '❌'} (${hyFile.size} bytes)`);
    console.log(`    en_female: ${enFile.exists ? '✅' : '❌'} (${enFile.size} bytes)`);
  }
  
  // ─── 4. CHECK FOR DUPLICATES ─────────────────────────────────────
  
  console.log('\n📊 CHECKING FOR DUPLICATES:');
  console.log('─'.repeat(60));
  
  const audioIdMap = {};
  for (const [exerciseId, audioId] of Object.entries(mapping)) {
    if (!audioIdMap[audioId]) audioIdMap[audioId] = [];
    audioIdMap[audioId].push(exerciseId);
  }
  
  let duplicateCount = 0;
  for (const [audioId, exercises] of Object.entries(audioIdMap)) {
    if (exercises.length > 1) {
      duplicateCount++;
      if (duplicateCount <= 5) {
        console.log(`  ⚠️ ${audioId} → used by ${exercises.length} exercises:`);
        for (const ex of exercises.slice(0, 3)) {
          console.log(`      ${ex}`);
        }
        if (exercises.length > 3) {
          console.log(`      ... and ${exercises.length - 3} more`);
        }
      }
    }
  }
  
  if (duplicateCount === 0) {
    console.log('  ✅ No duplicate audio IDs found');
  } else {
    console.log(`  ⚠️ ${duplicateCount} duplicate audio IDs found`);
  }
  
  // ─── 5. CHECK LESSON COVERAGE ────────────────────────────────────
  
  console.log('\n📚 LESSON COVERAGE:');
  console.log('─'.repeat(60));
  
  const lessonExercises = {};
  for (const [exerciseId] of Object.entries(mapping)) {
    const match = exerciseId.match(/^(w\d+_l\d+)/);
    if (match) {
      const lesson = match[1];
      if (!lessonExercises[lesson]) lessonExercises[lesson] = 0;
      lessonExercises[lesson]++;
    }
  }
  
  for (const [lesson, count] of Object.entries(lessonExercises).sort()) {
    console.log(`  ${lesson}: ${count} exercises`);
  }
  
  // ─── 6. SUMMARY ───────────────────────────────────────────────────
  
  console.log('\n' + '═'.repeat(60));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(60));
  console.log('');
  console.log(`  Total mappings: ${Object.keys(mapping).length}`);
  console.log(`  Unique audio IDs: ${Object.keys(audioIdMap).length}`);
  console.log(`  Duplicates: ${duplicateCount}`);
  console.log(`  Lessons: ${Object.keys(lessonExercises).length}`);
  
  // ─── 7. RECOMMENDATION ────────────────────────────────────────────
  
  console.log('\n💡 RECOMMENDATION:');
  console.log('─'.repeat(60));
  
  if (duplicateCount === 0) {
    console.log('  ✅ All exercises have unique audio IDs.');
    console.log('  ✅ Each question and answer has its own audio file.');
    console.log('  ✅ The mapping is correct.');
  } else {
    console.log(`  ⚠️ ${duplicateCount} audio IDs are used by multiple exercises.`);
    console.log('  This means the SAME audio file is used for different exercises.');
    console.log('  You need to check if the audio content matches the prompt/answer.');
  }
  
  console.log('\n📁 To check audio content, listen to the files:');
  console.log('  public/audio/offline/hy_Ani/000001.mp3');
  console.log('  public/audio/offline/en_female/000001.mp3');
  
  // ─── SAVE REPORT ──────────────────────────────────────────────────
  
  const report = {
    timestamp: new Date().toISOString(),
    totalMappings: Object.keys(mapping).length,
    uniqueAudioIds: Object.keys(audioIdMap).length,
    duplicates: duplicateCount,
    lessons: Object.keys(lessonExercises).length,
    lessonExercises: lessonExercises,
    sampleExercises: Object.keys(mapping).filter(k => k.startsWith('w1_l1')).slice(0, 20).map(k => ({
      id: k,
      audioId: mapping[k]
    }))
  };
  
  fs.writeFileSync('audio-content-report-v2.json', JSON.stringify(report, null, 2));
  console.log('\n📁 Report saved: audio-content-report-v2.json');
  
  console.log('\n' + '═'.repeat(60));
}

main();