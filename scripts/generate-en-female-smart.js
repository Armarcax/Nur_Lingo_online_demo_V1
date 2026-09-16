// scripts/generate-en-female-smart.js
// Run: node scripts/generate-en-female-smart.js
//
// ԽԵԼԱՑԻ - Vocabulary (2,249) + Prompts (4,588) + Answers (4,588)
// Ընդհանուր՝ 11,425 ֆայլ
// Ժամանակը՝ ~20-25 րոպե (5 զուգահեռ)

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// ============================================================
// CONFIG
// ============================================================

const VOICE = 'en-US-AriaNeural';
const CONCURRENT = 5;
const SAVE_INTERVAL = 50;

const DICT_PATH = path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json');
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio', 'offline', 'en_female');
const MANIFEST_PATH = path.join(process.cwd(), 'public', 'audio', 'offline', 'manifest_en_female.json');

// ============================================================
// HELPERS
// ============================================================

function loadDictionary() {
  const content = fs.readFileSync(DICT_PATH, 'utf-8');
  return JSON.parse(content);
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function estimateTime(total, done, elapsedMs) {
  if (done === 0) return 'calculating...';
  const avg = elapsedMs / done;
  const remaining = (total - done) * avg;
  return formatTime(remaining);
}

// ============================================================
// TTS
// ============================================================

async function generateTTS(text) {
  const tempFile = path.join(process.cwd(), 'temp', `${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`);
  
  try {
    const cleanText = text
      .replace(/[“”"]/g, '"')
      .replace(/[‘’']/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    
    await execAsync(
      `edge-tts --voice "${VOICE}" --text "${cleanText.replace(/"/g, '\\"').replace(/\n/g, ' ')}" --write-media "${tempFile}"`,
      { timeout: 30000 }
    );
    
    if (!fs.existsSync(tempFile)) throw new Error('File not created');
    const stats = fs.statSync(tempFile);
    if (stats.size < 100) throw new Error('File too small');
    
    const buffer = fs.readFileSync(tempFile);
    fs.unlinkSync(tempFile);
    return buffer;
    
  } catch (error) {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    throw error;
  }
}

// ============================================================
// COLLECT SMART TEXTS
// ============================================================

function collectSmartTexts(dict) {
  const entries = [];
  const seen = new Set();
  const lessons = dict.lessons || [];
  
  for (const lesson of lessons) {
    const lessonId = lesson.id;
    
    // 1. ✅ Vocabulary - ՊԱՐՏԱԴԻՐ
    if (lesson.vocabulary && Array.isArray(lesson.vocabulary)) {
      for (const v of lesson.vocabulary) {
        if (v.id && v.en && v.en.trim() && !seen.has(v.id)) {
          seen.add(v.id);
          entries.push({
            id: v.id,
            text: v.en.trim(),
            type: 'vocabulary',
            lessonId: lessonId,
            priority: 1 // Բարձր
          });
        }
      }
    }
    
    // 2. ✅ Prompts - ԿԱՐԵՎՈՐ (հարցեր)
    if (lesson.exercises && Array.isArray(lesson.exercises)) {
      for (const ex of lesson.exercises) {
        const audioId = ex.audio?.id || ex.id;
        
        if (ex.prompt && ex.prompt.en && ex.prompt.en.trim()) {
          const key = `${audioId}_prompt`;
          if (!seen.has(key)) {
            seen.add(key);
            entries.push({
              id: key,
              text: ex.prompt.en.trim(),
              type: 'prompt',
              lessonId: lessonId,
              exerciseId: ex.id,
              priority: 2 // Միջին
            });
          }
        }
        
        // 3. ✅ Answers - ԿԱՐԵՎՈՐ (պատասխաններ)
        if (ex.correctAnswer && ex.correctAnswer.trim()) {
          const key = `${audioId}_answer`;
          if (!seen.has(key)) {
            seen.add(key);
            entries.push({
              id: key,
              text: ex.correctAnswer.trim(),
              type: 'answer',
              lessonId: lessonId,
              exerciseId: ex.id,
              priority: 2 // Միջին
            });
          }
        }
        
        // ❌ 4. Hints - կարելի է բաց թողնել
        // ❌ 5. Feedback - կարելի է բաց թողնել
      }
    }
  }
  
  return entries;
}

// ============================================================
// GENERATE
// ============================================================

async function generateSmart(entries) {
  // Create directory
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }
  
  // Load manifest
  let manifest = {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    voice: VOICE,
    voiceLabel: 'Aria (Young Female)',
    totalFiles: 0,
    mapping: {}
  };
  
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      const old = JSON.parse(content);
      if (old.mapping) {
        manifest.mapping = old.mapping || {};
        manifest.totalFiles = Object.keys(manifest.mapping).length;
      } else if (old.entries) {
        for (const [audioId, entry] of Object.entries(old.entries)) {
          const filename = entry.filename || '';
          const numId = filename.replace('.mp3', '');
          if (numId && !isNaN(parseInt(numId))) {
            manifest.mapping[audioId] = numId;
          }
        }
        manifest.totalFiles = Object.keys(manifest.mapping).length;
      }
    } catch (e) {}
  }
  
  // Find missing
  const missing = entries.filter(e => !manifest.mapping[e.id]);
  
  if (missing.length === 0) {
    console.log('✅ All files already exist!');
    return { generated: 0, failed: 0 };
  }
  
  // Sort by priority (vocabulary first)
  missing.sort((a, b) => (a.priority || 3) - (b.priority || 3));
  
  console.log(`\n🎯 ${missing.length} files to generate`);
  console.log(`   Voice: ${VOICE} (🎤 Young Female)`);
  console.log(`   Concurrent: ${CONCURRENT}`);
  
  // Calculate ETA
  const avgTimePerFile = 2.5; // seconds
  const totalTime = Math.ceil(missing.length * avgTimePerFile / CONCURRENT / 60);
  console.log(`   ETA: ~${totalTime} minutes`);
  console.log(`   Includes: Vocabulary + Prompts + Answers`);
  console.log(`   Skipped: Hints + Feedback (optional)\n`);
  
  let currentNum = 1;
  if (fs.existsSync(AUDIO_DIR)) {
    const files = fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith('.mp3'));
    const nums = files.map(f => parseInt(f.replace('.mp3', ''))).filter(n => !isNaN(n));
    if (nums.length > 0) currentNum = Math.max(...nums) + 1;
  }
  
  let success = 0;
  let failed = 0;
  const total = missing.length;
  const startTime = Date.now();
  
  // Process in batches
  for (let i = 0; i < missing.length; i += CONCURRENT) {
    const batch = missing.slice(i, i + CONCURRENT);
    const batchPromises = batch.map(async (entry, idx) => {
      const numId = String(currentNum + idx).padStart(6, '0');
      try {
        const buffer = await generateTTS(entry.text);
        fs.writeFileSync(path.join(AUDIO_DIR, `${numId}.mp3`), buffer);
        return { success: true, entry, numId };
      } catch (error) {
        return { success: false, entry, numId, error: error.message };
      }
    });
    
    const results = await Promise.all(batchPromises);
    
    for (const result of results) {
      if (result.success) {
        manifest.mapping[result.entry.id] = result.numId;
        success++;
      } else {
        console.log(`\n  ❌ ${result.entry.id}: ${result.error}`);
        failed++;
      }
    }
    
    currentNum += batch.length;
    
    // Progress
    const done = i + batch.length;
    const elapsed = Date.now() - startTime;
    const pct = ((done / total) * 100).toFixed(1);
    const eta = estimateTime(total, done, elapsed);
    
    process.stdout.write(`\r  [${formatTime(elapsed)}] ${done}/${total} (${pct}%) ETA: ${eta} | ✅ ${success} ❌ ${failed}`);
    
    if (done % SAVE_INTERVAL === 0 || done === total) {
      manifest.totalFiles = Object.keys(manifest.mapping).length;
      manifest.generatedAt = new Date().toISOString();
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    }
  }
  
  // Final save
  manifest.totalFiles = Object.keys(manifest.mapping).length;
  manifest.generatedAt = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  
  const totalTimeResult = formatTime(Date.now() - startTime);
  console.log(`\n\n✅ Done! ${success} generated, ${failed} failed | Time: ${totalTimeResult}`);
  
  return { generated: success, failed };
}

// ============================================================
// GENERATE MAPPING
// ============================================================

function generateMapping() {
  if (!fs.existsSync(MANIFEST_PATH)) return;
  
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const mappingPath = path.join(process.cwd(), 'lib', 'content', 'audio-num-mapping.json');
  
  const dir = path.dirname(mappingPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
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
  console.log(`📄 Mapping saved: ${mappingPath}`);
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🎵 SMART ENGLISH AUDIO GENERATOR');
  console.log('==================================');
  console.log(`  Voice: ${VOICE} (🎤 Young Female)`);
  console.log(`  Concurrent: ${CONCURRENT}`);
  console.log(`  Includes: Vocabulary + Prompts + Answers`);
  console.log(`  Skips: Hints + Feedback (reduce time)`);
  console.log(`  Output: en_female/\n`);
  
  // Check edge-tts
  try {
    await execAsync('edge-tts --version', { timeout: 5000 });
    console.log('✅ Edge TTS available\n');
  } catch {
    console.log('❌ Edge TTS not found. Install: npm install -g edge-tts');
    return;
  }
  
  // Load dictionary
  const dict = loadDictionary();
  console.log(`✅ Loaded dictionary v${dict.version}`);
  
  // Collect smart texts
  const entries = collectSmartTexts(dict);
  console.log(`📚 Found ${entries.length} files to generate`);
  
  // Show breakdown
  const byType = {};
  for (const e of entries) {
    byType[e.type] = (byType[e.type] || 0) + 1;
  }
  console.log(`   Breakdown:`);
  for (const [type, count] of Object.entries(byType).sort()) {
    console.log(`     ${type}: ${count}`);
  }
  console.log();
  
  // Generate
  const result = await generateSmart(entries);
  
  // Generate mapping
  generateMapping();
  
  // Summary
  console.log('\n📊 SUMMARY');
  console.log('──────────────────────────────────────────');
  console.log(`  Total files: ${entries.length}`);
  console.log(`  Generated: ${result.generated}`);
  console.log(`  Failed: ${result.failed}`);
  
  if (fs.existsSync(AUDIO_DIR)) {
    const files = fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith('.mp3'));
    console.log(`  Total MP3 files: ${files.length}`);
  }
  
  console.log('\n✅ Done!');
  console.log(`  Manifest: ${MANIFEST_PATH}`);
  console.log(`  Audio: ${AUDIO_DIR}`);
  console.log('\n💡 Next: npm run sync-audio');
}

// ============================================================
// RUN
// ============================================================

main().catch(console.error);