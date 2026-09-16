// scripts/generate-voiser-hy-full.js
// Run: node scripts/generate-voiser-hy-full.js
//
// Հայերեն աուդիո Voiser.ai-ով (Anahit - կանացի ձայն)
// Համարակալումով (000001.mp3) + Manifest + Mapping

const fs = require('fs');
const path = require('path');
const https = require('https');

// ============================================================
// CONFIG
// ============================================================

const API_KEY = 'VOI51d1d6516aba707e092adcc00459360a1a7e5363c18b16d9';
const VOICE_ID = 'anahit';  // 🎤 Կանացի հայերեն ձայն
// const VOICE_ID = 'hayk'; // 🎤 Տղամարդու հայերեն ձայն

const API_URL = 'https://api.voiser.ai/v1/text-to-speech';
const DICT_PATH = path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json');
const AUDIO_BASE_DIR = path.join(process.cwd(), 'public', 'audio', 'offline');
const HY_DIR = path.join(AUDIO_BASE_DIR, 'hy_Ani');
const MANIFEST_PATH = path.join(AUDIO_BASE_DIR, 'manifest_hy_ani.json');
const MAPPING_PATH = path.join(process.cwd(), 'src', 'lib', 'content', 'mappings', 'audio-num-hy-mapping.json');

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
// LOAD DICTIONARY
// ============================================================

function loadDictionary() {
  const content = fs.readFileSync(DICT_PATH, 'utf-8');
  return JSON.parse(content);
}

// ============================================================
// COLLECT ARMENIAN TEXTS
// ============================================================

function collectArmenianTexts(dict) {
  const entries = [];
  const seen = new Set();
  const lessons = dict.lessons || {};
  
  for (const [lessonId, lesson] of Object.entries(lessons)) {
    // Vocabulary
    if (lesson.vocabulary && Array.isArray(lesson.vocabulary)) {
      for (const v of lesson.vocabulary) {
        if (v.id && v.hy && v.hy.trim() && !seen.has(v.id)) {
          seen.add(v.id);
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
          const audioId = `${baseId}_prompt`;
          if (!seen.has(audioId)) {
            seen.add(audioId);
            entries.push({
              audioId: audioId,
              text: exercise.prompt.hy.trim(),
              type: 'prompt',
              lessonId
            });
          }
        }
        
        if (exercise.correctAnswer && exercise.correctAnswer.trim()) {
          const audioId = `${baseId}_answer`;
          if (!seen.has(audioId)) {
            seen.add(audioId);
            entries.push({
              audioId: audioId,
              text: exercise.correctAnswer.trim(),
              type: 'answer',
              lessonId
            });
          }
        }
        
        if (exercise.hint && exercise.hint.hy && exercise.hint.hy.trim()) {
          const audioId = `${baseId}_hint`;
          if (!seen.has(audioId)) {
            seen.add(audioId);
            entries.push({
              audioId: audioId,
              text: exercise.hint.hy.trim(),
              type: 'hint',
              lessonId
            });
          }
        }
        
        if (exercise.feedback && exercise.feedback.correct && exercise.feedback.correct.hy && exercise.feedback.correct.hy.trim()) {
          const audioId = `${baseId}_feedback_correct`;
          if (!seen.has(audioId)) {
            seen.add(audioId);
            entries.push({
              audioId: audioId,
              text: exercise.feedback.correct.hy.trim(),
              type: 'feedback_correct',
              lessonId
            });
          }
        }
        
        if (exercise.feedback && exercise.feedback.incorrect && exercise.feedback.incorrect.hy && exercise.feedback.incorrect.hy.trim()) {
          const audioId = `${baseId}_feedback_incorrect`;
          if (!seen.has(audioId)) {
            seen.add(audioId);
            entries.push({
              audioId: audioId,
              text: exercise.feedback.incorrect.hy.trim(),
              type: 'feedback_incorrect',
              lessonId
            });
          }
        }
      }
    }
  }
  
  console.log(`📚 Loaded ${entries.length} Armenian entries`);
  return entries;
}

// ============================================================
// GENERATE AUDIO WITH VOISER
// ============================================================

