// scripts/diagnose.js
// NUR Lingo — Ամբողջական ախտորոշիչ սկրիպտ
// Run: node scripts/diagnose.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── COLOR CODES ──────────────────────────────────────────────────────

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function header(title) {
  console.log('');
  log('═'.repeat(60), 'cyan');
  log(`  ${title}`, 'cyan');
  log('═'.repeat(60), 'cyan');
}

function success(msg) { log(`✅ ${msg}`, 'green'); }
function error(msg) { log(`❌ ${msg}`, 'red'); }
function warn(msg) { log(`⚠️  ${msg}`, 'yellow'); }
function info(msg) { log(`ℹ️  ${msg}`, 'blue'); }
function detail(msg) { log(`   ${msg}`, 'dim'); }

// ─── HELPERS ──────────────────────────────────────────────────────────

function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

function readJSON(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch {
    return null;
  }
}

function countFiles(dir, ext) {
  try {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) return 0;
    const files = fs.readdirSync(fullPath);
    return files.filter(f => f.endsWith(ext)).length;
  } catch {
    return 0;
  }
}

function getDirSize(dir) {
  try {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) return 0;
    let size = 0;
    const walk = (p) => {
      const stats = fs.statSync(p);
      if (stats.isDirectory()) {
        fs.readdirSync(p).forEach(f => walk(path.join(p, f)));
      } else {
        size += stats.size;
      }
    };
    walk(fullPath);
    return size;
  } catch {
    return 0;
  }
}

// ─── 1. CHECK DEPENDENCIES ───────────────────────────────────────────

function checkDependencies() {
  header('📦 1. ԿԱԽՎԱԾՈՒԹՅՈՒՆՆԵՐ (Dependencies)');

  const packageJson = readJSON('package.json');
  if (!packageJson) {
    error('package.json չի գտնվել');
    return;
  }

  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const required = [
    'next', 'react', 'react-dom', 'framer-motion', 'lucide-react',
    'tailwindcss', 'postcss', 'autoprefixer', 'typescript',
    '@supabase/supabase-js', 'tailwindcss-animate'
  ];

  let missing = [];
  for (const dep of required) {
    if (!deps[dep]) {
      missing.push(dep);
    }
  }

  if (missing.length === 0) {
    success('Բոլոր անհրաժեշտ փաթեթները տեղադրված են');
  } else {
    warn('Բացակայում են հետևյալ փաթեթները:');
    for (const dep of missing) {
      detail(`   ${dep}`);
    }
    info(`   Տեղադրելու համար: npm install ${missing.join(' ')}`);
  }

  // Check node_modules
  const hasNodeModules = fs.existsSync(path.join(__dirname, '..', 'node_modules'));
  if (hasNodeModules) {
    const count = fs.readdirSync(path.join(__dirname, '..', 'node_modules')).length;
    success(`node_modules կա (${count} փաթեթ)`);
  } else {
    error('node_modules չի գտնվել');
  }
}

// ─── 2. CHECK JSON FILES ─────────────────────────────────────────────

