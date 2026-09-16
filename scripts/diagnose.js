// scripts/diagnose.js
// Գործարկել՝ node scripts/diagnose.js

const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '..', 'src', 'app');
const RESULTS = {
  issues: [],
  summary: {},
  files: {}
};

// ─── 1. ՍՏՈՒԳԵԼ ԲԱՌԱՐԱՆՆԵՐԸ ──────────────────────────────────────

function checkDictionarySorting(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // 1.1 Ստուգել default sortOption-ը
  if (filePath.includes('dictionary/page.tsx')) {
    if (!content.includes('sortOption = "alphabetical"')) {
      issues.push({
        type: 'sorting',
        message: '❌ Dictionary: sortOption-ը DEFAULT-ով alphabetical չէ',
        fix: 'setSortOption("alphabetical")'
      });
    }
    if (content.includes('setSortOption("default")')) {
      issues.push({
        type: 'sorting',
        message: '❌ Dictionary: resetFilters-ում sortOption-ը "default" է, պետք է "alphabetical"',
        fix: 'change "default" to "alphabetical"'
      });
    }
  }
  
  return issues;
}

function checkUserDictionarySource(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  if (filePath.includes('user-dictionary/page.tsx')) {
    // 1.2 Ստուգել JSON-ի աղբյուրը
    if (content.includes('user-dictionary-fixed.json')) {
      issues.push({
        type: 'source',
        message: '✅ User Dictionary: JSON source is correct (user-dictionary-fixed.json)',
        fix: 'OK'
      });
    }
    // 1.3 Ստուգել localStorage-ի աղբյուրը
    if (content.includes('STORAGE_KEYS.USER_WORDS')) {
      const hasLocalStorage = content.includes('localStorage.getItem(STORAGE_KEYS.USER_WORDS)');
      issues.push({
        type: 'source',
        message: hasLocalStorage ? '✅ User Dictionary: localStorage loaded' : '⚠️ User Dictionary: localStorage not checked',
        fix: hasLocalStorage ? 'OK' : 'Add localStorage load'
      });
    }
  }
  return issues;
}

// ─── 2. ՍՏՈՒԳԵԼ ՖՈՆԵՐԸ ──────────────────────────────────────────

function checkBackgroundStyles(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // 2.1 Ստուգել glassmorphism (backdrop-blur)
  if (content.includes('backdrop-blur')) {
    const hasBackdrop = content.includes('backdrop-blur-soft') || content.includes('backdrop-blur-sm');
    if (!hasBackdrop) {
      issues.push({
        type: 'ui',
        message: `⚠️ ${path.basename(filePath)}: No backdrop-blur found (glassmorphism missing)`,
        fix: 'Add backdrop-blur-soft or backdrop-blur-sm'
      });
    }
  }
  
  // 2.2 Ստուգել bg-white/10 կամ bg-transparent
  if (content.includes('bg-white/10') || content.includes('bg-white/5')) {
    // OK - glassmorphism
  } else if (content.includes('bg-gray-') || content.includes('bg-black')) {
    issues.push({
      type: 'ui',
      message: `⚠️ ${path.basename(filePath)}: Solid background found, should use glassmorphism (bg-white/10 or bg-white/5)`,
      fix: 'Replace bg-gray-/bg-black with bg-white/10 or bg-white/5'
    });
  }
  
  return issues;
}

// ─── 3. ՍՏՈՒԳԵԼ showMessage-Ը ────────────────────────────────────

function checkShowMessage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // 3.1 Ստուգել showMessage-ը useNuri-ից
  if (content.includes('const { setPage, showMessage } = useNuri()')) {
    issues.push({
      type: 'critical',
      message: `❌ ${path.basename(filePath)}: showMessage is imported from useNuri (should be local)`,
      fix: 'Use local showMessage with useState and useCallback'
    });
  }
  
  // 3.2 Ստուգել local showMessage
  if (content.includes('const showMessage = useCallback') && 
      content.includes('setToastMessage')) {
    // OK - local showMessage exists
  } else if (!content.includes('showMessage?.(') && !content.includes('showMessage(')) {
    // No showMessage used
  }
  
  return issues;
}

// ─── 4. ՍՏՈՒԳԵԼ WAV_VOICES ──────────────────────────────────────

function checkWavVoices(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  if (content.includes('WAV_VOICES')) {
    if (content.includes('import { getWavClient, WavClient, WAV_VOICES }')) {
      issues.push({
        type: 'critical',
        message: `❌ ${path.basename(filePath)}: WAV_VOICES imported from WavClient (should be removed)`,
        fix: 'Remove WAV_VOICES from import'
      });
    }
  }
  
  return issues;
}

// ─── 5. ՍՏՈՒԳԵԼ WORLD PAGE ──────────────────────────────────────

function checkWorldPage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  if (filePath.includes('world/page.tsx')) {
    // Unit backgrounds
    if (content.includes('bg-white/5') || content.includes('bg-white/10')) {
      // OK
    } else {
      issues.push({
        type: 'ui',
        message: '⚠️ World page: Unit cards may not have glassmorphism',
        fix: 'Use bg-white/5 backdrop-blur-sm for unit cards'
      });
    }
  }
  
  return issues;
}

// ─── 6. ՍՏՈՒԳԵԼ GARDEN PAGE ─────────────────────────────────────

function checkGardenPage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  if (filePath.includes('garden/page.tsx')) {
    // Shop items backgrounds
    if (content.includes('bg-transparent dark:bg-gray-900')) {
      // OK
    } else {
      issues.push({
        type: 'ui',
        message: '⚠️ Garden page: Shop items may not have glassmorphism',
        fix: 'Use bg-transparent dark:bg-gray-900 with backdrop-blur'
      });
    }
  }
  
  return issues;
}

