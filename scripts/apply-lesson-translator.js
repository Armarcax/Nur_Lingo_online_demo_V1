#!/usr/bin/env node
/**
 * Apply the offline lesson translator to learn/page.tsx
 * Safely preserves LF line endings.
 *
 * Usage: node scripts/apply-lesson-translator.js
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(process.cwd(), 'src', 'app', 'learn', 'page.tsx');

console.log('');
console.log('='.repeat(60));
console.log('🔧 Applying offline lesson translator');
console.log('='.repeat(60));
console.log('');

// ─── Read file ───────────────────────────────────────────────────────

if (!fs.existsSync(FILE)) {
  console.error(`❌ File not found: ${FILE}`);
  process.exit(1);
}

let content = fs.readFileSync(FILE, 'utf8');

const beforeCrlf = (content.match(/\r\n/g) || []).length;
const beforeLf = (content.match(/(?<!\r)\n/g) || []).length;
console.log(`📄 Before: CRLF=${beforeCrlf}, LF=${beforeLf}`);

if (beforeCrlf > 0) {
  console.warn(`⚠️  File has ${beforeCrlf} CRLF line endings.`);
  console.warn(`   Converting all to LF...`);
  content = content.replace(/\r\n/g, '\n');
}

// ─── 1. Add import ───────────────────────────────────────────────────

const importAnchor = 'import { useI18n } from "@/hooks/useI18n";';
const importToAdd = 'import { translateOfflineLessonForLang } from "@/lib/offline/offline-lesson-translator";';

if (content.includes(importToAdd)) {
  console.log('⏭️  Import already present, skipping');
} else if (content.includes(importAnchor)) {
  content = content.replace(
    importAnchor,
    `${importAnchor}\n${importToAdd}`
  );
  console.log('✅ Import added');
} else {
  console.error('❌ Import anchor not found!');
  process.exit(1);
}

// ─── 2. Add translator call ─────────────────────────────────────────

const logLine = 'console.log(`✅ Professional lesson loaded: ${l.id} with ${l.exercises?.length || 0} exercises`);';
const translatorCall = 'l = translateOfflineLessonForLang(l as any, learnLang as any) as any;';

if (content.includes(translatorCall)) {
  console.log('⏭️  Translator call already present, skipping');
} else {
  const idx = content.indexOf(logLine);
  if (idx === -1) {
    console.error('❌ Log line anchor not found!');
    process.exit(1);
  }

  // Find the end of that line
  const lineEndIdx = content.indexOf('\n', idx);
  if (lineEndIdx === -1) {
    console.error('❌ Line end not found!');
    process.exit(1);
  }

  // Insert after this line
  const insertion = `\n          // 🌐 Translate options and targetAnswer to the learning language\n          ${translatorCall}`;
  content = content.substring(0, lineEndIdx) + insertion + content.substring(lineEndIdx);

  console.log('✅ Translator call added');
}

// ─── 3. Write file ──────────────────────────────────────────────────

// Ensure LF only, no CRLF
content = content.replace(/\r\n/g, '\n');

fs.writeFileSync(FILE, content, 'utf8');

const afterCrlf = (content.match(/\r\n/g) || []).length;
const afterLf = (content.match(/(?<!\r)\n/g) || []).length;
console.log(`📄 After:  CRLF=${afterCrlf}, LF=${afterLf}`);

console.log('');
console.log('='.repeat(60));
console.log('✅ Done');
console.log('='.repeat(60));
console.log('');
console.log('📋 Next steps:');
console.log('   1. npx tsc --noEmit');
console.log('   2. git diff --stat');
console.log('   3. git diff src/app/learn/page.tsx');
console.log('');