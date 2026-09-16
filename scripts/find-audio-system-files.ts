// scripts/find-audio-system-files.ts
// Run: npx ts-node scripts/find-audio-system-files.ts

import fs from 'fs';
import path from 'path';

interface AudioFile {
  path: string;
  type: 'code' | 'json' | 'config' | 'generated' | 'dictionary' | 'manifest' | 'mapping';
  size: number;
  lineCount?: number;
  relatedTo: string[];
}

class AudioSystemFilesFinder {
  private basePath: string;
  private results: AudioFile[] = [];
  private totalSize = 0;

  constructor() {
    this.basePath = process.cwd();
  }

  run() {
    console.log('\n🔍🔍🔍 AUDIO SYSTEM FILES FINDER');
    console.log('═'.repeat(70));
    console.log(`📂 Project: ${this.basePath}\n`);

    // 1. Manifests (JSON)
    this.findManifests();

    // 2. Mappings (JSON)
    this.findMappings();

    // 3. Dictionaries (JSON)
    this.findDictionaries();

    // 4. Code files
    this.findCodeFiles();

    // 5. Config files
    this.findConfigFiles();

    // 6. Generated files
    this.findGeneratedFiles();

    // 7. Service Worker
    this.findServiceWorker();

    // 8. Package files
    this.findPackageFiles();

    // Print report
    this.printReport();
  }

  // ─── MANIFESTS ──────────────────────────────────────────────────────

  private findManifests() {
    console.log('📄 Finding manifests...');

    const manifestPaths = [
      'public/audio/offline/manifest_en_female.json',
      'public/audio/offline/manifest_hy_ani.json',
      'public/audio/offline/manifest_ru_female.json',
      'public/audio/offline/manifest_index.json',
      'public/audio/offline/manifest_all.json',
    ];

    for (const file of manifestPaths) {
      const fullPath = path.join(this.basePath, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        const content = fs.readFileSync(fullPath, 'utf8');
        const data = JSON.parse(content);
        const count = Object.keys(data.mapping || data.entries || {}).length;

        this.results.push({
          path: file,
          type: 'manifest',
          size: stats.size,
          relatedTo: ['manifest', 'audio-mapping', `entries: ${count}`],
        });
        this.totalSize += stats.size;
        console.log(`   ✅ ${path.basename(file)} (${count} entries, ${(stats.size/1024).toFixed(1)} KB)`);
      } else {
        console.log(`   ❌ ${path.basename(file)} - NOT FOUND`);
      }
    }
  }

  // ─── MAPPINGS ──────────────────────────────────────────────────────

  private findMappings() {
    console.log('\n🗺️ Finding mappings...');

    const mappingPaths = [
      'src/lib/content/mappings/audio-num-en-mapping.json',
      'src/lib/content/mappings/audio-num-hy-mapping.json',
      'src/lib/content/mappings/audio-num-ru-mapping.json',
      'src/lib/content/mappings/audio-num-mappings.json',
    ];

    for (const file of mappingPaths) {
      const fullPath = path.join(this.basePath, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        const content = fs.readFileSync(fullPath, 'utf8');
        const data = JSON.parse(content);
        const count = Object.keys(data.mapping || data || {}).length;

        this.results.push({
          path: file,
          type: 'mapping',
          size: stats.size,
          relatedTo: ['mapping', `entries: ${count}`],
        });
        this.totalSize += stats.size;
        console.log(`   ✅ ${path.basename(file)} (${count} entries, ${(stats.size/1024).toFixed(1)} KB)`);
      } else {
        console.log(`   ❌ ${path.basename(file)} - NOT FOUND`);
      }
    }
  }

  // ─── DICTIONARIES ──────────────────────────────────────────────────

  private findDictionaries() {
    console.log('\n📚 Finding dictionaries...');

    const dictPaths = [
      'data/dictionaries/lesson-dictionary.json',
      'data/dictionaries/unified-dictionary.json',
    ];

    for (const file of dictPaths) {
      const fullPath = path.join(this.basePath, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        this.results.push({
          path: file,
          type: 'dictionary',
          size: stats.size,
          relatedTo: ['dictionary', 'lessons'],
        });
        this.totalSize += stats.size;
        console.log(`   ✅ ${path.basename(file)} (${(stats.size/1024).toFixed(1)} KB)`);
      } else {
        console.log(`   ❌ ${path.basename(file)} - NOT FOUND`);
      }
    }
  }

