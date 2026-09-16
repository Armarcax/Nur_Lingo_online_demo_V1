// scripts/update-audio-mapping.ts
// Run with: npx tsx scripts/update-audio-mapping.ts

import * as fs from 'fs';
import * as path from 'path';

const MAPPING_FILE = path.join(__dirname, '../src/lib/content/audio-mapping.ts');

// ============================================================
// GENERATE ALL MISSING MAPPINGS
// ============================================================

function generateMissingMappings(): Record<string, string> {
  const mappings: Record<string, string> = {};

  // ============================================================
  // 1. W1_L1 VOCABULARY MAPPINGS (greet_*)
  // ============================================================
  const w1_l1_vocab: Record<string, string> = {
    'w1_l1_e0': 'greet_hello',
    'w1_l1_e1': 'greet_hi',
    'w1_l1_e2': 'greet_morning',
    'w1_l1_e3': 'greet_day',
    'w1_l1_e4': 'greet_evening',
    'w1_l1_e5': 'greet_night',
    'w1_l1_e6': 'greet_bye',
    'w1_l1_e7': 'greet_seeyou',
    'w1_l1_e8': 'greet_welcome',
    'w1_l1_e9': 'greet_pleasure',
    'w1_l1_e10': 'greet_meet',
    'w1_l1_e11': 'greet_name',
    'w1_l1_e12': 'greet_friend',
    'w1_l1_e13': 'greet_mr',
    'w1_l1_e14': 'greet_mrs',
    'w1_l1_e15': 'greet_thanks',
    'w1_l1_e16': 'greet_please',
    'w1_l1_e17': 'greet_sorry',
    'w1_l1_e18': 'greet_yes',
    'w1_l1_e19': 'greet_no',
    'w1_l1_e20': 'greet_how',
    'w1_l1_e21': 'greet_good',
    'w1_l1_e22': 'greet_fine',
    'w1_l1_e23': 'greet_bad',
    'w1_l1_e24': 'greet_okay',
  };
  Object.assign(mappings, w1_l1_vocab);

  // ============================================================
  // 2. W1_L2 → I_* MAPPINGS
  // ============================================================
  const i_mappings: Record<string, string> = {
    'w1_l2_e0': 'i_be',
    'w1_l2_e1': 'i_boy',
    'w1_l2_e2': 'i_call',
    'w1_l2_e3': 'i_child',
    'w1_l2_e4': 'i_girl',
    'w1_l2_e5': 'i_he',
    'w1_l2_e6': 'i_her',
    'w1_l2_e7': 'i_his',
    'w1_l2_e8': 'i_i',
    'w1_l2_e9': 'i_introduce',
    'w1_l2_e10': 'i_man',
    'w1_l2_e11': 'i_my',
    'w1_l2_e12': 'i_name',
    'w1_l2_e13': 'i_person',
    'w1_l2_e14': 'i_she',
    'w1_l2_e15': 'i_student',
    'w1_l2_e16': 'i_surname',
    'w1_l2_e17': 'i_teacher',
    'w1_l2_e18': 'i_that',
    'w1_l2_e19': 'i_they',
    'w1_l2_e20': 'i_this',
    'w1_l2_e21': 'i_we',
    'w1_l2_e22': 'i_woman',
    'w1_l2_e23': 'i_you',
    'w1_l2_e24': 'i_your',
  };
  Object.assign(mappings, i_mappings);

  // ============================================================
  // 3. W1_L3 → G_* MAPPINGS
  // ============================================================
  const g_mappings: Record<string, string> = {
    'w1_l3_e0': 'g_again',
    'w1_l3_e1': 'g_boss',
    'w1_l3_e2': 'g_colleague',
    'w1_l3_e3': 'g_elder',
    'w1_l3_e4': 'g_formal',
    'w1_l3_e5': 'g_god_be',
    'w1_l3_e6': 'g_guest',
    'w1_l3_e7': 'g_handshake',
    'w1_l3_e8': 'g_have_good',
    'w1_l3_e9': 'g_host',
    'w1_l3_e10': 'g_how_are',
    'w1_l3_e11': 'g_hug',
    'w1_l3_e12': 'g_informal',
    'w1_l3_e13': 'g_kiss',
    'w1_l3_e14': 'g_long_time',
    'w1_l3_e15': 'g_neighbor',
    'w1_l3_e16': 'g_polite',
    'w1_l3_e17': 'g_respect',
    'w1_l3_e18': 'g_rude',
    'w1_l3_e19': 'g_smile',
    'w1_l3_e20': 'g_stranger',
    'w1_l3_e21': 'g_take_care',
    'w1_l3_e22': 'g_wave',
    'w1_l3_e23': 'g_what_news',
    'w1_l3_e24': 'g_young',
  };
  Object.assign(mappings, g_mappings);

  // ============================================================
  // 4. W1_L4 → PHRASE MAPPINGS (ph_w1l1_*)
  // ============================================================
  const phrase_mappings: Record<string, string> = {
    'w1_l4_e0': 'ph_w1l1_1',
    'w1_l4_e1': 'ph_w1l1_2',
    'w1_l4_e2': 'ph_w1l1_3',
    'w1_l4_e3': 'ph_w1l1_4',
    'w1_l4_e4': 'ph_w1l1_5',
    'w1_l4_e5': 'ph_w1l1_6',
    'w1_l4_e6': 'ph_w1l1_7',
    'w1_l4_e7': 'ph_w1l1_8',
    'w1_l4_e8': 'ph_w1l1_9',
    'w1_l4_e9': 'ph_w1l1_10',
    'w1_l4_e10': 'ph_w1l1_11',
    'w1_l4_e11': 'ph_w1l1_12',
    'w1_l4_e12': 'ph_w1l2_1',
    'w1_l4_e13': 'ph_w1l2_2',
    'w1_l4_e14': 'ph_w1l2_3',
    'w1_l4_e15': 'ph_w1l2_4',
    'w1_l4_e16': 'ph_w1l2_5',
    'w1_l4_e17': 'ph_w1l2_6',
    'w1_l4_e18': 'ph_w1l2_7',
    'w1_l4_e19': 'ph_w1l2_8',
    'w1_l4_e20': 'ph_w1l2_9',
    'w1_l4_e21': 'ph_w1l2_10',
    'w1_l4_e22': 'ph_w1l2_11',
    'w1_l4_e23': 'ph_w1l2_12',
    'w1_l4_e24': 'ph_w1l3_1',
  };
  Object.assign(mappings, phrase_mappings);

  // ============================================================
  // 5. W1_L5 → MORE PHRASE MAPPINGS
  // ============================================================
  const phrase_mappings_2: Record<string, string> = {
    'w1_l5_e0': 'ph_w1l3_2',
    'w1_l5_e1': 'ph_w1l3_3',
    'w1_l5_e2': 'ph_w1l3_4',
    'w1_l5_e3': 'ph_w1l3_5',
    'w1_l5_e4': 'ph_w1l3_6',
    'w1_l5_e5': 'ph_w1l3_7',
    'w1_l5_e6': 'ph_w1l3_8',
    'w1_l5_e7': 'ph_w1l3_9',
    'w1_l5_e8': 'ph_w1l3_10',
    'w1_l5_e9': 'ph_w1l3_11',
    'w1_l5_e10': 'ph_w1l3_12',
  };
  Object.assign(mappings, phrase_mappings_2);

  // ============================================================
  // 6. W1_L6 → w1_l6_* MAPPINGS (self)
  // ============================================================
  for (let e = 0; e < 25; e++) {
    mappings[`w1_l6_e${e}`] = `w1_l6_e${e}`;
  }

  // ============================================================
  // 7. W1_L7 → w1_l7_* MAPPINGS (self)
  // ============================================================
  for (let e = 0; e < 25; e++) {
    mappings[`w1_l7_e${e}`] = `w1_l7_e${e}`;
  }

  // ============================================================
  // 8. W1_L8 → w1_l8_* MAPPINGS (self)
  // ============================================================
  for (let e = 0; e < 25; e++) {
    mappings[`w1_l8_e${e}`] = `w1_l8_e${e}`;
  }

  // ============================================================
  // 9. W1_L9 → w1_l9_* MAPPINGS (self)
  // ============================================================
  for (let e = 0; e < 25; e++) {
    mappings[`w1_l9_e${e}`] = `w1_l9_e${e}`;
  }

  // ============================================================
  // 10. W1_L10 → w1_l10_* MAPPINGS (self)
  // ============================================================
  for (let e = 0; e < 25; e++) {
    mappings[`w1_l10_e${e}`] = `w1_l10_e${e}`;
  }

  // ============================================================
  // 11. W2 - W10 → SELF MAPPINGS
  // ============================================================
  for (let w = 2; w <= 10; w++) {
    for (let l = 1; l <= 10; l++) {
      const lessonId = `w${w}_l${l}`;
      for (let e = 0; e < 25; e++) {
        const exerciseId = `${lessonId}_e${e}`;
        if (!mappings[exerciseId]) {
          mappings[exerciseId] = exerciseId;
        }
      }
    }
  }

  return mappings;
}

