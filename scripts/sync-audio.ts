// scripts/sync-audio.ts

import * as path from 'path';
import * as fs from 'fs';
import { DictionaryParser } from './utils/dictionary-parser';
import { ManifestParser } from './utils/manifest-parser';
import { AudioValidator } from './utils/audio-validator';
import { MappingGenerator } from './utils/mapping-generator';

// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
  dictionaryPath: path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json'),
  manifestPath: path.join(process.cwd(), 'data', 'dictionaries', 'lesson_dictionary_manifest.json'),
  audioMappingPath: path.join(process.cwd(), 'src', 'lib', 'content', 'audio-mapping.ts'),
  audioBasePath: path.join(process.cwd(), 'public', 'audio', 'offline'),
  manifestsPath: path.join(process.cwd(), 'public', 'audio', 'offline'),
  audioFilenamesPath: path.join(process.cwd(), 'public', 'audio', 'offline', 'audio-filenames-only.txt'),
};

const VOICE_CONFIG = {
  hy: {
    male: { name: 'Areg', dir: 'hy_Areg', label: 'Արեգ (տղամարդ)' },
    female: { name: 'Ani', dir: 'hy_Ani', label: 'Անի (կին)' }
  },
  en: {
    male: { name: 'en_male', dir: 'en_male', label: 'Male' },
    female: { name: 'en_female', dir: 'en_female', label: 'Female' }
  },
  ru: {
    male: { name: 'ru_male', dir: 'ru_male', label: 'Мужской' },
    female: { name: 'ru_female', dir: 'ru_female', label: 'Женский' }
  }
};

// ============================================================
// LOGGER
// ============================================================

const LOG = {
  info: (msg: string) => console.log(`\x1b[36mℹ\x1b[0m ${msg}`),
  success: (msg: string) => console.log(`\x1b[32m✅\x1b[0m ${msg}`),
  warning: (msg: string) => console.log(`\x1b[33m⚠️\x1b[0m ${msg}`),
  error: (msg: string) => console.log(`\x1b[31m❌\x1b[0m ${msg}`),
  debug: (msg: string) => console.log(`\x1b[90m🔍\x1b[0m ${msg}`),
  section: (msg: string) => console.log(`\n\x1b[1m━━━ ${msg} ━━━\x1b[0m\n`),
};

// ============================================================
// CUSTOM DICTIONARY PARSER FOR V3.0
// ============================================================

class CustomDictionaryParser {
  private dictionaryPath: string;
  private data: any = null;

  constructor(dictionaryPath: string) {
    this.dictionaryPath = dictionaryPath;
  }

  load(): any {
    if (!fs.existsSync(this.dictionaryPath)) {
      LOG.error(`Dictionary not found: ${this.dictionaryPath}`);
      return null;
    }

    const content = fs.readFileSync(this.dictionaryPath, 'utf-8');
    this.data = JSON.parse(content);
    
    // ✅ Support both v2.0 and v3.0
    if (this.data.version === '3.0' && Array.isArray(this.data.lessons)) {
      // Convert v3.0 to v2.0 format for compatibility
      const lessons: Record<string, any> = {};
      for (const lesson of this.data.lessons) {
        lessons[lesson.id] = lesson;
      }
      this.data.lessons = lessons;
    }
    
    return this.data;
  }

  getStats(): any {
    if (!this.data) return { totalLessons: 0, totalExercises: 0, exercisesWithAudio: 0, exercisesWithoutAudio: 0, vocabularyWithAudio: 0, uniqueAudioIds: 0 };

    const lessons = this.data.lessons || {};
    const lessonArray = Array.isArray(lessons) ? lessons : Object.values(lessons);
    
    let totalExercises = 0;
    let exercisesWithAudio = 0;
    let exercisesWithoutAudio = 0;
    let vocabularyWithAudio = 0;
    const audioIds = new Set();

    for (const lesson of lessonArray) {
      if (lesson.exercises) {
        for (const ex of lesson.exercises) {
          totalExercises++;
          if (ex.audioId) {
            exercisesWithAudio++;
            audioIds.add(ex.audioId);
          } else {
            exercisesWithoutAudio++;
          }
        }
      }
      if (lesson.vocabulary) {
        for (const v of lesson.vocabulary) {
          if (v.audioId) {
            vocabularyWithAudio++;
            audioIds.add(v.audioId);
          }
        }
      }
    }

    return {
      totalLessons: lessonArray.length,
      totalExercises,
      exercisesWithAudio,
      exercisesWithoutAudio,
      vocabularyWithAudio,
      uniqueAudioIds: audioIds.size,
    };
  }