  // ─── CODE FILES ────────────────────────────────────────────────────

  private findCodeFiles() {
    console.log('\n💻 Finding code files...');

    const codePaths = [
      // Offline engine
      'src/lib/offline/OfflineAudioEngine.ts',
      'src/lib/offline/OfflineLessonEngine.ts',
      'src/lib/offline/OfflineAudioManager.ts',
      'src/lib/offline/trilingual-audio-engine.ts',

      // Audio hooks
      'src/lib/hooks/useLessonAudio.ts',
      'src/lib/hooks/useAudio.ts',

      // Audio system
      'src/lib/audio/LessonAudio.ts',
      'src/lib/audio/WavClient.ts',

      // Content
      'src/lib/content/audio-mapping.ts',
      'src/lib/content/types.ts',

      // Components
      'src/components/TrilingualAudioPlayer.tsx',
      'src/components/OfflineIndicator.tsx',
      'src/components/AudioControls.tsx',

      // Pages
      'src/app/learn/page.tsx',
      'src/app/dictionary/page.tsx',

      // Service Worker registration
      'src/components/ServiceWorkerRegister.tsx',
    ];

    for (const file of codePaths) {
      const fullPath = path.join(this.basePath, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n').length;

        this.results.push({
          path: file,
          type: 'code',
          size: stats.size,
          lineCount: lines,
          relatedTo: this.getRelatedTags(content),
        });
        this.totalSize += stats.size;
        console.log(`   ✅ ${path.basename(file)} (${lines} lines, ${(stats.size/1024).toFixed(1)} KB)`);
      } else {
        console.log(`   ❌ ${path.basename(file)} - NOT FOUND`);
      }
    }
  }

  // ─── CONFIG FILES ──────────────────────────────────────────────────

  private findConfigFiles() {
    console.log('\n⚙️ Finding config files...');

    const configPaths = [
      'package.json',
      'tsconfig.json',
      'next.config.js',
      'next.config.ts',
      'tailwind.config.js',
      'postcss.config.js',
    ];

    for (const file of configPaths) {
      const fullPath = path.join(this.basePath, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        this.results.push({
          path: file,
          type: 'config',
          size: stats.size,
          relatedTo: ['config', 'build'],
        });
        this.totalSize += stats.size;
        console.log(`   ✅ ${path.basename(file)} (${(stats.size/1024).toFixed(1)} KB)`);
      } else {
        console.log(`   ❌ ${path.basename(file)} - NOT FOUND`);
      }
    }
  }

  // ─── GENERATED FILES ──────────────────────────────────────────────

