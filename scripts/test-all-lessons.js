// scripts/test-all-lessons.js
// Run: node scripts/test-all-lessons.js

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3009';
const RESULTS = [];

// Generate all lesson IDs
function generateLessons() {
  const lessons = [];
  // w1_l1 to w1_l10
  for (let i = 1; i <= 10; i++) {
    lessons.push(`w1_l${i}`);
  }
  // w2_l1 to w10_l10
  for (let world = 2; world <= 10; world++) {
    for (let lesson = 1; lesson <= 10; lesson++) {
      lessons.push(`w${world}_l${lesson}`);
    }
  }
  return lessons;
}

async function testLesson(lessonId) {
  const url = `${BASE_URL}/learn?lesson=${lessonId}&pair=hy-en`;
  const startTime = Date.now();
  
  try {
    const response = await fetch(url);
    const content = await response.text();
    const duration = Date.now() - startTime;
    
    const hasAudio = /\/audio\/offline\/\w+\/\d{6}\.mp3/.test(content);
    const hasError = /Error|error|404|500|503/.test(content);
    
    return {
      lessonId,
      status: response.ok ? '✅' : '❌',
      statusCode: response.status,
      duration,
      hasAudio,
      hasError,
      url
    };
  } catch (error) {
    return {
      lessonId,
      status: '❌',
      statusCode: 'ERROR',
      duration: Date.now() - startTime,
      hasAudio: false,
      hasError: true,
      url,
      error: error.message
    };
  }
}

async function main() {
  console.log('========================================');
  console.log('   🎯 NUR OFFLINE AUDIO TESTER');
  console.log('   Testing All 90 Lessons');
  console.log('========================================\n');
  
  const lessons = generateLessons();
  console.log(`📋 Total lessons to test: ${lessons.length}\n`);
  
  console.log('🔍 Testing lessons...\n');
  
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const result = await testLesson(lesson);
    RESULTS.push(result);
    
    if (result.status === '✅' && result.hasAudio) {
      console.log(`  ✅ ${lesson} - Audio found (${result.duration}ms)`);
    } else if (result.status === '✅' && !result.hasAudio) {
      console.log(`  ⚠️ ${lesson} - No audio found (${result.duration}ms)`);
    } else {
      console.log(`  ❌ ${lesson} - Failed (${result.statusCode})`);
    }
  }
  
  console.log('\n========================================');
  console.log('   📊 TEST SUMMARY');
  console.log('========================================\n');
  
  const total = lessons.length;
  const passed = RESULTS.filter(r => r.status === '✅').length;
  const failed = RESULTS.filter(r => r.status === '❌').length;
  const withAudio = RESULTS.filter(r => r.hasAudio).length;
  const withError = RESULTS.filter(r => r.hasError).length;
  
  console.log('📊 Results:');
  console.log(`  Total lessons: ${total}`);
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  🎵 With audio: ${withAudio}`);
  console.log(`  ❌ With errors: ${withError}`);
  
  console.log(`\n📈 Success rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  const failedLessons = RESULTS.filter(r => r.status === '❌');
  if (failedLessons.length > 0) {
    console.log('\n❌ Failed lessons:');
    failedLessons.forEach(f => console.log(`  ${f.lessonId} - ${f.statusCode}`));
  }
  
  const noAudio = RESULTS.filter(r => r.status === '✅' && !r.hasAudio);
  if (noAudio.length > 0) {
    console.log('\n⚠️ Lessons without audio:');
    noAudio.forEach(n => console.log(`  ${n.lessonId}`));
  }
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    total,
    passed,
    failed,
    withAudio,
    withError,
    results: RESULTS
  };
  
  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  console.log(`\n📁 Report saved: test-report.json`);
  
  console.log('\n========================================');
  if (failed === 0 && noAudio.length === 0) {
    console.log('✨ All 90 lessons are working perfectly!');
  } else {
    console.log('⚠️ Some lessons need attention:');
    if (failed > 0) console.log(`  - ${failed} lessons failed to load`);
    if (noAudio.length > 0) console.log(`  - ${noAudio.length} lessons have no audio`);
  }
  console.log('========================================');
}

main().catch(console.error);