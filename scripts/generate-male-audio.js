// scripts/generate-male-audio.js
// Run: node scripts/generate-male-audio.js

const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// ============================================================
// CONFIG
// ============================================================

const AUDIO_FILENAMES_PATH = path.join(process.cwd(), 'public', 'audio', 'offline', 'audio-filenames-only.txt');
const AUDIO_BASE_DIR = path.join(process.cwd(), 'public', 'audio', 'offline');

// ============================================================
// LOAD FILENAMES
// ============================================================

function loadFilenames() {
  if (!fs.existsSync(AUDIO_FILENAMES_PATH)) {
    console.error(`❌ Not found: ${AUDIO_FILENAMES_PATH}`);
    return [];
  }
  
  const content = fs.readFileSync(AUDIO_FILENAMES_PATH, 'utf-8');
  const lines = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // Extract just the filename without folder prefix
  const filenames = [];
  const seen = new Set();
  
  for (const line of lines) {
    // If line contains '/', take the part after the last '/'
    const parts = line.split('/');
    const filename = parts[parts.length - 1];
    
    // Remove .mp3 extension if present
    const name = filename.replace('.mp3', '');
    
    if (!seen.has(name)) {
      seen.add(name);
      filenames.push(name);
    }
  }
  
  console.log(`📚 Loaded ${filenames.length} unique filenames from ${lines.length} lines`);
  return filenames;
}

// ============================================================
// TTS - EDGE TTS (ՏՂԱՄԱՐԴՈՒ ՁԱՅՆ)
// ============================================================