function checkJSONFiles() {
  header('📂 2. JSON ՖԱՅԼԵՐ');

  const files = [
    { path: 'data/dictionaries/unified-dictionary.json', name: 'Unified Dictionary' },
    { path: 'public/audio/manifest.json', name: 'Audio Manifest' },
    { path: 'tsconfig.json', name: 'TypeScript Config' },
    { path: 'tailwind.config.js', name: 'Tailwind Config' },
  ];

  for (const file of files) {
    const exists = fileExists(file.path);
    if (exists) {
      const stats = fs.statSync(path.join(__dirname, '..', file.path));
      const size = (stats.size / 1024).toFixed(1);
      success(`${file.name} — ${size} KB`);
    } else {
      error(`${file.name} — ՉԻ ԳՏՆՎԵԼ`);
    }
  }

  // Check dictionary content
  const dict = readJSON('data/dictionaries/unified-dictionary.json');
  if (dict && Array.isArray(dict)) {
    success(`Dictionary-ում կա ${dict.length} բառ`);
    // Check for entries with missing fields
    let missingFields = 0;
    for (const entry of dict) {
      if (!entry.id || !entry.hy || !entry.en || !entry.ru) {
        missingFields++;
      }
    }
    if (missingFields > 0) {
      warn(`${missingFields} բառերի մոտ բացակայում են դաշտեր`);
    }

    // Check audio field
    const hasAudio = dict.filter(e => e.audio).length;
    const hasAudioHy = dict.filter(e => e.audio?.hy).length;
    const hasAudioEn = dict.filter(e => e.audio?.en).length;
    const hasAudioRu = dict.filter(e => e.audio?.ru).length;
    info(`   🎵 Audio: hy=${hasAudioHy}, en=${hasAudioEn}, ru=${hasAudioRu}`);
    if (hasAudioHy === 0) {
      warn('   🇦🇲 Հայերենի աուդիո URL-ները բացակայում են JSON-ում');
    }
  } else {
    error('Dictionary-ը չի կարող բեռնվել կամ դատարկ է');
  }
}

// ─── 3. CHECK AUDIO FILES ────────────────────────────────────────────

function checkAudioFiles() {
  header('🔊 3. ԱՈՒԴԻՈ ՖԱՅԼԵՐ');

  const langs = ['hy', 'en', 'ru'];
  const audioDir = 'public/audio';

  for (const lang of langs) {
    const dir = `${audioDir}/${lang}`;
    const count = countFiles(dir, '.mp3');
    const size = (getDirSize(dir) / 1024 / 1024).toFixed(1);
    if (count > 0) {
      success(`${lang.toUpperCase()}: ${count} ֆայլ, ${size} MB`);
    } else {
      error(`${lang.toUpperCase()}: 0 ֆայլ`);
    }
  }

  // Check manifest
  const manifest = readJSON('public/audio/manifest.json');
  if (manifest) {
    const stats = manifest.stats || {};
    for (const lang of langs) {
      const s = stats[lang] || {};
      const ready = s.ready || 0;
      const missing = s.missing || 0;
      const total = s.total || 0;
      if (missing > 0) {
        warn(`${lang.toUpperCase()}: ${ready} ready, ${missing} missing (${total} total)`);
      } else if (total > 0) {
        success(`${lang.toUpperCase()}: ${ready} ready`);
      } else {
        warn(`${lang.toUpperCase()}: manifest-ում չկա`);
      }
    }
  } else {
    error('manifest.json չի գտնվել');
  }
}

// ─── 4. CHECK TYPESCRIPT ─────────────────────────────────────────────

function checkTypeScript() {
  header('📝 4. TYPESCRIPT');

  const tsconfig = readJSON('tsconfig.json');
  if (!tsconfig) {
    error('tsconfig.json չի գտնվել');
    return;
  }

  success('tsconfig.json գոյություն ունի');

  // Check source files
  const srcFiles = countFiles('src', '.tsx') + countFiles('src', '.ts');
  const totalTsFiles = countFiles('src', '.tsx') + countFiles('src', '.ts') + countFiles('src', '.jsx');
  if (srcFiles > 0) {
    success(`TypeScript ֆայլեր: ${srcFiles}`);
  } else {
    warn('TypeScript ֆայլեր չեն գտնվել');
  }

  // Try to run tsc --noEmit
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
      timeout: 30000
    });
    success('TypeScript-ի ստուգումը հաջող է');
  } catch (e) {
    const output = e.stdout?.toString() || e.stderr?.toString() || '';
    const errorCount = (output.match(/error TS/g) || []).length;
    if (errorCount > 0) {
      warn(`TypeScript-ի ${errorCount} սխալ`);
      // Show first 5 errors
      const lines = output.split('\n').filter(l => l.includes('error TS')).slice(0, 5);
      for (const line of lines) {
        detail(`   ${line.trim()}`);
      }
      if (errorCount > 5) {
        detail(`   ... և ${errorCount - 5} ավելին`);
      }
    } else {
      success('TypeScript-ի ստուգումը հաջող է');
    }
  }
}