  getAudioIdMap(): Record<string, string> {
    if (!this.data) return {};

    const map: Record<string, string> = {};
    const lessons = this.data.lessons || {};
    const lessonArray = Array.isArray(lessons) ? lessons : Object.values(lessons);

    for (const lesson of lessonArray) {
      if (lesson.exercises) {
        for (const ex of lesson.exercises) {
          if (ex.audioId) {
            const key = `${lesson.id}_${ex.id}`;
            map[key] = ex.audioId;
          }
        }
      }
      if (lesson.vocabulary) {
        for (const v of lesson.vocabulary) {
          if (v.audioId) {
            const key = `${lesson.id}_${v.id}`;
            map[key] = v.audioId;
          }
        }
      }
    }

    return map;
  }

  getAllAudioIds(): Set<string> {
    if (!this.data) return new Set();

    const audioIds = new Set<string>();
    const lessons = this.data.lessons || {};
    const lessonArray = Array.isArray(lessons) ? lessons : Object.values(lessons);

    for (const lesson of lessonArray) {
      if (lesson.exercises) {
        for (const ex of lesson.exercises) {
          if (ex.audioId) audioIds.add(ex.audioId);
        }
      }
      if (lesson.vocabulary) {
        for (const v of lesson.vocabulary) {
          if (v.audioId) audioIds.add(v.audioId);
        }
      }
    }

    return audioIds;
  }

  getAllExercises(): any[] {
    if (!this.data) return [];

    const exercises: any[] = [];
    const lessons = this.data.lessons || {};
    const lessonArray = Array.isArray(lessons) ? lessons : Object.values(lessons);

    for (const lesson of lessonArray) {
      if (lesson.exercises) {
        for (const ex of lesson.exercises) {
          exercises.push({
            ...ex,
            lessonId: lesson.id,
          });
        }
      }
    }

    return exercises;
  }
}

// ============================================================
// MAIN SYNC CLASS
// ============================================================

class AudioSync {
  private dictionaryParser: CustomDictionaryParser;
  private manifestParser: ManifestParser;
  private audioValidator: AudioValidator;
  private mappingGenerator: MappingGenerator;

  constructor() {
    this.dictionaryParser = new CustomDictionaryParser(CONFIG.dictionaryPath);
    this.manifestParser = new ManifestParser(CONFIG.manifestsPath);
    this.audioValidator = new AudioValidator(CONFIG.audioBasePath, VOICE_CONFIG);
    this.mappingGenerator = new MappingGenerator(CONFIG.audioMappingPath, VOICE_CONFIG);
  }

