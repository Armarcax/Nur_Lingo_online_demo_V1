// scripts/fix-audio-metadata.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/content/audio-mapping.ts');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Գտնել AUDIO_METADATA-ն
  const regex = /export const AUDIO_METADATA:\s*Record<[^>]+>\s*=\s*{/;
  const match = content.match(regex);
  
  if (!match) {
    console.log('❌ AUDIO_METADATA not found');
    process.exit(1);
  }
  
  const startIndex = match.index + match[0].length;
  
  // Գտնել փակագծի ավարտը
  let braceCount = 0;
  let endIndex = startIndex;
  let found = false;
  
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        endIndex = i;
        found = true;
        break;
      }
    }
  }
  
  if (!found) {
    console.log('❌ Could not find end of AUDIO_METADATA');
    process.exit(1);
  }
  
  // Հատված
  const before = content.substring(0, match.index);
  const metadataContent = content.substring(startIndex, endIndex);
  const after = content.substring(endIndex);
  
  // Ավելացնել voice հատկություն, եթե բացակայում է
  const fixedMetadata = metadataContent.replace(
    /({\s*lessonId:\s*['"][^'"]+['"],\s*exerciseId:\s*['"][^'"]+['"],\s*language:\s*['"][^'"]+['"],\s*filename:\s*['"][^'"]+['"],\s*size:\s*\d+,\s*duration:\s*\d+\s*})/g,
    (match) => {
      if (!match.includes('voice:')) {
        return match.replace('{', '{ voice: \'male\', ');
      }
      return match;
    }
  );
  
  // Փոխարինել
  content = before + 'export const AUDIO_METADATA: Record<string, {\n  lessonId: string;\n  exerciseId: string;\n  language: string;\n  voice?: string;\n  filename: string;\n  duration?: number;\n  size?: number;\n}> = {' + fixedMetadata + after;
  
  // Պահպանել
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ AUDIO_METADATA fixed successfully!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
}