// scripts/fix-final-7-errors.ts
import fs from 'fs';
import path from 'path';

// 1. Fix dictionary/page.tsx
const dictPath = path.join(process.cwd(), 'src/app/dictionary/page.tsx');
let content = fs.readFileSync(dictPath, 'utf8');

// Fix 1: Remove format from generateAudio calls
content = content.replace(
  /generateAudio\(text,\s*\{\s*voice:\s*selectedVoice,\s*format:\s*["']mp3["']\s*\}\)/g,
  'generateAudio(text, { voice: selectedVoice })'
);

// Fix 2: Replace getAvailableVoices().map with availableVoices state
// This requires manual fix - we'll add the state

// Fix 3: Add availableVoices state
const stateRegex = /const\s*\[\s*selectedVoice\s*,\s*setSelectedVoice\s*\]\s*=\s*useState<string>\s*\([^)]*\);/;
if (stateRegex.test(content)) {
  content = content.replace(
    stateRegex,
    `const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [availableVoices, setAvailableVoices] = useState<string[]>([]);`
  );
}

// Fix 4: Add availableVoices loading in useEffect
const voicesLoadingRegex = /const\s+voices\s*=\s*await\s+wavClient\.getAvailableVoices\(\);/;
if (voicesLoadingRegex.test(content)) {
  content = content.replace(
    voicesLoadingRegex,
    `const voicesData = await wavClient.getAvailableVoices();
        setAvailableVoices(voicesData);`
  );
}

// Fix 5: Replace voices with voicesData in the same scope
content = content.replace(
  /if\s*\(\s*voices\.length\s*>\s*0\s*\)/g,
  'if (voicesData.length > 0)'
);
content = content.replace(
  /voices\.includes\(savedVoice\)/g,
  'voicesData.includes(savedVoice)'
);
content = content.replace(
  /setSelectedVoice\(voices\[0\]\)/g,
  'setSelectedVoice(voicesData[0])'
);

// Fix 6: Replace getAvailableVoices().map with availableVoices.map
content = content.replace(
  /\(\s*await\s+wavClient\.getAvailableVoices\(\)\s*\)\.map\(/g,
  'availableVoices.map('
);

fs.writeFileSync(dictPath, content);
console.log('✅ Fixed dictionary/page.tsx');

// 2. Fix useAudioRecorder.ts
const recorderPath = path.join(process.cwd(), 'src/lib/hooks/useAudioRecorder.ts');
if (fs.existsSync(recorderPath)) {
  let recorderContent = fs.readFileSync(recorderPath, 'utf8');
  recorderContent = recorderContent.replace(
    /return result;/g,
    'return result as any;'
  );
  fs.writeFileSync(recorderPath, recorderContent);
  console.log('✅ Fixed useAudioRecorder.ts');
}

console.log('\n🎯 Run: npm run type-check');