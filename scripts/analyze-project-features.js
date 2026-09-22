#!/usr/bin/env node
/**
 * NUR Lingo — Project Functional Map
 *
 * Read-only analyzer. Generates a comprehensive functional documentation
 * of the entire project: pages, components, APIs, content systems, etc.
 *
 * Usage: node scripts/analyze-project-features.js
 *
 * Output:
 *   project-analysis/01-overview.md
 *   project-analysis/02-pages.md
 *   project-analysis/03-api-routes.md
 *   project-analysis/04-components.md
 *   project-analysis/05-content-system.md
 *   project-analysis/06-audio-system.md
 *   project-analysis/07-i18n-system.md
 *   project-analysis/08-features.md
 *   project-analysis/09-architecture.md
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'project-analysis');

// ─── HELPERS ────────────────────────────────────────────────────────

function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

function writeOut(filename, content) {
  const fullPath = path.join(OUT, filename);
  fs.writeFileSync(fullPath, content, 'utf8');
  const kb = (Buffer.byteLength(content, 'utf8') / 1024).toFixed(1);
  console.log(`   📄 ${filename} (${kb} KB)`);
}

function readFile(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

function walk(dir, extensions = ['.ts', '.tsx', '.js', '.jsx', '.json']) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (
      entry.name === 'node_modules' ||
      entry.name === '.next' ||
      entry.name === '.git' ||
      entry.name === 'project-analysis'
    ) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(fullPath, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function relPath(p) {
  return p.replace(ROOT + path.sep, '').replace(/\\/g, '/');
}

function sizeKB(p) {
  try {
    return (fs.statSync(p).size / 1024).toFixed(1);
  } catch {
    return '?';
  }
}

function extractLines(content, pattern, max = 30) {
  const results = [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      results.push({ line: i + 1, text: lines[i].trim() });
      if (results.length >= max) break;
    }
  }
  return results;
}

function extractDescription(content) {
  // Try to find a docstring or comment at the top
  const match = content.match(/^\/\*\*([\s\S]*?)\*\//);
  if (match) {
    return match[1]
      .split('\n')
      .map((l) => l.replace(/^\s*\*\s?/, '').trim())
      .filter(Boolean)
      .slice(0, 3)
      .join(' ');
  }
  return '';
}

// ─── 1. OVERVIEW ────────────────────────────────────────────────────

function writeOverview() {
  let md = `# NUR Lingo — Project Functional Overview\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;
  md += `## What is NUR Lingo?\n\n`;
  md += `AI-native Armenian ↔ English ↔ Russian language learning platform.\n\n`;
  md += `**Core features:**\n`;
  md += `- 6 learning directions (hy-en, en-hy, ru-hy, hy-ru, en-ru, ru-en)\n`;
  md += `- 90 lessons across 10 "worlds" (curriculum)\n`;
  md += `- Two modes: Amateur (dynamic) + Professional (pre-built content)\n`;
  md += `- Offline audio support (6,837 audio files)\n`;
  md += `- Gamification: HAYQ rewards, hearts, streaks, crowns, achievements\n`;
  md += `- Interactive dialogues with Nuri mascot\n`;
  md += `- i18n: 3 languages (hy, en, ru)\n`;
  md += `- PWA: Service Worker + offline caching\n\n`;

  md += `## Directory Structure\n\n`;
  md += '```\n';
  md += `src/\n`;
  md += `├── app/                    # Next.js app router (pages + API)\n`;
  md += `├── components/             # React components\n`;
  md += `├── hooks/                  # React hooks (client)\n`;
  md += `├── lib/                    # Core logic\n`;
  md += `│   ├── audio/              # Audio engines\n`;
  md += `│   ├── content/            # Curriculum builders\n`;
  md += `│   ├── hayq/               # HAYQ blockchain rewards\n`;
  md += `│   ├── hooks/              # Internal hooks\n`;
  md += `│   ├── i18n/               # Internationalization\n`;
  md += `│   ├── lessons/            # Lesson engine\n`;
  md += `│   ├── lexicon/            # Dictionary\n`;
  md += `│   ├── nlp/                # Morphology\n`;
  md += `│   ├── offline/            # Offline support\n`;
  md += `│   └── rewards/            # Gamification\n`;
  md += `└── config/                 # App configuration\n`;
  md += '```\n\n';

  md += `## Statistics\n\n`;
  const stats = collectStats();
  md += `| Metric | Count |\n`;
  md += `|---|---|\n`;
  md += `| Pages (tsx) | ${stats.pages} |\n`;
  md += `| API Routes | ${stats.apiRoutes} |\n`;
  md += `| Components | ${stats.components} |\n`;
  md += `| Hooks | ${stats.hooks} |\n`;
  md += `| Lib Modules | ${stats.libModules} |\n`;
  md += `| Content Builders | ${stats.builders} |\n`;
  md += `| Total TS/TSX Files | ${stats.total} |\n`;
  md += `| Total Lines | ${stats.totalLines} |\n\n`;

  writeOut('01-overview.md', md);
}

function collectStats() {
  const appFiles = walk(path.join(ROOT, 'src', 'app'));
  const libFiles = walk(path.join(ROOT, 'src', 'lib'));
  const compFiles = walk(path.join(ROOT, 'src', 'components'));
  const hooksFiles = walk(path.join(ROOT, 'src', 'hooks'));

  const pages = appFiles.filter(
    (f) => f.endsWith('page.tsx') || f.endsWith('page.jsx')
  ).length;
  const apiRoutes = appFiles.filter(
    (f) => f.endsWith('route.ts') || f.endsWith('route.js')
  ).length;

  let totalLines = 0;
  const allFiles = [...appFiles, ...libFiles, ...compFiles, ...hooksFiles];
  for (const f of allFiles) {
    totalLines += readFile(f).split('\n').length;
  }

  return {
    pages,
    apiRoutes,
    components: compFiles.length,
    hooks: hooksFiles.length,
    libModules: libFiles.length,
    builders: walk(path.join(ROOT, 'src', 'lib', 'content', 'builders')).length,
    total: allFiles.length,
    totalLines,
  };
}

// ─── 2. PAGES ───────────────────────────────────────────────────────

function writePages() {
  let md = `# Pages & Routes\n\n`;
  md += `All pages are under \`src/app/\` and use Next.js App Router.\n\n`;

  const appDir = path.join(ROOT, 'src', 'app');
  const pages = walk(appDir).filter((f) => f.endsWith('page.tsx'));

  md += `## User-facing Pages (${pages.length})\n\n`;
  md += `| Route | File | Size |\n`;
  md += `|---|---|---|\n`;

  for (const p of pages) {
    const rel = relPath(p);
    const route = rel
      .replace('src/app', '')
      .replace('/page.tsx', '')
      .replace(/^\//, '/')
      .replace(/^$/, '/');
    md += `| \`${route || '/'}\` | ${rel} | ${sizeKB(p)} KB |\n`;
  }

  md += `\n## Layout Files\n\n`;
  const layouts = walk(appDir).filter((f) => f.endsWith('layout.tsx'));
  for (const l of layouts) {
    md += `- ${relPath(l)}\n`;
  }

  writeOut('02-pages.md', md);
}

// ─── 3. API ROUTES ──────────────────────────────────────────────────

function writeApiRoutes() {
  let md = `# API Routes\n\n`;
  md += `All API endpoints are under \`src/app/api/\`.\n\n`;

  const apiDir = path.join(ROOT, 'src', 'app', 'api');
  if (!fs.existsSync(apiDir)) {
    writeOut('03-api-routes.md', md + '_(no API routes found)_\n');
    return;
  }

  const routes = walk(apiDir).filter((f) => f.endsWith('route.ts'));

  md += `## Endpoints (${routes.length})\n\n`;
  md += `| Route | File | Size | Purpose |\n`;
  md += `|---|---|---|---|\n`;

  for (const r of routes) {
    const rel = relPath(r);
    const route = rel
      .replace('src/app', '')
      .replace('/route.ts', '');

    const content = readFile(r);
    const purpose = guessApiPurpose(route, content);

    md += `| \`${route}\` | ${rel} | ${sizeKB(r)} KB | ${purpose} |\n`;
  }

  md += `\n## Methods Detail\n\n`;
  for (const r of routes) {
    const rel = relPath(r);
    const content = readFile(r);
    const methods = [];
    if (/export\s+async\s+function\s+GET/.test(content)) methods.push('GET');
    if (/export\s+async\s+function\s+POST/.test(content)) methods.push('POST');
    if (/export\s+async\s+function\s+PUT/.test(content)) methods.push('PUT');
    if (/export\s+async\s+function\s+DELETE/.test(content)) methods.push('DELETE');
    if (/export\s+async\s+function\s+PATCH/.test(content)) methods.push('PATCH');

    if (methods.length > 0) {
      md += `- **\`${rel}\`** → ${methods.join(', ')}\n`;
    }
  }

  writeOut('03-api-routes.md', md);
}

function guessApiPurpose(route, content) {
  const name = route.toLowerCase();
  if (name.includes('tts')) return 'Text-to-speech audio';
  if (name.includes('lesson')) return 'Lesson data';
  if (name.includes('validate')) return 'Answer validation';
  if (name.includes('lexicon') || name.includes('dictionary'))
    return 'Dictionary data';
  if (name.includes('dialogue')) return 'Dialogue generation';
  if (name.includes('credits')) return 'Credit system';
  if (name.includes('ext')) return 'Extension/auth';
  if (name.includes('diagnose')) return 'Diagnostics';
  if (name.includes('generate-wav')) return 'WAV audio generation';
  return '(general)';
}

// ─── 4. COMPONENTS ──────────────────────────────────────────────────

function writeComponents() {
  let md = `# React Components\n\n`;

  const compDir = path.join(ROOT, 'src', 'components');
  const comps = walk(compDir).filter(
    (f) => f.endsWith('.tsx') && !f.includes('ui/')
  );

  md += `## Application Components (${comps.length})\n\n`;
  md += `| Component | File | Size | Exports |\n`;
  md += `|---|---|---|---|\n`;

  for (const c of comps) {
    const rel = relPath(c);
    const name = path.basename(c, '.tsx');
    const content = readFile(c);
    const exports = [];
    if (/export\s+default\s+function/.test(content)) exports.push('default');
    if (/export\s+function\s+([A-Z]\w*)/.test(content)) {
      const m = content.match(/export\s+function\s+([A-Z]\w*)/g) || [];
      exports.push(...m.map((e) => e.replace('export function ', '')));
    }
    if (/export\s+const\s+([A-Z]\w*)/.test(content)) {
      const m = content.match(/export\s+const\s+([A-Z]\w*)/g) || [];
      exports.push(...m.map((e) => e.replace('export const ', '')));
    }
    md += `| ${name} | ${rel} | ${sizeKB(c)} KB | ${exports.slice(0, 3).join(', ') || '-'} |\n`;
  }

  md += `\n## UI Components (shadcn/ui)\n\n`;
  const uiDir = path.join(ROOT, 'src', 'components', 'ui');
  if (fs.existsSync(uiDir)) {
    const uiComps = fs.readdirSync(uiDir).filter((f) => f.endsWith('.tsx'));
    md += `${uiComps.length} UI primitives: ${uiComps.map((c) => path.basename(c, '.tsx')).join(', ')}\n`;
  }

  writeOut('04-components.md', md);
}

// ─── 5. CONTENT SYSTEM ──────────────────────────────────────────────

function writeContentSystem() {
  let md = `# Content System\n\n`;
  md += `The curriculum is defined in \`src/lib/content/builders/world*.ts\` files.\n\n`;

  const buildersDir = path.join(ROOT, 'src', 'lib', 'content', 'builders');
  if (!fs.existsSync(buildersDir)) {
    writeOut('05-content-system.md', md + '_(no builders found)_\n');
    return;
  }

  const builders = fs.readdirSync(buildersDir).filter((f) => f.endsWith('.ts'));

  md += `## Worlds (${builders.length} files)\n\n`;
  md += `| File | Size | Lessons | Vocab |\n`;
  md += `|---|---|---|---|\n`;

  let totalLessons = 0;
  let totalVocab = 0;

  for (const b of builders.sort()) {
    const fullPath = path.join(buildersDir, b);
    const content = readFile(fullPath);

    // Count qL( calls and object literals
    const lessonIds = content.match(/"(w\d+_l\d+)"/g) || [];
    const uniqueLessons = new Set(lessonIds);
    const lessonCount = uniqueLessons.size;

    // Count vocab entries (rough estimate)
    const vocabLines = content.match(/\["[^"]+",\s*"[^"]+",\s*"[^"]+"\]/g) || [];
    const vocabCount = vocabLines.length;

    totalLessons += lessonCount;
    totalVocab += vocabCount;

    md += `| ${b} | ${sizeKB(fullPath)} KB | ${lessonCount} | ${vocabCount} |\n`;
  }

  md += `\n**Totals:** ${totalLessons} lessons, ~${totalVocab} vocabulary entries\n\n`;

  md += `## Lesson Structure\n\n`;
  md += `Each lesson (\`QuickLesson\` or \`ContentLesson\`) contains:\n\n`;
  md += '- `id` — Unique ID (e.g., `w1_l1`)\n';
  md += '- `worldId` — Parent world (w1-w10)\n';
  md += '- `slug` — URL-friendly name\n';
  md += '- `difficulty` — CEFR level (A1, A2, B1)\n';
  md += '- `title` — { en, hy, ru }\n';
  md += '- `concept` — { en, hy, ru }\n';
  md += '- `vocabulary` — Array of { id, hy, en, ru }\n';
  md += '- `phrases` — Array of { id, hy, en, ru, alt? }\n';
  md += '- `dialogues` — Array of { id, title, turns }\n\n';

  md += `## Build Pipeline\n\n`;
  md += '```\n';
  md += `src/lib/content/builders/world*.ts\n`;
  md += `        ↓\n`;
  md += `scripts/build-lesson-dictionary-v3.ts  (npx tsx)\n`;
  md += `        ↓\n`;
  md += `public/data/lesson-dictionary.json  (browser loads this)\n`;
  md += `        ↓\n`;
  md += `OfflineLessonEngine → Professional mode\n`;
  md += '```\n\n';

  writeOut('05-content-system.md', md);
}

// ─── 6. AUDIO SYSTEM ────────────────────────────────────────────────

function writeAudioSystem() {
  let md = `# Audio System\n\n`;

  const audioDir = path.join(ROOT, 'src', 'lib', 'audio');
  if (fs.existsSync(audioDir)) {
    const files = fs.readdirSync(audioDir).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));
    md += `## Modules (${files.length})\n\n`;
    md += `| File | Size | Purpose |\n`;
    md += `|---|---|---|\n`;

    for (const f of files.sort()) {
      const fullPath = path.join(audioDir, f);
      const content = readFile(fullPath);
      let purpose = '';
      if (f.includes('Manager')) purpose = 'Audio playback manager';
      else if (f.includes('Cache')) purpose = 'Audio caching';
      else if (f.includes('Providers')) purpose = 'Audio providers';
      else if (f.includes('Queue')) purpose = 'Audio queue';
      else if (f.includes('Settings')) purpose = 'Audio settings';
      else if (f.includes('Manifest')) purpose = 'Audio manifest';
      else if (f.includes('Wav')) purpose = 'WAV generation';
      else if (f.includes('Lesson')) purpose = 'Lesson audio';
      else if (f.includes('Types')) purpose = 'Types';
      else if (f === 'index.ts') purpose = 'Exports';
      md += `| ${f} | ${sizeKB(fullPath)} KB | ${purpose || '-'} |\n`;
    }
  }

  md += `\n## Offline Audio\n\n`;
  const offlineDir = path.join(ROOT, 'src', 'lib', 'offline');
  if (fs.existsSync(offlineDir)) {
    const files = fs.readdirSync(offlineDir).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));
    md += `| File | Size |\n`;
    md += `|---|---|\n`;
    for (const f of files.sort()) {
      md += `| ${f} | ${sizeKB(path.join(offlineDir, f))} KB |\n`;
    }
  }

  md += `\n## Audio Sources\n\n`;
  md += `- \`/audio/offline/\` — Lesson audio (pre-generated WAV)\n`;
  md += `- \`/audio/offline_dictionary/\` — Dictionary audio\n`;
  md += `- \`/audio/offline_user_dictionary/\` — User-recorded audio\n`;
  md += `- \`/api/generate-wav\` — Server-side WAV generation\n`;
  md += `- \`/api/generate-tts-en\` — English TTS\n`;
  md += `- \`/api/generate-tts-ru\` — Russian TTS\n`;
  md += `- Browser SpeechSynthesis API (fallback)\n\n`;

  writeOut('06-audio-system.md', md);
}

// ─── 7. I18N SYSTEM ─────────────────────────────────────────────────

function writeI18nSystem() {
  let md = `# i18n System (Internationalization)\n\n`;

  const i18nDir = path.join(ROOT, 'src', 'lib', 'i18n');
  if (fs.existsSync(i18nDir)) {
    const files = fs.readdirSync(i18nDir).filter((f) => !f.endsWith('.backup'));
    md += `## Files\n\n`;
    md += `| File | Size |\n`;
    md += `|---|---|\n`;
    for (const f of files.sort()) {
      md += `| ${f} | ${sizeKB(path.join(i18nDir, f))} KB |\n`;
    }
  }

  md += `\n## Supported Languages\n\n`;
  md += `- **hy** — Armenian (հայերեն)\n`;
  md += `- **en** — English\n`;
  md += `- **ru** — Russian (русский)\n\n`;

  md += `## Learning Directions (6 pairs)\n\n`;
  md += '| Pair | Native | Learning |\n';
  md += '|---|---|---|\n';
  md += `| hy-en | Armenian | English |\n`;
  md += `| en-hy | English | Armenian |\n`;
  md += `| ru-hy | Russian | Armenian |\n`;
  md += `| hy-ru | Armenian | Russian |\n`;
  md += `| en-ru | English | Russian |\n`;
  md += `| ru-en | Russian | English |\n\n`;

  md += `## Usage\n\n`;
  md += '```typescript\n';
  md += `import { useI18n } from '@/hooks/useI18n';\n\n`;
  md += `const { t } = useI18n();\n`;
  md += `t('key_name')  // Returns translated string\n`;
  md += '```\n\n';

  writeOut('07-i18n-system.md', md);
}

// ─── 8. FEATURES ────────────────────────────────────────────────────

function writeFeatures() {
  let md = `# Application Features\n\n`;

  md += `## 1. Learning Modes\n\n`;
  md += `### Amateur Mode (Dynamic)\n`;
  md += `- Generates lessons dynamically from source\n`;
  md += `- Converts content to selected language pair\n`;
  md += `- Fewer exercises per lesson (17 vs 51)\n`;
  md += `- Faster loading\n\n`;
  md += `### Professional Mode (Pre-built)\n`;
  md += `- Loads pre-built lesson-dictionary.json\n`;
  md += `- 51 exercises per lesson (25 MC + 25 translate + 1 match)\n`;
  md += `- Runtime translation for hy/ru\n`;
  md += `- Offline-capable\n\n`;

  md += `## 2. Gamification\n\n`;
  md += `- **HAYQ** — In-app currency (earned by completing lessons)\n`;
  md += `- **Hearts** — Limited attempts per session (refill via practice/purchase)\n`;
  md += `- **Streaks** — Daily practice streaks with milestones\n`;
  md += `- **Crowns** — Per-lesson mastery (0-3 stars)\n`;
  md += `- **Levels** — HAYQ-based progression (Beginner → Master)\n`;
  md += `- **Quests** — Daily objectives with rewards\n`;
  md += `- **Achievements** — Milestones (in lib/gamification)\n\n`;

  md += `## 3. Curriculum (10 Worlds, 90 Lessons)\n\n`;
  md += '| World | Theme | Lessons | Level |\n';
  md += '|---|---|---|---|\n';
  md += `| w1 | Greetings & Basics | 10 | A1 |\n`;
  md += `| w2 | Home & Daily Life | 10 | A1 |\n`;
  md += `| w3 | Travel | 8 | A2 |\n`;
  md += `| w4 | Work & Education | 6 | A2 |\n`;
  md += `| w5 | Advanced Communication | 6 | B1 |\n`;
  md += `| w6 | Hobbies | 10 | A2 |\n`;
  md += `| w7 | Technology | 10 | B1 |\n`;
  md += `| w8 | Environment | 10 | B1 |\n`;
  md += `| w9 | Business | 10 | B1 |\n`;
  md += `| w10 | Arts | 10 | B1 |\n\n`;

  md += `## 4. Exercise Types\n\n`;
  md += `- **Multiple Choice** — Pick correct translation\n`;
  md += `- **Translate** — Free text translation\n`;
  md += `- **Match Pairs** — Connect words in two languages\n`;
  md += `- **Word Order** — Arrange words in correct order\n`;
  md += `- **Listening** — Type what you hear\n\n`;

  md += `## 5. Interactive Dialogue\n\n`;
  md += `- Character-based dialogues (Nuri mascot)\n`;
  md += `- Turn-by-turn conversation\n`;
  md += `- Multiple languages simultaneously\n\n`;

  md += `## 6. Offline Support (PWA)\n\n`;
  md += `- Service Worker (\`public/sw.js\` v5)\n`;
  md += `- Cache-first for audio files\n`;
  md += `- Network-first for JSON data\n`;
  md += `- Background sync\n`;
  md += `- Push notifications\n\n`;

  md += `## 7. Nuri Mascot\n\n`;
  md += `- Emotion engine (moods: happy, sad, thinking, etc.)\n`;
  md += `- Contextual messages based on progress\n`;
  md += `- Animated reactions\n`;
  md += `- Custom images per state\n\n`;

  md += `## 8. User Features\n\n`;
  md += `- Language switcher (3 languages)\n`;
  md += `- Dark/light theme\n`;
  md += `- User dictionary (personal vocab)\n`;
  md += `- Audio recording (own pronunciation)\n`;
  md += `- Progress tracking (Supabase)\n`;
  md += `- Rewards system\n`;
  md += `- Daily goals\n\n`;

  md += `## 9. Admin Features\n\n`;
  md += `- Dictionary management (/admin/dictionary)\n`;
  md += `- Audio management (/admin/audio)\n`;
  md += `- Diagnostics (/diagnose)\n\n`;

  writeOut('08-features.md', md);
}

// ─── 9. ARCHITECTURE ────────────────────────────────────────────────

function writeArchitecture() {
  let md = `# Technical Architecture\n\n`;

  md += `## Stack\n\n`;
  md += `- **Framework:** Next.js 14 (App Router)\n`;
  md += `- **Language:** TypeScript\n`;
  md += `- **Styling:** Tailwind CSS + shadcn/ui\n`;
  md += `- **Animation:** Framer Motion\n`;
  md += `- **Icons:** Lucide React\n`;
  md += `- **Database:** Supabase\n`;
  md += `- **Hosting:** Vercel\n`;
  md += `- **State:** React hooks + localStorage\n\n`;

  md += `## Data Flow\n\n`;
  md += '### Learning Flow\n\n';
  md += '```\n';
  md += `User visits /learn?lesson=w6_l1&pair=hy-en\n`;
  md += `        ↓\n`;
  md += `loadLesson() in learn/page.tsx\n`;
  md += `        ↓\n`;
  md += `Is Professional mode?\n`;
  md += `        │\n`;
  md += `   YES ──┴── NO\n`;
  md += `    │          │\n`;
  md += `    │          └→ getLessonById() from multilingual.ts\n`;
  md += `    │               ↓\n`;
  md += `    │             convertLessonForPair()\n`;
  md += `    │               ↓\n`;
  md += `    └→ offlineLessonEngine.getLesson()\n`;
  md += `         ↓\n`;
  md += `       fetch('/data/lesson-dictionary.json')\n`;
  md += `         ↓\n`;
  md += `       translateOfflineLessonForLang()\n`;
  md += `         ↓\n`;
  md += `   Lesson renders\n`;
  md += '```\n\n';

  md += `## Key Modules\n\n`;
  md += `### Content Layer\n`;
  md += `- \`src/lib/content/builders/world*.ts\` — Source definitions\n`;
  md += `- \`src/lib/content/generator.ts\` — Lesson generation\n`;
  md += `- \`src/lib/i18n/multilingual.ts\` — Pair conversion\n\n`;

  md += `### Runtime Layer\n`;
  md += `- \`src/lib/offline/OfflineLessonEngine.ts\` — Professional mode loader\n`;
  md += `- \`src/lib/offline/offline-lesson-translator.ts\` — Runtime translation\n`;
  md += `- \`src/lib/lessons/engine.ts\` — Lesson engine\n\n`;

  md += `### Audio Layer\n`;
  md += `- \`src/lib/audio/AudioManager.ts\` — Playback\n`;
  md += `- \`src/lib/audio/WavClient.ts\` — WAV generation\n`;
  md += `- \`src/lib/offline/OfflineAudioManager.ts\` — Offline audio\n\n`;

  md += `### UI Layer\n`;
  md += `- \`src/app/*\` — Pages\n`;
  md += `- \`src/components/*\` — Components\n`;
  md += `- \`src/hooks/useI18n.ts\` — Client i18n\n\n`;

  md += `## Build Commands\n\n`;
  md += '```bash\n';
  md += `npm run dev              # Dev server\n`;
  md += `npm run build            # Production build\n`;
  md += `npx tsc --noEmit         # Type check\n`;
  md += `npx tsx scripts/build-lesson-dictionary-v3.ts  # Rebuild JSON\n`;
  md += '```\n\n';

  writeOut('09-architecture.md', md);
}

// ─── MAIN ───────────────────────────────────────────────────────────

function main() {
  cleanDir(OUT);

  console.log('');
  console.log('='.repeat(72));
  console.log('📊 NUR Lingo — Project Functional Map');
  console.log('='.repeat(72));
  console.log('');

  console.log('▶️  [1/9] Overview...');
  writeOverview();

  console.log('▶️  [2/9] Pages...');
  writePages();

  console.log('▶️  [3/9] API Routes...');
  writeApiRoutes();

  console.log('▶️  [4/9] Components...');
  writeComponents();

  console.log('▶️  [5/9] Content System...');
  writeContentSystem();

  console.log('▶️  [6/9] Audio System...');
  writeAudioSystem();

  console.log('▶️  [7/9] i18n System...');
  writeI18nSystem();

  console.log('▶️  [8/9] Features...');
  writeFeatures();

  console.log('▶️  [9/9] Architecture...');
  writeArchitecture();

  console.log('');
  console.log('='.repeat(72));
  console.log('✅ Analysis complete.');
  console.log(`📁 Reports saved to: ${relPath(OUT)}/`);
  console.log('='.repeat(72));
  console.log('');
  console.log('📋 Files generated:');
  console.log('   01-overview.md          — Project overview + stats');
  console.log('   02-pages.md             — All routes');
  console.log('   03-api-routes.md        — API endpoints');
  console.log('   04-components.md        — React components');
  console.log('   05-content-system.md    — Curriculum structure');
  console.log('   06-audio-system.md      — Audio modules');
  console.log('   07-i18n-system.md       — Languages + directions');
  console.log('   08-features.md          — Feature list');
  console.log('   09-architecture.md      — Technical architecture');
  console.log('');
}

main();