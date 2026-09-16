// scripts/fix-audio-system-complete.ts
// Run: npx ts-node scripts/fix-audio-system-complete.ts

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

class AudioSystemFixer {
  private basePath: string;
  private manifests: Record<string, Manifest> = {};
  private errors: string[] = [];
  private changes: string[] = [];

  constructor() {
    this.basePath = process.cwd();
  }

  run() {
    console.log('\n🔧🔧🔧 AUDIO SYSTEM COMPLETE FIXER');
    console.log('═'.repeat(70));
    console.log(`📂 Project: ${this.basePath}\n`);

    this.loadManifests();
    this.fixAudioMapping();
    this.fixPageTSX();
    this.fixDictionaryPage();
    this.fixOfflineAudioManager();
    this.generateManifestIndex();
    this.printReport();
  }

  // ─── 1. LOAD MANIFESTS ────────────────────────────────────────────

  private loadManifests() {
    console.log('📄 Loading manifests...');

    const manifestFiles = [
      { name: 'en_female', path: 'public/audio/offline/manifest_en_female.json' },
      { name: 'hy_ani', path: 'public/audio/offline/manifest_hy_ani.json' },
      { name: 'ru_female', path: 'public/audio/offline/manifest_ru_female.json' },
    ];

    for (const mf of manifestFiles) {
      const fullPath = path.join(this.basePath, mf.path);
      if (fs.existsSync(fullPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(fullPath, 'utf8')) as Manifest;
          this.manifests[mf.name] = data;
          const count = Object.keys(data.mapping || {}).length;
          console.log(`   ✅ ${mf.name}: ${count} entries`);
        } catch (e) {
          this.errors.push(`Failed to load ${mf.name}: ${e}`);
          console.log(`   ❌ ${mf.name}: ERROR`);
        }
      } else {
        this.errors.push(`Manifest not found: ${mf.path}`);
        console.log(`   ❌ ${mf.name}: NOT FOUND`);
      }
    }
  }

  // ─── 2. FIX AUDIO MAPPING ─────────────────────────────────────────

  private fixAudioMapping() {
    console.log('\n🔧 Fixing audio-mapping.ts...');

    const mappingPath = path.join(this.basePath, 'src/lib/content/audio-mapping.ts');
    if (!fs.existsSync(mappingPath)) {
      this.errors.push('audio-mapping.ts not found');
      console.log('   ❌ audio-mapping.ts NOT FOUND');
      return;
    }

    // Create new mapping from all manifests
    let combinedMapping: Record<string, string> = {};
    let totalEntries = 0;

    for (const [name, manifest] of Object.entries(this.manifests)) {
      if (manifest.mapping) {
        combinedMapping = { ...combinedMapping, ...manifest.mapping };
        totalEntries += Object.keys(manifest.mapping).length;
      }
    }

    // Generate new audio-mapping.ts content
    const newContent = `// src/lib/content/audio-mapping.ts
// AUTO-GENERATED from manifests - DO NOT EDIT MANUALLY
// Generated: ${new Date().toISOString()}
// Total entries: ${totalEntries}

export const EXERCISE_TO_AUDIO: Record<string, string> = ${JSON.stringify(combinedMapping, null, 2)};

export const AUDIO_TO_EXERCISE: Record<string, string> = {};
for (const [key, value] of Object.entries(EXERCISE_TO_AUDIO)) {
  AUDIO_TO_EXERCISE[value] = key;
}

export function getAudioPath(
  exerciseId: string,
  language: 'hy' | 'en' | 'ru',
  gender: 'male' | 'female'
): string | null {
  const audioId = EXERCISE_TO_AUDIO[exerciseId];
  if (!audioId) return null;
  
  const audioDir = language === 'en' ? 'en_female' : language === 'hy' ? 'hy_Ani' : 'ru_female';
  return \`/audio/offline/\${audioDir}/\${audioId}.mp3\`;
}

export function hasAudioFile(exerciseId: string): boolean {
  return !!EXERCISE_TO_AUDIO[exerciseId];
}

export function searchAudio(searchTerm: string): string[] {
  const results: string[] = [];
  const term = searchTerm.toLowerCase();
  for (const [key, value] of Object.entries(EXERCISE_TO_AUDIO)) {
    if (key.toLowerCase().includes(term)) {
      results.push(key);
    }
  }
  return results;
}

export function getStats(): { total: number; languages: string[] } {
  return {
    total: ${totalEntries},
    languages: ['en', 'hy', 'ru'],
  };
}

export function getMapping(): Record<string, string> {
  return EXERCISE_TO_AUDIO;
}
`;

    // Write new file
    fs.writeFileSync(mappingPath, newContent);
    this.changes.push(`Updated audio-mapping.ts with ${totalEntries} entries`);
    console.log(`   ✅ audio-mapping.ts updated (${totalEntries} entries)`);
  }

  // ─── 3. FIX PAGE.TSX ─────────────────────────────────────────────

  private fixPageTSX() {
    console.log('\n🔧 Fixing page.tsx (learn)...');

    const pagePath = path.join(this.basePath, 'src/app/learn/page.tsx');
    if (!fs.existsSync(pagePath)) {
      this.errors.push('page.tsx not found');
      console.log('   ❌ page.tsx NOT FOUND');
      return;
    }

    let content = fs.readFileSync(pagePath, 'utf8');

    // Check if already using offline engine
    if (content.includes('offlineLessonEngine')) {
      console.log('   ✅ Already using offlineLessonEngine');
      return;
    }

    // Add import
    const importStatement = `import { offlineLessonEngine } from '@/lib/offline/OfflineLessonEngine';`;
    
    // Find the right place to add import
    const importRegex = /import\s+{[^}]+}\s+from\s+['"][^'"]+['"]/;
    const lastImport = content.match(importRegex);
    if (lastImport) {
      const lastIndex = content.lastIndexOf(lastImport[0]) + lastImport[0].length;
      content = content.slice(0, lastIndex) + '\n' + importStatement + content.slice(lastIndex);
    }

    // Find load lesson useEffect and modify
    const loadLessonRegex = /const\s+l\s*=\s*getLessonById\([^)]+\);/;
    if (loadLessonRegex.test(content)) {
      // Replace with offline version
      const replacement = `// Try offline first
      let l = offlineLessonEngine.getLesson(lessonId);
      if (!l) {
        l = getLessonById(pair as LangPair, lessonId);
        // Cache to offline if found
        if (l) {
          try {
            const lessons = JSON.parse(localStorage.getItem('offline_lessons') || '{}');
            lessons[lessonId] = l;
            localStorage.setItem('offline_lessons', JSON.stringify(lessons));
          } catch {}
        }
      }`;
      content = content.replace(loadLessonRegex, replacement);
      this.changes.push('Updated page.tsx to use offlineLessonEngine');
      console.log('   ✅ page.tsx updated to use offlineLessonEngine');
    }

    // Write file
    fs.writeFileSync(pagePath, content);
  }

  // ─── 4. FIX DICTIONARY PAGE ──────────────────────────────────────

  private fixDictionaryPage() {
    console.log('\n🔧 Fixing dictionary/page.tsx...');

    const dictPath = path.join(this.basePath, 'src/app/dictionary/page.tsx');
    if (!fs.existsSync(dictPath)) {
      this.errors.push('dictionary/page.tsx not found');
      console.log('   ❌ dictionary/page.tsx NOT FOUND');
      return;
    }

    let content = fs.readFileSync(dictPath, 'utf8');

    // Check if already has offline support
    if (content.includes('OfflineAudioManager')) {
      console.log('   ✅ Already has offline support');
      return;
    }

    // Add imports
    const imports = `
import { offlineAudioManager } from '@/lib/offline/OfflineAudioManager';
import { offlineLessonEngine } from '@/lib/offline/OfflineLessonEngine';
`;

    // Add import
    const importRegex = /import\s+{[^}]+}\s+from\s+['"][^'"]+['"]/;
    const lastImport = content.match(importRegex);
    if (lastImport) {
      const lastIndex = content.lastIndexOf(lastImport[0]) + lastImport[0].length;
      content = content.slice(0, lastIndex) + '\n' + imports + content.slice(lastIndex);
    }

    // Add offline audio play function
    const playFunction = `
  // ─── OFFLINE AUDIO PLAY ─────────────────────────────────────────

  const playOfflineAudio = useCallback(async (wordId: string, language: string = 'hy') => {
    try {
      // Try to get audio from offline manager
      let audioKey = wordId;
      
      // Try different variations
      const variations = [
        wordId,
        wordId.toLowerCase().replace(/\\s+/g, '_'),
        \`word_\${wordId}\`,
      ];
      
      let found = false;
      for (const key of variations) {
        if (offlineAudioManager.hasAudioKey(key, language)) {
          await offlineAudioManager.play(key, language);
          found = true;
          break;
        }
      }
      
      if (!found) {
        // Try to find in lesson engine
        const path = offlineLessonEngine.getAudioPath(wordId, language as any, 'female');
        if (path) {
          const audio = new Audio(path);
          await audio.play();
          found = true;
        }
      }
      
      if (!found) {
        console.warn('No audio found for:', wordId);
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  }, []);
`;

    // Find a good place to insert
    const componentStart = content.indexOf('export default function');
    if (componentStart !== -1) {
      const endOfFunction = content.indexOf('}', componentStart + 1);
      if (endOfFunction !== -1) {
        content = content.slice(0, endOfFunction) + playFunction + content.slice(endOfFunction);
      }
    }

    // Replace play button onClick
    content = content.replace(
      /onClick=\{\(\)\s*=>\s*playAudio\([^)]*\)\}/g,
      'onClick={() => playOfflineAudio(word.id)}'
    );

    fs.writeFileSync(dictPath, content);
    this.changes.push('Updated dictionary/page.tsx with offline support');
    console.log('   ✅ dictionary/page.tsx updated with offline support');
  }

  // ─── 5. FIX OFFLINE AUDIO MANAGER ───────────────────────────────

  private fixOfflineAudioManager() {
    console.log('\n🔧 Fixing OfflineAudioManager.ts...');

    const managerPath = path.join(this.basePath, 'src/lib/offline/OfflineAudioManager.ts');
    if (!fs.existsSync(managerPath)) {
      this.errors.push('OfflineAudioManager.ts not found');
      console.log('   ❌ OfflineAudioManager.ts NOT FOUND');
      return;
    }

    let content = fs.readFileSync(managerPath, 'utf8');

    // Check if has init method
    if (!content.includes('async init()')) {
      const initMethod = `
  
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    console.log('🎵 OfflineAudioManager initialized');
    this.initialized = true;
  }

  isAvailable(): boolean {
    return this.initialized;
  }

  getStats(): { totalEntries: number; languages: string[] } {
    let total = 0;
    const languages = Object.keys(manifests);
    for (const lang of languages) {
      total += Object.keys(manifests[lang]?.mapping || {}).length;
    }
    return {
      totalEntries: total,
      languages: languages,
    };
  }

  stop(): void {
    for (const [key, audio] of this.audioCache) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  isPlaying(): boolean {
    for (const [key, audio] of this.audioCache) {
      if (!audio.paused) return true;
    }
    return false;
  }
`;

      // Insert after class declaration
      const classStart = content.indexOf('export class OfflineAudioManager');
      if (classStart !== -1) {
        const braceIndex = content.indexOf('{', classStart) + 1;
        content = content.slice(0, braceIndex) + initMethod + content.slice(braceIndex);
        this.changes.push('Added missing methods to OfflineAudioManager');
        console.log('   ✅ Added missing methods to OfflineAudioManager');
      }
    }

    fs.writeFileSync(managerPath, content);
  }

  // ─── 6. GENERATE MANIFEST INDEX ──────────────────────────────────

  private generateManifestIndex() {
    console.log('\n📄 Generating manifest_index.json...');

    const indexPath = path.join(this.basePath, 'public/audio/offline/manifest_index.json');

    const index = {
      version: '2.0',
      generatedAt: new Date().toISOString(),
      languages: {} as Record<string, any>,
      totalAudioFiles: 0,
    };

    for (const [name, manifest] of Object.entries(this.manifests)) {
      const lang = name === 'en_female' ? 'en' : name === 'hy_ani' ? 'hy' : 'ru';
      const count = Object.keys(manifest.mapping || {}).length;
      index.languages[lang] = {
        manifest: `/audio/offline/manifest_${name}.json`,
        voice: manifest.voiceLabel || manifest.voice || 'Unknown',
        count: count,
        label: lang === 'en' ? 'English' : lang === 'hy' ? 'Armenian' : 'Russian',
      };
      index.totalAudioFiles += count;
    }

    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    this.changes.push(`Generated manifest_index.json with ${index.totalAudioFiles} entries`);
    console.log(`   ✅ manifest_index.json generated (${index.totalAudioFiles} entries)`);
  }

  // ─── PRINT REPORT ─────────────────────────────────────────────────

  private printReport() {
    console.log('\n📊 FIX REPORT');
    console.log('═'.repeat(70));

    if (this.changes.length > 0) {
      console.log('\n✅ CHANGES MADE:');
      for (const change of this.changes) {
        console.log(`   ✅ ${change}`);
      }
    }

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      for (const error of this.errors) {
        console.log(`   ❌ ${error}`);
      }
    }

    console.log('\n📝 NEXT STEPS:');
    console.log('   1. Restart server: npm run dev');
    console.log('   2. Clear browser cache (Ctrl+Shift+Delete)');
    console.log('   3. Test offline audio in learn page');
    console.log('   4. Test offline audio in dictionary');

    console.log('\n🎯 SUMMARY:');
    const totalManifestEntries = Object.values(this.manifests).reduce(
      (sum, m) => sum + Object.keys(m.mapping || {}).length,
      0
    );
    console.log(`   ✅ Total manifest entries: ${totalManifestEntries}`);
    console.log(`   ✅ Total changes: ${this.changes.length}`);
    console.log(`   ❌ Total errors: ${this.errors.length}`);

    if (this.errors.length === 0) {
      console.log('\n🎉 All fixes applied successfully!');
    } else {
      console.log('\n⚠️ Some errors occurred. Please check above.');
    }
  }
}

// ─── RUN ────────────────────────────────────────────────────────────

console.clear();
const fixer = new AudioSystemFixer();
fixer.run();