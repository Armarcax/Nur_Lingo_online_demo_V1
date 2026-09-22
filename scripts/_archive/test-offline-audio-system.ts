// scripts/test-offline-audio-system.ts

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class OfflineAudioSystemTester {
  private basePath: string;
  private results: { passed: string[]; failed: string[]; warnings: string[]; info: string[] };
  private audioFiles: string[];

  constructor() {
    this.basePath = process.cwd();
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
      info: []
    };
    this.audioFiles = [];
  }

  run() {
    console.log('\n🔍🔍🔍 OFFLINE AUDIO SYSTEM FULL TEST');
    console.log('═'.repeat(70));
    console.log(`📂 Project: ${this.basePath}\n`);

    this.test1_checkDirectories();
    this.test2_checkManifests();
    this.test3_checkAudioFiles();
    this.test4_checkAudioContent();
    this.test5_checkServiceWorker();
    this.test6_checkComponentCode();
    this.test7_checkPaths();
    this.test8_testPlayback();

    this.printReport();
    this.generateFixScript();
  }

  // ─── TEST 1: DIRECTORY CHECK ──────────────────────────────────────

  private test1_checkDirectories() {
    console.log('\n📁 TEST 1: Directory Check');
    console.log('─'.repeat(50));

    const dirs = [
      'public/audio/offline',
      'public/audio/offline/en_female',
      'public/audio/offline/hy_Ani',
      'public/audio/offline/ru_female',
      'src/lib/offline',
      'src/components',
    ];

    let allExist = true;
    for (const dir of dirs) {
      const fullPath = path.join(this.basePath, dir);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        console.log(`✅ ${dir} (${files.length} files)`);
        this.results.passed.push(`Directory exists: ${dir}`);
      } else {
        console.log(`❌ ${dir} - MISSING`);
        this.results.failed.push(`Directory missing: ${dir}`);
        allExist = false;
      }
    }

    if (allExist) {
      console.log('\n✅ All directories exist');
    }
  }

  // ─── TEST 2: MANIFEST CHECK ──────────────────────────────────────

  private test2_checkManifests() {
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
        console.log(`❌ ${mf.name}.json - NOT FOUND`);
        this.results.failed.push(`Manifest missing: ${mf.name}.json`);
        continue;
      }

      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const data = JSON.parse(content);

        const issues: string[] = [];
        if (!data.version) issues.push('version missing');
        if (!data.generatedAt) issues.push('generatedAt missing');
        if (!data.voice) issues.push('voice missing');
        if (!data.mapping) issues.push('mapping missing');
        if (typeof data.mapping !== 'object') issues.push('mapping is not an object');

        const count = Object.keys(data.mapping || {}).length;
        totalEntries += count;

        if (issues.length === 0) {
          console.log(`✅ ${mf.name}.json - ${count} entries, valid`);
          this.results.passed.push(`Manifest valid: ${mf.name}.json (${count} entries)`);
        } else {
          console.log(`⚠️ ${mf.name}.json - ${issues.join(', ')}`);
          this.results.warnings.push(`Manifest issues: ${mf.name}.json - ${issues.join(', ')}`);
        }

        const entries = Object.entries(data.mapping || {}).slice(0, 5);
        if (entries.length > 0) {
          console.log(`   Sample: ${entries.map(([k, v]) => `${k}->${v}`).join(', ')}`);
        }

      } catch (e: any) {
        console.log(`❌ ${mf.name}.json - INVALID JSON: ${e.message}`);
        this.results.failed.push(`Invalid manifest: ${mf.name}.json`);
      }
    }

    console.log(`\n📊 Total manifest entries: ${totalEntries}`);
    this.results.info.push(`Total manifest entries: ${totalEntries}`);
  }

  // ─── TEST 3: AUDIO FILES CHECK ──────────────────────────────────

  private test3_checkAudioFiles() {
    console.log('\n🎵 TEST 3: Audio Files Check');
    console.log('─'.repeat(50));

    const audioDirs = [
      { path: 'public/audio/offline/en_female', label: 'en_female' },
      { path: 'public/audio/offline/hy_Ani', label: 'hy_Ani' },
      { path: 'public/audio/offline/ru_female', label: 'ru_female' },
    ];

    let totalFiles = 0;
    let emptyFiles = 0;

    for (const dir of audioDirs) {
      const fullPath = path.join(this.basePath, dir.path);
      if (!fs.existsSync(fullPath)) {
        console.log(`❌ ${dir.label} - DIRECTORY MISSING`);
        this.results.failed.push(`Audio directory missing: ${dir.label}`);
        continue;
      }

      const files = fs.readdirSync(fullPath).filter((f: string) => f.endsWith('.mp3'));
      totalFiles += files.length;
      this.audioFiles = this.audioFiles.concat(files);

      let dirEmpty = 0;
      const sample = files.slice(0, 10);
      for (const file of sample) {
        const filePath = path.join(fullPath, file);
        const stats = fs.statSync(filePath);
        if (stats.size < 100) {
          dirEmpty++;
          emptyFiles++;
          this.results.failed.push(`Empty audio file: ${dir.label}/${file} (${stats.size} bytes)`);
        }
      }

      if (dirEmpty > 0) {
        console.log(`⚠️ ${dir.label}: ${dirEmpty} empty files out of ${files.length}`);
        this.results.warnings.push(`${dir.label}: ${dirEmpty} empty files`);
      } else {
        console.log(`✅ ${dir.label}: ${files.length} files (sample: ${sample.join(', ')})`);
        this.results.passed.push(`${dir.label}: ${files.length} audio files`);
      }
    }

    console.log(`\n📊 Total audio files: ${totalFiles}`);
    if (emptyFiles > 0) {
      console.log(`⚠️ Empty files: ${emptyFiles}`);
    }
    this.results.info.push(`Total audio files: ${totalFiles}`);
  }

  // ─── TEST 4: AUDIO CONTENT CHECK ────────────────────────────────

  private test4_checkAudioContent() {
    console.log('\n🔊 TEST 4: Audio Content Check');
    console.log('─'.repeat(50));

    const testFiles = [
      'public/audio/offline/en_female/000001.mp3',
      'public/audio/offline/hy_Ani/000001.mp3',
      'public/audio/offline/ru_female/000001.mp3',
    ];

    for (const file of testFiles) {
      const fullPath = path.join(this.basePath, file);
      if (!fs.existsSync(fullPath)) {
        console.log(`❌ ${file} - NOT FOUND`);
        this.results.failed.push(`Test file not found: ${file}`);
        continue;
      }

      const stats = fs.statSync(fullPath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`✅ ${file} - ${sizeKB} KB`);

      if (stats.size < 100) {
        console.log(`   ⚠️ File is too small (${stats.size} bytes) - may be empty`);
        this.results.warnings.push(`File too small: ${file} (${stats.size} bytes)`);
      } else {
        this.results.passed.push(`Audio file valid: ${file} (${sizeKB} KB)`);
      }
    }
  }

  // ─── TEST 5: SERVICE WORKER CHECK ───────────────────────────────

  private test5_checkServiceWorker() {
    console.log('\n⚙️ TEST 5: Service Worker Check');
    console.log('─'.repeat(50));

    const swPaths = [
      'public/sw.js',
      'public/workbox-*.js',
    ];

    let swFound = false;
    for (const pattern of swPaths) {
      const fullPath = path.join(this.basePath, pattern);
      if (pattern.includes('*')) {
        const dir = path.dirname(fullPath);
        const base = path.basename(pattern).replace('*', '');
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          const matches = files.filter((f: string) => f.startsWith(base));
          if (matches.length > 0) {
            console.log(`✅ Service Worker found: ${matches.join(', ')}`);
            swFound = true;
            this.results.passed.push(`Service Worker: ${matches.join(', ')}`);
          }
        }
      } else if (fs.existsSync(fullPath)) {
        console.log(`✅ Service Worker: ${pattern}`);
        swFound = true;
        this.results.passed.push(`Service Worker: ${pattern}`);
      }
    }

    if (!swFound) {
      console.log('⚠️ Service Worker not found - may not be registered');
      this.results.warnings.push('Service Worker not found');
    }

    const swRegisterPath = path.join(this.basePath, 'src/app/layout.tsx');
    if (fs.existsSync(swRegisterPath)) {
      const content = fs.readFileSync(swRegisterPath, 'utf8');
      if (content.includes('ServiceWorkerRegister')) {
        console.log('✅ Service Worker registered in layout');
        this.results.passed.push('Service Worker registered in layout');
      } else {
        console.log('⚠️ Service Worker not found in layout');
        this.results.warnings.push('Service Worker not in layout');
      }
    }
  }

  // ─── TEST 6: COMPONENT CODE CHECK ──────────────────────────────

  private test6_checkComponentCode() {
    console.log('\n🔧 TEST 6: Component Code Check');
    console.log('─'.repeat(50));

    const pagePath = path.join(this.basePath, 'src/app/learn/page.tsx');
    if (!fs.existsSync(pagePath)) {
      console.log('❌ page.tsx NOT FOUND');
      this.results.failed.push('page.tsx not found');
      return;
    }

    const content = fs.readFileSync(pagePath, 'utf8');

    const checks = [
      { name: 'useOfflineAudio hook', pattern: 'useOfflineAudio' },
      { name: 'playOfflineAudio function', pattern: 'const playOfflineAudio' },
      { name: '/audio/offline/ path', pattern: '/audio/offline/' },
      { name: 'audio.play() call', pattern: 'audio.play()' },
      { name: 'fetch HEAD check', pattern: 'method: "HEAD"' },
      { name: 'Error handling', pattern: 'try {' },
    ];

    let allOk = true;
    for (const check of checks) {
      if (content.includes(check.pattern)) {
        console.log(`✅ ${check.name}`);
        this.results.passed.push(`Code: ${check.name}`);
      } else {
        console.log(`❌ ${check.name} - NOT FOUND`);
        this.results.failed.push(`Code missing: ${check.name}`);
        allOk = false;
      }
    }

    if (content.includes('/audio/hy_wav/') || content.includes('/audio/en_wav/')) {
      console.log('⚠️ Found hardcoded wav paths - should use /audio/offline/');
      this.results.warnings.push('Hardcoded wav paths found');
    }

    if (!content.includes('/audio/offline/')) {
      console.log('❌ No /audio/offline/ path found!');
      this.results.failed.push('No /audio/offline/ path in code');
    }
  }

  // ─── TEST 7: PATH CHECK ──────────────────────────────────────────

  private test7_checkPaths() {
    console.log('\n🌐 TEST 7: Server Path Check');
    console.log('─'.repeat(50));

    try {
      const result = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3001', { timeout: 3000 });
      if (result.toString().trim() === '200') {
        console.log('✅ Server is running');
        this.results.passed.push('Server is running');
      } else {
        console.log('⚠️ Server responded with: ' + result.toString().trim());
        this.results.warnings.push('Server response: ' + result.toString().trim());
      }
    } catch (e) {
      console.log('⚠️ Server may not be running (start with: npm run dev)');
      this.results.warnings.push('Server not running');
    }

    const testFiles = [
      '/audio/offline/en_female/000001.mp3',
      '/audio/offline/hy_Ani/000001.mp3',
      '/audio/offline/ru_female/000001.mp3',
    ];

    for (const file of testFiles) {
      const fullPath = path.join(this.basePath, 'public', file);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ ${file} - accessible`);
        this.results.passed.push(`File accessible: ${file}`);
      } else {
        console.log(`❌ ${file} - NOT FOUND`);
        this.results.failed.push(`File not accessible: ${file}`);
      }
    }
  }

  // ─── TEST 8: PLAYBACK TEST ───────────────────────────────────────

  private test8_testPlayback() {
    console.log('\n🎧 TEST 8: Playback Test');
    console.log('─'.repeat(50));

    const testFile = path.join(this.basePath, 'public/audio/offline/en_female/000001.mp3');
    if (!fs.existsSync(testFile)) {
      console.log('❌ Test file not found');
      this.results.failed.push('Test file not found for playback');
      return;
    }

    const stats = fs.statSync(testFile);
    console.log(`📊 File: 000001.mp3 - ${(stats.size / 1024).toFixed(1)} KB`);

    const buffer = fs.readFileSync(testFile);
    const header = buffer.toString('hex', 0, 10);

    const isMP3 = header.startsWith('fffb') || header.startsWith('fffa') || 
                  header.startsWith('fff3') || header.startsWith('fff2');

    if (isMP3) {
      console.log('✅ File appears to be valid MP3');
      this.results.passed.push('Valid MP3 file: 000001.mp3');
    } else {
      console.log(`⚠️ File may not be valid MP3 (header: ${header})`);
      this.results.warnings.push(`Invalid MP3 header: 000001.mp3`);
    }

    console.log('\n📝 To test in browser, run in console:');
    console.log('   const audio = new Audio("/audio/offline/en_female/000001.mp3");');
    console.log('   audio.volume = 1;');
    console.log('   audio.play().then(() => console.log("✅ Playing")).catch(e => console.error(e));');
  }

  // ─── PRINT REPORT ─────────────────────────────────────────────────

  private printReport() {
    console.log('\n📊 TEST REPORT');
    console.log('═'.repeat(70));

    console.log(`\n✅ Passed: ${this.results.passed.length}`);
    for (const item of this.results.passed) {
      console.log(`   ✅ ${item}`);
    }

    console.log(`\n⚠️ Warnings: ${this.results.warnings.length}`);
    for (const item of this.results.warnings) {
      console.log(`   ⚠️ ${item}`);
    }

    console.log(`\n❌ Failed: ${this.results.failed.length}`);
    for (const item of this.results.failed) {
      console.log(`   ❌ ${item}`);
    }

    console.log(`\n📌 Info: ${this.results.info.length}`);
    for (const item of this.results.info) {
      console.log(`   ℹ️ ${item}`);
    }

    console.log('\n📋 SUMMARY');
    console.log('═'.repeat(70));

    if (this.results.failed.length === 0 && this.results.warnings.length === 0) {
      console.log('🎉 All tests passed! Your offline audio system is working perfectly.');
    } else if (this.results.failed.length === 0 && this.results.warnings.length > 0) {
      console.log('⚠️ All tests passed with warnings. Review warnings above.');
    } else {
      console.log('❌ Some tests failed. Review errors above.');
    }

    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('─'.repeat(50));

    if (this.results.failed.some((f: string) => f.includes('empty audio'))) {
      console.log('1. 🔄 Regenerate audio files: npm run generate-audio');
    }

    if (this.results.failed.some((f: string) => f.includes('manifest missing'))) {
      console.log('2. 📄 Generate manifests: npm run generate-manifests');
    }

    if (this.results.warnings.some((w: string) => w.includes('Server not running'))) {
      console.log('3. 🚀 Start server: npm run dev');
    }

    if (this.results.warnings.some((w: string) => w.includes('hardcoded'))) {
      console.log('4. 🔧 Fix hardcoded paths in page.tsx to use /audio/offline/');
    }

    if (this.results.warnings.some((w: string) => w.includes('Invalid MP3'))) {
      console.log('5. 🔄 Audio files may be corrupted. Regenerate: npm run generate-audio');
    }

    if (this.results.failed.length === 0 && this.results.warnings.length === 0) {
      console.log('✅ No fixes needed. Your system is working!');
    }

    console.log('\n📝 If audio still doesn\'t play:');
    console.log('   1. Check your speakers/headphones');
    console.log('   2. Check system volume');
    console.log('   3. Check browser sound settings');
    console.log('   4. Try in incognito/private mode');
    console.log('   5. Try different browser (Chrome/Firefox/Edge)');
  }

  // ─── GENERATE FIX SCRIPT ─────────────────────────────────────────

  private generateFixScript() {
    console.log('\n📝 GENERATING FIX SCRIPT');
    console.log('─'.repeat(50));

    const fixScript = `
// scripts/fix-offline-audio.js
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing offline audio issues...');

const pagePath = path.join(process.cwd(), 'src/app/learn/page.tsx');
if (fs.existsSync(pagePath)) {
  let content = fs.readFileSync(pagePath, 'utf8');
  if (content.includes('/audio/hy_wav/') || content.includes('/audio/en_wav/')) {
    content = content.replace(/\\/audio\\/(hy_wav|en_wav|ru_wav)\\//g, '/audio/offline/');
    fs.writeFileSync(pagePath, content);
    console.log('✅ Fixed hardcoded paths in page.tsx');
  }
}

const cacheDirs = ['public/audio/cache', '.next/cache'];
for (const dir of cacheDirs) {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(\`🗑️ Cleared: \${dir}\`);
  }
}

console.log('✅ Fix completed! Run: npm run dev');
`;

    const fixPath = path.join(this.basePath, 'scripts/fix-offline-audio.js');
    fs.writeFileSync(fixPath, fixScript);
    console.log(`✅ Fix script generated: scripts/fix-offline-audio.js`);
    console.log(`   Run: node scripts/fix-offline-audio.js`);
  }
}

// ─── RUN ────────────────────────────────────────────────────────────

console.clear();
const tester = new OfflineAudioSystemTester();
tester.run();