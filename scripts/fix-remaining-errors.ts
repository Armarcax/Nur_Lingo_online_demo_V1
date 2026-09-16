// scripts/fix-remaining-errors.ts
import fs from 'fs';

const fixes = [
  {
    file: 'src/components/PageLayout.tsx',
    search: /const\s*{\s*t\s*}\s*=\s*useI18n\s*\(\s*\)\s*;/g,
    replace: 'const { t } = useI18n();',
  },
  {
    file: 'src/components/theme-provider.tsx',
    search: /const\s*{\s*t\s*}\s*=\s*useI18n\s*\(\s*\)\s*;/g,
    replace: 'const { t } = useI18n();',
  },
  {
    file: 'src/lib/offline/OfflineAudioEngine.ts',
    search: /import\s*{\s*useI18n\s*}\s*from\s*["']@\/hooks\/useI18n["']\s*;/g,
    replace: '',
  },
  {
    file: 'src/lib/offline/TrilingualAudioPlayer.tsx',
    search: /const\s*{\s*t\s*}\s*=\s*useI18n\s*\(\s*\)\s*;/g,
    replace: 'const { t } = useI18n();',
  },
];

for (const fix of fixes) {
  try {
    let content = fs.readFileSync(fix.file, 'utf-8');
    content = content.replace(fix.search, fix.replace);
    fs.writeFileSync(fix.file, content, 'utf-8');
    console.log(`✅ Fixed: ${fix.file}`);
  } catch (error) {
    console.log(`⚠️ Could not fix: ${fix.file}`);
  }
}