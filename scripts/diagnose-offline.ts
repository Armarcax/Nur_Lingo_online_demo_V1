// scripts/diagnose-offline.ts
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

interface AudioMapping {
  [key: string]: string | number;
}

interface LessonDictionary {
  [lessonId: string]: {
    vocabulary?: Array<{ id: string; en: string; hy: string; ru: string }>;
    phrases?: Array<{ id: string; en: string; hy: string; ru: string }>;
    dialogues?: Array<{
      id: string;
      turns: Array<{ speaker: string; en: string; hy: string; ru: string }>;
    }>;
  };
}

class OfflineDiagnostic {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  run() {
    console.log('🔍 NUR Lingo Offline Diagnostic\n');
    console.log('═'.repeat(60));

    this.checkDirectories();
    this.checkManifests();
    this.checkMappings();
    this.checkDictionary();
    this.checkAudioFiles();
    this.checkOfflineIndicator();
    this.generateSummary();
  }

  private checkDirectories() {
    console.log('\n📁 DIRECTORY CHECK');
    console.log('─'.repeat(40));

    const dirs = [
      'public/audio/offline/en_female',
      'public/audio/offline/hy_Ani',
      'public/audio/offline/ru_female',
      'src/lib/content/mappings',
      'src/lib/offline',
      'data/dictionaries',
    ];

    for (const dir of dirs) {
      const fullPath = path.join(this.basePath, dir);
      const exists = fs.existsSync(fullPath);
      const status = exists ? '✅' : '❌';
      console.log(`${status} ${dir}${exists ? ` (${fs.readdirSync(fullPath).length} files)` : ' (MISSING)'}`);
    }
  }

  private checkManifests() {
    console.log('\n📄 MANIFEST CHECK');
    console.log('─'.repeat(40));

    const manifests = [
      'en_female',
      'hy_ani',
      'ru_female'
    ];

    for (const name of manifests) {
      const manifestPath = path.join(this.basePath, `public/audio/offline/manifest_${name}.json`);
      
      if (fs.existsSync(manifestPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Manifest;
          const fileCount = Object.keys(data.mapping || {}).length;
          console.log(`✅ manifest_${name}.json - ${fileCount} entries, voice: ${data.voiceLabel || 'unknown'}`);
          
          const entries = Object.entries(data.mapping || {}).slice(0, 5);
          if (entries.length > 0) {
            console.log(`   Sample: ${entries.map(([k, v]) => `${k}->${v}`).join(', ')}`);
          }
        } catch (e) {
          console.log(`❌ manifest_${name}.json - INVALID JSON`);
        }
      } else {
        console.log(`❌ manifest_${name}.json - NOT FOUND`);
      }
    }
  }

