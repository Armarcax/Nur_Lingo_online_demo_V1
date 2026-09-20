#!/usr/bin/env node
/**
 * NUR Lingo — Lesson Dictionary i18n Pipeline Analyzer
 *
 * Read-only analyzer. Finds all files involved in lesson-dictionary.json
 * generation and loading, and identifies where options/correctAnswer
 * are hardcoded in English only.
 *
 * Usage:
 *   node scripts/analyze-i18n-pipeline.js
 *
 * Output:
 *   pipeline-analysis/01-build-scripts.log
 *   pipeline-analysis/02-builders.log
 *   pipeline-analysis/03-loading.log
 *   pipeline-analysis/04-translation.log
 *   pipeline-analysis/05-data-structure.log
 *   pipeline-analysis/06-summary.log
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'pipeline-analysis');

// ─── HELPERS ────────────────────────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

function writeLog(filename, content) {
  const fullPath = path.join(OUT, filename);
  fs.writeFileSync(fullPath, content, 'utf8');
  const kb = (Buffer.byteLength(content, 'utf8') / 1024).toFixed(1);
  console.log(`   📄 ${filename} (${kb} KB)`);
}

function walkDir(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (
      entry.name === 'node_modules' ||
      entry.name === '.next' ||
      entry.name === '.git' ||
      entry.name === 'pipeline-analysis'
    ) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function relPath(filePath) {
  return filePath.replace(ROOT + path.sep, '').replace(/\\/g, '/');
}

function grepFiles(pattern, files) {
  const matches = [];
  for (const file of files) {
    const content = readFile(file);
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      const regex = new RegExp(pattern);
      if (regex.test(line)) {
        matches.push({
          file: relPath(file),
          line: idx + 1,
          text: line.trim(),
        });
      }
    });
  }
  return matches;
}

function header(title) {
  return `\n${'='.repeat(72)}\n${title}\n${'='.repeat(72)}\n`;
}

// ─── MAIN ───────────────────────────────────────────────────────────

function main() {
  cleanDir(OUT);

  console.log('');
  console.log('='.repeat(72));
  console.log('🔍 NUR Lingo — i18n Pipeline Analysis');
  console.log('='.repeat(72));
  console.log('');

  const srcFiles = walkDir(path.join(ROOT, 'src'));
  const scriptFiles = walkDir(path.join(ROOT, 'scripts'));
  const allCodeFiles = [...srcFiles, ...scriptFiles];

  // ─── 1. GENERATION PIPELINE ──────────────────────────────────────

  console.log('▶️  [1/6] Build/generation scripts...');
  let log1 = header('1. BUILD / GENERATION SCRIPTS');

  const buildScripts = allCodeFiles.filter((f) =>
    /build-lesson-dictionary/i.test(f)
  );
  log1 += `\nFound ${buildScripts.length} build scripts:\n`;
  buildScripts.forEach((f) => {
    const stat = fs.statSync(f);
    log1 += `  ${relPath(f)} (${(stat.size / 1024).toFixed(1)} KB)\n`;
  });

  log1 += '\n--- build-lesson-dictionary-v3.ts (first 80 lines) ---\n';
  const v3 = path.join(ROOT, 'scripts', 'build-lesson-dictionary-v3.ts');
  if (fs.existsSync(v3)) {
    log1 += readFile(v3).split('\n').slice(0, 80).join('\n') + '\n';
  }

  log1 += '\n--- Output paths in v3 script ---\n';
  const v3Content = readFile(v3);
  v3Content.split('\n').forEach((line, i) => {
    if (
      /OUTPUT|writeFileSync|publicDir|data.*dictionary|path\.join/.test(line)
    ) {
      log1 += `  L${i + 1}: ${line.trim()}\n`;
    }
  });

  writeLog('01-build-scripts.log', log1);

  // ─── 2. SOURCE BUILDERS ─────────────────────────────────────────

  console.log('▶️  [2/6] Source builders...');
  let log2 = header('2. SOURCE BUILDERS (where lessons are defined)');

  const buildersDir = path.join(ROOT, 'src', 'lib', 'content', 'builders');
  if (fs.existsSync(buildersDir)) {
    const builders = fs.readdirSync(buildersDir);
    log2 += `\nBuilders (${builders.length}):\n`;
    builders.forEach((b) => {
      const stat = fs.statSync(path.join(buildersDir, b));
      log2 += `  ${b} (${(stat.size / 1024).toFixed(1)} KB)\n`;
    });
  }

  log2 +=
    '\n--- Files with "options:" or "correctAnswer:" or "targetAnswer:" ---\n';
  const builderMatches = grepFiles(
    '(options|correctAnswer|targetAnswer)\\s*:',
    srcFiles.filter((f) => f.includes('builders') || f.includes('content'))
  );
  const uniqueBuilderFiles = [...new Set(builderMatches.map((m) => m.file))];
  uniqueBuilderFiles.forEach((f) => (log2 += `  ${f}\n`));

  log2 += '\n--- Sample: options declarations ---\n';
  builderMatches
    .filter((m) => m.text.includes('options'))
    .slice(0, 10)
    .forEach((m) => {
      log2 += `  ${m.file}:${m.line}: ${m.text.slice(0, 100)}\n`;
    });

  log2 += '\n--- Sample: correctAnswer declarations ---\n';
  builderMatches
    .filter((m) => m.text.includes('correctAnswer'))
    .slice(0, 10)
    .forEach((m) => {
      log2 += `  ${m.file}:${m.line}: ${m.text.slice(0, 100)}\n`;
    });

  writeLog('02-builders.log', log2);

  // ─── 3. LOADING PIPELINE ────────────────────────────────────────

  console.log('▶️  [3/6] Loading pipeline...');
  let log3 = header('3. RUNTIME LOADING PIPELINE');

  log3 += '\n--- Files referencing "lesson-dictionary.json" ---\n';
  const dictRefs = grepFiles('lesson-dictionary\\.json', allCodeFiles);
  const uniqueDictFiles = [...new Set(dictRefs.map((m) => m.file))];
  uniqueDictFiles.forEach((f) => (log3 += `  ${f}\n`));

  log3 += '\n--- normalizeLesson in OfflineLessonEngine ---\n';
  const enginePath = path.join(
    ROOT,
    'src',
    'lib',
    'offline',
    'OfflineLessonEngine.ts'
  );
  const engineContent = readFile(enginePath);
  engineContent.split('\n').forEach((line, i) => {
    if (/normalizeLesson|targetAnswer|options|correctAnswer/.test(line)) {
      log3 += `  L${i + 1}: ${line.trim().slice(0, 120)}\n`;
    }
  });

  log3 += '\n--- learn/page.tsx Professional mode (lines 1225-1265) ---\n';
  const learnPath = path.join(ROOT, 'src', 'app', 'learn', 'page.tsx');
  const learnContent = readFile(learnPath);
  const learnLines = learnContent.split('\n');
  for (let i = 1224; i < 1265 && i < learnLines.length; i++) {
    log3 += `  L${i + 1}: ${learnLines[i]}\n`;
  }

  writeLog('03-loading.log', log3);

  // ─── 4. TRANSLATION LOGIC ───────────────────────────────────────

  console.log('▶️  [4/6] Translation/conversion logic...');
  let log4 = header('4. TRANSLATION / CONVERSION LOGIC');

  log4 += '\n--- Files with translation functions ---\n';
  const transRefs = grepFiles(
    'convertLessonForPair|translateWord|getAnswerInLearning|translateOffline',
    srcFiles
  );
  const uniqueTransFiles = [...new Set(transRefs.map((m) => m.file))];
  uniqueTransFiles.forEach((f) => (log4 += `  ${f}\n`));

  log4 += '\n--- Does multilingual.ts use OfflineLesson? ---\n';
  const multiPath = path.join(ROOT, 'src', 'lib', 'i18n', 'multilingual.ts');
  const multiContent = readFile(multiPath);
  const hasOffline = /OfflineLesson|offline/i.test(multiContent);
  log4 += `  Imports OfflineLesson: ${hasOffline ? 'YES' : 'NO'}\n`;

  log4 += '\n--- "convertLessonForPair" locations ---\n';
  transRefs
    .filter((m) => m.text.includes('convertLessonForPair'))
    .forEach((m) => {
      log4 += `  ${m.file}:${m.line}: ${m.text.slice(0, 100)}\n`;
    });

  writeLog('04-translation.log', log4);

  // ─── 5. DATA STRUCTURE ──────────────────────────────────────────

  console.log('▶️  [5/6] JSON data structure...');
  let log5 = header('5. JSON DATA STRUCTURE');

  const jsonPath = path.join(ROOT, 'public', 'data', 'lesson-dictionary.json');
  if (fs.existsSync(jsonPath)) {
    try {
      const data = JSON.parse(readFile(jsonPath));
      log5 += `\nversion: ${data.version}\n`;
      log5 += `totalLessons: ${data.metadata?.totalLessons}\n`;
      log5 += `totalExercises: ${data.metadata?.totalExercises}\n`;
      log5 += `languages: ${JSON.stringify(data.metadata?.languages)}\n\n`;

      const lesson = data.lessons[0];
      log5 += `Sample lesson: ${lesson.id}\n\n`;

      const hasArmenian = (s) => /[\u0531-\u058F]/.test(String(s));
      const hasRussian = (s) => /[\u0410-\u044F]/.test(String(s));
      const hasLatin = (s) => /[a-zA-Z]/.test(String(s));

      function detectLangMix(arr) {
        const mix = { hy: 0, ru: 0, en: 0, mixed: 0, unknown: 0 };
        for (const item of arr) {
          const s = String(item);
          const a = hasArmenian(s),
            r = hasRussian(s),
            e = hasLatin(s);
          const count = (a ? 1 : 0) + (r ? 1 : 0) + (e ? 1 : 0);
          if (count > 1) mix.mixed++;
          else if (a) mix.hy++;
          else if (r) mix.ru++;
          else if (e) mix.en++;
          else mix.unknown++;
        }
        return mix;
      }

      const exerciseTypes = {};
      const allOptions = [];
      const allAnswers = [];

      for (const ex of lesson.exercises) {
        const t = ex.type || 'unknown';
        exerciseTypes[t] = (exerciseTypes[t] || 0) + 1;
        if (ex.options) allOptions.push(...ex.options);
        if (ex.correctAnswer) allAnswers.push(ex.correctAnswer);
        if (ex.targetAnswer) allAnswers.push(ex.targetAnswer);
      }

      log5 += `Exercise types: ${JSON.stringify(exerciseTypes, null, 2)}\n\n`;
      log5 += `Options language mix: ${JSON.stringify(
        detectLangMix(allOptions)
      )}\n`;
      log5 += `Answers language mix: ${JSON.stringify(
        detectLangMix(allAnswers)
      )}\n\n`;

      log5 += `Vocabulary count in first lesson: ${
        lesson.vocabulary?.length || 0
      }\n`;
      if (lesson.vocabulary?.length) {
        log5 += `Sample vocab: ${JSON.stringify(
          lesson.vocabulary[0],
          null,
          2
        )}\n`;
      }

      log5 += '\n--- Full dictionary scale ---\n';
      let totalEx = 0,
        totalVocab = 0;
      let optionsEnglishOnly = 0,
        optionsMultiLang = 0;
      let answerEnglishOnly = 0,
        answerMultiLang = 0;

      for (const les of data.lessons) {
        totalVocab += les.vocabulary?.length || 0;
        for (const ex of les.exercises || []) {
          totalEx++;
          if (ex.options?.length) {
            const allEn = ex.options.every(
              (o) => hasLatin(o) && !hasArmenian(o) && !hasRussian(o)
            );
            if (allEn) optionsEnglishOnly++;
            else optionsMultiLang++;
          }
          const ans = ex.correctAnswer || ex.targetAnswer;
          if (ans) {
            if (hasLatin(ans) && !hasArmenian(ans) && !hasRussian(ans))
              answerEnglishOnly++;
            else answerMultiLang++;
          }
        }
      }

      log5 += `Total lessons: ${data.lessons.length}\n`;
      log5 += `Total exercises: ${totalEx}\n`;
      log5 += `Total vocabulary: ${totalVocab}\n`;
      log5 += `\n`;
      log5 += `Options English-only:  ${optionsEnglishOnly}\n`;
      log5 += `Options multi-lang:    ${optionsMultiLang}\n`;
      log5 += `Answers English-only:  ${answerEnglishOnly}\n`;
      log5 += `Answers multi-lang:    ${answerMultiLang}\n`;
    } catch (e) {
      log5 += `ERROR parsing JSON: ${e.message}\n`;
    }
  } else {
    log5 += `NOT FOUND: ${relPath(jsonPath)}\n`;
  }

  writeLog('05-data-structure.log', log5);

  // ─── 6. SUMMARY ─────────────────────────────────────────────────

  console.log('▶️  [6/6] Summary...');
  let log6 = header('6. PIPELINE SUMMARY');

  log6 += `
GENERATION CHAIN:
  src/lib/content/builders/world*.ts      (source)
        ↓
  scripts/build-lesson-dictionary-v3.ts   (builder)
        ↓
  data/dictionaries/lesson-dictionary.json
        ↓
  public/data/lesson-dictionary.json      (served)

LOADING CHAIN:
  OfflineLessonEngine.loadLessonDictionary()
        ↓
  fetch('/data/lesson-dictionary.json')
        ↓
  normalizeLesson()  <- no translation here
        ↓
  learn/page.tsx  (Professional mode)

TRANSLATION GAP:
  options: string[]            (mostly English only)
  correctAnswer / targetAnswer (mostly English only)
  prompt: Record<lang,string>  (all 3 languages OK)
  vocabulary: {hy,en,ru}       (all 3 languages OK)

FILES TO UPDATE (probable):
  1. scripts/build-lesson-dictionary-v3.ts   <- add lang-aware options
  2. src/lib/content/builders/world*.ts       <- source data
  3. src/lib/offline/OfflineLessonEngine.ts   <- normalizeLesson
  4. src/app/learn/page.tsx                   <- translation at load
`;

  writeLog('06-summary.log', log6);

  console.log('');
  console.log('='.repeat(72));
  console.log('✅ Analysis complete.');
  console.log(`📁 Logs saved to: ${relPath(OUT)}/`);
  console.log('='.repeat(72));
  console.log('');
  console.log('📋 Open these files to see details:');
  console.log('   - pipeline-analysis/01-build-scripts.log');
  console.log('   - pipeline-analysis/02-builders.log');
  console.log('   - pipeline-analysis/03-loading.log');
  console.log('   - pipeline-analysis/04-translation.log');
  console.log('   - pipeline-analysis/05-data-structure.log');
  console.log('   - pipeline-analysis/06-summary.log');
  console.log('');
}

main();