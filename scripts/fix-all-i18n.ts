// scripts/fix-all-i18n.ts
import fs from 'fs';
import path from 'path';

console.log('🚀 STARTING FULL I18N FIX...\n');

// ─── 1. FIX I18N PROVIDER ──────────────────────────────────────────

function fixI18nProvider() {
  const filePath = 'src/components/I18nProvider.tsx';
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // Remove wrong import
  if (content.includes('import { useI18n } from')) {
    content = content.replace(/import\s*{\s*useI18n\s*}\s*from\s*["'][^"']+["']\s*;\s*\n?/g, '');
    changed = true;
  }

  // Remove wrong destructuring
  if (content.includes('const { t } = useI18n()')) {
    content = content.replace(/const\s*{\s*t\s*}\s*=\s*useI18n\s*\(\s*\)\s*;\s*\n?/g, '');
    changed = true;
  }

  // Ensure correct structure
  if (!content.includes('const t = useCallback')) {
    // Add the correct t function if missing
    const importEnd = content.indexOf('export function I18nProvider');
    if (importEnd !== -1) {
      // Find the right place to insert
      const insertPoint = content.indexOf('const [isLoading, setIsLoading]');
      if (insertPoint !== -1) {
        const before = content.substring(0, insertPoint);
        const after = content.substring(insertPoint);
        content = before + `
  const t = useCallback((key: string, params?: Record<string, any>): string => {
    const dict = translations[locale] || translations.hy || {};
    let text = dict[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(new RegExp(\`{\${param}}\`, 'g'), String(value));
      });
    }
    
    return text;
  }, [locale]);
  
  ` + after;
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('✅ Fixed I18nProvider.tsx');
    return true;
  }
  console.log('ℹ️ I18nProvider.tsx already correct');
  return false;
}

// ─── 2. FIX USEI18N HOOK ──────────────────────────────────────────

function fixUseI18n() {
  const filePath = 'src/hooks/useI18n.ts';
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Ensure it has fallback
  if (!content.includes('if (!context)')) {
    const newContent = `"use client";

import { useContext } from 'react';
import { I18nContext } from '@/components/I18nProvider';

export function useI18n() {
  const context = useContext(I18nContext);
  
  if (!context) {
    console.warn('⚠️ useI18n used outside of I18nProvider, using fallback');
    return {
      t: (key: string) => key,
      locale: 'hy' as const,
      setLanguage: () => {},
      isLoading: false,
    };
  }
  
  return context;
}
`;
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log('✅ Fixed useI18n.ts');
    return true;
  }
  console.log('ℹ️ useI18n.ts already correct');
  return false;
}

// ─── 3. FIX WRONG IMPORTS ─────────────────────────────────────────

function fixWrongImports() {
  const files: string[] = [];
  const dirs = ['src/app', 'src/components', 'src/lib', 'src/hooks'];
  
  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      walkDir(dir, files);
    }
  }

  let fixed = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const wrongImports = [
      '@/lib/hooks/useI18n',
      '@/lib/i18n/hooks/useI18n',
      '@/hooks/useI18n.js',
      'lib/hooks/useI18n',
    ];
    
    let newContent = content;
    let changed = false;
    
    for (const wrong of wrongImports) {
      if (newContent.includes(wrong)) {
        newContent = newContent.replace(
          new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          '@/hooks/useI18n'
        );
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(file, newContent, 'utf-8');
      fixed++;
    }
  }
  
  if (fixed > 0) {
    console.log(`✅ Fixed ${fixed} wrong imports`);
  } else {
    console.log('ℹ️ No wrong imports found');
  }
  return fixed > 0;
}

// ─── 4. FIX UNDEFINED T ────────────────────────────────────────────

