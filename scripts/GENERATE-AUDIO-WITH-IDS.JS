// scripts/generate-audio-with-ids.js
// Run: node scripts/generate-audio-with-ids.js
//
// Գեներացնում է աուդիո ֆայլեր թվային ID-ներով (000001, 000002, ...)
// Ստեղծում է ընդհանուր և առանձին manifest-ներ

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// ============================================================
// PATHS
// ============================================================

const DICT_PATH = path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json');
const AUDIO_BASE = path.join(process.cwd(), 'public', 'audio', 'offline');
const MANIFEST_PATH = path.join(AUDIO_BASE, 'manifest.json');

// ============================================================
// CONFIG
// ============================================================

const VOICES = {
  en: { dir: 'en_female', voice: 'en-US-JennyNeural', label: 'English Female' },
  hy: { dir: 'hy_Ani', voice: null, label: 'Armenian Female' }, // Google TTS
  ru: { dir: 'ru_female', voice: 'ru-RU-DariyaNeural', label: 'Russian Female' }
};

// ============================================================
// LOAD DICTIONARY
// ============================================================

function loadDictionary() {
  const content = fs.readFileSync(DICT_PATH, 'utf-8');
  return JSON.parse(content);
}

// ============================================================
// COLLECT VOCABULARY
// ============================================================

function collectVocabulary(dict) {
  const entries = [];
  const seen = new Set();
  const lessons = dict.lessons || [];

  for (const lesson of lessons) {
    if (lesson.vocabulary) {
      for (const v of lesson.vocabulary) {
        if (v.id && !seen.has(v.id)) {
          seen.add(v.id);
          entries.push({
            id: v.id,
            en: v.en || '',
            hy: v.hy || '',
            ru: v.ru || '',
            lessonId: lesson.id
          });
        }
      }
    }
  }

  return entries;
}

// ============================================================
// TTS GENERATION
// ============================================================

async function generateTTS(text, voice) {
  if (!text || text.trim().length === 0) {
    throw new Error('Empty text');
  }

  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const tempFile = path.join(tempDir, `${Date.now()}.mp3`);

  try {
    // Armenian uses Google TTS (Edge doesn't support hy)
    if (voice === null) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=hy&client=tw-ob`;
      return new Promise((resolve, reject) => {
        const https = require('https');
        const file = fs.createWriteStream(tempFile);
        https.get(url, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`HTTP ${response.statusCode}`));
            return;
          }
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            const buffer = fs.readFileSync(tempFile);
            fs.unlinkSync(tempFile);
            resolve(buffer);
          });
          file.on('error', reject);
        }).on('error', reject);
      });
    }

    // English, Russian use Edge TTS
    const cleanText = text.replace(/"/g, '\\"').replace(/\n/g, ' ');
    const command = `edge-tts --voice "${voice}" --text "${cleanText}" --write-media "${tempFile}"`;
    await execAsync(command, { timeout: 30000 });

    if (!fs.existsSync(tempFile)) throw new Error('File not created');
    const stats = fs.statSync(tempFile);
    if (stats.size < 100) throw new Error('File too small');

    const buffer = fs.readFileSync(tempFile);
    fs.unlinkSync(tempFile);
    return buffer;
  } catch (error) {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    throw error;
  }
}

// ============================================================
// GENERATE ALL AUDIO
// ============================================================

async function generateAllAudio(entries) {
  const results = {
    total: entries.length,
    generated: 0,
    failed: 0,
    mapping: {},
    byLanguage: {
      en: [],
      hy: [],
      ru: []
    }
  };

  // Create directories
  for (const [lang, config] of Object.entries(VOICES)) {
    const dir = path.join(AUDIO_BASE, config.dir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  // Generate for each entry
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const numId = String(i + 1).padStart(6, '0');
    const entryResult = {
      id: entry.id,
      lessonId: entry.lessonId,
      en: entry.en,
      hy: entry.hy,
      ru: entry.ru,
      numId: numId,
      files: {}
    };

    // Generate for each language
    for (const [lang, config] of Object.entries(VOICES)) {
      const text = entry[lang];
      if (!text || text.trim().length === 0) continue;

      const dir = path.join(AUDIO_BASE, config.dir);
      const filename = `${numId}.mp3`;
      const filePath = path.join(dir, filename);

      try {
        const pct = ((i + 1) / entries.length * 100).toFixed(1);
        process.stdout.write(`\r  ${i+1}/${entries.length} (${pct}%) ${lang}...`);

        const buffer = await generateTTS(text, config.voice);
        fs.writeFileSync(filePath, buffer);

        entryResult.files[lang] = `/audio/offline/${config.dir}/${filename}`;
        results.byLanguage[lang].push({
          numId: numId,
          id: entry.id,
          text: text,
          path: `/audio/offline/${config.dir}/${filename}`
        });

      } catch (error) {
        console.log(`\n  ❌ ${entry.id} (${lang}): ${error.message}`);
        results.failed++;
      }
    }

    results.mapping[numId] = entryResult;
    results.generated++;

    // Progress
    if ((i + 1) % 10 === 0 || i === entries.length - 1) {
      process.stdout.write(`\n`);
    }
  }

  return results;
}

// ============================================================
// SAVE MANIFESTS
// ============================================================

function saveManifests(results) {
  // 1. Ընդհանուր manifest
  const mainManifest = {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    totalFiles: results.total,
    mapping: results.mapping
  };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(mainManifest, null, 2));
  console.log(`✅ Saved: ${MANIFEST_PATH}`);

  // 2. Առանձին manifests
  for (const [lang, data] of Object.entries(results.byLanguage)) {
    const config = VOICES[lang];
    const manifestPath = path.join(AUDIO_BASE, `manifest_${lang}_${config.dir.includes('female') ? 'female' : 'ani'}.json`);
    
    const manifest = {
      version: '2.0',
      generatedAt: new Date().toISOString(),
      language: lang,
      voice: config.label,
      totalFiles: data.length,
      files: {}
    };

    for (const item of data) {
      manifest.files[item.numId] = {
        id: item.id,
        text: item.text,
        path: item.path
      };
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ Saved: ${manifestPath}`);
  }
}

