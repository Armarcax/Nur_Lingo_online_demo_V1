// scripts/check-audio-mapping.js
const fs = require('fs');
const path = require('path');

// Կարդալ audio-mapping.ts-ից
function getExerciseToAudio() {
  const filePath = path.join(__dirname, '../src/lib/content/audio-mapping.ts');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const exerciseToAudio = {};
  const regex = /export const EXERCISE_TO_AUDIO\s*:\s*Record<string,\s*string>\s*=\s*{([\s\S]*?)};/;
  const match = content.match(regex);
  
  if (!match) return exerciseToAudio;
  
  const block = match[1];
  const lineRegex = /['"](\w+)['"]\s*:\s*['"](\w+)['"]/g;
  let lineMatch;
  
  while ((lineMatch = lineRegex.exec(block)) !== null) {
    exerciseToAudio[lineMatch[1]] = lineMatch[2];
  }
  
  return exerciseToAudio;
}

// Կարդալ EXERCISE_TO_NUMERIC
function getExerciseToNumeric() {
  const filePath = path.join(__dirname, '../src/lib/content/audio-mapping.ts');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const exerciseToNumeric = {};
  const regex = /export const EXERCISE_TO_NUMERIC\s*:\s*Record<string,\s*string>\s*=\s*{([\s\S]*?)};/;
  const match = content.match(regex);
  
  if (!match) return exerciseToNumeric;
  
  const block = match[1];
  const lineRegex = /['"](\w+)['"]\s*:\s*['"](\w+)['"]/g;
  let lineMatch;
  
  while ((lineMatch = lineRegex.exec(block)) !== null) {
    exerciseToNumeric[lineMatch[1]] = lineMatch[2];
  }
  
  return exerciseToNumeric;
}

console.log('🔍 Checking audio mapping...\n');

const exerciseToAudio = getExerciseToAudio();
const exerciseToNumeric = getExerciseToNumeric();

console.log(`📊 EXERCISE_TO_AUDIO: ${Object.keys(exerciseToAudio).length} entries`);
console.log(`📊 EXERCISE_TO_NUMERIC: ${Object.keys(exerciseToNumeric).length} entries`);

// Ցույց տալ օրինակներ
console.log('\n📝 Examples:');
const examples = Object.entries(exerciseToNumeric).slice(0, 10);
for (const [exerciseId, numericId] of examples) {
  const audioKey = exerciseToAudio[exerciseId];
  console.log(`   ${exerciseId} → ${audioKey} → ${numericId}.mp3`);
}

// Ստուգել w1_l1-ը
console.log('\n🔍 Checking w1_l1 exercises:');
const w1l1Exercises = Object.keys(exerciseToAudio).filter(id => id.startsWith('w1_l1'));
for (const id of w1l1Exercises.slice(0, 10)) {
  const audioKey = exerciseToAudio[id];
  const numericId = exerciseToNumeric[id];
  if (numericId) {
    console.log(`   ✅ ${id} → ${audioKey} → ${numericId}.mp3`);
  } else {
    console.log(`   ❌ ${id} → ${audioKey} → NO NUMERIC ID`);
  }
}

console.log('\n✅ Done');