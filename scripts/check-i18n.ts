// scripts/check-i18n.ts
import fs from 'fs';
import path from 'path';

// ─── CONFIG ────────────────────────────────────────────────────────────

const CONFIG = {
  // ✅ Ֆայլեր, որոնք պետք է ստուգվեն
  include: [
    '**/*.tsx',
    '**/*.ts',
  ],
  // ❌ Ֆայլեր, որոնք պետք է բացառվեն
  exclude: [
    'node_modules',
    '.next',
    'dist',
    'build',
    '*.test.tsx',
    '*.spec.tsx',
    '__tests__',
  ],
  // ✅ I18n բանալիների աղբյուր
  translationsFile: 'src/lib/i18n/translations.json',
  // ❌ Սխալ import-ներ
  wrongImports: [
    "@/lib/hooks/useI18n",
    "@/lib/i18n/hooks/useI18n",
    "@/hooks/useI18n.js",
    "lib/hooks/useI18n",
  ],
  // ✅ Ճիշտ import
  correctImport: "@/hooks/useI18n",
  // ✅ Որոնելու պանակներ
  searchDirs: ['src', 'app', 'components', 'hooks', 'lib', 'pages'],
};

// ─── TYPES ────────────────────────────────────────────────────────────

interface I18nKey {
  key: string;
  file: string;
  line: number;
  column: number;
  fullMatch: string;
}

interface I18nIssue {
  type: 'wrong_import' | 'missing_translation' | 'hardcoded_text' | 'missing_useI18n' | 'undefined_t' | 'file_not_found';
  file: string;
  line: number;
  column: number;
  message: string;
  suggestion?: string;
  severity: 'error' | 'warning' | 'info';
}

interface CheckResult {
  issues: I18nIssue[];
  i18nKeys: I18nKey[];
  totalFiles: number;
  checkedFiles: number;
  startTime: number;
  endTime: number;
}

// ─── HELPERS ───────────────────────────────────────────────────────────

function findProjectRoot(): string {
  let current = process.cwd();
  while (current !== path.parse(current).root) {
    const packageJson = path.join(current, 'package.json');
    if (fs.existsSync(packageJson)) {
      return current;
    }
    current = path.dirname(current);
  }
  return process.cwd();
}

function getAllFiles(dir: string, exclude: string[]): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Check exclude patterns
      let shouldExclude = false;
      for (const ex of exclude) {
        if (fullPath.includes(ex)) {
          shouldExclude = true;
          break;
        }
      }
      if (shouldExclude) continue;
      
      if (entry.isDirectory()) {
        files.push(...getAllFiles(fullPath, exclude));
      } else if (
        entry.name.endsWith('.tsx') || 
        entry.name.endsWith('.ts') || 
        entry.name.endsWith('.jsx') || 
        entry.name.endsWith('.js')
      ) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Silent fail
  }
  
  return files;
}

function findFiles(): string[] {
  const root = findProjectRoot();
  const allFiles: string[] = [];
  const excludeDirs = CONFIG.exclude;
  
  // Search in all directories
  for (const dir of CONFIG.searchDirs) {
    const fullDir = path.join(root, dir);
    if (fs.existsSync(fullDir)) {
      console.log('🔍 Searching in: ' + fullDir);
      const files = getAllFiles(fullDir, excludeDirs);
      allFiles.push.apply(allFiles, files);
    }
  }
  
  // Also check root directory for any tsx/ts files
  const rootFiles = getAllFiles(root, excludeDirs);
  allFiles.push.apply(allFiles, rootFiles);
  
  // Remove duplicates
  const uniqueFiles: string[] = [];
  const seen = new Set<string>();
  for (const file of allFiles) {
    if (!seen.has(file)) {
      seen.add(file);
      uniqueFiles.push(file);
    }
  }
  
  return uniqueFiles;
}

function readFileContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    return '';
  }
}

function loadTranslations(): Record<string, Record<string, string>> {
  const root = findProjectRoot();
  const possiblePaths = [
    path.join(root, CONFIG.translationsFile),
    path.join(root, 'src', 'lib', 'i18n', 'translations.json'),
    path.join(root, 'lib', 'i18n', 'translations.json'),
    path.join(root, 'data', 'translations.json'),
  ];
  
  for (const p of possiblePaths) {
    try {
      console.log('📖 Trying to load translations from: ' + p);
      const content = fs.readFileSync(p, 'utf-8');
      return JSON.parse(content);
    } catch {
      // Try next path
    }
  }
  
  console.warn('⚠️ Cannot load translations file. Tried:', possiblePaths.join(', '));
  return { hy: {}, en: {}, ru: {} };
}

