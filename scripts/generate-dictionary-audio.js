// scripts/generate-dictionary-audio.js
// Run: node scripts/generate-dictionary-audio.js
// 
// Նպատակը: lesson-dictionary.json-ից վերցնել բոլոր բառերը,
//          արտահանել աուդիո ֆայլեր և թարմացնել manifest-ը

const fs = require('fs');
const path = require('path');
const https = require('https');

// ============================================================
// CONFIGURATION
// ============================================================

// WAV.am API
const WAV_ACCESS_TOKEN = process.env.WAV_ACCESS_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiI1Yzg3Mjg3Y2Y5MzI0ZGEyYmUzYjIxZjMwMjNjODg3MyIsInVzZXJuYW1lIjoiQXJtZW5pYUFyY2F4IiwiY29ubmVjdGlvbiI6ImFwaSIsImV4cCI6MTc4NTU0MjQwMCwiaWF0IjoxNzgzMzQ0Mzg2fQ.VzV86Z_StMS3XXrjeJU1NdLaJiWAy-lquHfnd0_DK8c";
const WAV_PROJECT_ID = '15850';
const WAV_BASE_URL = 'https://wav.am';

// Հայերեն ձայներ
const HY_VOICES = {
  male: 'Areg',
  female: 'Ani'
};

// Պահոցների ուղիներ
const LESSON_DICT_PATH = path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json');
const MANIFEST_PATH = path.join(process.cwd(), 'public', 'audio', 'lesson_dictionary_manifest.json');
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
  
  // Հավաքել բոլոր բառերը, արտահայտությունները և երկխոսությունները
  const entries = [];
  const lessons = data.lessons || {};
  
  for (const [lessonId, lesson] of Object.entries(lessons)) {
    // Vocabulary
    if (lesson.vocabulary && Array.isArray(lesson.vocabulary)) {
      for (const v of lesson.vocabulary) {
        entries.push({
          id: v.id || `${lessonId}_v${entries.length + 1}`,
          hy: v.hy || '',
          en: v.en || '',
          ru: v.ru || '',
          type: 'vocabulary',
          lessonId
        });
      }
    }
    
    // Phrases
    if (lesson.phrases && Array.isArray(lesson.phrases)) {
      for (const p of lesson.phrases) {
        entries.push({
          id: p.id || `${lessonId}_p${entries.length + 1}`,
          hy: p.hy || '',
          en: p.en || '',
          ru: p.ru || '',
          type: 'phrase',
          lessonId
        });
      }
    }
    
    // Dialogues
    if (lesson.dialogues && Array.isArray(lesson.dialogues)) {
      for (const d of lesson.dialogues) {
        if (d.turns && Array.isArray(d.turns)) {
          for (let i = 0; i < d.turns.length; i++) {
            const t = d.turns[i];
            entries.push({
              id: `${lessonId}_d${entries.length + 1}_t${i + 1}`,
              hy: t.hy || '',
              en: t.en || '',
              ru: t.ru || '',
              type: 'dialogue',
              lessonId,
              speaker: t.speaker || 'nurik'
            });
          }
        }
      }
    }
  }
  
  console.log(`📚 Loaded ${entries.length} entries from ${Object.keys(lessons).length} lessons`);
  return entries;
}

// ============================================================
// LOAD / CREATE MANIFEST
// ============================================================

function loadManifest() {
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      const data = JSON.parse(content);
      console.log(`📄 Loaded manifest with ${Object.keys(data.entries || {}).length} entries`);
      return data;
    } catch (error) {
      console.warn('⚠️ Failed to load manifest, creating new one:', error.message);
    }
  }
  
  return {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    totalEntries: 0,
    voices: {
      hy: { male: 'Areg', female: 'Ani' },
      en: { male: 'en_male', female: 'en_female' },
      ru: { male: 'ru_male', female: 'ru_female' }
    },
    entries: {}
  };
}

// ============================================================
// WAV.AM AUDIO GENERATION (Հայերեն)
// ============================================================

function generateWavAudio(text, voice) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      project_id: WAV_PROJECT_ID,
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
          const downloadUrl = `${WAV_BASE_URL}${result.path}`;
          
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
// TTS GENERATION (Անգլերեն, Ռուսերեն)
// ============================================================

