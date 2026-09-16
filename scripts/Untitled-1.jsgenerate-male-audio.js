// scripts/generate-male-audio.js
// Run: node scripts/generate-male-audio.js
//
// Գեներացնում է անգլերեն և ռուսերեն աուդիո ֆայլեր (ՄԻԱՅՆ ՏՂԱՄԱՐԴՈՒ ՁԱՅՆՈՎ)
// en_male և ru_male պանակների համար

const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// ============================================================
// CONFIGURATION
// ============================================================

const LESSON_DICT_PATH = path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json');
const AUDIO_BASE_DIR = path.join(process.cwd(), 'public', 'audio', 'offline');

// ============================================================
// LOAD LESSON DICTIONARY
// ============================================================

function loadLessonDictionary() {
  if (!fs.existsSync(LESSON_DICT_PATH)) {
    console.error(`❌ Lesson dictionary not found: ${LESSON_DICT_PATH}`);
    return null;
  }
  
  const content = fs.readFileSync(LESSON_DICT_PATH, 'utf-8');
  const data = JSON.parse(content);
  
  const entries = [];
  const lessons = data.lessons || {};
  
  for (const [lessonId, lesson] of Object.entries(lessons)) {
    // Exercises
    if (lesson.exercises && Array.isArray(lesson.exercises)) {
      for (const exercise of lesson.exercises) {
        if (exercise.audioId) {
          // English text
          if (exercise.prompt && exercise.prompt.en) {
            entries.push({
              id: exercise.audioId,
              text: exercise.prompt.en,
              lang: 'en',
              type: 'exercise',
              lessonId
            });
          } else if (exercise.targetAnswer) {
            entries.push({
              id: exercise.audioId,
              text: exercise.targetAnswer,
              lang: 'en',
              type: 'exercise',
              lessonId
            });
          }
          
          // Russian text
          if (exercise.prompt && exercise.prompt.ru) {
            entries.push({
              id: `${exercise.audioId}_ru`,
              text: exercise.prompt.ru,
              lang: 'ru',
              type: 'exercise',
              lessonId
            });
          }
        }
      }
    }
    
    // Vocabulary
    if (lesson.vocabulary && Array.isArray(lesson.vocabulary)) {
      for (const v of lesson.vocabulary) {
        if (v.audioId) {
          if (v.en) {
            entries.push({
              id: v.audioId,
              text: v.en,
              lang: 'en',
              type: 'vocabulary',
              lessonId
            });
          }
          if (v.ru) {
            entries.push({
              id: `${v.audioId}_ru`,
              text: v.ru,
              lang: 'ru',
              type: 'vocabulary',
              lessonId
            });
          }
        }
      }
    }
  }
  
  console.log(`📚 Loaded ${entries.length} entries`);
  console.log(`   EN: ${entries.filter(e => e.lang === 'en').length}`);
  console.log(`   RU: ${entries.filter(e => e.lang === 'ru').length}`);
  return entries;
}

// ============================================================
// TTS GENERATION - MALE VOICE ONLY
// ============================================================

// ✅ Edge TTS (best quality) - MALE VOICE
async function generateEdgeTTS(text, language) {
  // MALE voices ONLY:
  // English: en-US-ChristopherNeural, en-GB-RyanNeural
  // Russian: ru-RU-DmitryNeural
  const voice = language === 'en' 
    ? 'en-US-ChristopherNeural' 
    : 'ru-RU-DmitryNeural';
  
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const tempFile = path.join(tempDir, `${Date.now()}_${language}_male.mp3`);
  
  try {
    const command = `npx edge-tts --voice "${voice}" --text "${text.replace(/"/g, '\\"').replace(/\n/g, ' ')}" --write-media "${tempFile}"`;
    
    await execAsync(command, { timeout: 30000 });
    
    if (!fs.existsSync(tempFile)) {
      throw new Error('File not created');
    }
    
    const stats = fs.statSync(tempFile);
    if (stats.size < 1000) {
      throw new Error('File too small');
    }
    
    const buffer = fs.readFileSync(tempFile);
    fs.unlinkSync(tempFile);
    
    return buffer;
  } catch (error) {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    throw error;
  }
}

