// scripts/find-all-build-errors.ts

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface ErrorItem {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
}

interface FileErrors {
  file: string;
  errors: ErrorItem[];
}

// ─── COLORS ──────────────────────────────────────────────────────────────

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

// ─── PARSE TSC ERRORS ────────────────────────────────────────────────────

function parseTscErrors(output: string): ErrorItem[] {
  const errors: ErrorItem[] = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    // Match: file.ts(10,5): error TS1234: message
    const match = line.match(/^(.+)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
    if (match) {
      errors.push({
        file: match[1].trim(),
        line: parseInt(match[2]),
        column: parseInt(match[3]),
        code: match[4],
        message: match[5].trim(),
      });
    }
  }
  
  return errors;
}

// ─── PARSE NEXT BUILD ERRORS ────────────────────────────────────────────

function parseNextBuildErrors(output: string): ErrorItem[] {
  const errors: ErrorItem[] = [];
  const lines = output.split('\n');
  let currentFile = '';
  let currentLine = 0;
  let currentColumn = 0;
  
  for (const line of lines) {
    // Match file reference: ./src/xxx/xxx.tsx
    const fileMatch = line.match(/^\.\/(src\/.+\.(ts|tsx|js|jsx))/);
    if (fileMatch) {
      currentFile = fileMatch[1];
    }
    
    // Match line:column reference
    const lineColMatch = line.match(/\((\d+),(\d+)\)/);
    if (lineColMatch) {
      currentLine = parseInt(lineColMatch[1]);
      currentColumn = parseInt(lineColMatch[2]);
    }
    
    // Match Type error
    const typeErrorMatch = line.match(/^Type error:\s+(.+)$/);
    if (typeErrorMatch && currentFile) {
      errors.push({
        file: currentFile,
        line: currentLine || 0,
        column: currentColumn || 0,
        code: 'TYPE_ERROR',
        message: typeErrorMatch[1],
      });
      // Reset for next error
      currentLine = 0;
      currentColumn = 0;
    }
    
    // Match Syntax error
    const syntaxErrorMatch = line.match(/^Syntax error:\s+(.+)$/);
    if (syntaxErrorMatch && currentFile) {
      errors.push({
        file: currentFile,
        line: currentLine || 0,
        column: currentColumn || 0,
        code: 'SYNTAX_ERROR',
        message: syntaxErrorMatch[1],
      });
      currentLine = 0;
      currentColumn = 0;
    }
    
    // Match Failed to compile
    if (line.includes('Failed to compile') && currentFile) {
      // The actual error will be in the next lines
    }
  }
  
  return errors;
}

// ─── SCAN FOR COMMON ISSUES ─────────────────────────────────────────────

function scanForCommonIssues(): ErrorItem[] {
  const errors: ErrorItem[] = [];
  const srcDir = path.join(process.cwd(), 'src');
  
  // Files to check
  const filesToCheck = [
    'src/lib/audio/LessonAudio.ts',
    'src/lib/content/builders/world6.ts',
    'src/lib/content/builders/world7.ts',
    'src/lib/content/builders/world8.ts',
    'src/lib/content/builders/world9.ts',
    'src/lib/content/builders/world10.ts',
    'src/lib/content/database.ts',
    'src/lib/content/generator.ts',
  ];
  
  for (const filePath of filesToCheck) {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) continue;
    
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;
        
        // Check for .feedback usage (known issue)
        if (line.includes('.feedback') && !line.includes('//') && !line.includes('*')) {
          errors.push({
            file: filePath,
            line: lineNum,
            column: 0,
            code: 'WARNING',
            message: 'Uses .feedback property - may need to check if it exists',
          });
        }
        
        // Check for missing 'as any' for dialogues
        if (line.includes('dialogues:') && line.includes('COMMON_DIALOGUES') && !line.includes('as any')) {
          errors.push({
            file: filePath,
            line: lineNum,
            column: 0,
            code: 'WARNING',
            message: 'dialogues: COMMON_DIALOGUES without "as any" - may cause type issues',
          });
        }
      }
    } catch {
      // Skip files that can't be read
    }
  }
  
  return errors;
}

// ─── RUN COMMANDS ────────────────────────────────────────────────────────

