// scripts/offline-audio-audit.js
// 🎵 NUR Lingo - Offline Audio System Full Audit
// Գործարկել՝ node scripts/offline-audio-audit.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================
// 📁 ԿՈՆՖԻԳՈՒՐԱՑԻԱ
// ============================================================

const PROJECT_ROOT = process.cwd();
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

// ============================================================
// 📊 AUDIT CLASS
// ============================================================

class OfflineAudioAudit {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
      info: [],
      stats: {
        totalAudioFiles: 0,
        totalManifestEntries: 0,
        totalDictionaryEntries: 0,
        totalLessons: 0,
        totalWorlds: 0,
        totalExercises: 0,
      }
    };
    this.startTime = Date.now();
  }

  // ─── LOGGING ──────────────────────────────────────────────────────────

  log(message, type = 'info') {
    const prefix = {
      pass: `${COLORS.green}✅${COLORS.reset}`,
      fail: `${COLORS.red}❌${COLORS.reset}`,
      warn: `${COLORS.yellow}⚠️${COLORS.reset}`,
      info: `${COLORS.blue}ℹ️${COLORS.reset}`,
      section: `${COLORS.cyan}📌${COLORS.reset}`,
      success: `${COLORS.green}🎉${COLORS.reset}`,
    };

    console.log(`${prefix[type] || '  '} ${message}`);
    
    if (type === 'pass') this.results.passed.push(message);
    else if (type === 'fail') this.results.failed.push(message);
    else if (type === 'warn') this.results.warnings.push(message);
    else if (type === 'info') this.results.info.push(message);
  }

  section(title) {
    console.log('\n' + COLORS.cyan + '═'.repeat(70) + COLORS.reset);
    console.log(COLORS.cyan + `📋 ${title}` + COLORS.reset);
    console.log(COLORS.cyan + '═'.repeat(70) + COLORS.reset);
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────

  fileExists(filePath) {
    return fs.existsSync(path.join(PROJECT_ROOT, filePath));
  }

  readJSON(filePath) {
    try {
      const fullPath = path.join(PROJECT_ROOT, filePath);
      if (!fs.existsSync(fullPath)) return null;
      return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    } catch {
      return null;
    }
  }

  countFiles(dirPath, ext = '.mp3') {
    try {
      const fullPath = path.join(PROJECT_ROOT, dirPath);
      if (!fs.existsSync(fullPath)) return 0;
      return fs.readdirSync(fullPath).filter(f => f.endsWith(ext)).length;
    } catch {
      return 0;
    }
  }

  getDirSize(dirPath) {
    try {
      const fullPath = path.join(PROJECT_ROOT, dirPath);
      if (!fs.existsSync(fullPath)) return 0;
      let total = 0;
      const items = fs.readdirSync(fullPath);
      for (const item of items) {
        const itemPath = path.join(fullPath, item);
        if (fs.statSync(itemPath).isFile()) {
          total += fs.statSync(itemPath).size;
        }
      }
      return total;
    } catch {
      return 0;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ─── TEST 1: DIRECTORY STRUCTURE ────────────────────────────────────

  testDirectories() {
    this.section('📁 Directory Structure');

    const dirs = [
      { path: 'public/audio/offline', label: 'Offline Audio' },
      { path: 'public/audio/offline/en_female', label: 'English Audio' },
      { path: 'public/audio/offline/hy_Ani', label: 'Armenian Audio' },
      { path: 'public/audio/offline/ru_female', label: 'Russian Audio' },
      { path: 'public/audio/offline_dictionary', label: 'Dictionary Audio' },
      { path: 'public/audio/offline_dictionary/en', label: 'Dict English' },
      { path: 'public/audio/offline_dictionary/hy', label: 'Dict Armenian' },
      { path: 'public/audio/offline_dictionary/ru', label: 'Dict Russian' },
      { path: 'public/audio/offline_user_dictionary', label: 'User Dictionary Audio' },
      { path: 'data/dictionaries', label: 'Dictionaries' },
      { path: 'src/lib/offline', label: 'Offline Engine' },
      { path: 'src/components', label: 'Components' },
    ];

    let allExist = true;
    for (const dir of dirs) {
      const exists = this.fileExists(dir.path);
      if (exists) {
        const files = this.countFiles(dir.path);
        const size = this.getDirSize(dir.path);
        this.log(`${dir.label}: ${files} files, ${this.formatBytes(size)}`, 'pass');
      } else {
        this.log(`${dir.label}: NOT FOUND`, 'fail');
        allExist = false;
      }
    }

    return allExist;
  }

  // ─── TEST 2: MANIFESTS ──────────────────────────────────────────────

  testManifests() {
    this.section('📄 Manifests');

    const manifests = [
      { path: 'public/audio/offline/manifest_en_female.json', label: 'EN Manifest' },
      { path: 'public/audio/offline/manifest_hy_ani.json', label: 'HY Manifest' },
      { path: 'public/audio/offline/manifest_ru_female.json', label: 'RU Manifest' },
      { path: 'public/audio/offline_dictionary/manifest.json', label: 'Dictionary Manifest' },
      { path: 'public/audio/offline_user_dictionary/user_manifest.json', label: 'User Manifest' },
    ];

    let totalEntries = 0;
    let validManifests = 0;

    for (const mf of manifests) {
      const data = this.readJSON(mf.path);
      if (!data) {
        this.log(`${mf.label}: NOT FOUND`, 'fail');
        continue;
      }

      const issues = [];
      if (!data.mapping) issues.push('missing mapping');
      if (!data.totalFiles && !data.version) issues.push('missing metadata');
      
      const entries = Object.keys(data.mapping || {}).length;
      totalEntries += entries;
      validManifests++;

      if (issues.length === 0) {
        this.log(`${mf.label}: ${entries} entries`, 'pass');
        this.results.stats.totalManifestEntries += entries;
      } else {
        this.log(`${mf.label}: ${entries} entries (${issues.join(', ')})`, 'warn');
      }
    }

    this.log(`Total manifest entries: ${totalEntries}`, 'info');
    return { totalEntries, validManifests, total: manifests.length };
  }

  // ─── TEST 3: DICTIONARIES ───────────────────────────────────────────

  testDictionaries() {
    this.section('📖 Dictionaries');

    const dicts = [
      { path: 'data/dictionaries/unified-dictionary.json', label: 'Unified Dictionary' },
      { path: 'data/dictionaries/user-dictionary.json', label: 'User Dictionary' },
      { path: 'data/dictionaries/lesson-dictionary.json', label: 'Lesson Dictionary' },
    ];

    let totalEntries = 0;
    let withAudio = 0;

    for (const dict of dicts) {
      const data = this.readJSON(dict.path);
      if (!data) {
        this.log(`${dict.label}: NOT FOUND`, 'fail');
        continue;
      }

      let entries = [];
      if (Array.isArray(data)) entries = data;
      else if (data.entries) entries = data.entries;
      else if (data.lessons) entries = data.lessons;

      const audioCount = entries.filter(e => e.audioId || e.audio || e.file).length;
      totalEntries += entries.length;
      withAudio += audioCount;

      this.log(`${dict.label}: ${entries.length} entries, ${audioCount} with audio`, 
        entries.length > 0 ? 'pass' : 'warn');
    }

    this.results.stats.totalDictionaryEntries = totalEntries;
    this.log(`Total dictionary entries: ${totalEntries} (${withAudio} with audio)`, 'info');
    return { totalEntries, withAudio };
  }

  // ─── TEST 4: AUDIO FILES ────────────────────────────────────────────

  testAudioFiles() {
    this.section('🎵 Audio Files');

    const audioDirs = [
      { path: 'public/audio/offline/en_female', label: 'EN Female' },
      { path: 'public/audio/offline/hy_Ani', label: 'HY Ani' },
      { path: 'public/audio/offline/ru_female', label: 'RU Female' },
      { path: 'public/audio/offline_dictionary/en', label: 'Dict EN' },
      { path: 'public/audio/offline_dictionary/hy', label: 'Dict HY' },
      { path: 'public/audio/offline_dictionary/ru', label: 'Dict RU' },
      { path: 'public/audio/offline_user_dictionary/en_user', label: 'User EN' },
      { path: 'public/audio/offline_user_dictionary/hy_user', label: 'User HY' },
      { path: 'public/audio/offline_user_dictionary/ru_user', label: 'User RU' },
    ];

    let totalFiles = 0;
    let totalSize = 0;

    for (const dir of audioDirs) {
      const count = this.countFiles(dir.path);
      const size = this.getDirSize(dir.path);
      totalFiles += count;
      totalSize += size;

      if (count > 0) {
        this.log(`${dir.label}: ${count} files (${this.formatBytes(size)})`, 'pass');
      } else {
        this.log(`${dir.label}: EMPTY`, 'warn');
      }
    }

    this.results.stats.totalAudioFiles = totalFiles;
    this.log(`Total audio files: ${totalFiles} (${this.formatBytes(totalSize)})`, 'info');
    return { totalFiles, totalSize };
  }

  // ─── TEST 5: MANIFEST ↔ AUDIO CROSS-REFERENCE ──────────────────────

  testCrossReference() {
    this.section('🔗 Cross-Reference Check');

    // Get all manifest entries
    const manifestEntries = new Set();
    const manifests = [
      'public/audio/offline/manifest_en_female.json',
      'public/audio/offline/manifest_hy_ani.json',
      'public/audio/offline/manifest_ru_female.json',
      'public/audio/offline_dictionary/manifest.json',
      'public/audio/offline_user_dictionary/user_manifest.json',
    ];

    for (const mf of manifests) {
      const data = this.readJSON(mf);
      if (data && data.mapping) {
        for (const [key, value] of Object.entries(data.mapping)) {
          manifestEntries.add(value);
        }
      }
    }

    // Get all dictionary audio IDs
    const dictAudioIds = new Set();
    const dicts = [
      'data/dictionaries/unified-dictionary.json',
      'data/dictionaries/user-dictionary.json',
      'data/dictionaries/lesson-dictionary.json',
    ];

    for (const dict of dicts) {
      const data = this.readJSON(dict);
      if (data) {
        let entries = [];
        if (Array.isArray(data)) entries = data;
        else if (data.entries) entries = data.entries;
        else if (data.lessons) entries = data.lessons;
        
        for (const entry of entries) {
          const id = entry.audioId || entry.audio || entry.file;
          if (id) dictAudioIds.add(id);
        }
      }
    }

    // Find matches
    let matched = 0;
    for (const id of dictAudioIds) {
      if (manifestEntries.has(id)) matched++;
    }

    this.log(`Dictionary audio IDs: ${dictAudioIds.size}`, 'info');
    this.log(`Manifest audio IDs: ${manifestEntries.size}`, 'info');
    this.log(`Matched: ${matched}/${dictAudioIds.size} (${Math.round((matched/dictAudioIds.size)*100)}%)`, 
      matched === dictAudioIds.size ? 'pass' : 'warn');

    return { matched, dictTotal: dictAudioIds.size, manifestTotal: manifestEntries.size };
  }

  // ─── TEST 6: OFFLINE ENGINE CODE ────────────────────────────────────

  testOfflineCode() {
    this.section('🔧 Offline Engine Code');

    const files = [
      { path: 'src/lib/offline/OfflineAudioManager.ts', label: 'Audio Manager' },
      { path: 'src/lib/offline/OfflineLessonEngine.ts', label: 'Lesson Engine' },
      { path: 'src/lib/offline/OfflineAudioEngine.ts', label: 'Audio Engine' },
      { path: 'src/lib/offline/trilingual-audio-engine.ts', label: 'Trilingual Engine' },
      { path: 'src/lib/offline/index.ts', label: 'Index Export' },
    ];

    let allExist = true;
    for (const file of files) {
      const exists = this.fileExists(file.path);
      if (exists) {
        const content = fs.readFileSync(path.join(PROJECT_ROOT, file.path), 'utf8');
        const lines = content.split('\n').length;
        
        // Check for proper exports
        const hasExport = content.includes('export') || content.includes('export default');
        const hasImport = content.includes('import');
        
        this.log(`${file.label}: ${lines} lines, ${hasExport ? '✅' : '❌'} exports`, 
          (hasExport && hasImport) ? 'pass' : 'warn');
      } else {
        this.log(`${file.label}: NOT FOUND`, 'fail');
        allExist = false;
      }
    }

    return allExist;
  }

  // ─── TEST 7: COMPONENTS ─────────────────────────────────────────────

  testComponents() {
    this.section('🧩 Components');

    const components = [
      { path: 'src/components/TrilingualAudioPlayer.tsx', label: 'Audio Player' },
      { path: 'src/components/TrilingualDictionary.tsx', label: 'Dictionary' },
      { path: 'src/components/OfflineIndicator.tsx', label: 'Offline Indicator' },
      { path: 'src/components/ServiceWorkerRegister.tsx', label: 'SW Register' },
      { path: 'src/components/AudioControls.tsx', label: 'Audio Controls' },
    ];

    for (const comp of components) {
      const exists = this.fileExists(comp.path);
      if (exists) {
        const content = fs.readFileSync(path.join(PROJECT_ROOT, comp.path), 'utf8');
        const lines = content.split('\n').length;
        
        // Check for key features
        const hasAudio = content.includes('audio') || content.includes('Audio');
        const hasPlay = content.includes('play') || content.includes('Play');
        const hasOffline = content.includes('offline') || content.includes('Offline');
        
        this.log(`${comp.label}: ${lines} lines, ${hasAudio ? '🎵' : ''} ${hasPlay ? '▶️' : ''} ${hasOffline ? '📶' : ''}`,
          'pass');
      } else {
        this.log(`${comp.label}: NOT FOUND`, 'fail');
      }
    }
  }

  // ─── TEST 8: SERVICE WORKER ─────────────────────────────────────────

  testServiceWorker() {
    this.section('⚙️ Service Worker');

    const swPaths = [
      'public/sw.js',
      'public/service-worker.js',
      'src/sw.js',
    ];

    let found = false;
    for (const sw of swPaths) {
      if (this.fileExists(sw)) {
        found = true;
        const content = fs.readFileSync(path.join(PROJECT_ROOT, sw), 'utf8');
        const hasCache = content.includes('cache') || content.includes('CacheStorage');
        const hasAudio = content.includes('audio') || content.includes('mp3');
        const hasOffline = content.includes('offline') || content.includes('fallback');
        
        this.log(`SW found: ${path.basename(sw)}`, 'pass');
        this.log(`  Cache: ${hasCache ? '✅' : '❌'}`, hasCache ? 'pass' : 'warn');
        this.log(`  Audio: ${hasAudio ? '✅' : '❌'}`, hasAudio ? 'pass' : 'warn');
        this.log(`  Offline: ${hasOffline ? '✅' : '❌'}`, hasOffline ? 'pass' : 'warn');
        break;
      }
    }

    if (!found) {
      this.log('Service Worker NOT FOUND', 'fail');
    }

    return found;
  }

  // ─── TEST 9: BUILD CHECK ────────────────────────────────────────────

  testBuild() {
    this.section('🏗️ Build Check');

    try {
      const result = execSync('npx tsc --noEmit 2>&1', {
        encoding: 'utf8',
        timeout: 60000,
        maxBuffer: 10 * 1024 * 1024,
        cwd: PROJECT_ROOT,
      });

      const errors = result.split('\n').filter(line => line.includes('error TS'));
      if (errors.length === 0) {
        this.log('TypeScript: No errors ✅', 'pass');
      } else {
        this.log(`TypeScript: ${errors.length} errors`, 'fail');
        for (const err of errors.slice(0, 5)) {
          this.log(`  ${err.trim()}`, 'info');
        }
        if (errors.length > 5) {
          this.log(`  ... and ${errors.length - 5} more`, 'info');
        }
      }
    } catch (error) {
      // stdout contains errors
      const output = error.stdout || '';
      const errors = output.split('\n').filter(line => line.includes('error TS'));
      if (errors.length === 0) {
        this.log('TypeScript: No errors ✅', 'pass');
      } else {
        this.log(`TypeScript: ${errors.length} errors`, 'fail');
        for (const err of errors.slice(0, 5)) {
          this.log(`  ${err.trim()}`, 'info');
        }
        if (errors.length > 5) {
          this.log(`  ... and ${errors.length - 5} more`, 'info');
        }
      }
    }
  }

  // ─── TEST 10: PERFORMANCE ───────────────────────────────────────────

  testPerformance() {
    this.section('⚡ Performance');

    // Check file sizes
    const largeFiles = [];
    const checkPaths = [
      'src/lib/content/audio-mapping.ts',
      'src/lib/offline/OfflineAudioEngine.ts',
      'src/lib/offline/OfflineAudioManager.ts',
    ];

    for (const file of checkPaths) {
      const fullPath = path.join(PROJECT_ROOT, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        const sizeKB = stats.size / 1024;
        if (sizeKB > 500) {
          largeFiles.push({ file, size: sizeKB });
        }
      }
    }

    if (largeFiles.length > 0) {
      this.log(`Large files (${largeFiles.length}):`, 'warn');
      for (const f of largeFiles) {
        this.log(`  ${path.basename(f.file)}: ${f.size.toFixed(1)} KB`, 'info');
      }
    } else {
      this.log('No large files found ✅', 'pass');
    }

    // Check for duplicate code patterns
    const duplicatePatterns = ['console.log', 'debugger', 'TODO', 'FIXME'];
    let found = 0;
    for (const pattern of duplicatePatterns) {
      try {
        const result = execSync(`grep -r "${pattern}" src --include="*.ts" --include="*.tsx" | wc -l`, {
          encoding: 'utf8',
          cwd: PROJECT_ROOT,
        });
        const count = parseInt(result.trim());
        if (count > 0) {
          found += count;
        }
      } catch {}
    }

    if (found > 0) {
      this.log(`Found ${found} debug/console statements`, 'warn');
    } else {
      this.log('No debug statements found ✅', 'pass');
    }
  }

  // ─── PRINT SUMMARY ──────────────────────────────────────────────────

  printSummary() {
    console.log('\n' + COLORS.cyan + '═'.repeat(70) + COLORS.reset);
    console.log(COLORS.cyan + '📊 AUDIT SUMMARY' + COLORS.reset);
    console.log(COLORS.cyan + '═'.repeat(70) + COLORS.reset);

    console.log('\n' + COLORS.white + '📈 STATISTICS:' + COLORS.reset);
    console.log(`  🎵 Total Audio Files: ${this.results.stats.totalAudioFiles}`);
    console.log(`  📄 Manifest Entries: ${this.results.stats.totalManifestEntries}`);
    console.log(`  📖 Dictionary Entries: ${this.results.stats.totalDictionaryEntries}`);

    console.log('\n' + COLORS.white + '📊 RESULTS:' + COLORS.reset);
    console.log(`  ${COLORS.green}✅ Passed: ${this.results.passed.length}${COLORS.reset}`);
    console.log(`  ${COLORS.yellow}⚠️ Warnings: ${this.results.warnings.length}${COLORS.reset}`);
    console.log(`  ${COLORS.red}❌ Failed: ${this.results.failed.length}${COLORS.reset}`);

    if (this.results.warnings.length > 0) {
      console.log('\n' + COLORS.yellow + '⚠️ WARNINGS:' + COLORS.reset);
      for (const warn of this.results.warnings.slice(0, 5)) {
        console.log(`  ${warn}`);
      }
      if (this.results.warnings.length > 5) {
        console.log(`  ... and ${this.results.warnings.length - 5} more`);
      }
    }

    if (this.results.failed.length > 0) {
      console.log('\n' + COLORS.red + '❌ FAILURES:' + COLORS.reset);
      for (const fail of this.results.failed) {
        console.log(`  ${fail}`);
      }
    }

    const totalChecks = this.results.passed.length + this.results.failed.length;
    const score = totalChecks > 0 ? Math.round((this.results.passed.length / totalChecks) * 100) : 0;
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    console.log('\n' + COLORS.cyan + '═'.repeat(70) + COLORS.reset);
    console.log(`⏱️ Duration: ${duration}s`);
    console.log(`📊 Score: ${score}% (${this.results.passed.length}/${totalChecks})`);

    if (score >= 90) {
      console.log(COLORS.green + '🏆 Excellent! System is healthy.' + COLORS.reset);
    } else if (score >= 70) {
      console.log(COLORS.yellow + '👍 Good, but some issues need attention.' + COLORS.reset);
    } else {
      console.log(COLORS.red + '🔴 Needs improvement. Fix the issues above.' + COLORS.reset);
    }

    console.log(COLORS.cyan + '═'.repeat(70) + COLORS.reset);
    console.log(`📅 ${new Date().toLocaleString()}`);
  }

  // ─── RUN ALL TESTS ──────────────────────────────────────────────────

  run() {
    console.log('\n' + COLORS.cyan + '🎵 NUR LINGO - OFFLINE AUDIO SYSTEM AUDIT' + COLORS.reset);
    console.log(COLORS.gray + `📂 Project: ${PROJECT_ROOT}` + COLORS.reset);
    console.log(COLORS.gray + `📅 ${new Date().toLocaleString()}` + COLORS.reset);
    console.log(COLORS.gray + '═'.repeat(70) + COLORS.reset);

    this.testDirectories();
    this.testManifests();
    this.testDictionaries();
    this.testAudioFiles();
    this.testCrossReference();
    this.testOfflineCode();
    this.testComponents();
    this.testServiceWorker();
    this.testBuild();
    this.testPerformance();

    this.printSummary();
    this.saveReport();
  }

  // ─── SAVE REPORT ────────────────────────────────────────────────────

  saveReport() {
    try {
      const reportDir = path.join(PROJECT_ROOT, 'audit-reports');
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      const filename = `offline-audit-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const reportPath = path.join(reportDir, filename);

      const report = {
        timestamp: new Date().toISOString(),
        duration: ((Date.now() - this.startTime) / 1000).toFixed(2),
        stats: this.results.stats,
        results: {
          passed: this.results.passed,
          failed: this.results.failed,
          warnings: this.results.warnings,
          info: this.results.info,
        },
        summary: {
          totalChecks: this.results.passed.length + this.results.failed.length,
          passed: this.results.passed.length,
          failed: this.results.failed.length,
          warnings: this.results.warnings.length,
          score: Math.round((this.results.passed.length / (this.results.passed.length + this.results.failed.length)) * 100),
        }
      };

      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Report saved: ${reportPath}`);
    } catch (error) {
      console.log(`\n⚠️ Could not save report: ${error.message}`);
    }
  }
}

// ============================================================
// 🏃 RUN
// ============================================================

const audit = new OfflineAudioAudit();
audit.run();