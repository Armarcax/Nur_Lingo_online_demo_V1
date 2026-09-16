// scripts/generate-ru-female.js
// Run: node scripts/generate-ru-female.js
//
// ՌՈՒՍԵՐԵՆ - Նույն ID-ները, ինչ անգլերենինը
// audioId-ները մնում են անգլերեն (greet_hello, greet_hi, ...)

const fs = require('fs');
const path = require('path');
const https = require('https');

// ============================================================
// CONFIGURATION
// ============================================================

const LESSON_DICT_PATH = path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json');
const AUDIO_BASE_DIR = path.join(process.cwd(), 'public', 'audio', 'offline');
const RUSSIAN_DIR = path.join(AUDIO_BASE_DIR, 'ru_female');
const MANIFEST_PATH = path.join(AUDIO_BASE_DIR, 'manifest_ru_female.json');

// ============================================================
// LOAD ENGLISH MAPPING (SAME IDs)
// ============================================================

function loadEnglishMapping() {
  const enManifestPath = path.join(AUDIO_BASE_DIR, 'manifest_en_female.json');
  if (!fs.existsSync(enManifestPath)) {
    console.log('❌ English manifest not found!');
    console.log('💡 First run: node scripts/generate-en-female-full.js');
    return null;
  }
  
  try {
    const content = fs.readFileSync(enManifestPath, 'utf-8');
    const data = JSON.parse(content);
    if (data.mapping) {
      console.log(`📄 Loaded English mapping: ${Object.keys(data.mapping).length} entries`);
      return data.mapping;  // { "greet_hello": "000001", ... }
    }
  } catch (e) {
    console.log('❌ Failed to load English manifest');
  }
  return null;
}

// ============================================================
// LOAD RUSSIAN TEXTS FROM DICTIONARY
// ============================================================

function loadRussianTexts() {
  if (!fs.existsSync(LESSON_DICT_PATH)) {
    console.error(`❌ Dictionary not found: ${LESSON_DICT_PATH}`);
    return null;
  }
  
  const content = fs.readFileSync(LESSON_DICT_PATH, 'utf-8');
  const data = JSON.parse(content);
  
  const entries = [];
  const lessons = data.lessons || {};
  
  for (const [lessonId, lesson] of Object.entries(lessons)) {
    // Vocabulary - օգտագործում ենք նույն audioId-ը (անգլերեն ID)
    if (lesson.vocabulary && Array.isArray(lesson.vocabulary)) {
      for (const v of lesson.vocabulary) {
        if (v.id && v.ru && v.ru.trim()) {
          entries.push({
            audioId: v.id,        // ✅ "greet_hello" (ոչ "greet_привет")
            text: v.ru.trim(),
            type: 'vocabulary',
            lessonId
          });
        }
      }
    }
    
    // Exercises
    if (lesson.exercises && Array.isArray(lesson.exercises)) {
      for (const exercise of lesson.exercises) {
        const baseId = exercise.audio?.id || exercise.id;
        
        if (exercise.prompt && exercise.prompt.ru && exercise.prompt.ru.trim()) {
          entries.push({
            audioId: `${baseId}_prompt`,  // ✅ "greet_hello_prompt"
            text: exercise.prompt.ru.trim(),
            type: 'prompt',
            lessonId
          });
        }
        
        if (exercise.correctAnswer && exercise.correctAnswer.trim()) {
          entries.push({
            audioId: `${baseId}_answer`,
            text: exercise.correctAnswer.trim(),
            type: 'answer',
            lessonId
          });
        }
        
        if (exercise.hint && exercise.hint.ru && exercise.hint.ru.trim()) {
          entries.push({
            audioId: `${baseId}_hint`,
            text: exercise.hint.ru.trim(),
            type: 'hint',
            lessonId
          });
        }
        
        if (exercise.feedback && exercise.feedback.correct && exercise.feedback.correct.ru && exercise.feedback.correct.ru.trim()) {
          entries.push({
            audioId: `${baseId}_feedback_correct`,
            text: exercise.feedback.correct.ru.trim(),
            type: 'feedback_correct',
            lessonId
          });
        }
        
        if (exercise.feedback && exercise.feedback.incorrect && exercise.feedback.incorrect.ru && exercise.feedback.incorrect.ru.trim()) {
          entries.push({
            audioId: `${baseId}_feedback_incorrect`,
            text: exercise.feedback.incorrect.ru.trim(),
            type: 'feedback_incorrect',
            lessonId
          });
        }
      }
    }
  }
  
  // Remove duplicates
  const seen = new Set();
  const unique = entries.filter(e => {
    if (seen.has(e.audioId)) return false;
    seen.add(e.audioId);
    return true;
  });
  
  console.log(`📚 Loaded ${unique.length} Russian entries`);
  console.log(`   Using English audioIds (greet_hello, etc.)`);
  return unique;
}

// ============================================================
// CLEAN TEXT - KEEP RUSSIAN CHARACTERS
// ============================================================

