// scripts/full-test.js
// Գործարկել՝ node scripts/full-test.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── ԿԱՐԳԱՎՈՐՈՒՄՆԵՐ ──────────────────────────────────────────────

const APP_DIR = path.join(__dirname, '..', 'src', 'app');
const COMPONENTS_DIR = path.join(__dirname, '..', 'src', 'components');
const LIB_DIR = path.join(__dirname, '..', 'src', 'lib');

const RESULTS = {
  errors: [],
  warnings: [],
  info: [],
  summary: {
    totalErrors: 0,
    totalWarnings: 0,
    totalInfo: 0,
    filesChecked: 0,
    passed: true
  }
};

// ─── 1. HTML/CSS ՎԱԼԻԴԱՑԻԱ ──────────────────────────────────────

function checkHtmlFiles() {
  const issues = [];
  const files = getAllFiles(APP_DIR, ['.tsx', '.jsx']);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relPath = path.relative(process.cwd(), file);
    
    // 1.1 Ստուգել alt attributes
    const imgWithoutAlt = content.match(/<img[^>]*?(?!alt=)[^>]*?>/g);
    if (imgWithoutAlt) {
      issues.push({
        type: 'warning',
        file: relPath,
        message: `Images without alt attribute: ${imgWithoutAlt.length}`,
        severity: 'medium'
      });
    }
    
    // 1.2 Ստուգել button types
    const buttonWithoutType = content.match(/<button[^>]*?(?!type=)[^>]*?>/g);
    if (buttonWithoutType) {
      issues.push({
        type: 'info',
        file: relPath,
        message: `Buttons without type attribute: ${buttonWithoutType.length}`,
        severity: 'low'
      });
    }
    
    // 1.3 Ստուգել a tags with href
    const aWithoutHref = content.match(/<a[^>]*?(?!href=)[^>]*?>/g);
    if (aWithoutHref) {
      issues.push({
        type: 'warning',
        file: relPath,
        message: `Links without href: ${aWithoutHref.length}`,
        severity: 'medium'
      });
    }
    
    // 1.4 Ստուգել empty divs
    const emptyDivs = content.match(/<div\s*>\s*<\/div>/g);
    if (emptyDivs) {
      issues.push({
        type: 'info',
        file: relPath,
        message: `Empty divs found: ${emptyDivs.length}`,
        severity: 'low'
      });
    }
  }
  
  return issues;
}

// ─── 2. TYPESCRIPT ՎԱԼԻԴԱՑԻԱ ──────────────────────────────────────

function checkTypeScript() {
  const issues = [];
  const files = getAllFiles(APP_DIR, ['.ts', '.tsx']);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relPath = path.relative(process.cwd(), file);
    
    // 2.1 Ստուգել `any` type-ի օգտագործումը
    const anyUsages = content.match(/: any/g);
    if (anyUsages) {
      issues.push({
        type: 'warning',
        file: relPath,
        message: `'any' type used ${anyUsages.length} times`,
        severity: 'medium'
      });
    }
    
    // 2.2 Ստուգել missing return types
    const missingReturn = content.match(/function\s+\w+\s*\([^)]*\)\s*\{/g);
    if (missingReturn) {
      issues.push({
        type: 'info',
        file: relPath,
        message: `Functions without return type: ${missingReturn.length}`,
        severity: 'low'
      });
    }
    
    // 2.3 Ստուգել @ts-ignore
    const tsIgnore = content.match(/@ts-ignore/g);
    if (tsIgnore) {
      issues.push({
        type: 'error',
        file: relPath,
        message: `@ts-ignore used ${tsIgnore.length} times`,
        severity: 'high'
      });
    }
  }
  
  return issues;
}

// ─── 3. IMPORT ՎԱԼԻԴԱՑԻԱ ──────────────────────────────────────────

