// scripts/generate-en-female-audio.js
// Run: node scripts/generate-en-female-audio.js
//
// Գեներացնում է անգլերեն աուդիո (ԵՐԻՏԱՍԱՐԴ ԿԱՆԱՑԻ ՁԱՅՆ)
// Արագացված տարբերակ՝ ժամանակի ցուցադրմամբ

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// ============================================================
// PATHS
// ============================================================

const DICT_PATH = path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json');
const AUDIO_BASE_DIR = path.join(process.cwd(), 'public', 'audio', 'offline');
const EN_FEMALE_DIR = path.join(AUDIO_BASE_DIR, 'en_female');
const MANIFEST_PATH = path.join(AUDIO_BASE_DIR, 'manifest_en_female.json');

// ============================================================
// LOGGER
// ============================================================

const LOG = {
  info: (msg) => console.log(`\x1b[36mℹ\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m✅\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m⚠️\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m❌\x1b[0m ${msg}`),
  section: (msg) => console.log(`\n\x1b[1m━━━ ${msg} ━━━\x1b[0m\n`),
};

// ============================================================
// VOICE
// ============================================================

const VOICE = 'en-US-AriaNeural';

// ============================================================
// TIME HELPERS
// ============================================================

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

function estimateTime(total, done, elapsed) {
  if (done === 0) return 'calculating...';
  const avg = elapsed / done;
  const remaining = (total - done) * avg;
  return formatTime(remaining);
}

// ============================================================
// LOAD DICTIONARY
// ============================================================

function loadDictionary() {
  if (!fs.existsSync(DICT_PATH)) {
    LOG.error(`Dictionary not found: ${DICT_PATH}`);
    return null;
  }
  
  const content = fs.readFileSync(DICT_PATH, 'utf-8');
  const data = JSON.parse(content);
  LOG.success(`Loaded dictionary v${data.version}`);
  return data;
}

// ============================================================
// COLLECT ALL TEXTS
// ============================================================

function collectAllTexts(dict) {
  const entries = [];
  const seen = new Set();
  const lessons = dict.lessons || [];
  
  for (const lesson of lessons) {
    const lessonId = lesson.id;
    
    // Vocabulary
    if (lesson.vocabulary && Array.isArray(lesson.vocabulary)) {
      for (const v of lesson.vocabulary) {
        if (v.id && v.en && v.en.trim()) {
          const key = v.id;
          if (!seen.has(key)) {
            seen.add(key);
            entries.push({
              id: v.id,
              text: v.en.trim(),
              type: 'vocabulary',
              lessonId: lessonId,
              category: 'word'
            });
          }
        }
      }
    }
    
    // Exercises
    if (lesson.exercises && Array.isArray(lesson.exercises)) {
      for (const ex of lesson.exercises) {
        const audioId = ex.audio?.id || ex.id;
        
        if (ex.prompt?.en?.trim()) {
          const key = `${audioId}_prompt`;
          if (!seen.has(key)) {
            seen.add(key);
            entries.push({
              id: key,
              text: ex.prompt.en.trim(),
              type: 'prompt',
              lessonId: lessonId,
              exerciseId: ex.id,
              category: 'question'
            });
          }
        }
        
        if (ex.correctAnswer?.trim()) {
          const key = `${audioId}_answer`;
          if (!seen.has(key)) {
            seen.add(key);
            entries.push({
              id: key,
              text: ex.correctAnswer.trim(),
              type: 'answer',
              lessonId: lessonId,
              exerciseId: ex.id,
              category: 'answer'
            });
          }
        }
        
        if (ex.hint?.en?.trim()) {
          const key = `${audioId}_hint`;
          if (!seen.has(key)) {
            seen.add(key);
            entries.push({
              id: key,
              text: ex.hint.en.trim(),
              type: 'hint',
              lessonId: lessonId,
              exerciseId: ex.id,
              category: 'hint'
            });
          }
        }
        
        if (ex.feedback?.correct?.en?.trim()) {
          const key = `${audioId}_feedback_correct`;
          if (!seen.has(key)) {
            seen.add(key);
            entries.push({
              id: key,
              text: ex.feedback.correct.en.trim(),
              type: 'feedback_correct',
              lessonId: lessonId,
              exerciseId: ex.id,
              category: 'feedback'
            });
          }
        }
        
        if (ex.feedback?.incorrect?.en?.trim()) {
          const key = `${audioId}_feedback_incorrect`;
          if (!seen.has(key)) {
            seen.add(key);
            entries.push({
              id: key,
              text: ex.feedback.incorrect.en.trim(),
              type: 'feedback_incorrect',
              lessonId: lessonId,
              exerciseId: ex.id,
              category: 'feedback'
            });
          }
        }
      }
    }
  }
  
  return entries;
}