  async run() {
    LOG.section('🎵 NUR Audio Sync');
    LOG.info(`Started at: ${new Date().toISOString()}`);
    LOG.info(`Dictionary path: ${CONFIG.dictionaryPath}`);

    // Step 1: Load dictionary
    LOG.section('📖 Step 1: Loading Dictionary');
    
    if (!fs.existsSync(CONFIG.dictionaryPath)) {
      LOG.error(`Dictionary not found at: ${CONFIG.dictionaryPath}`);
      return;
    }

    const dictionary = this.dictionaryParser.load();
    if (!dictionary) {
      LOG.error('Failed to load dictionary. Aborting.');
      return;
    }

    const stats = this.dictionaryParser.getStats();
    LOG.info(`Loaded ${stats.totalLessons} lessons, ${stats.totalExercises} exercises`);
    LOG.info(`Exercises with audio: ${stats.exercisesWithAudio}`);
    LOG.info(`Exercises without audio: ${stats.exercisesWithoutAudio}`);
    LOG.info(`Vocabulary with audio: ${stats.vocabularyWithAudio}`);
    LOG.info(`Unique audio IDs: ${stats.uniqueAudioIds}`);

    // Step 2: Get audio ID map
    LOG.section('🔍 Step 2: Building Audio ID Map');
    const audioIdMap = this.dictionaryParser.getAudioIdMap();
    LOG.info(`Found ${Object.keys(audioIdMap).length} audio mappings`);

    if (Object.keys(audioIdMap).length === 0) {
      LOG.warning('No audio mappings found in dictionary!');
      return;
    }

    // Show some examples
    const entries = Object.entries(audioIdMap).slice(0, 5);
    LOG.debug('Sample mappings:');
    for (const [key, value] of entries) {
      LOG.debug(`  ${key} -> ${value}`);
    }

    // Step 3: Validate audio files
    LOG.section('✅ Step 3: Validating Audio Files');
    const allAudioIds = this.dictionaryParser.getAllAudioIds();
    LOG.info(`Total unique audio IDs from dictionary: ${allAudioIds.size}`);

    // Check which audio files exist
    let existingCount = 0;
    let missingCount = 0;
    const missingFiles: Array<{ audioId: string; language: string; voice: string }> = [];

    for (const audioId of allAudioIds) {
      for (const [lang, voices] of Object.entries(VOICE_CONFIG)) {
        for (const [gender, config] of Object.entries(voices)) {
          const filePath = path.join(CONFIG.audioBasePath, config.dir, `${audioId}.mp3`);
          if (fs.existsSync(filePath)) {
            existingCount++;
          } else {
            missingCount++;
            missingFiles.push({ audioId, language: lang, voice: gender });
          }
        }
      }
    }

    LOG.info(`Existing audio files: ${existingCount}`);
    LOG.info(`Missing audio files: ${missingCount}`);

    if (missingFiles.length > 0) {
      LOG.warning('Missing audio files (first 10):');
      for (const miss of missingFiles.slice(0, 10)) {
        LOG.warning(`  - ${miss.audioId} (${miss.language}/${miss.voice})`);
      }
      if (missingFiles.length > 10) {
        LOG.warning(`  ... and ${missingFiles.length - 10} more`);
      }
    }

    // Step 4: Generate mapping
    LOG.section('📝 Step 4: Generating Audio Mapping');
    
    // Ensure directory exists
    const mappingDir = path.dirname(CONFIG.audioMappingPath);
    if (!fs.existsSync(mappingDir)) {
      fs.mkdirSync(mappingDir, { recursive: true });
    }

    const metadata: Record<string, any> = {};
    const exercises = this.dictionaryParser.getAllExercises();
    
    for (const [exerciseId, audioId] of Object.entries(audioIdMap)) {
      // Find the exercise
      let exercise = exercises.find((e: any) => `${e.lessonId}_${e.id}` === exerciseId);
      
      metadata[audioId] = {
        lessonId: exercise?.lessonId || 'unknown',
        exerciseId: exercise?.id || 'unknown',
        language: exercise?.ttsLang || 'hy',
        filename: `${audioId}.mp3`,
        size: 0,
        duration: 0,
      };
    }

    const success = this.mappingGenerator.save(audioIdMap, metadata);
    if (success) {
      LOG.success('Audio mapping generated');
    } else {
      LOG.error('Failed to generate audio mapping');
    }

    // Step 5: Update manifests
    LOG.section('📋 Step 5: Updating Manifests');
    await this.updateManifests(allAudioIds);

    // Step 6: Generate final report
    LOG.section('📊 Step 6: Final Report');
    this.printFinalReport(stats, allAudioIds.size, missingCount);

    LOG.success('✅ Audio sync completed successfully!');
  }