function checkImports() {
  const issues = [];
  const files = getAllFiles(APP_DIR, ['.ts', '.tsx', '.js', '.jsx']);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relPath = path.relative(process.cwd(), file);
    
    // 3.1 Ստուգել duplicate imports
    const importLines = content.match(/import\s+.*?from\s+['"][^'"]+['"]/g) || [];
    const importSources = importLines.map(line => {
      const match = line.match(/from\s+['"]([^'"]+)['"]/);
      return match ? match[1] : null;
    }).filter(Boolean);
    
    const duplicates = importSources.filter((src, i) => importSources.indexOf(src) !== i);
    if (duplicates.length > 0) {
      issues.push({
        type: 'info',
        file: relPath,
        message: `Duplicate imports: ${[...new Set(duplicates)].join(', ')}`,
        severity: 'low'
      });
    }
    
    // 3.2 Ստուգել missing imports (simple check)
    const usedComponents = content.match(/<([A-Z][a-zA-Z0-9]*)/g) || [];
    const importedComponents = content.match(/import\s*\{[^}]*\}/g) || [];
    
    // Basic check - not perfect but catches obvious issues
    for (const comp of usedComponents) {
      const name = comp.replace('<', '');
      if (!content.includes(`import.*${name}`) && !content.includes('import.* as')) {
        // Check if it's a built-in HTML element
        if (!['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button', 'input', 'form', 'label', 'ul', 'li', 'ol', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'img', 'svg', 'path', 'circle', 'rect', 'g', 'defs', 'linearGradient', 'stop', 'use', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside', 'figure', 'figcaption', 'blockquote', 'pre', 'code', 'strong', 'em', 'b', 'i', 'u', 'small', 'sub', 'sup', 'br', 'hr', 'textarea', 'select', 'option'].includes(name)) {
          issues.push({
            type: 'warning',
            file: relPath,
            message: `Possible missing import for component: ${name}`,
            severity: 'medium'
          });
        }
      }
    }
  }
  
  return issues;
}

// ─── 4. HOOKS ՎԱԼԻԴԱՑԻԱ ──────────────────────────────────────────

function checkHooks() {
  const issues = [];
  const files = getAllFiles(APP_DIR, ['.tsx', '.jsx']);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relPath = path.relative(process.cwd(), file);
    
    // 4.1 Ստուգել useState without setter
    const useStateWithoutSetter = content.match(/const\s*\[\s*\w+\s*,\s*\w+\s*\]\s*=\s*useState/g);
    if (!useStateWithoutSetter) {
      issues.push({
        type: 'warning',
        file: relPath,
        message: 'useState without setter found',
        severity: 'medium'
      });
    }
    
    // 4.2 Ստուգել useEffect without dependencies
    const useEffectWithoutDeps = content.match(/useEffect\s*\(\s*\(\)\s*=>\s*\{[^}]*\}\s*\)\s*;/g);
    if (useEffectWithoutDeps) {
      issues.push({
        type: 'warning',
        file: relPath,
        message: `useEffect without dependency array: ${useEffectWithoutDeps.length}`,
        severity: 'medium'
      });
    }
    
    // 4.3 Ստուգել useCallback without dependencies
    const useCallbackWithoutDeps = content.match(/useCallback\s*\(\s*\(\)\s*=>\s*\{[^}]*\}\s*\)\s*;/g);
    if (useCallbackWithoutDeps) {
      issues.push({
        type: 'warning',
        file: relPath,
        message: `useCallback without dependency array: ${useCallbackWithoutDeps.length}`,
        severity: 'medium'
      });
    }
  }
  
  return issues;
}

// ─── 5. PERFORMANCE ՎԱԼԻԴԱՑԻԱ ──────────────────────────────────────

