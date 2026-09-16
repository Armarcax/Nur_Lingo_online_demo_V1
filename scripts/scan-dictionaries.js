// scripts/scan-dictionaries.js
// Run: node scripts/scan-dictionaries.js
//
// Սկանավորում է բառարանները և ցույց տալիս ամբողջական վիճակագրություն
// Աջակցում է և՛ v2.0, և՛ v3.0 ֆորմատներին

const fs = require('fs');
const path = require('path');

// ============================================================
// PATHS
// ============================================================

const PATHS = {
  main: path.join(process.cwd(), 'data', 'dictionary', 'master', 'lesson-dictionary.json'),
  public: path.join(process.cwd(), 'public', 'data', 'lesson-dictionary.json'),
  manifest: path.join(process.cwd(), 'data', 'audio', 'manifests', 'audio-manifest.json'),
  old: path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json'),
};

// ============================================================
// LOGGER
// ============================================================

const LOG = {
  info: (msg) => console.log(`\x1b[36mℹ\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m✅\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m⚠️\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m❌\x1b[0m ${msg}`),
  section: (msg) => console.log(`\n\x1b[1m━━━ ${msg} ━━━\x1b[0m\n`),
  title: (msg) => console.log(`\n\x1b[1m${msg}\x1b[0m`),
  hr: () => console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
};

// ============================================================
// DICTIONARY ANALYZER
// ============================================================

class DictionaryAnalyzer {
  constructor(filePath, name) {
    this.filePath = filePath;
    this.name = name;
    this.data = null;
    this.stats = {};
    this.errors = [];
    this.isV3 = false;
  }

  load() {
    try {
      if (!fs.existsSync(this.filePath)) {
        this.errors.push(`File not found: ${this.filePath}`);
        return false;
      }

      const content = fs.readFileSync(this.filePath, 'utf-8');
      this.data = JSON.parse(content);
      this.isV3 = this.data.version === '3.0';
      return true;
    } catch (error) {
      this.errors.push(`Failed to parse: ${error.message}`);
      return false;
    }
  }

  analyze() {
    if (!this.data) return;

    const stats = {
      version: this.data.version || 'unknown',
      generatedAt: this.data.generatedAt || this.data.metadata?.generatedAt || 'unknown',
      totalLessons: 0,
      totalExercises: 0,
      totalVocabulary: 0,
      totalDialogues: 0,
      totalPhrases: 0,
      totalAudioIds: 0,
      uniqueAudioIds: new Set(),
      exercisesByType: {},
      lessons: [],
      hasAudioIds: 0,
      noAudioIds: 0,
      totalWords: 0,
      totalCharacters: 0,
      languages: new Set(),
      largestLesson: { id: '', exercises: 0 },
      smallestLesson: { id: '', exercises: Infinity },
      duplicateAudioIds: [],
      audioIdMap: {},
      categories: new Set(),
      difficultyLevels: new Set(),
      lessonsWithExercises: 0,
      lessonsWithoutExercises: 0,
    };

    if (this.isV3) {
      // ✅ V3 STRUCTURE
      stats.totalLessons = this.data.metadata?.totalLessons || 0;
      stats.totalExercises = this.data.metadata?.totalExercises || 0;
      stats.totalVocabulary = this.data.metadata?.totalVocabulary || 0;
      
      if (this.data.metadata?.languages) {
        for (const lang of this.data.metadata.languages) {
          stats.languages.add(lang);
        }
      }
      
      if (this.data.metadata?.categories) {
        for (const cat of this.data.metadata.categories) {
          stats.categories.add(cat);
        }
      }
      
      if (this.data.metadata?.difficultyLevels) {
        for (const level of this.data.metadata.difficultyLevels) {
          stats.difficultyLevels.add(level);
        }
      }

      if (Array.isArray(this.data.lessons)) {
        for (const lesson of this.data.lessons) {
          this.analyzeLessonV3(lesson, stats);
        }
      }
    } else {
      // ✅ V2 STRUCTURE (fallback)
      const lessons = this.data.lessons || {};
      
      if (Array.isArray(lessons)) {
        stats.totalLessons = lessons.length;
        for (const lesson of lessons) {
          this.analyzeLessonV2(lesson, stats);
        }
      } else if (typeof lessons === 'object') {
        stats.totalLessons = Object.keys(lessons).length;
        for (const [id, lesson] of Object.entries(lessons)) {
          this.analyzeLessonV2({ ...lesson, id }, stats);
        }
      }
    }

    // ✅ Calculate unique audio IDs
    stats.uniqueAudioIds = stats.uniqueAudioIds.size;
    stats.audioIdMap = stats.audioIdMap;

    // ✅ Find duplicate audio IDs
    const audioIdCount = {};
    for (const [key, audioId] of Object.entries(stats.audioIdMap)) {
      if (!audioIdCount[audioId]) audioIdCount[audioId] = [];
      audioIdCount[audioId].push(key);
    }
    stats.duplicateAudioIds = Object.entries(audioIdCount)
      .filter(([id, keys]) => keys.length > 1)
      .map(([id, keys]) => ({ id, count: keys.length, exercises: keys }));

    // ✅ Fix smallest lesson if no lessons
    if (stats.smallestLesson.exercises === Infinity) {
      stats.smallestLesson = { id: 'none', exercises: 0 };
    }

    this.stats = stats;
    return stats;
  }

