// scripts/generate-audio-mapping.js
const fs = require('fs');
const path = require('path');

// ============================================================
// 1. Կարդալ EXERCISE_TO_AUDIO-ն audio-mapping.ts-ից
// ============================================================
function parseExerciseToAudio() {
  const filePath = path.join(__dirname, '../src/lib/content/audio-mapping.ts');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const exerciseToAudio = {};
  
  // Գտնել EXERCISE_TO_AUDIO բլոկը
  const regex = /export const EXERCISE_TO_AUDIO\s*:\s*Record<string,\s*string>\s*=\s*{([\s\S]*?)};/;
  const match = content.match(regex);
  
  if (!match) {
    console.error('❌ EXERCISE_TO_AUDIO not found');
    return exerciseToAudio;
  }
  
  const block = match[1];
  const lineRegex = /['"](\w+)['"]\s*:\s*['"](\w+)['"]/g;
  let lineMatch;
  
  while ((lineMatch = lineRegex.exec(block)) !== null) {
    exerciseToAudio[lineMatch[1]] = lineMatch[2];
  }
  
  console.log(`✅ Found ${Object.keys(exerciseToAudio).length} EXERCISE_TO_AUDIO entries`);
  return exerciseToAudio;
}

// ============================================================
// 2. Կարդալ audio-num-*.json ֆայլերը
// ============================================================
function loadNumericMappings() {
  const mappingsDir = path.join(__dirname, '../src/lib/content/mappings');
  const result = {};
  
  const files = ['audio-num-hy-mapping.json', 'audio-num-en-mapping.json', 'audio-num-ru-mapping.json'];
  
  for (const file of files) {
    const filePath = path.join(mappingsDir, file);
    if (!fs.existsSync(filePath)) continue;
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      const lang = file.replace('audio-num-', '').replace('-mapping.json', '');
      
      if (data.languages && data.languages[lang]) {
        result[lang] = data.languages[lang].audioToNum || {};
        console.log(`✅ Loaded ${Object.keys(result[lang]).length} mappings from ${file}`);
      }
    } catch (err) {
      console.error(`❌ Error loading ${file}:`, err.message);
    }
  }
  
  return result;
}

// ============================================================
// 3. Կարդալ manifest-ները
// ============================================================
function loadManifests() {
  const offlineDir = path.join(__dirname, '../public/audio/offline');
  const result = {};
  
  const files = {
    hy: 'manifest_hy_ani.json',
    en: 'manifest_en_female.json',
    ru: 'manifest_ru_female.json',
  };
  
  for (const [lang, file] of Object.entries(files)) {
    const filePath = path.join(offlineDir, file);
    if (!fs.existsSync(filePath)) continue;
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      if (data.mapping) {
        result[lang] = data.mapping;
        console.log(`✅ Loaded ${Object.keys(result[lang]).length} mappings from ${file}`);
      }
    } catch (err) {
      console.error(`❌ Error loading ${file}:`, err.message);
    }
  }
  
  return result;
}

// ============================================================
// 4. Ստեղծել numeric մեփփինգ
// ============================================================
function createNumericMapping(exerciseToAudio, numericMappings, manifests) {
  const exerciseToNumeric = {};
  const audioKeyToNumeric = {};
  const numericToAudioKey = {};
  
  // Ստեղծել audioKey → numericId
  for (const [exerciseId, audioKey] of Object.entries(exerciseToAudio)) {
    let numericId = null;
    
    // Փորձել numeric-ից
    for (const lang of ['hy', 'en', 'ru']) {
      if (numericMappings[lang] && numericMappings[lang][audioKey]) {
        numericId = numericMappings[lang][audioKey];
        break;
      }
    }
    
    // Եթե numeric-ում չկա, փորձել manifest-ից
    if (!numericId) {
      for (const lang of ['hy', 'en', 'ru']) {
        if (manifests[lang] && manifests[lang][audioKey]) {
          numericId = manifests[lang][audioKey];
          break;
        }
      }
    }
    
    if (numericId) {
      exerciseToNumeric[exerciseId] = numericId;
      audioKeyToNumeric[audioKey] = numericId;
    }
  }
  
  // Ստեղծել numeric → audioKey
  for (const [audioKey, numericId] of Object.entries(audioKeyToNumeric)) {
    numericToAudioKey[numericId] = audioKey;
  }
  
  return { exerciseToNumeric, audioKeyToNumeric, numericToAudioKey };
}

