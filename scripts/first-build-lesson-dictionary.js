// scripts/build-lesson-dictionary.js
// Run: node scripts/build-lesson-dictionary.js

const fs = require('fs');
const path = require('path');

// ─── PATHS ────────────────────────────────────────────────────────────

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'data');
const DICTIONARY_OUTPUT = path.join(OUTPUT_DIR, 'lesson-dictionary.json');
const AUDIO_MANIFEST_OUTPUT = path.join(OUTPUT_DIR, 'audio-manifest.json');

// ─── LOAD TYPESCRIPT FILES ──────────────────────────────────────────

function loadTypeScriptFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Extract the data using regex
    // This is a simplified approach - for production use a proper parser
    return content;
  } catch (error) {
    console.error(`❌ Failed to load ${filePath}:`, error.message);
    return null;
  }
}

// ─── EXTRACT LESSONS FROM ENGINE.TS ────────────────────────────────

function extractLessonsFromEngine(content) {
  const lessons = [];
  
  // Try to match LESSONS array
  const lessonRegex = /export const LESSONS: Lesson\[] = \[([\s\S]*?)\];/;
  const match = content.match(lessonRegex);
  
  if (match) {
    const lessonContent = match[1];
    // Extract each lesson object
    const lessonObjects = lessonContent.split(/\{\s*id:/).slice(1);
    
    for (const obj of lessonObjects) {
      try {
        const id = obj.match(/id:\s*["']([^"']+)["']/)?.[1] || '';
        const unitId = obj.match(/unitId:\s*["']([^"']+)["']/)?.[1] || '';
        const title = obj.match(/title:\s*["']([^"']+)["']/)?.[1] || '';
        const titleArmenian = obj.match(/titleArmenian:\s*["']([^"']+)["']/)?.[1] || '';
        const description = obj.match(/description:\s*["']([^"']+)["']/)?.[1] || '';
        const cefr = obj.match(/cefr:\s*["']([^"']+)["']/)?.[1] || 'A1';
        const difficulty = parseInt(obj.match(/difficulty:\s*(\d+)/)?.[1] || '1');
        const order = parseInt(obj.match(/order:\s*(\d+)/)?.[1] || '0');
        const hayqTotal = parseInt(obj.match(/hayqTotal:\s*(\d+)/)?.[1] || '0');
        const estimatedMinutes = parseInt(obj.match(/estimatedMinutes:\s*(\d+)/)?.[1] || '5');
        
        // Extract exercises
        const exercises = [];
        const exerciseRegex = /generate(MCE|Translation|WordOrder)Exercise\([^)]*\)/g;
        const exerciseMatches = obj.match(exerciseRegex) || [];
        
        for (const ex of exerciseMatches) {
          exercises.push({
            id: `ex_${id}_${exercises.length + 1}`,
            type: ex.includes('MCE') ? 'multiple_choice' : 
                  ex.includes('Translation') ? 'translate' : 'word_order',
            prompt: { en: '', hy: '', ru: '' },
            targetAnswer: '',
            acceptableAnswers: [],
            hayqReward: 10,
          });
        }
        
        lessons.push({
          id,
          unitId,
          title,
          titleArmenian,
          description,
          cefr,
          difficulty,
          order,
          hayqTotal,
          estimatedMinutes,
          exercises,
          vocabulary: [],
        });
      } catch (error) {
        console.warn('⚠️ Failed to parse lesson:', error.message);
      }
    }
  }
  
  return lessons;
}

// ─── EXTRACT UNITS FROM ENGINE.TS ──────────────────────────────────

