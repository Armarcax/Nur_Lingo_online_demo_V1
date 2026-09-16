// scripts/generate-armenian-audio.js
// Run: node scripts/generate-armenian-audio.js
// 
// Գեներացնում է հայերեն աուդիո ֆայլեր lesson-dictionary.json-ից
// Օգտագործում է WAV.am API-ն Areg և Ani ձայներով

const fs = require('fs');
const path = require('path');
const https = require('https');

// ============================================================
// CONFIGURATION
// ============================================================

const WAV_ACCESS_TOKEN = process.env.WAV_ACCESS_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJhOTc2Nzg1M2Q0NjA0MDAyOTE3ZjMyMjA0N2EyMGE4YyIsInVzZXJuYW1lIjoiQXJldmlrU2FoYWt5YW4iLCJjb25uZWN0aW9uIjoiYXBpIiwiZXhwIjoxODAxMzUzNjAwLCJpYXQiOjE3ODQ3NTAyMDN9.CRrlnnRLrIS229FF37IKn_mnDMZnJvnAiyVAT_dn9CM";
const PROJECT_ID = '16224';
const BASE_URL = 'https://wav.am';

// Հայերեն ձայներ
const VOICES = ['Areg', 'Ani'];

// ============================================================
// PATHS
// ============================================================

const LESSON_DICT_PATH = path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json');
const AUDIO_BASE_DIR = path.join(process.cwd(), 'public', 'audio', 'offline');

// ============================================================
// LOAD LESSON DICTIONARY
// ============================================================

function loadLessonDictionary() {
  if (!fs.existsSync(LESSON_DICT_PATH)) {
    console.error(`❌ Lesson dictionary not found: ${LESSON_DICT_PATH}`);
    return null;
  }
  
  const content = fs.readFileSync(LESSON_DICT_PATH, 'utf-8');
  const data = JSON.parse(content);
  
  // Հավաքել բոլոր հայերեն տեքստերը
  const entries = [];
  const lessons = data.lessons || {};
  
  for (const [lessonId, lesson] of Object.entries(lessons)) {
    // Vocabulary
    if (lesson.vocabulary && Array.isArray(lesson.vocabulary)) {
      for (const v of lesson.vocabulary) {
        if (v.hy) {
          entries.push({
            id: v.id || `${lessonId}_v${entries.length + 1}`,
            text: v.hy,
            type: 'vocabulary',
            lessonId
          });
        }
      }
    }
    
    // Phrases
    if (lesson.phrases && Array.isArray(lesson.phrases)) {
      for (const p of lesson.phrases) {
        if (p.hy) {
          entries.push({
            id: p.id || `${lessonId}_p${entries.length + 1}`,
            text: p.hy,
            type: 'phrase',
            lessonId
          });
        }
      }
    }
    
    // Dialogues
    if (lesson.dialogues && Array.isArray(lesson.dialogues)) {
      for (const d of lesson.dialogues) {
        if (d.turns && Array.isArray(d.turns)) {
          for (let i = 0; i < d.turns.length; i++) {
            const t = d.turns[i];
            if (t.hy) {
              entries.push({
                id: `${lessonId}_d${entries.length + 1}_t${i + 1}`,
                text: t.hy,
                type: 'dialogue',
                lessonId,
                speaker: t.speaker || 'nurik'
              });
            }
          }
        }
      }
    }
  }
  
  console.log(`📚 Loaded ${entries.length} Armenian entries from ${Object.keys(lessons).length} lessons`);
  return entries;
}

// ============================================================
// GENERATE AUDIO VIA WAV.AM
// ============================================================

function generateAudio(text, voice) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      project_id: PROJECT_ID,
      text: text,
      voice: voice,
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
// GENERATE FOR VOICE
// ============================================================

