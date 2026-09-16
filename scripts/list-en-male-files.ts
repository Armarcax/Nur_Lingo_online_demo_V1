// scripts/list-en-male-files.ts
// Run with: npx tsx scripts/list-en-male-files.ts

import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// PATHS
// ============================================================

const EN_MALE_DIR = path.join(__dirname, '../public/audio/offline/en_male');

// ============================================================
// MAIN FUNCTION
// ============================================================

function listEnMaleFiles() {
  console.log('📁 Listing en_male audio files...\n');

  // Check if directory exists
  if (!fs.existsSync(EN_MALE_DIR)) {
    console.error(`❌ Directory not found: ${EN_MALE_DIR}`);
    return;
  }

  // Get all audio files
  const files = fs.readdirSync(EN_MALE_DIR)
    .filter(f => f.endsWith('.mp3') || f.endsWith('.wav') || f.endsWith('.m4a'));

  console.log(`📁 en_male: ${files.length} files\n`);

  // ============================================================
  // SAVE TO JSON
  // ============================================================

  const jsonPath = path.join(__dirname, '../en-male-files.json');
  fs.writeFileSync(jsonPath, JSON.stringify({
    folder: 'en_male',
    exportedAt: new Date().toISOString(),
    totalFiles: files.length,
    files: files.sort(),
  }, null, 2));
  console.log(`✅ JSON saved: ${jsonPath}`);

  // ============================================================
  // SAVE TO TXT (with extensions)
  // ============================================================

  const txtPath = path.join(__dirname, '../en-male-files.txt');
  let txtContent = `# en_male Audio Files\n`;
  txtContent += `# Exported at: ${new Date().toISOString()}\n`;
  txtContent += `# Total files: ${files.length}\n\n`;
  for (const file of files.sort()) {
    txtContent += `${file}\n`;
  }
  fs.writeFileSync(txtPath, txtContent);
  console.log(`✅ TXT saved: ${txtPath}`);

  // ============================================================
  // SAVE ONLY FILENAMES (without extension)
  // ============================================================

  const namesPath = path.join(__dirname, '../en-male-filenames-only.txt');
  let namesContent = '';
  for (const file of files.sort()) {
    const name = file.replace(/\.(mp3|wav|m4a)$/, '');
    namesContent += `${name}\n`;
  }
  fs.writeFileSync(namesPath, namesContent);
  console.log(`✅ Filenames only saved: ${namesPath}`);

  // ============================================================
  // SAVE AS CSV
  // ============================================================

  const csvPath = path.join(__dirname, '../en-male-files.csv');
  let csvContent = 'Filename,Extension,BaseName\n';
  for (const file of files.sort()) {
    const ext = file.split('.').pop() || '';
    const baseName = file.replace(/\.(mp3|wav|m4a)$/, '');
    csvContent += `"${file}","${ext}","${baseName}"\n`;
  }
  fs.writeFileSync(csvPath, csvContent);
  console.log(`✅ CSV saved: ${csvPath}`);

  // ============================================================
  // STATISTICS
  // ============================================================

  const extensions: Record<string, number> = {};
  for (const file of files) {
    const ext = file.split('.').pop() || 'unknown';
    extensions[ext] = (extensions[ext] || 0) + 1;
  }

  console.log('\n📊 STATISTICS:');
  console.log(`   Total files: ${files.length}`);
  for (const [ext, count] of Object.entries(extensions)) {
    console.log(`   .${ext}: ${count} files`);
  }

  // ============================================================
  // SAMPLE FILES
  // ============================================================

  console.log('\n📝 Sample files (first 20):');
  for (const file of files.slice(0, 20)) {
    console.log(`   ${file}`);
  }
  if (files.length > 20) {
    console.log(`   ... and ${files.length - 20} more`);
  }

  console.log('\n🎯 DONE!');
  console.log(`\n📁 Generated files in: ${__dirname}`);
  console.log(`   - en-male-files.json`);
  console.log(`   - en-male-files.txt`);
  console.log(`   - en-male-filenames-only.txt`);
  console.log(`   - en-male-files.csv`);
}

// ============================================================
// RUN
// ============================================================

try {
  listEnMaleFiles();
} catch (error) {
  console.error('❌ Error:', error);
}