// scripts/scan-all-bugs.ts
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔍🔍🔍 STARTING FULL PROJECT SCAN 🔍🔍🔍\n');

// ─── CONFIG ────────────────────────────────────────────────────────────

const CONFIG = {
  scanDirs: ['src', 'app', 'components', 'hooks', 'lib', 'pages'],
  excludeDirs: ['node_modules', '.next', 'dist', 'build', '.git', '__tests__'],
  fileExtensions: ['.tsx', '.ts', '.jsx', '.js'],
};

// ─── TYPES ────────────────────────────────────────────────────────────

interface Bug {
  type: 'syntax' | 'import' | 'type' | 'runtime' | 'i18n' | 'null' | 'undefined' | 'hook' | 'deprecated' | 'performance' | 'security';
  file: string;
  line: number;
  column: number;
  message: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
  suggestion?: string;
  code?: string;
}

// ─── HELPERS ───────────────────────────────────────────────────────────

function walkDir(dir: string, files: string[] = []) {
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!CONFIG.excludeDirs.includes(entry.name)) {
        walkDir(fullPath, files);
      }
    } else if (CONFIG.fileExtensions.includes(path.extname(entry.name))) {
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

function getLines(content: string, line: number, count: number = 3): string[] {
  const lines = content.split('\n');
  const start = Math.max(0, line - count);
  const end = Math.min(lines.length, line + count + 1);
  return lines.slice(start, end);
}

// ─── BUG DETECTORS ────────────────────────────────────────────────────

const bugDetectors = [
  // ─── 1. SYNTAX ERRORS ───────────────────────────────────────────────
  {
    type: 'syntax' as const,
    severity: 'critical' as const,
    check: (content: string, file: string) => {
      const bugs: Bug[] = [];
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Check for unfinished statements
        if (trimmed.endsWith('{') && !trimmed.includes('=>') && !trimmed.includes('function')) {
          // Check if next line is not indented
          if (i + 1 < lines.length && !lines[i + 1].startsWith(' ') && !lines[i + 1].startsWith('\t')) {
            bugs.push({
              type: 'syntax',
              file,
              line: i + 1,
              column: 0,
              message: '⚠️ Possible unclosed block - next line is not indented',
              severity: 'warning',
              suggestion: 'Add proper indentation or check for missing closing brace',
            });
          }
        }
        
        // Check for missing semicolons in variable declarations
        if (/^(const|let|var)\s/.test(trimmed) && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}')) {
          bugs.push({
            type: 'syntax',
            file,
            line: i + 1,
            column: 0,
            message: '⚠️ Missing semicolon in variable declaration',
            severity: 'warning',
            suggestion: `Add semicolon at the end of line`,
          });
        }
        
        // Check for duplicate "use client"
        const useClientCount = (content.match(/["']use client["']/g) || []).length;
        if (useClientCount > 1) {
          bugs.push({
            type: 'syntax',
            file,
            line: 1,
            column: 0,
            message: '❌ Duplicate "use client" directive',
            severity: 'error',
            suggestion: 'Remove duplicate "use client" directive, keep only one at the top',
          });
        }
      }
      
      return bugs;
    }
  },

  // ─── 2. IMPORT ERRORS ──────────────────────────────────────────────
  {
    type: 'import' as const,
    severity: 'error' as const,
    check: (content: string, file: string) => {
      const bugs: Bug[] = [];
      const lines = content.split('\n');
      
      // Wrong i18n imports
      const wrongImports = [
        '@/lib/hooks/useI18n',
        '@/lib/i18n/hooks/useI18n',
        '@/hooks/useI18n.js',
        'lib/hooks/useI18n',
      ];
      
      for (const wrong of wrongImports) {
        const regex = new RegExp(`import\\s+.*from\\s+['"]${wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
        const match = regex.exec(content);
        if (match) {
          const before = content.substring(0, match.index);
          const line = before.split('\n').length;
          bugs.push({
            type: 'import',
            file,
            line,
            column: 0,
            message: `❌ Wrong import: "${match[0]}"`,
            severity: 'error',
            suggestion: `Use: import { useI18n } from "@/hooks/useI18n"`,
          });
        }
      }
      
      // Missing useI18n import
      if (content.includes('t(') && !content.includes('useI18n')) {
        const line = content.split('\n').findIndex(l => l.includes('t(')) + 1;
        if (line > 0) {
          bugs.push({
            type: 'import',
            file,
            line,
            column: 0,
            message: '❌ t() is used but useI18n is not imported',
            severity: 'error',
            suggestion: 'Add: import { useI18n } from "@/hooks/useI18n"',
          });
        }
      }
      
      // Circular dependency between I18nProvider and useI18n
      if (file.includes('I18nProvider') && content.includes('useI18n')) {
        bugs.push({
          type: 'import',
          file,
          line: 1,
          column: 0,
          message: '❌ I18nProvider cannot import useI18n (circular dependency)',
          severity: 'critical',
          suggestion: 'Remove useI18n import from I18nProvider',
        });
      }
      
      return bugs;
    }
  },

  // ─── 3. TYPE ERRORS ─────────────────────────────────────────────────
  {
    type: 'type' as const,
    severity: 'error' as const,
    check: (content: string, file: string) => {
      const bugs: Bug[] = [];
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Check for missing type annotation in function params
        if (/function\s+\w+\s*\([^:)]*\)/.test(trimmed) && !trimmed.includes(':')) {
          // Check if it's a React component (starts with capital letter)
          const funcMatch = trimmed.match(/function\s+([A-Z]\w+)\s*\(/);
          if (funcMatch && !trimmed.includes(':') && !trimmed.includes('any')) {
            bugs.push({
              type: 'type',
              file,
              line: i + 1,
              column: 0,
              message: `⚠️ Missing type annotation for component "${funcMatch[1]}"`,
              severity: 'warning',
              suggestion: `Add type: function ${funcMatch[1]}(props: ${funcMatch[1]}Props)`,
            });
          }
        }
        
        // Check for "any" type usage
        if (/: any/.test(trimmed)) {
          bugs.push({
            type: 'type',
            file,
            line: i + 1,
            column: 0,
            message: '⚠️ Using "any" type (consider using proper type)',
            severity: 'warning',
            suggestion: 'Replace "any" with proper type or interface',
          });
        }
      }
      
      return bugs;
    }
  },

  // ─── 4. NULL/UNDEFINED ERRORS ─────────────────────────────────────
  {
    type: 'null' as const,
    severity: 'error' as const,
    check: (content: string, file: string) => {
      const bugs: Bug[] = [];
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for optional chaining missing
        if (/\.\w+\(/.test(line) && !line.includes('?.')) {
          const match = line.match(/\.(\w+)\s*\(/);
          if (match && !line.includes('if') && !line.includes('?.')) {
            bugs.push({
              type: 'null',
              file,
              line: i + 1,
              column: 0,
              message: `⚠️ Possible null/undefined error: calling ${match[1]} without optional chaining`,
              severity: 'warning',
              suggestion: `Use optional chaining: ?.${match[1]}()`,
            });
          }
        }
        
        // Check for array access without check
        if (/\[0\]/.test(line) || /\[\d+\]/.test(line)) {
          if (!line.includes('if') && !line.includes('?.') && !line.includes('length')) {
            bugs.push({
              type: 'null',
              file,
              line: i + 1,
              column: 0,
              message: '⚠️ Array access without length check',
              severity: 'warning',
              suggestion: 'Check array length before accessing index',
            });
          }
        }
      }
      
      return bugs;
    }
  },

  // ─── 5. HOOK ERRORS ─────────────────────────────────────────────────
  {
    type: 'hook' as const,
    severity: 'error' as const,
    check: (content: string, file: string) => {
      const bugs: Bug[] = [];
      const lines = content.split('\n');
      
      // Check if hooks are used outside of component
      if (!file.includes('hooks') && !file.includes('Hooks')) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (/use\w+/.test(line) && !line.includes('use client') && !line.includes('export function') && !line.includes('export const')) {
            // Check if inside a function
            let insideComponent = false;
            for (let j = i; j >= 0; j--) {
              if (/export (function|const).*[A-Z]/.test(lines[j])) {
                insideComponent = true;
                break;
              }
              if (/^function/.test(lines[j]) && !/^function\s*[a-z]/.test(lines[j])) {
                insideComponent = true;
                break;
              }
            }
            if (!insideComponent) {
              bugs.push({
                type: 'hook',
                file,
                line: i + 1,
                column: 0,
                message: '❌ Hook used outside of component',
                severity: 'error',
                suggestion: 'Move hooks inside a React component or custom hook',
              });
            }
          }
        }
      }
      
      // Check for missing dependency arrays
      const useEffectRegex = /useEffect\s*\([^,]*,\s*\)/;
      const match = useEffectRegex.exec(content);
      if (match) {
        const before = content.substring(0, match.index);
        const line = before.split('\n').length;
        bugs.push({
          type: 'hook',
          file,
          line,
          column: 0,
          message: '❌ useEffect called without dependency array',
          severity: 'error',
          suggestion: 'Add dependency array to useEffect',
        });
      }
      
      return bugs;
    }
  },

  // ─── 6. I18N ERRORS ─────────────────────────────────────────────────
  {
    type: 'i18n' as const,
    severity: 'warning' as const,
    check: (content: string, file: string) => {
      const bugs: Bug[] = [];
      const lines = content.split('\n');
      
      // Check for hardcoded text in JSX
      const jsxTextRegex = /[>]\s*([Ա-Օա-ֆA-Za-z0-9\s\!\?\.,\-:;]+)\s*[<]/;
      let match;
      while ((match = jsxTextRegex.exec(content)) !== null) {
        const text = match[1].trim();
        if (text.length > 3 && 
            !/^[0-9]+$/.test(text) &&
            !/^[a-z-]+$/.test(text) && 
            !/^(flex|grid|block|inline|hidden|w-|h-|p-|m-)/i.test(text) &&
            !/^(https?:\/\/|www\.|\/|\.\.\/|\.\/)/i.test(text) &&
            !/^(NUR|Lingo|HAYQ|Nuri|Nurik)$/.test(text)) {
          
          const before = content.substring(0, match.index);
          const line = before.split('\n').length;
          
          // Check if it's already i18n
          if (!before.slice(-50).includes('{t(') && !before.slice(-50).includes('t(')) {
            bugs.push({
              type: 'i18n',
              file,
              line,
              column: 0,
              message: `💡 Possible hardcoded text: "${text}"`,
              severity: 'info',
              suggestion: `Use: {t("page_${text.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30)}")}`,
            });
          }
        }
      }
      
      // Check for missing translations
      const tRegex = /t\s*\(\s*['"`]([^'"`]+)['"`]/g;
      while ((match = tRegex.exec(content)) !== null) {
        const key = match[1];
        if (!key.includes('${') && !key.includes('{')) {
          // Check if key exists in translations (simplified check)
          if (key.startsWith('page_') || key.startsWith('dialogues_') || key.startsWith('garden_')) {
            // This is a warning, but we can't check actual translations here
          }
        }
      }
      
      return bugs;
    }
  },

  // ─── 7. PERFORMANCE ISSUES ─────────────────────────────────────────
  {
    type: 'performance' as const,
    severity: 'warning' as const,
    check: (content: string, file: string) => {
      const bugs: Bug[] = [];
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for inline function in JSX (creates new function each render)
        if (/onClick\s*=\s*{\(\s*\)/.test(line) || /onClick\s*=\s*{function/.test(line)) {
          bugs.push({
            type: 'performance',
            file,
            line: i + 1,
            column: 0,
            message: '⚠️ Inline function in JSX (creates new function on each render)',
            severity: 'warning',
            suggestion: 'Use useCallback to memoize the function',
          });
        }
        
        // Check for large array in dependency array
        if (/useEffect.*\[.*,.*,.*,.*,.*,.*,.*\]/.test(line)) {
          bugs.push({
            type: 'performance',
            file,
            line: i + 1,
            column: 0,
            message: '⚠️ Large dependency array in useEffect (more than 5 dependencies)',
            severity: 'info',
            suggestion: 'Consider using useMemo or splitting the effect',
          });
        }
      }
      
      return bugs;
    }
  },

  // ─── 8. SECURITY ISSUES ─────────────────────────────────────────────
  {
    type: 'security' as const,
    severity: 'warning' as const,
    check: (content: string, file: string) => {
      const bugs: Bug[] = [];
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for dangerouslySetInnerHTML
        if (line.includes('dangerouslySetInnerHTML')) {
          bugs.push({
            type: 'security',
            file,
            line: i + 1,
            column: 0,
            message: '⚠️ Using dangerouslySetInnerHTML (potential XSS risk)',
            severity: 'warning',
            suggestion: 'Sanitize HTML content or use safe rendering methods',
          });
        }
        
        // Check for eval
        if (line.includes('eval(')) {
          bugs.push({
            type: 'security',
            file,
            line: i + 1,
            column: 0,
            message: '❌ Using eval() (security risk)',
            severity: 'critical',
            suggestion: 'Avoid using eval, use alternative approaches',
          });
        }
      }
      
      return bugs;
    }
  },
];

// ─── MAIN FUNCTION ────────────────────────────────────────────────────

function scanProject() {
  console.log('📂 Scanning directories...');
  console.log('   Directories:', CONFIG.scanDirs.join(', '));
  console.log('   Excluding:', CONFIG.excludeDirs.join(', '));
  console.log('   Extensions:', CONFIG.fileExtensions.join(', '));
  console.log('');

  const allFiles: string[] = [];
  for (const dir of CONFIG.scanDirs) {
    if (fs.existsSync(dir)) {
      const files = walkDir(dir);
      allFiles.push(...files);
      console.log(`   📁 ${dir}: ${files.length} files`);
    } else {
      console.log(`   ⚠️ ${dir}: directory not found`);
    }
  }

  console.log('');
  console.log(`📄 Total files: ${allFiles.length}`);
  console.log('');

  console.log('🔍 Scanning for bugs...');
  console.log('');

  const allBugs: Bug[] = [];

  for (const file of allFiles) {
    const content = readFile(file);
    if (!content) continue;

    for (const detector of bugDetectors) {
      try {
        const bugs = detector.check(content, file);
        allBugs.push(...bugs);
      } catch (error) {
        // Silent fail for individual detectors
      }
    }
  }

  // ─── GROUP AND SORT BUGS ──────────────────────────────────────────

  const grouped = allBugs.reduce((acc, bug) => {
    if (!acc[bug.type]) acc[bug.type] = [];
    acc[bug.type].push(bug);
    return acc;
  }, {} as Record<string, Bug[]>);

  const sortedBySeverity = ['critical', 'error', 'warning', 'info'];

  // ─── PRINT RESULTS ──────────────────────────────────────────────────

  console.log('=' .repeat(70));
  console.log('📊 SCAN RESULTS');
  console.log('=' .repeat(70));
  console.log('');

  console.log(`📁 Files scanned: ${allFiles.length}`);
  console.log(`🐛 Total bugs found: ${allBugs.length}`);
  console.log('');

  // Print by severity
  console.log('📈 BY SEVERITY:');
  console.log('   Critical:', allBugs.filter(b => b.severity === 'critical').length);
  console.log('   Error:', allBugs.filter(b => b.severity === 'error').length);
  console.log('   Warning:', allBugs.filter(b => b.severity === 'warning').length);
  console.log('   Info:', allBugs.filter(b => b.severity === 'info').length);
  console.log('');

  // Print by type
  console.log('📋 BY TYPE:');
  for (const type of Object.keys(grouped).sort()) {
    const bugs = grouped[type];
    const severityCount = bugs.reduce((acc, b) => {
      acc[b.severity] = (acc[b.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log(`   ${type.toUpperCase()}: ${bugs.length} (${Object.entries(severityCount).map(([s, c]) => `${s}: ${c}`).join(', ')})`);
  }
  console.log('');

  // Print detailed bugs (first 5 of each type)
  console.log('=' .repeat(70));
  console.log('🔍 DETAILED BUGS');
  console.log('=' .repeat(70));
  console.log('');

  let totalPrinted = 0;
  const maxPerType = 10;

  for (const type of Object.keys(grouped).sort()) {
    const bugs = grouped[type];
    const critical = bugs.filter(b => b.severity === 'critical');
    const errors = bugs.filter(b => b.severity === 'error');
    const warnings = bugs.filter(b => b.severity === 'warning');
    const infos = bugs.filter(b => b.severity === 'info');
    
    console.log(`\n📌 ${type.toUpperCase()} (${bugs.length})`);
    console.log('   ─'.repeat(30));
    
    const allDisplay = [...critical, ...errors, ...warnings, ...infos].slice(0, maxPerType);
    
    for (const bug of allDisplay) {
      const emoji = bug.severity === 'critical' ? '🚨' : bug.severity === 'error' ? '❌' : bug.severity === 'warning' ? '⚠️' : '💡';
      const relativePath = path.relative(process.cwd(), bug.file);
      console.log(`   ${emoji} ${relativePath}:${bug.line}`);
      console.log(`      ${bug.message}`);
      if (bug.suggestion) {
        console.log(`      💡 ${bug.suggestion}`);
      }
      totalPrinted++;
    }
    
    if (bugs.length > maxPerType) {
      console.log(`   ... and ${bugs.length - maxPerType} more issues`);
    }
  }

  console.log('');
  console.log('=' .repeat(70));
  console.log('📈 SUMMARY');
  console.log('=' .repeat(70));

  const criticalCount = allBugs.filter(b => b.severity === 'critical').length;
  const errorCount = allBugs.filter(b => b.severity === 'error').length;
  const warningCount = allBugs.filter(b => b.severity === 'warning').length;
  const infoCount = allBugs.filter(b => b.severity === 'info').length;

  console.log(`🚨 Critical: ${criticalCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`⚠️ Warnings: ${warningCount}`);
  console.log(`💡 Info: ${infoCount}`);
  console.log('');
  console.log(`🐛 Total: ${allBugs.length}`);

  if (criticalCount > 0 || errorCount > 0) {
    console.log('\n❌ Critical or Error bugs found! Must fix before deployment.');
    process.exit(1);
  } else if (warningCount > 0) {
    console.log('\n⚠️ Warnings found. Should fix for better code quality.');
    process.exit(0);
  } else {
    console.log('\n✅ No critical issues found!');
    process.exit(0);
  }
}

// ─── RUN ──────────────────────────────────────────────────────────────

scanProject();