function checkPerformance() {
  const issues = [];
  const files = getAllFiles(APP_DIR, ['.tsx', '.jsx']);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relPath = path.relative(process.cwd(), file);
    
    // 5.1 Ստուգել large inline styles
    const largeStyles = content.match(/style=\{\{[^}]*\}\}/g);
    if (largeStyles && largeStyles.some(s => s.length > 200)) {
      issues.push({
        type: 'warning',
        file: relPath,
        message: 'Large inline styles found, consider using CSS classes',
        severity: 'medium'
      });
    }
    
    // 5.2 Ստուգել large component (more than 500 lines)
    const lines = content.split('\n');
    if (lines.length > 500) {
      issues.push({
        type: 'info',
        file: relPath,
        message: `Large component: ${lines.length} lines, consider splitting`,
        severity: 'low'
      });
    }
    
    // 5.3 Ստուգել key prop in lists
    const mapWithoutKey = content.match(/\.map\s*\([^)]*\)\s*=>\s*\([^)]*\)/g);
    if (mapWithoutKey) {
      // Check if key is present
      const mapWithKey = content.match(/\.map\s*\([^)]*\)\s*=>\s*\([^)]*key=/g);
      if (mapWithoutKey.length > (mapWithKey ? mapWithKey.length : 0)) {
        issues.push({
          type: 'warning',
          file: relPath,
          message: 'Map without key prop found',
          severity: 'medium'
        });
      }
    }
  }
  
  return issues;
}

// ─── 6. ACCESSIBILITY ՎԱԼԻԴԱՑԻԱ ──────────────────────────────────

function checkAccessibility() {
  const issues = [];
  const files = getAllFiles(APP_DIR, ['.tsx', '.jsx']);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relPath = path.relative(process.cwd(), file);
    
    // 6.1 Ստուգել aria-label
    const interactiveWithoutAria = content.match(/<(button|a|input|select|textarea)[^>]*?(?!aria-label=)[^>]*?>/g);
    if (interactiveWithoutAria) {
      issues.push({
        type: 'warning',
        file: relPath,
        message: `Interactive elements without aria-label: ${interactiveWithoutAria.length}`,
        severity: 'medium'
      });
    }
    
    // 6.2 Ստուգել role
    const elementsWithoutRole = content.match(/<(div|span|section|article|nav|main|aside|header|footer)[^>]*?(?!role=)[^>]*?>/g);
    if (elementsWithoutRole && elementsWithoutRole.length > 10) {
      issues.push({
        type: 'info',
        file: relPath,
        message: `Many elements without role attribute: ${elementsWithoutRole.length}`,
        severity: 'low'
      });
    }
  }
  
  return issues;
}

// ─── 7. NEXT.JS SPECIFIC ՎԱԼԻԴԱՑԻԱ ──────────────────────────────

function checkNextJs() {
  const issues = [];
  const files = getAllFiles(APP_DIR, ['.tsx', '.jsx']);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relPath = path.relative(process.cwd(), file);
    
    // 7.1 Ստուգել use client
    const isClientComponent = content.includes('"use client"') || content.includes("'use client'");
    if (!isClientComponent && content.includes('useState')) {
      issues.push({
        type: 'error',
        file: relPath,
        message: 'Client component missing "use client" directive',
        severity: 'high'
      });
    }
    
    // 7.2 Ստուգել image optimization
    const imgTags = content.match(/<img[^>]*>/g);
    if (imgTags) {
      const nextImages = content.match(/<Image[^>]*>/g);
      if (!nextImages && imgTags.length > 0) {
        issues.push({
          type: 'warning',
          file: relPath,
          message: 'Use Next.js Image component instead of img tag',
          severity: 'medium'
        });
      }
    }
    
    // 7.3 Ստուգել Link component
    const aTags = content.match(/<a[^>]*href=[^>]*>/g);
    if (aTags) {
      const links = content.match(/<Link[^>]*>/g);
      if (!links && aTags.length > 0) {
        issues.push({
          type: 'warning',
          file: relPath,
          message: 'Use Next.js Link component instead of a tag for internal links',
          severity: 'medium'
        });
      }
    }
  }
  
  return issues;
}

