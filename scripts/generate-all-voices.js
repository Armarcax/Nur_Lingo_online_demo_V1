// scripts/generate-all-voices.js
// Run: node scripts/generate-all-voices.js [voice]
// Example: node scripts/generate-all-voices.js Luse
// Or: node scripts/generate-all-voices.js all

const fs = require('fs');
const path = require('path');
const https = require('https');

// ─── CONFIG ──────────────────────────────────────────────────────────

const WAV_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiI1Yzg3Mjg3Y2Y5MzI0ZGEyYmUzYjIxZjMwMjNjODg3MyIsInVzZXJuYW1lIjoiQXJtZW5pYUFyY2F4IiwiY29ubmVjdGlvbiI6ImFwaSIsImV4cCI6MTc4NTU0MjQwMCwiaWF0IjoxNzgzMzQ0Mzg2fQ.VzV86Z_StMS3XXrjeJU1NdLaJiWAy-lquHfnd0_DK8c";
const PROJECT_ID = '15850';
const BASE_URL = 'https://wav.am';
const VOICES = ['Avet', 'Areg', 'Luse', 'Tigran', 'Ani'];

// ─── PATHS ──────────────────────────────────────────────────────────

const DICTIONARY_PATH = path.join(process.cwd(), 'data', 'dictionaries', 'unified-dictionary.json');

// ─── LOAD DICTIONARY ─────────────────────────────────────────────────

function loadDictionary() {
  try {
    const content = fs.readFileSync(DICTIONARY_PATH, 'utf-8');
    const data = JSON.parse(content);
    
    let entries = [];
    
    if (Array.isArray(data)) {
      entries = data.map(item => ({
        id: item.id,
        hy: item.hy || '',
        en: item.en || '',
        ru: item.ru || '',
      }));
    } else if (data.entries) {
      entries = Object.entries(data.entries).map(([id, entry]) => ({
        id: id,
        hy: entry.hy || entry.word || '',
        en: entry.en || entry.english || '',
        ru: entry.ru || '',
      }));
    }
    
    entries.sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.id.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
    
    return entries;
  } catch (error) {
    console.error('❌ Failed to load dictionary:', error.message);
    return [];
  }
}

// ─── GENERATE AUDIO ──────────────────────────────────────────────────

function generateAudio(word, voice) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      project_id: PROJECT_ID,
      text: word,
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

// ─── GENERATE FOR VOICE ─────────────────────────────────────────────

async function generateForVoice(voice, dictionary) {
  const voiceLower = voice.toLowerCase();
  const audioDir = path.join(process.cwd(), 'public', 'audio', `hy_wav_${voiceLower}`);
  const manifestPath = path.join(process.cwd(), 'public', 'audio', `manifest_wav_${voiceLower}.json`);
  
  console.log(`\n🎤 Voice: ${voice}`);
  console.log(`📁 Audio dir: ${audioDir}`);
  console.log(`📄 Manifest: ${manifestPath}`);
  
  // Create directory
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
    console.log(`✅ Created directory`);
  }
  
  // Load existing manifest
  let manifest = { entries: {}, totalEntries: 0, lastUpdated: new Date().toISOString() };
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      console.log(`📚 Loaded ${manifest.totalEntries} existing entries`);
    } catch {}
  }
  
  // Filter missing entries
  const missing = dictionary.filter(entry => !manifest.entries[entry.id]);
  
  if (missing.length === 0) {
    console.log(`✅ All ${dictionary.length} entries already have audio for ${voice}`);
    return { voice, generated: 0, skipped: manifest.totalEntries, failed: 0 };
  }
  
  console.log(`🔄 Generating ${missing.length} missing entries...`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < missing.length; i++) {
    const entry = missing[i];
    const word = entry.hy || entry.en;
    
    if (!word) {
      console.log(`  ⚠️ ${entry.id}: No word`);
      failCount++;
      continue;
    }
    
    try {
      if (i % 10 === 0) {
        console.log(`  Progress: ${i + 1}/${missing.length} (${successCount} success, ${failCount} failed)`);
      }
      
      const result = await generateAudio(word, voice);
      const fileName = `${entry.id}.mp3`;
      const filePath = path.join(audioDir, fileName);
      fs.writeFileSync(filePath, result.buffer);
      
      manifest.entries[entry.id] = {
        hy: `/audio/hy_wav_${voiceLower}/${fileName}`,
        word: word,
        duration: result.duration,
        voice: voice,
      };
      
      manifest.totalEntries = Object.keys(manifest.entries).length;
      manifest.lastUpdated = new Date().toISOString();
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      
      successCount++;
      
      // Delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
      
    } catch (error) {
      console.error(`  ❌ ${entry.id}: ${error.message}`);
      failCount++;
    }
  }
  
  console.log(`  ✅ ${voice}: ${successCount} generated, ${failCount} failed`);
  
  return { voice, generated: successCount, skipped: missing.length - successCount - failCount, failed: failCount };
}

// ─── MAIN ────────────────────────────────────────────────────────────

async function main() {
  console.log('🎵 Generating Audio with Multiple Voices');
  console.log('========================================\n');
  
  // Get voice from command line
  const args = process.argv.slice(2);
  const targetVoice = args[0] || 'all';
  
  // Load dictionary
  const dictionary = loadDictionary();
  console.log(`📚 Loaded ${dictionary.length} dictionary entries`);
  console.log(`📄 First 5:`, dictionary.slice(0, 5).map(e => `${e.id}(${e.hy})`).join(', '));
  
  if (dictionary.length === 0) {
    console.log('❌ No entries found in dictionary');
    return;
  }
  
  // Determine which voices to process
  let voicesToProcess = [];
  
  if (targetVoice === 'all') {
    voicesToProcess = VOICES;
    console.log(`\n🎯 Processing ALL ${VOICES.length} voices: ${VOICES.join(', ')}`);
  } else if (VOICES.includes(targetVoice)) {
    voicesToProcess = [targetVoice];
    console.log(`\n🎯 Processing voice: ${targetVoice}`);
  } else {
    console.log(`❌ Invalid voice: ${targetVoice}`);
    console.log(`   Available: ${VOICES.join(', ')}`);
    console.log(`   Usage: node scripts/generate-all-voices.js [voice|all]`);
    return;
  }
  
  // Process each voice
  const results = [];
  const startTime = Date.now();
  
  for (const voice of voicesToProcess) {
    const result = await generateForVoice(voice, dictionary);
    results.push(result);
  }
  
  // ─── SUMMARY ────────────────────────────────────────────────────────
  
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
  console.log('\n✅ Done!');
}

main().catch(console.error);