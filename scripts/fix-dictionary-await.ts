// scripts/fix-dictionary-await.ts
import fs from 'fs';
import path from 'path';

const dictPath = path.join(process.cwd(), 'src/app/dictionary/page.tsx');
let content = fs.readFileSync(dictPath, 'utf8');

// Ուղղել getVoicesForLanguage - ավելացնել await
content = content.replace(
  /wavClient\.getVoicesForLanguage\(lang\)/g,
  'await wavClient.getVoicesForLanguage(lang)'
);

// Ուղղել getDefaultVoiceForLanguage - ավելացնել await
content = content.replace(
  /wavClient\.getDefaultVoiceForLanguage\(lang\)/g,
  'await wavClient.getDefaultVoiceForLanguage(lang)'
);

// Ուղղել getAvailableVoices().map
content = content.replace(
  /wavClient\.getAvailableVoices\(\)\.map\(/g,
  '(await wavClient.getAvailableVoices()).map('
);

// Remove duplicate import
content = content.replace(
  /import WAV_VOICES from "@\/lib\/audio\/WavClient";\s*$/m,
  ''
);

// Add correct import
content = content.replace(
  /import \{ getWavClient, WavClient \} from "@\/lib\/audio\/WavClient";/,
  'import { getWavClient, WavClient } from "@/lib/audio/WavClient";\nimport WAV_VOICES from "@/lib/audio/WavClient";'
);

fs.writeFileSync(dictPath, content);
console.log('✅ Dictionary page fixed!');