  private findGeneratedFiles() {
    console.log('\n🔧 Finding generated files...');

    const generatedPaths = [
      '.next',
      'dist',
      'build',
      'out',
      'public/sw.js',
      'public/workbox-*.js',
    ];

    for (const item of generatedPaths) {
      const fullPath = path.join(this.basePath, item);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        let info = '';
        if (stats.isDirectory()) {
          const files = fs.readdirSync(fullPath);
          info = `${files.length} files`;
        } else {
          info = `${(stats.size/1024).toFixed(1)} KB`;
        }
        this.results.push({
          path: item,
          type: 'generated',
          size: stats.isDirectory() ? 0 : stats.size,
          relatedTo: ['generated', 'build'],
        });
        console.log(`   ✅ ${item} (${info})`);
      } else {
        console.log(`   ❌ ${item} - NOT FOUND`);
      }
    }
  }

  // ─── SERVICE WORKER ──────────────────────────────────────────────

  private findServiceWorker() {
    console.log('\n📦 Finding Service Worker...');

    const swPaths = [
      'public/sw.js',
    ];

    for (const file of swPaths) {
      const fullPath = path.join(this.basePath, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n').length;

        this.results.push({
          path: file,
          type: 'generated',
          size: stats.size,
          lineCount: lines,
          relatedTo: ['service-worker', 'cache', 'offline'],
        });
        this.totalSize += stats.size;
        console.log(`   ✅ ${path.basename(file)} (${lines} lines, ${(stats.size/1024).toFixed(1)} KB)`);
      } else {
        console.log(`   ❌ ${path.basename(file)} - NOT FOUND`);
      }
    }
  }

  // ─── PACKAGE FILES ─────────────────────────────────────────────────

  private findPackageFiles() {
    console.log('\n📦 Finding package files...');

    const pkgPaths = [
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
    ];

    for (const file of pkgPaths) {
      const fullPath = path.join(this.basePath, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        this.results.push({
          path: file,
          type: 'config',
          size: stats.size,
          relatedTo: ['package', 'dependencies'],
        });
        this.totalSize += stats.size;
        console.log(`   ✅ ${path.basename(file)} (${(stats.size/1024).toFixed(1)} KB)`);
      } else {
        console.log(`   ❌ ${path.basename(file)} - NOT FOUND`);
      }
    }
  }

  // ─── HELPERS ──────────────────────────────────────────────────────

  private getRelatedTags(content: string): string[] {
    const tags: string[] = [];

    if (content.includes('audio')) tags.push('audio');
    if (content.includes('manifest')) tags.push('manifest');
    if (content.includes('mapping')) tags.push('mapping');
    if (content.includes('offline')) tags.push('offline');
    if (content.includes('cache')) tags.push('cache');
    if (content.includes('play')) tags.push('playback');
    if (content.includes('engine')) tags.push('engine');
    if (content.includes('player')) tags.push('player');
    if (content.includes('lesson')) tags.push('lesson');
    if (content.includes('dictionary')) tags.push('dictionary');

    return tags.length > 0 ? tags : ['unknown'];
  }

  // ─── PRINT REPORT ─────────────────────────────────────────────────

  private printReport() {
    console.log('\n📊 AUDIO SYSTEM FILES REPORT');
    console.log('═'.repeat(70));

    // Group by type
    const grouped = this.results.reduce((acc, file) => {
      if (!acc[file.type]) acc[file.type] = [];
      acc[file.type].push(file);
      return acc;
    }, {} as Record<string, AudioFile[]>);

    for (const type of ['manifest', 'mapping', 'dictionary', 'code', 'config', 'generated']) {
      if (!grouped[type]) continue;
      const files = grouped[type];
      const totalSize = files.reduce((sum, f) => sum + f.size, 0);
      console.log(`\n📁 ${type.toUpperCase()} (${files.length} files, ${(totalSize/1024/1024).toFixed(2)} MB)`);
      console.log('─'.repeat(50));

      for (const file of files) {
        const sizeKB = (file.size / 1024).toFixed(1);
        const lines = file.lineCount ? `, ${file.lineCount} lines` : '';
        const related = file.relatedTo.join(', ');
        console.log(`   📄 ${file.path}`);
        console.log(`      ${sizeKB} KB${lines} | ${related}`);
      }
    }

    // Summary
    console.log('\n📋 SUMMARY');
    console.log('═'.repeat(70));

    console.log(`\n📊 Total files: ${this.results.length}`);
    console.log(`📊 Total size: ${(this.totalSize / 1024 / 1024).toFixed(2)} MB`);

    console.log('\n📁 By type:');
    for (const type of Object.keys(grouped)) {
      const count = grouped[type].length;
      const size = (grouped[type].reduce((s, f) => s + f.size, 0) / 1024 / 1024).toFixed(2);
      console.log(`   ${type}: ${count} files (${size} MB)`);
    }

    console.log('\n📁 By location:');
    const byLocation = this.results.reduce((acc, file) => {
      const dir = file.path.split('/')[0] || 'root';
      if (!acc[dir]) acc[dir] = [];
      acc[dir].push(file);
      return acc;
    }, {} as Record<string, AudioFile[]>);

    for (const [dir, files] of Object.entries(byLocation).sort()) {
      const count = files.length;
      const size = (files.reduce((s, f) => s + f.size, 0) / 1024 / 1024).toFixed(2);
      console.log(`   ${dir}/: ${count} files (${size} MB)`);
    }

    // Critical check
    console.log('\n🎯 CRITICAL FILES:');
    const critical = ['manifest_en_female.json', 'manifest_hy_ani.json', 'manifest_ru_female.json'];
    for (const file of critical) {
      const found = this.results.some(r => r.path.includes(file));
      console.log(`   ${found ? '✅' : '❌'} ${file}`);
    }

    console.log('\n📝 All audio system files found!');
  }
}

// ─── RUN ────────────────────────────────────────────────────────────

console.clear();
const finder = new AudioSystemFilesFinder();
finder.run();