function extractUnitsFromEngine(content) {
  const units = [];
  
  const unitRegex = /export const UNITS: Unit\[] = \[([\s\S]*?)\];/;
  const match = content.match(unitRegex);
  
  if (match) {
    const unitContent = match[1];
    const unitObjects = unitContent.split(/\{\s*id:/).slice(1);
    
    for (const obj of unitObjects) {
      try {
        const id = obj.match(/id:\s*["']([^"']+)["']/)?.[1] || '';
        const title = obj.match(/title:\s*["']([^"']+)["']/)?.[1] || '';
        const titleArmenian = obj.match(/titleArmenian:\s*["']([^"']+)["']/)?.[1] || '';
        const description = obj.match(/description:\s*["']([^"']+)["']/)?.[1] || '';
        const iconEmoji = obj.match(/iconEmoji:\s*["']([^"']+)["']/)?.[1] || '📚';
        const colorFrom = obj.match(/colorFrom:\s*["']([^"']+)["']/)?.[1] || '#D90012';
        const colorTo = obj.match(/colorTo:\s*["']([^"']+)["']/)?.[1] || '#8b0000';
        
        units.push({
          id,
          title,
          titleArmenian,
          description,
          iconEmoji,
          colorFrom,
          colorTo,
          lessons: [],
        });
      } catch (error) {
        console.warn('⚠️ Failed to parse unit:', error.message);
      }
    }
  }
  
  return units;
}

// ─── EXTRACT VOCABULARY FROM DICTIONARY.TS ─────────────────────────

function extractVocabularyFromDictionary(content) {
  const vocab = [];
  
  // Try to match LEXICON array
  const lexiconRegex = /export const LEXICON: LexiconEntry\[] = \[([\s\S]*?)\];/;
  const match = content.match(lexiconRegex);
  
  if (match) {
    const lexiconContent = match[1];
    const entries = lexiconContent.split(/\{\s*id:/).slice(1);
    
    for (const entry of entries) {
      try {
        const id = entry.match(/id:\s*["']([^"']+)["']/)?.[1] || '';
        const word = entry.match(/word:\s*["']([^"']+)["']/)?.[1] || '';
        const english = entry.match(/english:\s*\[["']([^"']+)["']\]/)?.[1] || '';
        
        if (id && word) {
          vocab.push({
            id,
            hy: word,
            en: english || word,
            ru: '',
          });
        }
      } catch {
        // Ignore
      }
    }
  }
  
  return vocab;
}

// ─── MAIN ────────────────────────────────────────────────────────────

function main() {
  console.log('📚 Building Lesson Dictionary from TypeScript files');
  console.log('====================================================\n');
  
  // 1. Load engine.ts
  const enginePath = path.join(process.cwd(), 'src', 'lib', 'lessons', 'engine.ts');
  const engineContent = loadTypeScriptFile(enginePath);
  
  if (!engineContent) {
    console.error('❌ Failed to load engine.ts');
    return;
  }
  
  // 2. Extract lessons and units
  const lessons = extractLessonsFromEngine(engineContent);
  const units = extractUnitsFromEngine(engineContent);
  
  console.log(`📚 Extracted ${lessons.length} lessons`);
  console.log(`📚 Extracted ${units.length} units`);
  
  // 3. Load dictionary.ts for vocabulary
  const dictPath = path.join(process.cwd(), 'src', 'lib', 'lexicon', 'dictionary.ts');
  const dictContent = loadTypeScriptFile(dictPath);
  let vocabulary = [];
  
  if (dictContent) {
    vocabulary = extractVocabularyFromDictionary(dictContent);
    console.log(`📚 Extracted ${vocabulary.length} vocabulary entries`);
  }
  
  // 4. Build dictionary
  const dictionary = {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    units: units,
    lessons: lessons,
    vocabulary: vocabulary,
    stats: {
      totalUnits: units.length,
      totalLessons: lessons.length,
      totalVocabulary: vocabulary.length,
    }
  };
  
  // 5. Save to file
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  fs.writeFileSync(DICTIONARY_OUTPUT, JSON.stringify(dictionary, null, 2));
  console.log(`\n✅ Saved to: ${DICTIONARY_OUTPUT}`);
  console.log(`📊 Stats: ${dictionary.stats.totalLessons} lessons, ${dictionary.stats.totalVocabulary} words`);
  
  // 6. Create audio manifest template
  const audioManifest = {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    totalEntries: dictionary.stats.totalVocabulary,
    entries: {},
  };
  
  for (const word of vocabulary) {
    audioManifest.entries[word.id] = {
      hy: `/audio/hy_wav/${word.id}.mp3`,
      word: word.hy,
    };
  }
  
  fs.writeFileSync(AUDIO_MANIFEST_OUTPUT, JSON.stringify(audioManifest, null, 2));
  console.log(`✅ Audio manifest template saved: ${AUDIO_MANIFEST_OUTPUT}`);
  
  console.log('\n✅ Done!');
}

main().catch(console.error);