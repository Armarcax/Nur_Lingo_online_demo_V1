// scripts/check-usei18n.ts
import fs from 'fs';
import path from 'path';

console.log('🔍 Checking useI18n usage in all files...\n');

// ─── CONFIG ────────────────────────────────────────────────────────────

const CONFIG = {
  scanDirs: ['src'],
  excludeDirs: ['node_modules', '.next', 'dist', 'build', '__tests__'],
  extensions: ['.tsx', '.ts', '.jsx', '.js'],
};

// ─── HELPERS ───────────────────────────────────────────────────────────

function getAllFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!CONFIG.excludeDirs.includes(entry.name)) {
        files.push(...getAllFiles(fullPath));
      }
    } else if (CONFIG.extensions.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

// ─── CHECK FUNCTIONS ──────────────────────────────────────────────────

function checkFile(filePath: string, content: string): string[] {
  const issues: string[] = [];
  const lines = content.split('\n');
  
  // 1. Ստուգել սխալ import-ները
  if (content.includes('@/lib/hooks/useI18n') || content.includes('@/lib/i18n/hooks/useI18n')) {
    issues.push('❌ WRONG IMPORT: uses @/lib/hooks/useI18n');
  }
  
  // 2. Ստուգել useI18n-ի ճիշտ օգտագործումը
  if (content.includes('useI18n')) {
    // Գտնել useI18n-ի օգտագործման տողերը
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Ստուգել, արդյոք useI18n-ը սխալ տեղում է (պարամետրերի մեջ)
      if (line.includes('const { t } = useI18n()') && i > 0) {
        const prevLine = lines[i - 1] || '';
        if (prevLine.includes('export function') || prevLine.includes('export const') || prevLine.includes('function')) {
          issues.push(`❌ WRONG POSITION: useI18n is in function parameters at line ${i + 1}`);
        }
      }
      
      // Ստուգել, արդյոք useI18n-ը import է արվել բայց t-ն չի դեստրուկտուրացվել
      if (line.includes('import { useI18n } from') && !line.includes('@/hooks/useI18n')) {
        issues.push(`❌ WRONG IMPORT PATH: ${line.trim()}`);
      }
      
      // Ստուգել, արդյոք useI18n-ը կա բայց t-ն բացակայում է
      if (line.includes('const useI18n = useI18n()')) {
        issues.push(`❌ WRONG DESTRUCTURING: should be "const { t } = useI18n()" at line ${i + 1}`);
      }
    }
  }
  
  // 3. Ստուգել, արդյոք t() օգտագործվում է առանց useI18n-ի
  if (content.includes('t(') && !content.includes('useI18n')) {
    const isClient = content.includes('"use client"') || content.includes("'use client'");
    if (isClient) {
      issues.push('⚠️ WARNING: t() is used but useI18n is not imported');
    }
  }
  
  return issues;
}

// ─── MAIN ─────────────────────────────────────────────────────────────

function main() {
  console.log('📂 Scanning directories:', CONFIG.scanDirs.join(', '));
  console.log('📄 Extensions:', CONFIG.extensions.join(', '));
  console.log('');
  
  const allFiles: string[] = [];
  for (const dir of CONFIG.scanDirs) {
    if (fs.existsSync(dir)) {
      const files = getAllFiles(dir);
      allFiles.push(...files);
      console.log(`   📁 ${dir}: ${files.length} files`);
    } else {
      console.log(`   ⚠️ ${dir}: not found`);
    }
  }
  
  console.log('');
  console.log(`📄 Total files: ${allFiles.length}`);
  console.log('');
  console.log('=' .repeat(70));
  console.log('🔍 CHECKING FILES');
  console.log('=' .repeat(70));
  console.log('');
  
  let totalIssues = 0;
  const results: { file: string; issues: string[] }[] = [];
  
  for (const file of allFiles) {
    const content = readFile(file);
    if (!content) continue;
    
    const issues = checkFile(file, content);
    if (issues.length > 0) {
      totalIssues += issues.length;
      results.push({ file, issues });
    }
  }
  
  // ─── PRINT RESULTS ──────────────────────────────────────────────────
  
  if (results.length === 0) {
    console.log('✅ No issues found! All useI18n imports are correct.');
    console.log('');
    process.exit(0);
  }
  
  console.log(`⚠️ Found ${totalIssues} issues in ${results.length} files:\n`);
  
  for (const result of results) {
    const relativePath = path.relative(process.cwd(), result.file);
    console.log(`📄 ${relativePath}`);
    for (const issue of result.issues) {
      console.log(`   ${issue}`);
    }
    console.log('');
  }
  
  console.log('=' .repeat(70));
  console.log('📈 SUMMARY');
  console.log('=' .repeat(70));
  console.log(`❌ Issues found: ${totalIssues}`);
  console.log(`📁 Files with issues: ${results.length}`);
  console.log('');
  
  if (totalIssues > 0) {
    console.log('💡 Fix: Replace "@/lib/hooks/useI18n" with "@/hooks/useI18n"');
    console.log('💡 Fix: Move "const { t } = useI18n()" inside function body');
    console.log('💡 Fix: Use "const { t } = useI18n()" instead of "const useI18n = useI18n()"');
    console.log('');
  }
}

main();