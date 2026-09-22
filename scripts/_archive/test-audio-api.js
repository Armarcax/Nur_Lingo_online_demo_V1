// scripts/test-audio-api.js
// Run: node scripts/test-audio-api.js

const fs = require('fs');
const path = require('path');

// ─── CONFIG ──────────────────────────────────────────────────────────

const MAPPING_PATH = path.join(process.cwd(), 'src/lib/content/audio-mapping.ts');

// ─── READ MAPPING ──────────────────────────────────────────────────

function getExerciseToAudio() {
  try {
    const content = fs.readFileSync(MAPPING_PATH, 'utf-8');
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
  } catch (error) {
    console.error('Error reading mapping:', error);
    return {};
  }
}

// ─── CHECK AUDIO FILES ─────────────────────────────────────────────

function checkAudioFiles(audioIds) {
  const voices = ['hy_Ani', 'en_female', 'ru_female'];
  const results = {};
  
  for (const voice of voices) {
    const dir = path.join(process.cwd(), 'public/audio/offline', voice);
    const files = new Set();
    
    if (fs.existsSync(dir)) {
      const items = fs.readdirSync(dir).filter(f => f.endsWith('.mp3'));
      for (const item of items) {
        files.add(item.replace('.mp3', ''));
      }
    }
    
    results[voice] = files;
  }
  
  return results;
}

// ─── TEST EXERCISES ─────────────────────────────────────────────────

function testExercises() {
  console.log('========================================');
  console.log('   🎯 NUR OFFLINE AUDIO MAPPING TEST');
  console.log('========================================\n');
  
  const mapping = getExerciseToAudio();
  const exerciseIds = Object.keys(mapping);
  
  console.log(`📋 Total mappings: ${exerciseIds.length}`);
  
  // Group by lesson
  const lessons = {};
  for (const id of exerciseIds) {
    const match = id.match(/^(w\d+_l\d+)/);
    if (match) {
      const lesson = match[1];
      if (!lessons[lesson]) lessons[lesson] = [];
      lessons[lesson].push(id);
    }
  }
  
  console.log(`📋 Total lessons: ${Object.keys(lessons).length}\n`);
  
  // Check audio files
  const audioFiles = checkAudioFiles(Object.values(mapping));
  
  // Test each exercise
  console.log('🔍 Checking exercises...\n');
  
  const results = {
    total: exerciseIds.length,
    found: 0,
    missing: 0,
    byLesson: {}
  };
  
  for (const [lesson, exercises] of Object.entries(lessons).sort()) {
    let lessonFound = 0;
    let lessonTotal = exercises.length;
    
    for (const exerciseId of exercises) {
      const audioId = mapping[exerciseId];
      let hasAudio = false;
      
      // Check in each voice
      for (const [voice, files] of Object.entries(audioFiles)) {
        if (files.has(audioId)) {
          hasAudio = true;
          break;
        }
      }
      
      if (hasAudio) {
        results.found++;
        lessonFound++;
      } else {
        results.missing++;
      }
    }
    
    results.byLesson[lesson] = {
      total: lessonTotal,
      found: lessonFound,
      missing: lessonTotal - lessonFound,
      coverage: ((lessonFound / lessonTotal) * 100).toFixed(1) + '%'
    };
  }
  
  // ─── PRINT RESULTS ────────────────────────────────────────────────
  
  console.log('📊 RESULTS BY LESSON:');
  console.log('─'.repeat(60));
  
  for (const [lesson, data] of Object.entries(results.byLesson).sort()) {
    const status = data.found === data.total ? '✅' : '⚠️';
    console.log(`  ${status} ${lesson}: ${data.found}/${data.total} (${data.coverage})`);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('📊 SUMMARY:');
  console.log(`  Total exercises: ${results.total}`);
  console.log(`  ✅ Found: ${results.found}`);
  console.log(`  ❌ Missing: ${results.missing}`);
  console.log(`  📈 Coverage: ${((results.found / results.total) * 100).toFixed(1)}%`);
  
  // ─── VOICE STATS ──────────────────────────────────────────────────
  
  console.log('\n🎵 VOICE FILES:');
  for (const [voice, files] of Object.entries(audioFiles)) {
    console.log(`  ${voice}: ${files.size} files`);
  }
  
  // ─── MISSING EXERCISES ────────────────────────────────────────────
  
  if (results.missing > 0) {
    console.log('\n❌ Missing audio for exercises:');
    let count = 0;
    for (const [lesson, data] of Object.entries(results.byLesson)) {
      if (data.missing > 0) {
        console.log(`  ${lesson}: ${data.missing} missing`);
        count++;
        if (count >= 10) {
          console.log(`  ... and ${Object.keys(results.byLesson).length - count} more lessons`);
          break;
        }
      }
    }
  }
  
  // ─── SAVE REPORT ──────────────────────────────────────────────────
  
  const report = {
    timestamp: new Date().toISOString(),
    total: results.total,
    found: results.found,
    missing: results.missing,
    coverage: ((results.found / results.total) * 100).toFixed(1) + '%',
    byLesson: results.byLesson,
    voiceFiles: Object.fromEntries(
      Object.entries(audioFiles).map(([k, v]) => [k, v.size])
    )
  };
  
  fs.writeFileSync('audio-mapping-report.json', JSON.stringify(report, null, 2));
  console.log(`\n📁 Report saved: audio-mapping-report.json`);
  
  console.log('\n========================================');
  if (results.missing === 0) {
    console.log('✨ All exercises have audio!');
  } else {
    console.log(`⚠️ ${results.missing} exercises missing audio`);
  }
  console.log('========================================');
}

testExercises();