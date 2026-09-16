// scripts/generate-voiser-hy.js
// Run: node scripts/generate-voiser-hy.js
//
// Հայերեն աուդիո Voiser.ai-ով (Anahit - կանացի ձայն)

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
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio', 'offline', 'hy_Ani');

// ============================================================
// LOAD DICTIONARY
// ============================================================

function loadDictionary() {
  const content = fs.readFileSync(DICT_PATH, 'utf-8');
  return JSON.parse(content);
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
// COLLECT ARMENIAN TEXTS
// ============================================================

function collectArmenianTexts(dict) {
  const entries = [];
  const seen = new Set();
  const lessons = dict.lessons || {};
  
  for (const [lessonId, lesson] of Object.entries(lessons)) {
    // Vocabulary
    if (lesson.vocabulary) {
      for (const v of lesson.vocabulary) {
        if (v.id && v.hy && !seen.has(v.id)) {
          seen.add(v.id);
          entries.push({
            id: v.id,
            text: v.hy,
            type: 'vocabulary'
          });
        }
      }
    }
    
    // Exercises
    if (lesson.exercises) {
      for (const ex of lesson.exercises) {
        const baseId = ex.audio?.id || ex.id;
        
        if (ex.prompt?.hy) {
          const key = `${baseId}_prompt`;
          if (!seen.has(key)) {
            seen.add(key);
            entries.push({
              id: key,
              text: ex.prompt.hy,
              type: 'prompt'
            });
          }
        }
        
        if (ex.hint?.hy) {
          const key = `${baseId}_hint`;
          if (!seen.has(key)) {
            seen.add(key);
            entries.push({
              id: key,
              text: ex.hint.hy,
              type: 'hint'
            });
          }
        }
        
        if (ex.feedback?.correct?.hy) {
          const key = `${baseId}_feedback_correct`;
          if (!seen.has(key)) {
            seen.add(key);
            entries.push({
              id: key,
              text: ex.feedback.correct.hy,
              type: 'feedback_correct'
            });
          }
        }
        
        if (ex.feedback?.incorrect?.hy) {
          const key = `${baseId}_feedback_incorrect`;
          if (!seen.has(key)) {
            seen.add(key);
            entries.push({
              id: key,
              text: ex.feedback.incorrect.hy,
              type: 'feedback_incorrect'
            });
          }
        }
      }
    }
  }
  
  return entries;
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🎵 ARMENIAN AUDIO GENERATOR (Voiser.ai)');
  console.log('=========================================');
  console.log(`  Voice: ${VOICE_ID} (🎤 Armenian Female)`);
  console.log(`  API: ${API_URL}`);
  console.log('  Output: hy_Ani/');
  console.log('  Rate Limit: 1 request/minute');
  console.log();
  
  // Load dictionary
  const dict = loadDictionary();
  console.log(`✅ Loaded dictionary v${dict.version}`);
  
  const entries = collectArmenianTexts(dict);
  console.log(`📚 Found ${entries.length} Armenian entries\n`);
  
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
    console.log('📁 Created directory: hy_Ani');
  }
  
  // Test with 3 files first
  const testCount = Math.min(entries.length, 3);
  console.log(`🔬 Testing with ${testCount} files...`);
  console.log(`  Rate limit: 1 request per minute`);
  console.log(`  ETA: ~${testCount} minutes\n`);
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < testCount; i++) {
    const entry = entries[i];
    
    try {
      const pct = ((i + 1) / testCount * 100).toFixed(1);
      process.stdout.write(`\r  ${i+1}/${testCount} (${pct}%) - ${entry.id}`);
      
      const result = await generateVoiserAudio(entry.text);
      const filePath = path.join(AUDIO_DIR, `${entry.id}.mp3`);
      fs.writeFileSync(filePath, result.buffer);
      success++;
      
      // Rate limiting - 1 request per minute
      if (i < testCount - 1) {
        console.log(`\n  ⏳ Waiting 60 seconds...`);
        await new Promise(r => setTimeout(r, 60000));
      }
      
    } catch (error) {
      console.log(`\n  ❌ ${entry.id}: ${error.message}`);
      failed++;
      
      // Even on error, wait before next request
      if (i < testCount - 1) {
        console.log(`  ⏳ Waiting 60 seconds...`);
        await new Promise(r => setTimeout(r, 60000));
      }
    }
  }
  
  console.log(`\n\n✅ Done! ${success} generated, ${failed} failed`);
  
  // Check files
  if (fs.existsSync(AUDIO_DIR)) {
    const files = fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith('.mp3'));
    console.log(`\n📁 Files in hy_Ani: ${files.length}`);
    
    // Show file sizes
    let totalSize = 0;
    for (const f of files.slice(0, 5)) {
      const stats = fs.statSync(path.join(AUDIO_DIR, f));
      totalSize += stats.size;
      console.log(`  ${f}: ${(stats.size / 1024).toFixed(1)} KB`);
    }
    if (files.length > 0) {
      console.log(`  Total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    }
  }
  
  console.log('\n💡 Next steps:');
  console.log('  1. Run full generation: node scripts/generate-voiser-hy.js');
  console.log('  2. Or use WAV.AM for faster bulk generation');
}

// ============================================================
// RUN
// ============================================================

main().catch(console.error);