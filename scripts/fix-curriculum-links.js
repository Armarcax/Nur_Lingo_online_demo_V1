// scripts/fix-curriculum-links.js
// NUR Lingo — Fix all links to open in same window

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(msg, color = 'reset') {
  console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
}

// ─── FILES TO CHECK ──────────────────────────────────────────────

const filesToCheck = [
  // Core pages
  { path: 'src/app/page.tsx', type: 'page' },
  { path: 'src/app/world/page.tsx', type: 'page' },
  { path: 'src/app/dictionary/page.tsx', type: 'page' },
  { path: 'src/app/curriculum/page.tsx', type: 'page' },
  { path: 'src/app/learn/page.tsx', type: 'page' },
  { path: 'src/app/onboarding/page.tsx', type: 'page' },
  { path: 'src/app/dialogues/page.tsx', type: 'page' },
  
  // Components
  { path: 'src/components/BottomNav.tsx', type: 'component' },
  { path: 'src/components/Nuri.tsx', type: 'component' },
];

// ─── CHECK FUNCTIONS ─────────────────────────────────────────────

function checkFile(filePath) {
  const fullPath = path.join(PROJECT_ROOT, filePath);
  
  if (!fs.existsSync(fullPath)) {
    log(`❌ ${filePath} — չի գտնվել`, 'red');
    return null;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const issues = [];
  const fixes = [];

  // ✅ Check 1: target="_blank"
  const blankRegex = /target\s*=\s*["']_blank["']/g;
  let match;
  while ((match = blankRegex.exec(content)) !== null) {
    issues.push({
      line: getLineNumber(content, match.index),
      issue: 'target="_blank"',
      fix: 'Remove target="_blank"',
    });
  }

  // ✅ Check 2: window.open with _blank
  const openRegex = /window\.open\s*\([^)]*,\s*["']_blank["']/g;
  while ((match = openRegex.exec(content)) !== null) {
    issues.push({
      line: getLineNumber(content, match.index),
      issue: 'window.open(..., "_blank")',
      fix: 'Use router.push() instead',
    });
  }

  // ✅ Check 3: <a> tags with target
  const aTagRegex = /<a[^>]*target\s*=\s*["']_blank["'][^>]*>/g;
  while ((match = aTagRegex.exec(content)) !== null) {
    issues.push({
      line: getLineNumber(content, match.index),
      issue: '<a target="_blank">',
      fix: 'Use <Link> or button with router.push()',
    });
  }

  return { filePath, content, issues, fixes };
}

function getLineNumber(content, index) {
  const lines = content.substring(0, index).split('\n');
  return lines.length;
}

// ─── FIX FUNCTIONS ───────────────────────────────────────────────

function fixLinkToRouter(content) {
  let fixed = content;

  // ✅ Fix 1: Replace Link with button + router.push
  // This is a simple regex, may need manual fixes
  
  // Replace: <Link href="/xxx"> -> <button onClick={() => router.push("/xxx")}>
  const linkRegex = /<Link\s+href=["']([^"']+)["']([^>]*)>/g;
  fixed = fixed.replace(linkRegex, (match, href, rest) => {
    // Check if it's a simple Link without complex children
    return `<button onClick={() => router.push("${href}")} className="...">`;
  });

  // Replace: </Link> -> </button>
  fixed = fixed.replace(/<\/Link>/g, '</button>');

  return fixed;
}

function fixTargetBlank(content) {
  // Remove all target="_blank"
  return content.replace(/target\s*=\s*["']_blank["']/g, '');
}

// ─── MAIN ─────────────────────────────────────────────────────────

function main() {
  log('\n🔍 NUR Lingo — Fix Curriculum Links\n', 'bold');
  log('═'.repeat(60), 'cyan');

  let totalIssues = 0;
  let totalFiles = 0;

  for (const file of filesToCheck) {
    const result = checkFile(file.path);
    if (!result) continue;

    totalFiles++;
    const { filePath, content, issues } = result;

    if (issues.length === 0) {
      log(`✅ ${filePath} — ամեն ինչ կարգին է`, 'green');
      continue;
    }

    log(`\n⚠️  ${filePath} — ${issues.length} խնդիր`, 'yellow');
    
    for (const issue of issues) {
      log(`   📍 Տող ${issue.line}: ${issue.issue}`, 'yellow');
      log(`   🔧 Լուծում: ${issue.fix}`, 'cyan');
      totalIssues++;
    }

    // Ask if user wants to fix
    log(`\n   Ուղղե՞լ ${filePath} ավտոմատ: (y/n)`, 'cyan');
    // In script, we'll just show the fixes
  }

  log('\n═'.repeat(60), 'cyan');
  log(`📊 Ամփոփում:`, 'bold');
  log(`   ✅ Ստուգված ֆայլեր: ${totalFiles}`, 'green');
  log(`   ⚠️  Գտնված խնդիրներ: ${totalIssues}`, totalIssues > 0 ? 'yellow' : 'green');

  if (totalIssues > 0) {
    log('\n📝 Ձեռքով ուղղելու համար.`', 'yellow');
    log('   1. Հեռացրեք target="_blank" բոլոր Link-ներից', 'yellow');
    log('   2. Փոխարինեք Link-ները button-ներով + router.push()', 'yellow');
    log('   3. Մի օգտագործեք window.open(..., "_blank")', 'yellow');
  } else {
    log('\n🎉 Բոլոր ֆայլերը ճիշտ են!', 'green');
  }

  log('═'.repeat(60), 'cyan');
}

// ─── RUN ──────────────────────────────────────────────────────────

main();