// ─── 5. CHECK ENVIRONMENT ────────────────────────────────────────────

function checkEnvironment() {
  header('🔐 5. ENVIRONMENT VARIABLES');

  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    success('.env.local գոյություն ունի');
    const content = fs.readFileSync(envPath, 'utf8');
    const vars = content.split('\n').filter(l => l.includes('=') && !l.startsWith('#'));
    for (const v of vars) {
      const [key, val] = v.split('=');
      if (val && val.length > 0) {
        detail(`   ${key}=${val.slice(0, 10)}${val.length > 10 ? '...' : ''}`);
      } else {
        warn(`   ${key}= (դատարկ)`);
      }
    }
  } else {
    warn('.env.local չի գտնվել');
    info('   Ստեղծեք .env.local ֆայլ հետևյալ փոփոխականներով:');
    detail('   NEXT_PUBLIC_SUPABASE_URL=your_url');
    detail('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
  }

  // Check required env vars
  const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  let missingVars = [];
  for (const v of requiredVars) {
    if (!process.env[v]) {
      missingVars.push(v);
    }
  }
  if (missingVars.length === 0) {
    success('Բոլոր անհրաժեշտ env vars-երը կան');
  } else {
    warn('Բացակայում են:');
    for (const v of missingVars) {
      detail(`   ${v}`);
    }
  }
}

// ─── 6. CHECK NEXT.JS ───────────────────────────────────────────────

function checkNextJS() {
  header('⚡ 6. NEXT.JS');

  const packageJson = readJSON('package.json');
  if (packageJson) {
    const nextVersion = packageJson.dependencies?.next || 'unknown';
    success(`Next.js version: ${nextVersion}`);
  }

  // Check .next folder
  const hasNext = fs.existsSync(path.join(__dirname, '..', '.next'));
  if (hasNext) {
    const size = (getDirSize('.next') / 1024 / 1024).toFixed(1);
    success(`.next կա (${size} MB)`);
  } else {
    warn('.next չկա — պետք է build անել');
  }

  // Check pages
  const pages = countFiles('src/app', '.tsx');
  success(`${pages} էջ src/app/-ում`);
}

// ─── 7. CHECK COMPONENTS ─────────────────────────────────────────────

function checkComponents() {
  header('🧩 7. COMPONENTS');

  const components = [
    'src/components/Nuri.tsx',
    'src/components/BottomNav.tsx',
    'src/components/UserRecordingButton.tsx',
    'src/components/InteractiveDialogue.tsx',
  ];

  for (const comp of components) {
    if (fileExists(comp)) {
      const stats = fs.statSync(path.join(__dirname, '..', comp));
      const size = (stats.size / 1024).toFixed(1);
      success(`${path.basename(comp)} — ${size} KB`);
    } else {
      error(`${path.basename(comp)} — ՉԻ ԳՏՆՎԵԼ`);
    }
  }
}

// ─── 8. CHECK HOOKS ──────────────────────────────────────────────────

function checkHooks() {
  header('🪝 8. HOOKS');

  const hooks = [
    'src/lib/hooks/useAudio.ts',
    'src/lib/hooks/useAudioManager.ts',
    'src/lib/hooks/useAudioRecorder.ts',
  ];

  for (const hook of hooks) {
    if (fileExists(hook)) {
      success(`${path.basename(hook)} — ✅`);
    } else {
      warn(`${path.basename(hook)} — ❌`);
    }
  }
}

// ─── 9. CHECK AUDIO ENGINE ───────────────────────────────────────────

