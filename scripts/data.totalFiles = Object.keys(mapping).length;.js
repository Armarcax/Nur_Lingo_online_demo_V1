// scripts/sync-dictionary-manifest.js
// Սինխրոնացնում է բառարանը և մանիֆեստները

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();

// 1. Կարդալ բառարանները
const dictFiles = [
  'data/dictionaries/unified-dictionary.json',
  'data/dictionaries/user-dictionary.json',
  'data/dictionaries/lesson-dictionary.json',
];

const allAudioIds = new Map();

for (const dictFile of dictFiles) {
  const fullPath = path.join(PROJECT_ROOT, dictFile);
  if (!fs.existsSync(fullPath)) continue;
  
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  let entries = [];
  if (Array.isArray(data)) entries = data;
  else if (data.entries) entries = data.entries;
  else if (data.lessons) entries = data.lessons;
  
  for (const entry of entries) {
    const id = entry.audioId || entry.audio || entry.id;
    const key = entry.id || entry.word || entry.key;
    if (id && key) {
      allAudioIds.set(key, id);
    }
  }
}

console.log(`📊 Found ${allAudioIds.size} audio mappings`);

// 2. Թարմացնել մանիֆեստները
const manifests = [
  { path: 'public/audio/offline/manifest_en_female.json', label: 'EN' },
  { path: 'public/audio/offline/manifest_hy_ani.json', label: 'HY' },
  { path: 'public/audio/offline/manifest_ru_female.json', label: 'RU' },
];

for (const mf of manifests) {
  const fullPath = path.join(PROJECT_ROOT, mf.path);
  if (!fs.existsSync(fullPath)) continue;
  
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  const mapping = data.mapping || {};
  
  // Ավելացնել բացակայող entries
  let added = 0;
  for (const [key, id] of allAudioIds) {
    if (!mapping[key] && !Object.values(mapping).includes(id)) {
      mapping[key] = id;
      added++;
    }
  }
  
  data.mapping = mapping;
  data.totalFiles = Object.keys(mapping).length;
  
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
  console.log(`✅ ${mf.label}: Added ${added} entries, total ${data.totalFiles}`);
}

console.log('✅ Dictionary → Manifest sync complete!');