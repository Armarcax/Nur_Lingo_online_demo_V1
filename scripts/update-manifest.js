// update-manifest.js
// Գործարկել՝ node update-manifest.js

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = __dirname;
const PATHS = {
  dictionary: path.join(PROJECT_ROOT, 'data/dictionaries/unified-dictionary.json'),
  manifest: path.join(PROJECT_ROOT, 'public/audio/manifest.json'),
};

console.log('🔍 ՍԿՍՎՈՒՄ Է MANIFEST.JSON-Ի ԹԱՐՄԱՑՈՒՄԸ...\n');

// ============================================
// 1. ԲԵՌՆԵԼ ԲԱՌԱՐԱՆԸ
// ============================================
console.log('📄 1. Բեռնում եմ unified-dictionary.json...');

let dict = [];
try {
  if (!fs.existsSync(PATHS.dictionary)) {
    console.error('❌ unified-dictionary.json բացակայում է!');
    process.exit(1);
  }
  const raw = fs.readFileSync(PATHS.dictionary, 'utf8');
  dict = JSON.parse(raw);
  console.log(`   ✅ Բառարանը բեռնված է: ${dict.length} բառ`);
} catch (e) {
  console.error(`❌ Սխալ բառարանը կարդալիս: ${e.message}`);
  process.exit(1);
}

// ============================================
// 2. ԲԵՌՆԵԼ MANIFEST.JSON
// ============================================
console.log('\n📱 2. Բեռնում եմ manifest.json...');

let manifest = {};
try {
  if (fs.existsSync(PATHS.manifest)) {
    const raw = fs.readFileSync(PATHS.manifest, 'utf8');
    manifest = JSON.parse(raw);
    console.log(`   ✅ manifest.json բեռնված է: ${Object.keys(manifest).length} entries`);
  } else {
    console.log('   ⚠️ manifest.json բացակայում է, կստեղծվի նորը');
  }
} catch (e) {
  console.error(`❌ Սխալ manifest.json-ը կարդալիս: ${e.message}`);
  process.exit(1);
}

// ============================================
// 3. ԹԱՐՄԱՑՆԵԼ MANIFEST.JSON-Ը
// ============================================
console.log('\n🔄 3. Թարմացնում եմ manifest.json-ը...');

let added = 0;
let updated = 0;
let unchanged = 0;

// Ստանալ գոյություն ունեցող ID-ները
const existingIds = new Set(Object.keys(manifest));

// Անցնել բառարանով
dict.forEach(item => {
  const id = item.id;
  
  // Ստուգել, արդյոք ID-ն արդեն կա manifest-ում
  if (existingIds.has(id)) {
    // Ստուգել, արդյոք աուդիո ուղիները ճիշտ են
    const entry = manifest[id];
    let needsUpdate = false;
    
    // Ստուգել, որ բոլոր լեզուների աուդիոն կա
    ['hy', 'en', 'ru'].forEach(lang => {
      const expectedPath = `/audio/${lang}/${id}.mp3`;
      if (!entry[lang] || entry[lang] !== expectedPath) {
        entry[lang] = expectedPath;
        needsUpdate = true;
      }
    });
    
    if (needsUpdate) {
      updated++;
    } else {
      unchanged++;
    }
  } else {
    // ID-ն բացակայում է, ավելացնել
    manifest[id] = {
      hy: `/audio/hy/${id}.mp3`,
      en: `/audio/en/${id}.mp3`,
      ru: `/audio/ru/${id}.mp3`,
    };
    added++;
  }
});

console.log(`   📊 Վիճակագրություն:`);
console.log(`      ✅ Ավելացված նոր entries: ${added}`);
console.log(`      🔄 Թարմացված entries: ${updated}`);
console.log(`      ⏸️  Անփոփոխ entries: ${unchanged}`);

// ============================================
// 4. ՍՏՈՒԳԵԼ ԱՎԵԼՈՐԴ ENTRIES (որոնք չկան բառարանում)
// ============================================
console.log('\n🔍 4. Ստուգում եմ ավելորդ entries...');

