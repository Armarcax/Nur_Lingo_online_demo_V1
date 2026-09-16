// scripts/extract-audio-vocab-names.ts
// Full version with auto-mapping for all audio files

import * as fs from 'fs';
import * as path from 'path';

const AUDIO_DIR = path.join(__dirname, '../public/audio/offline');
const OUTPUT_DIR = path.join(__dirname, '../src/lib/content');

// ============================================================
// TYPES
// ============================================================

interface AudioFile {
  filename: string;
  path: string;
  folder: string;
  baseName: string;
  language: string;
  gender: string;
  type: 'vocab' | 'phrase' | 'dialogue' | 'unknown';
  cleanId: string;
}

// ============================================================
// MAIN FUNCTION
// ============================================================

function extractAudioVocabNames() {
  console.log('📚 Extracting all audio vocabulary names...\n');
  
  if (!fs.existsSync(AUDIO_DIR)) {
    console.error(`❌ Audio directory not found: ${AUDIO_DIR}`);
    return;
  }
  
  const folders = fs.readdirSync(AUDIO_DIR).filter(f => {
    const fullPath = path.join(AUDIO_DIR, f);
    return fs.statSync(fullPath).isDirectory();
  });
  
  console.log(`📁 Found ${folders.length} folders: ${folders.join(', ')}\n`);
  
  const allFiles: AudioFile[] = [];
  const allIds = new Set<string>();
  const idMap: Record<string, { hy: string[]; en: string[]; ru: string[] }> = {};
  
  // Mapping: exerciseId → audioId
  const exerciseToAudio: Record<string, string> = {};
  const audioToExercise: Record<string, string> = {};
  
  for (const folder of folders) {
    const folderPath = path.join(AUDIO_DIR, folder);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp3') || f.endsWith('.wav') || f.endsWith('.m4a'));
    
    let language = 'unknown';
    let gender = 'unknown';
    
    if (folder.includes('hy')) {
      language = 'hy';
      gender = folder.includes('Areg') ? 'male' : 'female';
    } else if (folder.includes('en')) {
      language = 'en';
      gender = folder.includes('male') ? 'male' : 'female';
    } else if (folder.includes('ru')) {
      language = 'ru';
      gender = folder.includes('male') ? 'male' : 'female';
    }
    
    for (const file of files) {
      let baseName = file.replace(/\.(mp3|wav|m4a)$/, '');
      
      // Clean up suffixes
      baseName = baseName.replace(/_hy$|_en$|_ru$|_male$|_female$|_m$|_f$/, '');
      baseName = baseName.replace(/_+/g, '_');
      
      let type: 'vocab' | 'phrase' | 'dialogue' | 'unknown' = 'unknown';
      let cleanId = baseName;
      
      // Detect type
      if (baseName.startsWith('ph_')) {
        type = 'phrase';
      } else if (baseName.startsWith('w') && baseName.includes('_d') && baseName.includes('_t')) {
        type = 'dialogue';
      } else if (baseName.startsWith('w') && baseName.includes('_l') && baseName.includes('_p')) {
        type = 'phrase';
      } else if (baseName.startsWith('w') && baseName.includes('_l')) {
        type = 'dialogue';
      } else if (baseName.startsWith('greet_') || baseName.startsWith('g_') || baseName.startsWith('i_')) {
        type = 'vocab';
      } else {
        type = 'vocab'; // Default to vocab
      }
      
      allIds.add(cleanId);
      
      if (!idMap[cleanId]) {
        idMap[cleanId] = { hy: [], en: [], ru: [] };
      }
      
      if (language === 'hy') idMap[cleanId].hy.push(file);
      if (language === 'en') idMap[cleanId].en.push(file);
      if (language === 'ru') idMap[cleanId].ru.push(file);
      
      // Auto-generate exercise mapping
      let exerciseId = cleanId;
      
      // For phrases: ph_w1l1_1 → w1_l1_phrase_1
      if (type === 'phrase') {
        const parts = cleanId.split('_');
        if (parts.length >= 3) {
          const worldLesson = `${parts[1]}_${parts[2]}`;
          const num = parts[3] || '0';
          exerciseId = `${worldLesson}_phrase_${num}`;
        }
      }
      
      // For dialogues: w1_l10_d479_t1 → w1_l10_dialog_479
      if (type === 'dialogue') {
        const parts = cleanId.split('_');
        if (parts.length >= 4) {
          const worldLesson = `${parts[0]}_${parts[1]}`;
          const dialogNum = parts[2].replace('d', '');
          exerciseId = `${worldLesson}_dialog_${dialogNum}`;
        }
      }
      
      // For vocab: greet_hello → w1_l1_vocab_hello
      if (type === 'vocab') {
        // Try to find lesson from vocab ID
        const lessonMap: Record<string, string> = {};
        // Populate from all W IDs
        const wMatches = cleanId.match(/w\d+_l\d+/);
        if (wMatches) {
          const worldLesson = wMatches[0];
          exerciseId = `${worldLesson}_vocab_${cleanId}`;
        } else {
          // Default mapping for known vocab
          const knownVocab: Record<string, string> = {
            'greet_hello': 'w1_l1_vocab_hello',
            'greet_hi': 'w1_l1_vocab_hi',
            'greet_morning': 'w1_l1_vocab_morning',
            'greet_day': 'w1_l1_vocab_day',
            'greet_evening': 'w1_l1_vocab_evening',
            'greet_night': 'w1_l1_vocab_night',
            'greet_bye': 'w1_l1_vocab_bye',
            'greet_seeyou': 'w1_l1_vocab_seeyou',
            'greet_welcome': 'w1_l1_vocab_welcome',
            'greet_pleasure': 'w1_l1_vocab_pleasure',
            'greet_meet': 'w1_l1_vocab_meet',
            'greet_name': 'w1_l1_vocab_name',
            'greet_friend': 'w1_l1_vocab_friend',
            'greet_mr': 'w1_l1_vocab_mr',
            'greet_mrs': 'w1_l1_vocab_mrs',
            'greet_thanks': 'w1_l1_vocab_thanks',
            'greet_please': 'w1_l1_vocab_please',
            'greet_sorry': 'w1_l1_vocab_sorry',
            'greet_yes': 'w1_l1_vocab_yes',
            'greet_no': 'w1_l1_vocab_no',
            'greet_how': 'w1_l1_vocab_how',
            'greet_good': 'w1_l1_vocab_good',
            'greet_fine': 'w1_l1_vocab_fine',
            'greet_bad': 'w1_l1_vocab_bad',
            'greet_okay': 'w1_l1_vocab_okay',
          };
          if (knownVocab[cleanId]) {
            exerciseId = knownVocab[cleanId];
          }
        }
      }
      
      // Store mapping
      exerciseToAudio[exerciseId] = cleanId;
      audioToExercise[cleanId] = exerciseId;
      
      allFiles.push({
        filename: file,
        path: `${folder}/${file}`,
        folder,
        baseName: file,
        language,
        gender,
        type,
        cleanId,
      });
    }
  }
  
  // ============================================================
  // GENERATE COMPLETE MAPPING FILE
  // ============================================================
  
  console.log('📊 STATISTICS:');
  console.log(`   Total audio files: ${allFiles.length}`);
  console.log(`   Unique audio IDs: ${allIds.size}`);
  console.log(`   Mapped exercises: ${Object.keys(exerciseToAudio).length}`);
  
  // Create folder mapping
  const folderMap: Record<string, string> = {
    'hy_Areg': 'hy_male',
    'hy_Ani': 'hy_female',
    'en_male': 'en_male',
    'en_female': 'en_female',
    'ru_male': 'ru_male',
    'ru_female': 'ru_female',
  };
  
  const mappingContent = `// Auto-generated from audio files
// Generated at: ${new Date().toISOString()}
// Total audio files: ${allFiles.length}
// Unique audio IDs: ${allIds.size}
// Mapped exercises: ${Object.keys(exerciseToAudio).length}

// ============================================================
// EXERCISE → AUDIO MAPPING
// ============================================================

export const EXERCISE_TO_AUDIO: Record<string, string> = {
${Object.entries(exerciseToAudio)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([exerciseId, audioId]) => `  '${exerciseId}': '${audioId}',`)
  .join('\n')}
};

// ============================================================
// AUDIO → EXERCISE MAPPING
// ============================================================

export const AUDIO_TO_EXERCISE: Record<string, string> = {
${Object.entries(audioToExercise)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([audioId, exerciseId]) => `  '${audioId}': '${exerciseId}',`)
  .join('\n')}
};

// ============================================================
// ALL AUDIO IDs BY TYPE
// ============================================================

export const ALL_AUDIO_IDS = [
${Array.from(allIds).sort().map(id => `  '${id}',`).join('\n')}
];

// ============================================================
// FOLDER MAPPING
// ============================================================

export const FOLDER_MAP: Record<string, { language: string; gender: string }> = {
${Object.entries(folderMap).map(([folder, mapping]) => 
  `  '${folder}': { language: '${mapping.split('_')[0]}', gender: '${mapping.split('_')[1]}' },`
).join('\n')}
};

// ============================================================
// HELPERS
// ============================================================

export function getAudioPath(
  exerciseId: string, 
  language: 'hy' | 'en' | 'ru', 
  gender: 'male' | 'female'
): string | null {
  const audioId = EXERCISE_TO_AUDIO[exerciseId];
  if (!audioId) return null;
  
  const folderMap: Record<string, Record<string, string>> = {
    hy: { male: 'hy_Areg', female: 'hy_Ani' },
    en: { male: 'en_male', female: 'en_female' },
    ru: { male: 'ru_male', female: 'ru_female' },
  };
  
  const folder = folderMap[language]?.[gender];
  if (!folder) return null;
  
  return \`/audio/offline/\${folder}/\${audioId}.mp3\`;
}

export function getAudioPathByAudioId(
  audioId: string,
  language: 'hy' | 'en' | 'ru',
  gender: 'male' | 'female'
): string | null {
  const folderMap: Record<string, Record<string, string>> = {
    hy: { male: 'hy_Areg', female: 'hy_Ani' },
    en: { male: 'en_male', female: 'en_female' },
    ru: { male: 'ru_male', female: 'ru_female' },
  };
  
  const folder = folderMap[language]?.[gender];
  if (!folder) return null;
  
  return \`/audio/offline/\${folder}/\${audioId}.mp3\`;
}

export async function hasAudioFile(
  audioId: string,
  language: 'hy' | 'en' | 'ru',
  gender: 'male' | 'female'
): Promise<boolean> {
  const path = getAudioPathByAudioId(audioId, language, gender);
  if (!path) return false;
  
  try {
    const res = await fetch(path, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

// Search audio by partial match
export function searchAudio(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  return ALL_AUDIO_IDS.filter(id => id.toLowerCase().includes(lowerQuery));
}
`;
  
  // Save mapping
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const mappingPath = path.join(OUTPUT_DIR, 'audio-mapping.ts');
  fs.writeFileSync(mappingPath, mappingContent, 'utf-8');
  console.log(`\n✅ Complete mapping saved to: ${mappingPath}`);
  
  // ============================================================
  // GENERATE INDEX
  // ============================================================
  
  const indexPath = path.join(OUTPUT_DIR, 'index.ts');
  const indexContent = `// Audio mapping export
export * from './audio-mapping';
export * from './vocab-audio-mapping';
`;
  
  fs.writeFileSync(indexPath, indexContent, 'utf-8');
  console.log(`✅ Index saved to: ${indexPath}`);
  
  // ============================================================
  // SAMPLE OUTPUT
  // ============================================================
  
  console.log('\n📝 SAMPLE MAPPINGS:');
  const samples = Object.entries(exerciseToAudio).slice(0, 10);
  for (const [exerciseId, audioId] of samples) {
    console.log(`   ${exerciseId} → ${audioId}`);
  }
  
  console.log('\n🎯 DONE!');
  console.log(`   Total audio IDs: ${allIds.size}`);
  console.log(`   Total mapped exercises: ${Object.keys(exerciseToAudio).length}`);
  console.log(`   Unmapped: ${allIds.size - Object.keys(exerciseToAudio).length}`);
}

// ============================================================
// RUN
// ============================================================

try {
  extractAudioVocabNames();
} catch (error) {
  console.error('❌ Error:', error);
}