// scripts/generate-missing-hy-audio.js
// Run: node scripts/generate-missing-hy-audio.js
//
// Գտնում և գեներացնում է բացակայող 340 հայերեն աուդիո ֆայլերը

const fs = require('fs');
const path = require('path');
const https = require('https');

// ============================================================
// CONFIG
// ============================================================

const WAV_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiI3MWJiOGZiODI4YjU0ZTNiODdhYjhkYjRiYjMzMzQ2ZCIsInVzZXJuYW1lIjoidG9tYWFha2trIiwiY29ubmVjdGlvbiI6ImFwaSIsImV4cCI6MTc4Nzk2MTYwMCwiaWF0IjoxNzg1NTg1NTU0fQ.KgEfpTozHaDZjAiyHEzbdT5EpYjwajN2LGhvglqMJ_k";
const PROJECT_ID = '16477';
const BASE_URL = 'https://wav.am';
const VOICE = 'Ani';

const DICT_PATH = path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json');
const AUDIO_BASE_DIR = path.join(process.cwd(), 'public', 'audio', 'offline');
const HY_DIR = path.join(AUDIO_BASE_DIR, 'hy_Ani');
const MANIFEST_PATH = path.join(AUDIO_BASE_DIR, 'manifest_hy_ani.json');
const EN_MANIFEST_PATH = path.join(AUDIO_BASE_DIR, 'manifest_en_female.json');

// ============================================================
// LOAD ENGLISH MAPPING
// ============================================================

function loadEnglishMapping() {
  if (!fs.existsSync(EN_MANIFEST_PATH)) {
    console.error('❌ English manifest not found!');
    return null;
  }
  
  try {
    const content = fs.readFileSync(EN_MANIFEST_PATH, 'utf-8');
    const data = JSON.parse(content);
    if (data.mapping) {
      console.log(`📄 Loaded English mapping: ${Object.keys(data.mapping).length} entries`);
      return data.mapping;
    }
  } catch (e) {
    console.error('❌ Failed to load English manifest');
  }
  return null;
}

// ============================================================
// LOAD DICTIONARY - COLLECT ALL ARMENIAN TEXTS
// ============================================================

