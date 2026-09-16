// scripts/extract-audio-ids.js
// Run: node scripts/extract-audio-ids.js

const fs = require('fs');
const path = require('path');

const DICT_PATH = path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json');
const OUTPUT_PATH = path.join(process.cwd(), 'temp', 'audio-ids-to-generate.txt');

// Load dictionary
const content = fs.readFileSync(DICT_PATH, 'utf-8');
const dict = JSON.parse(content);

// Collect all audio IDs from vocabulary
const audioIds = [];
const lessons = dict.lessons || [];

for (const lesson of lessons) {
  if (lesson.vocabulary) {
    for (const v of lesson.vocabulary) {
      if (v.id && v.en) {
        audioIds.push({
          id: v.id,
          text: v.en,
          lessonId: lesson.id
        });
      }
    }
  }
}

// Ensure temp directory exists
const tempDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Save to file
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(audioIds, null, 2));
console.log(`✅ Extracted ${audioIds.length} audio IDs`);
console.log(`📁 Saved to: ${OUTPUT_PATH}`);
console.log(`\n📝 First 5:`);
for (const item of audioIds.slice(0, 5)) {
  console.log(`  ${item.id}: "${item.text}"`);
}