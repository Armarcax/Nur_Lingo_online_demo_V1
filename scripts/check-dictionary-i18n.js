#!/usr/bin/env node
/**
 * NUR Lingo — Dictionary i18n Deep Check
 * Shows EXACTLY what fields in lesson-dictionary.json contain which languages.
 * Read-only.
 *
 * Usage: node scripts/check-dictionary-i18n.js
 */

const fs = require('fs');
const path = require('path');

const FILES = [
  'data/dictionaries/lesson-dictionary.json',
  'public/data/lesson-dictionary.json',
];

function hasArmenian(s) { return /[\u0531-\u058F]/.test(String(s)); }
function hasRussian(s) { return /[\u0410-\u044F]/.test(String(s)); }
function hasLatin(s) { return /[a-zA-Z]/.test(String(s)); }

function detectLanguages(s) {
  const v = String(s);
  const langs = [];
  if (hasArmenian(v)) langs.push('hy');
  if (hasRussian(v)) langs.push('ru');
  if (hasLatin(v)) langs.push('en');
  return langs.length > 0 ? langs : ['?'];
}

function analyzeValue(val, depth = 0) {
  if (val === null || val === undefined) return null;

  if (typeof val === 'string') {
    return { type: 'string', langs: detectLanguages(val) };
  }

  if (Array.isArray(val)) {
    const allLangs = new Set();
    val.forEach(v => {
      const a = analyzeValue(v);
      if (a?.langs) a.langs.forEach(l => allLangs.add(l));
    });
    return { type: 'array', langs: [...allLangs] };
  }

  if (typeof val === 'object') {
    // Is it a lang map { hy, en, ru }?
    const keys = Object.keys(val);
    const isLangMap =
      keys.length > 0 &&
      keys.every(k => ['hy', 'en', 'ru'].includes(k));

    if (isLangMap) {
      return { type: 'lang-map', langs: keys, values: val };
    }

    // Otherwise, recurse into object
    const result = {};
    for (const k of keys) {
      result[k] = analyzeValue(val[k], depth + 1);
    }
    return { type: 'object', fields: result };
  }

  return { type: typeof val };
}

function analyzeExercise(ex) {
  const fieldInfo = {};
  for (const key of Object.keys(ex)) {
    fieldInfo[key] = analyzeValue(ex[key]);
  }
  return fieldInfo;
}

function main() {
  console.log('');
  console.log('='.repeat(72));
  console.log('🔬 Dictionary i18n Deep Check');
  console.log('='.repeat(72));
  console.log('');

  for (const file of FILES) {
    const fullPath = path.join(process.cwd(), file);

    console.log(`📁 ${file}`);
    if (!fs.existsSync(fullPath)) {
      console.log('   ❌ NOT FOUND\n');
      continue;
    }

    const size = fs.statSync(fullPath).size;
    console.log(`   Size: ${(size / 1024 / 1024).toFixed(2)} MB`);

    let data;
    try {
      data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    } catch (e) {
      console.log(`   ❌ Parse error: ${e.message}\n`);
      continue;
    }

    console.log(`   Version: ${data.version}`);
    console.log(`   Lessons: ${data.lessons?.length || 0}`);

    // Find a lesson that has multiple_choice exercises
    let sampleLesson = null;
    let sampleEx = null;
    for (const l of data.lessons) {
      const mc = l.exercises?.find(e => e.type === 'multiple_choice');
      if (mc) { sampleLesson = l; sampleEx = mc; break; }
    }

    if (!sampleLesson) {
      console.log('   ⚠️  No multiple_choice exercise found\n');
      continue;
    }

    console.log(`\n   Sample lesson: ${sampleLesson.id}`);
    console.log(`   Sample exercise: ${sampleEx.id}`);
    console.log('');

    // Analyze ALL fields of the exercise
    const fields = analyzeExercise(sampleEx);

    console.log('   EXERCISE FIELDS:');
    for (const [key, info] of Object.entries(fields)) {
      const langs = info.langs || (info.fields ? '(nested)' : '?');
      const marker = Array.isArray(langs) && langs.length >= 2 ? '✅' : '⚠️ ';
      console.log(`   ${marker} ${key.padEnd(20)} ${JSON.stringify(langs)}`);

      // If it's a nested object, show sub-fields
      if (info.fields) {
        for (const [subKey, subInfo] of Object.entries(info.fields)) {
          if (subInfo === null) continue;
          const subLangs = subInfo.langs || '?';
          const subMarker = Array.isArray(subLangs) && subLangs.length >= 2 ? '  ✅' : '  ⚠️ ';
          console.log(`   ${subMarker}   ${subKey.padEnd(18)} ${JSON.stringify(subLangs)}`);
        }
      }
    }

    // Show the actual content of key fields
    console.log('\n   ACTUAL VALUES:');
    console.log(`   options:       ${JSON.stringify(sampleEx.options)}`);
    console.log(`   correctAnswer: ${JSON.stringify(sampleEx.correctAnswer || sampleEx.targetAnswer)}`);
    console.log(`   prompt:        ${JSON.stringify(sampleEx.prompt)}`);

    // Check ALL fields across ALL exercises to find any trilingual options/answers
    console.log('\n   SCANNING ALL EXERCISES FOR TRILINGUAL OPTIONS/ANSWERS...');

    let trilingualOptionsCount = 0;
    let trilingualAnswersCount = 0;
    let hasAnyTrilingualOptions = false;
    let hasAnyTrilingualAnswers = false;

    for (const l of data.lessons) {
      for (const ex of l.exercises || []) {
        if (Array.isArray(ex.options)) {
          // Check if options contains hy or ru strings
          const hasHy = ex.options.some(o => hasArmenian(o));
          const hasRu = ex.options.some(o => hasRussian(o));
          if (hasHy || hasRu) {
            trilingualOptionsCount++;
            if (!hasAnyTrilingualOptions) {
              hasAnyTrilingualOptions = true;
              console.log(`      Found trilingual options in: ${l.id} / ${ex.id}`);
              console.log(`      options: ${JSON.stringify(ex.options)}`);
            }
          }
        }

        const ans = ex.correctAnswer || ex.targetAnswer;
        if (ans && (hasArmenian(ans) || hasRussian(ans))) {
          trilingualAnswersCount++;
          if (!hasAnyTrilingualAnswers) {
            hasAnyTrilingualAnswers = true;
            console.log(`      Found trilingual answer in: ${l.id} / ${ex.id}`);
            console.log(`      answer: ${JSON.stringify(ans)}`);
          }
        }
      }
    }

    if (!hasAnyTrilingualOptions) {
      console.log(`      ❌ NO exercises with Armenian/Russian options`);
    } else {
      console.log(`      ✅ ${trilingualOptionsCount} exercises with trilingual options`);
    }

    if (!hasAnyTrilingualAnswers) {
      console.log(`      ❌ NO exercises with Armenian/Russian correctAnswer`);
    } else {
      console.log(`      ✅ ${trilingualAnswersCount} exercises with trilingual answers`);
    }

    console.log('');
    console.log('   ' + '-'.repeat(68));
    console.log('');
  }

  console.log('');
  console.log('='.repeat(72));
  console.log('✅ Check complete');
  console.log('='.repeat(72));
  console.log('');
}

main();