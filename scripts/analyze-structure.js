// scripts/analyze-structure.js
const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing structure...\n');

// ─── 1. Read mappings ─────────────────────────────────────────────

const mappingPath = path.join(process.cwd(), 'src/lib/content/audio-mapping.ts');
const content = fs.readFileSync(mappingPath, 'utf-8');

// Extract EXERCISE_TO_AUDIO
const exerciseMatch = content.match(/EXERCISE_TO_AUDIO\s*:\s*Record<string,\s*string>\s*=\s*{([\s\S]*?)};/);
const audioIds = new Set();
const exerciseMap = {};

if (exerciseMatch) {
  const block = exerciseMatch[1];
  const lineRegex = /['"](\w+)['"]\s*:\s*['"](\w+)['"]/g;
  let match;
  while ((match = lineRegex.exec(block)) !== null) {
    exerciseMap[match[1]] = match[2];
    audioIds.add(match[2]);
  }
}

console.log(`📋 Mappings: ${Object.keys(exerciseMap).length} exercises → ${audioIds.size} unique audio IDs`);

// ─── 2. Check each voice ──────────────────────────────────────────

const voices = ['hy_Ani', 'en_female', 'ru_female'];
const voiceData = {};

for (const voice of voices) {
  const dir = path.join(process.cwd(), 'public/audio/offline', voice);
  const files = new Set();
  const fileList = [];
  
  if (fs.existsSync(dir)) {
    const items = fs.readdirSync(dir).filter(f => f.endsWith('.mp3'));
    for (const item of items) {
      const id = item.replace('.mp3', '');
      files.add(id);
      fileList.push(id);
    }
  }
  
  // Find missing and extra
  const missing = [];
  const extra = [];
  
  for (const id of audioIds) {
    if (!files.has(id)) {
      missing.push(id);
    }
  }
  
  for (const id of files) {
    if (!audioIds.has(id)) {
      extra.push(id);
    }
  }
  
  voiceData[voice] = {
    total: files.size,
    missing: missing.length,
    extra: extra.length,
    missingSample: missing.slice(0, 10),
    extraSample: extra.slice(0, 10),
  };
}

// ─── 3. Print report ──────────────────────────────────────────────

console.log('\n📊 VOICE ANALYSIS');
console.log('═'.repeat(50));

for (const [voice, data] of Object.entries(voiceData)) {
  console.log(`\n🎵 ${voice}:`);
  console.log(`  Total files: ${data.total}`);
  console.log(`  Missing:     ${data.missing}`);
  console.log(`  Extra:       ${data.extra}`);
  
  if (data.missing > 0) {
    console.log(`  Missing sample: ${data.missingSample.join(', ')}`);
  }
  if (data.extra > 0) {
    console.log(`  Extra sample: ${data.extraSample.join(', ')}`);
  }
}

// ─── 4. Group by type ─────────────────────────────────────────────

const wExercises = Object.keys(exerciseMap).filter(k => k.startsWith('w'));
const greetExercises = Object.keys(exerciseMap).filter(k => k.startsWith('greet'));
const otherExercises = Object.keys(exerciseMap).filter(k => !k.startsWith('w') && !k.startsWith('greet'));

console.log('\n📋 EXERCISE TYPES:');
console.log(`  w*     : ${wExercises.length}`);
console.log(`  greet_*: ${greetExercises.length}`);
console.log(`  other  : ${otherExercises.length}`);

// ─── 5. Check world distribution ──────────────────────────────────

const worldMap = {};
for (const key of Object.keys(exerciseMap)) {
  const match = key.match(/^w(\d+)_l(\d+)/);
  if (match) {
    const world = `w${match[1]}`;
    if (!worldMap[world]) worldMap[world] = 0;
    worldMap[world]++;
  }
}

console.log('\n🌍 WORLD DISTRIBUTION:');
for (const [world, count] of Object.entries(worldMap).sort()) {
  console.log(`  ${world}: ${count} exercises`);
}

// ─── 6. Save detailed report ──────────────────────────────────────

const report = {
  timestamp: new Date().toISOString(),
  mappings: {
    total: Object.keys(exerciseMap).length,
    uniqueAudioIds: audioIds.size,
    byType: {
      w: wExercises.length,
      greet: greetExercises.length,
      other: otherExercises.length,
    },
    worlds: worldMap,
  },
  voices: voiceData,
};

const outputPath = path.join(process.cwd(), 'detailed-structure.json');
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
console.log(`\n✅ Detailed report saved: ${outputPath}`);

// ─── 7. Generate missing lists ────────────────────────────────────

for (const [voice, data] of Object.entries(voiceData)) {
  if (data.missing > 0) {
    // Find missing IDs for this voice
    const dir = path.join(process.cwd(), 'public/audio/offline', voice);
    const files = new Set();
    if (fs.existsSync(dir)) {
      const items = fs.readdirSync(dir).filter(f => f.endsWith('.mp3'));
      for (const item of items) {
        files.add(item.replace('.mp3', ''));
      }
    }
    
    const missingIds = [];
    for (const id of audioIds) {
      if (!files.has(id)) {
        missingIds.push(id);
      }
    }
    
    const missingFile = `missing-${voice}.txt`;
    fs.writeFileSync(missingFile, missingIds.join('\n'));
    console.log(`  📄 Missing list saved: ${missingFile} (${missingIds.length} IDs)`);
  }
}

console.log('\n🎉 Done!');