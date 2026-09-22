// scripts/diagnose-offline-audio.ts

import fs from 'fs';
import path from 'path';

interface Manifest {
  version: string;
  generatedAt: string;
  voice: string;
  voiceLabel: string;
  totalFiles: number;
  mapping: Record<string, string>;
}

interface AudioFile {
  path: string;
  exists: boolean;
  size: number;
}

class OfflineAudioDiagnostic {
  private basePath: string;
  private errors: string[] = [];
  private warnings: string[] = [];
  private successes: string[] = [];

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async run() {
    console.log('\n🔍 NUR Lingo Offline Audio Diagnostic');
    console.log('═'.repeat(60));
    console.log(`📂 Base path: ${this.basePath}\n`);

    await this.checkDirectories();
    await this.checkManifests();
    await this.checkAudioFiles();
    await this.checkComponentFiles();
    await this.checkServerRoutes();
    await this.checkLocalStorage();
    await this.generateReport();

    // Exit with error code if issues found
    if (this.errors.length > 0) {
      console.log(`\n❌ Found ${this.errors.length} errors and ${this.warnings.length} warnings`);
      process.exit(1);
    } else if (this.warnings.length > 0) {
      console.log(`\n⚠️ Found ${this.warnings.length} warnings`);
      process.exit(0);
    } else {
      console.log('\n✅ All checks passed!');
      process.exit(0);
    }
  }

  // ─── CHECK DIRECTORIES ─────────────────────────────────────────────

