// scripts/generate-ani-voice-multi.js
// Run: node scripts/generate-ani-voice-multi.js
//
// Հայերեն - WAV.AM (6 API Keys = 30,000 բառ)
// Numeric IDs (000001.mp3) - Սկսում է 002816-ից

const fs = require('fs');
const path = require('path');
const https = require('https');

// ============================================================
// CONFIG - 6 API KEYS (յուրաքանչյուրը 5000 բառ)
// ============================================================

const ACCOUNTS = [
  {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiIxNWIxMzczMzEyMTE0NjdmYTczZjNjYzY2MzcxN2MzYyIsInVzZXJuYW1lIjoiaGhvb3Z2dXUiLCJjb25uZWN0aW9uIjoiYXBpIiwiZXhwIjoxODA1MTU1MjAwLCJpYXQiOjE3ODUzMDMwODF9.jwMLMC6HDPAqSf2j0mHKRi_PnLTYbF9D4LLQ7DdWmBQ",
    projectId: '16344'
  },
  {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiIxYjc0YTc2NTFmNmQ0MTRiOTAzNTBmM2Y4NTlkMzYyMiIsInVzZXJuYW1lIjoiQW5pYWNoIiwiY29ubmVjdGlvbiI6ImFwaSIsImV4cCI6MTc5MjEwODgwMCwiaWF0IjoxNzg1MzE4NTA3fQ.8H5dB9KHORVqA140voXG3i1undIJaYYf3KVDi_NTzG8",
    projectId: '16355'
  },
  {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiI0OGE5YjhkNzVkYjY0OTlkYTVmYzVhYjE5MjdkNzEyMyIsInVzZXJuYW1lIjoiQWdhYnVodSIsImNvbm5lY3Rpb24iOiJhcGkiLCJleHAiOjE3OTU3Mzc2MDAsImlhdCI6MTc4NTMxODY0Mn0.9AIlLo5bjZ8R4sINaOQUuyVFhvWLj-JgNRure4F4dJ0",
    projectId: '16356'
  },
  {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiI0MmYzZGUyMjFiMTQ0NTRmYmUwNmQ3YTNhMmU3MDRjNSIsInVzZXJuYW1lIjoidG9tYWFhIiwiY29ubmVjdGlvbiI6ImFwaSIsImV4cCI6MTc4NTQ1NjAwMCwiaWF0IjoxNzg1MzE4Nzc2fQ.npnCKv1PZ3Q2BernkM-TzeKICZRkAuzfRIgMQ2hKPAw",
    projectId: '16357'
  }
];

const VOICE = 'Ani';
// ✅ ՄԻԱՅՆ ՍԱ Է ՓՈԽՎԵԼ
const START_FROM_NUM = 2816; // 002816-ից սկսել

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
  return unique;
}

// ============================================================
// WAV.AM API
// ============================================================