// ============================================================
// 5. Գեներացնել նոր ֆայլը
// ============================================================
function generateNewFile(exerciseToAudio, exerciseToNumeric, audioKeyToNumeric, numericToAudioKey) {
  const timestamp = new Date().toISOString();
  
  // EXERCISE_TO_AUDIO
  const exerciseToAudioLines = Object.entries(exerciseToAudio)
    .map(([id, key]) => `  '${id}': '${key}'`)
    .join(',\n');
  
  // EXERCISE_TO_NUMERIC
  const exerciseToNumericLines = Object.entries(exerciseToNumeric)
    .map(([id, num]) => `  '${id}': '${num}'`)
    .join(',\n');
  
  // AUDIO_KEY_TO_NUMERIC
  const audioKeyToNumericLines = Object.entries(audioKeyToNumeric)
    .map(([key, num]) => `  '${key}': '${num}'`)
    .join(',\n');
  
  // NUMERIC_TO_AUDIO_KEY
  const numericToAudioKeyLines = Object.entries(numericToAudioKey)
    .map(([num, key]) => `  '${num}': '${key}'`)
    .join(',\n');
  
  return `// src/lib/content/audio-mapping.ts
// ⚠️ ԱՎՏՈՄԱՏ ԳԵՆԵՐԱՑՎԱԾ ՖԱՅԼ - ՄԻ ԽՄԲԱԳՐԵԼ ՁԵՌՔՈՎ
// Վերջին թարմացում: ${timestamp}
// 
// 📊 ՎԻՃԱԿԱԳՐՈՒԹՅՈՒՆ:
//    EXERCISE_TO_AUDIO: ${Object.keys(exerciseToAudio).length}
//    EXERCISE_TO_NUMERIC: ${Object.keys(exerciseToNumeric).length}
//    AUDIO_KEY_TO_NUMERIC: ${Object.keys(audioKeyToNumeric).length}
//    NUMERIC_TO_AUDIO_KEY: ${Object.keys(numericToAudioKey).length}
//    Coverage: ${Math.round((Object.keys(exerciseToNumeric).length / Object.keys(exerciseToAudio).length) * 100)}%

// ============================================================
// 1. EXERCISE → AUDIO KEY (from original)
// ============================================================
export const EXERCISE_TO_AUDIO: Record<string, string> = {
${exerciseToAudioLines}
};

// ============================================================
// 2. EXERCISE → NUMERIC ID (000001, 000002, ...)
// ============================================================
export const EXERCISE_TO_NUMERIC: Record<string, string> = {
${exerciseToNumericLines}
};

// ============================================================
// 3. AUDIO KEY → NUMERIC ID
// ============================================================
export const AUDIO_KEY_TO_NUMERIC: Record<string, string> = {
${audioKeyToNumericLines}
};

// ============================================================
// 4. NUMERIC ID → AUDIO KEY (reverse)
// ============================================================
export const NUMERIC_TO_AUDIO_KEY: Record<string, string> = {
${numericToAudioKeyLines}
};

// ============================================================
// 5. HELPER FUNCTIONS
// ============================================================

/**
 * Get numeric ID from exercise ID
 */
export function getNumericId(exerciseId: string): string | null {
  return EXERCISE_TO_NUMERIC[exerciseId] || null;
}

/**
 * Get audio key from exercise ID
 */
export function getAudioKey(exerciseId: string): string | null {
  return EXERCISE_TO_AUDIO[exerciseId] || null;
}

/**
 * Get audio key from numeric ID
 */
export function getAudioKeyFromNumeric(numericId: string): string | null {
  return NUMERIC_TO_AUDIO_KEY[numericId] || null;
}

/**
 * Get audio URL
 */
export function getAudioUrl(
  exerciseId: string,
  language: 'hy' | 'en' | 'ru' = 'hy',
  voice: 'male' | 'female' = 'female'
): string | null {
  const numericId = getNumericId(exerciseId);
  if (!numericId) return null;

  const folderMap: Record<string, Record<string, string>> = {
    hy: { male: 'hy_Ani', female: 'hy_Ani' },
    en: { male: 'en_female', female: 'en_female' },
    ru: { male: 'ru_female', female: 'ru_female' },
  };

  const folder = folderMap[language]?.[voice];
  if (!folder) return null;

  return \`/audio/offline/\${folder}/\${numericId}.mp3\`;
}

/**
 * Check if exercise has offline audio
 */
export function hasOfflineAudio(exerciseId: string): boolean {
  return !!EXERCISE_TO_NUMERIC[exerciseId];
}

/**
 * Get all audio data for an exercise
 */
export function getAudioData(exerciseId: string): {
  audioKey: string | null;
  numericId: string | null;
  url: string | null;
} {
  const audioKey = getAudioKey(exerciseId);
  const numericId = getNumericId(exerciseId);
  const url = numericId ? getAudioUrl(exerciseId) : null;
  
  return { audioKey, numericId, url };
}

/**
 * Get statistics
 */
export function getAudioStats() {
  return {
    totalExercises: Object.keys(EXERCISE_TO_AUDIO).length,
    exercisesWithNumeric: Object.keys(EXERCISE_TO_NUMERIC).length,
    uniqueAudioKeys: Object.keys(AUDIO_KEY_TO_NUMERIC).length,
    uniqueNumericIds: Object.keys(NUMERIC_TO_AUDIO_KEY).length,
    coverage: \`\${Math.round((Object.keys(EXERCISE_TO_NUMERIC).length / Object.keys(EXERCISE_TO_AUDIO).length) * 100)}%\`,
  };
}

/**
 * Search audio
 */
export function searchAudio(query: string): Array<{
  exerciseId: string;
  audioKey: string;
  numericId: string | null;
  url: string | null;
}> {
  const results: Array<{
    exerciseId: string;
    audioKey: string;
    numericId: string | null;
    url: string | null;
  }> = [];

  const queryLower = query.toLowerCase();

  for (const [exerciseId, audioKey] of Object.entries(EXERCISE_TO_AUDIO)) {
    const numericId = EXERCISE_TO_NUMERIC[exerciseId] || null;
    
    if (
      exerciseId.toLowerCase().includes(queryLower) ||
      audioKey.toLowerCase().includes(queryLower) ||
      (numericId && numericId.includes(query))
    ) {
      results.push({
        exerciseId,
        audioKey,
        numericId,
        url: numericId ? getAudioUrl(exerciseId) : null,
      });
    }
  }

  return results;
}
`;
}

