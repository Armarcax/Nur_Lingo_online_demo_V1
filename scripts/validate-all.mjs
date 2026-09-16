// scripts/validate-all.mjs

import { 
  CONTENT_LESSONS, 
  validateAllAudioIds, 
  validateContentLessons 
} from '../src/lib/content/database.js';
import { validateAudioIds } from '../src/lib/content/audio-ids.js';

console.log('🔍 ===== VALIDATING ALL =====');

// 1. Audio IDs
console.log('\n📀 Audio IDs:');
validateAudioIds();

// 2. Content Lessons
console.log('\n📚 Content Lessons:');
validateContentLessons();

// 3. Check each lesson has required fields
console.log('\n📖 Detailed check:');
let errors = 0;

for (const lesson of CONTENT_LESSONS) {
  const hasVocab = lesson.vocabulary && lesson.vocabulary.length > 0;
  const hasPhrases = lesson.phrases && lesson.phrases.length > 0;
  const hasDialogues = lesson.dialogues && lesson.dialogues.length > 0;
  
  if (!hasVocab || !hasPhrases || !hasDialogues) {
    errors++;
    console.log(`❌ ${lesson.id}: vocab=${hasVocab}, phrases=${hasPhrases}, dialogues=${hasDialogues}`);
  }
}

if (errors === 0) {
  console.log('✅ All lessons have vocabulary, phrases, and dialogues!');
} else {
  console.log(`❌ ${errors} lessons have missing data`);
}

console.log('\n✅ ===== VALIDATION COMPLETE =====');