// ============================================================
// TTS GENERATION
// ============================================================

async function generateTTS(text) {
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const tempFile = path.join(tempDir, `${Date.now()}_en_female.mp3`);
  
  try {
    const cleanText = text
      .replace(/[“”"]/g, '"')
      .replace(/[‘’']/g, "'")
      .replace(/[—–-]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
    
    const command = `edge-tts --voice "${VOICE}" --text "${cleanText.replace(/"/g, '\\"').replace(/\n/g, ' ')}" --write-media "${tempFile}"`;
    
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

// ============================================================
// GENERATE AUDIO (OPTIMIZED)
// ============================================================

async function generateAudio(entries, audioDir) {
  // Create directory
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
    LOG.info(`Created directory: en_female`);
  }
  
  // Load existing manifest
  let manifest = {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    voice: VOICE,
    voiceLabel: 'Aria (Young Female)',
    totalFiles: 0,
    mapping: {}
  };
  
  let existingMapping = {};
  
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      const oldManifest = JSON.parse(content);
      
      if (oldManifest.entries) {
        for (const [audioId, entry] of Object.entries(oldManifest.entries)) {
          const filename = entry.filename || '';
          const numId = filename.replace('.mp3', '');
          if (numId && !isNaN(parseInt(numId))) {
            existingMapping[audioId] = numId;
          }
        }
        manifest.mapping = existingMapping;
        manifest.totalFiles = Object.keys(existingMapping).length;
        LOG.info(`Converted ${manifest.totalFiles} entries from old manifest`);
      } else if (oldManifest.mapping) {
        manifest.mapping = oldManifest.mapping || {};
        manifest.totalFiles = Object.keys(manifest.mapping).length;
        LOG.info(`Loaded existing manifest with ${manifest.totalFiles} files`);
      } else {
        LOG.warning('Unknown manifest format, creating new');
      }
    } catch (e) {
      LOG.warning(`Failed to load manifest: ${e.message}`);
    }
  }
  
  // Check existing files
  const existingFiles = new Set();
  if (fs.existsSync(audioDir)) {
    const files = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));
    for (const f of files) {
      const numId = f.replace('.mp3', '');
      if (!isNaN(parseInt(numId))) {
        existingFiles.add(numId);
      }
    }
  }
  
  // Find missing entries
  const missing = [];
  for (const entry of entries) {
    const numId = manifest.mapping[entry.id];
    if (!numId || !existingFiles.has(numId)) {
      missing.push(entry);
    }
  }
  
  if (missing.length === 0) {
    LOG.success(`All ${entries.length} files already exist`);
    return { generated: 0, skipped: entries.length, failed: 0 };
  }
  
  // Determine starting number
  let startNum = 1;
  if (existingFiles.size > 0) {
    const numbers = [];
    for (const f of existingFiles) {
      const num = parseInt(f);
      if (!isNaN(num)) numbers.push(num);
    }
    if (numbers.length > 0) {
      startNum = Math.max(...numbers) + 1;
    }
  }
  
  LOG.info(`🎯 ${missing.length} files to generate (${entries.length} total)`);
  LOG.info(`   Voice: ${VOICE} (🎤 Young Female - Aria)`);
  LOG.info(`   Format: 000001.mp3, 000002.mp3, ...`);
  LOG.info(`   Starting from: ${String(startNum).padStart(6, '0')}`);
  console.log();
  
  let success = 0;
  let failed = 0;
  let total = missing.length;
  let currentNum = startNum;
  const startTime = Date.now();
  
  // Process one by one with time display
  for (let i = 0; i < missing.length; i++) {
    const entry = missing[i];
    const text = entry.text;
    
    if (!text || text.trim().length === 0) {
      failed++;
      currentNum++;
      continue;
    }
    
    const numId = String(currentNum).padStart(6, '0');
    const filePath = path.join(audioDir, `${numId}.mp3`);
    
    try {
      const done = i + 1;
      const elapsed = Date.now() - startTime;
      const pct = ((done / total) * 100).toFixed(1);
      const eta = estimateTime(total, done, elapsed);
      const time = formatTime(elapsed);
      
      process.stdout.write(`\r  [${time}] ${done}/${total} (${pct}%) ETA: ${eta} | ✅ ${success} ❌ ${failed} | ${numId}.mp3`);
      
      const buffer = await generateTTS(text);
      fs.writeFileSync(filePath, buffer);
      success++;
      
      // Update mapping
      manifest.mapping[entry.id] = numId;
      
      // Save manifest every 50 files (less frequent)
      if (success % 50 === 0 || i === missing.length - 1) {
        manifest.totalFiles = Object.keys(manifest.mapping).length;
        manifest.generatedAt = new Date().toISOString();
        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
      }
      
      await new Promise(r => setTimeout(r, 200));
      currentNum++;
      
    } catch (error) {
      console.log(`\n  ❌ ${entry.id}: ${error.message}`);
      failed++;
      currentNum++;
    }
  }
  
  // Final manifest save
  manifest.totalFiles = Object.keys(manifest.mapping).length;
  manifest.generatedAt = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  
  const totalTime = formatTime(Date.now() - startTime);
  console.log(`\r  ✅ en_female: ${success} generated, ${failed} failed | Time: ${totalTime}`);
  
  return { generated: success, skipped: total - success - failed, failed, totalTime };
}

// ============================================================
// GENERATE MAPPING
// ============================================================

function generateAudioMapping(manifest) {
  const mappingPath = path.join(process.cwd(), 'lib', 'content', 'audio-num-mapping.json');
  
  const dir = path.dirname(mappingPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const reverseMapping = {};
  for (const [audioId, numId] of Object.entries(manifest.mapping)) {
    reverseMapping[numId] = audioId;
  }
  
  const mapping = {
    version: '2.0',
    generatedAt: manifest.generatedAt,
    voice: manifest.voice,
    voiceLabel: manifest.voiceLabel,
    totalFiles: manifest.totalFiles,
    audioToNum: manifest.mapping,
    numToAudio: reverseMapping
  };
  
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  LOG.info(`Audio mapping saved: ${mappingPath}`);
  
  return mapping;
}

// ============================================================
// PRINT STATS
// ============================================================

function printStats(entries) {
  console.log('\n📊 TEXT STATISTICS');
  console.log('──────────────────────────────────────────');
  
  const byType = {};
  const byCategory = {};
  
  for (const e of entries) {
    byType[e.type] = (byType[e.type] || 0) + 1;
    byCategory[e.category] = (byCategory[e.category] || 0) + 1;
  }
  
  console.log(`  Total entries: ${entries.length}`);
  console.log(`\n  By Type:`);
  for (const [type, count] of Object.entries(byType).sort()) {
    console.log(`    ${type}: ${count}`);
  }
  
  console.log(`\n  By Category:`);
  for (const [category, count] of Object.entries(byCategory).sort()) {
    console.log(`    ${category}: ${count}`);
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  LOG.section('🎵 GENERATE ENGLISH FEMALE AUDIO (NUMERIC IDs)');
  console.log(`Started: ${new Date().toISOString()}`);
  console.log(`  Voice: ${VOICE} (🎤 Young Female - Aria)`);
  console.log(`  Output: en_female/`);
  console.log(`  Format: 000001.mp3, 000002.mp3, ...`);
  console.log();
  
  // Check edge-tts
  try {
    await execAsync('edge-tts --version', { timeout: 5000 });
    LOG.success('Edge TTS is available');
  } catch {
    LOG.error('Edge TTS not found');
    console.log('   Install: npm install -g edge-tts');
    return;
  }
  console.log();
  
  // Load dictionary
  const dict = loadDictionary();
  if (!dict) return;
  
  // Collect texts
  LOG.info('Collecting texts from dictionary...');
  const entries = collectAllTexts(dict);
  
  if (entries.length === 0) {
    LOG.error('No texts found');
    return;
  }
  
  printStats(entries);
  console.log();
  
  // Generate audio
  LOG.section('🔊 GENERATING AUDIO');
  const result = await generateAudio(entries, EN_FEMALE_DIR);
  
  // Generate mapping
  if (fs.existsSync(MANIFEST_PATH)) {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    generateAudioMapping(manifest);
  }
  
  // Final summary
  LOG.section('📊 FINAL SUMMARY');
  console.log(`  Total entries: ${entries.length}`);
  console.log(`  Generated: ${result.generated}`);
  console.log(`  Skipped: ${result.skipped}`);
  console.log(`  Failed: ${result.failed}`);
  console.log(`  Total time: ${result.totalTime}`);
  
  // Count files
  if (fs.existsSync(EN_FEMALE_DIR)) {
    const files = fs.readdirSync(EN_FEMALE_DIR).filter(f => f.endsWith('.mp3'));
    console.log(`\n  Total MP3 files: ${files.length}`);
  }
  
  console.log('\n✅ Done!');
  console.log(`  Manifest: ${MANIFEST_PATH}`);
  console.log(`  Mapping: lib/content/audio-num-mapping.json`);
  console.log('\n💡 Next steps:');
  console.log('  1. Run: npm run sync-audio');
  console.log('  2. Test: npm run dev');
}

// ============================================================
// RUN
// ============================================================

main().catch(console.error);