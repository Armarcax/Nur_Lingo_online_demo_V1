// scripts/generate-en-female-full.js
// Run: node scripts/generate-en-female-full.js
//
// ՇԱՐՈՒՆԱԿԵԼ - Սկսել 013581-ից

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// ============================================================
// CONFIG
// ============================================================

const VOICE = 'en-US-AriaNeural';
const CONCURRENT = 10;
const SAVE_INTERVAL = 100;

const DICT_PATH = path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json');
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio', 'offline', 'en_female');
const MANIFEST_PATH = path.join(process.cwd(), 'public', 'audio', 'offline', 'manifest_en_female.json');
const MAPPING_PATH = path.join(process.cwd(), 'lib', 'content', 'audio-num-mapping.json');

// ============================================================
// LOAD EXISTING MANIFEST
// ============================================================

function loadExistingManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.log('⚠️ No existing manifest found, starting from 000001');
    return null;
  }
  
  try {
    const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    const data = JSON.parse(content);
    if (data.mapping) {
      console.log(`📄 Loaded manifest: ${Object.keys(data.mapping).length} files`);
      return data;
    }
  } catch (e) {
    console.log('⚠️ Failed to load manifest');
  }
  return null;
}

// ============================================================
// HELPERS
// ============================================================

function loadDictionary() {
  const content = fs.readFileSync(DICT_PATH, 'utf-8');
  return JSON.parse(content);
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
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
// COLLECT ALL TEXTS
// ============================================================

function collectAllTexts(dict) {
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
// GENERATE CONTINUING FROM SPECIFIC NUMBER
// ============================================================

async function generateAll(entries, existingManifest) {
  // Create directory
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }
  
  // Start with existing manifest or create new
  let manifest = existingManifest || {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    voice: VOICE,
    voiceLabel: 'Aria (Young Female)',
    totalFiles: 0,
    mapping: {}
  };
  
  // ✅ Find the highest number in existing mapping
  let startNum = 1;
  if (manifest.mapping && Object.keys(manifest.mapping).length > 0) {
    const nums = Object.values(manifest.mapping)
      .map(n => parseInt(n))
      .filter(n => !isNaN(n));
    
    if (nums.length > 0) {
      startNum = Math.max(...nums) + 1;
    }
  }
  
  // ✅ Also check files on disk
  if (fs.existsSync(AUDIO_DIR)) {
    const files = fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith('.mp3'));
    for (const f of files) {
      const num = parseInt(f.replace('.mp3', ''));
      if (!isNaN(num) && num >= startNum) {
        startNum = num + 1;
      }
    }
  }
  
  // ✅ Find entries that need generation (not in manifest)
  const missing = entries.filter(e => !manifest.mapping[e.audioId]);
  
  if (missing.length === 0) {
    console.log('✅ All files already exist!');
    return { generated: 0, failed: 0, manifest };
  }
  
  console.log(`\n📌 CONTINUING FROM: ${String(startNum).padStart(6, '0')}`);
  console.log(`🎯 ${missing.length} files to generate (${entries.length} total)`);
  console.log(`   Voice: ${VOICE} (🎤 Young Female)`);
  console.log(`   Concurrent: ${CONCURRENT}`);
  
  const avgTimePerFile = 1.2;
  const totalMin = Math.ceil(missing.length * avgTimePerFile / CONCURRENT / 60);
  console.log(`   ETA: ~${totalMin} minutes\n`);
  
  // Group by type
  const byType = {};
  for (const e of missing) {
    byType[e.type] = (byType[e.type] || 0) + 1;
  }
  console.log('  Breakdown:');
  for (const [type, count] of Object.entries(byType).sort()) {
    console.log(`    ${type}: ${count}`);
  }
  console.log();
  
  let success = 0;
  let failed = 0;
  const total = missing.length;
  const startTime = Date.now();
  let currentNum = startNum;
  
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
    const elapsed = Date.now() - startTime;
    const pct = ((done / total) * 100).toFixed(1);
    const eta = estimateTime(total, done, elapsed);
    
    process.stdout.write(`\r  [${formatTime(elapsed)}] ${done}/${total} (${pct}%) ETA: ${eta} | ✅ ${success} ❌ ${failed} | Next: ${String(currentNum).padStart(6, '0')}`);
    
    // Save manifest periodically
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
  
  const totalTime = formatTime(Date.now() - startTime);
  console.log(`\n\n✅ Done! ${success} generated, ${failed} failed | Time: ${totalTime}`);
  console.log(`📌 Total files: ${manifest.totalFiles}`);
  
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
    audioToNum: manifest.mapping,
    numToAudio: reverseMapping
  };
  
  fs.writeFileSync(MAPPING_PATH, JSON.stringify(mapping, null, 2));
  console.log(`\n📄 Mapping saved: ${MAPPING_PATH}`);
  console.log(`   audioToNum: ${Object.keys(mapping.audioToNum).length} entries`);
  console.log(`   numToAudio: ${Object.keys(mapping.numToAudio).length} entries`);
}

