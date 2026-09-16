// scripts/generate-257-missing.js
// Run: node scripts/generate-257-missing.js

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
const HY_DIR = path.join(process.cwd(), 'public', 'audio', 'offline', 'hy_Ani');
const MANIFEST_PATH = path.join(process.cwd(), 'public', 'audio', 'offline', 'manifest_hy_ani.json');

// ============================================================
// LOAD MANIFEST AND FIND MISSING
// ============================================================

function findMissing() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const files = fs.readdirSync(HY_DIR).filter(f => f.endsWith('.mp3'));
  const fileNums = new Set(files.map(f => f.replace('.mp3', '')));
  
  const missing = [];
  for (const [audioId, numId] of Object.entries(manifest.mapping || {})) {
    if (!fileNums.has(numId)) {
      missing.push({ audioId, numId });
    }
  }
  return missing;
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
// GET TEXT FROM DICTIONARY
// ============================================================

function getText(audioId) {
  const dict = JSON.parse(fs.readFileSync(DICT_PATH, 'utf-8'));
  const lessons = dict.lessons || {};
  
  // Search in vocabulary and exercises
  for (const lesson of Object.values(lessons)) {
    // Vocabulary
    if (lesson.vocabulary) {
      for (const v of lesson.vocabulary) {
        if (v.id === audioId && v.hy) return v.hy;
      }
    }
    // Exercises
    if (lesson.exercises) {
      for (const ex of lesson.exercises) {
        const baseId = ex.audio?.id || ex.id;
        if (audioId === baseId && ex.prompt?.hy) return ex.prompt.hy;
        if (audioId === baseId && ex.correctAnswer) return ex.correctAnswer;
        if (audioId === baseId + '_prompt' && ex.prompt?.hy) return ex.prompt.hy;
        if (audioId === baseId + '_answer' && ex.correctAnswer) return ex.correctAnswer;
        if (audioId === baseId + '_hint' && ex.hint?.hy) return ex.hint.hy;
        if (audioId === baseId + '_feedback_correct' && ex.feedback?.correct?.hy) return ex.feedback.correct.hy;
        if (audioId === baseId + '_feedback_incorrect' && ex.feedback?.incorrect?.hy) return ex.feedback.incorrect.hy;
      }
    }
  }
  return null;
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🎵 GENERATING 257 MISSING FILES');
  console.log('================================');
  console.log();
  
  // Find missing
  const missing = findMissing();
  console.log(`📊 Missing files: ${missing.length}`);
  console.log('First 10:');
  for (const m of missing.slice(0, 10)) {
    console.log(`  ${m.numId} (${m.audioId})`);
  }
  console.log();
  
  if (missing.length === 0) {
    console.log('✅ No missing files!');
    return;
  }
  
  let success = 0;
  let failed = 0;
  const startTime = Date.now();
  
  for (let i = 0; i < missing.length; i++) {
    const entry = missing[i];
    const text = getText(entry.audioId);
    
    if (!text || !text.trim()) {
      console.log(`  ⚠️ No text for: ${entry.audioId}`);
      failed++;
      continue;
    }
    
    try {
      const done = i + 1;
      const pct = ((done / missing.length) * 100).toFixed(1);
      const elapsedMin = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
      process.stdout.write(`\r  [${elapsedMin}m] ${done}/${missing.length} (${pct}%) ✅ ${success} ❌ ${failed} | ${entry.numId}.mp3`);
      
      const result = await generateWavAudio(text);
      fs.writeFileSync(path.join(HY_DIR, `${entry.numId}.mp3`), result.buffer);
      success++;
      
      await new Promise(r => setTimeout(r, 500));
      
    } catch (error) {
      console.log(`\n  ❌ ${entry.audioId} (${entry.numId}): ${error.message}`);
      failed++;
    }
  }
  
  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n\n✅ Done: ${success} generated, ${failed} failed | Time: ${totalTime}m`);
  console.log(`📄 Manifest entries: ${JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')).totalFiles}`);
}

// ============================================================
// RUN
// ============================================================

main().catch(console.error);