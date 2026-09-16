// scripts/convert-dictionary-fixed.js
// Run: node scripts/convert-dictionary-fixed.js
//
// Փոխակերպում է հին dictionary-ը նոր օպտիմալ կառուցվածքի (FIXED)

const fs = require('fs');
const path = require('path');

// ============================================================
// PATHS
// ============================================================

const INPUT_PATH = path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json');
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'dictionary', 'master', 'lesson-dictionary.json');
const BACKUP_PATH = path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.backup.json');

// ============================================================
// LOGGER
// ============================================================

const LOG = {
  info: (msg) => console.log(`\x1b[36mℹ\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m✅\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m⚠️\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m❌\x1b[0m ${msg}`),
  section: (msg) => console.log(`\n\x1b[1m━━━ ${msg} ━━━\x1b[0m\n`),
};

// ============================================================
// CONVERTER (FIXED)
// ============================================================

class DictionaryConverter {
  constructor() {
    this.oldDict = null;
    this.newDict = null;
    this.stats = {
      lessons: 0,
      exercises: 0,
      vocabulary: 0,
      audioIds: 0,
    };
  }

  load() {
    LOG.section('📖 Loading Dictionary');
    
    if (!fs.existsSync(INPUT_PATH)) {
      LOG.error(`Input file not found: ${INPUT_PATH}`);
      return false;
    }

    try {
      const content = fs.readFileSync(INPUT_PATH, 'utf-8');
      this.oldDict = JSON.parse(content);
      LOG.success(`Loaded dictionary v${this.oldDict.version}`);
      return true;
    } catch (error) {
      LOG.error(`Failed to load: ${error.message}`);
      return false;
    }
  }

  convert() {
    LOG.section('🔄 Converting to New Structure');
    
    const old = this.oldDict;
    const lessons = old.lessons || {};
    
    // Convert lessons from object to array
    const lessonArray = Object.values(lessons);
    
    // Build metadata
    const metadata = {
      totalLessons: lessonArray.length,
      totalExercises: 0,
      totalVocabulary: 0,
      totalAudioFiles: 0,
      languages: ['en', 'hy', 'ru'],
      difficultyLevels: ['A1', 'A2', 'B1', 'B2'],
      categories: this.extractCategories(lessonArray),
    };

    // Convert each lesson
    const convertedLessons = [];
    let exerciseCount = 0;
    let vocabCount = 0;
    let audioCount = 0;

    for (const lesson of lessonArray) {
      const converted = this.convertLesson(lesson);
      convertedLessons.push(converted);
      
      // ✅ Count ONLY exercises, not vocabulary
      exerciseCount += converted.exercises.length;
      vocabCount += converted.vocabulary?.length || 0;
      audioCount += this.countAudio(converted);
    }

    // ✅ Fix: Don't double count vocabulary
    metadata.totalExercises = exerciseCount;
    metadata.totalVocabulary = vocabCount;
    metadata.totalAudioFiles = audioCount;

    this.stats = {
      lessons: lessonArray.length,
      exercises: exerciseCount,
      vocabulary: vocabCount,
      audioIds: audioCount,
    };

    this.newDict = {
      version: '3.0',
      generatedAt: new Date().toISOString(),
      metadata: metadata,
      lessons: convertedLessons,
    };

    LOG.success(`✅ Converted ${this.stats.lessons} lessons, ${this.stats.exercises} exercises`);
    LOG.info(`   Vocabulary: ${this.stats.vocabulary}`);
    LOG.info(`   Audio IDs: ${this.stats.audioIds}`);
    return true;
  }

  convertLesson(oldLesson) {
    const newLesson = {
      id: oldLesson.id,
      worldId: oldLesson.worldId || oldLesson.id.split('_')[0],
      order: parseInt(oldLesson.id.split('_')[1]?.replace('l', '')) || 1,
      difficulty: oldLesson.difficulty || 'A1',
      category: this.detectCategory(oldLesson),
      title: oldLesson.title || { en: 'Lesson', hy: 'Դաս', ru: 'Урок' },
      concept: oldLesson.concept || { en: '', hy: '', ru: '' },
      estimatedMinutes: oldLesson.estimatedMinutes || 10,
      prerequisites: oldLesson.prerequisites || [],
      tags: this.extractTags(oldLesson),
      vocabulary: this.convertVocabulary(oldLesson.vocabulary || []),
      exercises: this.convertExercises(oldLesson.exercises || [], oldLesson.id),
    };

    return newLesson;
  }

