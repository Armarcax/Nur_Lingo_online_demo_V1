// scripts/verify-audio-content.js
// Run: node scripts/verify-audio-content.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('========================================');
console.log('   🔍 AUDIO CONTENT VERIFICATION');
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

// ─── CHECK AUDIO FILE SIZE ─────────────────────────────────────────

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

// ─── COMPARE TWO FILES ─────────────────────────────────────────────

function areFilesIdentical(file1, file2) {
  try {
    const hash1 = crypto.createHash('md5').update(fs.readFileSync(file1)).digest('hex');
    const hash2 = crypto.createHash('md5').update(fs.readFileSync(file2)).digest('hex');
    return hash1 === hash2;
  } catch {
    return false;
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────

function main() {
  const mapping = getExerciseToAudio();
  const dict = getLessonData();
  
  if (!dict) {
    console.log('❌ Lesson dictionary not found');
    return;
  }
  
  console.log(`📋 Total mappings: ${Object.keys(mapping).length}\n`);
  
  // Test specific exercises
  const testExercises = [
    { lesson: 'w1_l1', exercise: 'w1_l1_mc_0', prompt: 'Ընտրիր "բարև"-ի թարգմանությունը', answer: 'hello' },
    { lesson: 'w1_l1', exercise: 'w1_l1_tr_0', prompt: 'Թարգմանիր՝ "բարև"', answer: 'hello' },
    { lesson: 'w1_l2', exercise: 'w1_l2_mc_0', prompt: 'Ընտրիր "պաշտոնական"-ի թարգմանությունը', answer: 'formal' },
    { lesson: 'w1_l2', exercise: 'w1_l2_tr_0', prompt: 'Թարգմանիր՝ "պաշտոնական"', answer: 'formal' },
  ];
  
  console.log('🔍 Checking specific exercises:\n');
  
  for (const test of testExercises) {
    const audioId = mapping[test.exercise];
    if (!audioId) {
      console.log(`  ❌ ${test.exercise} → No audio ID found`);
      continue;
    }
    
    const hyFile = getAudioFileInfo('hy_Ani', audioId);
    const enFile = getAudioFileInfo('en_female', audioId);
    
    console.log(`  📝 ${test.exercise}:`);
    console.log(`     Q: ${test.prompt}`);
    console.log(`     A: ${test.answer}`);
    console.log(`     Audio ID: ${audioId}`);
    console.log(`     hy_Ani: ${hyFile.exists ? '✅' : '❌'} (${hyFile.size} bytes)`);
    console.log(`     en_female: ${enFile.exists ? '✅' : '❌'} (${enFile.size} bytes)`);
    
    // Check if hy_Ani and en_female files are the same
    if (hyFile.exists && enFile.exists) {
      const identical = areFilesIdentical(hyFile.path, enFile.path);
      console.log(`     Files identical: ${identical ? '⚠️ YES (this is a problem!)' : '✅ NO (different files)'}`);
    }
    
    console.log('');
  }
  
  // ─── CHECK ALL LESSONS ────────────────────────────────────────────
  
  console.log('═'.repeat(60));
  console.log('📊 CHECKING ALL LESSONS');
  console.log('═'.repeat(60));
  console.log('');
  
  const lessons = {};
  for (const [exerciseId, audioId] of Object.entries(mapping)) {
    const match = exerciseId.match(/^(w\d+_l\d+)/);
    if (match) {
      const lesson = match[1];
      if (!lessons[lesson]) lessons[lesson] = [];
      lessons[lesson].push({ exerciseId, audioId });
    }
  }
  
  let problemLessons = 0;
  
  for (const [lesson, exercises] of Object.entries(lessons).sort()) {
    // Check if all exercises in lesson have unique audio IDs
    const audioIds = exercises.map(e => e.audioId);
    const uniqueIds = new Set(audioIds);
    
    if (uniqueIds.size < exercises.length) {
      problemLessons++;
      console.log(`  ⚠️ ${lesson}: ${exercises.length} exercises, ${uniqueIds.size} unique audio IDs`);
      
      // Find duplicates
      const duplicateCount = {};
      for (const id of audioIds) {
        duplicateCount[id] = (duplicateCount[id] || 0) + 1;
      }
      
      for (const [id, count] of Object.entries(duplicateCount)) {
        if (count > 1) {
          const exs = exercises.filter(e => e.audioId === id).map(e => e.exerciseId);
          console.log(`     ${id} → used by ${count} exercises: ${exs.join(', ')}`);
        }
      }
    }
  }
  
  console.log('');
  console.log(`  ✅ Lessons with unique audio: ${Object.keys(lessons).length - problemLessons}`);
  console.log(`  ⚠️ Lessons with duplicate audio: ${problemLessons}`);
  
  // ─── SAVE REPORT ──────────────────────────────────────────────────
  
  const report = {
    timestamp: new Date().toISOString(),
    totalMappings: Object.keys(mapping).length,
    totalLessons: Object.keys(lessons).length,
    lessonsWithDuplicates: problemLessons,
    details: lessons
  };
  
  fs.writeFileSync('audio-content-report.json', JSON.stringify(report, null, 2));
  console.log('\n📁 Report saved: audio-content-report.json');
  
  console.log('\n' + '═'.repeat(60));
  console.log('📌 CONCLUSION:');
  console.log('═'.repeat(60));
  console.log('');
  
  if (problemLessons === 0) {
    console.log('✅ All lessons have unique audio files for each exercise.');
    console.log('   Each question and answer has its own audio file.');
  } else {
    console.log(`⚠️ ${problemLessons} lessons have duplicate audio files.`);
    console.log('   This means the SAME audio file is used for different exercises.');
    console.log('   The audio content may not match the prompt/answer.');
  }
  
  console.log('\n💡 SUGGESTION:');
  console.log('   Check if the audio files contain the correct content.');
  console.log('   If not, you need to regenerate the audio files.');
}

main();