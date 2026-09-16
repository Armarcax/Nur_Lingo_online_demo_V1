// scripts/generate-full-audio-mapping.ts
// Run: npx ts-node scripts/generate-full-audio-mapping.ts

import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// CONFIGURATION
// ============================================================

const INPUT_FILE = 'src/lib/content/audio-mapping.ts';
const OUTPUT_FILE = 'src/lib/content/audio-mapping.ts';

// ============================================================
// READ EXISTING MAPPINGS
// ============================================================

function readExistingMappings(): Record<string, string> {
  const filePath = path.join(process.cwd(), INPUT_FILE);
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ No existing audio-mapping.ts found, starting fresh');
    return {};
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract EXERCISE_TO_AUDIO object using regex
    const match = content.match(/export const EXERCISE_TO_AUDIO: Record<string, string> = \{([\s\S]*?)\};/);
    
    if (!match) {
      console.log('⚠️ Could not find EXERCISE_TO_AUDIO in file, starting fresh');
      return {};
    }

    const objStr = match[1];
    const lines = objStr.split('\n');
    const mappings: Record<string, string> = {};

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === '') continue;
      
      const match2 = trimmed.match(/^"([^"]+)":\s*"([^"]+)",?$/);
      if (match2) {
        const key = match2[1];
        const value = match2[2];
        mappings[key] = value;
      }
    }

    console.log(`✅ Read ${Object.keys(mappings).length} existing mappings`);
    return mappings;
  } catch (error) {
    console.error('❌ Failed to read existing mappings:', error);
    return {};
  }
}

// ============================================================
// GENERATE NEW MAPPINGS (ONLY IF NOT EXISTS)
// ============================================================

function generateNewMappings(existing: Record<string, string>): Record<string, string> {
  const newMappings: Record<string, string> = {};
  let nextId = 1;
  let added = 0;

  // Find the highest existing numeric ID
  let maxId = 0;
  for (const [key, value] of Object.entries(existing)) {
    const num = parseInt(value);
    if (!isNaN(num) && num > maxId) {
      maxId = num;
    }
  }
  
  nextId = maxId + 1;
  console.log(`📊 Starting from ID: ${String(nextId).padStart(6, '0')}`);

  // ============================================================
  // 1. GREET MAPPINGS (only if not exists)
  // ============================================================
  const greetKeys = [
    'greet_hello', 'greet_hi', 'greet_morning', 'greet_day',
    'greet_evening', 'greet_night', 'greet_bye', 'greet_seeyou',
    'greet_welcome', 'greet_pleasure', 'greet_meet', 'greet_name',
    'greet_friend', 'greet_mr', 'greet_mrs', 'greet_thanks',
    'greet_please', 'greet_sorry', 'greet_yes', 'greet_no',
    'greet_how', 'greet_good', 'greet_fine', 'greet_bad',
    'greet_okay'
  ];

  const greetNums: Record<string, string> = {
    'greet_hello': '000001',
    'greet_hi': '000002',
    'greet_morning': '000003',
    'greet_day': '000004',
    'greet_evening': '000005',
    'greet_night': '000006',
    'greet_bye': '000007',
    'greet_seeyou': '000008',
    'greet_welcome': '000009',
    'greet_pleasure': '000010',
    'greet_meet': '000011',
    'greet_name': '000012',
    'greet_friend': '000013',
    'greet_mr': '000014',
    'greet_mrs': '000015',
    'greet_thanks': '000016',
    'greet_please': '000017',
    'greet_sorry': '000018',
    'greet_yes': '000019',
    'greet_no': '000020',
    'greet_how': '000021',
    'greet_good': '000022',
    'greet_fine': '000023',
    'greet_bad': '000024',
    'greet_okay': '000025',
  };

  for (const key of greetKeys) {
    if (!existing[key]) {
      newMappings[key] = greetNums[key] || '000001';
      added++;
    }
  }

  // ============================================================
  // 2. EXERCISE MAPPINGS (w*_l*_e*)
  // ============================================================
  for (let world = 1; world <= 10; world++) {
    for (let lesson = 1; lesson <= 10; lesson++) {
      for (let exercise = 0; exercise < 17; exercise++) {
        const key = `w${world}_l${lesson}_e${exercise}`;
        if (!existing[key] && !newMappings[key]) {
          const num = String(nextId).padStart(6, '0');
          newMappings[key] = num;
          nextId++;
          added++;
        }
      }
    }
  }

  // ============================================================
  // 3. MC/TR MAPPINGS (w*_l*_mc_*, w*_l*_tr_*)
  // ============================================================
  for (let world = 1; world <= 10; world++) {
    for (let lesson = 1; lesson <= 10; lesson++) {
      for (let i = 0; i < 16; i++) {
        const key = `w${world}_l${lesson}_mc_${i}`;
        if (!existing[key] && !newMappings[key]) {
          const num = String(nextId).padStart(6, '0');
          newMappings[key] = num;
          nextId++;
          added++;
        }
      }
      for (let i = 0; i < 16; i++) {
        const key = `w${world}_l${lesson}_tr_${i}`;
        if (!existing[key] && !newMappings[key]) {
          const num = String(nextId).padStart(6, '0');
          newMappings[key] = num;
          nextId++;
          added++;
        }
      }
    }
  }

  // ============================================================
  // 4. VOCABULARY MAPPINGS
  // ============================================================
  const vocabKeys = [
    'num_1', 'num_2', 'num_3', 'num_4', 'num_5',
    'num_6', 'num_7', 'num_8', 'num_9', 'num_10',
    'age_twenty', 'age_thirty', 'age_forty', 'age_fifty',
    'age_sixty', 'age_seventy', 'age_eighty', 'age_ninety',
    'age_hundred', 'age_year', 'age_years_old', 'age_birthday',
    'age_young', 'age_old', 'age_small',
    'fam_mother', 'fam_father', 'fam_sister', 'fam_brother',
    'fam_son', 'fam_daughter', 'fam_grandma', 'fam_grandpa',
    'fam_uncle_p', 'fam_uncle_m', 'fam_aunt_p', 'fam_aunt_m',
    'fam_cousin_m', 'fam_cousin_f', 'fam_husband', 'fam_wife',
    'fam_child', 'fam_children', 'fam_family', 'fam_relative',
    'fam_younger', 'fam_older', 'fam_only', 'fam_twin', 'fam_married',
    'fr_friend_m', 'fr_friend_f', 'fr_best', 'fr_close',
    'fr_old', 'fr_new', 'fr_meet', 'fr_call',
    'fr_write', 'fr_communicate', 'fr_talk', 'fr_play',
    'fr_walk', 'fr_laugh', 'fr_have_fun', 'fr_trust',
    'fr_support', 'fr_kind', 'fr_loyal', 'fr_interesting',
    'fr_funny', 'fr_calm', 'fr_noisy', 'fr_friendship', 'fr_meeting',
    'oc_doctor', 'oc_teacher', 'oc_engineer', 'oc_programmer',
    'oc_journalist', 'oc_lawyer', 'oc_artist', 'oc_musician',
    'oc_cook', 'oc_waiter', 'oc_driver', 'oc_police',
    'oc_soldier', 'oc_secretary', 'oc_manager', 'oc_director',
    'oc_scientist', 'oc_nurse', 'oc_architect', 'oc_photographer',
    'oc_work', 'oc_profession', 'oc_job', 'oc_work_verb', 'oc_office'
  ];

  for (const key of vocabKeys) {
    if (!existing[key] && !newMappings[key]) {
      const num = String(nextId).padStart(6, '0');
      newMappings[key] = num;
      nextId++;
      added++;
    }
  }

  console.log(`✅ Generated ${added} new mappings (next ID: ${String(nextId).padStart(6, '0')})`);
  return newMappings;
}

