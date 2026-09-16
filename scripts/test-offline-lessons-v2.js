// scripts/test-offline-lessons-v2.js
// Run: node scripts/test-offline-lessons-v2.js

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('   🎯 OFFLINE LESSON TESTER V2');
console.log('   Testing Questions & Answers');
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

// ─── GET LESSON FROM DICTIONARY ──────────────────────────────────

function getLessonFromFile(lessonId) {
  try {
    const dictPath = path.join(process.cwd(), 'public/data/dictionaries/lesson-dictionary.json');
    const content = fs.readFileSync(dictPath, 'utf-8');
    const data = JSON.parse(content);
    
    for (const lesson of data.lessons) {
      if (lesson.id === lessonId) {
        return lesson;
      }
    }
    return null;
  } catch (error) {
    // Try alternative path
    try {
      const altPath = path.join(process.cwd(), 'src/data/dictionaries/lesson-dictionary.json');
      const content = fs.readFileSync(altPath, 'utf-8');
      const data = JSON.parse(content);
      
      for (const lesson of data.lessons) {
        if (lesson.id === lessonId) {
          return lesson;
        }
      }
    } catch (e) {
      // Fallback: generate from mapping
      return generateLessonFromMapping(lessonId);
    }
    return null;
  }
}

// ─── GENERATE LESSON FROM MAPPING ────────────────────────────────

function generateLessonFromMapping(lessonId) {
  const mapping = getExerciseToAudio();
  const exercises = [];
  
  for (const [key, audioId] of Object.entries(mapping)) {
    if (key.startsWith(lessonId)) {
      exercises.push({
        id: key,
        audioId: audioId,
        prompt: { hy: key.replace(/_/g, ' ') },
        targetAnswer: audioId
      });
    }
  }
  
  return {
    id: lessonId,
    exercises: exercises.sort((a, b) => a.id.localeCompare(b.id))
  };
}

// ─── CHECK AUDIO FILE ──────────────────────────────────────────────

function checkAudioFile(voice, audioId) {
  const filePath = path.join(process.cwd(), 'public/audio/offline', voice, `${audioId}.mp3`);
  return fs.existsSync(filePath);
}

// ─── MAIN TEST ──────────────────────────────────────────────────────

function main() {
  const mapping = getExerciseToAudio();
  console.log(`📋 Total mappings: ${Object.keys(mapping).length}`);
  
  // Get all lessons from mapping
  const lessonSet = new Set();
  for (const key of Object.keys(mapping)) {
    const match = key.match(/^(w\d+_l\d+)/);
    if (match) {
      lessonSet.add(match[1]);
    }
  }
  
  const lessons = Array.from(lessonSet).sort();
  console.log(`📚 Total lessons: ${lessons.length}\n`);
  
  console.log('🔍 Testing offline lessons...\n');
  
  const results = [];
  let totalExercises = 0;
  let passedExercises = 0;
  let failedExercises = 0;
  
  // Test hy_Ani and en_female
  const voices = ['hy_Ani', 'en_female'];
  
  for (const lessonId of lessons) {
    // Get exercises for this lesson
    const lessonExercises = [];
    for (const [key, audioId] of Object.entries(mapping)) {
      if (key.startsWith(lessonId)) {
        lessonExercises.push({ id: key, audioId });
      }
    }
    
    lessonExercises.sort((a, b) => a.id.localeCompare(b.id));
    
    let lessonPassed = 0;
    let lessonFailed = 0;
    const exerciseResults = [];
    
    for (const exercise of lessonExercises) {
      const { id, audioId } = exercise;
      totalExercises++;
      
      // Check both voices
      const hyExists = checkAudioFile('hy_Ani', audioId);
      const enExists = checkAudioFile('en_female', audioId);
      
      const success = hyExists && enExists;
      
      if (success) {
        lessonPassed++;
        passedExercises++;
        exerciseResults.push({ id, audioId, hyExists, enExists, status: '✅' });
      } else {
        lessonFailed++;
        failedExercises++;
        exerciseResults.push({ 
          id, 
          audioId, 
          hyExists, 
          enExists, 
          status: '❌',
          reason: !hyExists ? 'hy_Ani missing' : 'en_female missing'
        });
      }
    }
    
    const coverage = lessonExercises.length > 0 ? ((lessonPassed / lessonExercises.length) * 100).toFixed(1) : 0;
    
    results.push({
      lessonId,
      total: lessonExercises.length,
      passed: lessonPassed,
      failed: lessonFailed,
      coverage: coverage + '%',
      exercises: exerciseResults
    });
    
    // Show progress
    const status = lessonFailed === 0 ? '✅' : '⚠️';
    console.log(`  ${status} ${lessonId}: ${lessonPassed}/${lessonExercises.length} (${coverage}%)`);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('📊 FINAL SUMMARY');
  console.log('═'.repeat(60));
  console.log('');
  console.log(`  📚 Lessons tested: ${lessons.length}`);
  console.log(`  📝 Total exercises: ${totalExercises}`);
  console.log(`  ✅ Passed: ${passedExercises}`);
  console.log(`  ❌ Failed: ${failedExercises}`);
  console.log(`  📈 Success rate: ${((passedExercises / totalExercises) * 100).toFixed(1)}%`);
  
  if (failedExercises === 0) {
    console.log('\n✨ ALL EXERCISES PASSED! 🎉');
  } else {
    console.log(`\n⚠️ ${failedExercises} exercises failed`);
    
    // Show failed lessons with details
    console.log('\n❌ FAILED LESSONS:');
    for (const result of results) {
      if (result.failed > 0) {
        const failedEx = result.exercises.filter(e => e.status === '❌');
        console.log(`  ${result.lessonId}: ${result.failed}/${result.total} failed`);
        for (const ex of failedEx.slice(0, 3)) {
          console.log(`    ${ex.id} → ${ex.audioId} ${ex.hyExists ? '✅' : '❌'} hy ${ex.enExists ? '✅' : '❌'} en`);
        }
        if (failedEx.length > 3) {
          console.log(`    ... and ${failedEx.length - 3} more`);
        }
      }
    }
  }
  
  // ─── SAVE REPORT ──────────────────────────────────────────────────
  
  const report = {
    timestamp: new Date().toISOString(),
    totalLessons: lessons.length,
    totalExercises,
    passedExercises,
    failedExercises,
    successRate: ((passedExercises / totalExercises) * 100).toFixed(1) + '%',
    results: results.map(r => ({
      lessonId: r.lessonId,
      total: r.total,
      passed: r.passed,
      failed: r.failed,
      coverage: r.coverage,
      exercises: r.exercises.map(e => ({
        id: e.id,
        audioId: e.audioId,
        hyExists: e.hyExists,
        enExists: e.enExists,
        status: e.status
      }))
    }))
  };
  
  fs.writeFileSync('offline-test-report-v2.json', JSON.stringify(report, null, 2));
  console.log('\n📁 Report saved: offline-test-report-v2.json');
  
  console.log('\n' + '═'.repeat(60));
}

main();