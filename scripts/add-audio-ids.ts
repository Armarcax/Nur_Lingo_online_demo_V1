// scripts/add-audio-ids.ts

import * as fs from 'fs';
import * as path from 'path';

const DICTIONARY_PATH = path.join(process.cwd(), 'data', 'dictionaries', 'lesson-dictionary.json');

// ============================================================
// LOGGER
// ============================================================

const LOG = {
  info: (msg: string) => console.log(`\x1b[36mℹ\x1b[0m ${msg}`),
  success: (msg: string) => console.log(`\x1b[32m✅\x1b[0m ${msg}`),
  warning: (msg: string) => console.log(`\x1b[33m⚠️\x1b[0m ${msg}`),
  error: (msg: string) => console.log(`\x1b[31m❌\x1b[0m ${msg}`),
  section: (msg: string) => console.log(`\n\x1b[1m━━━ ${msg} ━━━\x1b[0m\n`),
};

// ============================================================
// MAIN
// ============================================================

function addAudioIds() {
  LOG.section('🎵 Adding Audio IDs to Dictionary');
  
  // Load dictionary
  if (!fs.existsSync(DICTIONARY_PATH)) {
    LOG.error(`Dictionary not found: ${DICTIONARY_PATH}`);
    return;
  }

  const content = fs.readFileSync(DICTIONARY_PATH, 'utf-8');
  const dictionary = JSON.parse(content);
  
  let exerciseCount = 0;
  let vocabCount = 0;
  let skippedCount = 0;

  // Process each lesson
  for (const [lessonId, lesson] of Object.entries(dictionary.lessons)) {
    const lessonData = lesson as any;
    
    // Process exercises
    if (lessonData.exercises && Array.isArray(lessonData.exercises)) {
      for (const exercise of lessonData.exercises) {
        // Generate audioId if missing
        if (!exercise.audioId) {
          // Use exercise id as audioId
          exercise.audioId = exercise.id;
          exerciseCount++;
          LOG.info(`Added audioId to ${lessonId}/${exercise.id}: ${exercise.audioId}`);
        }
      }
    }

    // Process vocabulary
    if (lessonData.vocabulary && Array.isArray(lessonData.vocabulary)) {
      for (const vocab of lessonData.vocabulary) {
        // Generate audioId if missing
        if (!vocab.audioId) {
          // Use vocabulary id as audioId
          vocab.audioId = vocab.id;
          vocabCount++;
          LOG.info(`Added audioId to ${lessonId}/vocab/${vocab.id}: ${vocab.audioId}`);
        }
      }
    }
  }

  // Save updated dictionary
  dictionary.generatedAt = new Date().toISOString();
  fs.writeFileSync(DICTIONARY_PATH, JSON.stringify(dictionary, null, 2), 'utf-8');

  LOG.section('📊 Summary');
  LOG.success(`Added audioId to ${exerciseCount} exercises`);
  LOG.success(`Added audioId to ${vocabCount} vocabulary items`);
  LOG.info(`Total updated: ${exerciseCount + vocabCount} items`);
}

addAudioIds();