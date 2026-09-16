// scripts/export-structure.js
const fs = require('fs');
const path = require('path');

function main() {
  console.log('🔍 Exporting structure...\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    dictionaries: {},
    mappings: {},
    audioFiles: {},
  };

  // 1. Check audio-mapping.ts
  const mappingPath = path.join(process.cwd(), 'src/lib/content/audio-mapping.ts');
  if (fs.existsSync(mappingPath)) {
    const content = fs.readFileSync(mappingPath, 'utf-8');
    const exerciseMatch = content.match(/EXERCISE_TO_AUDIO\s*:\s*Record<string,\s*string>\s*=\s*{([\s\S]*?)};/);
    if (exerciseMatch) {
      const block = exerciseMatch[1];
      const entries = block.match(/['"](\w+)['"]\s*:\s*['"](\w+)['"]/g) || [];
      report.mappings['audio-mapping.ts'] = {
        exerciseToAudio: entries.length,
        sample: entries.slice(0, 10).map(e => e.trim()),
      };
    }
  }

  // 2. Check audio files
  const audioBase = path.join(process.cwd(), 'public/audio/offline');
  const voices = ['hy_Ani', 'en_female', 'ru_female'];
  for (const voice of voices) {
    const dir = path.join(audioBase, voice);
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.mp3'));
      report.audioFiles[voice] = {
        count: files.length,
        sample: files.slice(0, 5),
      };
    }
  }

  // 3. Save report
  const outputPath = path.join(process.cwd(), 'structure-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`✅ Report saved: ${outputPath}`);
  
  // 4. Print summary
  console.log('\n📊 Summary:');
  console.log(`  Mappings: ${report.mappings['audio-mapping.ts']?.exerciseToAudio || 0} entries`);
  for (const [voice, data] of Object.entries(report.audioFiles)) {
    console.log(`  ${voice}: ${data.count} files`);
  }
}

main();