// ─── 8. ENVIRONMENT VARIABLES ──────────────────────────────────────

function checkEnvVariables() {
  const issues = [];
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    issues.push({
      type: 'warning',
      file: '.env.local',
      message: 'Missing .env.local file, create from .env.example',
      severity: 'medium'
    });
  }
  
  const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_WAV_API_KEY'];
  
  for (const varName of requiredVars) {
    if (!envContent.includes(varName)) {
      issues.push({
        type: 'error',
        file: '.env.local',
        message: `Missing environment variable: ${varName}`,
        severity: 'high'
      });
    }
  }
  
  return issues;
}

// ─── 9. DEPENDENCIES ՎԱԼԻԴԱՑԻԱ ────────────────────────────────────

function checkDependencies() {
  const issues = [];
  const packagePath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    issues.push({
      type: 'error',
      file: 'package.json',
      message: 'Missing package.json',
      severity: 'high'
    });
    return issues;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Check for outdated dependencies
  try {
    const outdated = execSync('npm outdated --json', { encoding: 'utf8', stdio: 'pipe' });
    if (outdated) {
      const outdatedData = JSON.parse(outdated);
      const outdatedList = Object.keys(outdatedData);
      if (outdatedList.length > 0) {
        issues.push({
          type: 'warning',
          file: 'package.json',
          message: `Outdated dependencies: ${outdatedList.join(', ')}`,
          severity: 'medium'
        });
      }
    }
  } catch (e) {
    // npm outdated might fail if no outdated packages
  }
  
  return issues;
}

// ─── 10. CONSOLE.LOG ՍՏՈՒԳՈՒՄ ────────────────────────────────────

function checkConsoleLogs() {
  const issues = [];
  const files = getAllFiles(APP_DIR, ['.ts', '.tsx', '.js', '.jsx']);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relPath = path.relative(process.cwd(), file);
    
    const consoleLogs = content.match(/console\.(log|info|warn|error)/g);
    if (consoleLogs) {
      issues.push({
        type: 'info',
        file: relPath,
        message: `Console statements found: ${consoleLogs.length}`,
        severity: 'low'
      });
    }
  }
  
  return issues;
}

// ─── 11. ROUTING ՎԱԼԻԴԱՑԻԱ ──────────────────────────────────────

function checkRouting() {
  const issues = [];
  const pageFiles = getAllFiles(APP_DIR, ['page.tsx', 'page.jsx', 'page.js']);
  
  for (const file of pageFiles) {
    const relPath = path.relative(process.cwd(), file);
    const dir = path.dirname(file);
    const route = dir.replace(APP_DIR, '').replace(/\\/g, '/');
    
    // Check if route is valid
    if (route.includes('[') && !route.includes(']')) {
      issues.push({
        type: 'error',
        file: relPath,
        message: `Invalid dynamic route: ${route}`,
        severity: 'high'
      });
    }
  }
  
  return issues;
}

// ─── 12. CSS CLASSES ՎԱԼԻԴԱՑԻԱ ──────────────────────────────────

