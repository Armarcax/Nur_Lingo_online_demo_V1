// scripts/diagnose-offline-audio-full.ts

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

interface AudioFile {
  path: string;
  exists: boolean;
  size: number;
  duration?: number;
}

class FullOfflineAudioDiagnostic {
  private basePath: string;
  private errors: string[] = [];
  private warnings: string[] = [];
  private info: string[] = [];
  private success: string[] = [];

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async run() {
    console.log('\n🔍🔍🔍 NUR Lingo FULL Offline Audio Diagnostic');
    console.log('═'.repeat(70));
    console.log(`📂 Base path: ${this.basePath}\n`);

    // 1. File System Checks
    await this.checkFileSystem();

    // 2. Manifest Validation
    await this.validateManifests();

    // 3. Audio File Integrity
    await this.checkAudioIntegrity();

    // 4. Code Analysis
    await this.analyzeCode();

    // 5. Runtime Checks
    await this.checkRuntime();

    // 6. Generate Comprehensive Report
    this.generateReport();

    // 7. Auto-Fix Suggestions
    this.suggestFixes();

    // Exit with error code if issues found
    if (this.errors.length > 0) {
      process.exit(1);
    }
  }

  // ─── 1. FILE SYSTEM CHECKS ────────────────────────────────────────

  private async checkFileSystem() {
    console.log('\n📁 FILE SYSTEM CHECK');
    console.log('─'.repeat(50));

    const checks = [
      { path: 'public/audio/offline', required: true },
      { path: 'public/audio/offline/en_female', required: true },
      { path: 'public/audio/offline/hy_Ani', required: true },
      { path: 'public/audio/offline/ru_female', required: true },
      { path: 'src/lib/offline', required: true },
      { path: 'src/components/TrilingualAudioPlayer.tsx', required: true },
      { path: 'src/components/OfflineIndicator.tsx', required: true },
      { path: 'src/app/learn/page.tsx', required: true },
    ];

    for (const check of checks) {
      const fullPath = path.join(this.basePath, check.path);
      const exists = fs.existsSync(fullPath);
      
      if (exists) {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          const files = fs.readdirSync(fullPath);
          this.success.push(`✅ ${check.path} (${files.length} files)`);
          console.log(`✅ ${check.path} (${files.length} files)`);
        } else {
          const size = (stats.size / 1024).toFixed(1);
          this.success.push(`✅ ${check.path} (${size} KB)`);
          console.log(`✅ ${check.path} (${size} KB)`);
        }
      } else {
        this.errors.push(`❌ ${check.path} - MISSING (${check.required ? 'REQUIRED' : 'optional'})`);
        console.log(`❌ ${check.path} - MISSING`);
      }
    }
  }

  // ─── 2. MANIFEST VALIDATION ──────────────────────────────────────

  private async validateManifests() {
    console.log('\n📄 MANIFEST VALIDATION');
    console.log('─'.repeat(50));

    const manifests = [
      { name: 'en_female', path: 'public/audio/offline/manifest_en_female.json', lang: 'en' },
      { name: 'hy_ani', path: 'public/audio/offline/manifest_hy_ani.json', lang: 'hy' },
      { name: 'ru_female', path: 'public/audio/offline/manifest_ru_female.json', lang: 'ru' },
    ];

    for (const mf of manifests) {
      const fullPath = path.join(this.basePath, mf.path);
      
      if (!fs.existsSync(fullPath)) {
        this.errors.push(`❌ ${mf.name}.json - NOT FOUND`);
        console.log(`❌ ${mf.name}.json - NOT FOUND`);
        continue;
      }

      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const data = JSON.parse(content) as Manifest;
        
        // Validate structure
        const issues: string[] = [];
        
        if (!data.version) issues.push('version missing');
        if (!data.generatedAt) issues.push('generatedAt missing');
        if (!data.voice) issues.push('voice missing');
        if (!data.mapping) issues.push('mapping missing');
        if (typeof data.mapping !== 'object') issues.push('mapping is not an object');
        
        const entryCount = Object.keys(data.mapping || {}).length;
        if (entryCount === 0) issues.push('empty mapping');
        
        // Check for invalid entries
        let invalidEntries = 0;
        for (const [key, value] of Object.entries(data.mapping || {})) {
          if (!key || typeof key !== 'string') invalidEntries++;
          if (!value || typeof value !== 'string') invalidEntries++;
          if (value && !/^\d{6}$/.test(value)) {
            this.warnings.push(`⚠️ ${mf.name}: invalid audio ID format: ${key}->${value}`);
          }
        }
        
        if (invalidEntries > 0) {
          issues.push(`${invalidEntries} invalid entries`);
        }

        // Check for duplicate values
        const values = Object.values(data.mapping || {});
        const uniqueValues = new Set(values);
        if (values.length !== uniqueValues.size) {
          const duplicates = values.length - uniqueValues.size;
          issues.push(`${duplicates} duplicate audio IDs`);
        }

        if (issues.length === 0) {
          this.success.push(`✅ ${mf.name}.json - ${entryCount} entries, valid`);
          console.log(`✅ ${mf.name}.json - ${entryCount} entries, valid`);
        } else {
          this.errors.push(`❌ ${mf.name}.json - ${issues.join(', ')}`);
          console.log(`❌ ${mf.name}.json - ${issues.join(', ')}`);
        }

        // Check if manifest entries match audio files
        const audioDir = path.join(this.basePath, `public/audio/offline/${mf.name === 'en_female' ? 'en_female' : mf.name === 'hy_ani' ? 'hy_Ani' : 'ru_female'}`);
        if (fs.existsSync(audioDir)) {
          const audioFiles = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));
          const audioIds = audioFiles.map(f => f.replace('.mp3', ''));
          
          let missingFiles = 0;
          for (const [key, id] of Object.entries(data.mapping || {})) {
            if (!audioIds.includes(id)) {
              missingFiles++;
              this.warnings.push(`⚠️ ${mf.name}: audio file ${id}.mp3 missing for key "${key}"`);
            }
          }
          
          if (missingFiles > 0) {
            this.warnings.push(`⚠️ ${mf.name}: ${missingFiles} audio files missing`);
          }
        }

      } catch (e) {
        this.errors.push(`❌ ${mf.name}.json - INVALID JSON: ${e}`);
        console.log(`❌ ${mf.name}.json - INVALID JSON`);
      }
    }
  }

  // ─── 3. AUDIO FILE INTEGRITY ─────────────────────────────────────

  private async checkAudioIntegrity() {
    console.log('\n🎵 AUDIO FILE INTEGRITY');
    console.log('─'.repeat(50));

    const audioDirs = [
      { path: 'public/audio/offline/en_female', label: 'en_female' },
      { path: 'public/audio/offline/hy_Ani', label: 'hy_Ani' },
      { path: 'public/audio/offline/ru_female', label: 'ru_female' },
    ];

    let totalFiles = 0;
    let corruptedFiles = 0;
    let emptyFiles = 0;

    for (const dir of audioDirs) {
      const fullPath = path.join(this.basePath, dir.path);
      if (!fs.existsSync(fullPath)) {
        this.errors.push(`❌ ${dir.label} directory missing`);
        console.log(`❌ ${dir.label} directory missing`);
        continue;
      }

      const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.mp3'));
      totalFiles += files.length;

      // Check random sample (first 100 files or all if less)
      const sampleSize = Math.min(100, files.length);
      const sample = files.slice(0, sampleSize);
      
      let dirCorrupted = 0;
      let dirEmpty = 0;

      for (const file of sample) {
        const filePath = path.join(fullPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.size === 0) {
          dirEmpty++;
          emptyFiles++;
          this.errors.push(`❌ ${dir.label}: ${file} is empty (0 bytes)`);
        } else if (stats.size < 1000) {
          dirCorrupted++;
          corruptedFiles++;
          this.warnings.push(`⚠️ ${dir.label}: ${file} may be corrupted (${stats.size} bytes)`);
        }
      }

      if (dirCorrupted > 0) {
        this.warnings.push(`⚠️ ${dir.label}: ${dirCorrupted} files may be corrupted`);
      }
      if (dirEmpty > 0) {
        this.errors.push(`❌ ${dir.label}: ${dirEmpty} files are empty`);
      }

      console.log(`✅ ${dir.label}: ${files.length} files (sample: ${sampleSize})`);
    }

    console.log(`\n📊 Total: ${totalFiles} files`);
    if (corruptedFiles > 0) console.log(`   ⚠️ Corrupted: ${corruptedFiles}`);
    if (emptyFiles > 0) console.log(`   ❌ Empty: ${emptyFiles}`);
    this.info.push(`Total audio files: ${totalFiles}`);
  }

  // ─── 4. CODE ANALYSIS ─────────────────────────────────────────────

  private async analyzeCode() {
    console.log('\n🔍 CODE ANALYSIS');
    console.log('─'.repeat(50));

    const filesToCheck = [
      'src/components/TrilingualAudioPlayer.tsx',
      'src/components/OfflineIndicator.tsx',
      'src/app/learn/page.tsx',
      'src/lib/offline/OfflineLessonEngine.ts',
      'src/lib/offline/OfflineAudioEngine.ts',
      'src/lib/offline/OfflineAudioManager.ts',
    ];

    for (const file of filesToCheck) {
      const fullPath = path.join(this.basePath, file);
      if (!fs.existsSync(fullPath)) {
        this.warnings.push(`⚠️ ${file} - NOT FOUND`);
        console.log(`⚠️ ${file} - NOT FOUND`);
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      const issues: string[] = [];
      const found: string[] = [];

      // Check for key imports
      const hasTrilingualImport = content.includes('TrilingualAudioPlayer');
      const hasOfflineImport = content.includes('useOfflineAudio') || content.includes('OfflineAudioManager');
      const hasOfflineMode = content.includes('offlineAudio.isOfflineMode') || content.includes('isOfflineMode');
      const hasManifestLoad = content.includes('manifest_') || content.includes('loadManifests');
      const hasAudioPath = content.includes('/audio/offline/') || content.includes('getAudioPath');
      const hasPlayAudio = content.includes('playAudio') || content.includes('play(');
      const hasErrorHandling = content.includes('try') && content.includes('catch') && content.includes('error');

      if (hasTrilingualImport) found.push('TrilingualAudioPlayer');
      if (hasOfflineImport) found.push('offline import');
      if (hasOfflineMode) found.push('offline mode');
      if (hasManifestLoad) found.push('manifest loading');
      if (hasAudioPath) found.push('audio path');
      if (hasPlayAudio) found.push('play audio');
      if (hasErrorHandling) found.push('error handling');

      // Check for issues
      if (file.includes('page.tsx') && !hasTrilingualImport) {
        issues.push('TrilingualAudioPlayer not used');
      }
      if (file.includes('TrilingualAudioPlayer') && !hasOfflineImport) {
        issues.push('missing offline import');
      }
      if (file.includes('TrilingualAudioPlayer') && !hasManifestLoad) {
        issues.push('manifest loading missing');
      }

      if (issues.length === 0 && found.length > 0) {
        this.success.push(`✅ ${file} - OK (${found.join(', ')})`);
        console.log(`✅ ${file} - OK`);
      } else if (issues.length > 0) {
        this.warnings.push(`⚠️ ${file} - ${issues.join(', ')}`);
        console.log(`⚠️ ${file} - ${issues.join(', ')}`);
      } else {
        this.info.push(`ℹ️ ${file} - ${found.join(', ') || 'no key features found'}`);
        console.log(`ℹ️ ${file} - ${found.join(', ') || 'no key features found'}`);
      }

      // Check for hardcoded paths that might cause issues
      const hardcodedPaths = content.match(/["']\/audio\/[^"']+\.mp3["']/g) || [];
      if (hardcodedPaths.length > 0) {
        this.info.push(`ℹ️ ${file}: ${hardcodedPaths.length} hardcoded paths found`);
      }
    }
  }

  // ─── 5. RUNTIME CHECKS ────────────────────────────────────────────

  private async checkRuntime() {
    console.log('\n🚀 RUNTIME CHECKS');
    console.log('─'.repeat(50));

    // Check if server is running
    try {
      const response = await fetch('http://localhost:3001', { method: 'HEAD' });
      if (response.ok) {
        this.success.push('✅ Server is running');
        console.log('✅ Server is running');
      } else {
        this.warnings.push('⚠️ Server responded but with status: ' + response.status);
        console.log('⚠️ Server responded but with status: ' + response.status);
      }
    } catch {
      this.errors.push('❌ Server is NOT running (start with: npm run dev)');
      console.log('❌ Server is NOT running (start with: npm run dev)');
    }

    // Check audio file accessibility
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
          this.success.push(`✅ ${file} - accessible`);
          console.log(`✅ ${file} - accessible`);
        } else {
          this.warnings.push(`⚠️ ${file} - ${response.status}`);
          console.log(`⚠️ ${file} - ${response.status}`);
        }
      } catch {
        this.warnings.push(`⚠️ ${file} - cannot access (server not responding)`);
        console.log(`⚠️ ${file} - cannot access (server not responding)`);
      }
    }

    if (accessible === 0) {
      this.errors.push('❌ No audio files accessible via HTTP');
    } else if (accessible < 3) {
      this.warnings.push(`⚠️ Only ${accessible}/3 audio files accessible`);
    }
  }

  // ─── 6. GENERATE REPORT ───────────────────────────────────────────

  private generateReport() {
    console.log('\n📊 COMPREHENSIVE REPORT');
    console.log('═'.repeat(70));

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Success: ${this.success.length}`);
    console.log(`   ℹ️ Info: ${this.info.length}`);
    console.log(`   ⚠️ Warnings: ${this.warnings.length}`);
    console.log(`   ❌ Errors: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log('\n🔴 CRITICAL ERRORS:');
      for (const error of this.errors) {
        console.log(`   ${error}`);
      }
    }

    if (this.warnings.length > 0) {
      console.log('\n🟡 WARNINGS:');
      for (const warning of this.warnings) {
        console.log(`   ${warning}`);
      }
    }

    if (this.info.length > 0) {
      console.log('\n📌 INFO:');
      for (const info of this.info) {
        console.log(`   ${info}`);
      }
    }

    if (this.success.length > 0) {
      console.log('\n✅ PASSED:');
      for (const success of this.success) {
        console.log(`   ${success}`);
      }
    }
  }

  // ─── 7. SUGGEST FIXES ─────────────────────────────────────────────

  private suggestFixes() {
    console.log('\n🔧 SUGGESTED FIXES');
    console.log('═'.repeat(70));

    const fixes: string[] = [];

    if (this.errors.some(e => e.includes('MISSING'))) {
      fixes.push('📁 Create missing directories and files');
      fixes.push('   mkdir -p public/audio/offline/en_female');
      fixes.push('   mkdir -p public/audio/offline/hy_Ani');
      fixes.push('   mkdir -p public/audio/offline/ru_female');
    }

    if (this.errors.some(e => e.includes('empty'))) {
      fixes.push('🔊 Regenerate audio files: npm run generate-audio');
      fixes.push('📄 Regenerate manifests: npm run generate-manifests');
    }

    if (this.warnings.some(w => w.includes('TrilingualAudioPlayer not used'))) {
      fixes.push('🎵 Add TrilingualAudioPlayer to page.tsx:');
      fixes.push('   import { TrilingualAudioPlayer } from "@/components/TrilingualAudioPlayer"');
      fixes.push('   Add <TrilingualAudioPlayer entryId={current.id} ... /> in exercise card');
    }

    if (this.errors.some(e => e.includes('Server is NOT running'))) {
      fixes.push('🚀 Start the server: npm run dev');
    }

    if (this.warnings.some(w => w.includes('corrupted'))) {
      fixes.push('🔄 Regenerate corrupted audio files');
      fixes.push('   Run: npm run generate-audio -- --fix-corrupted');
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      fixes.push('✅ All checks passed! Your offline audio system is working perfectly.');
      fixes.push('📝 To test: Enable offline mode and play audio');
    }

    if (fixes.length === 0) {
      fixes.push('✅ No fixes needed. Everything is working!');
    }

    for (const fix of fixes) {
      console.log(`   ${fix}`);
    }

    console.log('\n📝 Quick test:');
    console.log('   1. Open http://localhost:3001/learn?lesson=w1_l1&pair=hy-en');
    console.log('   2. Click WifiOff icon to enable offline mode');
    console.log('   3. Click play button on TrilingualAudioPlayer');
    console.log('   4. Check browser console for logs');
  }
}

// ─── RUN ─────────────────────────────────────────────────────────────

async function runFullDiagnostic() {
  console.clear();
  const diagnostic = new FullOfflineAudioDiagnostic(process.cwd());
  await diagnostic.run();
}

runFullDiagnostic().catch(console.error);