  analyzeLessonV3(lesson, stats) {
    const lessonId = lesson.id || 'unknown';
    stats.lessons.push(lessonId);

    if (lesson.category) stats.categories.add(lesson.category);
    if (lesson.difficulty) stats.difficultyLevels.add(lesson.difficulty);

    // ✅ Count exercises from the lesson
    if (lesson.exercises && Array.isArray(lesson.exercises)) {
      const exerciseCount = lesson.exercises.length;
      stats.lessonsWithExercises++;

      if (exerciseCount > stats.largestLesson.exercises) {
        stats.largestLesson = { id: lessonId, exercises: exerciseCount };
      }
      if (exerciseCount < stats.smallestLesson.exercises) {
        stats.smallestLesson = { id: lessonId, exercises: exerciseCount };
      }

      for (const ex of lesson.exercises) {
        const type = ex.type || 'unknown';
        stats.exercisesByType[type] = (stats.exercisesByType[type] || 0) + 1;

        // ✅ Audio from new structure
        if (ex.audio && ex.audio.id) {
          stats.hasAudioIds++;
          stats.uniqueAudioIds.add(ex.audio.id);
          stats.audioIdMap[`${lessonId}_${ex.id}`] = ex.audio.id;
          
          if (ex.audio.languages) {
            for (const lang of ex.audio.languages) {
              stats.languages.add(lang);
            }
          }
        } else {
          stats.noAudioIds++;
        }

        // ✅ Count words/characters from prompts
        if (ex.prompt) {
          for (const [lang, text] of Object.entries(ex.prompt)) {
            if (typeof text === 'string') {
              stats.totalWords += text.split(/\s+/).length;
              stats.totalCharacters += text.length;
            }
          }
        }
      }
    } else {
      stats.lessonsWithoutExercises++;
    }

    // ✅ Vocabulary (separate from exercises)
    if (lesson.vocabulary && Array.isArray(lesson.vocabulary)) {
      for (const v of lesson.vocabulary) {
        if (v.audioId) {
          stats.uniqueAudioIds.add(v.audioId);
          stats.audioIdMap[`${lessonId}_vocab_${v.id}`] = v.audioId;
        }
        if (v.en) {
          stats.totalWords += v.en.split(/\s+/).length;
          stats.totalCharacters += v.en.length;
        }
        if (v.hy) {
          stats.totalWords += v.hy.split(/\s+/).length;
          stats.totalCharacters += v.hy.length;
        }
        if (v.ru) {
          stats.totalWords += v.ru.split(/\s+/).length;
          stats.totalCharacters += v.ru.length;
        }
      }
    }
  }

