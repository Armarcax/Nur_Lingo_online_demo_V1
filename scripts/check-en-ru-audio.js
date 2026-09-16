// scripts/check-en-ru-audio.js
// Run: node scripts/check-en-ru-audio.js
//
// Ստուգում է անգլերենի և ռուսերենի համապատասխանությունը

const fs = require('fs');
const path = require('path');

// ============================================================
// PATHS
// ============================================================

const LANGUAGES = [
  {
    name: 'EN',
    dir: path.join(process.cwd(), 'public', 'audio', 'offline', 'en_female'),
    manifest: path.join(process.cwd(), 'public', 'audio', 'offline', 'manifest_en_female.json'),
    label: 'English'
  },
  {
    name: 'RU',
    dir: path.join(process.cwd(), 'public', 'audio', 'offline', 'ru_female'),
    manifest: path.join(process.cwd(), 'public', 'audio', 'offline', 'manifest_ru_female.json'),
    label: 'Russian'
  }
];

// ============================================================
// LOGGER
// ============================================================

const LOG = {
  info: (msg) => console.log(`\x1b[36mℹ\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m✅\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m⚠️\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m❌\x1b[0m ${msg}`),
  section: (msg) => console.log(`\n\x1b[1m━━━ ${msg} ━━━\x1b[0m\n`),
};

// ============================================================
// CHECK SINGLE LANGUAGE
// ============================================================

function checkLanguage(lang) {
  LOG.section(`📊 ${lang.label} (${lang.name})`);

  // 1. Check manifest
  if (!fs.existsSync(lang.manifest)) {
    LOG.error(`Manifest not found: ${lang.manifest}`);
    return null;
  }

  const manifest = JSON.parse(fs.readFileSync(lang.manifest, 'utf-8'));
  const manifestEntries = manifest.mapping || {};
  const manifestKeys = Object.keys(manifestEntries);
  const manifestNums = new Set(Object.values(manifestEntries));

  console.log(`  Manifest entries: ${manifestKeys.length}`);
  console.log(`  Manifest totalFiles: ${manifest.totalFiles}`);
  console.log();

  // 2. Check audio files
  if (!fs.existsSync(lang.dir)) {
    LOG.error(`Directory not found: ${lang.dir}`);
    return null;
  }

  const files = fs.readdirSync(lang.dir).filter(f => f.endsWith('.mp3'));
  const fileNums = new Set(files.map(f => f.replace('.mp3', '')));

  console.log(`  Audio files: ${files.length}`);
  console.log();

  // 3. Compare
  const inManifestNotFile = [];
  for (const numId of manifestNums) {
    if (!fileNums.has(numId)) {
      inManifestNotFile.push(numId);
    }
  }

  const inFileNotManifest = [];
  for (const numId of fileNums) {
    if (!manifestNums.has(numId)) {
      inFileNotManifest.push(numId);
    }
  }

  console.log(`  ✅ In both: ${manifestNums.size - inManifestNotFile.length}`);
  console.log(`  📄 In manifest but NOT in folder: ${inManifestNotFile.length}`);
  console.log(`  📁 In folder but NOT in manifest: ${inFileNotManifest.length}`);
  console.log();

  // 4. Show details
  if (inManifestNotFile.length > 0) {
    LOG.warning(`Missing in folder (${inManifestNotFile.length} files):`);
    const sorted = inManifestNotFile.sort((a, b) => parseInt(a) - parseInt(b));
    for (const numId of sorted.slice(0, 10)) {
      console.log(`    - ${numId}`);
    }
    if (sorted.length > 10) {
      console.log(`    ... and ${sorted.length - 10} more`);
    }
    console.log();
  }

  if (inFileNotManifest.length > 0) {
    LOG.warning(`Not in manifest (${inFileNotManifest.length} files):`);
    const sorted = inFileNotManifest.sort((a, b) => parseInt(a) - parseInt(b));
    for (const numId of sorted.slice(0, 10)) {
      console.log(`    - ${numId}`);
    }
    if (sorted.length > 10) {
      console.log(`    ... and ${sorted.length - 10} more`);
    }
    console.log();
  }

  // 5. Range analysis
  const nums = Array.from(fileNums).map(Number).sort((a, b) => a - b);
  const manifestNumsArray = Array.from(manifestNums).map(Number).sort((a, b) => a - b);

  console.log(`  Audio range: ${nums[0] || 'N/A'} - ${nums[nums.length - 1] || 'N/A'}`);
  console.log(`  Manifest range: ${manifestNumsArray[0] || 'N/A'} - ${manifestNumsArray[manifestNumsArray.length - 1] || 'N/A'}`);
  console.log();

  // 6. Summary
  const isSynced = inManifestNotFile.length === 0 && inFileNotManifest.length === 0;

  console.log(`  Status: ${isSynced ? '✅ SYNCED' : '⚠️ NOT SYNCED'}`);

  return {
    name: lang.name,
    manifestCount: manifestKeys.length,
    audioCount: files.length,
    inManifestNotFile: inManifestNotFile.length,
    inFileNotManifest: inFileNotManifest.length,
    isSynced,
    manifestNums,
    fileNums
  };
}

// ============================================================
// MAIN
// ============================================================

function main() {
  LOG.section('🔍 CHECK EN & RU AUDIO');
  console.log(`Started: ${new Date().toISOString()}`);
  console.log();

  const results = [];

  for (const lang of LANGUAGES) {
    const result = checkLanguage(lang);
    if (result) {
      results.push(result);
    }
    console.log();
  }

  // Overall summary
  LOG.section('📊 OVERALL SUMMARY');
  console.log();

  for (const result of results) {
    console.log(`  ${result.name}:`);
    console.log(`    Manifest: ${result.manifestCount}`);
    console.log(`    Audio: ${result.audioCount}`);
    console.log(`    Missing in folder: ${result.inManifestNotFile}`);
    console.log(`    Not in manifest: ${result.inFileNotManifest}`);
    console.log(`    Status: ${result.isSynced ? '✅ SYNCED' : '⚠️ NOT SYNCED'}`);
    console.log();
  }

  const allSynced = results.every(r => r.isSynced);
  if (allSynced) {
    LOG.success('✅ All languages are properly synced!');
  } else {
    LOG.warning('⚠️ Some languages have issues. See details above.');
  }

  console.log('\n✅ Check complete!');
}

// ============================================================
// RUN
// ============================================================

main();