function fixUndefinedT() {
  const files: string[] = [];
  const dirs = ['src/app', 'src/components', 'src/lib', 'src/hooks'];
  
  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      walkDir(dir, files);
    }
  }

  let fixed = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Skip I18nProvider
    if (file.includes('I18nProvider.tsx')) continue;
    
    // Check if file has useI18n but wrong destructuring
    if (content.includes('useI18n') && content.includes('const useI18n = useI18n()')) {
      let newContent = content.replace(
        /const\s+useI18n\s*=\s*useI18n\s*\(\s*\)\s*;/g,
        'const { t } = useI18n();'
      );
      fs.writeFileSync(file, newContent, 'utf-8');
      fixed++;
    }
  }
  
  if (fixed > 0) {
    console.log(`✅ Fixed ${fixed} undefined t issues`);
  } else {
    console.log('ℹ️ No undefined t issues found');
  }
  return fixed > 0;
}

// ─── 5. ADD MISSING USEI18N ───────────────────────────────────────

function addMissingUseI18n() {
  const files: string[] = [];
  const dirs = ['src/app', 'src/components', 'src/lib', 'src/hooks'];
  
  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      walkDir(dir, files);
    }
  }

  let fixed = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Skip if already has useI18n or is I18nProvider
    if (file.includes('I18nProvider.tsx')) continue;
    if (content.includes('useI18n')) continue;
    if (!content.includes('t(')) continue;
    if (!content.includes('"use client"') && !content.includes("'use client'")) continue;
    
    // Check if it's a React component
    if (!content.includes('export default') && !content.includes('export function') && !content.includes('export const')) {
      continue;
    }
    
    let newContent = content;
    
    // Find where to add import
    const lines = content.split('\n');
    let importIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].startsWith('import type')) {
        importIndex = i + 1;
      }
      if (lines[i].includes('export default') || lines[i].includes('export function')) {
        break;
      }
    }
    
    // Add import
    const importLine = 'import { useI18n } from "@/hooks/useI18n";';
    lines.splice(importIndex, 0, importLine);
    
    // Add destructuring inside component
    for (let i = 0; i < lines.length; i++) {
      if ((lines[i].includes('export default function') || lines[i].includes('export function')) && !lines[i].includes('useI18n')) {
        // Find opening brace
        for (let j = i; j < lines.length; j++) {
          if (lines[j].includes('{') && !lines[j].includes('=>')) {
            const indent = lines[j].match(/^\s*/)?.[0] || '  ';
            lines.splice(j + 1, 0, `${indent}const { t } = useI18n();`);
            break;
          }
        }
        break;
      }
    }
    
    newContent = lines.join('\n');
    fs.writeFileSync(file, newContent, 'utf-8');
    fixed++;
  }
  
  if (fixed > 0) {
    console.log(`✅ Added useI18n to ${fixed} files`);
  } else {
    console.log('ℹ️ No files need useI18n');
  }
  return fixed > 0;
}

// ─── HELPERS ─────────────────────────────────────────────────────────

function walkDir(dir: string, files: string[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.next', 'dist', 'build'].includes(entry.name)) {
        walkDir(fullPath, files);
      }
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
}

// ─── CLEAN CACHE ────────────────────────────────────────────────────

function cleanCache() {
  const dirs = ['.next', 'node_modules/.cache', '.turbo'];
  let cleaned = 0;
  
  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        cleaned++;
        console.log(`🧹 Cleaned ${dir}`);
      } catch {
        // Ignore
      }
    }
  }
  
  if (cleaned === 0) {
    console.log('ℹ️ No cache to clean');
  }
  return cleaned > 0;
}

// ─── MAIN ────────────────────────────────────────────────────────────

function main() {
  console.log('=' .repeat(60));
  console.log('🔧 FIXING ALL I18N ISSUES');
  console.log('=' .repeat(60));
  console.log('');

  let totalFixed = 0;

  if (fixI18nProvider()) totalFixed++;
  if (fixUseI18n()) totalFixed++;
  if (fixWrongImports()) totalFixed++;
  if (fixUndefinedT()) totalFixed++;
  if (addMissingUseI18n()) totalFixed++;

  console.log('');
  console.log('=' .repeat(60));
  console.log('🧹 CLEANING CACHE');
  console.log('=' .repeat(60));
  cleanCache();

  console.log('');
  console.log('=' .repeat(60));
  console.log('✅ DONE!');
  console.log('=' .repeat(60));
  console.log(`📊 Fixed ${totalFixed} issue categories`);
  console.log('');
  console.log('🚀 Run: npm run dev');
  console.log('');
}

main();