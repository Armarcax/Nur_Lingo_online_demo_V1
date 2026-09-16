// full-system-check-final.js
// Գործարկել՝ node full-system-check-final.js

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = __dirname;
const PATHS = {
  dictionary: path.join(PROJECT_ROOT, 'data/dictionaries/unified-dictionary.json'),
  page: path.join(PROJECT_ROOT, 'src/app/dictionary/page.tsx'),  // ✅ src/ պանակում
  manifest: path.join(PROJECT_ROOT, 'public/audio/manifest.json'), // ✅ public/audio/ պանակում
  audioHy: path.join(PROJECT_ROOT, 'public/audio/hy'),
  audioEn: path.join(PROJECT_ROOT, 'public/audio/en'),
  audioRu: path.join(PROJECT_ROOT, 'public/audio/ru'),
};

console.log('🔍 ՍԿՍՎՈՒՄ Է ՀԱՄԱԿԱՐԳԻ ԱՄԲՈՂՋԱԿԱՆ ՍՏՈՒԳՈՒՄԸ...\n');
console.log('📁 Նախագծի արմատը:', PROJECT_ROOT);
console.log('=' .repeat(60));

// ============================================
// 1. ՍՏՈՒԳԵԼ unified-dictionary.json
// ============================================
console.log('\n📄 1. ՍՏՈՒԳՈՒՄ ԵՄ unified-dictionary.json');

let dict = [];
let dictErrors = [];

try {
  if (!fs.existsSync(PATHS.dictionary)) {
    dictErrors.push('❌ Ֆայլը բացակայում է');
  } else {
    const raw = fs.readFileSync(PATHS.dictionary, 'utf8');
    dict = JSON.parse(raw);
    console.log(`   ✅ Բառարանը բեռնված է: ${dict.length} բառ`);
  }
} catch (e) {
  dictErrors.push(`❌ JSON-ի սխալ: ${e.message}`);
}

// Ստուգել ID-ների կրկնություն
if (dict.length) {
  const ids = dict.map(item => item.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) {
    dictErrors.push(`❌ ԿԱՐԿՆՎՈՂ ID-ներ: ${duplicates.join(', ')}`);
  }

  // Ստուգել 889-900 ID-ները
  const problemIds = [];
  for (let i = 889; i <= 900; i++) {
    const id = String(i).padStart(6, '0');
    const item = dict.find(d => d.id === id);
    if (!item) {
      problemIds.push(id);
    }
  }
  if (problemIds.length) {
    dictErrors.push(`❌ 889-900 ID-ներից բացակայում են: ${problemIds.join(', ')}`);
  }

  // Ստուգել "եվ" սխալ ուղղագրությունը
  const wrongEv = dict.filter(item => item.hy?.includes('եվ'));
  if (wrongEv.length) {
    dictErrors.push(`❌ "եվ" ուղղագրությամբ բառեր (պետք է "և"): ${wrongEv.map(w => w.id).join(', ')}`);
  }
}

if (dictErrors.length) {
  console.log(`\n   ⚠️ ԳՏՆՎԵԼ ԵՆ ԽՆԴԻՐՆԵՐ:`);
  dictErrors.forEach(err => console.log(`   ${err}`));
} else {
  console.log('   ✅ Բառարանը ճիշտ է');
}

// ============================================
// 2. ՍՏՈՒԳԵԼ ԱՈՒԴԻՈ ՖԱՅԼԵՐԸ
// ============================================
console.log('\n🎵 2. ՍՏՈՒԳՈՒՄ ԵՄ ԱՈՒԴԻՈ ՖԱՅԼԵՐԸ');

const audioErrors = [];
const audioStats = { hy: { files: 0, missing: 0 }, en: { files: 0, missing: 0 }, ru: { files: 0, missing: 0 } };

