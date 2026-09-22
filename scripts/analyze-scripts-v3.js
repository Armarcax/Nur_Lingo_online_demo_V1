#!/usr/bin/env node
/**
 * NUR Lingo — Scripts Analyzer v3
 * Content-hash based duplicate detection + smart categorization
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'scripts-analysis');

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }
function readFile(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function writeOut(name, content) {
  fs.writeFileSync(path.join(OUT, name), content, 'utf8');
  const kb = (Buffer.byteLength(content, 'utf8') / 1024).toFixed(1);
  console.log(`   📄 ${name} (${kb} KB)`);
}
function hash(content) {
  // Normalize whitespace/line endings before hashing
  const normalized = content.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
  return crypto.createHash('md5').update(normalized).digest('hex').slice(0, 12);
}

function collectScripts() {
  const dir = path.join(ROOT, 'scripts');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => /\.(js|ts|mjs|cjs|sh|py)$/.test(f))
    .map(f => path.join(dir, f));
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

function main() {
  ensureDir(OUT);
  console.log('\n🔍 Scripts Analyzer v3\n');

  const scripts = collectScripts();
  const pkgRefs = getPkgRefs();

  const items = scripts.map(fp => {
    const base = path.basename(fp);
    const content = readFile(fp);
    const stat = fs.statSync(fp);
    return {
      base,
      path: `scripts/${base}`,
      content,
      hash: hash(content),
      sizeKB: (stat.size / 1024).toFixed(1),
      lines: content.split('\n').length,
      inPkg: pkgRefs.has(base),
      ageDays: Math.floor((Date.now() - stat.mtime.getTime()) / 86400000),
    };
  });

  // ─── Group 1: Content-identical duplicates ────────────────────────
  const byHash = {};
  for (const i of items) {
    if (!byHash[i.hash]) byHash[i.hash] = [];
    byHash[i.hash].push(i);
  }
  const contentDuplicates = Object.values(byHash).filter(g => g.length > 1);

  // ─── Group 2: Broken extensions ─────────────────────────────────
  const brokenExt = items.filter(i => /\.\w+\.(js|ts|py)$/.test(i.base) && !/\.d\.ts$/.test(i.base));

  // ─── Group 3: Obvious garbage ───────────────────────────────────
  const garbage = items.filter(i =>
    /^Untitled/i.test(i.base) ||
    / - Copy/i.test(i.base) ||
    /\.backup$/i.test(i.base) ||
    /\.bak$/i.test(i.base)
  );

  // ─── Group 4: Iterative fix scripts ─────────────────────────────
  const iterative = items.filter(i =>
    /\b(final|last|remaining|final-all|final-7)\b/i.test(i.base) && i.base.startsWith('fix-')
  );

  // ─── Group 5: One-time diagnostics ──────────────────────────────
  const diagnostics = items.filter(i =>
    /^diagnose-/i.test(i.base) && !i.inPkg
  );

  // ─── Group 6: One-time tests ────────────────────────────────────
  const oneTimeTests = items.filter(i =>
    /^test-/i.test(i.base) && !i.inPkg
  );

  // ─── Report: 11-content-duplicates.md ──────────────────────────
  let dupMd = `# Content-Identical Duplicates (${contentDuplicates.length} groups)\n\n`;
  dupMd += `These files have **identical content** (after whitespace normalization).\n`;
  dupMd += `Keep the one in \`package.json\` or the more descriptive name, delete the rest.\n\n`;
  for (const group of contentDuplicates) {
    const keep = group.find(i => i.inPkg) || group[0];
    dupMd += `\n## Group (${group.length} files)\n\n`;
    for (const i of group) {
      const marker = i === keep ? '✅ **KEEP**' : '❌ DELETE';
      dupMd += `- ${marker} \`${i.base}\` (${i.sizeKB} KB)\n`;
    }
  }
  writeOut('11-content-duplicates.md', dupMd);

  // ─── Report: 12-broken-extensions.md ───────────────────────────
  let brokenMd = `# Broken Extensions (${brokenExt.length})\n\n`;
  brokenMd += `Double extensions like \`.j.js\` — almost always garbage.\n\n`;
  if (brokenExt.length === 0) {
    brokenMd += `_None found._\n`;
  } else {
    brokenMd += `| Script | Size |\n`;
    brokenMd += `|---|---|\n`;
    for (const i of brokenExt) {
      brokenMd += `| \`${i.base}\` | ${i.sizeKB} KB |\n`;
    }
  }
  writeOut('12-broken-extensions.md', brokenMd);

  // ─── Report: 13-cleanup-plan.md ────────────────────────────────
  const toDelete = new Set();

  // Add garbage
  for (const i of garbage) toDelete.add(i.base);
  // Add broken extensions
  for (const i of brokenExt) toDelete.add(i.base);
  // Add duplicate content (keep only one per group)
  for (const group of contentDuplicates) {
    const keep = group.find(i => i.inPkg) || group[0];
    for (const i of group) {
      if (i !== keep && !i.inPkg) toDelete.add(i.base);
    }
  }

  let planMd = `# Cleanup Plan\n\n`;
  planMd += `## Summary\n\n`;
  planMd += `| Group | Count |\n`;
  planMd += `|---|---|\n`;
  planMd += `| Content-identical duplicates | ${contentDuplicates.length} groups |\n`;
  planMd += `| Broken extensions | ${brokenExt.length} |\n`;
  planMd += `| Obvious garbage | ${garbage.length} |\n`;
  planMd += `| Iterative fix scripts | ${iterative.length} |\n`;
  planMd += `| One-time diagnostics | ${diagnostics.length} |\n`;
  planMd += `| One-time tests | ${oneTimeTests.length} |\n`;
  planMd += `| **Total to delete** | **${toDelete.size}** |\n\n`;

  planMd += `## PHASE 1: Safe to DELETE now (${toDelete.size} files)\n\n`;
  planMd += `### A. Content-identical duplicates\n\n`;
  planMd += '```bash\n';
  for (const group of contentDuplicates) {
    const keep = group.find(i => i.inPkg) || group[0];
    for (const i of group) {
      if (i !== keep && !i.inPkg) {
        planMd += `git rm "scripts/${i.base}"  # dup of ${keep.base}\n`;
      }
    }
  }
  planMd += '```\n\n';

  planMd += `### B. Broken extensions\n\n`;
  planMd += '```bash\n';
  for (const i of brokenExt) {
    planMd += `git rm "scripts/${i.base}"\n`;
  }
  planMd += '```\n\n';

  planMd += `### C. Garbage\n\n`;
  planMd += '```bash\n';
  for (const i of garbage) {
    planMd += `git rm "scripts/${i.base}"\n`;
  }
  planMd += '```\n\n';

  planMd += `## PHASE 2: ARCHIVE candidates (${iterative.length + diagnostics.length + oneTimeTests.length})\n\n`;
  planMd += `Move to \`scripts/_archive/\` instead of deleting.\n\n`;
  planMd += `### Iterative fix scripts (${iterative.length})\n\n`;
  for (const i of iterative.sort((a, b) => a.base.localeCompare(b.base))) {
    planMd += `- \`${i.base}\`\n`;
  }
  planMd += `\n### One-time diagnostics (${diagnostics.length})\n\n`;
  for (const i of diagnostics.sort((a, b) => a.base.localeCompare(b.base))) {
    planMd += `- \`${i.base}\`\n`;
  }
  planMd += `\n### One-time tests (${oneTimeTests.length})\n\n`;
  for (const i of oneTimeTests.sort((a, b) => a.base.localeCompare(b.base))) {
    planMd += `- \`${i.base}\`\n`;
  }

  planMd += `\n## PHASE 3: KEEP\n\n`;
  planMd += `### Referenced in package.json (${items.filter(i => i.inPkg).length})\n\n`;
  for (const i of items.filter(i => i.inPkg).sort((a, b) => a.base.localeCompare(b.base))) {
    planMd += `- ✅ \`${i.base}\`\n`;
  }

  writeOut('13-cleanup-plan.md', planMd);

  console.log('');
  console.log('='.repeat(72));
  console.log('✅ Analysis v3 complete');
  console.log('='.repeat(72));
  console.log('');
  console.log(`📊 Summary:`);
  console.log(`   Content duplicates:   ${contentDuplicates.length} groups`);
  console.log(`   Broken extensions:    ${brokenExt.length}`);
  console.log(`   Garbage:              ${garbage.length}`);
  console.log(`   Iterative fixes:      ${iterative.length}`);
  console.log(`   One-time diagnostics: ${diagnostics.length}`);
  console.log(`   One-time tests:       ${oneTimeTests.length}`);
  console.log(`   ─────────────────────────────────────`);
  console.log(`   PHASE 1 (delete):     ${toDelete.size}`);
  console.log(`   PHASE 2 (archive):    ${iterative.length + diagnostics.length + oneTimeTests.length}`);
  console.log('');
  console.log(`📄 Read: scripts-analysis/13-cleanup-plan.md`);
  console.log('');
}

main();