function generateWavAudio(word, token, projectId) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      project_id: projectId,
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
        'Authorization': token,
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
          
          const downloadUrl = `https://wav.am${result.path}`;
          
          https.get(downloadUrl, (audioRes) => {
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
// GENERATE AUDIO (START FROM 002816)
// ============================================================

async function generateAudio(entries, enMapping, accounts) {
  if (!enMapping) {
    console.error('❌ No English mapping found!');
    return null;
  }
  
  if (!fs.existsSync(HY_DIR)) {
    fs.mkdirSync(HY_DIR, { recursive: true });
    console.log(`📁 Created directory: hy_Ani`);
  }
  
  // ✅ Load existing manifest (ՉԵՆՔ ՋՆՋՈՒՄ)
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
    } catch (e) {}
  }
  
  // ✅ Միայն 002816-ից բարձր ֆայլեր
  const missing = [];
  const toSkip = [];
  
  for (const entry of entries) {
    const numId = enMapping[entry.audioId];
    if (!numId) continue;
    
    const num = parseInt(numId);
    if (num < START_FROM_NUM) {
      toSkip.push(entry);
      continue;
    }
    
    const filePath = path.join(HY_DIR, `${numId}.mp3`);
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
    console.log(`✅ All ${entries.length} files already exist!`);
    console.log(`   Skipped: ${toSkip.length} files (before ${String(START_FROM_NUM).padStart(6, '0')} or already exist)`);
    return { generated: 0, skipped: entries.length, failed: 0, manifest };
  }
  
  console.log(`\n🎯 ${missing.length} files to generate (${entries.length} total)`);
  console.log(`   Starting from: ${String(START_FROM_NUM).padStart(6, '0')}`);
  console.log(`   Voice: ${VOICE} (🎤 Armenian Female)`);
  console.log(`   Accounts: ${accounts.length} (${accounts.length * 5000} words total)`);
  console.log(`   Skipped: ${toSkip.length} files (already exist or before start)`);
  console.log(`   ✅ Manifest preserved (${manifest.totalFiles} existing entries)`);
  console.log(`   Output: hy_Ani/\n`);
  
  // ✅ Բաժանել ըստ հաշիվների
  const chunks = [];
  let currentIndex = 0;
  const limitPerAccount = 5000;
  
  for (let i = 0; i < accounts.length; i++) {
    const chunk = missing.slice(currentIndex, currentIndex + limitPerAccount);
    if (chunk.length > 0) {
      chunks.push({
        account: accounts[i],
        entries: chunk,
        accountIndex: i + 1
      });
      currentIndex += chunk.length;
    }
  }
  
  let totalSuccess = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  const startTimeAll = Date.now();
  
  for (const chunk of chunks) {
    console.log(`\n📢 Account ${chunk.accountIndex}/${chunks.length}`);
    console.log(`   Words: ${chunk.entries.length} / ${limitPerAccount}`);
    console.log(`   Token: ${chunk.account.token.substring(0, 20)}...`);
    console.log(`   Project ID: ${chunk.account.projectId}`);
    console.log();
    
    let success = 0;
    let failed = 0;
    const total = chunk.entries.length;
    const startTime = Date.now();
    
    for (let i = 0; i < chunk.entries.length; i++) {
      const entry = chunk.entries[i];
      const numId = entry.numId;
      const filePath = path.join(HY_DIR, `${numId}.mp3`);
      
      try {
        const done = i + 1;
        const pct = ((done / total) * 100).toFixed(1);
        const totalElapsed = ((Date.now() - startTimeAll) / 1000 / 60).toFixed(1);
        process.stdout.write(`\r  [${totalElapsed}m] ${done}/${total} (${pct}%) ✅ ${success} ❌ ${failed} | ${numId}.mp3`);
        
        const result = await generateWavAudio(entry.text, chunk.account.token, chunk.account.projectId);
        fs.writeFileSync(filePath, result.buffer);
        success++;
        
        manifest.mapping[entry.audioId] = numId;
        
        if ((success + failed) % 10 === 0 || i === chunk.entries.length - 1) {
          manifest.totalFiles = Object.keys(manifest.mapping).length;
          manifest.generatedAt = new Date().toISOString();
          fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
        }
        
        await new Promise(r => setTimeout(r, 500));
        
      } catch (error) {
        const errorMsg = error.message || '';
        if (errorMsg.includes('limit') || errorMsg.includes('quota') || errorMsg.includes('exceeded')) {
          console.log(`\n  ⚠️ Limit reached for Account ${chunk.accountIndex}!`);
          console.log(`  ✅ Auto-switching to next account...`);
          break;
        } else {
          console.log(`\n  ❌ ${entry.audioId} (${numId}): ${error.message}`);
          failed++;
        }
      }
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\r  ✅ Account ${chunk.accountIndex}: ${success} generated, ${failed} failed | Time: ${totalTime}s`);
    totalSuccess += success;
    totalFailed += failed;
    totalSkipped += chunk.entries.length - success - failed;
    
    if (success < chunk.entries.length) {
      console.log(`  ✅ Moving to next account...`);
    }
  }
  
  manifest.totalFiles = Object.keys(manifest.mapping).length;
  manifest.generatedAt = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  
  const totalTimeAll = ((Date.now() - startTimeAll) / 1000 / 60).toFixed(1);
  console.log(`\n  ✅ hy_Ani: ${totalSuccess} generated, ${totalSkipped} skipped, ${totalFailed} failed | Total: ${totalTimeAll}m`);
  console.log(`  📄 Manifest total entries: ${manifest.totalFiles}`);
  
  return { generated: totalSuccess, skipped: totalSkipped, failed: totalFailed, manifest };
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
  console.log('🎵 ARMENIAN AUDIO GENERATOR');
  console.log('===========================');
  console.log(`  Voice: ${VOICE} (🎤 Armenian Female)`);
  console.log(`  Format: Same numeric IDs as English`);
  console.log(`  Accounts: ${ACCOUNTS.length} (${ACCOUNTS.length * 5000} words)`);
  console.log(`  Starting from: ${String(START_FROM_NUM).padStart(6, '0')}`);
  console.log(`  Auto-switch: ✅ Yes`);
  console.log(`  Manifest: ✅ Preserved (not overwritten)`);
  console.log(`  Output: hy_Ani/`);
  console.log();
  
  const enMapping = loadEnglishMapping();
  if (!enMapping) {
    console.log('\n❌ Please generate English audio first:');
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
  
  const result = await generateAudio(entries, enMapping, ACCOUNTS);
  
  if (!result) {
    console.error('❌ Generation failed');
    return;
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