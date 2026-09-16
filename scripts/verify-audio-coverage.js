// scripts/verify-audio-coverage.js
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying audio coverage...\n');

// Read mapping
const mappingPath = path.join(process.cwd(), 'src/lib/content/audio-mapping.ts');
const content = fs.readFileSync(mappingPath, 'utf-8');

const exerciseMatch = content.match(/EXERCISE_TO_AUDIO\s*:\s*Record<string,\s*string>\s*=\s*{([\s\S]*?)};/);
const exerciseMap = {};
const allAudioIds = new Set();

if (exerciseMatch) {
  const block = exerciseMatch[1];
  const lineRegex = /['"](\w+)['"]\s*:\s*['"](\w+)['"]/g;
  let match;
  while ((match = lineRegex.exec(block)) !== null) {
    exerciseMap[match[1]] = match[2];
    allAudioIds.add(match[2]);
  }
}

console.log(`📋 Total mappings: ${Object.keys(exerciseMap).length}`);
console.log(`🎵 Unique audio IDs: ${allAudioIds.size}`);

// Group by prefix
const groups = {};
for (const key of Object.keys(exerciseMap)) {
  const prefix = key.match(/^[a-z_]+/)?.[0] || 'other';
  if (!groups[prefix]) groups[prefix] = [];
  groups[prefix].push(key);
}

console.log('\n📊 Groups:');
for (const [prefix, keys] of Object.entries(groups).sort()) {
  console.log(`  ${prefix}: ${keys.length} entries`);
}

// Check each voice
const voices = ['hy_Ani', 'en_female', 'ru_female'];
const results = {};

for (const voice of voices) {
  const dir = path.join(process.cwd(), 'public/audio/offline', voice);
  const existing = new Set();
  
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.mp3'));
    for (const file of files) {
      existing.add(file.replace('.mp3', ''));
    }
  }
  
  const missing = [];
  for (const id of allAudioIds) {
    if (!existing.has(id)) {
      missing.push(id);
    }
  }
  
  const extra = [];
  for (const id of existing) {
    if (!allAudioIds.has(id)) {
      extra.push(id);
    }
  }
  
  results[voice] = {
    total: existing.size,
    missing: missing.length,
    extra: extra.length,
    coverage: ((existing.size / allAudioIds.size) * 100).toFixed(1) + '%',
    missingSample: missing.slice(0, 10),
    extraSample: extra.slice(0, 10),
  };
}

console.log('\n🎵 VOICE COVERAGE:');
for (const [voice, data] of Object.entries(results)) {
  console.log(`\n${voice}:`);
  console.log(`  Total: ${data.total}`);
  console.log(`  Coverage: ${data.coverage}`);
  console.log(`  Missing: ${data.missing}`);
  console.log(`  Extra: ${data.extra}`);
  if (data.missing > 0) {
    console.log(`  Missing sample: ${data.missingSample.join(', ')}`);
  }
  if (data.extra > 0) {
    console.log(`  Extra sample: ${data.extraSample.join(', ')}`);
  }
}

// Save full report
const report = {
  timestamp: new Date().toISOString(),
  mappings: {
    total: Object.keys(exerciseMap).length,
    uniqueAudioIds: allAudioIds.size,
    groups,
  },
  voices: results,
};

fs.writeFileSync('audio-coverage.json', JSON.stringify(report, null, 2));
console.log('\n✅ Report saved: audio-coverage.json');

// Generate summary
console.log('\n📊 SUMMARY:');
console.log(`  Total mappings: ${Object.keys(exerciseMap).length}`);
console.log(`  Unique audio IDs: ${allAudioIds.size}`);
console.log(`  hy_Ani coverage: ${results.hy_Ani.coverage} (${results.hy_Ani.missing} missing)`);
console.log(`  en_female coverage: ${results.en_female.coverage} (${results.en_female.missing} missing)`);
console.log(`  ru_female coverage: ${results.ru_female.coverage} (${results.ru_female.missing} missing)`);

if (results.hy_Ani.missing + results.ru_female.missing > 0) {
  console.log(`\n⚠️ Total missing: ${results.hy_Ani.missing + results.ru_female.missing}`);
  console.log('   Run download scripts to add missing files.');
}