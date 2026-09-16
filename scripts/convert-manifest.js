// scripts/convert-manifest.js
// NUR Lingo — Manifest Converter (Old → New Format)
// Run: node scripts/convert-manifest.js

const fs = require('fs');
const path = require('path');

// ─── CONFIG ──────────────────────────────────────────────────────────

const MANIFEST_PATH = path.join(__dirname, '..', 'public', 'audio', 'manifest.json');
const BACKUP_PATH = path.join(__dirname, '..', 'public', 'audio', 'manifest.backup.json');
const LANGUAGES = ['hy', 'en', 'ru'];

// ─── MAIN ────────────────────────────────────────────────────────────

function convertManifest() {
  console.log('🔍 NUR Lingo — Manifest Converter');
  console.log('📁 Ֆայլ:', MANIFEST_PATH);
  console.log('');

  // 1. Check if file exists
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ manifest.json չի գտնվել:', MANIFEST_PATH);
    console.log('   Ստեղծեք նոր manifest.json հետևյալ հրամանով:');
    console.log('   echo "{}" > public/audio/manifest.json');
    return;
  }

  // 2. Read existing file
  let oldManifest;
  try {
    const content = fs.readFileSync(MANIFEST_PATH, 'utf8');
    oldManifest = JSON.parse(content);
    console.log('✅ Manifest բեռնվեց');
  } catch (error) {
    console.error('❌ Չհաջողվեց բեռնել manifest.json:', error.message);
    return;
  }

  // 3. Create backup
  try {
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(oldManifest, null, 2));
    console.log('✅ Backup ստեղծվեց:', BACKUP_PATH);
  } catch (error) {
    console.warn('⚠️ Backup չստեղծվեց:', error.message);
  }

  // 4. Convert to new format
  console.log('🔄 Փոխակերպում...');

  const entries = {};
  const stats = {
    hy: { total: 0, ready: 0, missing: 0 },
    en: { total: 0, ready: 0, missing: 0 },
    ru: { total: 0, ready: 0, missing: 0 },
  };

  let totalEntries = 0;

  // Iterate over all keys in the old manifest
  for (const [id, value] of Object.entries(oldManifest)) {
    // Skip metadata fields (if any)
    if (id === 'schemaVersion' || id === 'lastUpdated' || id === 'totalEntries' || 
        id === 'entries' || id === 'stats' || id === '_version') {
      continue;
    }

    entries[id] = {};
    let hasAny = false;

    for (const lang of LANGUAGES) {
      const url = value[lang] || null;
      const exists = url && typeof url === 'string' && url.includes(`/${lang}/`);
      
      if (exists) {
        entries[id][lang] = url;
        stats[lang].ready++;
        hasAny = true;
      } else {
        entries[id][lang] = null;
        stats[lang].missing++;
      }
      stats[lang].total++;
    }

    if (hasAny) {
      totalEntries++;
    }
  }

  // 5. Build new manifest
  const newManifest = {
    schemaVersion: 1,
    lastUpdated: new Date().toISOString(),
    totalEntries: totalEntries,
    entries: entries,
    stats: stats,
  };

  // 6. Write new manifest
  try {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(newManifest, null, 2));
    console.log('✅ Manifest պահպանվեց նոր ձևաչափով');
  } catch (error) {
    console.error('❌ Չհաջողվեց պահպանել manifest.json:', error.message);
    return;
  }

  // 7. Display statistics
  console.log('');
  console.log('📊 ՎԻՃԱԿԱԳՐՈՒԹՅՈՒՆ:');
  console.log(`   📝 Ընդհանուր բառեր: ${totalEntries}`);
  console.log('');
  console.log('   🇦🇲 Հայերեն (hy):');
  console.log(`      ✅ Ready: ${stats.hy.ready}`);
  console.log(`      ❌ Missing: ${stats.hy.missing}`);
  console.log(`      📊 Total: ${stats.hy.total}`);
  console.log('');
  console.log('   🇬🇧 Անգլերեն (en):');
  console.log(`      ✅ Ready: ${stats.en.ready}`);
  console.log(`      ❌ Missing: ${stats.en.missing}`);
  console.log(`      📊 Total: ${stats.en.total}`);
  console.log('');
  console.log('   🇷🇺 Ռուսերեն (ru):');
  console.log(`      ✅ Ready: ${stats.ru.ready}`);
  console.log(`      ❌ Missing: ${stats.ru.missing}`);
  console.log(`      📊 Total: ${stats.ru.total}`);
  console.log('');

  // 8. Check for issues
  const issues = [];
  if (stats.hy.ready === 0 && stats.hy.missing > 0) {
    issues.push('🇦🇲 Հայերենի աուդիո ֆայլերը բացակայում են manifest-ում');
  }
  if (stats.en.ready === 0 && stats.en.missing > 0) {
    issues.push('🇬🇧 Անգլերենի աուդիո ֆայլերը բացակայում են manifest-ում');
  }
  if (stats.ru.ready === 0 && stats.ru.missing > 0) {
    issues.push('🇷🇺 Ռուսերենի աուդիո ֆայլերը բացակայում են manifest-ում');
  }

  if (issues.length > 0) {
    console.log('⚠️ ԽՆԴԻՐՆԵՐ:');
    for (const issue of issues) {
      console.log(`   ${issue}`);
    }
  } else {
    console.log('✅ ԱՄԵՆ ԻՆՉ ԿԱՐԳԻՆ Է!');
    console.log('   Բոլոր լեզուների աուդիո ֆայլերը գրանցված են manifest-ում:');
  }

  console.log('');
  console.log('💡 Եթե TTS-ը չի աշխատում, ստուգեք browser-ի Speech Synthesis-ը:');
  console.log('💡 Backup-ը պահպանվել է:', BACKUP_PATH);
}

// ─── RUN ────────────────────────────────────────────────────────────

convertManifest();