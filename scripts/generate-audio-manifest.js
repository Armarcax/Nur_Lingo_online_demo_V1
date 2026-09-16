// scripts/generate-audio-manifest.js
// Run: node scripts/generate-audio-manifest.js

const fs = require('fs');
const path = require('path');

const DICT_PATH = path.join(process.cwd(), 'public', 'data', 'lesson-dictionary.json');
const MANIFEST_DIR = path.join(process.cwd(), 'public', 'audio');
const MANIFEST_PATH = path.join(MANIFEST_DIR, 'manifest.json');

function generateManifest() {
  console.log('📚 Generating audio manifest from lesson dictionary...\n');

  if (!fs.existsSync(DICT_PATH)) {
    console.error('❌ lesson-dictionary.json not found!');
    return;
  }

  const dict = JSON.parse(fs.readFileSync(DICT_PATH, 'utf-8'));
  const lessons = dict.lessons || {};
  
  const manifest = {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    totalEntries: 0,
    totalLessons: Object.keys(lessons).length,
    entries: {
      hy: [],
      en: [],
      ru: []
    }
  };

  let total = 0;
  let processedLessons = 0;

  for (const [lessonId, lesson] of Object.entries(lessons)) {
    processedLessons++;
    console.log(`📖 [${processedLessons}/${Object.keys(lessons).length}] Processing ${lessonId}...`);

    // ✅ Vocabulary
    if (lesson.vocabulary && Array.isArray(lesson.vocabulary)) {
      for (const v of lesson.vocabulary) {
        const id = v.id || `${lessonId}_v${manifest.entries.hy.length + 1}`;
        if (v.hy) manifest.entries.hy.push({ id, text: v.hy, type: 'vocabulary', lessonId });
        if (v.en) manifest.entries.en.push({ id: `${id}_en`, text: v.en, type: 'vocabulary', lessonId });
        if (v.ru) manifest.entries.ru.push({ id: `${id}_ru`, text: v.ru, type: 'vocabulary', lessonId });
        total += 3;
      }
    }

    // ✅ Phrases
    if (lesson.phrases && Array.isArray(lesson.phrases)) {
      for (const p of lesson.phrases) {
        const id = p.id || `${lessonId}_p${manifest.entries.hy.length + 1}`;
        if (p.hy) manifest.entries.hy.push({ id, text: p.hy, type: 'phrase', lessonId });
        if (p.en) manifest.entries.en.push({ id: `${id}_en`, text: p.en, type: 'phrase', lessonId });
        if (p.ru) manifest.entries.ru.push({ id: `${id}_ru`, text: p.ru, type: 'phrase', lessonId });
        total += 3;
      }
    }

    // ✅ Dialogues
    if (lesson.dialogues && Array.isArray(lesson.dialogues)) {
      for (const d of lesson.dialogues) {
        const dId = d.id || `d${manifest.entries.hy.length + 1}`;
        if (d.turns && Array.isArray(d.turns)) {
          for (let i = 0; i < d.turns.length; i++) {
            const t = d.turns[i];
            const id = `${lessonId}_${dId}_t${i + 1}`;
            const speaker = t.speaker || 'nurik';
            
            if (t.hy) manifest.entries.hy.push({ id, text: t.hy, type: 'dialogue', lessonId, speaker });
            if (t.en) manifest.entries.en.push({ id: `${id}_en`, text: t.en, type: 'dialogue', lessonId, speaker });
            if (t.ru) manifest.entries.ru.push({ id: `${id}_ru`, text: t.ru, type: 'dialogue', lessonId, speaker });
            total += 3;
          }
        }
      }
    }
  }

  manifest.totalEntries = total;

  // Save manifest
  if (!fs.existsSync(MANIFEST_DIR)) fs.mkdirSync(MANIFEST_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(`\n✅ Saved manifest: ${MANIFEST_PATH}`);
  console.log(`📊 Total lessons: ${manifest.totalLessons}`);
  console.log(`📊 Total entries: ${total}`);
  console.log(`   hy: ${manifest.entries.hy.length}`);
  console.log(`   en: ${manifest.entries.en.length}`);
  console.log(`   ru: ${manifest.entries.ru.length}`);
}

generateManifest();