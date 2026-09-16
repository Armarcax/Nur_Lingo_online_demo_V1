// scripts/merge-database.js
const fs = require('fs');
const path = require('path');

// ─── CONFIG ──────────────────────────────────────────────────────────────

const CONFIG = {
  sourceFile: 'C:\\Users\\Armen\\Documents\\NurLingo\\NURLingo-main\\lingo-hub-main (1)\\lingo-hub-main\\src\\lib\\content\\database.ts',
  targetFile: path.join(__dirname, '..', 'src', 'lib', 'content', 'database.ts'),
  outputFile: path.join(__dirname, '..', 'src', 'lib', 'content', 'database.merged.ts'),
  backupFile: path.join(__dirname, '..', 'src', 'lib', 'content', 'database.backup.ts'),
};

// ─── READ FILE ───────────────────────────────────────────────────────────

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return null;
  }
  const stats = fs.statSync(filePath);
  console.log(`📄 Found: ${path.basename(filePath)} (${(stats.size / 1024).toFixed(1)} KB)`);
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
  const stats = fs.statSync(filePath);
  console.log(`✅ Written: ${path.basename(filePath)} (${(stats.size / 1024).toFixed(1)} KB)`);
}

// ─── EXTRACT FUNCTIONS ──────────────────────────────────────────────────

function extractBuilders(content) {
  const patterns = [
    /function buildWorld2\(\): QuickLesson\[] \{[\s\S]*?\n\}/,
    /function buildWorld3\(\): QuickLesson\[] \{[\s\S]*?\n\}/,
    /function buildWorld4\(\): QuickLesson\[] \{[\s\S]*?\n\}/,
    /function buildWorld5\(\): QuickLesson\[] \{[\s\S]*?\n\}/,
    /function buildWorld6\(\): QuickLesson\[] \{[\s\S]*?\n\}/,
    /function buildWorld7\(\): QuickLesson\[] \{[\s\S]*?\n\}/,
    /function buildWorld8\(\): QuickLesson\[] \{[\s\S]*?\n\}/,
    /function buildWorld9\(\): QuickLesson\[] \{[\s\S]*?\n\}/,
    /function buildWorld10\(\): QuickLesson\[] \{[\s\S]*?\n\}/,
  ];
  const results = {};
  patterns.forEach(pattern => {
    const match = content.match(pattern);
    if (match) {
      const name = match[0].match(/function (buildWorld\d+)/);
      if (name) {
        results[name[1]] = match[0];
      }
    }
  });
  return results;
}

function extractHelpers(content) {
  const helpers = {};
  const patterns = [
    /function makeTravelLesson\([\s\S]*?\): QuickLesson \{[\s\S]*?\n\}/,
    /function makeWorkEduLesson\([\s\S]*?\): QuickLesson \{[\s\S]*?\n\}/,
    /function makeAdvancedLesson\([\s\S]*?\): QuickLesson \{[\s\S]*?\n\}/,
    /function makeHobbyLesson\([\s\S]*?\): QuickLesson \{[\s\S]*?\n\}/,
    /function makeTechLesson\([\s\S]*?\): QuickLesson \{[\s\S]*?\n\}/,
    /function makeEnvLesson\([\s\S]*?\): QuickLesson \{[\s\S]*?\n\}/,
    /function makeBizLesson\([\s\S]*?\): QuickLesson \{[\s\S]*?\n\}/,
    /function makeArtLesson\([\s\S]*?\): QuickLesson \{[\s\S]*?\n\}/,
    /function qL\([\s\S]*?\): QuickLesson \{[\s\S]*?\n\}/,
  ];
  patterns.forEach(pattern => {
    const match = content.match(pattern);
    if (match) {
      const name = match[0].match(/function (make\w+Lesson|qL)/);
      if (name) {
        helpers[name[1]] = match[0];
      }
    }
  });
  return helpers;
}

// ─── MAIN ──────────────────────────────────────────────────────────────────

