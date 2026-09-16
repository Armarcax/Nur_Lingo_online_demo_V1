// scripts/find-all-audio-files.ts
// Run: npx ts-node scripts/find-all-audio-files.ts

import fs from 'fs';
import path from 'path';

interface AudioFile {
  path: string;
  type: 'code' | 'json' | 'audio' | 'config' | 'mapping' | 'manifest' | 'dictionary' | 'generated' | 'other';
  size: number;
  lineCount?: number;
  relatedTo: string[];
}

class AudioSystemFileFinder {
  private basePath: string;
  private results: AudioFile[] = [];
  private totalSize = 0;
  private fileCount = 0;

  constructor() {
    this.basePath = process.cwd();
  }

  run() {
    console.log('\n🔍🔍🔍 AUDIO SYSTEM FILE FINDER');
    console.log('═'.repeat(70));
    console.log(`📂 Project: ${this.basePath}\n`);

    this.findAudioFiles();
    this.findJsonFiles();
    this.findCodeFiles();
    this.findConfigFiles();
    this.findGeneratedFiles();
    this.findDictionaries();
    this.findManifests();

    this.printReport();
    this.generateTree();
    this.generateStats();
  }

  // ─── FIND AUDIO FILES ─────────────────────────────────────────────

  private findAudioFiles() {
    console.log('🎵 Searching audio files...');

    const audioDirs = [
      'public/audio',
      'public/audio/offline',
      'public/audio/offline/en_female',
      'public/audio/offline/hy_Ani',
      'public/audio/offline/ru_female',
    ];

    for (const dir of audioDirs) {
      const fullPath = path.join(this.basePath, dir);
      if (fs.existsSync(fullPath)) {
        this.scanDirectory(fullPath, 'audio');
      }
    }
  }

  // ─── FIND JSON FILES ─────────────────────────────────────────────

  private findJsonFiles() {
    console.log('📄 Searching JSON files...');

    const jsonDirs = [
      'public/audio/offline',
      'src/lib/content/mappings',
      'data/dictionaries',
      'src/lib/offline',
      'public/data',
    ];

    for (const dir of jsonDirs) {
      const fullPath = path.join(this.basePath, dir);
      if (fs.existsSync(fullPath)) {
        this.scanDirectory(fullPath, 'json');
      }
    }
  }

  // ─── FIND CODE FILES ─────────────────────────────────────────────

  private findCodeFiles() {
    console.log('💻 Searching code files...');

    const codeDirs = [
      'src/lib/offline',
      'src/lib/audio',
      'src/lib/content',
      'src/components',
      'src/app/learn',
      'src/hooks',
      'scripts',
    ];

    for (const dir of codeDirs) {
      const fullPath = path.join(this.basePath, dir);
      if (fs.existsSync(fullPath)) {
        this.scanDirectory(fullPath, 'code');
      }
    }
  }

  // ─── FIND CONFIG FILES ───────────────────────────────────────────

  private findConfigFiles() {
    console.log('⚙️ Searching config files...');

    const configFiles = [
      'package.json',
      'tsconfig.json',
      'next.config.js',
      'next.config.ts',
      'tailwind.config.js',
      'postcss.config.js',
    ];

    for (const file of configFiles) {
      const fullPath = path.join(this.basePath, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        this.results.push({
          path: file,
          type: 'config',
          size: stats.size,
          relatedTo: ['audio-system', 'build'],
        });
        this.totalSize += stats.size;
        this.fileCount++;
      }
    }
  }

  // ─── FIND GENERATED FILES ────────────────────────────────────────

  private findGeneratedFiles() {
    console.log('🔧 Searching generated files...');

    const generatedDirs = [
      '.next',
      'dist',
      'build',
      'out',
    ];

    for (const dir of generatedDirs) {
      const fullPath = path.join(this.basePath, dir);
      if (fs.existsSync(fullPath)) {
        this.scanDirectory(fullPath, 'generated');
      }
    }

    // Find service worker files
    const swPath = path.join(this.basePath, 'public/sw.js');
    if (fs.existsSync(swPath)) {
      const stats = fs.statSync(swPath);
      this.results.push({
        path: 'public/sw.js',
        type: 'generated',
        size: stats.size,
        relatedTo: ['service-worker', 'cache'],
      });
      this.totalSize += stats.size;
      this.fileCount++;
    }
  }

  // ─── FIND MANIFESTS ──────────────────────────────────────────────