  analyzeLessonV2(lesson, stats) {
    const lessonId = lesson.id || 'unknown';
    stats.lessons.push(lessonId);

    if (lesson.exercises && Array.isArray(lesson.exercises)) {
      const exerciseCount = lesson.exercises.length;
      stats.lessonsWithExercises++;
      stats.totalExercises += exerciseCount;

      if (exerciseCount > stats.largestLesson.exercises) {
        stats.largestLesson = { id: lessonId, exercises: exerciseCount };
      }
      if (exerciseCount < stats.smallestLesson.exercises) {
        stats.smallestLesson = { id: lessonId, exercises: exerciseCount };
      }

      for (const ex of lesson.exercises) {
        const type = ex.type || 'unknown';
        stats.exercisesByType[type] = (stats.exercisesByType[type] || 0) + 1;

        if (ex.audioId) {
          stats.hasAudioIds++;
          stats.uniqueAudioIds.add(ex.audioId);
          stats.audioIdMap[`${lessonId}_${ex.id}`] = ex.audioId;
        } else {
          stats.noAudioIds++;
        }

        if (ex.prompt) {
          for (const [lang, text] of Object.entries(ex.prompt)) {
            stats.languages.add(lang);
            if (typeof text === 'string') {
              stats.totalWords += text.split(/\s+/).length;
              stats.totalCharacters += text.length;
            }
          }
        }
      }
    }

    if (lesson.vocabulary && Array.isArray(lesson.vocabulary)) {
      stats.totalVocabulary += lesson.vocabulary.length;
      for (const v of lesson.vocabulary) {
        if (v.audioId) {
          stats.uniqueAudioIds.add(v.audioId);
          stats.audioIdMap[`${lessonId}_vocab_${v.id}`] = v.audioId;
        }
        if (v.en) {
          stats.totalWords += v.en.split(/\s+/).length;
          stats.totalCharacters += v.en.length;
        }
        if (v.hy) {
          stats.totalWords += v.hy.split(/\s+/).length;
          stats.totalCharacters += v.hy.length;
        }
        if (v.ru) {
          stats.totalWords += v.ru.split(/\s+/).length;
          stats.totalCharacters += v.ru.length;
        }
      }
    }
  }

  getStats() {
    return this.stats;
  }

  printStats() {
    const s = this.stats;
    
    console.log(`\n📊 ${this.name}`);
    console.log('──────────────────────────────────────────');
    console.log(`  Version: ${s.version}`);
    console.log(`  Generated: ${s.generatedAt}`);
    console.log(`  Total Lessons: ${s.totalLessons}`);
    console.log(`  Total Exercises: ${s.totalExercises}`);
    console.log(`  Total Vocabulary: ${s.totalVocabulary}`);
    console.log(`  Total Dialogues: ${s.totalDialogues}`);
    console.log(`  Total Phrases: ${s.totalPhrases}`);
    console.log(`  Total Audio IDs: ${s.uniqueAudioIds}`);
    console.log(`  Exercises with Audio: ${s.hasAudioIds}`);
    console.log(`  Exercises without Audio: ${s.noAudioIds}`);
    console.log(`  Languages: ${[...s.languages].join(', ') || 'none'}`);
    console.log(`  Categories: ${[...s.categories].join(', ') || 'none'}`);
    console.log(`  Difficulty Levels: ${[...s.difficultyLevels].join(', ') || 'none'}`);
    console.log(`  Total Words: ${s.totalWords}`);
    console.log(`  Total Characters: ${s.totalCharacters}`);
    console.log(`  Largest Lesson: ${s.largestLesson.id} (${s.largestLesson.exercises} exercises)`);
    console.log(`  Smallest Lesson: ${s.smallestLesson.id} (${s.smallestLesson.exercises} exercises)`);
    console.log(`  Lessons with Exercises: ${s.lessonsWithExercises}`);
    console.log(`  Lessons without Exercises: ${s.lessonsWithoutExercises}`);
    
    if (Object.keys(s.exercisesByType).length > 0) {
      console.log(`  Exercise Types:`);
      for (const [type, count] of Object.entries(s.exercisesByType).sort()) {
        console.log(`    - ${type}: ${count}`);
      }
    }
    
    if (s.duplicateAudioIds.length > 0) {
      console.log(`  ⚠️ Duplicate Audio IDs: ${s.duplicateAudioIds.length}`);
      for (const dup of s.duplicateAudioIds.slice(0, 5)) {
        console.log(`    - ${dup.id} (${dup.count}x): ${dup.exercises.join(', ')}`);
      }
      if (s.duplicateAudioIds.length > 5) {
        console.log(`    ... and ${s.duplicateAudioIds.length - 5} more`);
      }
    }
  }
}

