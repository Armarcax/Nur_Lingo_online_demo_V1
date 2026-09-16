// scripts/diagnose-audio-playback.ts

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface Manifest {
  version: string;
  generatedAt: string;
  voice: string;
  voiceLabel: string;
  totalFiles: number;
  mapping: Record<string, string>;
}

class AudioPlaybackDiagnostic {
  private basePath: string;
  private audioFiles: string[] = [];

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async run() {
    console.log('🔊 NUR Lingo Audio Playback Diagnostic\n');
    console.log('═'.repeat(60));

    await this.checkAudioFiles();
    await this.checkManifests();
    await this.checkMappings();
    await this.checkComponentPaths();
    await this.checkServerRoutes();
    await this.generateSummary();
  }

  private async checkAudioFiles() {
    console.log('\n🎵 AUDIO FILES CHECK');
    console.log('─'.repeat(40));

    const audioDirs = [
      'public/audio/offline/en_female',
      'public/audio/offline/hy_Ani',
      'public/audio/offline/ru_female',
    ];

    let totalFiles = 0;
    for (const dir of audioDirs) {
      const fullPath = path.join(this.basePath, dir);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.mp3'));
        totalFiles += files.length;
        this.audioFiles = this.audioFiles.concat(files);
        console.log(`✅ ${path.basename(dir)}: ${files.length} MP3 files`);
        if (files.length > 0) {
          console.log(`   Sample: ${files.slice(0, 3).join(', ')}`);
        }
      } else {
        console.log(`❌ ${path.basename(dir)}: NOT FOUND`);
      }
    }
    console.log(`\n📊 Total audio files: ${totalFiles}`);
  }

  private async checkManifests() {
    console.log('\n📄 MANIFEST CHECK');
    console.log('─'.repeat(40));

    const manifests = [
      { name: 'en_female', path: 'public/audio/offline/manifest_en_female.json' },
      { name: 'hy_ani', path: 'public/audio/offline/manifest_hy_ani.json' },
      { name: 'ru_female', path: 'public/audio/offline/manifest_ru_female.json' },
    ];

    let totalEntries = 0;
    for (const manifest of manifests) {
      const fullPath = path.join(this.basePath, manifest.path);
      if (fs.existsSync(fullPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(fullPath, 'utf8')) as Manifest;
          const count = Object.keys(data.mapping || {}).length;
          totalEntries += count;
          console.log(`✅ ${manifest.name}: ${count} entries`);
          
          // Show first 5 mappings
          const entries = Object.entries(data.mapping || {}).slice(0, 5);
          if (entries.length > 0) {
            console.log(`   Sample: ${entries.map(([k, v]) => `${k}->${v}`).join(', ')}`);
          }
        } catch (e) {
          console.log(`❌ ${manifest.name}: INVALID JSON`);
        }
      } else {
        console.log(`❌ ${manifest.name}: NOT FOUND`);
      }
    }
    console.log(`\n📊 Total manifest entries: ${totalEntries}`);
  }

  private async checkMappings() {
    console.log('\n🗺️ AUDIO MAPPING CHECK');
    console.log('─'.repeat(40));

    const mappingFiles = [
      'src/lib/content/mappings/audio-num-en-mapping.json',
      'src/lib/content/mappings/audio-num-hy-mapping.json',
      'src/lib/content/mappings/audio-num-ru-mapping.json',
    ];

    for (const file of mappingFiles) {
      const fullPath = path.join(this.basePath, file);
      if (fs.existsSync(fullPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          const count = Object.keys(data.mapping || {}).length;
          console.log(`✅ ${path.basename(file)}: ${count} entries`);
        } catch (e) {
          console.log(`❌ ${path.basename(file)}: INVALID JSON`);
        }
      } else {
        console.log(`⚠️ ${path.basename(file)}: NOT FOUND (may not be needed)`);
      }
    }
  }

  private async checkComponentPaths() {
    console.log('\n🔍 COMPONENT PATH CHECK');
    console.log('─'.repeat(40));

    // Check page.tsx
    const pagePath = path.join(this.basePath, 'src/app/learn/page.tsx');
    if (fs.existsSync(pagePath)) {
      const content = fs.readFileSync(pagePath, 'utf8');
      
      // Check for getAudioPath function
      const hasGetAudioPath = content.includes('getAudioPath');
      const hasPlayOfflineAudio = content.includes('playOfflineAudio');
      const hasCombinedMapping = content.includes('combinedMapping');
      const hasOfflineAudio = content.includes('useOfflineAudio');
      
      console.log('📄 page.tsx:');
      console.log(`   - useOfflineAudio hook: ${hasOfflineAudio ? '✅' : '❌'}`);
      console.log(`   - getAudioPath function: ${hasGetAudioPath ? '✅' : '❌'}`);
      console.log(`   - playOfflineAudio function: ${hasPlayOfflineAudio ? '✅' : '❌'}`);
      console.log(`   - combinedMapping state: ${hasCombinedMapping ? '✅' : '❌'}`);
      
      // Find the playOfflineAudio function
      const playFuncMatch = content.match(/const playOfflineAudio[^]*?}, \[[^\]]*\]\);/s);
      if (playFuncMatch) {
        console.log(`   - playOfflineAudio found: ✅ (${playFuncMatch[0].length} chars)`);
        
        // Check if it uses the correct audio path
        const hasAudioPath = playFuncMatch[0].includes('/audio/offline/');
        const has000001 = playFuncMatch[0].includes('000001');
        console.log(`   - Uses /audio/offline/: ${hasAudioPath ? '✅' : '❌'}`);
        console.log(`   - Has fallback to 000001: ${has000001 ? '✅' : '❌'}`);
      } else {
        console.log(`   - playOfflineAudio found: ❌`);
      }
    } else {
      console.log('❌ page.tsx NOT FOUND');
    }

    // Check OfflineIndicator.tsx
    const indicatorPath = path.join(this.basePath, 'src/components/OfflineIndicator.tsx');
    if (fs.existsSync(indicatorPath)) {
      const content = fs.readFileSync(indicatorPath, 'utf8');
      const hasManifestLoad = content.includes('manifest_en_female.json');
      console.log(`\n📄 OfflineIndicator.tsx:`);
      console.log(`   - Loads manifests: ${hasManifestLoad ? '✅' : '❌'}`);
    }
  }

  private async checkServerRoutes() {
    console.log('\n🌐 SERVER ROUTE CHECK');
    console.log('─'.repeat(40));

    // Check if audio files are accessible via server
    const testFiles = [
      '/audio/offline/en_female/000001.mp3',
      '/audio/offline/hy_Ani/000001.mp3',
      '/audio/offline/ru_female/000001.mp3',
    ];

    for (const file of testFiles) {
      try {
        const url = `http://localhost:3001${file}`;
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          console.log(`✅ ${file} - accessible (${response.status})`);
        } else {
          console.log(`❌ ${file} - NOT accessible (${response.status})`);
        }
      } catch (error) {
        console.log(`❌ ${file} - ERROR: ${error}`);
      }
    }
  }

  private async generateSummary() {
    console.log('\n📊 SUMMARY');
    console.log('═'.repeat(60));

    console.log(`
🔍 Audio Playback Diagnostic Results:

${this.audioFiles.length > 0 ? '✅' : '❌'} Audio files found: ${this.audioFiles.length} MP3 files
${this.audioFiles.includes('000001.mp3') ? '✅' : '❌'} Sample file 000001.mp3 exists

🔧 Common Issues:

1. **Exercise ID doesn't match manifest key**
   - Manifest keys: greet_hello, greet_hi, etc.
   - Exercise IDs: ex_1, ex_2, or numeric
   - Fix: Map exercise IDs to audio IDs

2. **getAudioPath returns null**
   - Check that combinedMapping has the correct keys
   - Add fallback to construct path from exercise ID

3. **Audio directory name mismatch**
   - en_female, hy_Ani, ru_female (check casing)
   - Note: hy_Ani with capital 'A'

4. **CORS or server issue**
   - Check if audio files are served from /public/audio/offline/
   - Try accessing directly: http://localhost:3001/audio/offline/hy_Ani/000001.mp3

🔧 Recommended Fix in page.tsx:

\`\`\`typescript
const playOfflineAudio = useCallback(async () => {
  if (!offlineAudio.isOfflineMode || !current) return;
  
  // Get language and directory
  const lang = loadLangConfig()?.learning || 'hy';
  const audioDir = lang === 'en' ? 'en_female' : lang === 'hy' ? 'hy_Ani' : 'ru_female';
  
  // Try multiple ways to get audio ID
  let audioId = null;
  
  // 1. Try direct mapping
  if (offlineAudio.combinedMapping) {
    audioId = offlineAudio.combinedMapping[current.id];
  }
  
  // 2. Try numeric extraction
  if (!audioId) {
    const numMatch = current.id.match(/\\d+/);
    if (numMatch) {
      audioId = parseInt(numMatch[0]);
    }
  }
  
  // 3. Fallback to 000001
  if (!audioId) {
    audioId = 1;
  }
  
  const audioNum = String(audioId).padStart(6, '0');
  const path = \`/audio/offline/\${audioDir}/\${audioNum}.mp3\`;
  
  console.log('🎯 Audio path:', path);
  
  try {
    const audio = new Audio(path);
    await audio.play();
    showMessage("🔊 Playing audio!", "success");
  } catch (err) {
    console.error('Play error:', err);
    showMessage("❌ Failed to play audio", "error");
  }
}, [offlineAudio, current, showMessage]);
\`\`\`

📝 Next Steps:
1. Check what current.id returns (add console.log)
2. Verify the audio path is correct
3. Test with hardcoded path: /audio/offline/hy_Ani/000001.mp3
`);
  }
}

// Run diagnostic
async function runDiagnostic() {
  const diagnostic = new AudioPlaybackDiagnostic(process.cwd());
  await diagnostic.run();
}

runDiagnostic().catch(console.error);