async function generateEdgeTTS(text, language) {
  const voice = language === 'en' 
    ? 'en-US-ChristopherNeural'
    : 'ru-RU-DmitryNeural';
  
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const tempFile = path.join(tempDir, `${Date.now()}_${language}.mp3`);
  
  try {
    const command = `edge-tts --voice "${voice}" --text "${text.replace(/"/g, '\\"').replace(/\n/g, ' ')}" --write-media "${tempFile}"`;
    
    await execAsync(command, { timeout: 30000 });
    
    if (!fs.existsSync(tempFile)) {
      throw new Error('File not created');
    }
    
    const stats = fs.statSync(tempFile);
    if (stats.size < 100) {
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

// ✅ Google Translate TTS (fallback)
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

async function generateTTS(text, language) {
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
// GENERATE FOR DIRECTORY
// ============================================================

async function generateForDirectory(filenames, language, dirName, textMap) {
  const audioDir = path.join(AUDIO_BASE_DIR, dirName);
  
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
    console.log(`  📁 Created: ${dirName}`);
  }
  
  // Find existing files
  const existing = new Set();
  if (fs.existsSync(audioDir)) {
    const files = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));
    for (const f of files) {
      existing.add(f.replace('.mp3', ''));
    }
  }
  
  // Filter missing files
  const missing = filenames.filter(f => !existing.has(f));
  
  if (missing.length === 0) {
    console.log(`  ✅ ${dirName}: All ${filenames.length} files exist`);
    return { generated: 0, skipped: filenames.length, failed: 0 };
  }
  
  console.log(`  🎯 ${dirName}: ${missing.length} missing files (🎤 MALE VOICE)`);
  console.log(`  📝 First 5: ${missing.slice(0, 5).join(', ')}`);
  
  let success = 0, failed = 0;
  const total = missing.length;
  
  for (let i = 0; i < missing.length; i++) {
    const filename = missing[i];
    const text = textMap[filename] || filename.replace(/_/g, ' ');
    
    try {
      const done = i + 1;
      const pct = ((done / total) * 100).toFixed(0);
      process.stdout.write(`\r  ${dirName}: ${done}/${total} (${pct}%) ✅ ${success} ❌ ${failed}`);
      
      const buffer = await generateTTS(text, language);
      fs.writeFileSync(path.join(audioDir, `${filename}.mp3`), buffer);
      success++;
      
      await new Promise(r => setTimeout(r, 500));
      
    } catch (error) {
      console.log(`\n  ❌ ${filename}: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\r  ✅ ${dirName}: ${success} generated, ${failed} failed (🎤 MALE VOICE)`);
  return { generated: success, skipped: missing.length - success - failed, failed };
}

// ============================================================
// BUILD TEXT MAP FROM DICTIONARY
// ============================================================

function buildTextMap() {
  const dictPath = path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json');
  const textMap = {};
  
  if (!fs.existsSync(dictPath)) {
    console.log('⚠️ Dictionary not found, using filename as text');
    return textMap;
  }
  
  try {
    const content = fs.readFileSync(dictPath, 'utf-8');
    const data = JSON.parse(content);
    const lessons = data.lessons || {};
    
    for (const [lessonId, lesson] of Object.entries(lessons)) {
      // Exercises
      if (lesson.exercises) {
        for (const ex of lesson.exercises) {
          const fileName = `${lessonId}_${ex.id}`;
          if (ex.prompt?.en) {
            textMap[fileName] = ex.prompt.en;
          } else if (ex.targetAnswer) {
            textMap[fileName] = ex.targetAnswer;
          }
          
          if (ex.prompt?.ru) {
            textMap[`${fileName}_ru`] = ex.prompt.ru;
          }
        }
      }
      
      // Vocabulary
      if (lesson.vocabulary) {
        for (const v of lesson.vocabulary) {
          const fileName = `${lessonId}_vocab_${v.id}`;
          if (v.en) textMap[fileName] = v.en;
          if (v.ru) textMap[`${fileName}_ru`] = v.ru;
        }
      }
    }
    
    console.log(`📖 Built text map with ${Object.keys(textMap).length} entries`);
  } catch (error) {
    console.log(`⚠️ Failed to build text map: ${error.message}`);
  }
  
  return textMap;
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🎵 Generating Audio from Filenames (🎤 MALE VOICE)');
  console.log('====================================================');
  console.log('  🇬🇧 English: en-US-ChristopherNeural (🎤 MALE)');
  console.log('  🇷🇺 Russian: ru-RU-DmitryNeural (🎤 MALE)');
  console.log('====================================================\n');
  
  // Check edge-tts
  try {
    await execAsync('edge-tts --version', { timeout: 5000 });
    console.log('✅ Edge TTS is available\n');
  } catch {
    console.log('❌ Edge TTS not found');
    console.log('   Install: npm install -g edge-tts\n');
    return;
  }
  
  // Load filenames
  const filenames = loadFilenames();
  if (filenames.length === 0) {
    console.error('❌ No filenames found');
    console.log('💡 Check: public/audio/offline/audio-filenames-only.txt');
    return;
  }
  
  // Split by language
  const enFilenames = filenames.filter(f => !f.endsWith('_ru'));
  const ruFilenames = filenames.filter(f => f.endsWith('_ru'));
  
  console.log(`  EN: ${enFilenames.length} files`);
  console.log(`  RU: ${ruFilenames.length} files`);
  console.log(`  Total: ${filenames.length} files`);
  console.log();
  
  // Build text map
  const textMap = buildTextMap();
  console.log();
  
  const startTime = Date.now();
  const results = [];
  
  // Generate English (MALE voice) - en_male
  console.log('🔊 ENGLISH (🎤 MALE)');
  console.log('----------------------------------------');
  const enResult = await generateForDirectory(enFilenames, 'en', 'en_male', textMap);
  results.push(enResult);
  console.log();
  
  // Generate Russian (MALE voice) - ru_male
  console.log('🔊 RUSSIAN (🎤 MALE)');
  console.log('----------------------------------------');
  const ruResult = await generateForDirectory(ruFilenames, 'ru', 'ru_male', textMap);
  results.push(ruResult);
  console.log();
  
  // Summary
  console.log('====================================================');
  console.log('📊 SUMMARY');
  console.log('====================================================');
  console.log(`  EN (en_male - 🎤 MALE): ${enResult.generated} generated, ${enResult.failed} failed`);
  console.log(`  RU (ru_male - 🎤 MALE): ${ruResult.generated} generated, ${ruResult.failed} failed`);
  
  const totalGenerated = enResult.generated + ruResult.generated;
  const totalFailed = enResult.failed + ruResult.failed;
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log(`\n  ✅ Total generated: ${totalGenerated}`);
  console.log(`  ❌ Total failed: ${totalFailed}`);
  console.log(`  ⏱️ Time: ${totalTime}s`);
  
  console.log('\n✅ Done!');
  console.log('💡 Run: npm run sync-audio to update manifests');
}

// ============================================================
// RUN
// ============================================================

main().catch(console.error);