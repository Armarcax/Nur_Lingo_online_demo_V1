// scripts/list-audio-files.ts
// Run with: npx tsx scripts/list-audio-files.ts

import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// PATHS
// ============================================================

const AUDIO_DIR = path.join(__dirname, '../public/audio/offline');

// ============================================================
// MAIN FUNCTION
// ============================================================

function listAudioFiles() {
  console.log('📁 Listing audio files...\n');

  // Check if audio directory exists
  if (!fs.existsSync(AUDIO_DIR)) {
    console.error(`❌ Audio directory not found: ${AUDIO_DIR}`);
    return;
  }

  // Get all folders
  const folders = fs.readdirSync(AUDIO_DIR).filter(f => {
    const fullPath = path.join(AUDIO_DIR, f);
    return fs.statSync(fullPath).isDirectory();
  });

  console.log(`📁 Found ${folders.length} folders: ${folders.join(', ')}\n`);

  // ============================================================
  // PROCESS EACH FOLDER
  // ============================================================

  const allFiles: Record<string, string[]> = {};
  let totalFiles = 0;

  for (const folder of folders) {
    const folderPath = path.join(AUDIO_DIR, folder);
    const files = fs.readdirSync(folderPath)
      .filter(f => f.endsWith('.mp3') || f.endsWith('.wav') || f.endsWith('.m4a'));

    allFiles[folder] = files;
    totalFiles += files.length;

    console.log(`📁 ${folder}: ${files.length} files`);
  }

  console.log(`\n📊 Total audio files: ${totalFiles}`);

  // ============================================================
  // SAVE TO JSON
  // ============================================================

  const jsonPath = path.join(__dirname, '../audio-files-list.json');
  fs.writeFileSync(jsonPath, JSON.stringify({
    exportedAt: new Date().toISOString(),
    totalFiles,
    folders: allFiles,
  }, null, 2));
  console.log(`\n✅ JSON saved: ${jsonPath}`);

  // ============================================================
  // SAVE TO TEXT (only filenames)
  // ============================================================

  const txtPath = path.join(__dirname, '../audio-files-list.txt');
  let txtContent = `# Audio Files List\n`;
  txtContent += `# Exported at: ${new Date().toISOString()}\n`;
  txtContent += `# Total files: ${totalFiles}\n\n`;

  for (const [folder, files] of Object.entries(allFiles)) {
    txtContent += `\n## ${folder} (${files.length} files)\n\n`;
    for (const file of files.sort()) {
      txtContent += `${file}\n`;
    }
  }

  fs.writeFileSync(txtPath, txtContent);
  console.log(`✅ TXT saved: ${txtPath}`);

  // ============================================================
  // SAVE ONLY FILENAMES WITHOUT EXTENSION
  // ============================================================

  const namesPath = path.join(__dirname, '../audio-filenames-only.txt');
  let namesContent = '';
  for (const [folder, files] of Object.entries(allFiles)) {
    for (const file of files.sort()) {
      const name = file.replace(/\.(mp3|wav|m4a)$/, '');
      namesContent += `${name}\n`;
    }
  }

  fs.writeFileSync(namesPath, namesContent);
  console.log(`✅ Filenames only saved: ${namesPath}`);

  // ============================================================
  // SAVE AS CSV
  // ============================================================

  const csvPath = path.join(__dirname, '../audio-files-list.csv');
  let csvContent = 'Folder,Filename,Extension,BaseName\n';
  for (const [folder, files] of Object.entries(allFiles)) {
    for (const file of files.sort()) {
      const ext = file.split('.').pop() || '';
      const baseName = file.replace(/\.(mp3|wav|m4a)$/, '');
      csvContent += `"${folder}","${file}","${ext}","${baseName}"\n`;
    }
  }

  fs.writeFileSync(csvPath, csvContent);
  console.log(`✅ CSV saved: ${csvPath}`);

  // ============================================================
  // FIND DUPLICATES
  // ============================================================

  const allNames: Record<string, string[]> = {};
  for (const [folder, files] of Object.entries(allFiles)) {
    for (const file of files) {
      const name = file.replace(/\.(mp3|wav|m4a)$/, '');
      if (!allNames[name]) {
        allNames[name] = [];
      }
      allNames[name].push(folder);
    }
  }

  const duplicates = Object.entries(allNames)
    .filter(([_, folders]) => folders.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

  if (duplicates.length > 0) {
    console.log(`\n⚠️ Found ${duplicates.length} duplicate filenames:`);
    const dupPath = path.join(__dirname, '../audio-duplicates.json');
    fs.writeFileSync(dupPath, JSON.stringify(duplicates.slice(0, 50), null, 2));
    console.log(`   First 50 duplicates saved: ${dupPath}`);
    
    // Show first 10 duplicates
    console.log('\n📝 First 10 duplicates:');
    for (const [name, folders] of duplicates.slice(0, 10)) {
      console.log(`   ${name}: ${folders.join(', ')}`);
    }
  }

  // ============================================================
  // STATISTICS
  // ============================================================

  console.log('\n📊 STATISTICS:');
  console.log('='.repeat(50));

  for (const [folder, files] of Object.entries(allFiles)) {
    const extensions: Record<string, number> = {};
    for (const file of files) {
      const ext = file.split('.').pop() || 'unknown';
      extensions[ext] = (extensions[ext] || 0) + 1;
    }
    console.log(`\n${folder}:`);
    for (const [ext, count] of Object.entries(extensions)) {
      console.log(`   .${ext}: ${count} files`);
    }
  }

  console.log('\n🎯 DONE!');
}

// ============================================================
// RUN
// ============================================================

try {
  listAudioFiles();
} catch (error) {
  console.error('❌ Error:', error);
}