// ✅ Google Translate TTS (fallback) - MALE VOICE
async function generateGoogleTTS(text, language) {
  const langCode = language === 'en' ? 'en' : 'ru';
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${langCode}&client=tw-ob`;
  
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const tempFile = path.join(tempDir, `${Date.now()}_${language}_google.mp3`);
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(tempFile);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        const buffer = fs.readFileSync(tempFile);
        fs.unlinkSync(tempFile);
        resolve(buffer);
      });
      file.on('error', reject);
    }).on('error', reject);
  });
}

// ✅ Main TTS function - MALE VOICE ONLY
async function generateTTS(text, language) {
  // Try Edge TTS first (better quality)
  try {
    return await generateEdgeTTS(text, language);
  } catch (error) {
    console.warn(`  ⚠️ Edge TTS failed: ${error.message}`);
    console.log(`  🔄 Falling back to Google TTS...`);
    try {
      return await generateGoogleTTS(text, language);
    } catch (googleError) {
      throw new Error(`All TTS methods failed: ${googleError.message}`);
    }
  }
}

// ============================================================
// GENERATE FOR DIRECTORY - MALE VOICE ONLY
// ============================================================

async function generateForDirectory(entries, language, dirName) {
  const audioDir = path.join(AUDIO_BASE_DIR, dirName);
  
  // Create directory
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
    console.log(`  📁 Created directory: ${dirName}`);
  }
  
  // Filter entries for this language
  const langEntries = entries.filter(e => e.lang === language);
  
  if (langEntries.length === 0) {
    console.log(`  ⚠️ No ${language} entries found`);
    return { language, generated: 0, skipped: 0, failed: 0 };
  }
  
  // Find existing files
  const existingFiles = new Set();
  if (fs.existsSync(audioDir)) {
    const files = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));
    for (const file of files) {
      existingFiles.add(file.replace('.mp3', ''));
    }
  }
  
  // Filter missing entries
  const missing = langEntries.filter(entry => !existingFiles.has(entry.id));
  
  if (missing.length === 0) {
    console.log(`  ✅ ${dirName}: All ${langEntries.length} files exist`);
    return { language, generated: 0, skipped: langEntries.length, failed: 0 };
  }
  
  console.log(`  🎯 ${dirName}: ${missing.length} missing files to generate (${langEntries.length} total)`);
  
  let successCount = 0;
  let failCount = 0;
  let total = missing.length;
  
  // Process in batches
  const BATCH_SIZE = 20;
  
  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE);
    
    for (let j = 0; j < batch.length; j++) {
      const entry = batch[j];
      const text = entry.text;
      
      if (!text || text.trim().length === 0) {
        failCount++;
        continue;
      }
      
      const fileName = `${entry.id}.mp3`;
      const filePath = path.join(audioDir, fileName);
      
      try {
        const done = i + j + 1;
        const pct = ((done / total) * 100).toFixed(1);
        process.stdout.write(`\r  ${dirName}: ${done}/${total} (${pct}%) ${successCount} ✅, ${failCount} ❌`);
        
        const buffer = await generateTTS(text, language);
        fs.writeFileSync(filePath, buffer);
        successCount++;
        
        // Rate limiting
        await new Promise(r => setTimeout(r, 500));
        
      } catch (error) {
        console.log(`\n  ❌ ${entry.id}: ${error.message}`);
        failCount++;
      }
    }
    
    // Pause between batches
    if (i + BATCH_SIZE < missing.length) {
      console.log(`\n  ⏳ Batch done, waiting 2 seconds...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  console.log(`\r  ✅ ${dirName}: Done! ${successCount} generated, ${failCount} failed`);
  
  return { language, generated: successCount, skipped: missing.length - successCount - failCount, failed: failCount };
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🎵 Generating Audio - MALE VOICE ONLY');
  console.log('========================================');
  console.log('  🇬🇧 English: en-US-ChristopherNeural');
  console.log('  🇷🇺 Russian: ru-RU-DmitryNeural');
  console.log('========================================\n');
  
  // Check edge-tts
  try {
    await execAsync('npx edge-tts --version', { timeout: 5000 });
    console.log('✅ Edge TTS is available (better quality)\n');
  } catch {
    console.log('ℹ️ Edge TTS not found, using Google Translate TTS');
    console.log('   Install: npm install -g edge-tts\n');
  }
  
  // Load dictionary
  const entries = loadLessonDictionary();
  if (!entries || entries.length === 0) {
    console.error('❌ No entries found');
    return;
  }
  console.log();
  
  const startTime = Date.now();
  const results = [];
  
  // 1. Generate English (MALE voice) - en_male
  console.log('🔊 Generating ENGLISH (Male Voice)...');
  console.log('----------------------------------------');
  const enResult = await generateForDirectory(entries, 'en', 'en_male');
  results.push(enResult);
  console.log();
  
  // 2. Generate Russian (MALE voice) - ru_male
  console.log('🔊 Generating RUSSIAN (Male Voice)...');
  console.log('----------------------------------------');
  const ruResult = await generateForDirectory(entries, 'ru', 'ru_male');
  results.push(ruResult);
  console.log();
  
  // Summary
  console.log('========================================');
  console.log('📊 SUMMARY');
  console.log('========================================');
  
  let totalGenerated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  
  for (const result of results) {
    console.log(`  ${result.language}: ${result.generated} generated, ${result.skipped} skipped, ${result.failed} failed`);
    totalGenerated += result.generated;
    totalSkipped += result.skipped;
    totalFailed += result.failed;
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('\n----------------------------------------');
  console.log(`  ✅ Total generated: ${totalGenerated}`);
  console.log(`  ⏭️ Total skipped: ${totalSkipped}`);
  console.log(`  ❌ Total failed: ${totalFailed}`);
  console.log(`  ⏱️ Total time: ${totalTime}s`);
  
  // Count files
  console.log('\n📁 Audio files:');
  for (const dir of ['en_male', 'ru_male']) {
    const dirPath = path.join(AUDIO_BASE_DIR, dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.mp3'));
      console.log(`  ${dir}: ${files.length} files`);
    }
  }
  
  console.log('\n✅ Done!');
  console.log('💡 Run: npm run sync-audio to update manifests');
}

// ============================================================
// RUN
// ============================================================

main().catch(console.error);