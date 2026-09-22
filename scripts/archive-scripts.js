#!/usr/bin/env node
/**
 * NUR Lingo — Scripts Archiver
 *
 * Moves one-time scripts to scripts/_archive/ (preserves git history).
 * Skips scripts that are referenced in package.json.
 *
 * Usage: node scripts/archive-scripts.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();
const SCRIPTS = path.join(ROOT, 'scripts');
const ARCHIVE = path.join(SCRIPTS, '_archive');

// ─── HELPERS ────────────────────────────────────────────────────────

function readFile(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

function getPkgRefs() {
  const pkg = JSON.parse(readFile(path.join(ROOT, 'package.json')));
  const refs = new Set();
  for (const cmd of Object.values(pkg.scripts || {})) {
    const matches = cmd.match(/scripts\/([^\s"']+)/g) || [];
    for (const m of matches) refs.add(m.replace('scripts/', ''));
  }
  return refs;
}

// ─── CANDIDATES ─────────────────────────────────────────────────────

const CANDIDATES = [
  // One-time diagnostics (10)
  'diagnose-audio-full.js',
  'diagnose-audio-issue.js',
  'diagnose-audio-playback.ts',
  'diagnose-build.ts',
  'diagnose-exports.js',
  'diagnose-full-system.ts',
  'diagnose-lesson-progress.ts',
  'diagnose-offline-audio-full.ts',
  'diagnose-offline-audio.ts',
  'diagnose-offline.ts',
  'diagnose.js',

  // One-time tests (9 - excluding those in pkg.json)
  'test-all-lessons.js',
  'test-armenian-tts.mjs',
  'test-audio-api.js',
  'test-language-bug.ts',
  'test-offline-audio-system.ts',
  'test-offline-lessons-v2.js',
  'test-offline-lessons.js',
  'test-wav-generation.js',
  'test-wav.js',

  // Iterative fixes (not in pkg.json)
  'fix-final-7-errors.ts',
  'fix-dialogue-simple.ts',
  'fix-all-issues.js',
  'fix-audio-metadata.js',
  'fix-dictionary-await.ts',
  'fix-imports.js',
  'fix-offline-audio.js',
  'fix-world-header.js',
  'fix-full-system.js',
  'fix-detected-issues.js',
];

// ─── MAIN ───────────────────────────────────────────────────────────

function main() {
  console.log('');
  console.log('='.repeat(72));
  console.log('📦 NUR Lingo — Archive One-Time Scripts');
  console.log('='.repeat(72));
  console.log('');

  const pkgRefs = getPkgRefs();

  if (!fs.existsSync(ARCHIVE)) {
    fs.mkdirSync(ARCHIVE, { recursive: true });
    console.log('📁 Created scripts/_archive/\n');
  }

  const toMove = [];
  const skipped = [];
  const missing = [];

  for (const base of CANDIDATES) {
    const fullPath = path.join(SCRIPTS, base);

    if (!fs.existsSync(fullPath)) {
      missing.push(base);
      continue;
    }

    if (pkgRefs.has(base)) {
      skipped.push({ base, reason: 'in package.json' });
      continue;
    }

    toMove.push(base);
  }

  console.log(`📊 Analysis:`);
  console.log(`   To move:  ${toMove.length}`);
  console.log(`   Skipped:  ${skipped.length} (in package.json)`);
  console.log(`   Missing:  ${missing.length} (not found)`);
  console.log('');

  if (skipped.length > 0) {
    console.log('⏭️  Skipped (protected):');
    for (const s of skipped) {
      console.log(`   - ${s.base} (${s.reason})`);
    }
    console.log('');
  }

  if (missing.length > 0) {
    console.log('❓ Missing (not found):');
    for (const m of missing) {
      console.log(`   - ${m}`);
    }
    console.log('');
  }

  if (toMove.length === 0) {
    console.log('✅ Nothing to move.');
    return;
  }

  console.log(`🚚 Moving ${toMove.length} files to scripts/_archive/...\n`);

  let moved = 0;
  let failed = 0;

  for (const base of toMove) {
    const from = path.join('scripts', base);
    const to = path.join('scripts', '_archive', base);

    try {
      execSync(`git mv "${from}" "${to}"`, {
        cwd: ROOT,
        stdio: 'pipe',
      });
      console.log(`   ✅ ${base}`);
      moved++;
    } catch (err) {
      console.log(`   ❌ ${base} — ${err.message.split('\n')[0]}`);
      failed++;
    }
  }

  console.log('');
  console.log('='.repeat(72));
  console.log('✅ Archive complete');
  console.log('='.repeat(72));
  console.log('');
  console.log(`   Moved:  ${moved}`);
  console.log(`   Failed: ${failed}`);
  console.log('');

  if (moved > 0) {
    console.log('📋 Next steps:');
    console.log('   1. npx tsc --noEmit');
    console.log('   2. git status --short');
    console.log('   3. Review and commit');
    console.log('');
  }
}

main();