function cleanText(text) {
  if (!text) return '';
  
  let cleaned = text
    .replace(/[❌✅🎉💪🔥⭐️🌟💡⚠️ℹ️🔊📊📁📄▶️⏹️⏸️🎤👩‍🏫👨‍🏫]/g, '')
    .replace(/[^\u0400-\u04FF\s.,!?'"()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (!cleaned || cleaned.length < 2) {
    const extracted = text.replace(/[^а-яА-ЯёЁ\s]/g, '').trim();
    if (extracted && extracted.length > 2) {
      return extracted;
    }
    return null;
  }
  
  return cleaned;
}

// ============================================================
// GOOGLE TTS - RUSSIAN
// ============================================================

async function generateGoogleTTS(text) {
  const cleanTextValue = cleanText(text);
  
  if (!cleanTextValue) {
    throw new Error('Text is empty after cleaning');
  }
  
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanTextValue)}&tl=ru&client=tw-ob`;
  
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const tempFile = path.join(tempDir, `${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`);
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(tempFile);
    let timeoutId = setTimeout(() => {
      file.destroy();
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      reject(new Error('Request timeout (15s)'));
    }, 15000);
    
    const request = https.get(url, (response) => {
      clearTimeout(timeoutId);
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        try {
          const stats = fs.statSync(tempFile);
          if (stats.size < 100) {
            reject(new Error('File too small'));
            return;
          }
          const buffer = fs.readFileSync(tempFile);
          fs.unlinkSync(tempFile);
          resolve(buffer);
        } catch (error) {
          reject(error);
        }
      });
      
      file.on('error', (error) => {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        reject(error);
      });
    });
    
    request.on('error', (error) => {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      reject(error);
    });
    
    request.end();
  });
}

async function generateTTS(text) {
  return await generateGoogleTTS(text);
}

// ============================================================
// GENERATE AUDIO (SAME IDs AS ENGLISH)
// ============================================================

async function generateAudio(entries, enMapping) {
  if (!enMapping) {
    console.error('❌ No English mapping found!');
    console.log('💡 Please generate English audio first:');
    console.log('   node scripts/generate-en-female-full.js');
    return null;
  }
  
  if (!fs.existsSync(RUSSIAN_DIR)) {
    fs.mkdirSync(RUSSIAN_DIR, { recursive: true });
    console.log(`📁 Created directory: ru_female`);
  }
  
  // Load existing Russian manifest
  let manifest = {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    voice: 'Google TTS (Russian Female)',
    voiceLabel: 'Google Russian Female',
    totalFiles: 0,
    mapping: {}  // audioId → numId
  };
  
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      const old = JSON.parse(content);
      if (old.mapping) {
        manifest.mapping = old.mapping;
        manifest.totalFiles = Object.keys(manifest.mapping).length;
        console.log(`📄 Loaded existing Russian manifest: ${manifest.totalFiles} files`);
      }
    } catch (e) {}
  }
  
  // Find entries that need generation
  const missing = [];
  const toSkip = [];
  
  for (const entry of entries) {
    const numId = enMapping[entry.audioId];
    if (!numId) {
      console.log(`⚠️ No English ID for: ${entry.audioId}`);
      continue;
    }
    
    // Check if file already exists
    const fileName = `${numId}.mp3`;
    const filePath = path.join(RUSSIAN_DIR, fileName);
    
    if (fs.existsSync(filePath) || manifest.mapping[entry.audioId]) {
      toSkip.push(entry);
    } else {
      missing.push({
        ...entry,
        numId: numId  // ✅ Use the same ID as English
      });
    }
  }
  
  if (missing.length === 0) {
    console.log(`✅ All ${entries.length} files already exist!`);
    return { generated: 0, skipped: entries.length, failed: 0, manifest };
  }
  
  console.log(`\n🎯 ${missing.length} files to generate (${entries.length} total)`);
  console.log(`   Voice: Google Translate TTS (Russian Female)`);
  console.log(`   Format: Same IDs as English (000001.mp3, ...)`);
  console.log(`   Skipped: ${toSkip.length} files (already exist)`);
  console.log(`   Output: ru_female/\n`);
  
  let success = 0;
  let failed = 0;
  let total = missing.length;
  
  const BATCH_SIZE = 10;
  
  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE);
    
    for (let j = 0; j < batch.length; j++) {
      const entry = batch[j];
      const text = entry.text;
      const numId = entry.numId;
      const fileName = `${numId}.mp3`;
      const filePath = path.join(RUSSIAN_DIR, fileName);
      
      try {
        const done = i + j + 1;
        const pct = ((done / total) * 100).toFixed(1);
        process.stdout.write(`\r  ru_female: ${done}/${total} (${pct}%) ✅ ${success} ❌ ${failed} | ${numId}.mp3`);
        
        const buffer = await generateTTS(text);
        fs.writeFileSync(filePath, buffer);
        success++;
        
        // Update mapping
        manifest.mapping[entry.audioId] = numId;
        
        // Save manifest every 10 files
        if (success % 10 === 0 || i + j === missing.length - 1) {
          manifest.totalFiles = Object.keys(manifest.mapping).length;
          manifest.generatedAt = new Date().toISOString();
          fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
        }
        
        await new Promise(r => setTimeout(r, 200));
        
      } catch (error) {
        console.log(`\n  ❌ ${entry.audioId} (${numId}): ${error.message}`);
        failed++;
      }
    }
    
    if (i + BATCH_SIZE < missing.length) {
      console.log(`\n  ⏳ Batch done, waiting...`);
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  // Final save
  manifest.totalFiles = Object.keys(manifest.mapping).length;
  manifest.generatedAt = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  
  console.log(`\r  ✅ ru_female: ${success} generated, ${failed} failed`);
  
  return { generated: success, skipped: toSkip.length, failed, manifest };
}

// ============================================================
// VERIFY MAPPING
// ============================================================

function verifyMapping(enMapping, ruManifest) {
  console.log('\n📊 VERIFICATION');
  console.log('──────────────────────────────────────────');
  
  const enKeys = Object.keys(enMapping);
  const ruKeys = Object.keys(ruManifest.mapping);
  
  const missingInRu = enKeys.filter(k => !ruKeys.includes(k));
  const extraInRu = ruKeys.filter(k => !enKeys.includes(k));
  const common = enKeys.filter(k => ruKeys.includes(k));
  
  console.log(`  English entries: ${enKeys.length}`);
  console.log(`  Russian entries: ${ruKeys.length}`);
  console.log(`  Common entries: ${common.length}`);
  
  if (missingInRu.length > 0) {
    console.log(`  ⚠️ Missing in Russian: ${missingInRu.length} entries`);
    if (missingInRu.length <= 10) {
      for (const key of missingInRu) {
        console.log(`    - ${key}`);
      }
    }
  }
  
  // Check if IDs match
  let mismatch = 0;
  for (const key of common) {
    if (enMapping[key] !== ruManifest.mapping[key]) {
      mismatch++;
    }
  }
  
  if (mismatch === 0) {
    console.log(`  ✅ All IDs match between English and Russian!`);
  } else {
    console.log(`  ⚠️ ID mismatch: ${mismatch} entries`);
  }
}

// ============================================================
// PRINT STATS
// ============================================================

function printStats(entries) {
  console.log('\n📊 BREAKDOWN');
  console.log('──────────────────────────────────────────');
  
  const byType = {};
  for (const e of entries) {
    byType[e.type] = (byType[e.type] || 0) + 1;
  }
  for (const [type, count] of Object.entries(byType).sort()) {
    console.log(`  ${type}: ${count}`);
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🎵 RUSSIAN AUDIO GENERATOR (SAME IDs AS ENGLISH)');
  console.log('===================================================');
  console.log(`  Voice: Google Translate TTS (Russian Female)`);
  console.log(`  Format: Same numeric IDs as English`);
  console.log(`  Audio IDs: English (greet_hello, greet_hi, ...)`);
  console.log(`  Output: ru_female/`);
  console.log(`  ETA: ~2-3 hours`);
  console.log();
  
  // Load English mapping (same IDs)
  const enMapping = loadEnglishMapping();
  if (!enMapping) {
    console.log('\n❌ Please generate English audio first:');
    console.log('   node scripts/generate-en-female-full.js');
    return;
  }
  console.log();
  
  // Load Russian texts
  const entries = loadRussianTexts();
  if (!entries || entries.length === 0) {
    console.error('❌ No Russian entries found');
    return;
  }
  
  printStats(entries);
  console.log();
  
  // Generate audio
  const result = await generateAudio(entries, enMapping);
  
  if (!result) {
    console.error('❌ Generation failed');
    return;
  }
  
  // Verify mapping
  if (result.manifest) {
    verifyMapping(enMapping, result.manifest);
  }
  
  // Summary
  console.log('\n📊 FINAL SUMMARY');
  console.log('──────────────────────────────────────────');
  console.log(`  Total Russian entries: ${entries.length}`);
  console.log(`  Generated: ${result.generated}`);
  console.log(`  Skipped: ${result.skipped}`);
  console.log(`  Failed: ${result.failed}`);
  
  if (fs.existsSync(RUSSIAN_DIR)) {
    const files = fs.readdirSync(RUSSIAN_DIR).filter(f => f.endsWith('.mp3'));
    console.log(`  Total MP3 files: ${files.length}`);
  }
  
  if (result.manifest) {
    console.log(`  Mapped entries: ${Object.keys(result.manifest.mapping).length}`);
  }
  
  console.log('\n✅ Done!');
  console.log(`  Russian Manifest: ${MANIFEST_PATH}`);
  console.log(`  Audio: ${RUSSIAN_DIR}`);
  console.log('\n💡 Next: npm run sync-audio');
}

// ============================================================
// RUN
// ============================================================

main().catch(console.error);