  private async updateManifests(audioIds: Set<string>) {
    for (const [language, voices] of Object.entries(VOICE_CONFIG)) {
      for (const [gender, config] of Object.entries(voices)) {
        const voiceDir = config.dir;
        const manifestName = `manifest_${voiceDir.toLowerCase()}.json`;
        const manifestPath = path.join(CONFIG.manifestsPath, manifestName);
        const voicePath = path.join(CONFIG.audioBasePath, voiceDir);

        if (!fs.existsSync(voicePath)) {
          LOG.warning(`Voice directory not found: ${voicePath}`);
          continue;
        }

        // Get existing manifest or create new
        let manifest: any = {
          version: '1.0.0',
          generatedAt: new Date().toISOString(),
          totalFiles: 0,
          files: [],
        };

        if (fs.existsSync(manifestPath)) {
          try {
            const content = fs.readFileSync(manifestPath, 'utf-8');
            manifest = JSON.parse(content);
          } catch (e) {
            LOG.warning(`Failed to parse ${manifestName}, creating new`);
          }
        }

        // Update files list
        const files: Array<{ filename: string; audioId: string; size?: number; hash?: string }> = [];
        
        for (const audioId of audioIds) {
          const filePath = path.join(voicePath, `${audioId}.mp3`);
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            files.push({
              filename: `${audioId}.mp3`,
              audioId,
              size: stats.size,
            });
          }
        }

        manifest.files = files;
        manifest.totalFiles = files.length;
        manifest.generatedAt = new Date().toISOString();

        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
        LOG.success(`Updated ${manifestName} (${files.length} files)`);
      }
    }

    // Update audio-filenames-only.txt
    const allFilenames: string[] = [];
    for (const [language, voices] of Object.entries(VOICE_CONFIG)) {
      for (const [gender, config] of Object.entries(voices)) {
        const voicePath = path.join(CONFIG.audioBasePath, config.dir);
        if (!fs.existsSync(voicePath)) continue;
        
        const files = fs.readdirSync(voicePath)
          .filter(f => f.endsWith('.mp3'));
        
        for (const file of files) {
          allFilenames.push(`${config.dir}/${file}`);
        }
      }
    }

    fs.writeFileSync(
      CONFIG.audioFilenamesPath,
      allFilenames.sort().join('\n'),
      'utf-8'
    );
    LOG.success(`Updated audio-filenames-only.txt (${allFilenames.length} files)`);
  }

  private printFinalReport(stats: any, totalAudioIds: number, missingCount: number) {
    console.log();
    console.log('📊 SYNC SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log();

    console.log('📚 Dictionary:');
    console.log(`  - Total lessons: ${stats.totalLessons}`);
    console.log(`  - Total exercises: ${stats.totalExercises}`);
    console.log(`  - Exercises with audio: ${stats.exercisesWithAudio}`);
    console.log(`  - Exercises without audio: ${stats.exercisesWithoutAudio}`);
    console.log(`  - Vocabulary with audio: ${stats.vocabularyWithAudio}`);
    console.log(`  - Unique audio IDs: ${stats.uniqueAudioIds}`);
    console.log();

    console.log('🎵 Audio Files:');
    const manifestStats = this.manifestParser.getStats();
    let totalFiles = 0;
    for (const [voice, data] of Object.entries(manifestStats)) {
      console.log(`  - ${voice}: ${data.totalFiles} files (${(data.totalSize / 1024 / 1024).toFixed(1)} MB)`);
      totalFiles += data.totalFiles;
    }
    console.log(`  - Total: ${totalFiles} files`);
    console.log();

    console.log('⚠️ Issues:');
    console.log(`  - Missing files: ${missingCount}`);
    console.log();

    if (missingCount === 0) {
      LOG.success('✅ All audio files are properly synced!');
    } else {
      LOG.warning(`⚠️ ${missingCount} audio files are missing.`);
      console.log();
      console.log('💡 To fix missing files:');
      console.log('  1. Generate missing audio files using TTS');
      console.log('  2. Or copy from existing voice directories');
      console.log('  3. Run: npm run sync-audio again');
    }

    console.log();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
}

// ============================================================
// RUN
// ============================================================

const sync = new AudioSync();
sync.run().catch(error => {
  LOG.error(`Fatal error: ${error}`);
  console.error(error);
  process.exit(1);
});