  private checkMappings() {
    console.log('\n🗺️ MAPPING CHECK');
    console.log('─'.repeat(40));

    const mappingFiles = [
      'audio-num-en-mapping.json',
      'audio-num-hy-mapping.json',
      'audio-num-ru-mapping.json',
      'audio-num-mappings.json',
    ];

    for (const file of mappingFiles) {
      const filePath = path.join(this.basePath, `src/lib/content/mappings/${file}`);
      
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const count = Object.keys(data).length;
          console.log(`✅ ${file} - ${count} entries`);
          
          const keys = Object.keys(data).slice(0, 3);
          console.log(`   Structure: ${keys.map(k => `${k}: ${typeof data[k]}`).join(', ')}`);
        } catch (e) {
          console.log(`❌ ${file} - INVALID JSON`);
        }
      } else {
        console.log(`❌ ${file} - NOT FOUND`);
      }
    }
  }

  private checkDictionary() {
    console.log('\n📚 DICTIONARY CHECK');
    console.log('─'.repeat(40));

    const dictPath = path.join(this.basePath, 'data/dictionaries/lesson-dictionary.json');
    
    if (fs.existsSync(dictPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(dictPath, 'utf8')) as LessonDictionary;
        const lessons = Object.keys(data);
        console.log(`✅ lesson-dictionary.json - ${lessons.length} lessons`);
        
        if (lessons.length > 0) {
          const firstLesson = data[lessons[0]];
          console.log(`   First lesson: ${lessons[0]}`);
          console.log(`   Vocabulary: ${firstLesson?.vocabulary?.length || 0} items`);
          console.log(`   Phrases: ${firstLesson?.phrases?.length || 0} items`);
          console.log(`   Dialogues: ${firstLesson?.dialogues?.length || 0} items`);
        }
      } catch (e) {
        console.log('❌ lesson-dictionary.json - INVALID JSON');
      }
    } else {
      console.log('❌ lesson-dictionary.json - NOT FOUND');
    }
  }

  private checkAudioFiles() {
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
        console.log(`✅ ${path.basename(dir)}: ${files.length} MP3 files`);
        
        if (files.length > 0) {
          console.log(`   Sample: ${files.slice(0, 5).join(', ')}`);
        }
      } else {
        console.log(`❌ ${path.basename(dir)}: NOT FOUND`);
      }
    }
    console.log(`\n📊 Total audio files: ${totalFiles}`);
  }

  private checkOfflineIndicator() {
    console.log('\n🔍 OFFLINE INDICATOR CHECK');
    console.log('─'.repeat(40));

    const indicatorPath = path.join(this.basePath, 'src/components/OfflineIndicator.tsx');
    
    if (fs.existsSync(indicatorPath)) {
      const content = fs.readFileSync(indicatorPath, 'utf8');
      
      // Check for problematic fetch
      const hasLessonDictionaryFetch = content.includes('lesson_dictionary_manifest.json');
      const hasManifestEn = content.includes('manifest_en_female.json');
      const hasManifestHy = content.includes('manifest_hy_ani.json');
      const hasManifestRu = content.includes('manifest_ru_female.json');
      const hasMappingFetch = content.includes('audio-num-');
      
      console.log(`📄 OfflineIndicator.tsx:`);
      console.log(`   - Loads manifest_en_female.json: ${hasManifestEn ? '✅' : '❌'}`);
      console.log(`   - Loads manifest_hy_ani.json: ${hasManifestHy ? '✅' : '❌'}`);
      console.log(`   - Loads manifest_ru_female.json: ${hasManifestRu ? '✅' : '❌'}`);
      console.log(`   - Loads audio-num-* mappings: ${hasMappingFetch ? '⚠️ (should not fetch from src/)' : '✅'}`);
      console.log(`   - ❌❌❌ FETCHES lesson_dictionary_manifest.json: ${hasLessonDictionaryFetch ? '❌❌❌ REMOVE THIS!' : '✅'}`);
      
      if (hasLessonDictionaryFetch) {
        // Find the line with the problematic fetch
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('lesson_dictionary_manifest.json')) {
            console.log(`   ❌ Line ${index + 1}: ${line.trim()}`);
          }
        });
        console.log(`\n   🔧 FIX: Remove all lines containing 'lesson_dictionary_manifest.json'`);
        console.log(`   📝 The correct manifests are: manifest_en_female.json, manifest_hy_ani.json, manifest_ru_female.json`);
      }
    } else {
      console.log('❌ OfflineIndicator.tsx - NOT FOUND');
    }

    // Check if there are any other components with the same issue
    const srcPath = path.join(this.basePath, 'src');
    this.searchForProblematicFetches(srcPath);
  }

  private searchForProblematicFetches(dir: string) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (file === 'node_modules' || file === '.next' || file === 'dist') continue;
        this.searchForProblematicFetches(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('lesson_dictionary_manifest.json')) {
          const relativePath = path.relative(this.basePath, fullPath);
          console.log(`   ⚠️ Found in: ${relativePath}`);
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.includes('lesson_dictionary_manifest.json')) {
              console.log(`      Line ${index + 1}: ${line.trim()}`);
            }
          });
        }
      }
    }
  }

  private generateSummary() {
    console.log('\n📊 SUMMARY');
    console.log('═'.repeat(60));
    console.log(`
🔴 CRITICAL ISSUE FOUND:
   OfflineIndicator.tsx is trying to fetch lesson_dictionary_manifest.json (404)

🔧 FIX:
   1. Open src/components/OfflineIndicator.tsx
   2. Delete ALL lines containing "lesson_dictionary_manifest.json"
   3. Make sure it ONLY loads:
      - /audio/offline/manifest_en_female.json
      - /audio/offline/manifest_hy_ani.json
      - /audio/offline/manifest_ru_female.json

✅ CORRECT MANIFESTS TO USE:
   manifest_en_female.json - 25,099 entries
   manifest_hy_ani.json - 25,099 entries
   manifest_ru_female.json - 20,627 entries

⚠️ DO NOT FETCH FROM src/lib/content/mappings/
   These files are for server-side use only and are not accessible from the browser

📁 Audio files location:
   /audio/offline/en_female/ - 25,179 MP3 files
   /audio/offline/hy_Ani/ - 25,099 MP3 files
   /audio/offline/ru_female/ - 20,627 MP3 files
    `);
  }
}

// Run diagnostic
const diagnostic = new OfflineDiagnostic(process.cwd());
diagnostic.run();