// ============================================================
// COMPARISON
// ============================================================

function compareDictionaries(dicts) {
  LOG.section('📊 COMPARISON ANALYSIS');
  
  const labels = dicts.map(d => d.name.replace(/📖 |📁 |📋 |📜 /g, '').substring(0, 12));
  
  // Header
  console.log('┌──────────────┬' + labels.map(() => '────────────┬').join('') + '────────────┐');
  console.log('│ Metric       │' + labels.map(l => ` ${l.padEnd(10)} │`).join('') + '────────────┤');
  console.log('├──────────────┼' + labels.map(() => '────────────┼').join('') + '────────────┤');
  
  const metrics = [
    ['Lessons', 'totalLessons'],
    ['Exercises', 'totalExercises'],
    ['Vocabulary', 'totalVocabulary'],
    ['Audio IDs', 'uniqueAudioIds'],
    ['With Audio', 'hasAudioIds'],
    ['Without Audio', 'noAudioIds'],
    ['Words', 'totalWords'],
    ['Chars', 'totalCharacters'],
  ];
  
  for (const [label, key] of metrics) {
    const values = dicts.map(d => {
      const val = d.stats[key] !== undefined ? d.stats[key] : 'N/A';
      return typeof val === 'number' ? String(val).padStart(10) : val.padStart(10);
    });
    console.log(`│ ${label.padEnd(12)} │${values.join('│')}│`);
  }
  
  console.log('└──────────────┴' + labels.map(() => '────────────┴').join('') + '────────────┘');
}

