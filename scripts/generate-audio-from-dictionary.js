// scripts/generate-audio-from-dictionary.js
// Run: node scripts/generate-audio-from-dictionary.js

const fs = require('fs');
const path = require('path');
const https = require('https');

const WAV_ACCESS_TOKEN = process.env.WAV_ACCESS_TOKEN;
const PROJECT_ID = '15850';
const BASE_URL = 'https://wav.am';

const DICTIONARY_PATH = path.join(process.cwd(), 'public', 'data', 'lesson-dictionary.json');
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio', 'hy_wav');
const MANIFEST_PATH = path.join(process.cwd(), 'public', 'data', 'audio-manifest.json');

function loadDictionary() {
  if (!fs.existsSync(DICTIONARY_PATH)) {
    console.error('❌ Dictionary not found. Run: npm run build:dict');
    return null;
  }
  return JSON.parse(fs.readFileSync(DICTIONARY_PATH, 'utf-8'));
}

function generateAudio(word, voice = 'Luse') {
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

async function main() {
  console.log('🎵 Generating Audio from Dictionary...\n');
  
  const dictionary = loadDictionary();
  if (!dictionary) return;
  
  const vocabulary = dictionary.vocabulary || [];
  console.log(`📚 ${vocabulary.length} vocabulary entries`);
  
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }
  
  let manifest = { entries: {}, totalEntries: 0 };
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    } catch {}
  }
  
  let success = 0, failed = 0, skipped = 0;
  
  for (let i = 0; i < vocabulary.length; i++) {
    const entry = vocabulary[i];
    const word = entry.hy || entry.en;
    if (!word) { failed++; continue; }
    
    const filePath = path.join(AUDIO_DIR, `${entry.id}.mp3`);
    
    if (manifest.entries[entry.id]) {
      skipped++;
      continue;
    }
    
    try {
      console.log(`🔄 ${i + 1}/${vocabulary.length}: ${entry.id} (${word})`);
      
      const result = await generateAudio(word);
      fs.writeFileSync(filePath, result.buffer);
      
      manifest.entries[entry.id] = {
        hy: `/audio/hy_wav/${entry.id}.mp3`,
        word: word,
        duration: result.duration,
      };
      
      manifest.totalEntries = Object.keys(manifest.entries).length;
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
      
      console.log(`✅ ${entry.id}: Saved (${result.duration}s)`);
      success++;
      
      await new Promise(r => setTimeout(r, 200));
    } catch (error) {
      console.error(`❌ ${entry.id}: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n📊 SUMMARY');
  console.log(`✅ Success: ${success}`);
  console.log(`⏭️ Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Files: ${fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith('.mp3')).length}`);
  console.log(`📄 Manifest: ${manifest.totalEntries} entries`);
  console.log('\n✅ Done!');
}

main().catch(console.error);