function checkCssClasses() {
  const issues = [];
  const files = getAllFiles(APP_DIR, ['.tsx', '.jsx']);
  
  const knownClasses = [
    'bg-white', 'bg-black', 'bg-transparent', 'bg-gray', 'bg-red', 'bg-blue', 'bg-green', 'bg-yellow', 'bg-purple', 'bg-pink', 'bg-indigo', 'bg-amber', 'bg-emerald',
    'text-white', 'text-black', 'text-gray', 'text-red', 'text-blue', 'text-green', 'text-yellow', 'text-purple', 'text-pink', 'text-indigo', 'text-amber', 'text-emerald',
    'flex', 'grid', 'block', 'inline', 'hidden', 'relative', 'absolute', 'fixed', 'sticky',
    'p-', 'm-', 'px-', 'py-', 'pt-', 'pb-', 'pl-', 'pr-', 'mx-', 'my-', 'mt-', 'mb-', 'ml-', 'mr-',
    'w-', 'h-', 'min-', 'max-',
    'rounded', 'border', 'shadow', 'ring',
    'hover:', 'focus:', 'active:', 'disabled:',
    'dark:', 'sm:', 'md:', 'lg:', 'xl:',
    'backdrop-blur', 'bg-gradient', 'text-gradient'
  ];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relPath = path.relative(process.cwd(), file);
    
    // Find className strings
    const classNames = content.match(/className="([^"]*)"/g) || [];
    for (const className of classNames) {
      const classes = className.replace(/className="/, '').replace(/"/, '').split(' ');
      for (const cls of classes) {
        // Check if class is likely valid (starts with known prefix or is known)
        const isValid = knownClasses.some(known => cls.startsWith(known) || cls === known);
        if (!isValid && cls.length > 0) {
          // Might be custom class, skip if it's obviously a variable
          if (!cls.includes('{') && !cls.includes('$')) {
            // This is a low priority warning
            issues.push({
              type: 'info',
              file: relPath,
              message: `Possible unknown CSS class: "${cls}"`,
              severity: 'low'
            });
          }
        }
      }
    }
  }
  
  return issues;
}

// ─── 13. SEARCH FOR COMMON PATTERNS ────────────────────────────────

function checkCommonPatterns() {
  const issues = [];
  const files = getAllFiles(APP_DIR, ['.ts', '.tsx', '.js', '.jsx']);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relPath = path.relative(process.cwd(), file);
    
    // 13.1 Check for TODO comments
    const todos = content.match(/\/\/\s*TODO/g);
    if (todos) {
      issues.push({
        type: 'info',
        file: relPath,
        message: `TODO comments: ${todos.length}`,
        severity: 'low'
      });
    }
    
    // 13.2 Check for FIXME comments
    const fixmes = content.match(/\/\/\s*FIXME/g);
    if (fixmes) {
      issues.push({
        type: 'warning',
        file: relPath,
        message: `FIXME comments: ${fixmes.length}`,
        severity: 'medium'
      });
    }
    
    // 13.3 Check for hardcoded strings
    const hardcoded = content.match(/["'][^"']*["']/g);
    if (hardcoded && hardcoded.length > 100) {
      issues.push({
        type: 'info',
        file: relPath,
        message: `Many hardcoded strings: ${hardcoded.length}, consider i18n`,
        severity: 'low'
      });
    }
  }
  
  return issues;
}

// ─── ՕԳՆԱԿԱՆ ՖՈՒՆԿՑԻԱՆԵՐ ──────────────────────────────────────────

function getAllFiles(dir, extensions) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, .git
      if (!['node_modules', '.next', '.git', 'dist', 'build', '__tests__', '.vscode'].includes(item)) {
        results.push(...getAllFiles(fullPath, extensions));
      }
    } else {
      const ext = path.extname(fullPath);
      if (extensions.includes(ext) || extensions.includes(path.basename(fullPath))) {
        results.push(fullPath);
      }
    }
  }
  
  return results;
}

function addIssues(issues, type) {
  for (const issue of issues) {
    if (issue.type === 'error') {
      RESULTS.errors.push(issue);
      RESULTS.summary.totalErrors++;
    } else if (issue.type === 'warning') {
      RESULTS.warnings.push(issue);
      RESULTS.summary.totalWarnings++;
    } else {
      RESULTS.info.push(issue);
      RESULTS.summary.totalInfo++;
    }
    RESULTS.summary.filesChecked++;
  }
}

function printReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 FULL TEST REPORT');
  console.log('='.repeat(70));
  
  const total = RESULTS.errors.length + RESULTS.warnings.length + RESULTS.info.length;
  console.log(`\n📈 Total Issues: ${total}`);
  console.log(`   🔴 Errors: ${RESULTS.errors.length}`);
  console.log(`   🟡 Warnings: ${RESULTS.warnings.length}`);
  console.log(`   🔵 Info: ${RESULTS.info.length}`);
  console.log(`   📁 Files Checked: ${RESULTS.summary.filesChecked}`);
  
  RESULTS.summary.passed = RESULTS.errors.length === 0;
  console.log(`\n${RESULTS.summary.passed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (RESULTS.errors.length > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('🔴 ERRORS');
    console.log('='.repeat(70));
    RESULTS.errors.forEach((err, i) => {
      console.log(`\n${i + 1}. ${err.message}`);
      console.log(`   📄 File: ${err.file}`);
      console.log(`   ⚠️ Severity: ${err.severity}`);
    });
  }
  
  if (RESULTS.warnings.length > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('🟡 WARNINGS');
    console.log('='.repeat(70));
    RESULTS.warnings.forEach((warn, i) => {
      console.log(`\n${i + 1}. ${warn.message}`);
      console.log(`   📄 File: ${warn.file}`);
      console.log(`   ⚠️ Severity: ${warn.severity}`);
    });
  }
  
  if (RESULTS.info.length > 0 && RESULTS.info.length < 20) {
    console.log('\n' + '='.repeat(70));
    console.log('🔵 INFO');
    console.log('='.repeat(70));
    RESULTS.info.slice(0, 20).forEach((info, i) => {
      console.log(`\n${i + 1}. ${info.message}`);
      console.log(`   📄 File: ${info.file}`);
    });
    if (RESULTS.info.length > 20) {
      console.log(`\n... and ${RESULTS.info.length - 20} more info items`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📋 SUMMARY');
  console.log('='.repeat(70));
  console.log(`   Total Files Checked: ${RESULTS.summary.filesChecked}`);
  console.log(`   Total Errors: ${RESULTS.errors.length}`);
  console.log(`   Total Warnings: ${RESULTS.warnings.length}`);
  console.log(`   Total Info: ${RESULTS.info.length}`);
  console.log(`   Status: ${RESULTS.summary.passed ? '✅ PASSED' : '❌ FAILED'}`);
  
  // Write to file
  const reportPath = path.join(process.cwd(), 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(RESULTS, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);
  console.log('='.repeat(70));
}

// ─── RUN ALL TESTS ──────────────────────────────────────────────────

function runAllTests() {
  console.log('🔍 Running full system test...\n');
  
  const startTime = Date.now();
  
  // Run all checks
  console.log('📁 Checking HTML/CSS...');
  addIssues(checkHtmlFiles());
  
  console.log('📁 Checking TypeScript...');
  addIssues(checkTypeScript());
  
  console.log('📁 Checking Imports...');
  addIssues(checkImports());
  
  console.log('📁 Checking Hooks...');
  addIssues(checkHooks());
  
  console.log('📁 Checking Performance...');
  addIssues(checkPerformance());
  
  console.log('📁 Checking Accessibility...');
  addIssues(checkAccessibility());
  
  console.log('📁 Checking Next.js...');
  addIssues(checkNextJs());
  
  console.log('📁 Checking Environment Variables...');
  addIssues(checkEnvVariables());
  
  console.log('📁 Checking Dependencies...');
  addIssues(checkDependencies());
  
  console.log('📁 Checking Console.log...');
  addIssues(checkConsoleLogs());
  
  console.log('📁 Checking Routing...');
  addIssues(checkRouting());
  
  console.log('📁 Checking CSS Classes...');
  addIssues(checkCssClasses());
  
  console.log('📁 Checking Common Patterns...');
  addIssues(checkCommonPatterns());
  
  const endTime = Date.now();
  console.log(`\n⏱️ Test completed in ${(endTime - startTime) / 1000}s`);
  
  printReport();
  
  // Exit with error code if there are errors
  if (RESULTS.errors.length > 0) {
    process.exit(1);
  }
}

// ─── RUN ─────────────────────────────────────────────────────────────

try {
  runAllTests();
} catch (error) {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
}