function runCommand(cmd: string): { output: string; exitCode: number } {
  try {
    const output = execSync(cmd, {
      encoding: 'utf-8',
      stdio: 'pipe',
      maxBuffer: 50 * 1024 * 1024,
    });
    return { output, exitCode: 0 };
  } catch (error: any) {
    return {
      output: error.stdout || error.stderr || '',
      exitCode: error.status || 1,
    };
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.bold}🔍 NUR LINGO - BUILD ERROR FINDER${colors.reset}`);
  console.log('='.repeat(80) + '\n');

  const allErrors: FileErrors[] = [];
  const errorMap: Record<string, ErrorItem[]> = {};

  // ─── 1. RUN TSC ──────────────────────────────────────────────────────

  console.log(`${colors.cyan}📋 Running TypeScript check...${colors.reset}`);
  const tscResult = runCommand('npx tsc --noEmit');
  
  if (tscResult.exitCode !== 0) {
    const errors = parseTscErrors(tscResult.output);
    for (const err of errors) {
      if (!errorMap[err.file]) errorMap[err.file] = [];
      errorMap[err.file].push(err);
    }
    console.log(`${colors.yellow}  Found ${errors.length} TypeScript error(s)${colors.reset}`);
  } else {
    console.log(`${colors.green}  ✅ No TypeScript errors${colors.reset}`);
  }

  // ─── 2. RUN NEXT BUILD ──────────────────────────────────────────────

  console.log(`\n${colors.cyan}📋 Running Next.js build...${colors.reset}`);
  const buildResult = runCommand('npx next build --no-lint');
  
  if (buildResult.exitCode !== 0) {
    const errors = parseNextBuildErrors(buildResult.output);
    for (const err of errors) {
      if (!errorMap[err.file]) errorMap[err.file] = [];
      errorMap[err.file].push(err);
    }
    console.log(`${colors.yellow}  Found ${errors.length} build error(s)${colors.reset}`);
  } else {
    console.log(`${colors.green}  ✅ No build errors${colors.reset}`);
  }

  // ─── 3. SCAN FOR COMMON ISSUES ─────────────────────────────────────

  console.log(`\n${colors.cyan}📋 Scanning for common issues...${colors.reset}`);
  const scanErrors = scanForCommonIssues();
  for (const err of scanErrors) {
    if (!errorMap[err.file]) errorMap[err.file] = [];
    errorMap[err.file].push(err);
  }
  console.log(`${colors.yellow}  Found ${scanErrors.length} potential issue(s)${colors.reset}`);

  // ─── 4. DISPLAY RESULTS ─────────────────────────────────────────────

  console.log('\n' + '='.repeat(80));
  console.log(`${colors.bold}📊 BUILD ERROR REPORT${colors.reset}`);
  console.log('='.repeat(80) + '\n');

  // Convert to sorted array
  const sortedFiles = Object.keys(errorMap).sort();
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of sortedFiles) {
    const errors = errorMap[file];
    const hasErrors = errors.some(e => e.code !== 'WARNING');
    const hasWarnings = errors.some(e => e.code === 'WARNING');
    
    if (hasErrors) {
      totalErrors += errors.filter(e => e.code !== 'WARNING').length;
    }
    if (hasWarnings) {
      totalWarnings += errors.filter(e => e.code === 'WARNING').length;
    }
    
    const icon = hasErrors ? '❌' : '⚠️';
    const color = hasErrors ? colors.red : colors.yellow;
    
    console.log(`${color}${icon} ${file}${colors.reset}`);
    
    // Group errors by line
    const grouped = errors.reduce((acc, err) => {
      const key = `${err.line}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(err);
      return acc;
    }, {} as Record<string, ErrorItem[]>);
    
    for (const [line, lineErrors] of Object.entries(grouped)) {
      const lineNum = parseInt(line);
      const isWarning = lineErrors.every(e => e.code === 'WARNING');
      const prefix = isWarning ? '  ⚠️' : '  ❌';
      const color2 = isWarning ? colors.yellow : colors.red;
      
      // Show line number and first error
      const firstErr = lineErrors[0];
      console.log(`${color2}${prefix} Line ${lineNum}: ${firstErr.message}${colors.reset}`);
      
      // Show additional errors on same line
      for (let i = 1; i < lineErrors.length; i++) {
        console.log(`${color2}         ${lineErrors[i].message}${colors.reset}`);
      }
    }
    console.log('');
  }

  // ─── 5. SUMMARY ──────────────────────────────────────────────────────

  console.log('='.repeat(80));
  console.log(`${colors.bold}📈 SUMMARY${colors.reset}`);
  console.log('='.repeat(80));
  console.log(`${colors.red}  ❌ Total Errors: ${totalErrors}${colors.reset}`);
  console.log(`${colors.yellow}  ⚠️ Total Warnings: ${totalWarnings}${colors.reset}`);
  console.log(`${colors.cyan}  📄 Files with issues: ${sortedFiles.length}${colors.reset}`);
  console.log('');

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(`${colors.green}🎉 No issues found! Build is clean.${colors.reset}`);
  } else if (totalErrors === 0) {
    console.log(`${colors.yellow}⚠️ No errors, but ${totalWarnings} warning(s) to consider.${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Found ${totalErrors} error(s) that need to be fixed.${colors.reset}`);
    console.log('');
    console.log(`${colors.cyan}💡 Next steps:${colors.reset}`);
    console.log(`  1. Fix the errors listed above`);
    console.log(`  2. Run: ${colors.bold}npm run build -- --no-lint${colors.reset} to verify`);
    console.log(`  3. Run: ${colors.bold}npx tsc --noEmit${colors.reset} to check types`);
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// ─── RUN ────────────────────────────────────────────────────────────────

main().catch((error) => {
  console.error(`${colors.red}❌ Error running checker:${colors.reset}`, error);
  process.exit(1);
});