function generateVoiserAudio(text) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: text,
      voice_id: VOICE_ID,
      speed: 1.0,
      pitch: 0,
      style: '',
      instruction: ''
    });

    const options = {
      hostname: 'api.voiser.ai',
      path: '/v1/text-to-speech',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.file) {
            // Download the audio file
            https.get(result.file, (audioRes) => {
              const chunks = [];
              audioRes.on('data', (chunk) => { chunks.push(chunk); });
              audioRes.on('end', () => {
                resolve({
                  buffer: Buffer.concat(chunks),
                  duration: result.file_duration || 0
                });
              });
              audioRes.on('error', reject);
            }).on('error', reject);
          } else {
            reject(new Error('No file URL in response: ' + JSON.stringify(result)));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
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
  
  if (!fs.existsSync(HY_DIR)) {
    fs.mkdirSync(HY_DIR, { recursive: true });
    console.log(`📁 Created directory: hy_Ani`);
  }
  
  // Load existing manifest
  let manifest = {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    voice: VOICE_ID,
    voiceLabel: 'Anahit (Armenian Female)',
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
        console.log(`📄 Loaded existing manifest: ${manifest.totalFiles} files`);
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
    const filePath = path.join(HY_DIR, fileName);
    
    if (fs.existsSync(filePath) || manifest.mapping[entry.audioId]) {
      toSkip.push(entry);
    } else {
      missing.push({
        ...entry,
        numId: numId  // ✅ Same ID as English
      });
    }
  }
  
  if (missing.length === 0) {
    console.log(`✅ All ${entries.length} files already exist!`);
    return { generated: 0, skipped: entries.length, failed: 0, manifest };
  }
  
  console.log(`\n🎯 ${missing.length} files to generate (${entries.length} total)`);
  console.log(`   Voice: ${VOICE_ID} (🎤 Armenian Female)`);
  console.log(`   Format: Same IDs as English (000001.mp3, ...)`);
  console.log(`   Skipped: ${toSkip.length} files (already exist)`);
  console.log(`   Rate Limit: 1 request/minute`);
  console.log(`   Output: hy_Ani/\n`);
  
  let success = 0;
  let failed = 0;
  let total = missing.length;
  
  const startTime = Date.now();
  
  for (let i = 0; i < missing.length; i++) {
    const entry = missing[i];
    const text = entry.text;
    const numId = entry.numId;
    const fileName = `${numId}.mp3`;
    const filePath = path.join(HY_DIR, fileName);
    
    try {
      const done = i + 1;
      const pct = ((done / total) * 100).toFixed(1);
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const eta = Math.ceil((total - done) * 60 / 60); // minutes
      
      process.stdout.write(`\r  hy_Ani: ${done}/${total} (${pct}%) ✅ ${success} ❌ ${failed} | ${numId}.mp3 | ETA: ~${eta}m`);
      
      const result = await generateVoiserAudio(text);
      fs.writeFileSync(filePath, result.buffer);
      success++;
      
      // Update mapping
      manifest.mapping[entry.audioId] = numId;
      
      // Save manifest every 5 files
      if (success % 5 === 0 || i === missing.length - 1) {
        manifest.totalFiles = Object.keys(manifest.mapping).length;
        manifest.generatedAt = new Date().toISOString();
        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
        
        // Also save mapping
        saveMapping(manifest);
      }
      
      // Rate limiting - 1 request per minute
      if (i < missing.length - 1) {
        await new Promise(r => setTimeout(r, 60000));
      }
      
    } catch (error) {
      console.log(`\n  ❌ ${entry.audioId} (${numId}): ${error.message}`);
      failed++;
      
      // Even on error, wait before next request
      if (i < missing.length - 1) {
        await new Promise(r => setTimeout(r, 60000));
      }
    }
  }
  
  // Final save
  manifest.totalFiles = Object.keys(manifest.mapping).length;
  manifest.generatedAt = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  
  // Save mapping
  saveMapping(manifest);
  
  const totalTime = Math.floor((Date.now() - startTime) / 1000 / 60);
  console.log(`\r  ✅ hy_Ani: ${success} generated, ${failed} failed | Time: ~${totalTime}m`);
  
  return { generated: success, skipped: toSkip.length, failed, manifest };
}

