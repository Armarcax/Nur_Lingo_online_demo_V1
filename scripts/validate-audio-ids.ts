// scripts/validate-audio-ids.ts

import { CONTENT_LESSONS, validateAllAudioIds } from '../src/lib/content/database';
import { FIXED_AUDIO_IDS, validateAudioIds } from '../src/lib/content/audio-ids';

console.log('🔍 Validating Audio IDs...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 1. Validate FIXED_AUDIO_IDS uniqueness
const isValid = validateAudioIds();

// 2. Check all vocabulary items
const { missing, total } = validateAllAudioIds();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📊 Total vocabulary items: ${total}`);
console.log(`📊 Missing audio IDs: ${missing.length}`);

if (missing.length === 0) {
  console.log('✅ All vocabulary items have audio IDs!');
} else {
  console.log('❌ Missing audio IDs for:');
  for (const item of missing) {
    console.log(`   ⚠️ ${item}`);
  }
}