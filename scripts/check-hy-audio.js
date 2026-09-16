// scripts/check-hy-audio.js
// Run: node scripts/check-hy-audio.js
//
// Ստուգում է hy_Ani պանակի և manifest_hy_ani.json-ի համապատասխանությունը

const fs = require('fs');
const path = require('path');

// ============================================================
// PATHS
// ============================================================

const HY_DIR = path.join(process.cwd(), 'public', 'audio', 'offline', 'hy_Ani');
const MANIFEST_PATH = path.join(process.cwd(), 'public', 'audio', 'offline', 'manifest_hy_ani.json');

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
// MAIN
// ============================================================

function check() {
  LOG.section('🔍 CHECK HY AUDIO');
  console.log(`Started: ${new Date().toISOString()}`);
  console.log();

  // 1. Check manifest
  LOG.info('Loading manifest...');
  if (!fs.existsSync(MANIFEST_PATH)) {
    LOG.error(`Manifest not found: ${MANIFEST_PATH}`);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const manifestEntries = manifest.mapping || {};
  const manifestKeys = Object.keys(manifestEntries);
  const manifestNums = new Set(Object.values(manifestEntries));

  console.log(`  Manifest entries: ${manifestKeys.length}`);
  console.log(`  Manifest totalFiles: ${manifest.totalFiles}`);
  console.log();

  // 2. Check audio files
  LOG.info('Scanning audio files...');
  if (!fs.existsSync(HY_DIR)) {
    LOG.error(`Directory not found: ${HY_DIR}`);
    return;
  }

  const files = fs.readdirSync(HY_DIR).filter(f => f.endsWith('.mp3'));
  const fileNums = new Set(files.map(f => f.replace('.mp3', '')));

  console.log(`  Audio files: ${files.length}`);
  console.log();

  // 3. Compare
  LOG.section('📊 COMPARISON');

  // In manifest but not in folder
  const inManifestNotFile = [];
  for (const numId of manifestNums) {
    if (!fileNums.has(numId)) {
      inManifestNotFile.push(numId);
    }
  }

  // In folder but not in manifest
  const inFileNotManifest = [];
  for (const numId of fileNums) {
    if (!manifestNums.has(numId)) {
      inFileNotManifest.push(numId);
    }
  }

  console.log(`  ✅ In both (manifest + folder): ${manifestNums.size - inManifestNotFile.length}`);
  console.log(`  📄 In manifest but NOT in folder: ${inManifestNotFile.length}`);
  console.log(`  📁 In folder but NOT in manifest: ${inFileNotManifest.length}`);
  console.log();

  // 4. Show details
  if (inManifestNotFile.length > 0) {
    LOG.warning(`Missing in folder (${inManifestNotFile.length} files):`);
    const sorted = inManifestNotFile.sort((a, b) => parseInt(a) - parseInt(b));
    for (const numId of sorted.slice(0, 20)) {
      // Find which audioId
      let audioId = '';
      for (const [key, val] of Object.entries(manifestEntries)) {
        if (val === numId) {
          audioId = key;
          break;
        }
      }
      console.log(`    - ${numId} (${audioId})`);
    }
    if (sorted.length > 20) {
      console.log(`    ... and ${sorted.length - 20} more`);
    }
    console.log();
  }

  if (inFileNotManifest.length > 0) {
    LOG.warning(`Not in manifest (${inFileNotManifest.length} files):`);
    const sorted = inFileNotManifest.sort((a, b) => parseInt(a) - parseInt(b));
    for (const numId of sorted.slice(0, 20)) {
      console.log(`    - ${numId}`);
    }
    if (sorted.length > 20) {
      console.log(`    ... and ${sorted.length - 20} more`);
    }
    console.log();
  }

  // 5. Check ranges
  LOG.section('📊 RANGE ANALYSIS');

  const nums = Array.from(fileNums).map(Number).sort((a, b) => a - b);
  const manifestNumsArray = Array.from(manifestNums).map(Number).sort((a, b) => a - b);

  console.log(`  Audio files range: ${nums[0] || 'N/A'} - ${nums[nums.length - 1] || 'N/A'}`);
  console.log(`  Manifest range: ${manifestNumsArray[0] || 'N/A'} - ${manifestNumsArray[manifestNumsArray.length - 1] || 'N/A'}`);
  console.log();

  // 6. Check missing numbers in range
  const minNum = Math.min(nums[0] || Infinity, manifestNumsArray[0] || Infinity);
  const maxNum = Math.max(nums[nums.length - 1] || 0, manifestNumsArray[manifestNumsArray.length - 1] || 0);

  if (minNum !== Infinity && maxNum !== 0) {
    const allNums = new Set();
    for (let i = minNum; i <= maxNum; i++) {
      allNums.add(String(i).padStart(6, '0'));
    }

    const missingInBoth = [];
    for (const num of allNums) {
      if (!fileNums.has(num) && !manifestNums.has(num)) {
        missingInBoth.push(num);
      }
    }

    console.log(`  Range: ${String(minNum).padStart(6, '0')} - ${String(maxNum).padStart(6, '0')}`);
    console.log(`  Expected numbers in range: ${maxNum - minNum + 1}`);
    console.log(`  Missing in BOTH (gap): ${missingInBoth.length}`);
    if (missingInBoth.length > 0 && missingInBoth.length <= 20) {
      console.log(`    Gaps: ${missingInBoth.join(', ')}`);
    }
    console.log();
  }

  // 7. Summary
  LOG.section('📊 SUMMARY');

  const isSynced = inManifestNotFile.length === 0 && inFileNotManifest.length === 0;
  const audioCount = files.length;
  const manifestCount = manifestKeys.length;

  console.log(`  Manifest entries: ${manifestCount}`);
  console.log(`  Audio files: ${audioCount}`);
  console.log(`  Status: ${isSynced ? '✅ SYNCED' : '⚠️ NOT SYNCED'}`);

  if (isSynced) {
    LOG.success('✅ All audio files are properly synced with manifest!');
  } else {
    LOG.warning(`⚠️ ${inManifestNotFile.length} files missing from folder, ${inFileNotManifest.length} files not in manifest`);
    console.log();
    console.log('💡 Recommendations:');
    if (inManifestNotFile.length > 0) {
      console.log(`  1. Generate missing files: node scripts/generate-257-missing.js`);
    }
    if (inFileNotManifest.length > 0) {
      console.log(`  2. Remove orphan files or update manifest: npm run sync-audio`);
    }
  }

  console.log('\n✅ Check complete!');
}

// ============================================================
// RUN
// ============================================================

check();