  convertVocabulary(oldVocab) {
    return oldVocab.map(v => ({
      id: v.id,
      hy: v.hy || '',
      en: v.en || '',
      ru: v.ru || '',
      audioId: v.audioId || null,
    }));
  }

  convertExercises(oldExercises, lessonId) {
    return oldExercises.map((ex, index) => {
      const newEx = {
        id: ex.id || `e${index}`,
        type: this.mapExerciseType(ex.type),
        order: index,
        difficulty: 1,
        points: this.getPoints(ex.type),
        prompt: ex.prompt || { en: '', hy: '', ru: '' },
        audio: this.buildAudio(ex, lessonId),
        correctAnswer: ex.targetAnswer || ex.correctAnswer || '',
        hint: ex.hint || { en: '', hy: '', ru: '' },
        feedback: this.buildFeedback(ex.type),
      };

      // Add type-specific fields
      if (ex.type === 'multiple_choice' || ex.type === 'mc') {
        newEx.options = ex.options || [];
      }

      if (ex.type === 'word_order' || ex.type === 'wo') {
        newEx.words = ex.words || [];
        newEx.correctOrder = ex.correctOrder || [];
      }

      if (ex.type === 'match_pairs' || ex.type === 'mp') {
        newEx.pairs = ex.pairs || [];
      }

      if (ex.type === 'listening' || ex.type === 'ls') {
        newEx.ttsText = ex.ttsText || '';
        newEx.ttsLang = ex.ttsLang || 'hy';
      }

      return newEx;
    });
  }

  buildAudio(ex, lessonId) {
    const audioId = ex.audioId || this.generateAudioId(lessonId, ex);
    const languages = ex.ttsLang ? [ex.ttsLang] : ['en', 'hy', 'ru'];
    
    return {
      id: audioId,
      languages: languages,
      voices: ['male', 'female'],
    };
  }

  mapExerciseType(type) {
    const mapping = {
      'multiple_choice': 'multiple_choice',
      'mc': 'multiple_choice',
      'translate': 'translate',
      'tr': 'translate',
      'word_order': 'word_order',
      'wo': 'word_order',
      'match_pairs': 'match_pairs',
      'mp': 'match_pairs',
      'listening': 'listening',
      'ls': 'listening',
      'free_text': 'free_text',
      'ft': 'free_text',
    };
    return mapping[type] || 'translate';
  }

  getPoints(type) {
    const points = {
      'multiple_choice': 10,
      'translate': 15,
      'word_order': 20,
      'match_pairs': 15,
      'listening': 20,
      'free_text': 25,
    };
    return points[type] || 10;
  }

  buildFeedback(type) {
    const base = {
      correct: {
        en: 'Correct! Well done! 🎉',
        hy: 'Ճիշտ է! Հիանալի! 🎉',
        ru: 'Правильно! Отлично! 🎉'
      },
      incorrect: {
        en: 'Not quite. Try again! 💪',
        hy: 'Մի քիչ սխալ է: Փորձիր նորից! 💪',
        ru: 'Не совсем. Попробуй снова! 💪'
      }
    };
    return base;
  }

  generateAudioId(lessonId, ex) {
    return `${lessonId}_${ex.id || 'e0'}`;
  }

  detectCategory(lesson) {
    const keywords = {
      'greetings': ['greet', 'hello', 'hi', 'morning', 'evening'],
      'family': ['family', 'mother', 'father', 'sister', 'brother'],
      'food': ['food', 'eat', 'drink', 'meal', 'restaurant'],
      'travel': ['travel', 'go', 'come', 'arrive', 'depart'],
      'work': ['work', 'job', 'office', 'meeting', 'business'],
    };

    const title = lesson.title?.en?.toLowerCase() || '';
    const concept = lesson.concept?.en?.toLowerCase() || '';

    for (const [category, words] of Object.entries(keywords)) {
      for (const word of words) {
        if (title.includes(word) || concept.includes(word)) {
          return category;
        }
      }
    }
    return 'general';
  }

  extractCategories(lessons) {
    const categories = new Set();
    for (const lesson of lessons) {
      const cat = this.detectCategory(lesson);
      categories.add(cat);
    }
    return Array.from(categories);
  }

