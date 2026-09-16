// scripts/test-wav-generation.js
// Run: node scripts/test-wav-generation.js

const fs = require('fs');
const path = require('path');

console.log('🔍 WAV Generation Test');
console.log('========================================\n');

// ─── 1. CHECK DICTIONARY ────────────────────────────────────────────

console.log('📋 1. Checking dictionary...');
console.log('----------------------------------------');

const dictPath = path.join(process.cwd(), 'data', 'dictionaries', 'unified-dictionary.json');

if (fs.existsSync(dictPath)) {
  const content = fs.readFileSync(dictPath, 'utf-8');
  const data = JSON.parse(content);
  
  let entries = [];
  if (data.entries) {
    entries = Object.keys(data.entries);
  } else if (Array.isArray(data)) {
    entries = data.map(item => item.id);
  }
  
  console.log(`✅ Dictionary found: ${entries.length} entries`);
  console.log(`📄 First 10 IDs:`, entries.slice(0, 10).join(', '));
  console.log(`📄 Last 10 IDs:`, entries.slice(-10).join(', '));
} else {
  console.log('❌ Dictionary not found!');
}
console.log('');

// ─── 2. CHECK AUDIO FILES ───────────────────────────────────────────

console.log('📋 2. Checking audio files...');
console.log('----------------------------------------');

const audioDir = path.join(process.cwd(), 'public', 'audio', 'hy_wav');

if (fs.existsSync(audioDir)) {
  const files = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));
  console.log(`✅ Found ${files.length} audio files`);
  
  // Check if files are named with IDs
  const sorted = files.sort();
  console.log(`📄 First 10 files:`, sorted.slice(0, 10).join(', '));
  console.log(`📄 Last 10 files:`, sorted.slice(-10).join(', '));
} else {
  console.log('❌ Audio directory not found!');
}
console.log('');

// ─── 3. CHECK MANIFEST ──────────────────────────────────────────────

console.log('📋 3. Checking manifest...');
console.log('----------------------------------------');

const manifestPath = path.join(process.cwd(), 'public', 'audio', 'manifest_wav.json');

if (fs.existsSync(manifestPath)) {
  const content = fs.readFileSync(manifestPath, 'utf-8');
  const manifest = JSON.parse(content);
  const entries = Object.keys(manifest.entries || {});
  
  console.log(`✅ Manifest found: ${entries.length} entries`);
  console.log(`📄 First 10 manifest entries:`, entries.slice(0, 10).join(', '));
  console.log(`📄 Last 10 manifest entries:`, entries.slice(-10).join(', '));
} else {
  console.log('❌ Manifest not found!');
}
console.log('');

// ─── 4. SUGGESTIONS ─────────────────────────────────────────────────

console.log('💡 Suggestions:');
console.log('----------------------------------------');

if (!fs.existsSync(dictPath)) {
  console.log('  ❌ Create unified-dictionary.json first');
}

const dictEntries = fs.existsSync(dictPath) ? Object.keys(JSON.parse(fs.readFileSync(dictPath, 'utf-8')).entries || {}) : [];
const audioFiles = fs.existsSync(audioDir) ? fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3')) : [];

if (dictEntries.length > 0 && audioFiles.length === 0) {
  console.log('  🔄 No audio files yet. Run generation:');
  console.log('     curl -X POST http://localhost:3000/api/generate-wav -H "Content-Type: application/json" -d \'{"generateAll": true, "voice": "Avet"}\'');
}

if (dictEntries.length > 0 && audioFiles.length > 0) {
  // Check if audio files match dictionary IDs
  const dictIds = dictEntries.map(id => `${id}.mp3`);
  const audioIds = audioFiles;
  const matched = dictIds.filter(id => audioIds.includes(id));
  
  console.log(`  📊 Dictionary: ${dictEntries.length}, Audio: ${audioFiles.length}, Matched: ${matched.length}`);
  
  if (matched.length < dictEntries.length) {
    console.log(`  ⚠️ ${dictEntries.length - matched.length} entries missing audio`);
    console.log('  🔄 Run missing generation:');
    console.log('     curl -X POST http://localhost:3000/api/generate-wav -H "Content-Type: application/json" -d \'{"generateMissing": true, "voice": "Avet"}\'');
  } else {
    console.log('  ✅ All entries have audio!');
  }
}

console.log('\n✅ Test complete!');