function getAllTranslationKeys(translations: Record<string, Record<string, string>>): Set<string> {
  const keys = new Set<string>();
  for (const lang of ['hy', 'en', 'ru']) {
    if (translations[lang]) {
      const langKeys = Object.keys(translations[lang]);
      for (const key of langKeys) {
        keys.add(key);
      }
    }
  }
  return keys;
}

function findI18nKeys(content: string, filePath: string): I18nKey[] {
  const keys: I18nKey[] = [];
  
  // ✅ Find t('key') or t("key") or t(`key`)
  const regex = /t\s*\(\s*['"`]([^'"`]+)['"`]\s*(?:,|\))/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    const before = content.substring(0, match.index);
    const line = before.split('\n').length;
    const column = match.index - before.lastIndexOf('\n');
    
    keys.push({
      key: key,
      file: filePath,
      line: line,
      column: column,
      fullMatch: match[0],
    });
  }
  
  return keys;
}

function detectIssues(content: string, filePath: string, translationKeys: Set<string>): I18nIssue[] {
  const issues: I18nIssue[] = [];
  
  // ─── 1. Ստուգել սխալ import-ները ──────────────────────────────────
  for (const wrongImport of CONFIG.wrongImports) {
    const escaped = wrongImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('import\\s+.*from\\s+[\'"]' + escaped + '[\'"]', 'g');
    let match;
    while ((match = regex.exec(content)) !== null) {
      const before = content.substring(0, match.index);
      const line = before.split('\n').length;
      const column = match.index - before.lastIndexOf('\n');
      
      issues.push({
        type: 'wrong_import',
        file: filePath,
        line: line,
        column: column,
        message: '❌ Wrong import: "' + match[0] + '"',
        suggestion: '✅ Use: import { useI18n } from "' + CONFIG.correctImport + '"',
        severity: 'error',
      });
    }
  }
  
  // ─── 2. Ստուգել useI18n-ի բացակայությունը ──────────────────────────
  const hasT = /t\s*\(/.test(content);
  const hasUseI18n = /useI18n/.test(content);
  const hasI18nImport = /import.*useI18n.*from/.test(content);
  
  if (hasT && !hasUseI18n && !hasI18nImport) {
    const isClient = /["']use client["']/.test(content);
    
    if (isClient) {
      const lines = content.split('\n');
      let line = 1;
      for (let i = 0; i < lines.length; i++) {
        if (/t\s*\(/.test(lines[i])) {
          line = i + 1;
          break;
        }
      }
      
      issues.push({
        type: 'missing_useI18n',
        file: filePath,
        line: line,
        column: 0,
        message: '❌ t() is used but useI18n is not imported',
        suggestion: '✅ Add: import { useI18n } from "' + CONFIG.correctImport + '"\n   const { t } = useI18n();',
        severity: 'error',
      });
    }
  }
  
  // ─── 3. Ստուգել undefined t ────────────────────────────────────────
  if (hasUseI18n && !/const\s*{\s*t\s*}\s*=\s*useI18n/.test(content) && !/const\s*t\s*=\s*useI18n/.test(content)) {
    const lines = content.split('\n');
    let line = 1;
    for (let i = 0; i < lines.length; i++) {
      if (/useI18n/.test(lines[i])) {
        line = i + 1;
        break;
      }
    }
    
    issues.push({
      type: 'undefined_t',
      file: filePath,
      line: line,
      column: 0,
      message: '⚠️ useI18n is imported but t is not destructured',
      suggestion: '✅ Use: const { t } = useI18n();',
      severity: 'warning',
    });
  }
  
  // ─── 4. Ստուգել բացակայող թարգմանությունները ──────────────────────
  const tRegex = /t\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    const key = match[1];
    
    // Բաց թողնել փոփոխականները
    if (key.includes('${') || key.includes('{') || key.includes('}')) continue;
    
    if (!translationKeys.has(key)) {
      const before = content.substring(0, match.index);
      const line = before.split('\n').length;
      const column = match.index - before.lastIndexOf('\n');
      
      issues.push({
        type: 'missing_translation',
        file: filePath,
        line: line,
        column: column,
        message: '⚠️ Translation key "' + key + '" not found in translations.json',
        suggestion: '✅ Add "' + key + '" to translations.json',
        severity: 'warning',
      });
    }
  }
  
  // ─── 5. Ստուգել hardcoded տեքստեր ──────────────────────────────────
  // ✅ Սա միայն warning է, քանի որ ոչ բոլոր տեքստերն են պետք i18n-ով
  const hardcodedRegex = /[>]\s*([Ա-Օա-ֆA-Za-z0-9\s\!\?\.,\-:;]+)\s*[<]/g;
  let hMatch;
  while ((hMatch = hardcodedRegex.exec(content)) !== null) {
    const text = hMatch[1].trim();
    
    // Բաց թողնել կարճ տեքստերը
    if (text.length < 3) continue;
    if (/^[0-9]+$/.test(text)) continue;
    if (/^[a-z-]+$/.test(text) && text.length < 10) continue;
    
    // Բաց թողնել CSS classes
    const cssPatterns = [
      'flex', 'grid', 'block', 'inline', 'hidden', 'w-', 'h-', 'p-', 'm-', 
      'text-', 'bg-', 'border-', 'rounded-', 'shadow-', 'gap-', 'space-',
      'items-', 'justify-', 'self-', 'content-', 'overflow', 'truncate',
      'whitespace', 'break', 'select', 'resize', 'appearance', 'cursor',
      'pointer', 'auto', 'relative', 'absolute', 'fixed', 'sticky', 'static',
      'inset-', 'top-', 'bottom-', 'left-', 'right-', 'z-', 'min-', 'max-',
      'object-', 'from-', 'via-', 'to-', 'backdrop-', 'shadow-', 'ring-',
      'container', 'mx-', 'my-', 'px-', 'py-', 'pt-', 'pb-', 'pl-', 'pr-'
    ];
    let isCss = false;
    for (const pattern of cssPatterns) {
      if (text.startsWith(pattern) || text.includes(' ' + pattern)) {
        isCss = true;
        break;
      }
    }
    if (isCss) continue;
    
    // Բաց թողնել URL-ները
    if (/^(https?:\/\/|www\.|\/|\.\.\/|\.\/)/i.test(text)) continue;
    
    // Բաց թողնել չափերը
    if (/^[0-9]+[%pxremvhvw]+$/.test(text)) continue;
    
    // Բաց թողնել Brand names
    const brandNames = ['NUR', 'Lingo', 'HAYQ', 'Nuri', 'Nurik', 'Nurlingo'];
    let isBrand = false;
    for (const name of brandNames) {
      if (text === name || text.startsWith(name + ' ') || text.endsWith(' ' + name)) {
        isBrand = true;
        break;
      }
    }
    if (isBrand) continue;
    
    // Ստուգել, արդյոք սա արդեն i18n է
    const before = content.substring(0, hMatch.index);
    if (/{\s*t\s*\(/.test(before.slice(-50))) continue;
    if (/t\s*\(/.test(before.slice(-50))) continue;
    
    // Ստուգել NuriSpeech
    if (/NuriSpeech/.test(before.slice(-100))) continue;
    
    // Ստուգել, արդյոք սա <img alt> է
    if (/alt\s*=\s*["']/.test(before.slice(-30))) continue;
    
    // Ստուգել, արդյոք սա placeholder է
    if (/placeholder\s*=\s*["']/.test(before.slice(-30))) continue;
    
    const line = before.split('\n').length;
    const column = hMatch.index - before.lastIndexOf('\n');
    
    // Generate suggestion key
    const suggestionKey = text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);
    
    issues.push({
      type: 'hardcoded_text',
      file: filePath,
      line: line,
      column: column,
      message: '💡 Possible hardcoded text: "' + text + '"',
      suggestion: '✅ Use: {t("page_' + suggestionKey + '")}',
      severity: 'info',
    });
  }
  
  return issues;
}

// ─── MAIN FUNCTION ────────────────────────────────────────────────────

function checkI18n(): CheckResult {
  console.log('🔍 Starting i18n check...\n');
  console.log('📂 Current directory: ' + process.cwd());
  console.log('📂 Root directory: ' + findProjectRoot() + '\n');
  
  const startTime = Date.now();
  const issues: I18nIssue[] = [];
  const allI18nKeys: I18nKey[] = [];
  
  // 1. Load translations
  const translations = loadTranslations();
  const translationKeys = getAllTranslationKeys(translations);
  console.log('📚 Loaded ' + translationKeys.size + ' translation keys\n');
  
  // 2. Find all files
  const allFiles = findFiles();
  console.log('\n📁 Found ' + allFiles.length + ' files to check\n');
  
  if (allFiles.length === 0) {
    console.log('⚠️ No files found! Please check the search directories.');
    console.log('   Search directories: ' + CONFIG.searchDirs.join(', '));
    
    // Try to list existing directories
    console.log('\n📂 Existing directories in root:');
    try {
      const root = findProjectRoot();
      const entries = fs.readdirSync(root, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          console.log('   📁 ' + entry.name);
        }
      }
    } catch {
      // Ignore
    }
    
    console.log('\n💡 Tip: Make sure you are in the project root directory.');
    console.log('   Current path: ' + process.cwd());
    
    return {
      issues: [],
      i18nKeys: [],
      totalFiles: 0,
      checkedFiles: 0,
      startTime: startTime,
      endTime: Date.now(),
    };
  }
  
  let checkedFiles = 0;
  
  // 3. Check each file
  for (const file of allFiles) {
    const content = readFileContent(file);
    if (!content) continue;
    
    checkedFiles++;
    
    // Find i18n keys
    const keys = findI18nKeys(content, file);
    allI18nKeys.push.apply(allI18nKeys, keys);
    
    // Detect issues
    const fileIssues = detectIssues(content, file, translationKeys);
    issues.push.apply(issues, fileIssues);
  }
  
  // 4. Print results
  console.log('=' .repeat(60));
  console.log('📊 I18N CHECK RESULTS');
  console.log('=' .repeat(60));
  console.log('\n📁 Files checked: ' + checkedFiles + '/' + allFiles.length);
  console.log('🔑 I18n keys found: ' + allI18nKeys.length);
  console.log('⚠️ Issues found: ' + issues.length + '\n');
  
  // Group issues by type
  const grouped: Record<string, I18nIssue[]> = {};
  for (const issue of issues) {
    if (!grouped[issue.type]) {
      grouped[issue.type] = [];
    }
    grouped[issue.type].push(issue);
  }
  
  // Print issues by type
  for (const type in grouped) {
    const typeIssues = grouped[type];
    const severity = typeIssues[0]?.severity || 'info';
    const emoji = severity === 'error' ? '❌' : severity === 'warning' ? '⚠️' : '💡';
    console.log(emoji + ' ' + type.toUpperCase() + ': ' + typeIssues.length + ' issues');
    
    // Limit to first 10 issues per type
    const displayIssues = typeIssues.slice(0, 10);
    for (const issue of displayIssues) {
      const relativePath = path.relative(process.cwd(), issue.file);
      console.log('   📄 ' + relativePath + ':' + issue.line);
      console.log('      ' + issue.message);
      if (issue.suggestion) {
        console.log('      💡 ' + issue.suggestion);
      }
    }
    if (typeIssues.length > 10) {
      console.log('   ... and ' + (typeIssues.length - 10) + ' more issues');
    }
    console.log('');
  }
  
  // Print summary
  let errors = 0;
  let warnings = 0;
  let infos = 0;
  for (const issue of issues) {
    if (issue.severity === 'error') errors++;
    else if (issue.severity === 'warning') warnings++;
    else infos++;
  }
  
  console.log('=' .repeat(60));
  console.log('📈 SUMMARY');
  console.log('=' .repeat(60));
  console.log('❌ Errors: ' + errors);
  console.log('⚠️ Warnings: ' + warnings);
  console.log('💡 Info: ' + infos);
  console.log('\n⏱️ Time: ' + ((Date.now() - startTime) / 1000) + 's');
  
  if (errors > 0) {
    console.log('\n❌ Found errors that need to be fixed!');
    process.exit(1);
  } else {
    console.log('\n✅ No errors found!');
    process.exit(0);
  }
  
  return {
    issues: issues,
    i18nKeys: allI18nKeys,
    totalFiles: allFiles.length,
    checkedFiles: checkedFiles,
    startTime: startTime,
    endTime: Date.now(),
  };
}

// ─── RUN ──────────────────────────────────────────────────────────────

// Check if running directly
if (require.main === module) {
  checkI18n();
}

export { checkI18n };