// ============================================================
// SAVE MAPPING
// ============================================================

function saveMapping(manifest) {
  const dir = path.dirname(MAPPING_PATH);
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
  
  fs.writeFileSync(MAPPING_PATH, JSON.stringify(mapping, null, 2));
  console.log(`📄 Mapping saved: ${MAPPING_PATH}`);
  console.log(`   audioToNum: ${Object.keys(mapping.audioToNum).length} entries`);
  console.log(`   numToAudio: ${Object.keys(mapping.numToAudio).length} entries`);
}

// ============================================================
// VERIFY MAPPING
// ============================================================

function verifyMapping(enMapping, hyManifest) {
  console.log('\n📊 VERIFICATION');
  console.log('──────────────────────────────────────────');
  
  const enKeys = Object.keys(enMapping);
  const hyKeys = Object.keys(hyManifest.mapping);
  
  const missingInHy = enKeys.filter(k => !hyKeys.includes(k));
  const common = enKeys.filter(k => hyKeys.includes(k));
  
  console.log(`  English entries: ${enKeys.length}`);
  console.log(`  Armenian entries: ${hyKeys.length}`);
  console.log(`  Common entries: ${common.length}`);
  
  if (missingInHy.length > 0) {
    console.log(`  ⚠️ Missing in Armenian: ${missingInHy.length} entries`);
    if (missingInHy.length <= 10) {
      for (const key of missingInHy) {
        console.log(`    - ${key}`);
      }
    }
  }
  
  // Check if IDs match
  let mismatch = 0;
  for (const key of common) {
    if (enMapping[key] !== hyManifest.mapping[key]) {
      mismatch++;
    }
  }
  
  if (mismatch === 0) {
    console.log(`  ✅ All IDs match between English and Armenian!`);
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
  console.log('🎵 ARMENIAN AUDIO GENERATOR (Voiser.ai)');
  console.log('=========================================');
  console.log(`  Voice: ${VOICE_ID} (🎤 Armenian Female)`);
  console.log(`  Format: Same numeric IDs as English`);
  console.log(`  Audio IDs: English (greet_hello, greet_hi, ...)`);
  console.log(`  Output: hy_Ani/`);
  console.log(`  Rate Limit: 1 request/minute`);
  console.log(`  ETA: ~${Math.ceil(20601 / 60)} hours (${Math.ceil(20601 / 60 / 60)} days)`);
  console.log();
  
  // Load English mapping (same IDs)
  const enMapping = loadEnglishMapping();
  if (!enMapping) {
    console.log('\n❌ Please generate English audio first:');
    console.log('   node scripts/generate-en-female-full.js');
    return;
  }
  console.log();
  
  // Load dictionary
  const dict = loadDictionary();
  console.log(`✅ Loaded dictionary v${dict.version}`);
  
  // Collect texts
  const entries = collectArmenianTexts(dict);
  if (entries.length === 0) {
    console.error('❌ No Armenian entries found');
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
  console.log(`  Total Armenian entries: ${entries.length}`);
  console.log(`  Generated: ${result.generated}`);
  console.log(`  Skipped: ${result.skipped}`);
  console.log(`  Failed: ${result.failed}`);
  
  if (fs.existsSync(HY_DIR)) {
    const files = fs.readdirSync(HY_DIR).filter(f => f.endsWith('.mp3'));
    console.log(`  Total MP3 files: ${files.length}`);
  }
  
  if (result.manifest) {
    console.log(`  Mapped entries: ${Object.keys(result.manifest.mapping).length}`);
  }
  
  console.log('\n✅ Done!');
  console.log(`  Manifest: ${MANIFEST_PATH}`);
  console.log(`  Mapping: ${MAPPING_PATH}`);
  console.log(`  Audio: ${HY_DIR}`);
  console.log('\n💡 Next: npm run sync-audio');
}

// ============================================================
// RUN
// ============================================================

main().catch(console.error);