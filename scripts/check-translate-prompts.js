#!/usr/bin/env node
/**
 * Check translate-exercise prompts in lesson-dictionary.json
 * Read-only.
 */

const fs = require('fs');
const path = require('path');

const FILE = 'public/data/lesson-dictionary.json';
const LESSON_ID = 'w1_l1'; // sample

console.log('');
console.log('='.repeat(72));
console.log('🔍 Translate Exercise Prompt Inspector');
console.log('='.repeat(72));
console.log('');

const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), FILE), 'utf8'));
const lesson = data.lessons.find(l => l.id === LESSON_ID);

if (!lesson) {
  console.error('Lesson not found:', LESSON_ID);
  process.exit(1);
}

console.log(`Lesson: ${lesson.id}`);
console.log(`Total exercises: ${lesson.exercises.length}`);
console.log('');

const typeCount = {};
for (const ex of lesson.exercises) {
  typeCount[ex.type] = (typeCount[ex.type] || 0) + 1;
}
console.log('Exercise types:', JSON.stringify(typeCount, null, 2));
console.log('');

// Show all translate-type exercises
const translates = lesson.exercises.filter(e => e.type === 'translate');
console.log(`Found ${translates.length} translate exercises.`);
console.log('');

for (let i = 0; i < Math.min(3, translates.length); i++) {
  const ex = translates[i];
  console.log('-'.repeat(72));
  console.log(`Exercise #${i + 1}: ${ex.id}`);
  console.log('-'.repeat(72));
  console.log('  prompt:', JSON.stringify(ex.prompt, null, 2));
  console.log('  targetAnswer:', JSON.stringify(ex.targetAnswer));
  console.log('  correctAnswer:', JSON.stringify(ex.correctAnswer));
  console.log('  acceptableAnswers:', JSON.stringify(ex.acceptableAnswers || ex.options));
  console.log('');

  // Analyze each prompt language
  if (ex.prompt) {
    for (const [lang, text] of Object.entries(ex.prompt)) {
      // Extract quoted word
      const match = String(text).match(/"([^"]+)"/) || String(text).match(/«([^»]+)»/);
      const word = match ? match[1] : '(no quotes)';
      
      // Detect language of the extracted word
      let detectedLang = '?';
      if (/[\u0531-\u058F]/.test(word)) detectedLang = 'hy';
      else if (/[\u0410-\u044F]/.test(word)) detectedLang = 'ru';
      else if (/[a-zA-Z]/.test(word)) detectedLang = 'en';

      const flag = detectedLang === lang ? '✅' : '⚠️';
      console.log(`  ${flag} prompt["${lang}"]  word="${word}"  detected_lang=${detectedLang}`);
    }
  }
  console.log('');
}

// Scan ALL lessons for the same problem
console.log('='.repeat(72));
console.log('📊 FULL SCAN — translate exercises with wrong-language prompt word');
console.log('='.repeat(72));
console.log('');

let total = 0;
let wrong = 0;
const examples = [];

for (const lesson of data.lessons) {
  for (const ex of lesson.exercises || []) {
    if (ex.type !== 'translate' || !ex.prompt) continue;
    total++;

    for (const [lang, text] of Object.entries(ex.prompt)) {
      const match = String(text).match(/"([^"]+)"/) || String(text).match(/«([^»]+)»/);
      if (!match) continue;
      const word = match[1];

      let detectedLang = '?';
      if (/[\u0531-\u058F]/.test(word)) detectedLang = 'hy';
      else if (/[\u0410-\u044F]/.test(word)) detectedLang = 'ru';
      else if (/[a-zA-Z]/.test(word)) detectedLang = 'en';

      if (detectedLang !== lang && detectedLang !== '?') {
        wrong++;
        if (examples.length < 5) {
          examples.push({
            lesson: lesson.id,
            exercise: ex.id,
            promptLang: lang,
            word,
            detected: detectedLang,
          });
        }
        break;
      }
    }
  }
}

console.log(`Total translate exercises:  ${total}`);
console.log(`With wrong-language word:    ${wrong}`);
console.log('');

if (examples.length > 0) {
  console.log('Examples:');
  for (const e of examples) {
    console.log(`  ${e.lesson} / ${e.exercise}  prompt[${e.promptLang}] word="${e.word}" (${e.detected})`);
  }
} else {
  console.log('✅ All translate prompts have correct-language words.');
}
console.log('');