// ============================================================
// PRINT STATS
// ============================================================

function printStats(results) {
  console.log('\n📊 SUMMARY');
  console.log('──────────────────────────────────────────');
  console.log(`  Total entries: ${results.total}`);
  console.log(`  Generated: ${results.generated}`);
  console.log(`  Failed: ${results.failed}`);

  console.log('\n  By Language:');
  for (const [lang, data] of Object.entries(results.byLanguage)) {
    console.log(`    ${lang}: ${data.length} files`);
  }

  console.log('\n  Sample mapping:');
  const sample = Object.entries(results.mapping).slice(0, 5);
  for (const [numId, entry] of sample) {
    console.log(`    ${numId}: ${entry.id} (${Object.keys(entry.files).join(', ')})`);
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🎵 Generating Audio with Numeric IDs');
  console.log('======================================');
  console.log(`Started: ${new Date().toISOString()}`);
  console.log(`  Format: 000001.mp3, 000002.mp3, ...`);
  console.log(`  Languages: en, hy, ru`);
  console.log(`  Voices: English (Jenny), Armenian (Google), Russian (Dariya)`);
  console.log();

  // Check edge-tts
  try {
    await execAsync('edge-tts --version', { timeout: 5000 });
    console.log('✅ Edge TTS available\n');
  } catch {
    console.log('⚠️ Edge TTS not found. English/Russian will use Google TTS fallback\n');
  }

  // Load dictionary
  const dict = loadDictionary();
  console.log(`✅ Loaded dictionary v${dict.version}`);

  // Collect vocabulary
  const entries = collectVocabulary(dict);
  console.log(`📚 Found ${entries.length} vocabulary entries\n`);

  // Generate audio
  console.log('🔊 Generating...');
  const results = await generateAllAudio(entries);

  // Save manifests
  console.log('\n📄 Saving manifests...');
  saveManifests(results);

  // Print stats
  printStats(results);

  console.log('\n✅ Done!');
  console.log(`  Manifest: ${MANIFEST_PATH}`);
  console.log(`  Audio: ${AUDIO_BASE}/[lang]_[voice]/`);
  console.log('\n💡 Next steps:');
  console.log('  1. Run: npm run sync-audio');
  console.log('  2. Test: npm run dev');
}

// ============================================================
// RUN
// ============================================================

main().catch(console.error);