function checkAudioEngine() {
  header('🎵 9. AUDIO ENGINE');

  const files = [
    'src/lib/audio/AudioManager.ts',
    'src/lib/audio/AudioCache.ts',
    'src/lib/audio/AudioManifest.ts',
    'src/lib/audio/AudioProviders.ts',
    'src/lib/audio/AudioQueue.ts',
    'src/lib/audio/AudioSettings.ts',
    'src/lib/audio/audio-types.ts',
  ];

  let missing = 0;
  for (const file of files) {
    if (fileExists(file)) {
      success(`${path.basename(file)} — ✅`);
    } else {
      error(`${path.basename(file)} — ❌`);
      missing++;
    }
  }

  if (missing === 0) {
    success('Audio Engine-ի բոլոր ֆայլերը կան');
  } else {
    warn(`${missing} ֆայլ բացակայում է`);
  }
}

// ─── 10. SUMMARY ─────────────────────────────────────────────────────

function summary() {
  header('📊 10. ԱՄՓՈՓՈՒՄ');

  // Check all categories
  const issues = [];

  // Dictionary
  const dict = readJSON('data/dictionaries/unified-dictionary.json');
  if (!dict || !Array.isArray(dict) || dict.length === 0) {
    issues.push('Dictionary-ը դատարկ է կամ չի բեռնվում');
  } else {
    const hasAudioHy = dict.filter(e => e.audio?.hy).length;
    if (hasAudioHy === 0) {
      issues.push('🇦🇲 Հայերենի աուդիո URL-ները բացակայում են JSON-ում');
    }
  }

  // Audio files
  const hyCount = countFiles('public/audio/hy', '.mp3');
  if (hyCount === 0) {
    issues.push('🇦🇲 Հայերենի աուդիո ֆայլեր չկան public/audio/hy/-ում');
  }

  // Dependencies
  const packageJson = readJSON('package.json');
  if (packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    if (!deps['lucide-react']) issues.push('lucide-react փաթեթը բացակայում է');
    if (!deps['tailwindcss-animate']) issues.push('tailwindcss-animate փաթեթը բացակայում է');
  }

  // TypeScript
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
      timeout: 30000
    });
  } catch (e) {
    const output = e.stdout?.toString() || e.stderr?.toString() || '';
    const errorCount = (output.match(/error TS/g) || []).length;
    if (errorCount > 0) {
      issues.push(`TypeScript-ի ${errorCount} սխալ`);
    }
  }

  // Display summary
  if (issues.length === 0) {
    log('🎉 ԱՄԵՆ ԻՆՉ ԿԱՐԳԻՆ Է!', 'green');
    log('   Բոլոր համակարգերը աշխատում են նորմալ:', 'dim');
  } else {
    log('⚠️  ՀԱՅՏՆԱԲԵՐՎԵԼ ԵՆ ՀԵՏԵՎՅԱԼ ԽՆԴԻՐՆԵՐԸ:', 'yellow');
    for (let i = 0; i < issues.length; i++) {
      log(`   ${i + 1}. ${issues[i]}`, 'yellow');
    }
  }

  log('');
  log('═'.repeat(60), 'cyan');
  log('  Խորհուրդ. ուղղեք վերը նշված խնդիրները և նորից գործարկեք', 'dim');
  log('═'.repeat(60), 'cyan');
}

// ─── MAIN ─────────────────────────────────────────────────────────────

function main() {
  log('');
  log('🔍 NUR Lingo — Ամբողջական ախտորոշում', 'bold');
  log(`📅 ${new Date().toLocaleString()}`, 'dim');
  log('');

  checkDependencies();
  checkJSONFiles();
  checkAudioFiles();
  checkTypeScript();
  checkEnvironment();
  checkNextJS();
  checkComponents();
  checkHooks();
  checkAudioEngine();
  summary();
}

// ─── RUN ─────────────────────────────────────────────────────────────

main();