const dictIds = new Set(dict.map(item => item.id));
const extraIds = Object.keys(manifest).filter(id => !dictIds.has(id));

if (extraIds.length) {
  console.log(`   ⚠️ Գտնվել են ${extraIds.length} ավելորդ entries, որոնք չկան բառարանում:`);
  extraIds.slice(0, 10).forEach(id => console.log(`      - ${id}`));
  if (extraIds.length > 10) {
    console.log(`      ... և ևս ${extraIds.length - 10} հատ`);
  }
  console.log(`\n   💡 Այս entries-ները կարելի է ջնջել, բայց սկրիպտը չի ջնջում դրանք:`);
} else {
  console.log('   ✅ Ավելորդ entries չկան');
}

// ============================================
// 5. ՊԱՀՊԱՆԵԼ ԹԱՐՄԱՑՎԱԾ MANIFEST.JSON-Ը
// ============================================
console.log('\n💾 5. Պահպանում եմ թարմացված manifest.json-ը...');

try {
  // Սորտավորել ըստ ID-ների (ըստ ցանկության)
  const sortedManifest = {};
  Object.keys(manifest)
    .sort((a, b) => a.localeCompare(b))
    .forEach(key => {
      sortedManifest[key] = manifest[key];
    });
  
  // Գրել ֆայլը
  fs.writeFileSync(PATHS.manifest, JSON.stringify(sortedManifest, null, 2), 'utf8');
  console.log(`   ✅ manifest.json թարմացվել է (${Object.keys(sortedManifest).length} entries)`);
} catch (e) {
  console.error(`   ❌ Սխալ manifest.json-ը պահպանելիս: ${e.message}`);
  process.exit(1);
}

// ============================================
// 6. ԱՄՓՈՓՈՒՄ
// ============================================
console.log('\n' + '=' .repeat(60));
console.log('📊 ԱՄՓՈՓՈՒՄ');

const totalDict = dict.length;
const totalManifest = Object.keys(manifest).length;

console.log(`\n📋 Բառարան: ${totalDict} բառ`);
console.log(`📱 Manifest: ${totalManifest} entries`);
console.log(`📊 Տարբերություն: ${totalManifest - totalDict} (${totalManifest > totalDict ? 'ավելորդ' : 'պակաս'})`);

if (totalManifest === totalDict) {
  console.log('\n✅ ԲԱՐՁՐԱՑՈՒՑԻՉ! Manifest.json-ը ամբողջությամբ համապատասխանում է բառարանին:');
} else if (totalManifest > totalDict) {
  console.log(`\n⚠️ Manifest.json-ում կան ${totalManifest - totalDict} ավելորդ entries`);
  console.log('💡 Դրանք կարելի է ձեռքով ջնջել կամ թողնել, եթե անհրաժեշտ են');
} else {
  console.log(`\n⚠️ Manifest.json-ում բացակայում են ${totalDict - totalManifest} entries`);
  console.log('💡 Վերագործարկեք սկրիպտը՝ բացակայողները ավելացնելու համար');
}

// ============================================
// 7. ԼՐԱՑՈՒՑԻՉ ՍՏՈՒԳՈՒՄ 889-900 ID-ՆԵՐԻ ՀԱՄԱՐ
// ============================================
console.log('\n🔍 7. Ստուգում եմ 889-900 ID-ները...');

const problemIds = [];
for (let i = 889; i <= 900; i++) {
  const id = String(i).padStart(6, '0');
  if (!manifest[id]) {
    problemIds.push(id);
  }
}

if (problemIds.length) {
  console.log(`   ⚠️ 889-900 ID-ներից բացակայում են: ${problemIds.join(', ')}`);
} else {
  console.log('   ✅ 889-900 ID-ները առկա են');
}

console.log('\n✅ Թարմացումն ավարտված է!');