// ─── 7. ՍՏՈՒԳԵԼ DIALOGUES PAGE ──────────────────────────────────

function checkDialoguesPage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  if (filePath.includes('dialogues/page.tsx')) {
    // Dialogue cards
    if (content.includes('bg-transparent dark:bg-gray-900')) {
      // OK
    } else {
      issues.push({
        type: 'ui',
        message: '⚠️ Dialogues page: Dialogue cards may not have glassmorphism',
        fix: 'Use bg-transparent dark:bg-gray-900 border'
      });
    }
  }
  
  return issues;
}

// ─── 8. ՍՏՈՒԳԵԼ CURRICULUM PAGE ──────────────────────────────────

function checkCurriculumPage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  if (filePath.includes('curriculum/page.tsx')) {
    // World cards
    if (content.includes('bg-transparent dark:bg-gray-900')) {
      // OK
    } else {
      issues.push({
        type: 'ui',
        message: '⚠️ Curriculum page: World cards may not have glassmorphism',
        fix: 'Use bg-transparent dark:bg-gray-900'
      });
    }
  }
  
  return issues;
}

// ─── 9. ՍՏՈՒԳԵԼ LEARN PAGE ──────────────────────────────────────

function checkLearnPage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  if (filePath.includes('learn/page.tsx')) {
    // Exercise card
    if (content.includes('bg-transparent dark:bg-gray-900/80')) {
      // OK
    } else {
      issues.push({
        type: 'ui',
        message: '⚠️ Learn page: Exercise card may not have glassmorphism',
        fix: 'Use bg-transparent dark:bg-gray-900/80'
      });
    }
    
    // difficulty check
    if (content.includes('current.difficulty')) {
      issues.push({
        type: 'critical',
        message: '❌ Learn page: difficulty property used but MultiExercise does not have it',
        fix: 'Remove current.difficulty block'
      });
    }
  }
  
  return issues;
}

// ─── 10. ՍՏՈՒԳԵԼ HOME PAGE ──────────────────────────────────────

function checkHomePage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  if (filePath.includes('page.tsx') && !filePath.includes('/app/') || filePath === path.join(APP_DIR, 'page.tsx')) {
    // Stats type
    if (!content.includes('interface HomeStats')) {
      issues.push({
        type: 'critical',
        message: '❌ Home page: HomeStats interface missing',
        fix: 'Add interface HomeStats { streak: number; totalHAYQ: number; hearts: number; hasStarted: boolean; dailyProgress: number; dailyGoal: number; }'
      });
    }
  }
  
  return issues;
}

// ─── ԳԼԽԱՎՈՐ ───────────────────────────────────────────────────────

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const issues = [];
      
      // Run all checks
      issues.push(...checkDictionarySorting(fullPath));
      issues.push(...checkUserDictionarySource(fullPath));
      issues.push(...checkBackgroundStyles(fullPath));
      issues.push(...checkShowMessage(fullPath));
      issues.push(...checkWavVoices(fullPath));
      issues.push(...checkWorldPage(fullPath));
      issues.push(...checkGardenPage(fullPath));
      issues.push(...checkDialoguesPage(fullPath));
      issues.push(...checkCurriculumPage(fullPath));
      issues.push(...checkLearnPage(fullPath));
      issues.push(...checkHomePage(fullPath));
      
      if (issues.length > 0) {
        RESULTS.files[fullPath] = issues;
        RESULTS.issues.push(...issues.map(i => ({ ...i, file: fullPath })));
      }
    }
  }
}

// ─── RUN ─────────────────────────────────────────────────────────────

console.log('🔍 Scanning src/app for issues...\n');
scanDirectory(APP_DIR);

// ─── SUMMARY ────────────────────────────────────────────────────────

console.log('='.repeat(60));
console.log('📊 DIAGNOSTIC REPORT');
console.log('='.repeat(60));

const critical = RESULTS.issues.filter(i => i.type === 'critical');
const ui = RESULTS.issues.filter(i => i.type === 'ui');
const sorting = RESULTS.issues.filter(i => i.type === 'sorting');
const source = RESULTS.issues.filter(i => i.type === 'source');

console.log(`\n📈 Total Issues: ${RESULTS.issues.length}`);
console.log(`   🔴 Critical: ${critical.length}`);
console.log(`   🎨 UI: ${ui.length}`);
console.log(`   📊 Sorting: ${sorting.length}`);
console.log(`   📁 Source: ${source.length}`);

console.log('\n' + '='.repeat(60));
console.log('📋 DETAILED ISSUES');
console.log('='.repeat(60));

RESULTS.issues.forEach((issue, index) => {
  const icon = issue.type === 'critical' ? '🔴' : 
               issue.type === 'ui' ? '🎨' : 
               issue.type === 'sorting' ? '📊' : '📁';
  console.log(`\n${icon} [${index + 1}] ${issue.message}`);
  console.log(`   📄 File: ${path.basename(issue.file)}`);
  console.log(`   🔧 Fix: ${issue.fix}`);
});

console.log('\n' + '='.repeat(60));
console.log('📁 FILES WITH ISSUES');
console.log('='.repeat(60));

Object.keys(RESULTS.files).forEach(file => {
  const issues = RESULTS.files[file];
  console.log(`\n📄 ${path.basename(file)} (${issues.length} issues)`);
  issues.forEach(i => {
    console.log(`   ${i.type === 'critical' ? '🔴' : '⚠️'} ${i.message}`);
  });
});

console.log('\n' + '='.repeat(60));
console.log('✅ Done!');