async function generateForVoice(voice, entries) {
  const voiceLower = voice.toLowerCase();
  const audioDir = path.join(AUDIO_BASE_DIR, `hy_${voice}`);
  const manifestPath = path.join(process.cwd(), 'public', 'audio', `manifest_hy_${voiceLower}.json`);
  
  // Create directory
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }
  
  // Load existing manifest
  let manifest = { entries: {}, totalEntries: 0, lastUpdated: new Date().toISOString() };
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      console.log(`  📄 Loaded manifest with ${manifest.totalEntries} entries`);
    } catch {}
  }
  
  // Filter missing entries
  const missing = entries.filter(entry => !manifest.entries[entry.id]);
  
  if (missing.length === 0) {
    return { voice, generated: 0, skipped: manifest.totalEntries, failed: 0 };
  }
  
  console.log(`  🎯 ${missing.length} missing entries to generate`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < missing.length; i++) {
    const entry = missing[i];
    const text = entry.text;
    
    if (!text || text.trim().length === 0) {
      failCount++;
      continue;
    }
    
    // Progress indicator
    if (i % 5 === 0 || i === missing.length - 1) {
      console.log(`  ${voice}: ${i + 1}/${missing.length} (${successCount} success, ${failCount} failed)`);
    }
    
    try {
      const result = await generateAudio(text, voice);
      const fileName = `${entry.id}.mp3`;
      const filePath = path.join(audioDir, fileName);
      fs.writeFileSync(filePath, result.buffer);
      
      manifest.entries[entry.id] = {
        id: entry.id,
        text: text,
        type: entry.type,
        lessonId: entry.lessonId,
        speaker: entry.speaker || null,
        path: `/audio/offline/hy_${voice}/${fileName}`,
        duration: result.duration,
        voice: voice,
        generatedAt: new Date().toISOString()
      };
      
      manifest.totalEntries = Object.keys(manifest.entries).length;
      manifest.lastUpdated = new Date().toISOString();
      
      // Save manifest every 10 entries
      if (i % 10 === 0 || i === missing.length - 1) {
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      }
      
      successCount++;
      
      // Rate limiting - 200ms between requests
      await new Promise(r => setTimeout(r, 200));
      
    } catch (error) {
      console.error(`  ❌ ${voice} ${entry.id}: ${error.message}`);
      failCount++;
    }
  }
  
  // Final save
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  return { voice, generated: successCount, skipped: missing.length - successCount - failCount, failed: failCount };
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🎵 Generating Armenian Audio (Areg & Ani)');
  console.log('========================================\n');
  
  // 1. Load lesson dictionary
  const entries = loadLessonDictionary();
  if (!entries || entries.length === 0) {
    console.error('❌ No entries found');
    return;
  }
  
  console.log(`📄 First 5 entries:`, entries.slice(0, 5).map(e => `${e.id}(${e.text.substring(0, 20)}...)`).join(', '));
  console.log(`\n🎯 Processing ${VOICES.length} voices: ${VOICES.join(', ')}\n`);
  
  const startTime = Date.now();
  const results = [];
  
  for (const voice of VOICES) {
    console.log(`\n📢 Voice: ${voice}`);
    const result = await generateForVoice(voice, entries);
    results.push(result);
    console.log(`  ✅ ${voice}: ${result.generated} generated, ${result.skipped} skipped, ${result.failed} failed`);
  }
  
  // Summary
  console.log('\n========================================');
  console.log('📊 SUMMARY');
  console.log('========================================');
  
  let totalGenerated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  
  for (const result of results) {
    console.log(`  ${result.voice}: ${result.generated} generated, ${result.skipped} skipped, ${result.failed} failed`);
    totalGenerated += result.generated;
    totalSkipped += result.skipped;
    totalFailed += result.failed;
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('\n----------------------------------------');
  console.log(`  ✅ Total generated: ${totalGenerated}`);
  console.log(`  ⏭️ Total skipped: ${totalSkipped}`);
  console.log(`  ❌ Total failed: ${totalFailed}`);
  console.log(`  ⏱️ Total time: ${totalTime}s`);
  
  // Count audio files
  console.log('\n📁 Audio files:');
  for (const voice of VOICES) {
    const dir = path.join(AUDIO_BASE_DIR, `hy_${voice}`);
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.mp3'));
      console.log(`  hy_${voice}: ${files.length} files`);
    }
  }
  
  console.log('\n✅ Done!');
}

// ============================================================
// RUN
// ============================================================

main().catch(console.error);