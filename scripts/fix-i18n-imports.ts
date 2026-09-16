// scripts/fix-i18n-imports.ts
import fs from 'fs';
import path from 'path';

const WRONG_IMPORT = '@/lib/hooks/useI18n';
const CORRECT_IMPORT = '@/hooks/useI18n';

function fixFile(filePath: string): boolean {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if file contains wrong import
    if (!content.includes(WRONG_IMPORT)) {
      return false;
    }
    
    console.log(`🔧 Fixing: ${filePath}`);
    
    // Replace wrong import with correct one
    content = content.replace(
      new RegExp(WRONG_IMPORT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      CORRECT_IMPORT
    );
    
    // Also fix if there's no "use client" but file uses hooks
    if (!content.includes('"use client"') && !content.includes("'use client'")) {
      // Check if file is a component (has export)
      if (content.includes('export default') || content.includes('export function') || content.includes('export const')) {
        content = '"use client";\n\n' + content;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`❌ Failed to fix ${filePath}:`, error);
    return false;
  }
}

function findFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.next', 'dist', 'build'].includes(entry.name)) {
          files.push(...findFiles(fullPath));
        }
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`⚠️ Cannot read directory: ${dir}`);
  }
  
  return files;
}

function main() {
  console.log('🔧 Fixing i18n imports...\n');
  console.log('📍 Current directory:', process.cwd());
  console.log('📍 Wrong import:', WRONG_IMPORT);
  console.log('📍 Correct import:', CORRECT_IMPORT);
  console.log('');
  
  // Check if src directory exists
  const srcDir = path.join(process.cwd(), 'src');
  if (!fs.existsSync(srcDir)) {
    console.log('⚠️ src directory not found!');
    console.log('   Make sure you are in the project root.');
    return;
  }
  
  const files = findFiles('src');
  console.log(`📁 Found ${files.length} files to check\n`);
  
  let fixed = 0;
  
  for (const file of files) {
    if (fixFile(file)) {
      fixed++;
    }
  }
  
  console.log(`\n📊 Fixed ${fixed} files`);
  
  if (fixed === 0) {
    console.log('✅ No files need fixing!');
  } else {
    console.log('⚠️ Please run check again to verify: npm run check:i18n');
  }
}

// Run
main();