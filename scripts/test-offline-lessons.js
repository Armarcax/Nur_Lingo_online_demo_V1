// scripts/test-offline-lessons.js
// Run: node scripts/test-offline-lessons.js

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('   🎯 OFFLINE LESSON TESTER');
console.log('   Testing All Questions & Answers');
console.log('========================================\n');

// ─── CONFIG ──────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:3009';
const RESULTS = [];
const FAILED = [];

// ─── GENERATE ALL LESSON IDs ──────────────────────────────────────

function generateLessons() {
  const lessons = [];
  for (let i = 1; i <= 10; i++) {
    lessons.push(`w1_l${i}`);
  }
  for (let world = 2; world <= 10; world++) {
    for (let lesson = 1; lesson <= 10; lesson++) {
      lessons.push(`w${world}_l${lesson}`);
    }
  }
  return lessons;
}

// ─── GET LESSON EXERCISES ──────────────────────────────────────────

async function getLessonExercises(lessonId) {
  const url = `${BASE_URL}/api/lesson/${lessonId}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
}

// ─── TEST SINGLE EXERCISE ──────────────────────────────────────────

async function testExercise(lessonId, exercise, index) {
  const { id, prompt, targetAnswer, type } = exercise;
  
  // Get prompt text in native language (hy)
  const promptText = prompt?.hy || prompt?.en || '';
  const answerText = targetAnswer || '';
  
  // Test audio URLs
  const promptAudioUrl = `/audio/offline/hy_Ani/${id}.mp3`;
  const answerAudioUrl = `/audio/offline/en_female/${id}.mp3`;
  
  // Check if audio files exist
  const promptExists = await checkAudioFile(promptAudioUrl);
  const answerExists = await checkAudioFile(answerAudioUrl);
  
  return {
    lessonId,
    exerciseId: id,
    index,
    type,
    prompt: promptText,
    answer: answerText,
    promptAudio: promptAudioUrl,
    answerAudio: answerAudioUrl,
    promptExists,
    answerExists,
    success: promptExists && answerExists
  };
}

// ─── CHECK AUDIO FILE ──────────────────────────────────────────────

async function checkAudioFile(url) {
  try {
    const fullUrl = `${BASE_URL}${url}`;
    const response = await fetch(fullUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// ─── GET LESSON FROM LOCAL FILE ────────────────────────────────────

function getLessonFromFile(lessonId) {
  try {
    const dictPath = path.join(process.cwd(), 'public/data/dictionaries/lesson-dictionary.json');
    const content = fs.readFileSync(dictPath, 'utf-8');
    const data = JSON.parse(content);
    
    // Find lesson
    for (const lesson of data.lessons) {
      if (lesson.id === lessonId) {
        return lesson;
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading lesson dictionary:', error);
    return null;
  }
}

// ─── MAIN TEST ──────────────────────────────────────────────────────

async function main() {
  const lessons = generateLessons();
  console.log(`📋 Total lessons: ${lessons.length}\n`);
  console.log('🔍 Testing offline lessons...\n');
  
  let totalExercises = 0;
  let passedExercises = 0;
  let failedExercises = 0;
  
  const lessonResults = [];
  
  for (let i = 0; i < lessons.length; i++) {
    const lessonId = lessons[i];
    process.stdout.write(`\r  ${i + 1}/${lessons.length} ${lessonId}...`);
    
    // Get lesson from local file
    const lesson = getLessonFromFile(lessonId);
    
    if (!lesson) {
      console.log(`\n  ❌ ${lessonId} - Lesson not found`);
      continue;
    }
    
    const exercises = lesson.exercises || [];
    let lessonPassed = 0;
    let lessonFailed = 0;
    const exerciseResults = [];
    
    for (let j = 0; j < exercises.length; j++) {
      const exercise = exercises[j];
      const result = await testExercise(lessonId, exercise, j);
      totalExercises++;
      
      if (result.success) {
        lessonPassed++;
        passedExercises++;
        exerciseResults.push({ ...result, status: '✅' });
      } else {
        lessonFailed++;
        failedExercises++;
        exerciseResults.push({ 
          ...result, 
          status: '❌',
          reason: !result.promptExists ? 'Prompt audio missing' : 'Answer audio missing'
        });
      }
    }
    
    lessonResults.push({
      lessonId,
      total: exercises.length,
      passed: lessonPassed,
      failed: lessonFailed,
      exercises: exerciseResults
    });
  }
  
  console.log('\n');
  
  // ─── PRINT RESULTS ────────────────────────────────────────────────
  
  console.log('═'.repeat(60));
  console.log('📊 TEST RESULTS');
  console.log('═'.repeat(60));
  console.log('');
  
  // Show failed lessons
  const failedLessons = lessonResults.filter(l => l.failed > 0);
  if (failedLessons.length > 0) {
    console.log('❌ LESSONS WITH FAILURES:');
    console.log('─'.repeat(40));
    for (const lesson of failedLessons) {
      const failedExercises = lesson.exercises.filter(e => e.status === '❌');
      console.log(`  ${lesson.lessonId}: ${lesson.failed}/${lesson.total} failed`);
      for (const ex of failedExercises) {
        console.log(`    ${ex.exerciseId} (${ex.type}) - ${ex.reason}`);
        if (ex.prompt) console.log(`      Q: ${ex.prompt.substring(0, 60)}...`);
        if (ex.answer) console.log(`      A: ${ex.answer.substring(0, 60)}...`);
      }
    }
    console.log('');
  }
  
  // Show all lessons with stats
  console.log('📚 ALL LESSONS:');
  console.log('─'.repeat(60));
  for (const lesson of lessonResults) {
    const status = lesson.failed === 0 ? '✅' : '⚠️';
    const percentage = lesson.total > 0 ? ((lesson.passed / lesson.total) * 100).toFixed(1) : 0;
    console.log(`  ${status} ${lesson.lessonId}: ${lesson.passed}/${lesson.total} (${percentage}%)`);
  }
  
  // ─── SUMMARY ──────────────────────────────────────────────────────
  
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
    console.log('   Check the failed lessons list above.');
  }
  
  console.log('\n' + '═'.repeat(60));
  
  // ─── SAVE REPORT ──────────────────────────────────────────────────
  
  const report = {
    timestamp: new Date().toISOString(),
    totalLessons: lessons.length,
    totalExercises,
    passedExercises,
    failedExercises,
    successRate: ((passedExercises / totalExercises) * 100).toFixed(1) + '%',
    lessonResults: lessonResults.map(l => ({
      lessonId: l.lessonId,
      total: l.total,
      passed: l.passed,
      failed: l.failed,
      exercises: l.exercises.map(e => ({
        exerciseId: e.exerciseId,
        type: e.type,
        prompt: e.prompt,
        answer: e.answer,
        status: e.status,
        reason: e.reason || null
      }))
    }))
  };
  
  fs.writeFileSync('offline-test-report.json', JSON.stringify(report, null, 2));
  console.log('\n📁 Report saved: offline-test-report.json');
  
  // ─── SHOW SAMPLE OF PASSING EXERCISES ────────────────────────────
  
  console.log('\n📝 SAMPLE PASSING EXERCISES:');
  console.log('─'.repeat(60));
  let sampleCount = 0;
  for (const lesson of lessonResults) {
    for (const ex of lesson.exercises) {
      if (ex.status === '✅' && sampleCount < 10) {
        console.log(`  ${ex.exerciseId} (${ex.type})`);
        console.log(`    Q: ${ex.prompt}`);
        console.log(`    A: ${ex.answer}`);
        console.log(`    🎵 ${ex.promptAudio}`);
        console.log('');
        sampleCount++;
      }
    }
  }
}

// ─── RUN ─────────────────────────────────────────────────────────────

main().catch(console.error);