function mergeDatabases() {
  console.log('🔀 NUR Lingo — Database Merger');
  console.log('═══════════════════════════════════════════\n');

  console.log('📂 Source (lingo-hub):');
  console.log(`   ${CONFIG.sourceFile}`);
  console.log('\n📂 Target (NURLingo-main1):');
  console.log(`   ${CONFIG.targetFile}\n`);

  const sourceContent = readFile(CONFIG.sourceFile);
  const targetContent = readFile(CONFIG.targetFile);
  
  if (!sourceContent || !targetContent) {
    console.error('\n❌ Failed to read files');
    return;
  }

  console.log('\n📦 Creating backup...');
  writeFile(CONFIG.backupFile, targetContent);

  console.log('\n📖 Extracting builders from lingo-hub...');
  const sourceBuilders = extractBuilders(sourceContent);
  console.log(`   Found: ${Object.keys(sourceBuilders).join(', ')}`);

  console.log('\n📖 Extracting helpers from lingo-hub...');
  const sourceHelpers = extractHelpers(sourceContent);
  console.log(`   Found: ${Object.keys(sourceHelpers).join(', ')}`);

  console.log('\n📖 Checking target for existing builders...');
  const targetBuilders = extractBuilders(targetContent);
  const targetBuilderNames = Object.keys(targetBuilders);
  console.log(`   Target already has: ${targetBuilderNames.join(', ') || 'none'}`);

  console.log('\n🔧 Building merged database...\n');

  let mergedContent = targetContent;

  // ✅ ՄԻԱՅՆ ԱՎԵԼԱՑՆԵԼ ԱՅՆ builder-ները, ՈՐՈՆՔ ՉԿԱՆ
  const buildersToAdd = {};
  for (const [name, code] of Object.entries(sourceBuilders)) {
    if (!targetBuilderNames.includes(name)) {
      buildersToAdd[name] = code;
      console.log(`   ➕ Adding ${name} (not in target)`);
    } else {
      console.log(`   ⏭️ Skipping ${name} (already in target)`);
    }
  }

  // ✅ ՄԻԱՅՆ ԱՎԵԼԱՑՆԵԼ ԱՅՆ helpers-ները, ՈՐՈՆՔ ՉԿԱՆ
  const helpersToAdd = {};
  for (const [name, code] of Object.entries(sourceHelpers)) {
    if (!mergedContent.includes(`function ${name}(`)) {
      helpersToAdd[name] = code;
      console.log(`   ➕ Adding ${name} (not in target)`);
    } else {
      console.log(`   ⏭️ Skipping ${name} (already in target)`);
    }
  }

  // Add builders
  const builderKeys = Object.keys(buildersToAdd);
  if (builderKeys.length > 0) {
    const insertPos = mergedContent.indexOf('// ─── Lookup helpers');
    if (insertPos !== -1) {
      const before = mergedContent.substring(0, insertPos);
      const after = mergedContent.substring(insertPos);
      const builderCode = builderKeys.map(key => buildersToAdd[key]).join('\n\n');
      mergedContent = before + '\n' + builderCode + '\n\n' + after;
      console.log(`\n✅ Added ${builderKeys.length} builder functions: ${builderKeys.join(', ')}`);
    }
  } else {
    console.log('\n✅ No new builders to add');
  }

  // Add helpers
  const helperKeys = Object.keys(helpersToAdd);
  if (helperKeys.length > 0) {
    const insertPos = mergedContent.lastIndexOf('function buildWorld10');
    if (insertPos !== -1) {
      const endOfBuilders = mergedContent.indexOf('}', insertPos) + 1;
      const before = mergedContent.substring(0, endOfBuilders);
      const after = mergedContent.substring(endOfBuilders);
      const helperCode = helperKeys.map(key => helpersToAdd[key]).join('\n\n');
      mergedContent = before + '\n\n' + helperCode + '\n\n' + after;
      console.log(`\n✅ Added ${helperKeys.length} helper functions: ${helperKeys.join(', ')}`);
    }
  } else {
    console.log('\n✅ No new helpers to add');
  }

  console.log('\n💾 Saving merged file...');
  writeFile(CONFIG.outputFile, mergedContent);
  
  console.log('\n═══════════════════════════════════════════');
  console.log('✅ MERGE COMPLETE!');
  console.log(`📁 Output: ${CONFIG.outputFile}`);
  console.log(`📦 Backup: ${CONFIG.backupFile}`);
  console.log('\n📋 Next steps:');
  console.log('  1. Replace the original:');
  console.log('     Copy-Item src\\lib\\content\\database.merged.ts src\\lib\\content\\database.ts -Force');
  console.log('  2. Run: npm run dev');
}

// ─── RUN ──────────────────────────────────────────────────────────────────

try {
  mergeDatabases();
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
}