['hy', 'en', 'ru'].forEach(lang => {
  const dir = PATHS[`audio${lang.charAt(0).toUpperCase() + lang.slice(1)}`];
  console.log(`\n   📁 /audio/${lang}/`);

  if (!fs.existsSync(dir)) {
    audioErrors.push(`❌ ${lang} պանակը բացակայում է: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mp3') || f.endsWith('.wav'));
  audioStats[lang].files = files.length;
  console.log(`      ✅ Գոյություն ունեցող ֆայլեր: ${files.length}`);

  // Ստուգել, թե բառարանում քանի ID պետք է ունենա աուդիո
  const dictIds = dict.map(item => item.id);
  const audioIds = files.map(f => f.replace('.mp3', '').replace('.wav', ''));

  // Գտնել բացակայող աուդիո ֆայլերը
  const missing = dictIds.filter(id => !audioIds.includes(id));
  audioStats[lang].missing = missing.length;

  if (missing.length) {
    audioErrors.push(`❌ ${lang}: բացակայում են ${missing.length} ֆայլեր`);
  }
});

// ============================================
// 3. ՍՏՈՒԳԵԼ manifest.json (public/audio/)
// ============================================
console.log('\n📱 3. ՍՏՈՒԳՈՒՄ ԵՄ manifest.json');

let manifestErrors = [];
let manifest = {};

try {
  if (!fs.existsSync(PATHS.manifest)) {
    manifestErrors.push('❌ manifest.json բացակայում է public/audio/ պանակում');
  } else {
    manifest = JSON.parse(fs.readFileSync(PATHS.manifest, 'utf8'));
    console.log(`   ✅ manifest.json բեռնված է (${Object.keys(manifest).length} entries)`);

    // Ստուգել, որ բոլոր ID-ները կան
    const manifestIds = Object.keys(manifest);
    const dictIds = dict.map(item => item.id);
    const missingInManifest = dictIds.filter(id => !manifestIds.includes(id));
    if (missingInManifest.length) {
      manifestErrors.push(`❌ Բացակայող entries manifest-ում: ${missingInManifest.length}`);
    }

    // Ստուգել 889-900 ID-ները manifest-ում
    const problemManifest = [];
    for (let i = 889; i <= 900; i++) {
      const id = String(i).padStart(6, '0');
      if (!manifest[id]) {
        problemManifest.push(id);
      }
    }
    if (problemManifest.length) {
      manifestErrors.push(`❌ 889-900 ID-ներից բացակայում են manifest-ում: ${problemManifest.join(', ')}`);
    }
  }
} catch (e) {
  manifestErrors.push(`❌ JSON-ի սխալ: ${e.message}`);
}

if (manifestErrors.length) {
  manifestErrors.forEach(err => console.log(`   ${err}`));
} else {
  console.log('   ✅ manifest.json ճիշտ է');
}

// ============================================
// 4. ՍՏՈՒԳԵԼ page.tsx
// ============================================
console.log('\n📄 4. ՍՏՈՒԳՈՒՄ ԵՄ page.tsx');

let pageErrors = [];
try {
  if (!fs.existsSync(PATHS.page)) {
    pageErrors.push('❌ page.tsx բացակայում է src/app/dictionary/ պանակում');
  } else {
    const content = fs.readFileSync(PATHS.page, 'utf8');
    console.log(`   ✅ page.tsx բեռնված է (${content.length} նիշ)`);

    // Ստուգել import-ները
    if (!content.includes('import unifiedDict from')) {
      pageErrors.push('❌ unifiedDict-ի import-ը բացակայում է կամ սխալ է');
    }

    // Ստուգել getAudioId ֆունկցիան
    if (!content.includes('const getAudioId =')) {
      pageErrors.push('❌ getAudioId ֆունկցիան բացակայում է');
    }

    // Ստուգել handleSpeak ֆունկցիան
    if (!content.includes('const handleSpeak =')) {
      pageErrors.push('❌ handleSpeak ֆունկցիան բացակայում է');
    }

    // Ստուգել useAudioManager-ի import-ը
    if (!content.includes('useAudioManager')) {
      pageErrors.push('❌ useAudioManager-ի import-ը բացակայում է');
    }
  }
} catch (e) {
  pageErrors.push(`❌ Սխալ: ${e.message}`);
}

if (pageErrors.length) {
  pageErrors.forEach(err => console.log(`   ${err}`));
} else {
  console.log('   ✅ page.tsx ճիշտ է');
}

// ============================================
// 5. ՍՏՈՒԳԵԼ ԱՈՒԴԻՈ ID-ՆԵՐԻ ՀԱՄԱՊԱՏԱՍԽԱՆՈՒԹՅՈՒՆԸ
// ============================================
console.log('\n🔊 5. ՍՏՈՒԳՈՒՄ ԵՄ ԱՈՒԴԻՈ ID-ՆԵՐԻ ՀԱՄԱՊԱՏԱՍԽԱՆՈՒԹՅՈՒՆԸ');

const audioMismatches = [];

dict.forEach(item => {
  if (item.audio?.hy) {
    const audioId = item.audio.hy.split('/').pop().replace('.mp3', '').replace('.wav', '');
    if (audioId !== item.id) {
      audioMismatches.push(`ID ${item.id}: աուդիո ID-ն ${audioId} է, պետք է լինի ${item.id}`);
    }
  }
});

if (audioMismatches.length) {
  console.log(`   ⚠️ ԳՏՆՎԵԼ ԵՆ ${audioMismatches.length} ԱՆՀԱՄԱՊԱՏԱՍԽԱՆՈՒԹՅՈՒՆՆԵՐ:`);
  audioMismatches.slice(0, 10).forEach(err => console.log(`   ${err}`));
  if (audioMismatches.length > 10) {
    console.log(`   ... և ևս ${audioMismatches.length - 10} սխալ`);
  }
} else {
  console.log('   ✅ Աուդիո ID-ները համապատասխանում են բառարանին');
}

// ============================================
// 6. ԱՄՓՈՓՈՒՄ
// ============================================
console.log('\n' + '=' .repeat(60));
console.log('📊 ԱՄՓՈՓՈՒՄ');

const totalErrors = dictErrors.length + audioErrors.length + manifestErrors.length + pageErrors.length + audioMismatches.length;

console.log(`\n📋 Բառարան: ${dict.length} բառ`);
console.log(`🎵 Աուդիո ֆայլեր:`);
Object.keys(audioStats).forEach(lang => {
  const s = audioStats[lang];
  console.log(`   /${lang}/: ${s.files} ֆայլ, ${s.missing} բացակայող`);
});
console.log(`📱 Manifest: ${Object.keys(manifest).length} entries`);

console.log(`\n❌ ԸՆԴՀԱՆՈՒՐ ՍԽԱԼՆԵՐ: ${totalErrors}`);

if (totalErrors === 0) {
  console.log('\n✅ ԲԱՐՁՐԱՑՈՒՑԻՉ! Համակարգը ամբողջությամբ ճիշտ է աշխատում:');
} else {
  console.log('\n⚠️ ԳՏՆՎԵԼ ԵՆ ԽՆԴԻՐՆԵՐ:');
  
  if (dictErrors.length) {
    console.log(`\n📄 Բառարան (${dictErrors.length}):`);
    dictErrors.forEach(err => console.log(`   ${err}`));
  }
  if (audioErrors.length) {
    console.log(`\n🎵 Աուդիո (${audioErrors.length}):`);
    audioErrors.forEach(err => console.log(`   ${err}`));
  }
  if (manifestErrors.length) {
    console.log(`\n📱 Manifest (${manifestErrors.length}):`);
    manifestErrors.forEach(err => console.log(`   ${err}`));
  }
  if (pageErrors.length) {
    console.log(`\n📄 Page (${pageErrors.length}):`);
    pageErrors.forEach(err => console.log(`   ${err}`));
  }
  if (audioMismatches.length) {
    console.log(`\n🔊 Աուդիո ID-ներ (${audioMismatches.length}):`);
    audioMismatches.slice(0, 10).forEach(err => console.log(`   ${err}`));
  }
}

console.log('\n💡 ԽՈՐՀՈՒՐԴՆԵՐ:');
if (manifestErrors.length) {
  console.log('   1. Ստուգեք, որ manifest.json-ը գտնվում է public/audio/ պանակում');
  console.log('   2. Համոզվեք, որ manifest.json-ում բոլոր ID-ները կան');
}
if (pageErrors.length) {
  console.log('   3. page.tsx-ը պետք է լինի src/app/dictionary/ պանակում');
}
if (audioMismatches.length) {
  console.log('   4. Աուդիո ֆայլերի անունները պետք է համընկնեն ID-ներին');
}

console.log('\n✅ Ստուգումն ավարտված է!');