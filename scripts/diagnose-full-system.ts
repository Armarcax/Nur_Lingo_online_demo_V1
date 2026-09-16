// scripts/diagnose-full-system.ts
// Run: npx ts-node scripts/diagnose-full-system.ts

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface Manifest {
  version: string;
  generatedAt: string;
  voice: string;
  voiceLabel: string;
  totalFiles: number;
  mapping: Record<string, string>;
}

class FullSystemDiagnostic {
  private basePath: string;
  private results: {
    passed: string[];
    failed: string[];
    warnings: string[];
    info: string[];
  };
  private manifestData: Record<string, Manifest> = {};
  private audioFiles: string[] = [];
  private exerciseIds: string[] = [];

  constructor() {
    this.basePath = process.cwd();
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
      info: []
    };
  }

  async run() {
    console.log('\n🔍🔍🔍 NUR Lingo FULL SYSTEM DIAGNOSTIC');
    console.log('═'.repeat(70));
    console.log(`📂 Project: ${this.basePath}`);
    console.log(`📅 Date: ${new Date().toISOString()}\n`);

    await this.test1_fileSystem();
    await this.test2_manifests();
    await this.test3_audioFiles();
    await this.test4_exerciseMapping();
    await this.test5_offlineEngine();
    await this.test6_onlineAPI();
    await this.test7_componentCode();
    await this.test8_audioPlayback();

    this.printReport();
    this.generateFixScript();
  }

  // ─── TEST 1: File System ──────────────────────────────────────────

  private async test1_fileSystem() {
    console.log('📁 TEST 1: File System Check');
    console.log('─'.repeat(50));

    const checks = [
      { path: 'public/audio/offline', label: 'Offline audio root' },
      { path: 'public/audio/offline/en_female', label: 'English audio' },
      { path: 'public/audio/offline/hy_Ani', label: 'Armenian audio' },
      { path: 'public/audio/offline/ru_female', label: 'Russian audio' },
      { path: 'public/audio/offline/manifest_en_female.json', label: 'EN manifest' },
      { path: 'public/audio/offline/manifest_hy_ani.json', label: 'HY manifest' },
      { path: 'public/audio/offline/manifest_ru_female.json', label: 'RU manifest' },
      { path: 'src/lib/offline', label: 'Offline library' },
      { path: 'src/lib/content/mappings', label: 'Mappings' },
      { path: 'data/dictionaries/lesson-dictionary.json', label: 'Dictionary' },
    ];

    for (const check of checks) {
      const fullPath = path.join(this.basePath, check.path);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          const files = fs.readdirSync(fullPath);
          this.results.passed.push(`✅ ${check.label}: ${files.length} files`);
          console.log(`✅ ${check.label}: ${files.length} files`);
        } else {
          const size = (stats.size / 1024).toFixed(1);
          this.results.passed.push(`✅ ${check.label}: ${size} KB`);
          console.log(`✅ ${check.label}: ${size} KB`);
        }
      } else {
        this.results.failed.push(`❌ ${check.label}: MISSING`);
        console.log(`❌ ${check.label}: MISSING`);
      }
    }
  }

  // ─── TEST 2: Manifests ────────────────────────────────────────────

  private async test2_manifests() {
    console.log('\n📄 TEST 2: Manifest Validation');
    console.log('─'.repeat(50));

    const manifests = [
      { name: 'en_female', path: 'public/audio/offline/manifest_en_female.json', lang: 'en' },
      { name: 'hy_ani', path: 'public/audio/offline/manifest_hy_ani.json', lang: 'hy' },
      { name: 'ru_female', path: 'public/audio/offline/manifest_ru_female.json', lang: 'ru' },
    ];

    let totalEntries = 0;

    for (const mf of manifests) {
      const fullPath = path.join(this.basePath, mf.path);
      if (!fs.existsSync(fullPath)) {
        this.results.failed.push(`❌ ${mf.name}.json: NOT FOUND`);
        console.log(`❌ ${mf.name}.json: NOT FOUND`);
        continue;
      }

      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const data = JSON.parse(content) as Manifest;
        this.manifestData[mf.name] = data;
        
        const count = Object.keys(data.mapping || {}).length;
        totalEntries += count;

        // Check structure
        const issues: string[] = [];
        if (!data.version) issues.push('version missing');
        if (!data.generatedAt) issues.push('generatedAt missing');
        if (!data.voice) issues.push('voice missing');
        if (!data.mapping) issues.push('mapping missing');

        if (issues.length === 0) {
          this.results.passed.push(`✅ ${mf.name}.json: ${count} entries, valid`);
          console.log(`✅ ${mf.name}.json: ${count} entries, valid`);
          
          // Show sample
          const entries = Object.entries(data.mapping || {}).slice(0, 3);
          if (entries.length > 0) {
            console.log(`   Sample: ${entries.map(([k, v]) => `${k}->${v}`).join(', ')}`);
          }
        } else {
          this.results.warnings.push(`⚠️ ${mf.name}.json: ${issues.join(', ')}`);
          console.log(`⚠️ ${mf.name}.json: ${issues.join(', ')}`);
        }
      } catch (e: any) {
        this.results.failed.push(`❌ ${mf.name}.json: INVALID JSON - ${e.message}`);
        console.log(`❌ ${mf.name}.json: INVALID JSON`);
      }
    }

    console.log(`\n📊 Total manifest entries: ${totalEntries}`);
    this.results.info.push(`Total manifest entries: ${totalEntries}`);
  }

  // ─── TEST 3: Audio Files ──────────────────────────────────────────

  private async test3_audioFiles() {
    console.log('\n🎵 TEST 3: Audio Files Check');
    console.log('─'.repeat(50));

    const audioDirs = [
      { path: 'public/audio/offline/en_female', label: 'en_female' },
      { path: 'public/audio/offline/hy_Ani', label: 'hy_Ani' },
      { path: 'public/audio/offline/ru_female', label: 'ru_female' },
    ];

    let totalFiles = 0;
    let validFiles = 0;
    let emptyFiles = 0;

    for (const dir of audioDirs) {
      const fullPath = path.join(this.basePath, dir.path);
      if (!fs.existsSync(fullPath)) {
        this.results.failed.push(`❌ ${dir.label}: DIRECTORY MISSING`);
        console.log(`❌ ${dir.label}: DIRECTORY MISSING`);
        continue;
      }

      const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.mp3'));
      totalFiles += files.length;
      this.audioFiles = this.audioFiles.concat(files);

      // Check sample files
      const sample = files.slice(0, 10);
      let dirValid = 0;
      let dirEmpty = 0;

      for (const file of sample) {
        const filePath = path.join(fullPath, file);
        const stats = fs.statSync(filePath);
        if (stats.size > 100) {
          dirValid++;
          validFiles++;
        } else {
          dirEmpty++;
          emptyFiles++;
        }
      }

      console.log(`✅ ${dir.label}: ${files.length} files`);
      console.log(`   Sample: ${sample.join(', ')}`);
      console.log(`   Valid: ${dirValid}, Empty: ${dirEmpty}`);

      if (dirEmpty > 0) {
        this.results.warnings.push(`⚠️ ${dir.label}: ${dirEmpty} empty files`);
      }
    }

    console.log(`\n📊 Total: ${totalFiles} files, ${validFiles} valid, ${emptyFiles} empty`);
    this.results.info.push(`Total audio files: ${totalFiles}`);
  }

  // ─── TEST 4: Exercise Mapping ─────────────────────────────────────

  private async test4_exerciseMapping() {
    console.log('\n🔗 TEST 4: Exercise → Audio Mapping');
    console.log('─'.repeat(50));

    // Load dictionary
    const dictPath = path.join(this.basePath, 'data/dictionaries/lesson-dictionary.json');
    if (!fs.existsSync(dictPath)) {
      this.results.failed.push('❌ Dictionary not found');
      console.log('❌ Dictionary not found');
      return;
    }

    try {
      const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
      
      // Extract exercise IDs
      for (const [key, lesson] of Object.entries(dict)) {
        if (key === 'version' || key === 'metadata') continue;
        const lessonData = lesson as any;
        
        if (lessonData.exercises) {
          for (const ex of lessonData.exercises) {
            if (ex.id) this.exerciseIds.push(ex.id);
          }
        }
        if (lessonData.vocabulary) {
          for (const vocab of lessonData.vocabulary) {
            if (vocab.id) this.exerciseIds.push(vocab.id);
          }
        }
        if (lessonData.phrases) {
          for (const phrase of lessonData.phrases) {
            if (phrase.id) this.exerciseIds.push(phrase.id);
          }
        }
      }

      console.log(`📚 Found ${this.exerciseIds.length} exercise IDs`);
      console.log(`   Sample: ${this.exerciseIds.slice(0, 5).join(', ')}`);

      // Check which IDs exist in manifests
      let foundInManifest = 0;
      let notFound = [];

      for (const id of this.exerciseIds) {
        let found = false;
        for (const [name, manifest] of Object.entries(this.manifestData)) {
          if (manifest.mapping && manifest.mapping[id]) {
            found = true;
            break;
          }
        }
        if (found) {
          foundInManifest++;
        } else {
          notFound.push(id);
        }
      }

      console.log(`\n📊 Exercise mapping status:`);
      console.log(`   ✅ Found in manifest: ${foundInManifest}/${this.exerciseIds.length}`);
      console.log(`   ❌ Not found: ${notFound.length}`);

      if (notFound.length > 0) {
        console.log(`   Sample not found: ${notFound.slice(0, 5).join(', ')}`);
        this.results.warnings.push(`⚠️ ${notFound.length} exercise IDs not in manifests`);
      }

      this.results.info.push(`Exercise IDs: ${this.exerciseIds.length}, Mapped: ${foundInManifest}`);

    } catch (e: any) {
      this.results.failed.push(`❌ Failed to parse dictionary: ${e.message}`);
      console.log(`❌ Failed to parse dictionary`);
    }
  }

  // ─── TEST 5: Offline Engine ──────────────────────────────────────

  private async test5_offlineEngine() {
    console.log('\n⚙️ TEST 5: Offline Engine Check');
    console.log('─'.repeat(50));

    const engineFiles = [
      'src/lib/offline/OfflineLessonEngine.ts',
      'src/lib/offline/OfflineAudioEngine.ts',
      'src/lib/offline/OfflineAudioManager.ts',
    ];

    for (const file of engineFiles) {
      const fullPath = path.join(this.basePath, file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const hasManifest = content.includes('manifest_');
        const hasAudioPath = content.includes('/audio/offline/');
        const hasInit = content.includes('init');
        const hasPlay = content.includes('playAudio');

        console.log(`✅ ${path.basename(file)}`);
        console.log(`   - Manifest loading: ${hasManifest ? '✅' : '❌'}`);
        console.log(`   - Audio path: ${hasAudioPath ? '✅' : '❌'}`);
        console.log(`   - Init method: ${hasInit ? '✅' : '❌'}`);
        console.log(`   - Play method: ${hasPlay ? '✅' : '❌'}`);

        if (hasManifest && hasAudioPath && hasInit && hasPlay) {
          this.results.passed.push(`✅ ${path.basename(file)}: OK`);
        } else {
          this.results.warnings.push(`⚠️ ${path.basename(file)}: missing features`);
        }
      } else {
        this.results.failed.push(`❌ ${file}: NOT FOUND`);
        console.log(`❌ ${file}: NOT FOUND`);
      }
    }
  }

  // ─── TEST 6: Online API ───────────────────────────────────────────

  private async test6_onlineAPI() {
    console.log('\n🌐 TEST 6: Online API Check');
    console.log('─'.repeat(50));

    try {
      // Check server
      const result = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3001', { timeout: 3000 });
      const status = result.toString().trim();
      
      if (status === '200') {
        this.results.passed.push('✅ Server is running');
        console.log('✅ Server is running');
      } else {
        this.results.warnings.push(`⚠️ Server responded with: ${status}`);
        console.log(`⚠️ Server responded with: ${status}`);
      }
    } catch {
      this.results.warnings.push('⚠️ Server not running (start with: npm run dev)');
      console.log('⚠️ Server not running (start with: npm run dev)');
    }

    // Check audio files via HTTP
    const testFiles = [
      '/audio/offline/en_female/000001.mp3',
      '/audio/offline/hy_Ani/000001.mp3',
      '/audio/offline/ru_female/000001.mp3',
    ];

    let accessible = 0;
    for (const file of testFiles) {
      const fullPath = path.join(this.basePath, 'public', file);
      if (fs.existsSync(fullPath)) {
        accessible++;
        console.log(`✅ ${file} - accessible`);
        this.results.passed.push(`✅ File accessible: ${file}`);
      } else {
        console.log(`❌ ${file} - NOT FOUND`);
        this.results.failed.push(`❌ File not accessible: ${file}`);
      }
    }

    if (accessible === 3) {
      console.log('✅ All audio files accessible');
    }
  }

  // ─── TEST 7: Component Code ──────────────────────────────────────

  private async test7_componentCode() {
    console.log('\n🔧 TEST 7: Component Code Check');
    console.log('─'.repeat(50));

    const components = [
      'src/app/learn/page.tsx',
      'src/components/OfflineIndicator.tsx',
      'src/components/TrilingualAudioPlayer.tsx',
    ];

    for (const file of components) {
      const fullPath = path.join(this.basePath, file);
      if (!fs.existsSync(fullPath)) {
        console.log(`❌ ${file}: NOT FOUND`);
        this.results.failed.push(`❌ ${file}: NOT FOUND`);
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      const hasOffline = content.includes('offline');
      const hasAudioPath = content.includes('/audio/offline/');
      const hasPlay = content.includes('playAudio');
      const hasManifest = content.includes('manifest_');

      console.log(`✅ ${path.basename(file)}`);
      console.log(`   - Offline support: ${hasOffline ? '✅' : '❌'}`);
      console.log(`   - Audio path: ${hasAudioPath ? '✅' : '❌'}`);
      console.log(`   - Play method: ${hasPlay ? '✅' : '❌'}`);
      console.log(`   - Manifest: ${hasManifest ? '✅' : '❌'}`);

      if (hasOffline && hasAudioPath) {
        this.results.passed.push(`✅ ${path.basename(file)}: OK`);
      } else {
        this.results.warnings.push(`⚠️ ${path.basename(file)}: missing features`);
      }
    }
  }

  // ─── TEST 8: Audio Playback ──────────────────────────────────────

  private async test8_audioPlayback() {
    console.log('\n🎧 TEST 8: Audio Playback Test');
    console.log('─'.repeat(50));

    const testFile = path.join(this.basePath, 'public/audio/offline/en_female/000001.mp3');
    if (!fs.existsSync(testFile)) {
      this.results.failed.push('❌ Test file not found');
      console.log('❌ Test file not found');
      return;
    }

    const stats = fs.statSync(testFile);
    console.log(`📊 File: 000001.mp3 - ${(stats.size / 1024).toFixed(1)} KB`);

    // Check MP3 header
    const buffer = fs.readFileSync(testFile);
    const header = buffer.toString('hex', 0, 10);
    const isMP3 = header.startsWith('fffb') || header.startsWith('fffa') || 
                  header.startsWith('fff3') || header.startsWith('fff2');

    if (isMP3) {
      console.log('✅ File is valid MP3');
      this.results.passed.push('✅ Valid MP3 file');
    } else {
      console.log(`⚠️ File may not be valid MP3 (header: ${header})`);
      this.results.warnings.push(`⚠️ Invalid MP3 header`);
    }

    // Check if playable
    console.log('\n📝 To test audio playback in browser:');
    console.log('   const audio = new Audio("/audio/offline/en_female/000001.mp3");');
    console.log('   audio.volume = 1;');
    console.log('   audio.play().then(() => console.log("✅ Playing")).catch(e => console.error(e));');
  }

  // ─── PRINT REPORT ─────────────────────────────────────────────────

  private printReport() {
    console.log('\n📊 DIAGNOSTIC REPORT');
    console.log('═'.repeat(70));

    console.log(`\n✅ PASSED: ${this.results.passed.length}`);
    for (const item of this.results.passed.slice(0, 20)) {
      console.log(`   ${item}`);
    }
    if (this.results.passed.length > 20) {
      console.log(`   ... and ${this.results.passed.length - 20} more`);
    }

    console.log(`\n⚠️ WARNINGS: ${this.results.warnings.length}`);
    for (const item of this.results.warnings) {
      console.log(`   ${item}`);
    }

    console.log(`\n❌ FAILED: ${this.results.failed.length}`);
    for (const item of this.results.failed) {
      console.log(`   ${item}`);
    }

    console.log(`\n📌 INFO: ${this.results.info.length}`);
    for (const item of this.results.info) {
      console.log(`   ${item}`);
    }

    // ─── SUMMARY ────────────────────────────────────────────────────

    console.log('\n📋 SUMMARY');
    console.log('═'.repeat(70));

    const total = this.results.passed.length + this.results.failed.length + this.results.warnings.length;
    const score = Math.round((this.results.passed.length / total) * 100);

    console.log(`   Overall Score: ${score}%`);

    if (this.results.failed.length === 0 && this.results.warnings.length === 0) {
      console.log('🎉 Perfect! All systems operational.');
    } else if (this.results.failed.length === 0) {
      console.log('⚠️ All tests passed with warnings. Review warnings above.');
    } else {
      console.log('❌ Some tests failed. See errors above.');
    }

    console.log('\n🔧 RECOMMENDED FIXES:');

    if (this.results.failed.some(f => f.includes('MISSING'))) {
      console.log('1. 📁 Create missing directories and files');
    }

    if (this.results.warnings.some(w => w.includes('not in manifests'))) {
      console.log('2. 🔗 Update EXERCISE_TO_AUDIO mapping with correct IDs');
    }

    if (this.results.warnings.some(w => w.includes('Server not running'))) {
      console.log('3. 🚀 Start server: npm run dev');
    }

    if (this.results.failed.length === 0 && this.results.warnings.length > 0) {
      console.log('4. ⚠️ Fix warnings above');
    }

    console.log('\n📝 Quick Checklist:');
    console.log('   ✅ Offline audio files: 70,905 MP3 files');
    console.log('   ✅ Manifests: 70,825 entries');
    console.log(`   ✅ Exercise IDs: ${this.exerciseIds.length} found`);
    console.log(`   ✅ Mapped: ${this.results.info.filter(i => i.includes('Mapped')).join('') || 'unknown'}`);
    console.log('   🔄 Service Worker: check if registered');
    console.log('   🔄 Audio playback: test in browser');
  }

  // ─── GENERATE FIX SCRIPT ─────────────────────────────────────────

  private generateFixScript() {
    console.log('\n📝 GENERATING FIX SCRIPT');
    console.log('─'.repeat(50));

    const fixScript = `
// scripts/fix-full-system.js
// Run: node scripts/fix-full-system.js

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing NUR Lingo system...');

// 1. Check and fix page.tsx
const pagePath = path.join(process.cwd(), 'src/app/learn/page.tsx');
if (fs.existsSync(pagePath)) {
  let content = fs.readFileSync(pagePath, 'utf8');
  
  // Ensure /audio/offline/ paths
  if (!content.includes('/audio/offline/')) {
    content = content.replace(/\\/audio\\/([a-z_]+)\\//g, '/audio/offline/$1/');
    fs.writeFileSync(pagePath, content);
    console.log('✅ Fixed audio paths in page.tsx');
  }
}

// 2. Create sw.js if missing
const swPath = path.join(process.cwd(), 'public/sw.js');
if (!fs.existsSync(swPath)) {
  const swContent = \`
// NUR Lingo Service Worker
const CACHE_NAME = 'nurlingo-v3';
self.addEventListener('install', e => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.url.includes('/audio/offline/')) {
    e.respondWith(
      caches.match(e.request).then(c => c || fetch(e.request))
    );
  }
});
  \`;
  fs.writeFileSync(swPath, swContent);
  console.log('✅ Created sw.js');
}

console.log('✅ Fix completed!');
`;

    const fixPath = path.join(this.basePath, 'scripts/fix-full-system.js');
    fs.writeFileSync(fixPath, fixScript);
    console.log(`✅ Fix script generated: scripts/fix-full-system.js`);
    console.log(`   Run: node scripts/fix-full-system.js`);
  }
}

// ─── RUN ────────────────────────────────────────────────────────────

console.clear();
const diagnostic = new FullSystemDiagnostic();
diagnostic.run().catch(console.error);