  private async checkDirectories() {
    console.log('\n📁 DIRECTORY CHECK');
    console.log('─'.repeat(40));

    const dirs = [
      { path: 'public/audio/offline', label: 'Offline audio root' },
      { path: 'public/audio/offline/en_female', label: 'English audio' },
      { path: 'public/audio/offline/hy_Ani', label: 'Armenian audio' },
      { path: 'public/audio/offline/ru_female', label: 'Russian audio' },
      { path: 'src/lib/offline', label: 'Offline library' },
      { path: 'src/components', label: 'Components' },
    ];

    for (const dir of dirs) {
      const fullPath = path.join(this.basePath, dir.path);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        const mp3Count = files.filter(f => f.endsWith('.mp3')).length;
        const jsonCount = files.filter(f => f.endsWith('.json')).length;
        const tsCount = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx')).length;
        
        let details = [];
        if (mp3Count > 0) details.push(`${mp3Count} MP3`);
        if (jsonCount > 0) details.push(`${jsonCount} JSON`);
        if (tsCount > 0) details.push(`${tsCount} TS`);
        
        this.successes.push(`✅ ${dir.label}: ${details.join(', ') || 'empty'}`);
        console.log(`✅ ${dir.label}: ${details.join(', ') || 'empty'}`);
      } else {
        this.errors.push(`❌ ${dir.label}: NOT FOUND - ${dir.path}`);
        console.log(`❌ ${dir.label}: NOT FOUND`);
      }
    }
  }

  // ─── CHECK MANIFESTS ──────────────────────────────────────────────

  private async checkManifests() {
    console.log('\n📄 MANIFEST CHECK');
    console.log('─'.repeat(40));

    const manifests = [
      { name: 'en_female', path: 'public/audio/offline/manifest_en_female.json', lang: 'en' },
      { name: 'hy_ani', path: 'public/audio/offline/manifest_hy_ani.json', lang: 'hy' },
      { name: 'ru_female', path: 'public/audio/offline/manifest_ru_female.json', lang: 'ru' },
    ];

    for (const manifest of manifests) {
      const fullPath = path.join(this.basePath, manifest.path);
      if (fs.existsSync(fullPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(fullPath, 'utf8')) as Manifest;
          const count = Object.keys(data.mapping || {}).length;
          
          // Check structure
          let issues = [];
          if (!data.version) issues.push('version missing');
          if (!data.generatedAt) issues.push('generatedAt missing');
          if (!data.voice) issues.push('voice missing');
          if (!data.mapping) issues.push('mapping missing');
          if (count === 0) issues.push('empty mapping');

          if (issues.length === 0) {
            this.successes.push(`✅ ${manifest.name}: ${count} entries, voice: ${data.voiceLabel || data.voice}`);
            console.log(`✅ ${manifest.name}: ${count} entries, voice: ${data.voiceLabel || data.voice}`);
            
            // Show sample
            const entries = Object.entries(data.mapping || {}).slice(0, 3);
            if (entries.length > 0) {
              console.log(`   Sample: ${entries.map(([k, v]) => `${k}->${v}`).join(', ')}`);
            }
          } else {
            this.errors.push(`❌ ${manifest.name}: ${issues.join(', ')}`);
            console.log(`❌ ${manifest.name}: ${issues.join(', ')}`);
          }
        } catch (e) {
          this.errors.push(`❌ ${manifest.name}: INVALID JSON - ${e}`);
          console.log(`❌ ${manifest.name}: INVALID JSON`);
        }
      } else {
        this.errors.push(`❌ ${manifest.name}: NOT FOUND - ${manifest.path}`);
        console.log(`❌ ${manifest.name}: NOT FOUND`);
      }
    }
  }

  // ─── CHECK AUDIO FILES ────────────────────────────────────────────

  private async checkAudioFiles() {
    console.log('\n🎵 AUDIO FILES CHECK');
    console.log('─'.repeat(40));

    const audioDirs = [
      { path: 'public/audio/offline/en_female', label: 'en_female' },
      { path: 'public/audio/offline/hy_Ani', label: 'hy_Ani' },
      { path: 'public/audio/offline/ru_female', label: 'ru_female' },
    ];

    let totalFiles = 0;
    let sampleFiles: string[] = [];

    for (const dir of audioDirs) {
      const fullPath = path.join(this.basePath, dir.path);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.mp3'));
        totalFiles += files.length;
        
        if (files.length > 0) {
          // Check first 5 files
          const samples = files.slice(0, 5);
          sampleFiles = sampleFiles.concat(samples);
          
          // Check file sizes
          let sizeIssues = 0;
          for (const file of samples) {
            const stats = fs.statSync(path.join(fullPath, file));
            if (stats.size < 1000) {
              sizeIssues++;
            }
          }
          
          if (sizeIssues > 0) {
            this.warnings.push(`⚠️ ${dir.label}: ${sizeIssues} files may be corrupted (<1KB)`);
            console.log(`⚠️ ${dir.label}: ${sizeIssues} files may be corrupted (<1KB)`);
          }
          
          console.log(`✅ ${dir.label}: ${files.length} MP3 files`);
          console.log(`   Sample: ${samples.join(', ')}`);
        } else {
          this.errors.push(`❌ ${dir.label}: NO MP3 FILES`);
          console.log(`❌ ${dir.label}: NO MP3 FILES`);
        }
      } else {
        this.errors.push(`❌ ${dir.label}: NOT FOUND - ${dir.path}`);
        console.log(`❌ ${dir.label}: NOT FOUND`);
      }
    }

    console.log(`\n📊 Total audio files: ${totalFiles}`);
    this.successes.push(`📊 Total audio files: ${totalFiles}`);
  }

  // ─── CHECK COMPONENT FILES ────────────────────────────────────────

  private async checkComponentFiles() {
    console.log('\n🔧 COMPONENT CHECK');
    console.log('─'.repeat(40));

    const components = [
      { path: 'src/components/TrilingualAudioPlayer.tsx', label: 'TrilingualAudioPlayer' },
      { path: 'src/components/OfflineIndicator.tsx', label: 'OfflineIndicator' },
      { path: 'src/app/learn/page.tsx', label: 'Learn page' },
    ];

    for (const comp of components) {
      const fullPath = path.join(this.basePath, comp.path);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check for key functions
        const hasTrilingualAudioPlayer = content.includes('TrilingualAudioPlayer');
        const hasOfflineAudio = content.includes('useOfflineAudio');
        const hasOfflineMode = content.includes('offlineAudio.isOfflineMode');
        const hasManifestLoad = content.includes('manifest_') || content.includes('loadManifests');
        const hasAudioPath = content.includes('/audio/offline/');
        
        let issues = [];
        if (comp.label === 'TrilingualAudioPlayer') {
          if (!hasOfflineAudio) issues.push('useOfflineAudio missing');
          if (!hasManifestLoad) issues.push('manifest loading missing');
          if (!hasAudioPath) issues.push('audio path missing');
        }
        if (comp.label === 'Learn page') {
          if (!hasOfflineMode) issues.push('offline mode handling missing');
          if (!hasTrilingualAudioPlayer) issues.push('TrilingualAudioPlayer not used');
        }
        
        if (issues.length === 0) {
          this.successes.push(`✅ ${comp.label}: OK`);
          console.log(`✅ ${comp.label}: OK`);
        } else {
          this.warnings.push(`⚠️ ${comp.label}: ${issues.join(', ')}`);
          console.log(`⚠️ ${comp.label}: ${issues.join(', ')}`);
        }
      } else {
        this.errors.push(`❌ ${comp.label}: NOT FOUND - ${comp.path}`);
        console.log(`❌ ${comp.label}: NOT FOUND`);
      }
    }

    // Check OfflineLessonEngine
    const enginePath = path.join(this.basePath, 'src/lib/offline/OfflineLessonEngine.ts');
    if (fs.existsSync(enginePath)) {
      const content = fs.readFileSync(enginePath, 'utf8');
      const hasAudioCache = content.includes('AudioCache');
      const hasManifests = content.includes('manifests');
      const hasGetAudioPath = content.includes('getAudioPath');
      
      if (hasAudioCache && hasManifests && hasGetAudioPath) {
        this.successes.push('✅ OfflineLessonEngine: OK');
        console.log('✅ OfflineLessonEngine: OK');
      } else {
        this.warnings.push('⚠️ OfflineLessonEngine: missing some functionality');
        console.log('⚠️ OfflineLessonEngine: missing some functionality');
      }
    } else {
      this.errors.push('❌ OfflineLessonEngine: NOT FOUND');
      console.log('❌ OfflineLessonEngine: NOT FOUND');
    }
  }

  // ─── CHECK SERVER ROUTES ──────────────────────────────────────────

  private async checkServerRoutes() {
    console.log('\n🌐 SERVER ROUTE CHECK');
    console.log('─'.repeat(40));

    // Only check if server is running
    const testFiles = [
      '/audio/offline/en_female/000001.mp3',
      '/audio/offline/hy_Ani/000001.mp3',
      '/audio/offline/ru_female/000001.mp3',
    ];

    let accessible = 0;
    for (const file of testFiles) {
      try {
        const url = `http://localhost:3001${file}`;
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          accessible++;
          this.successes.push(`✅ ${file} - accessible (${response.status})`);
          console.log(`✅ ${file} - accessible (${response.status})`);
        } else {
          this.warnings.push(`⚠️ ${file} - ${response.status}`);
          console.log(`⚠️ ${file} - ${response.status}`);
        }
      } catch (error) {
        this.warnings.push(`⚠️ ${file} - SERVER NOT RESPONDING (is server running?)`);
        console.log(`⚠️ ${file} - SERVER NOT RESPONDING (is server running?)`);
      }
    }

    if (accessible === 0) {
      this.errors.push('❌ No audio files accessible via server - check if server is running');
    }
  }

  // ─── CHECK LOCAL STORAGE ──────────────────────────────────────────

  private async checkLocalStorage() {
    console.log('\n💾 LOCAL STORAGE CHECK');
    console.log('─'.repeat(40));

    // This check requires browser context, so we'll check if there's any localStorage data
    // We'll just check if the keys exist in the file system (from saved data)
    const storageKeys = [
      'offline_lessons_data',
      'offline_progress',
      'nurlingo_offline_progress',
      'audio_cache_',
    ];

    console.log('📌 Note: LocalStorage checks require browser context');
    console.log('   Keys to check in browser:');
    for (const key of storageKeys) {
      console.log(`   - ${key}`);
    }
    console.log('   Open browser console and run: Object.keys(localStorage)');
  }

  // ─── GENERATE REPORT ──────────────────────────────────────────────

  private generateReport() {
    console.log('\n📊 DIAGNOSTIC REPORT');
    console.log('═'.repeat(60));

    console.log(`\n✅ Successes: ${this.successes.length}`);
    console.log(`⚠️ Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}\n`);

    if (this.errors.length > 0) {
      console.log('🔴 ERRORS FOUND:');
      for (const error of this.errors) {
        console.log(`   ${error}`);
      }
    }

    if (this.warnings.length > 0) {
      console.log('\n🟡 WARNINGS FOUND:');
      for (const warning of this.warnings) {
        console.log(`   ${warning}`);
      }
    }

    // ─── RECOMMENDATIONS ─────────────────────────────────────────────

    console.log('\n🔧 RECOMMENDATIONS:');

    if (this.errors.some(e => e.includes('NOT FOUND'))) {
      console.log('1. 📁 Create missing directories and files');
    }

    if (this.errors.some(e => e.includes('INVALID JSON'))) {
      console.log('2. 📄 Fix invalid JSON files');
    }

    if (this.warnings.some(w => w.includes('may be corrupted'))) {
      console.log('3. 🔄 Regenerate audio files');
    }

    if (this.warnings.some(w => w.includes('SERVER NOT RESPONDING'))) {
      console.log('4. 🚀 Start the server: npm run dev');
    }

    if (this.errors.length === 0 && this.warnings.length > 0) {
      console.log('5. ⚠️ Review warnings above for potential issues');
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All checks passed! Your offline audio system is ready.');
      console.log('\n📝 Next steps:');
      console.log('   1. Start the app: npm run dev');
      console.log('   2. Enable offline mode');
      console.log('   3. Test audio playback');
    }

    // ─── QUICK FIXES ─────────────────────────────────────────────────

    console.log('\n📝 QUICK FIXES:');

    console.log(`
1. If manifests are missing:
   node scripts/generate-manifests.js

2. If audio files are missing:
   node scripts/generate-audio-files.js

3. To clear cache and rebuild:
   rm -rf .next && npm run dev

4. To test audio in browser:
   Open: http://localhost:3001/audio/offline/hy_Ani/000001.mp3

5. To test offline audio in app:
   - Enable offline mode (click WifiOff icon)
   - Click play button on any exercise
   - Check console for logs
`);
  }
}

// ─── RUN ─────────────────────────────────────────────────────────────

async function runDiagnostic() {
  const diagnostic = new OfflineAudioDiagnostic(process.cwd());
  await diagnostic.run();
}

runDiagnostic().catch(console.error);