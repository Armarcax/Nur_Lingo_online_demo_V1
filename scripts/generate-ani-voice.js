// scripts/generate-ani-voice.js
// Run: node scripts/generate-ani-voice.js
//
// Հայերեն - WAV.AM - Շարունակել 5694-ից
// Numeric IDs (000001.mp3) - Պահպանել առկա manifest-ը

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

// ✅ START FROM 18893
const START_FROM_NUM = 24426;

const DICT_PATH = path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json');
const AUDIO_BASE_DIR = path.join(process.cwd(), 'public', 'audio', 'offline');
const HY_DIR = path.join(AUDIO_BASE_DIR, 'hy_Ani');
const MANIFEST_PATH = path.join(AUDIO_BASE_DIR, 'manifest_hy_ani.json');

// ============================================================
// LOAD ENGLISH MAPPING
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
      return data.mapping;
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
  if (!fs.existsSync(DICT_PATH)) {
    console.error(`❌ Dictionary not found: ${DICT_PATH}`);
    return null;
  }
  
  const content = fs.readFileSync(DICT_PATH, 'utf-8');
  const data = JSON.parse(content);
  
  const entries = [];
  const lessons = data.lessons || {};
  
  for (const [lessonId, lesson] of Object.entries(lessons)) {
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
  
  const seen = new Set();
  const unique = entries.filter(e => {
    if (seen.has(e.audioId)) return false;
    seen.add(e.audioId);
    return true;
  });
  
  console.log(`📚 Loaded ${unique.length} Armenian entries`);
  console.log(`   Using English audioIds (greet_hello, etc.)`);
  return unique;
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
// GENERATE AUDIO (START FROM 13731)
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
  
  // ✅ LOAD EXISTING MANIFEST (ՉԵՆՔ ՋՆՋՈՒՄ)
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
      const old = JSON.parse(content);
      if (old.mapping) {
        manifest.mapping = old.mapping;
        manifest.totalFiles = Object.keys(manifest.mapping).length;
        console.log(`📄 Loaded existing manifest: ${manifest.totalFiles} files`);
      }
    } catch (e) {
      console.log('⚠️ Failed to load manifest, creating new');
    }
  }
  
  // ✅ START FROM 5694
  const missing = [];
  const toSkip = [];
  
  for (const entry of entries) {
    const numId = enMapping[entry.audioId];
    if (!numId) {
      console.log(`⚠️ No English ID for: ${entry.audioId}`);
      continue;
    }
    
    const num = parseInt(numId);
    // ✅ Skip everything below 5694
    if (num < START_FROM_NUM) {
      toSkip.push(entry);
      continue;
    }
    
    const filePath = path.join(HY_DIR, `${numId}.mp3`);
    // ✅ Skip existing files (keep them)
    if (fs.existsSync(filePath) || manifest.mapping[entry.audioId]) {
      toSkip.push(entry);
    } else {
      missing.push({
        ...entry,
        numId: numId
      });
    }
  }
  
  if (missing.length === 0) {
    console.log(`✅ All files already exist!`);
    console.log(`   Skipped: ${toSkip.length} files (before ${String(START_FROM_NUM).padStart(6, '0')} or already exist)`);
    return { generated: 0, skipped: entries.length, failed: 0, manifest };
  }
  
  console.log(`\n🎯 ${missing.length} files to generate (${entries.length} total)`);
  console.log(`   Starting from: ${String(START_FROM_NUM).padStart(6, '0')}`);
  console.log(`   Voice: ${VOICE} (🎤 Armenian Female)`);
  console.log(`   Skipped: ${toSkip.length} files (before start or already exist)`);
  console.log(`   ✅ Manifest preserved (${manifest.totalFiles} existing entries)`);
  console.log(`   Output: hy_Ani/\n`);
  
  let success = 0;
  let failed = 0;
  let total = missing.length;
  const startTime = Date.now();
  
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE);
    
    for (let j = 0; j < batch.length; j++) {
      const entry = batch[j];
      const text = entry.text;
      const numId = entry.numId;
      const filePath = path.join(HY_DIR, `${numId}.mp3`);
      
      try {
        const done = i + j + 1;
        const pct = ((done / total) * 100).toFixed(1);
        const elapsedMin = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        
        process.stdout.write(`\r  [${elapsedMin}m] ${done}/${total} (${pct}%) ✅ ${success} ❌ ${failed} | ${numId}.mp3`);
        
        const result = await generateWavAudio(text);
        fs.writeFileSync(filePath, result.buffer);
        success++;
        
        manifest.mapping[entry.audioId] = numId;
        
        if (success % 5 === 0 || i + j === missing.length - 1) {
          manifest.totalFiles = Object.keys(manifest.mapping).length;
          manifest.generatedAt = new Date().toISOString();
          fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
        }
        
        await new Promise(r => setTimeout(r, 500));
        
      } catch (error) {
        console.log(`\n  ❌ ${entry.audioId} (${numId}): ${error.message}`);
        failed++;
      }
    }
    
    if (i + BATCH_SIZE < missing.length) {
      console.log(`\n  ⏳ Batch done, waiting...`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  manifest.totalFiles = Object.keys(manifest.mapping).length;
  manifest.generatedAt = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  
  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\r  ✅ hy_Ani: ${success} generated, ${failed} failed | Time: ${totalTime}m`);
  console.log(`  📄 Manifest total entries: ${manifest.totalFiles}`);
  
  return { generated: success, skipped: toSkip.length, failed, manifest };
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
  console.log('🎵 ARMENIAN AUDIO GENERATOR (CONTINUE FROM 5694)');
  console.log('==================================================');
  console.log(`  Voice: ${VOICE} (🎤 Armenian Female)`);
  console.log(`  Starting from: ${String(START_FROM_NUM).padStart(6, '0')}`);
  console.log(`  Output: hy_Ani/`);
  console.log(`  Manifest: ✅ Preserved (not overwritten)`);
  console.log(`  ⚠️  WAV.AM free limit: 5000 words`);
  console.log();
  
  const enMapping = loadEnglishMapping();
  if (!enMapping) {
    console.log('\n❌ Please generate English audio first:');
    console.log('   node scripts/generate-en-female-full.js');
    return;
  }
  console.log();
  
  const entries = loadDictionary();
  if (!entries || entries.length === 0) {
    console.error('❌ No Armenian entries found');
    return;
  }
  
  printStats(entries);
  console.log();
  
  console.log('🔑 Checking WAV.AM token...');
  if (!WAV_ACCESS_TOKEN || WAV_ACCESS_TOKEN.length < 10) {
    console.error('❌ Invalid WAV.AM token!');
    console.log('💡 Please update WAV_ACCESS_TOKEN in the script');
    return;
  }
  console.log('✅ Token loaded');
  console.log();
  
  const result = await generateAudio(entries, enMapping);
  
  if (!result) {
    console.error('❌ Generation failed');
    return;
  }
  
  if (result.manifest) {
    verifyMapping(enMapping, result.manifest);
  }
  
  console.log('\n📊 FINAL SUMMARY');
  console.log('──────────────────────────────────────────');
  console.log(`  Total Armenian entries: ${entries.length}`);
  console.log(`  Generated: ${result.generated}`);
  console.log(`  Skipped: ${result.skipped}`);
  console.log(`  Failed: ${result.failed}`);
  console.log(`  Manifest entries: ${result.manifest.totalFiles}`);
  
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