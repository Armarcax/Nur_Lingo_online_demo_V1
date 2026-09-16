// scripts/fix-exports.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Fixing exports in offline-audio-resolver.ts...\n');

const resolverPath = path.join(process.cwd(), 'src/lib/offline/offline-audio-resolver.ts');
let content = fs.readFileSync(resolverPath, 'utf-8');

let fixed = false;

// 1. Make sure registerExerciseAudio has export
if (content.includes('function registerExerciseAudio') && !content.includes('export function registerExerciseAudio')) {
  content = content.replace(
    /function registerExerciseAudio/g,
    'export function registerExerciseAudio'
  );
  console.log('✅ Added export to registerExerciseAudio');
  fixed = true;
}

// 2. Make sure registerExerciseToAudioMapping has export
if (content.includes('function registerExerciseToAudioMapping') && !content.includes('export function registerExerciseToAudioMapping')) {
  content = content.replace(
    /function registerExerciseToAudioMapping/g,
    'export function registerExerciseToAudioMapping'
  );
  console.log('✅ Added export to registerExerciseToAudioMapping');
  fixed = true;
}

// 3. Add to default export if missing
const defaultExportRegex = /export\s+default\s*{([^}]*)}/;
const defaultMatch = content.match(defaultExportRegex);
if (defaultMatch) {
  let defaultExports = defaultMatch[1];
  if (!defaultExports.includes('registerExerciseAudio')) {
    defaultExports = defaultExports.trim();
    if (defaultExports.endsWith(',')) {
      defaultExports += '\n  registerExerciseAudio,';
    } else if (defaultExports) {
      defaultExports += ',\n  registerExerciseAudio,';
    } else {
      defaultExports = '\n  registerExerciseAudio,\n';
    }
    content = content.replace(defaultExportRegex, `export default {${defaultExports}}`);
    console.log('✅ Added registerExerciseAudio to default export');
    fixed = true;
  }
}

if (fixed) {
  fs.writeFileSync(resolverPath, content);
  console.log('\n✅ File fixed!');
  console.log('📝 Restart your dev server to apply changes.');
} else {
  console.log('✅ No fixes needed. Everything looks correct!');
}