  extractTags(lesson) {
    const tags = [];
    const title = lesson.title?.en?.toLowerCase() || '';
    const concept = lesson.concept?.en?.toLowerCase() || '';

    if (lesson.difficulty) tags.push(lesson.difficulty.toLowerCase());
    
    const cat = this.detectCategory(lesson);
    if (cat !== 'general') tags.push(cat);

    const wordTags = ['basic', 'intermediate', 'advanced'];
    for (const tag of wordTags) {
      if (title.includes(tag) || concept.includes(tag)) {
        tags.push(tag);
      }
    }

    return [...new Set(tags)];
  }

  countAudio(lesson) {
    let count = 0;
    if (lesson.vocabulary) {
      for (const v of lesson.vocabulary) {
        if (v.audioId) count++;
      }
    }
    if (lesson.exercises) {
      for (const ex of lesson.exercises) {
        if (ex.audio && ex.audio.id) count++;
      }
    }
    return count;
  }

  save() {
    LOG.section('💾 Saving New Dictionary');

    // Create backup of old
    if (!fs.existsSync(path.dirname(BACKUP_PATH))) {
      fs.mkdirSync(path.dirname(BACKUP_PATH), { recursive: true });
    }
    fs.copyFileSync(INPUT_PATH, BACKUP_PATH);
    LOG.info(`Backup saved: ${BACKUP_PATH}`);

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save new dictionary
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(this.newDict, null, 2));
    LOG.success(`New dictionary saved: ${OUTPUT_PATH}`);
    LOG.info(`  Lessons: ${this.newDict.metadata.totalLessons}`);
    LOG.info(`  Exercises: ${this.newDict.metadata.totalExercises}`);
    LOG.info(`  Vocabulary: ${this.newDict.metadata.totalVocabulary}`);
    LOG.info(`  Audio Files: ${this.newDict.metadata.totalAudioFiles}`);

    // Also save a compact version
    const compactPath = OUTPUT_PATH.replace('.json', '.compact.json');
    fs.writeFileSync(compactPath, JSON.stringify(this.newDict));
    LOG.info(`Compact version saved: ${compactPath}`);

    return true;
  }

  generateReport() {
    LOG.section('📊 CONVERSION REPORT');
    console.log(`  Lessons: ${this.stats.lessons}`);
    console.log(`  Exercises: ${this.stats.exercises}`);
    console.log(`  Vocabulary: ${this.stats.vocabulary}`);
    console.log(`  Audio IDs: ${this.stats.audioIds}`);
    console.log(`  Categories: ${this.newDict.metadata.categories.join(', ')}`);
    console.log(`  Languages: ${this.newDict.metadata.languages.join(', ')}`);
    console.log(`  Version: ${this.newDict.version}`);
    console.log(`  Generated: ${this.newDict.generatedAt}`);
    
    // File sizes
    const oldSize = fs.statSync(INPUT_PATH).size;
    const newSize = fs.statSync(OUTPUT_PATH).size;
    console.log(`\n  File sizes:`);
    console.log(`    Old: ${(oldSize / 1024).toFixed(1)} KB`);
    console.log(`    New: ${(newSize / 1024).toFixed(1)} KB`);
    console.log(`    Difference: ${((newSize - oldSize) / 1024).toFixed(1)} KB`);
    
    // Coverage
    const coverage = ((this.stats.audioIds / this.stats.exercises) * 100).toFixed(1);
    console.log(`\n  Audio Coverage: ${coverage}%`);
  }

  run() {
    LOG.section('🔄 DICTIONARY CONVERTER (FIXED)');
    console.log(`Started: ${new Date().toISOString()}`);
    console.log();

    if (!this.load()) {
      LOG.error('Conversion aborted');
      return;
    }

    if (!this.convert()) {
      LOG.error('Conversion failed');
      return;
    }

    if (!this.save()) {
      LOG.error('Save failed');
      return;
    }

    this.generateReport();
    LOG.success('✅ Conversion completed successfully!');
    console.log();
    console.log('💡 Next steps:');
    console.log('  1. Run: node scripts/scan-dictionaries.js');
    console.log('  2. Run: npm run sync-audio');
    console.log('  3. Test: npm run dev');
  }
}

// ============================================================
// RUN
// ============================================================

const converter = new DictionaryConverter();
converter.run();