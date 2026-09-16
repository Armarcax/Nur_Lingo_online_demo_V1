// scripts/generate-all-lesson-mappings.ts
// Run: npx ts-node scripts/generate-all-lesson-mappings.ts

import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// CONFIGURATION
// ============================================================

const OUTPUT_FILE = 'src/lib/content/audio-mapping.ts';

// ============================================================
// GENERATE MAPPINGS FOR ALL LESSONS
// ============================================================

interface LessonRange {
  world: number;
  lesson: number;
  startId: number;
  mcCount: number;
  trCount: number;
}

function generateLessonMappings(world: number, lesson: number, startId: number): Record<string, string> {
  const mappings: Record<string, string> = {};
  let counter = startId;
  
  // MC mappings (0-16)
  for (let i = 0; i < 17; i++) {
    mappings[`w${world}_l${lesson}_mc_${i}`] = String(counter).padStart(6, '0');
    counter++;
  }
  
  // TR mappings (0-16)
  for (let i = 0; i < 17; i++) {
    mappings[`w${world}_l${lesson}_tr_${i}`] = String(counter).padStart(6, '0');
    counter++;
  }
  
  // E mappings (0-16) - if needed
  for (let i = 0; i < 17; i++) {
    mappings[`w${world}_l${lesson}_e${i}`] = String(counter).padStart(6, '0');
    counter++;
  }
  
  return mappings;
}

// ============================================================
// GENERATE ALL MAPPINGS
// ============================================================

