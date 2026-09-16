// scripts/check-build-errors.ts

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { glob } from 'glob';

interface ErrorResult {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
}

interface FileCheckResult {
  file: string;
  errors: ErrorResult[];
  warnings: ErrorResult[];
}

// ─── CONFIG ──────────────────────────────────────────────────────────

const SRC_DIR = path.join(process.cwd(), 'src');
const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/*.test.ts',
  '**/*.spec.ts',
  '**/*.backup',
];

// ─── HELPERS ─────────────────────────────────────────────────────────

function getTypeScriptErrors(): ErrorResult[] {
  try {
    const output = execSync('npx tsc --noEmit --pretty false', {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    
    // If no errors, tsc returns empty output
    if (!output.trim()) {
      return [];
    }
    
    // Parse TSC output
    const lines = output.split('\n');
    const errors: ErrorResult[] = [];
    
    for (const line of lines) {
      // Match: file.ts(10,5): error TS1234: message
      const match = line.match(/^(.+)\((\d+),(\d+)\):\s+(error|warning)\s+(TS\d+):\s+(.+)$/);
      if (match) {
        const [, file, lineStr, colStr, type, code, message] = match;
        errors.push({
          file: file.trim(),
          line: parseInt(lineStr),
          column: parseInt(colStr),
          message: message.trim(),
          code: code.trim(),
        });
      }
    }
    
    return errors;
  } catch (error: any) {
    // tsc returns non-zero exit code when there are errors
    if (error.status === 2) {
      // Parse the output
      const output = error.stdout || '';
      const lines = output.split('\n');
      const errors: ErrorResult[] = [];
      
      for (const line of lines) {
        const match = line.match(/^(.+)\((\d+),(\d+)\):\s+(error|warning)\s+(TS\d+):\s+(.+)$/);
        if (match) {
          const [, file, lineStr, colStr, type, code, message] = match;
          errors.push({
            file: file.trim(),
            line: parseInt(lineStr),
            column: parseInt(colStr),
            message: message.trim(),
            code: code.trim(),
          });
        }
      }
      
      return errors;
    }
    return [];
  }
}

function getBuildErrors(): ErrorResult[] {
  try {
    const output = execSync('npx next build 2>&1', {
      encoding: 'utf-8',
      stdio: 'pipe',
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer
    });
    
    const lines = output.split('\n');
    const errors: ErrorResult[] = [];
    let currentFile = '';
    
    for (const line of lines) {
      // Check for file reference: "./src/xxx/xxx.tsx"
      const fileMatch = line.match(/^\.\/(src\/.+\.(ts|tsx|js|jsx))/);
      if (fileMatch) {
        currentFile = fileMatch[1];
      }
      
      // Check for error: "Type error: ..."
      const typeErrorMatch = line.match(/^Type error:\s+(.+)$/);
      if (typeErrorMatch && currentFile) {
        errors.push({
          file: currentFile,
          line: 0,
          column: 0,
          message: typeErrorMatch[1],
          code: 'TYPE_ERROR',
        });
      }
      
      // Check for syntax error
      const syntaxErrorMatch = line.match(/^Syntax error:\s+(.+)$/);
      if (syntaxErrorMatch && currentFile) {
        errors.push({
          file: currentFile,
          line: 0,
          column: 0,
          message: syntaxErrorMatch[1],
          code: 'SYNTAX_ERROR',
        });
      }
    }
    
    return errors;
  } catch (error: any) {
    // Next.js build returns non-zero on error
    const output = error.stdout || error.stderr || '';
    const lines = output.split('\n');
    const errors: ErrorResult[] = [];
    let currentFile = '';
    
    for (const line of lines) {
      const fileMatch = line.match(/^\.\/(src\/.+\.(ts|tsx|js|jsx))/);
      if (fileMatch) {
        currentFile = fileMatch[1];
      }
      
      const typeErrorMatch = line.match(/^Type error:\s+(.+)$/);
      if (typeErrorMatch && currentFile) {
        errors.push({
          file: currentFile,
          line: 0,
          column: 0,
          message: typeErrorMatch[1],
          code: 'TYPE_ERROR',
        });
      }
    }
    
    return errors;
  }
}

function scanFileForIssues(filePath: string): { errors: ErrorResult[]; warnings: ErrorResult[] } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const errors: ErrorResult[] = [];
  const warnings: ErrorResult[] = [];
  
  // Common patterns to check
  const patterns = [
    // Missing imports
    { regex: /import\s*\{[^}]*\}\s*from\s*['"][^'"]*['"]/g, type: 'import', msg: 'Check import path' },
    // Any as type (potential issues)
    { regex: /:\s*any\b/g, type: 'warning', msg: 'Using "any" type - consider using a more specific type' },
    // Missing type annotations
    { regex: /const\s+(\w+)\s*=\s*[^;]+;/g, type: 'warning', msg: 'Variable without type annotation' },
    // Function without return type
    { regex: /function\s+(\w+)\s*\([^)]*\)\s*\{/g, type: 'warning', msg: 'Function without return type' },
    // Property access that might be undefined
    { regex: /\.(\w+)(?![?.])/g, type: 'warning', msg: 'Property access without optional chaining' },
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Check each pattern
    for (const pattern of patterns) {
      if (pattern.regex.test(line)) {
        const result: ErrorResult = {
          file: path.relative(process.cwd(), filePath),
          line: lineNum,
          column: 0,
          message: pattern.msg,
          code: pattern.type === 'warning' ? 'WARNING' : 'ERROR',
        };
        
        if (pattern.type === 'warning') {
          warnings.push(result);
        } else {
          errors.push(result);
        }
      }
    }
  }
  
  return { errors, warnings };
}