function loadDictionaryEntries() {
  if (!fs.existsSync(DICT_PATH)) {
    console.error(`❌ Dictionary not found: ${DICT_PATH}`);
    return null;
  }
  
  const content = fs.readFileSync(DICT_PATH, 'utf-8');
  const data = JSON.parse(content);
  
  const entries = [];
  const lessons = data.lessons || {};
  
  for (const [lessonId, lesson] of Object.entries(lessons)) {
    // Vocabulary
    if (lesson.vocabulary && Array.isArray(lesson.vocabulary)) {
      for (const v of lesson.vocabulary) {
        if (v.id && v.hy && v.hy.trim()) {
          entries.push({
            audioId: v.id,
            text: v.hy.trim(),
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
        
        if (exercise.prompt && exercise.prompt.hy && exercise.prompt.hy.trim()) {
          entries.push({
            audioId: `${baseId}_prompt`,
            text: exercise.prompt.hy.trim(),
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
        
        if (exercise.hint && exercise.hint.hy && exercise.hint.hy.trim()) {
          entries.push({
            audioId: `${baseId}_hint`,
            text: exercise.hint.hy.trim(),
            type: 'hint',
            lessonId
          });
        }
        
        if (exercise.feedback && exercise.feedback.correct && exercise.feedback.correct.hy && exercise.feedback.correct.hy.trim()) {
          entries.push({
            audioId: `${baseId}_feedback_correct`,
            text: exercise.feedback.correct.hy.trim(),
            type: 'feedback_correct',
            lessonId
          });
        }
        
        if (exercise.feedback && exercise.feedback.incorrect && exercise.feedback.incorrect.hy && exercise.feedback.incorrect.hy.trim()) {
          entries.push({
            audioId: `${baseId}_feedback_incorrect`,
            text: exercise.feedback.incorrect.hy.trim(),
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
  
  console.log(`📚 Loaded ${unique.length} Armenian entries from dictionary`);
  return unique;
}

// ============================================================
// FIND MISSING ENTRIES
// ============================================================

function findMissing(entries, enMapping, manifest) {
  const manifestKeys = Object.keys(manifest.mapping || {});
  const missing = [];
  const existing = [];
  
  for (const entry of entries) {
    const numId = enMapping[entry.audioId];
    if (!numId) {
      console.log(`⚠️ No English ID for: ${entry.audioId}`);
      continue;
    }
    
    // Check if in manifest
    if (manifestKeys.includes(entry.audioId)) {
      existing.push(entry);
    } else {
      missing.push({
        ...entry,
        numId: numId
      });
    }
  }
  
  console.log(`✅ Existing: ${existing.length}`);
  console.log(`❌ Missing: ${missing.length}`);
  
  return { missing, existing };
}

// ============================================================
// WAV.AM API
// ============================================================

function generateWavAudio(word) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      project_id: PROJECT_ID,
      text: word,
      voice: VOICE,
      format: 'mp3',
    });

    const options = {
      hostname: 'wav.am',
      path: '/generate_audio/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': WAV_ACCESS_TOKEN,
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.error) {
            reject(new Error(result.error));
            return;
          }
          
          const downloadUrl = `${BASE_URL}${result.path}`;
          
          https.get(downloadUrl, { headers: { 'Authorization': WAV_ACCESS_TOKEN } }, (audioRes) => {
            const chunks = [];
            audioRes.on('data', (chunk) => { chunks.push(chunk); });
            audioRes.on('end', () => {
              resolve({
                buffer: Buffer.concat(chunks),
                duration: result.duration || 0,
              });
            });
            audioRes.on('error', reject);
          }).on('error', reject);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ============================================================
// GENERATE MISSING
// ============================================================

async function generateMissing(missing, manifest) {
  if (missing.length === 0) {
    console.log('✅ No missing files to generate!');
    return { generated: 0, failed: 0 };
  }
  
  console.log(`\n🎯 ${missing.length} files to generate`);
  console.log(`   Voice: ${VOICE} (🎤 Armenian Female)`);
  console.log(`   Output: hy_Ani/\n`);
  
  // Find next available number
  let currentNum = 1;
  if (fs.existsSync(HY_DIR)) {
    const files = fs.readdirSync(HY_DIR).filter(f => f.endsWith('.mp3'));
    const nums = files.map(f => parseInt(f.replace('.mp3', ''))).filter(n => !isNaN(n));
    if (nums.length > 0) {
      currentNum = Math.max(...nums) + 1;
    }
  }
  
  // Also check manifest
  if (manifest.mapping) {
    const nums = Object.values(manifest.mapping)
      .map(n => parseInt(n))
      .filter(n => !isNaN(n));
    if (nums.length > 0) {
      const maxNum = Math.max(...nums);
      if (maxNum >= currentNum) {
        currentNum = maxNum + 1;
      }
    }
  }
  
  console.log(`📌 Starting from: ${String(currentNum).padStart(6, '0')}\n`);
  
  let success = 0;
  let failed = 0;
  const total = missing.length;
  const startTime = Date.now();
  
  for (let i = 0; i < missing.length; i++) {
    const entry = missing[i];
    const numId = String(currentNum).padStart(6, '0');
    const filePath = path.join(HY_DIR, `${numId}.mp3`);
    
    try {
      const done = i + 1;
      const pct = ((done / total) * 100).toFixed(1);
      const elapsedMin = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
      process.stdout.write(`\r  [${elapsedMin}m] ${done}/${total} (${pct}%) ✅ ${success} ❌ ${failed} | ${numId}.mp3`);
      
      const result = await generateWavAudio(entry.text);
      fs.writeFileSync(filePath, result.buffer);
      success++;
      
      // Update manifest
      manifest.mapping[entry.audioId] = numId;
      manifest.totalFiles = Object.keys(manifest.mapping).length;
      manifest.generatedAt = new Date().toISOString();
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
      
      currentNum++;
      await new Promise(r => setTimeout(r, 500));
      
    } catch (error) {
      console.log(`\n  ❌ ${entry.audioId}: ${error.message}`);
      failed++;
      currentNum++;
    }
  }
  
  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n\n✅ hy_Ani: ${success} generated, ${failed} failed | Time: ${totalTime}m`);
  
  return { generated: success, failed };
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🎵 GENERATE MISSING ARMENIAN AUDIO');
  console.log('====================================');
  console.log(`  Voice: ${VOICE} (🎤 Armenian Female)`);
  console.log(`  Output: hy_Ani/`);
  console.log(`  Manifest: ${MANIFEST_PATH}`);
  console.log();
  
  // 1. Load English mapping
  const enMapping = loadEnglishMapping();
  if (!enMapping) {
    console.error('❌ Failed to load English mapping');
    return;
  }
  
  // 2. Load dictionary entries
  const entries = loadDictionaryEntries();
  if (!entries || entries.length === 0) {
    console.error('❌ No entries found');
    return;
  }
  
  // 3. Load manifest
  let manifest = {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    voice: VOICE,
    voiceLabel: 'Ani (Armenian Female)',
    totalFiles: 0,
    mapping: {}
  };
  
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      manifest = JSON.parse(content);
      console.log(`📄 Loaded manifest: ${manifest.totalFiles} entries`);
    } catch (e) {
      console.log('⚠️ Failed to load manifest, creating new');
    }
  }
  
  // 4. Find missing
  const { missing, existing } = findMissing(entries, enMapping, manifest);
  
  if (missing.length === 0) {
    console.log('✅ All files are present!');
    return;
  }
  
  // Show sample of missing
  console.log('\n📝 Missing entries (first 20):');
  for (const entry of missing.slice(0, 20)) {
    console.log(`  - ${entry.audioId}: "${entry.text.substring(0, 30)}..." (${entry.type})`);
  }
  if (missing.length > 20) {
    console.log(`  ... and ${missing.length - 20} more`);
  }
  console.log();
  
  // 5. Create directory if not exists
  if (!fs.existsSync(HY_DIR)) {
    fs.mkdirSync(HY_DIR, { recursive: true });
    console.log(`📁 Created directory: hy_Ani`);
  }
  
  // 6. Generate missing
  const result = await generateMissing(missing, manifest);
  
  // 7. Final summary
  console.log('\n📊 FINAL SUMMARY');
  console.log('──────────────────────────────────────────');
  console.log(`  Missing entries: ${missing.length}`);
  console.log(`  Generated: ${result.generated}`);
  console.log(`  Failed: ${result.failed}`);
  console.log(`  Manifest entries: ${manifest.totalFiles}`);
  
  if (fs.existsSync(HY_DIR)) {
    const files = fs.readdirSync(HY_DIR).filter(f => f.endsWith('.mp3'));
    console.log(`  Total MP3 files: ${files.length}`);
  }
  
  console.log('\n✅ Done!');
  console.log(`  Manifest: ${MANIFEST_PATH}`);
  console.log(`  Audio: ${HY_DIR}`);
  console.log('\n💡 Next: npm run sync-audio');
}

// ============================================================
// RUN
// ============================================================

main().catch(console.error);