// ============================================================
// 6. MAIN
// ============================================================
function main() {
  console.log('🔍 Generating audio mapping...\n');
  
  // 1. Parse EXERCISE_TO_AUDIO
  const exerciseToAudio = parseExerciseToAudio();
  if (Object.keys(exerciseToAudio).length === 0) {
    console.error('❌ No EXERCISE_TO_AUDIO found');
    process.exit(1);
  }
  
  // 2. Load numeric mappings
  const numericMappings = loadNumericMappings();
  
  // 3. Load manifests
  const manifests = loadManifests();
  
  // 4. Create numeric mapping
  const { exerciseToNumeric, audioKeyToNumeric, numericToAudioKey } = 
    createNumericMapping(exerciseToAudio, numericMappings, manifests);
  
  console.log(`\n📊 Created mappings:`);
  console.log(`   EXERCISE_TO_NUMERIC: ${Object.keys(exerciseToNumeric).length}`);
  console.log(`   AUDIO_KEY_TO_NUMERIC: ${Object.keys(audioKeyToNumeric).length}`);
  console.log(`   NUMERIC_TO_AUDIO_KEY: ${Object.keys(numericToAudioKey).length}`);
  console.log(`   Coverage: ${Math.round((Object.keys(exerciseToNumeric).length / Object.keys(exerciseToAudio).length) * 100)}%`);
  
  // 5. Generate new file
  const newContent = generateNewFile(
    exerciseToAudio,
    exerciseToNumeric,
    audioKeyToNumeric,
    numericToAudioKey
  );
  
  // 6. Write file
  const outputPath = path.join(__dirname, '../src/lib/content/audio-mapping.ts');
  fs.writeFileSync(outputPath, newContent, 'utf-8');
  
  console.log(`\n✅ File written: ${outputPath}`);
  console.log('\n🎉 Done!');
}

// Run
main();