function printRecommendations(dicts) {
  LOG.section('💡 RECOMMENDATIONS');
  
  const main = dicts[0];
  const public = dicts[1];
  
  if (main && public) {
    // Check sync
    if (main.stats.totalLessons !== public.stats.totalLessons) {
      LOG.warning(`Main has ${main.stats.totalLessons} lessons, Public has ${public.stats.totalLessons} lessons - NOT SYNCED!`);
    } else {
      LOG.success('Main and Public dictionaries are SYNCED');
    }
    
    // Audio coverage
    const mainAudioPct = main.stats.totalExercises > 0 
      ? ((main.stats.hasAudioIds / main.stats.totalExercises) * 100).toFixed(1)
      : 0;
    
    console.log(`\n  Audio Coverage:`);
    console.log(`    Main: ${mainAudioPct}% (${main.stats.hasAudioIds}/${main.stats.totalExercises})`);
    
    if (parseFloat(mainAudioPct) < 80) {
      LOG.warning(`⚠️ Low audio coverage (${mainAudioPct}%). Consider adding more audio files.`);
    } else if (parseFloat(mainAudioPct) >= 90) {
      LOG.success(`✅ Good audio coverage (${mainAudioPct}%)`);
    }
  }
  
  // Categories
  if (main && main.stats.categories.size > 0) {
    console.log(`\n  Categories: ${[...main.stats.categories].join(', ')}`);
  }
  
  // Exercise types
  if (main && Object.keys(main.stats.exercisesByType).length > 0) {
    console.log(`\n  Exercise Types:`);
    for (const [type, count] of Object.entries(main.stats.exercisesByType).sort()) {
      console.log(`    ${type}: ${count}`);
    }
  }
  
  // Best structure
  console.log(`\n  Best Structure:`);
  const sizes = dicts.map(d => {
    if (!d.data) return 0;
    const str = JSON.stringify(d.data);
    return str.length;
  });
  
  const validSizes = sizes.filter(s => s > 0);
  if (validSizes.length > 0) {
    const minIdx = sizes.indexOf(Math.min(...validSizes));
    const maxIdx = sizes.indexOf(Math.max(...validSizes));
    if (minIdx >= 0 && maxIdx >= 0) {
      console.log(`    Smallest file: ${dicts[minIdx].name} (${(Math.min(...validSizes) / 1024).toFixed(1)} KB)`);
      console.log(`    Largest file: ${dicts[maxIdx].name} (${(Math.max(...validSizes) / 1024).toFixed(1)} KB)`);
    }
  }
  
  // Duplicates warning
  if (main && main.stats.duplicateAudioIds.length > 0) {
    LOG.warning(`⚠️ ${main.stats.duplicateAudioIds.length} duplicate audio IDs found in Main dictionary`);
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  LOG.section('🔍 DICTIONARY SCANNER');
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log();
  
  const dictionaries = [];
  
  // Load each dictionary
  for (const [name, filePath] of Object.entries(PATHS)) {
    const label = {
      main: '📖 Main Dictionary',
      public: '📁 Public Dictionary',
      manifest: '📋 Manifest',
      old: '📜 Old Dictionary'
    }[name] || name;
    
    const dict = new DictionaryAnalyzer(filePath, label);
    const loaded = dict.load();
    dictionaries.push(dict);
    
    if (loaded) {
      dict.analyze();
      LOG.success(`${label} loaded successfully`);
    } else {
      LOG.error(`${label} FAILED to load`);
      if (dict.errors.length > 0) {
        for (const err of dict.errors) {
          LOG.error(`  - ${err}`);
        }
      }
    }
  }
  
  // Print individual stats
  for (const dict of dictionaries) {
    if (dict.data) {
      dict.printStats();
    }
  }
  
  // Compare
  const validDicts = dictionaries.filter(d => d.data);
  if (validDicts.length >= 2) {
    compareDictionaries(validDicts);
    printRecommendations(validDicts);
  }
  
  // Summary
  LOG.section('📈 SUMMARY');
  console.log(`  Total dictionaries scanned: ${dictionaries.length}`);
  console.log(`  Successfully loaded: ${validDicts.length}`);
  console.log(`  Failed: ${dictionaries.length - validDicts.length}`);
  
  // File sizes
  console.log(`\n  File sizes:`);
  for (const [name, filePath] of Object.entries(PATHS)) {
    if (fs.existsSync(filePath)) {
      const size = fs.statSync(filePath).size;
      console.log(`    ${name}: ${(size / 1024).toFixed(1)} KB (${size} bytes)`);
    } else {
      console.log(`    ${name}: ❌ NOT FOUND`);
    }
  }
  
  // Final status
  console.log();
  const mainDict = validDicts.find(d => d.name.includes('Main'));
  if (mainDict) {
    const audioPct = mainDict.stats.totalExercises > 0 
      ? ((mainDict.stats.hasAudioIds / mainDict.stats.totalExercises) * 100).toFixed(1)
      : 0;
    const status = parseFloat(audioPct) >= 90 ? '✅ GOOD' : '⚠️ NEEDS WORK';
    console.log(`  Status: ${status} (${audioPct}% audio coverage)`);
  }
  
  console.log('\n✅ Scan complete!');
}

// ============================================================
// RUN
// ============================================================

main().catch(console.error);