function generateAllMappings(): Record<string, string> {
  const allMappings: Record<string, string> = {};
  let counter = 1;
  
  // ============================================================
  // 1. GREET MAPPINGS (000001 - 000025)
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

  for (const key of greetKeys) {
    allMappings[key] = String(counter).padStart(6, '0');
    counter++;
  }

  // ============================================================
  // 2. WORLD 1: LESSONS 1-10 (w1_l1 to w1_l10)
  // ============================================================
  // w1_l1: mc_0-16, tr_0-16, e0-16
  // Start from 000026
  
  for (let lesson = 1; lesson <= 10; lesson++) {
    const mappings = generateLessonMappings(1, lesson, counter);
    Object.assign(allMappings, mappings);
    // Each lesson has: 17 mc + 17 tr + 17 e = 51 entries
    counter += 51;
  }

  // ============================================================
  // 3. WORLD 2: LESSONS 1-10 (w2_l1 to w2_l10)
  // ============================================================
  for (let lesson = 1; lesson <= 10; lesson++) {
    const mappings = generateLessonMappings(2, lesson, counter);
    Object.assign(allMappings, mappings);
    counter += 51;
  }

  // ============================================================
  // 4. WORLD 3: LESSONS 1-10 (w3_l1 to w3_l10)
  // ============================================================
  for (let lesson = 1; lesson <= 10; lesson++) {
    const mappings = generateLessonMappings(3, lesson, counter);
    Object.assign(allMappings, mappings);
    counter += 51;
  }

  // ============================================================
  // 5. WORLD 4: LESSONS 1-10 (w4_l1 to w4_l10)
  // ============================================================
  for (let lesson = 1; lesson <= 10; lesson++) {
    const mappings = generateLessonMappings(4, lesson, counter);
    Object.assign(allMappings, mappings);
    counter += 51;
  }

  // ============================================================
  // 6. WORLD 5: LESSONS 1-10 (w5_l1 to w5_l10)
  // ============================================================
  for (let lesson = 1; lesson <= 10; lesson++) {
    const mappings = generateLessonMappings(5, lesson, counter);
    Object.assign(allMappings, mappings);
    counter += 51;
  }

  // ============================================================
  // 7. WORLD 6: LESSONS 1-10 (w6_l1 to w6_l10)
  // ============================================================
  for (let lesson = 1; lesson <= 10; lesson++) {
    const mappings = generateLessonMappings(6, lesson, counter);
    Object.assign(allMappings, mappings);
    counter += 51;
  }

  // ============================================================
  // 8. WORLD 7: LESSONS 1-10 (w7_l1 to w7_l10)
  // ============================================================
  for (let lesson = 1; lesson <= 10; lesson++) {
    const mappings = generateLessonMappings(7, lesson, counter);
    Object.assign(allMappings, mappings);
    counter += 51;
  }

  // ============================================================
  // 9. WORLD 8: LESSONS 1-10 (w8_l1 to w8_l10)
  // ============================================================
  for (let lesson = 1; lesson <= 10; lesson++) {
    const mappings = generateLessonMappings(8, lesson, counter);
    Object.assign(allMappings, mappings);
    counter += 51;
  }

  // ============================================================
  // 10. WORLD 9: LESSONS 1-10 (w9_l1 to w9_l10)
  // ============================================================
  for (let lesson = 1; lesson <= 10; lesson++) {
    const mappings = generateLessonMappings(9, lesson, counter);
    Object.assign(allMappings, mappings);
    counter += 51;
  }

  // ============================================================
  // 11. WORLD 10: LESSONS 1-10 (w10_l1 to w10_l10)
  // ============================================================
  for (let lesson = 1; lesson <= 10; lesson++) {
    const mappings = generateLessonMappings(10, lesson, counter);
    Object.assign(allMappings, mappings);
    counter += 51;
  }

  // ============================================================
  // 12. VOCABULARY MAPPINGS (numbers, family, friends, occupations)
  // ============================================================
  const vocabKeys = [
    // Numbers
    'num_1', 'num_2', 'num_3', 'num_4', 'num_5',
    'num_6', 'num_7', 'num_8', 'num_9', 'num_10',
    'age_twenty', 'age_thirty', 'age_forty', 'age_fifty',
    'age_sixty', 'age_seventy', 'age_eighty', 'age_ninety',
    'age_hundred', 'age_year', 'age_years_old', 'age_birthday',
    'age_young', 'age_old', 'age_small',
    // Family
    'fam_mother', 'fam_father', 'fam_sister', 'fam_brother',
    'fam_son', 'fam_daughter', 'fam_grandma', 'fam_grandpa',
    'fam_uncle_p', 'fam_uncle_m', 'fam_aunt_p', 'fam_aunt_m',
    'fam_cousin_m', 'fam_cousin_f', 'fam_husband', 'fam_wife',
    'fam_child', 'fam_children', 'fam_family', 'fam_relative',
    'fam_younger', 'fam_older', 'fam_only', 'fam_twin', 'fam_married',
    // Friends
    'fr_friend_m', 'fr_friend_f', 'fr_best', 'fr_close',
    'fr_old', 'fr_new', 'fr_meet', 'fr_call',
    'fr_write', 'fr_communicate', 'fr_talk', 'fr_play',
    'fr_walk', 'fr_laugh', 'fr_have_fun', 'fr_trust',
    'fr_support', 'fr_kind', 'fr_loyal', 'fr_interesting',
    'fr_funny', 'fr_calm', 'fr_noisy', 'fr_friendship', 'fr_meeting',
    // Occupations
    'oc_doctor', 'oc_teacher', 'oc_engineer', 'oc_programmer',
    'oc_journalist', 'oc_lawyer', 'oc_artist', 'oc_musician',
    'oc_cook', 'oc_waiter', 'oc_driver', 'oc_police',
    'oc_soldier', 'oc_secretary', 'oc_manager', 'oc_director',
    'oc_scientist', 'oc_nurse', 'oc_architect', 'oc_photographer',
    'oc_work', 'oc_profession', 'oc_job', 'oc_work_verb', 'oc_office'
  ];

  for (const key of vocabKeys) {
    allMappings[key] = String(counter).padStart(6, '0');
    counter++;
  }

  console.log(`✅ Generated ${Object.keys(allMappings).length} total mappings`);
  console.log(`📊 Next available ID: ${String(counter).padStart(6, '0')}`);
  
  return allMappings;
}

// ============================================================
// READ EXISTING MAPPINGS
// ============================================================

function readExistingMappings(): Record<string, string> {
  const filePath = path.join(process.cwd(), OUTPUT_FILE);
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ No existing audio-mapping.ts found, starting fresh');
    return {};
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
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
// MERGE AND WRITE
// ============================================================

function writeAudioMapping(): void {
  // Read existing mappings
  const existing = readExistingMappings();
  
  // Generate new mappings
  const newMappings = generateAllMappings();
  
  // Merge: existing + new (new ones take precedence)
  const allMappings: Record<string, string> = { ...existing, ...newMappings };
  
  // Sort keys
  const sortedKeys = Object.keys(allMappings).sort();
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

  // Write file
  const outputPath = path.join(process.cwd(), OUTPUT_FILE);
  fs.writeFileSync(outputPath, content);
  console.log(`✅ Written to: ${outputPath}`);
  console.log(`📊 Total entries: ${Object.keys(sortedMappings).length}`);
}

// ============================================================
// RUN
// ============================================================

writeAudioMapping();