function scanDirectory(dir: string): FileCheckResult[] {
  const results: FileCheckResult[] = [];
  const files = glob.sync(`${dir}/**/*.{ts,tsx,js,jsx}`, {
    ignore: IGNORE_PATTERNS,
  });
  
  for (const file of files) {
    try {
      const { errors, warnings } = scanFileForIssues(file);
      if (errors.length > 0 || warnings.length > 0) {
        results.push({
          file: path.relative(process.cwd(), file),
          errors,
          warnings,
        });
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  return results;
}

// ─── MAIN ────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍 Scanning for build errors...\n');
  
  // 1. Get TypeScript errors
  console.log('📋 Running TypeScript check...');
  const tsErrors = getTypeScriptErrors();
  
  // 2. Get build errors
  console.log('📋 Running Next.js build check...');
  const buildErrors = getBuildErrors();
  
  // 3. Scan source files
  console.log('📋 Scanning source files...');
  const fileIssues = scanDirectory(SRC_DIR);
  
  // ─── REPORT ──────────────────────────────────────────────────────
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 BUILD ERROR REPORT');
  console.log('='.repeat(80));
  
  // TypeScript Errors
  if (tsErrors.length > 0) {
    console.log(`\n❌ TypeScript Errors: ${tsErrors.length}`);
    console.log('-'.repeat(40));
    
    // Group by file
    const grouped = tsErrors.reduce((acc, err) => {
      if (!acc[err.file]) acc[err.file] = [];
      acc[err.file].push(err);
      return acc;
    }, {} as Record<string, ErrorResult[]>);
    
    for (const [file, errors] of Object.entries(grouped)) {
      console.log(`\n📄 ${file}`);
      for (const err of errors) {
        console.log(`  ${err.code}: ${err.message}`);
        console.log(`    at line ${err.line}, column ${err.column}`);
      }
    }
  } else {
    console.log('\n✅ No TypeScript errors found');
  }
  
  // Build Errors
  if (buildErrors.length > 0) {
    console.log(`\n❌ Next.js Build Errors: ${buildErrors.length}`);
    console.log('-'.repeat(40));
    
    for (const err of buildErrors) {
      console.log(`📄 ${err.file}`);
      console.log(`  ${err.code}: ${err.message}`);
    }
  } else {
    console.log('\n✅ No Next.js build errors found');
  }
  
  // File Issues
  const totalFileErrors = fileIssues.reduce((sum, f) => sum + f.errors.length, 0);
  const totalFileWarnings = fileIssues.reduce((sum, f) => sum + f.warnings.length, 0);
  
  if (totalFileErrors > 0 || totalFileWarnings > 0) {
    console.log(`\n⚠️ Source File Issues:`);
    console.log(`  Errors: ${totalFileErrors}`);
    console.log(`  Warnings: ${totalFileWarnings}`);
    console.log('-'.repeat(40));
    
    for (const result of fileIssues) {
      if (result.errors.length > 0 || result.warnings.length > 0) {
        console.log(`\n📄 ${result.file}`);
        for (const err of result.errors) {
          console.log(`  ❌ ${err.message} (line ${err.line})`);
        }
        for (const warn of result.warnings) {
          console.log(`  ⚠️ ${warn.message} (line ${warn.line})`);
        }
      }
    }
  }
  
  // ─── SUMMARY ──────────────────────────────────────────────────────
  
  const totalErrors = tsErrors.length + buildErrors.length + totalFileErrors;
  const totalWarnings = totalFileWarnings;
  
  console.log('\n' + '='.repeat(80));
  console.log('📈 SUMMARY');
  console.log('='.repeat(80));
  console.log(`❌ Total Errors: ${totalErrors}`);
  console.log(`⚠️ Total Warnings: ${totalWarnings}`);
  
  if (totalErrors === 0 && totalWarnings === 0) {
    console.log('\n🎉 No issues found! Build should be clean.');
  } else if (totalErrors === 0) {
    console.log('\n⚠️ No errors, but there are warnings to consider.');
  } else {
    console.log(`\n❌ Found ${totalErrors} error(s) that need to be fixed.`);
    console.log('\n💡 To fix:');
    console.log('  1. Check the errors listed above');
    console.log('  2. Run: npm run build -- --no-lint to verify');
    console.log('  3. Run: npx tsc --noEmit to check types');
  }
  
  // ─── SAVE REPORT ──────────────────────────────────────────────────
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      tsErrors: tsErrors.length,
      buildErrors: buildErrors.length,
      fileErrors: totalFileErrors,
      fileWarnings: totalFileWarnings,
      totalErrors,
      totalWarnings,
    },
    errors: {
      typescript: tsErrors,
      build: buildErrors,
      files: fileIssues,
    },
  };
  
  const reportPath = path.join(process.cwd(), 'build-error-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);
}

// ─── RUN ────────────────────────────────────────────────────────────

main().catch((error) => {
  console.error('❌ Error running checker:', error);
  process.exit(1);
});