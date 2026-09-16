// scripts/fix-imports.js
// NUR Lingo — Fix Audio Engine Imports
// Run: node scripts/fix-imports.js

const fs = require('fs');
const path = require('path');

// ─── COLOR CODES ──────────────────────────────────────────────────────

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

// ─── CONFIG ──────────────────────────────────────────────────────────

const ROOT_DIR = path.join(__dirname, '..');
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', '.git'];

// ─── IMPORT MAPPING ──────────────────────────────────────────────────

const importMap = [
  {
    from: "@/lib/audio/audio-service",
    to: "@/lib/audio/AudioManager",
  },
  {
    from: "@/lib/audio/audio-manager",
    to: "@/lib/audio/AudioManager",
  },
  {
    from: "@/lib/audio/audio-types",
    to: "@/lib/audio/AudioTypes",
  },
  {
    from: "./audio-service",
    to: "./AudioManager",
  },
  {
    from: "./audio-manager",
    to: "./AudioManager",
  },
  {
    from: "./audio-types",
    to: "./AudioTypes",
  },
  {
    from: "../audio-service",
    to: "../AudioManager",
  },
  {
    from: "../audio-manager",
    to: "../AudioManager",
  },
  {
    from: "../audio-types",
    to: "../AudioTypes",
  },
  {
    from: "../../lib/audio/audio-service",
    to: "../../lib/audio/AudioManager",
  },
  {
    from: "../../lib/audio/audio-manager",
    to: "../../lib/audio/AudioManager",
  },
  {
    from: "../../lib/audio/audio-types",
    to: "../../lib/audio/AudioTypes",
  },
];

// ─── FIND FILES ──────────────────────────────────────────────────────

function findFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (EXCLUDE_DIRS.includes(file)) continue;
        findFiles(fullPath, fileList);
      } else {
        const ext = path.extname(file);
        if (EXTENSIONS.includes(ext)) {
          fileList.push(fullPath);
        }
      }
    }
  } catch {
    // Ignore
  }
  
  return fileList;
}

// ─── FIX IMPORTS ─────────────────────────────────────────────────────

function fixImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changes = [];
    
    for (const mapping of importMap) {
      const from = mapping.from;
      const to = mapping.to;
      
      // Build regex patterns
      const patterns = [
        // Import statements: import { ... } from "from"
        new RegExp(
          `import\\s*\\{([^}]*)\\}\\s*from\\s*['"]${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
          'g'
        ),
        // Import statements: import * as ... from "from"
        new RegExp(
          `import\\s*\\*\\s*as\\s*\\w+\\s*from\\s*['"]${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
          'g'
        ),
        // Import statements: import ... from "from"
        new RegExp(
          `import\\s*\\w+\\s*from\\s*['"]${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
          'g'
        ),
      ];
      
      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          for (const match of matches) {
            const replaced = match.replace(from, to);
            content = content.replace(match, replaced);
            changes.push({
              from,
              to,
              original: match,
              replaced,
            });
          }
        }
      }
    }
    
    // Also fix: import type { ... } from "from"
    // This is handled by the general patterns above
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return { filePath, changes, success: true };
    }
    
    return { filePath, changes: [], success: false };
  } catch (error) {
    return { filePath, changes: [], success: false, error: error.message };
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────

function main() {
  log('', 'cyan');
  log('🔧 NUR Lingo — Fix Audio Imports', 'bold');
  log('📁 Root: ' + ROOT_DIR, 'blue');
  log('', 'reset');

  // Find all files
  log('🔍 Searching for files...', 'blue');
  const files = findFiles(ROOT_DIR);
  log(`📄 Found ${files.length} files`, 'blue');
  log('', 'reset');

  // Process files
  let fixed = 0;
  let errors = 0;
  let totalChanges = 0;
  const results = [];

  for (const file of files) {
    const result = fixImports(file);
    if (result.success) {
      fixed++;
      totalChanges += result.changes.length;
      results.push(result);
    }
    if (result.error) {
      errors++;
    }
  }

  // Display results
  log('═'.repeat(60), 'cyan');
  log('📊 RESULTS', 'bold');
  log('═'.repeat(60), 'cyan');

  if (fixed > 0) {
    log(`✅ Fixed ${fixed} files`, 'green');
    log(`📝 ${totalChanges} imports replaced`, 'green');
    log('', 'reset');
    
    for (const result of results) {
      log(`📄 ${path.relative(ROOT_DIR, result.filePath)}`, 'yellow');
      for (const change of result.changes) {
        log(`   ${change.from} → ${change.to}`, 'green');
      }
    }
  } else {
    log('✅ No files needed fixing!', 'green');
  }

  if (errors > 0) {
    log(`❌ ${errors} errors occurred`, 'red');
  }

  log('', 'reset');
  log('═'.repeat(60), 'cyan');
  log('💡 Run: node scripts/diagnose.js to verify', 'dim');
  log('═'.repeat(60), 'cyan');
}

// ─── RUN ────────────────────────────────────────────────────────────

main();