  private findManifests() {
    console.log('📋 Searching manifests...');

    const manifestPaths = [
      'public/audio/offline/manifest_en_female.json',
      'public/audio/offline/manifest_hy_ani.json',
      'public/audio/offline/manifest_ru_female.json',
      'public/audio/offline/manifest_index.json',
    ];

    for (const file of manifestPaths) {
      const fullPath = path.join(this.basePath, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        this.results.push({
          path: file,
          type: 'manifest',
          size: stats.size,
          relatedTo: ['manifest', 'audio-mapping'],
        });
        this.totalSize += stats.size;
        this.fileCount++;
      }
    }
  }

  // ─── FIND DICTIONARIES ───────────────────────────────────────────

  private findDictionaries() {
    console.log('📚 Searching dictionaries...');

    const dictFiles = [
      'data/dictionaries/lesson-dictionary.json',
      'data/dictionaries/unified-dictionary.json',
      'src/lib/content/mappings/audio-num-en-mapping.json',
      'src/lib/content/mappings/audio-num-hy-mapping.json',
      'src/lib/content/mappings/audio-num-ru-mapping.json',
      'src/lib/content/mappings/audio-num-mappings.json',
    ];

    for (const file of dictFiles) {
      const fullPath = path.join(this.basePath, file);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        this.results.push({
          path: file,
          type: 'dictionary',
          size: stats.size,
          relatedTo: ['dictionary', 'mapping'],
        });
        this.totalSize += stats.size;
        this.fileCount++;
      }
    }
  }

  // ─── SCAN DIRECTORY ──────────────────────────────────────────────

  private scanDirectory(dir: string, type: AudioFile['type']) {
    try {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const fullPath = path.join(dir, file);
        const relativePath = path.relative(this.basePath, fullPath);

        try {
          const stats = fs.statSync(fullPath);

          if (stats.isDirectory()) {
            // Skip node_modules, .git, etc.
            if (!file.startsWith('.') && file !== 'node_modules' && file !== 'git') {
              this.scanDirectory(fullPath, type);
            }
            continue;
          }

          // Skip if already exists
          if (this.results.some(r => r.path === relativePath)) continue;

          // Determine file type based on extension
          let fileType = type;
          const ext = path.extname(file).toLowerCase();

          if (ext === '.mp3' || ext === '.wav' || ext === '.ogg') {
            fileType = 'audio';
          } else if (ext === '.json') {
            fileType = 'json';
          } else if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
            fileType = 'code';
          }

          // Count lines for code files
          let lineCount = 0;
          if (fileType === 'code') {
            try {
              const content = fs.readFileSync(fullPath, 'utf8');
              lineCount = content.split('\n').length;
            } catch {}
          }

          // Determine related components
          const relatedTo: string[] = [];
          const fileName = file.toLowerCase();

          if (fileName.includes('audio')) relatedTo.push('audio');
          if (fileName.includes('manifest')) relatedTo.push('manifest');
          if (fileName.includes('mapping')) relatedTo.push('mapping');
          if (fileName.includes('offline')) relatedTo.push('offline');
          if (fileName.includes('lesson')) relatedTo.push('lesson');
          if (fileName.includes('dictionary')) relatedTo.push('dictionary');
          if (fileName.includes('cache')) relatedTo.push('cache');
          if (fileName.includes('player')) relatedTo.push('player');
          if (fileName.includes('engine')) relatedTo.push('engine');
          if (fileName.includes('manager')) relatedTo.push('manager');

          // For generated files, add specific tags
          if (fileType === 'generated') {
            relatedTo.push('generated', 'build');
          }

          this.results.push({
            path: relativePath,
            type: fileType,
            size: stats.size,
            lineCount: lineCount || undefined,
            relatedTo: relatedTo.length > 0 ? relatedTo : ['unknown'],
          });

          this.totalSize += stats.size;
          this.fileCount++;

        } catch (err) {
          // Skip files that can't be read
        }
      }
    } catch (err) {
      // Skip directories that can't be read
    }
  }

  // ─── PRINT REPORT ─────────────────────────────────────────────────

  private printReport() {
    console.log('\n📊 AUDIO SYSTEM FILE REPORT');
    console.log('═'.repeat(70));

    // Group by type
    const grouped = this.results.reduce((acc, file) => {
      if (!acc[file.type]) acc[file.type] = [];
      acc[file.type].push(file);
      return acc;
    }, {} as Record<string, AudioFile[]>);

    // Print by type
    const typeOrder = ['audio', 'json', 'code', 'dictionary', 'mapping', 'manifest', 'config', 'generated', 'other'];

    for (const type of typeOrder) {
      if (!grouped[type]) continue;
      const files = grouped[type];
      const totalSize = files.reduce((sum, f) => sum + f.size, 0);
      const totalSizeKB = (totalSize / 1024).toFixed(1);

      console.log(`\n📁 ${type.toUpperCase()} FILES (${files.length} files, ${totalSizeKB} KB)`);
      console.log('─'.repeat(50));

      for (const file of files) {
        const sizeKB = (file.size / 1024).toFixed(1);
        const lineInfo = file.lineCount ? ` (${file.lineCount} lines)` : '';
        const related = file.relatedTo.join(', ');
        console.log(`   📄 ${file.path}`);
        console.log(`      Size: ${sizeKB} KB${lineInfo} | Related: ${related}`);
      }
    }

    // ─── SUMMARY ─────────────────────────────────────────────────────

    console.log('\n📋 SUMMARY');
    console.log('═'.repeat(70));

    console.log(`\n📊 Total files: ${this.fileCount}`);
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

    for (const [dir, files] of Object.entries(byLocation)) {
      const count = files.length;
      const size = (files.reduce((s, f) => s + f.size, 0) / 1024 / 1024).toFixed(2);
      console.log(`   ${dir}: ${count} files (${size} MB)`);
    }
  }

  // ─── GENERATE TREE ─────────────────────────────────────────────────

  private generateTree() {
    console.log('\n🌳 FILE TREE');
    console.log('═'.repeat(70));

    const tree: Record<string, any> = {};

    for (const file of this.results) {
      const parts = file.path.split('/');
      let current = tree;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          current[part] = {
            _type: file.type,
            _size: file.size,
            _related: file.relatedTo,
          };
        } else {
          if (!current[part]) current[part] = {};
          current = current[part];
        }
      }
    }

    this.printTree(tree, 0);
  }

  private printTree(node: any, depth: number) {
    const indent = '  '.repeat(depth);
    const keys = Object.keys(node).filter(k => !k.startsWith('_'));

    for (const key of keys) {
      const value = node[key];
      if (typeof value === 'object' && !Array.isArray(value)) {
        if (value._type) {
          const sizeKB = (value._size / 1024).toFixed(1);
          const type = value._type;
          const related = value._related ? ` [${value._related.join(', ')}]` : '';
          console.log(`${indent}📄 ${key} (${type}, ${sizeKB} KB)${related}`);
        } else {
          console.log(`${indent}📁 ${key}/`);
          this.printTree(value, depth + 1);
        }
      }
    }
  }

  // ─── GENERATE STATS ───────────────────────────────────────────────

  private generateStats() {
    console.log('\n📈 STATISTICS');
    console.log('═'.repeat(70));

    // Audio files stats
    const audioFiles = this.results.filter(f => f.type === 'audio');
    const jsonFiles = this.results.filter(f => f.type === 'json');
    const codeFiles = this.results.filter(f => f.type === 'code');

    console.log(`\n🎵 Audio files: ${audioFiles.length}`);
    console.log(`📄 JSON files: ${jsonFiles.length}`);
    console.log(`💻 Code files: ${codeFiles.length}`);

    // Top 10 largest files
    const sorted = [...this.results].sort((a, b) => b.size - a.size);
    console.log('\n📊 Top 10 largest files:');
    for (let i = 0; i < Math.min(10, sorted.length); i++) {
      const file = sorted[i];
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      console.log(`   ${i + 1}. ${file.path} (${sizeMB} MB)`);
    }

    // File count by extension
    const extCount: Record<string, number> = {};
    for (const file of this.results) {
      const ext = path.extname(file.path).toLowerCase() || 'no-ext';
      if (!extCount[ext]) extCount[ext] = 0;
      extCount[ext]++;
    }

    console.log('\n📁 Files by extension:');
    for (const [ext, count] of Object.entries(extCount).sort((a, b) => b[1] - a[1])) {
      console.log(`   ${ext}: ${count} files`);
    }

    console.log('\n📝 Audio system file locations:');
    console.log('   ✅ /public/audio/offline/ - Audio files');
    console.log('   ✅ /src/lib/offline/ - Offline engine');
    console.log('   ✅ /src/lib/audio/ - Audio system');
    console.log('   ✅ /src/lib/content/mappings/ - Mappings');
    console.log('   ✅ /data/dictionaries/ - Dictionaries');
    console.log('   ✅ /src/components/ - UI components');
    console.log('   ✅ /scripts/ - Scripts');
    console.log('   ✅ /.next/ - Build files');
  }
}

// ─── RUN ────────────────────────────────────────────────────────────

console.clear();
const finder = new AudioSystemFileFinder();
finder.run();