// ============================================================
// MERGE AND WRITE
// ============================================================

function writeAudioMapping(): void {
  const existing = readExistingMappings();
  const newMappings = generateNewMappings(existing);
  
  // Merge: existing + new
  const allMappings: Record<string, string> = { ...existing, ...newMappings };
  
  // Sort keys
  const sortedKeys = Object.keys(allMappings).sort((a, b) => {
    // Custom sort: greet_* first, then w*_l*_e*, then w*_l*_mc_*, then w*_l*_tr_*
    const getPriority = (key: string): number => {
      if (key.startsWith('greet_')) return 0;
      if (key.match(/^w\d+_l\d+_e\d+$/)) return 1;
      if (key.includes('_mc_')) return 2;
      if (key.includes('_tr_')) return 3;
      return 4;
    };
    const pA = getPriority(a);
    const pB = getPriority(b);
    if (pA !== pB) return pA - pB;
    return a.localeCompare(b);
  });
  
  const sortedMappings: Record<string, string> = {};
  for (const key of sortedKeys) {
    sortedMappings[key] = allMappings[key];
  }

  // Generate file content
  const content = `// src/lib/content/audio-mapping.ts
// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Generated: ${new Date().toISOString()}
// Total entries: ${Object.keys(sortedMappings).length}

export const EXERCISE_TO_AUDIO: Record<string, string> = {
${Object.entries(sortedMappings).map(([key, value]) => `  "${key}": "${value}",`).join('\n')}
};

// Reverse mapping for numeric IDs
export const NUM_TO_EXERCISE: Record<string, string> = {};
for (const [key, value] of Object.entries(EXERCISE_TO_AUDIO)) {
  NUM_TO_EXERCISE[value] = key;
}

// Helper to check if an exercise has audio
export function hasAudio(exerciseId: string): boolean {
  return !!EXERCISE_TO_AUDIO[exerciseId];
}

// Helper to get audio path
export function getAudioPath(
  exerciseId: string,
  language: 'hy' | 'en' | 'ru',
  gender: 'male' | 'female' = 'female'
): string | null {
  const audioId = EXERCISE_TO_AUDIO[exerciseId];
  if (!audioId) return null;
  
  const basePaths: Record<string, string> = {
    hy: '/audio/offline/hy_Ani/',
    en: '/audio/offline/en_female/',
    ru: '/audio/offline/ru_female/',
  };
  
  const basePath = basePaths[language] || basePaths.hy;
  return \`\${basePath}\${audioId}.mp3\`;
}

// Stats
export const STATS = {
  totalEntries: ${Object.keys(sortedMappings).length},
  generatedAt: '${new Date().toISOString()}',
};
`;

  const outputPath = path.join(process.cwd(), OUTPUT_FILE);
  fs.writeFileSync(outputPath, content);
  console.log(`✅ Written to: ${outputPath}`);
  console.log(`📊 Total entries: ${Object.keys(sortedMappings).length}`);
}

// ============================================================
// RUN
// ============================================================

writeAudioMapping();