// scripts/generate-en-female-with-manifest.js
// Run: node scripts/generate-en-female-with-manifest.js
//
// Գեներացնում է աուդիո և ստեղծում MANIFEST կապով

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

const DICT_PATH = path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json');
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio', 'offline', 'en_female');
const MANIFEST_PATH = path.join(process.cwd(), 'public', 'audio', 'offline', 'manifest_en_female.json');
const MAPPING_PATH = path.join(process.cwd(), 'lib', 'content', 'audio-num-mapping.json');

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
// COLLECT ALL WITH AUDIO IDS
// ============================================================

function collectAllWithIds(dict) {
  const entries = [];
  const seen = new Set();
  const lessons = dict.lessons || [];
  
  for (const lesson of lessons) {
    const lessonId = lesson.id;
    
    // 1. Vocabulary
    if (lesson.vocabulary && Array.isArray(lesson.vocabulary)) {
      for (const v of lesson.vocabulary) {
        if (v.id && v.en && v.en.trim() && !seen.has(v.id)) {
          seen.add(v.id);
          entries.push({
            audioId: v.id,
            text: v.en.trim(),
            type: 'vocabulary',
            lessonId: lessonId,
            category: 'word'
          });
        }
      }
    }
    
    // 2. Exercises
    if (lesson.exercises && Array.isArray(lesson.exercises)) {
      for (const ex of lesson.exercises) {
        const baseId = ex.audio?.id || ex.id;
        
        // Prompt
        if (ex.prompt && ex.prompt.en && ex.prompt.en.trim()) {
          const audioId = `${baseId}_prompt`;
          if (!seen.has(audioId)) {
            seen.add(audioId);
            entries.push({
              audioId: audioId,
              text: ex.prompt.en.trim(),
              type: 'prompt',
              lessonId: lessonId,
              exerciseId: ex.id,
              category: 'question'
            });
          }
        }
        
        // Answer
        if (ex.correctAnswer && ex.correctAnswer.trim()) {
          const audioId = `${baseId}_answer`;
          if (!seen.has(audioId)) {
            seen.add(audioId);
            entries.push({
              audioId: audioId,
              text: ex.correctAnswer.trim(),
              type: 'answer',
              lessonId: lessonId,
              exerciseId: ex.id,
              category: 'answer'
            });
          }
        }
        
        // Hint (optional)
        if (ex.hint && ex.hint.en && ex.hint.en.trim()) {
          const audioId = `${baseId}_hint`;
          if (!seen.has(audioId)) {
            seen.add(audioId);
            entries.push({
              audioId: audioId,
              text: ex.hint.en.trim(),
              type: 'hint',
              lessonId: lessonId,
              exerciseId: ex.id,
              category: 'hint'
            });
          }
        }
        
        // Feedback correct (optional)
        if (ex.feedback && ex.feedback.correct && ex.feedback.correct.en && ex.feedback.correct.en.trim()) {
          const audioId = `${baseId}_feedback_correct`;
          if (!seen.has(audioId)) {
            seen.add(audioId);
            entries.push({
              audioId: audioId,
              text: ex.feedback.correct.en.trim(),
              type: 'feedback_correct',
              lessonId: lessonId,
              exerciseId: ex.id,
              category: 'feedback'
            });
          }
        }
        
        // Feedback incorrect (optional)
        if (ex.feedback && ex.feedback.incorrect && ex.feedback.incorrect.en && ex.feedback.incorrect.en.trim()) {
          const audioId = `${baseId}_feedback_incorrect`;
          if (!seen.has(audioId)) {
            seen.add(audioId);
            entries.push({
              audioId: audioId,
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
// GENERATE WITH MANIFEST
// ============================================================

async function generateWithManifest(entries) {
  // Create directory
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }
  
  // Load existing manifest
  let manifest = {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    voice: VOICE,
    voiceLabel: 'Aria (Young Female)',
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
        console.log(`📄 Loaded manifest: ${manifest.totalFiles} files`);
      }
    } catch (e) {}
  }
  
  // Find missing
  const missing = entries.filter(e => !manifest.mapping[e.audioId]);
  
  if (missing.length === 0) {
    console.log('✅ All files already exist!');
    return { generated: 0, failed: 0, manifest };
  }
  
  console.log(`\n🎯 ${missing.length} files to generate`);
  console.log(`   Voice: ${VOICE} (🎤 Young Female)`);
  console.log(`   Concurrent: ${CONCURRENT}\n`);
  
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
        manifest.mapping[result.entry.audioId] = result.numId;
        success++;
      } else {
        console.log(`\n  ❌ ${result.entry.audioId}: ${result.error}`);
        failed++;
      }
    }
    
    currentNum += batch.length;
    
    // Progress
    const done = i + batch.length;
    const pct = ((done / total) * 100).toFixed(1);
    const elapsed = formatTime(Date.now() - startTime);
    process.stdout.write(`\r  ${done}/${total} (${pct}%) ✅ ${success} ❌ ${failed} | ${elapsed}`);
    
    // Save manifest
    if (done % 50 === 0 || done === total) {
      manifest.totalFiles = Object.keys(manifest.mapping).length;
      manifest.generatedAt = new Date().toISOString();
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    }
  }
  
  // Final save
  manifest.totalFiles = Object.keys(manifest.mapping).length;
  manifest.generatedAt = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  
  const totalTime = formatTime(Date.now() - startTime);
  console.log(`\n\n✅ Done! ${success} generated, ${failed} failed | Time: ${totalTime}`);
  
  return { generated: success, failed, manifest };
}

// ============================================================
// SAVE MAPPING
// ============================================================

function saveMapping(manifest) {
  const dir = path.dirname(MAPPING_PATH);
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
    audioToNum: manifest.mapping,      // audioId → numId
    numToAudio: reverseMapping         // numId → audioId
  };
  
  fs.writeFileSync(MAPPING_PATH, JSON.stringify(mapping, null, 2));
  console.log(`\n📄 Mapping saved: ${MAPPING_PATH}`);
  console.log(`   audioToNum: ${Object.keys(mapping.audioToNum).length} entries`);
  console.log(`   numToAudio: ${Object.keys(mapping.numToAudio).length} entries`);
}

// ============================================================
// PRINT SUMMARY
// ============================================================

function printSummary(entries, manifest) {
  console.log('\n📊 SUMMARY');
  console.log('──────────────────────────────────────────');
  
  // By type
  const byType = {};
  for (const e of entries) {
    byType[e.type] = (byType[e.type] || 0) + 1;
  }
  
  console.log('  Files by type:');
  for (const [type, count] of Object.entries(byType).sort()) {
    console.log(`    ${type}: ${count}`);
  }
  
  console.log(`\n  Total audio IDs: ${entries.length}`);
  console.log(`  Mapped files: ${manifest.totalFiles}`);
  console.log(`  Voice: ${manifest.voiceLabel}`);
  
  // Show sample mapping
  console.log('\n  Sample mapping (first 5):');
  const sample = Object.entries(manifest.mapping).slice(0, 5);
  for (const [audioId, numId] of sample) {
    console.log(`    ${audioId} → ${numId}.mp3`);
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🎵 GENERATE AUDIO WITH MANIFEST');
  console.log('=================================');
  console.log(`  Voice: ${VOICE} (🎤 Young Female)`);
  console.log(`  Output: en_female/`);
  console.log(`  Manifest: ${MANIFEST_PATH}`);
  console.log(`  Mapping: ${MAPPING_PATH}`);
  console.log();
  
  // Check edge-tts
  try {
    await execAsync('edge-tts --version', { timeout: 5000 });
    console.log('✅ Edge TTS available\n');
  } catch {
    console.log('❌ Edge TTS not found');
    return;
  }
  
  // Load dictionary
  const dict = loadDictionary();
  console.log(`✅ Loaded dictionary v${dict.version}`);
  
  // Collect all entries with audio IDs
  const entries = collectAllWithIds(dict);
  console.log(`📚 Found ${entries.length} entries with audio IDs\n`);
  
  // Show sample
  console.log('  Sample entries:');
  for (const e of entries.slice(0, 5)) {
    console.log(`    ${e.audioId}: "${e.text.substring(0, 30)}..." (${e.type})`);
  }
  console.log();
  
  // Generate
  const result = await generateWithManifest(entries);
  
  // Save mapping
  if (result.manifest) {
    saveMapping(result.manifest);
  }
  
  // Summary
  printSummary(entries, result.manifest);
  
  console.log('\n✅ Done!');
  console.log(`  Manifest: ${MANIFEST_PATH}`);
  console.log(`  Audio: ${AUDIO_DIR}`);
  console.log(`  Mapping: ${MAPPING_PATH}`);
  console.log('\n💡 How it works:');
  console.log('  1. Dictionary has audioId: "greet_hello"');
  console.log('  2. Manifest maps: "greet_hello" → "000001"');
  console.log('  3. App uses: getAudioPath("greet_hello") → "/en_female/000001.mp3"');
  console.log('\n💡 Next: npm run sync-audio');
}

// ============================================================
// RUN
// ============================================================

main().catch(console.error);