// ============================================================
// UPDATE FILE
// ============================================================

function updateAudioMapping() {
  console.log('📚 Updating audio-mapping.ts...');

  if (!fs.existsSync(MAPPING_FILE)) {
    console.error(`❌ File not found: ${MAPPING_FILE}`);
    return;
  }

  let content = fs.readFileSync(MAPPING_FILE, 'utf-8');

  // Generate all missing mappings
  const newMappings = generateMissingMappings();
  console.log(`📝 Generated ${Object.keys(newMappings).length} total mappings`);

  // Find the EXERCISE_TO_AUDIO object
  const exerciseRegex = /export const EXERCISE_TO_AUDIO:\s*Record<string,\s*string>\s*=\s*{([\s\S]*?)};/;
  const match = content.match(exerciseRegex);

  if (!match) {
    console.error('❌ Could not find EXERCISE_TO_AUDIO in file');
    return;
  }

  const existingContent = match[1];
  const toAdd: Record<string, string> = {};
  let existingMappings = 0;

  // Check each new mapping
  for (const [key, value] of Object.entries(newMappings)) {
    const keyPattern = new RegExp(`['"]${key}['"]\\s*:\\s*['"]${value}['"]`);
    if (!keyPattern.test(existingContent)) {
      toAdd[key] = value;
    } else {
      existingMappings++;
    }
  }

  console.log(`   Existing mappings: ${existingMappings}`);
  console.log(`   New mappings to add: ${Object.keys(toAdd).length}`);

  if (Object.keys(toAdd).length === 0) {
    console.log('✅ All mappings already exist!');
    return;
  }

  // Build the new entries string
  const newEntries = Object.entries(toAdd)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `  '${key}': '${value}',`)
    .join('\n');

  // Find the EXERCISE_TO_AUDIO object
  const objectStart = content.indexOf('export const EXERCISE_TO_AUDIO: Record<string, string> = {');
  if (objectStart === -1) {
    console.error('❌ Could not find insertion point');
    return;
  }

  // Find the opening and closing braces
  const openBrace = content.indexOf('{', objectStart);
  let closeBrace = openBrace;
  let depth = 0;
  
  for (let i = openBrace; i < content.length; i++) {
    if (content[i] === '{') depth++;
    if (content[i] === '}') {
      depth--;
      if (depth === 0) {
        closeBrace = i;
        break;
      }
    }
  }

  if (openBrace === -1 || closeBrace === -1) {
    console.error('❌ Could not find object boundaries');
    return;
  }

  // Insert new mappings after the opening brace
  const before = content.substring(0, openBrace + 1);
  const after = content.substring(openBrace + 1);

  // Create the new content
  const newContent = before + '\n' + newEntries + '\n' + after;

  // Backup original
  const backupPath = MAPPING_FILE + '.backup';
  fs.writeFileSync(backupPath, content, 'utf-8');
  console.log(`💾 Backup saved: ${backupPath}`);

  // Write new content
  fs.writeFileSync(MAPPING_FILE, newContent, 'utf-8');
  console.log(`✅ File updated: ${MAPPING_FILE}`);
  console.log(`📊 Added ${Object.keys(toAdd).length} new mappings`);

  // Also update AUDIO_TO_EXERCISE if needed
  const audioToExerciseRegex = /export const AUDIO_TO_EXERCISE:\s*Record<string,\s*string>\s*=\s*{([\s\S]*?)};/;
  const audioMatch = content.match(audioToExerciseRegex);

  if (audioMatch) {
    const audioContent = audioMatch[1];
    const audioToAdd: Record<string, string> = {};

    for (const [key, value] of Object.entries(toAdd)) {
      const keyPattern = new RegExp(`['"]${value}['"]\\s*:\\s*['"]${key}['"]`);
      if (!keyPattern.test(audioContent)) {
        audioToAdd[value] = key;
      }
    }

    if (Object.keys(audioToAdd).length > 0) {
      const audioEntries = Object.entries(audioToAdd)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, value]) => `  '${key}': '${value}',`)
        .join('\n');

      const audioInsert = content.indexOf('export const AUDIO_TO_EXERCISE: Record<string, string> = {');
      if (audioInsert !== -1) {
        const aStart = content.indexOf('{', audioInsert);
        const aEnd = content.indexOf('}', aStart);
        if (aStart !== -1 && aEnd !== -1) {
          const aBefore = content.substring(0, aStart + 1);
          const aAfter = content.substring(aStart + 1);
          let finalContent = aBefore + '\n' + audioEntries + '\n' + aAfter;

          fs.writeFileSync(MAPPING_FILE, finalContent, 'utf-8');
          console.log(`✅ AUDIO_TO_EXERCISE also updated with ${Object.keys(audioToAdd).length} mappings`);
        }
      }
    }
  }

  // ============================================================
  // VERIFICATION
  // ============================================================

  console.log('\n📊 VERIFICATION:');
  const updatedContent = fs.readFileSync(MAPPING_FILE, 'utf-8');
  
  const lessons = ['w1_l1', 'w1_l2', 'w1_l3', 'w1_l4', 'w1_l5', 'w1_l6'];
  for (const lesson of lessons) {
    const count = (updatedContent.match(new RegExp(`['"]${lesson}_e\\d+['"]`, 'g')) || []).length;
    console.log(`   ${lesson}: ${count} mappings`);
  }

  const totalMappings = (updatedContent.match(/['"]w\d+_l\d+_e\d+['"]/g) || []).length;
  console.log(`   Total exercise mappings: ${totalMappings}`);

  console.log('\n🎯 DONE!');
  console.log('   Now run: npm run dev');
}

// ============================================================
// RUN
// ============================================================

try {
  updateAudioMapping();
} catch (error) {
  console.error('❌ Error:', error);
}