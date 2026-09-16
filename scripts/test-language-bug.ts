// scripts/test-language-bug.ts
// Run with: npx tsx scripts/test-language-bug.ts

import { loadLangConfig, type LangCode, type LangPair } from '../src/lib/i18n/index';
import { getLessonById, type MultiLesson, type MultiExercise } from '../src/lib/i18n/multilingual';

// ============================================================
// TEST CONFIGURATION
// ============================================================

interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
}

const TEST_LESSONS = ['w1_l1', 'w1_l2', 'w1_l3'];
const TEST_PAIRS: LangPair[] = ['en-hy', 'ru-hy', 'hy-en'];

// ============================================================
// HELPERS
// ============================================================

function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

function logResult(result: TestResult) {
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} ${result.testName}`);
  console.log(`   ${result.message}`);
  if (result.details) {
    console.log(`   Details:`, result.details);
  }
  console.log('');
}

// ============================================================
// TESTS
// ============================================================

const tests: TestResult[] = [];

// ─── TEST 1: Check that getLessonById returns correct language ───

logSection('TEST 1: Lesson Language Detection');

for (const pair of TEST_PAIRS) {
  for (const lessonId of TEST_LESSONS) {
    try {
      const lesson = getLessonById(pair, lessonId);
      
      if (!lesson) {
        tests.push({
          testName: `Lesson ${lessonId} with ${pair}`,
          passed: false,
          message: `❌ Lesson not found`,
          details: { pair, lessonId }
        });
        continue;
      }

      // Check first exercise prompt
      const firstExercise = lesson.exercises[0];
      if (!firstExercise) {
        tests.push({
          testName: `Lesson ${lessonId} with ${pair}`,
          passed: false,
          message: `❌ No exercises found`,
          details: { pair, lessonId }
        });
        continue;
      }

      // Get native language from pair
      const nativeLang = pair.split('-')[0] as LangCode;
      
      // Check if prompt exists for native language
      const promptExists = !!firstExercise.prompt[nativeLang];
      const promptText = firstExercise.prompt[nativeLang] || firstExercise.prompt['en'] || 'MISSING';
      const targetAnswer = firstExercise.targetAnswer || 'MISSING';

      // Check if exercise uses correct language
      const isRussian = nativeLang === 'ru' && promptText.includes('Что');
      const isEnglish = nativeLang === 'en' && promptText.includes('What');
      const isArmenian = nativeLang === 'hy' && (promptText.includes('Ի՞նչ') || promptText.includes('Թարգմանիր'));

      const correctLanguage = isRussian || isEnglish || isArmenian;

      tests.push({
        testName: `Lesson ${lessonId} with ${pair}`,
        passed: correctLanguage,
        message: correctLanguage 
          ? `✅ Correct language detected: ${nativeLang}`
          : `❌ Wrong language! Expected ${nativeLang}, got: ${promptText.substring(0, 50)}...`,
        details: {
          pair,
          nativeLang,
          prompt: promptText.substring(0, 100),
          targetAnswer,
          exerciseType: firstExercise.type
        }
      });

    } catch (error) {
      tests.push({
        testName: `Lesson ${lessonId} with ${pair}`,
        passed: false,
        message: `❌ Error: ${error}`,
        details: { pair, lessonId }
      });
    }
  }
}

// ─── TEST 2: Check that prompt language matches target language ───

logSection('TEST 2: Prompt to Target Language Match');

for (const pair of TEST_PAIRS) {
  for (const lessonId of TEST_LESSONS) {
    try {
      const lesson = getLessonById(pair, lessonId);
      if (!lesson) continue;

      const nativeLang = pair.split('-')[0] as LangCode;
      const isRussianPair = pair === 'ru-hy';

      for (let i = 0; i < Math.min(lesson.exercises.length, 3); i++) {
        const exercise = lesson.exercises[i];
        const prompt = exercise.prompt[nativeLang] || exercise.prompt['en'] || '';
        const target = exercise.targetAnswer || '';
        
        // Check if prompt is in correct language
        let promptIsCorrect = true;
        let expectedLanguage = nativeLang;
        
        if (nativeLang === 'ru') {
          // Russian prompt should contain Cyrillic characters
          const cyrillicChars = prompt.match(/[А-Яа-яЁё]/g) || [];
          promptIsCorrect = cyrillicChars.length > 3;
        } else if (nativeLang === 'hy') {
          // Armenian prompt should contain Armenian characters
          const armenianChars = prompt.match(/[Ա-Ֆա-ֆ]/g) || [];
          promptIsCorrect = armenianChars.length > 3;
        } else if (nativeLang === 'en') {
          // English prompt should be in Latin
          promptIsCorrect = /[a-zA-Z]/.test(prompt) && !/[А-Яа-яЁё]/.test(prompt) && !/[Ա-Ֆա-ֆ]/.test(prompt);
        }

        tests.push({
          testName: `Exercise ${i+1} in ${lessonId} (${pair})`,
          passed: promptIsCorrect,
          message: promptIsCorrect
            ? `✅ Prompt is in ${nativeLang}`
            : `❌ Prompt should be in ${nativeLang}, but got: "${prompt.substring(0, 30)}..."`,
          details: {
            pair,
            nativeLang,
            exerciseIndex: i,
            prompt: prompt.substring(0, 100),
            target: target.substring(0, 50),
            exerciseType: exercise.type
          }
        });
      }

    } catch (error) {
      // silent
    }
  }
}

// ─── TEST 3: Check that options are in correct language ────────────

logSection('TEST 3: Multiple Choice Options Language');

for (const pair of TEST_PAIRS) {
  for (const lessonId of TEST_LESSONS) {
    try {
      const lesson = getLessonById(pair, lessonId);
      if (!lesson) continue;

      const nativeLang = pair.split('-')[0] as LangCode;
      const isRussianPair = pair === 'ru-hy';

      for (let i = 0; i < Math.min(lesson.exercises.length, 3); i++) {
        const exercise = lesson.exercises[i];
        
        if (exercise.type === 'multiple_choice' && exercise.options) {
          // Check if options are in the target language (should be Armenian for ru-hy)
          const targetLang = pair.split('-')[1] as LangCode; // 'hy' for ru-hy
          
          let optionsCorrect = true;
          let errorMessage = '';
          
          if (targetLang === 'hy') {
            // Options should be in Armenian
            for (const opt of exercise.options) {
              const armenianChars = opt.match(/[Ա-Ֆա-ֆ]/g) || [];
              if (armenianChars.length < 2 && opt.length > 1) {
                optionsCorrect = false;
                errorMessage = `Option "${opt}" is not in Armenian`;
                break;
              }
            }
          } else if (targetLang === 'ru') {
            // Options should be in Russian
            for (const opt of exercise.options) {
              const cyrillicChars = opt.match(/[А-Яа-яЁё]/g) || [];
              if (cyrillicChars.length < 2 && opt.length > 1) {
                optionsCorrect = false;
                errorMessage = `Option "${opt}" is not in Russian`;
                break;
              }
            }
          }

          tests.push({
            testName: `Options in ${lessonId} ex${i+1} (${pair})`,
            passed: optionsCorrect,
            message: optionsCorrect
              ? `✅ Options are in ${targetLang}`
              : `❌ ${errorMessage}`,
            details: {
              pair,
              targetLang,
              options: exercise.options.slice(0, 3)
            }
          });
        }
      }

    } catch (error) {
      // silent
    }
  }
}

// ─── TEST 4: Check that targetAnswer matches the language ──────────

logSection('TEST 4: Target Answer Language');

for (const pair of TEST_PAIRS) {
  for (const lessonId of TEST_LESSONS) {
    try {
      const lesson = getLessonById(pair, lessonId);
      if (!lesson) continue;

      const targetLang = pair.split('-')[1] as LangCode;
      const isRussianPair = pair === 'ru-hy';

      for (let i = 0; i < Math.min(lesson.exercises.length, 3); i++) {
        const exercise = lesson.exercises[i];
        const target = exercise.targetAnswer || '';

        let targetCorrect = true;
        
        if (targetLang === 'hy') {
          const armenianChars = target.match(/[Ա-Ֆա-ֆ]/g) || [];
          targetCorrect = armenianChars.length > 2 || target.length < 3;
        } else if (targetLang === 'ru') {
          const cyrillicChars = target.match(/[А-Яа-яЁё]/g) || [];
          targetCorrect = cyrillicChars.length > 2 || target.length < 3;
        } else if (targetLang === 'en') {
          targetCorrect = /[a-zA-Z]/.test(target) && !/[Ա-Ֆա-ֆ]/.test(target) && !/[А-Яа-яЁё]/.test(target);
        }

        tests.push({
          testName: `Target in ${lessonId} ex${i+1} (${pair})`,
          passed: targetCorrect,
          message: targetCorrect
            ? `✅ Target is in ${targetLang}`
            : `❌ Target should be in ${targetLang}, got: "${target}"`,
          details: {
            pair,
            targetLang,
            target
          }
        });
      }

    } catch (error) {
      // silent
    }
  }
}

// ─── TEST 5: Direct comparison - Russian vs English prompts ───────

logSection('TEST 5: Direct Comparison - Russian vs English');

const ruLesson = getLessonById('ru-hy', 'w1_l1');
const enLesson = getLessonById('en-hy', 'w1_l1');

if (ruLesson && enLesson) {
  const ruPrompt = ruLesson.exercises[0]?.prompt?.ru || '';
  const enPrompt = enLesson.exercises[0]?.prompt?.en || '';
  
  tests.push({
    testName: 'Compare RU vs EN prompts',
    passed: ruPrompt.includes('Что') && enPrompt.includes('What'),
    message: ruPrompt.includes('Что') && enPrompt.includes('What')
      ? '✅ Russian and English prompts are correct'
      : `❌ Russian: "${ruPrompt.substring(0, 30)}..." | English: "${enPrompt.substring(0, 30)}..."`,
    details: {
      ruPrompt: ruPrompt.substring(0, 100),
      enPrompt: enPrompt.substring(0, 100)
    }
  });
}

// ============================================================
// SUMMARY
// ============================================================

logSection('FINAL SUMMARY');

const totalTests = tests.length;
const passedTests = tests.filter(t => t.passed).length;
const failedTests = totalTests - passedTests;

console.log(`📊 Total tests: ${totalTests}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📈 Success rate: ${Math.round((passedTests / totalTests) * 100)}%`);

// Show all failed tests
if (failedTests > 0) {
  console.log('\n❌ FAILED TESTS:');
  tests
    .filter(t => !t.passed)
    .forEach(t => {
      console.log(`  - ${t.testName}`);
      console.log(`    ${t.message}`);
      if (t.details) {
        console.log(`    Details:`, JSON.stringify(t.details, null, 2).substring(0, 200));
      }
    });
}

console.log('\n' + '='.repeat(60));
console.log('🔍 BUG ANALYSIS:');

// Find the bug pattern
const russianIssues = tests.filter(t => 
  t.testName.includes('ru-hy') && !t.passed
);

const englishIssues = tests.filter(t => 
  t.testName.includes('en-hy') && !t.passed
);

if (russianIssues.length > englishIssues.length) {
  console.log('🐛 BUG FOUND: Russian language has more issues than English');
  console.log(`   Russian failures: ${russianIssues.length}, English failures: ${englishIssues.length}`);
  console.log('\n   Most likely cause: The `prompt` object does not have the correct keys');
  console.log('   Expected: `prompt.ru` for Russian');
  console.log('   But maybe falling back to `prompt.en` or `prompt.hy`');
} else if (englishIssues.length > 0) {
  console.log('⚠️ Issues found in both languages');
} else {
  console.log('✅ No major issues found. The bug might be in the component rendering.');
}

// Check for specific RU-HY bug
const ruHyPromptTests = tests.filter(t => 
  t.testName.includes('ru-hy') && t.testName.includes('Prompt')
);

if (ruHyPromptTests.some(t => !t.passed)) {
  console.log('\n📌 SPECIFIC BUG FOR RU-HY:');
  console.log('   The prompt for Russian-Hy is not displaying correctly.');
  console.log('   Check that `prompt.ru` exists and contains the right text.');
} else {
  console.log('\n✅ RU-HY prompts seem correct in data.');
  console.log('   The bug might be in the component rendering logic:');
  console.log('   Look at `page.tsx` line: `current.prompt[native] ?? current.prompt["en"]`');
  console.log('   When native is "ru", it should show `prompt.ru`, not `prompt.en`');
}

console.log('\n' + '='.repeat(60));
console.log('🔧 HOW TO FIX:');
console.log('1. Check that loadLangConfig() returns correct native language');
console.log('2. Make sure `pair` parameter is correctly parsed: "ru-hy"');
console.log('3. In page.tsx, ensure `native` state is set to "ru"');
console.log('4. The prompt should be: `current.prompt[native]` not `current.prompt.en`');
console.log('5. Add console.log to see what native language is being used');