// ============================================================
// GENERATE AUDIO-MAPPING.TS
// ============================================================

function generateAudioMappingTs(manifest) {
  const tsPath = path.join(process.cwd(), 'lib', 'content', 'audio-mapping.ts');
  
  const content = `// lib/content/audio-mapping.ts
// ⚠️ ԱՎՏՈՄԱՏ ԳԵՆԵՐԱՑՎԱԾ ՖԱՅԼ - ՄԻ ԽՄԲԱԳՐԵԼ ՁԵՌՔՈՎ
// Վերջին թարմացում: ${new Date().toISOString()}

import mappingData from './audio-num-mapping.json';

export interface AudioMapping {
  version: string;
  generatedAt: string;
  voice: string;
  voiceLabel: string;
  totalFiles: number;
  audioToNum: Record<string, string>;
  numToAudio: Record<string, string>;
}

const mapping: AudioMapping = mappingData as AudioMapping;

export function getNumId(audioId: string): string | null {
  return mapping.audioToNum[audioId] || null;
}

export function getAudioId(numId: string): string | null {
  return mapping.numToAudio[numId] || null;
}

export function getAudioPath(
  audioId: string,
  language: 'en' | 'hy' | 'ru',
  gender: 'male' | 'female'
): string | null {
  const numId = getNumId(audioId);
  if (!numId) return null;
  
  const folderMap = {
    en: { male: 'en_male', female: 'en_female' },
    hy: { male: 'hy_Areg', female: 'hy_Ani' },
    ru: { male: 'ru_male', female: 'ru_female' }
  };
  
  const folder = folderMap[language]?.[gender];
  if (!folder) return null;
  
  return \`/audio/offline/\${folder}/\${numId}.mp3\`;
}

export function hasAudioFile(
  audioId: string,
  language: 'en' | 'hy' | 'ru',
  gender: 'male' | 'female'
): boolean {
  return getAudioPath(audioId, language, gender) !== null;
}

export function getMapping(): AudioMapping {
  return mapping;
}

export function getStats() {
  return {
    totalFiles: mapping.totalFiles,
    voice: mapping.voice,
    voiceLabel: mapping.voiceLabel,
    version: mapping.version,
    generatedAt: mapping.generatedAt
  };
}

export default {
  getNumId,
  getAudioId,
  getAudioPath,
  hasAudioFile,
  getMapping,
  getStats
};
`;
  
  fs.writeFileSync(tsPath, content);
  console.log(`📄 audio-mapping.ts generated: ${tsPath}`);
}

// ============================================================
// PRINT SUMMARY
// ============================================================

function printSummary(entries, manifest) {
  console.log('\n📊 FINAL SUMMARY');
  console.log('──────────────────────────────────────────');
  
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
  
  // Show sample
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
  console.log('🎵 FULL AUDIO GENERATOR (CONTINUE FROM LAST)');
  console.log('==============================================');
  console.log(`  Voice: ${VOICE} (🎤 Young Female)`);
  console.log(`  Concurrent: ${CONCURRENT}`);
  console.log(`  Output: en_female/`);
  console.log();
  
  // Check edge-tts
  try {
    await execAsync('edge-tts --version', { timeout: 5000 });
    console.log('✅ Edge TTS available\n');
  } catch {
    console.log('❌ Edge TTS not found');
    return;
  }
  
  // Load existing manifest
  const existingManifest = loadExistingManifest();
  
  // Load dictionary
  const dict = loadDictionary();
  console.log(`✅ Loaded dictionary v${dict.version}`);
  
  // Collect all texts
  const entries = collectAllTexts(dict);
  console.log(`📚 Found ${entries.length} entries with audio IDs\n`);
  
  // Generate all (will continue from where it stopped)
  const result = await generateAll(entries, existingManifest);
  
  // Save mapping
  if (result.manifest) {
    saveMapping(result.manifest);
    generateAudioMappingTs(result.manifest);
  }
  
  // Summary
  printSummary(entries, result.manifest);
  
  console.log('\n✅ Done!');
  console.log(`  Manifest: ${MANIFEST_PATH}`);
  console.log(`  Mapping: ${MAPPING_PATH}`);
  console.log(`  Audio: ${AUDIO_DIR}`);
  console.log('\n💡 Next: npm run sync-audio');
}

// ============================================================
// RUN
// ============================================================

main().catch(console.error);