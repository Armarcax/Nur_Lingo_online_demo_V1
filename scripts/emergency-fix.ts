// scripts/emergency-fix.ts
import fs from 'fs';
import path from 'path';

// ✅ Ֆայլեր, որոնք պետք է վերականգնել
const FILES_TO_FIX = [
  'src/components/I18nProvider.tsx',
  'src/components/NuriFloating.tsx',
  'src/components/NuriProvider.tsx',
  'src/components/NuriRain.tsx',
  'src/components/OfflineAudioPlayer.tsx',
  'src/components/PageLayout.tsx',
  'src/components/ServiceWorkerRegister.tsx',
  'src/components/theme-provider.tsx',
  'src/components/ThemeBackground.tsx',
  'src/components/ui/carousel.tsx',
  'src/components/ui/form.tsx',
];

function restoreFile(filePath: string): boolean {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf-8');
    let changed = false;

    // ❌ Remove wrong import: import { useI18n } from "@/hooks/useI18n"
    if (content.includes('import { useI18n } from "@/hooks/useI18n"')) {
      // Remove the import line
      content = content.replace(/import\s*{\s*useI18n\s*}\s*from\s*["']@\/hooks\/useI18n["']\s*;\s*\n?/g, '');
      changed = true;
      console.log(`🧹 Removed useI18n import from: ${filePath}`);
    }

    // ❌ Remove wrong destructuring: const { t } = useI18n();
    if (content.includes('const { t } = useI18n()')) {
      content = content.replace(/const\s*{\s*t\s*}\s*=\s*useI18n\s*\(\s*\)\s*;\s*\n?/g, '');
      changed = true;
      console.log(`🧹 Removed useI18n destructuring from: ${filePath}`);
    }

    // ❌ Remove duplicate "use client" if exists
    const useClientMatches = content.match(/["']use client["']/g);
    if (useClientMatches && useClientMatches.length > 1) {
      // Keep only the first one
      const firstUseClient = useClientMatches[0];
      content = content.replace(new RegExp(firstUseClient.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), (match, offset) => {
        if (offset === content.indexOf(firstUseClient)) {
          return match;
        }
        return '';
      });
      // Clean up extra newlines
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
      changed = true;
      console.log(`🧹 Removed duplicate "use client" from: ${filePath}`);
    }

    if (changed) {
      fs.writeFileSync(fullPath, content, 'utf-8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Failed to fix ${filePath}:`, error);
    return false;
  }
}

function main() {
  console.log('🚑 Emergency fix - restoring files...\n');
  console.log('📍 Current directory:', process.cwd());
  console.log('');

  let fixed = 0;
  for (const file of FILES_TO_FIX) {
    if (restoreFile(file)) {
      fixed++;
    }
  }

  console.log(`\n📊 Fixed ${fixed} files`);
  
  if (fixed > 0) {
    console.log('\n⚠️ Please run: npm run dev to test');
    console.log('⚠️ If the project still doesn\'t work, run: git checkout .');
  } else {
    console.log('\n✅ No fixes needed');
  }
}

main();