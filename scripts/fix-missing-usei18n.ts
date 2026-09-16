// scripts/fix-missing-usei18n.ts
import fs from 'fs';
import path from 'path';

// Ֆայլեր, որոնք պետք է ֆիքսել
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
  'src/components/ui/dialog.tsx',
  'src/components/ui/form.tsx',
  'src/components/ui/select.tsx',
  'src/components/ui/table.tsx',
  'src/components/ui/tabs.tsx',
  'src/components/ui/toast.tsx',
  'src/components/ui/tooltip.tsx',
];

function fixFile(filePath: string): boolean {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if file already has useI18n
    if (content.includes('useI18n')) {
      console.log(`✅ Already has useI18n: ${filePath}`);
      return false;
    }
    
    // Check if file uses t()
    if (!content.includes('t(')) {
      console.log(`ℹ️ No t() used: ${filePath}`);
      return false;
    }
    
    console.log(`🔧 Fixing: ${filePath}`);
    
    // Add "use client" if not exists
    if (!content.includes('"use client"') && !content.includes("'use client'")) {
      content = '"use client";\n\n' + content;
    }
    
    // Find the right place to add import
    const lines = content.split('\n');
    let insertIndex = 0;
    let hasImports = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].startsWith('import type')) {
        hasImports = true;
        insertIndex = i + 1;
      }
      if (lines[i].includes('export default') || lines[i].includes('export function') || lines[i].includes('export const')) {
        if (!hasImports) {
          insertIndex = i;
        }
        break;
      }
    }
    
    // Add import
    const importLine = 'import { useI18n } from "@/hooks/useI18n";';
    
    // Check if imports already exist
    let existingImports = '';
    for (let i = 0; i < insertIndex; i++) {
      existingImports += lines[i] + '\n';
    }
    
    if (!existingImports.includes('useI18n')) {
      lines.splice(insertIndex, 0, importLine);
    }
    
    // Find component function and add useI18n
    let componentFound = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if ((line.includes('export default function') || 
           line.includes('export function') || 
           line.includes('function')) && 
          !line.includes('useI18n')) {
        
        // Find the opening brace
        let braceIndex = i;
        let foundBrace = false;
        for (let j = i; j < lines.length; j++) {
          if (lines[j].includes('{')) {
            braceIndex = j;
            foundBrace = true;
            break;
          }
        }
        
        if (foundBrace) {
          // Add const { t } = useI18n(); after the opening brace
          const indent = lines[braceIndex].match(/^\s*/)?.[0] || '  ';
          const useI18nLine = indent + 'const { t } = useI18n();';
          
          // Check if already has it
          let hasT = false;
          for (let j = braceIndex; j < Math.min(braceIndex + 10, lines.length); j++) {
            if (lines[j].includes('const { t } =')) {
              hasT = true;
              break;
            }
          }
          
          if (!hasT) {
            lines.splice(braceIndex + 1, 0, useI18nLine);
            componentFound = true;
            break;
          }
        }
      }
    }
    
    // If no component found, try adding at top level
    if (!componentFound) {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('export default') && !lines[i].includes('useI18n')) {
          lines.splice(i, 0, 'const { t } = useI18n();');
          break;
        }
      }
    }
    
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    return true;
  } catch (error) {
    console.error(`❌ Failed to fix ${filePath}:`, error);
    return false;
  }
}

function main() {
  console.log('🔧 Fixing missing useI18n imports...\n');
  
  let fixed = 0;
  for (const file of FILES_TO_FIX) {
    if (fixFile(file)) {
      fixed++;
    }
  }
  
  console.log(`\n📊 Fixed ${fixed} files`);
}

main();