// TODO: Փոխարինել իրական TTS ծառայությամբ (Google, Azure, etc.)
async function generateTTSAudio(text, language, gender) {
  // Ժամանակավոր լուծում - ստեղծում է պլեյսհոլդեր
  const placeholder = `# ${text} - ${language}/${gender} - Generated: ${new Date().toISOString()}`;
  return {
    buffer: Buffer.from(placeholder, 'utf-8'),
    duration: 0,
  };
}

// ============================================================
// GENERATE AUDIO FOR ENTRY
// ============================================================

async function generateEntryAudio(entry, manifest) {
  const results = [];
  
  // 1. Հայերեն - WAV (Areg - male, Ani - female)
  if (entry.hy) {
    for (const [gender, voice] of Object.entries(HY_VOICES)) {
      const dirName = `hy_${gender === 'male' ? 'Areg' : 'Ani'}`;
      const audioDir = path.join(AUDIO_BASE_DIR, dirName);
      
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }
      
      const fileName = `${entry.id}.mp3`;
      const filePath = path.join(audioDir, fileName);
      
      // Ստուգել արդեն կա՞
      if (fs.existsSync(filePath)) {
        results.push({ lang: 'hy', gender, path: filePath, skipped: true });
        continue;
      }
      
      try {
        console.log(`   🎵 Generating ${entry.id} (hy/${gender})...`);
        const result = await generateWavAudio(entry.hy, voice);
        fs.writeFileSync(filePath, result.buffer);
        
        // Թարմացնել manifest
        if (!manifest.entries[entry.id]) {
          manifest.entries[entry.id] = {
            id: entry.id,
            type: entry.type,
            lessonId: entry.lessonId,
            text: { hy: entry.hy, en: entry.en, ru: entry.ru },
            audio: {}
          };
        }
        
        manifest.entries[entry.id].audio[`hy_${gender}`] = {
          path: `/audio/offline/${dirName}/${fileName}`,
          duration: result.duration,
          voice: voice
        };
        
        results.push({ lang: 'hy', gender, path: filePath, success: true });
        
        // Rate limiting
        await new Promise(r => setTimeout(r, 200));
        
      } catch (error) {
        console.error(`   ❌ Failed ${entry.id} hy/${gender}:`, error.message);
        results.push({ lang: 'hy', gender, error: error.message });
      }
    }
  }
  
  // 2. Անգլերեն - TTS (male/female)
  if (entry.en) {
    for (const gender of ['male', 'female']) {
      const dirName = `en_${gender}`;
      const audioDir = path.join(AUDIO_BASE_DIR, dirName);
      
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }
      
      const fileName = `${entry.id}_en.mp3`;
      const filePath = path.join(audioDir, fileName);
      
      if (fs.existsSync(filePath)) {
        results.push({ lang: 'en', gender, path: filePath, skipped: true });
        continue;
      }
      
      try {
        console.log(`   🎵 Generating ${entry.id} (en/${gender})...`);
        const result = await generateTTSAudio(entry.en, 'en', gender);
        fs.writeFileSync(filePath, result.buffer);
        
        if (!manifest.entries[entry.id]) {
          manifest.entries[entry.id] = {
            id: entry.id,
            type: entry.type,
            lessonId: entry.lessonId,
            text: { hy: entry.hy, en: entry.en, ru: entry.ru },
            audio: {}
          };
        }
        
        manifest.entries[entry.id].audio[`en_${gender}`] = {
          path: `/audio/offline/${dirName}/${fileName}`,
          duration: result.duration,
          voice: `en_${gender}`
        };
        
        results.push({ lang: 'en', gender, path: filePath, success: true });
        await new Promise(r => setTimeout(r, 150));
        
      } catch (error) {
        console.error(`   ❌ Failed ${entry.id} en/${gender}:`, error.message);
        results.push({ lang: 'en', gender, error: error.message });
      }
    }
  }
  
  // 3. Ռուսերեն - TTS (male/female)
  if (entry.ru) {
    for (const gender of ['male', 'female']) {
      const dirName = `ru_${gender}`;
      const audioDir = path.join(AUDIO_BASE_DIR, dirName);
      
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }
      
      const fileName = `${entry.id}_ru.mp3`;
      const filePath = path.join(audioDir, fileName);
      
      if (fs.existsSync(filePath)) {
        results.push({ lang: 'ru', gender, path: filePath, skipped: true });
        continue;
      }
      
      try {
        console.log(`   🎵 Generating ${entry.id} (ru/${gender})...`);
        const result = await generateTTSAudio(entry.ru, 'ru', gender);
        fs.writeFileSync(filePath, result.buffer);
        
        if (!manifest.entries[entry.id]) {
          manifest.entries[entry.id] = {
            id: entry.id,
            type: entry.type,
            lessonId: entry.lessonId,
            text: { hy: entry.hy, en: entry.en, ru: entry.ru },
            audio: {}
          };
        }
        
        manifest.entries[entry.id].audio[`ru_${gender}`] = {
          path: `/audio/offline/${dirName}/${fileName}`,
          duration: result.duration,
          voice: `ru_${gender}`
        };
        
        results.push({ lang: 'ru', gender, path: filePath, success: true });
        await new Promise(r => setTimeout(r, 150));
        
      } catch (error) {
        console.error(`   ❌ Failed ${entry.id} ru/${gender}:`, error.message);
        results.push({ lang: 'ru', gender, error: error.message });
      }
    }
  }
  
  return results;
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🎵 Generating Dictionary Audio...\n');
  console.log('='.repeat(60));
  
  // 1. Load lesson dictionary
  const entries = loadLessonDictionary();
  if (!entries || entries.length === 0) {
    console.error('❌ No entries found');
    return;
  }
  
  // 2. Load manifest
  const manifest = loadManifest();
  
  // 3. Find entries without audio
  const missing = entries.filter(e => {
    const entry = manifest.entries[e.id];
    if (!entry) return true;
    if (!entry.audio) return true;
    
    // Check if all required audio exists
    const required = ['hy_male', 'hy_female', 'en_male', 'en_female', 'ru_male', 'ru_female'];
    return required.some(r => !entry.audio[r]);
  });
  
  console.log(`\n📊 Total entries: ${entries.length}`);
  console.log(`📊 Missing audio: ${missing.length}`);
  console.log(`📊 Already have audio: ${entries.length - missing.length}`);
  
  if (missing.length === 0) {
    console.log('\n✅ All audio files already exist!');
    return;
  }
  
  // 4. Generate audio for missing entries
  console.log(`\n🎵 Generating ${missing.length} entries...\n`);
  
  let totalSuccess = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  let processed = 0;
  
  for (const entry of missing) {
    processed++;
    const progress = `[${processed}/${missing.length}]`;
    console.log(`\n${progress} ${entry.id} (${entry.type}) - ${entry.lessonId}`);
    
    const results = await generateEntryAudio(entry, manifest);
    
    for (const r of results) {
      if (r.success) totalSuccess++;
      else if (r.skipped) totalSkipped++;
      else if (r.error) totalFailed++;
    }
    
    // Save manifest every 5 entries
    if (processed % 5 === 0 || processed === missing.length) {
      manifest.totalEntries = Object.keys(manifest.entries).length;
      manifest.generatedAt = new Date().toISOString();
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
      console.log(`   💾 Manifest saved (${manifest.totalEntries} entries)`);
    }
  }
  
  // 5. Final save
  manifest.totalEntries = Object.keys(manifest.entries).length;
  manifest.generatedAt = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  
  // 6. Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${totalSuccess}`);
  console.log(`⏭️ Skipped: ${totalSkipped}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📁 Total entries in manifest: ${manifest.totalEntries}`);
  console.log(`📄 Manifest: ${MANIFEST_PATH}`);
  
  // Count audio files
  console.log('\n📁 Audio files by directory:');
  const dirs = ['hy_Areg', 'hy_Ani', 'en_male', 'en_female', 'ru_male', 'ru_female'];
  let totalFiles = 0;
  for (const dir of dirs) {
    const fullDir = path.join(AUDIO_BASE_DIR, dir);
    if (fs.existsSync(fullDir)) {
      const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.mp3'));
      console.log(`   ${dir}: ${files.length} files`);
      totalFiles += files.length;
    } else {
      console.log(`   ${dir}: 0 files (directory not found)`);
    }
  }
  console.log(`\n📁 Total audio files: ${totalFiles}`);
  
  console.log('\n✅ Done!');
}

// ============================================================
// RUN
// ============================================================

main().catch(console.error);