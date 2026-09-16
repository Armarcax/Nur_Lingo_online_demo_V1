// find-duplicate-audio-hash.js
// Գործարկել՝ node find-duplicate-audio-hash.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PROJECT_ROOT = __dirname;
const PATHS = {
  dictionary: path.join(PROJECT_ROOT, 'data/dictionaries/unified-dictionary.json'),
  audioHy: path.join(PROJECT_ROOT, 'public/audio/hy'),
};

console.log('🔍 ՍԿՍՎՈՒՄ Է ԱՈՒԴԻՈ ՖԱՅԼԵՐԻ HASH-ՆԵՐԻ ՍՏՈՒԳՈՒՄ...\n');

// ============================================
// 1. ԲԵՌՆԵԼ ԲԱՌԱՐԱՆԸ
// ============================================
console.log('📄 1. Բեռնում եմ unified-dictionary.json...');

let dict = [];
try {
  const raw = fs.readFileSync(PATHS.dictionary, 'utf8');
  dict = JSON.parse(raw);
  console.log(`   ✅ Բառարանը բեռնված է: ${dict.length} բառ`);
} catch (e) {
  console.error(`   ❌ Սխալ: ${e.message}`);
  process.exit(1);
}

// ============================================
// 2. ՀԱՇՎԵԼ ԲՈԼՈՐ ԱՈՒԴԻՈ ՖԱՅԼԵՐԻ HASH-ՆԵՐԸ
// ============================================
console.log('\n🔐 2. Հաշվում եմ աուդիո ֆայլերի MD5 hash-ները...');

const audioHashes = {};
const audioFiles = [];

try {
  if (!fs.existsSync(PATHS.audioHy)) {
    console.error(`   ❌ /public/audio/hy/ պանակը բացակայում է!`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(PATHS.audioHy).filter(f => f.endsWith('.mp3') || f.endsWith('.wav'));
  
  files.forEach(file => {
    const id = file.replace('.mp3', '').replace('.wav', '');
    const filePath = path.join(PATHS.audioHy, file);
    const buffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    audioHashes[id] = hash;
    audioFiles.push(id);
  });
  
  console.log(`   ✅ Գտնվել է ${audioFiles.length} աուդիո ֆայլ`);
} catch (e) {
  console.error(`   ❌ Սխալ: ${e.message}`);
  process.exit(1);
}

// ============================================
// 3. ԽՄԲԱՎՈՐԵԼ ԸՍՏ HASH-Ի
// ============================================
console.log('\n📊 3. Խմբավորում եմ ըստ hash-ի...');

const hashGroups = {};
Object.entries(audioHashes).forEach(([id, hash]) => {
  if (!hashGroups[hash]) {
    hashGroups[hash] = [];
  }
  hashGroups[hash].push(id);
});

// Գտնել կրկնվող hash-եր
const duplicateHashes = Object.entries(hashGroups)
  .filter(([hash, ids]) => ids.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

console.log(`   ✅ Գտնվել է ${duplicateHashes.length} խումբ կրկնվող աուդիո ֆայլեր`);

// ============================================
// 4. ԳՏՆԵԼ ԽՆԴԻՐԱՀԱՐՈՒՅՑ ԲԱՌԵՐԸ
// ============================================
console.log('\n🔍 4. Գտնում եմ խնդրահարույց բառերը...');

// Խնդրահարույց բառեր (որոնց մասին հայտնել եք)
const problemWords = [
  'վերև', 'նաև', 'հետև', 'որովհետև', 'Լավ, ցտեսություն։'
];

// Գտնել խնդրահարույց բառերի ID-ները
const problemIds = [];
dict.forEach(item => {
  if (problemWords.some(word => item.hy.includes(word))) {
    problemIds.push({
      id: item.id,
      hy: item.hy,
      hash: audioHashes[item.id] || null,
    });
  }
});

console.log(`\n   📌 Խնդրահարույց բառեր (${problemIds.length}):`);
problemIds.forEach(item => {
  const hash = item.hash ? item.hash.substring(0, 8) + '...' : '❌ ԲԱՑԱԿԱՅՈՒՄ Է';
  console.log(`      ${item.id}: "${item.hy}" → hash: ${hash}`);
});

// ============================================
// 5. ՍՏՈՒԳԵԼ, ԹԵ ՈՐ ԲԱՌԵՐՆ ԵՆ ՆՈՒՅՆ HASH-Ը
// ============================================
console.log('\n🔊 5. Ստուգում եմ, թե որ բառերն ունեն նույն hash-ը...');

// Ստեղծել hash-ի քարտեզ
const hashMap = {};
duplicateHashes.forEach(([hash, ids]) => {
  hashMap[hash] = ids;
});

// Գտնել խնդրահարույց բառերի խմբերը
const problemGroups = [];
problemIds.forEach(item => {
  const hash = item.hash;
  if (hash && hashMap[hash] && hashMap[hash].length > 1) {
    problemGroups.push({
      word: item.hy,
      id: item.id,
      hash: hash,
      sameHashIds: hashMap[hash].filter(id => id !== item.id),
    });
  }
});

if (problemGroups.length > 0) {
  console.log(`\n   ❌ ԳՏՆՎԵԼ ԵՆ ԽՆԴԻՐԱՀԱՐՈՒՅՑ ԲԱՌԵՐ (${problemGroups.length}):`);
  problemGroups.forEach(group => {
    const sameWords = group.sameHashIds.map(id => {
      const item = dict.find(d => d.id === id);
      return item ? `${id}: "${item.hy}"` : id;
    });
    console.log(`\n      📝 ${group.id}: "${group.word}"`);
    console.log(`      🔄 Նույն hash-ով այլ բառեր (նույն աուդիո ֆայլը).`);
    sameWords.slice(0, 10).forEach(w => console.log(`         - ${w}`));
    if (sameWords.length > 10) {
      console.log(`         ... և ևս ${sameWords.length - 10} բառ`);
    }
  });
} else {
  console.log('   ✅ Խնդրահարույց բառեր չեն գտնվել');
}

// ============================================
// 6. ՑՈՒՑԱԴՐԵԼ ԲՈԼՈՐ ԿՐԿՆՎՈՂ ԽՄԲԵՐԸ
// ============================================
console.log('\n📋 6. ԲՈԼՈՐ ԿՐԿՆՎՈՂ ԱՈՒԴԻՈ ՖԱՅԼԵՐԻ ԽՄԲԵՐԸ (ըստ hash-ի)...');

console.log(`\n   📊 ԸՆԴՀԱՆՈՒՐԸ ${duplicateHashes.length} կրկնվող խումբ`);

duplicateHashes.forEach(([hash, ids], index) => {
  if (index < 20) { // Ցույց տալ առաջին 20 խումբը
    const words = ids.map(id => {
      const item = dict.find(d => d.id === id);
      return item ? `${id}: "${item.hy}"` : id;
    });
    console.log(`\n   🎵 Hash: ${hash.substring(0, 12)}... → ${ids.length} ֆայլ:`);
    words.slice(0, 5).forEach(w => console.log(`      ${w}`));
    if (words.length > 5) {
      console.log(`      ... և ևս ${words.length - 5} բառ`);
    }
  }
});

if (duplicateHashes.length > 20) {
  console.log(`\n   ... և ևս ${duplicateHashes.length - 20} խումբ`);
}

// ============================================
// 7. ՍՏՈՒԳԵԼ ՀԱՏՈՒԿ 889-900 ID-ՆԵՐԸ
// ============================================
console.log('\n🔍 7. Ստուգում եմ 889-900 ID-ները...');

const specialIds = [];
for (let i = 889; i <= 900; i++) {
  const id = String(i).padStart(6, '0');
  specialIds.push(id);
}

console.log('\n   📌 889-900 ID-ների hash-ները:');
specialIds.forEach(id => {
  const item = dict.find(d => d.id === id);
  const hash = audioHashes[id] || '❌ ԲԱՑԱԿԱՅՈՒՄ Է';
  const word = item ? item.hy : '?';
  const hashShort = hash !== '❌ ԲԱՑԱԿԱՅՈՒՄ Է' ? hash.substring(0, 8) + '...' : hash;
  console.log(`      ${id}: "${word}" → ${hashShort}`);
});

// ============================================
// 8. ՀԱՏՈՒԿ ՍՏՈՒԳՈՒՄ ԽՆԴԻՐԱՀԱՐՈՒՅՑ ԲԱՌԵՐԻ ՀԱՄԱՐ
// ============================================
console.log('\n🔍 8. ՍՏՈՒԳՈՒՄ ԵՄ, ԹԵ ՈՐ ԲԱՌԵՐՆ ՈՒՆԵՆ ՆՈՒՅՆ HASH-Ը ԽՆԴԻՐԱՀԱՐՈՒՅՑ ԲԱՌԵՐԻ ՀԵՏ...');

// Ստուգել 000914 (վերև)
const checkId = '000914';
const checkHash = audioHashes[checkId];
if (checkHash) {
  const sameHashIds = hashGroups[checkHash] || [];
  if (sameHashIds.length > 1) {
    console.log(`\n   📝 ${checkId}: "վերև" → նույն hash-ը ունի հետևյալ բառերի հետ:`);
    sameHashIds.filter(id => id !== checkId).forEach(id => {
      const item = dict.find(d => d.id === id);
      console.log(`      - ${id}: "${item ? item.hy : '?'}"`);
    });
  }
}

// Ստուգել 000938 (նաև)
const checkId2 = '000938';
const checkHash2 = audioHashes[checkId2];
if (checkHash2) {
  const sameHashIds2 = hashGroups[checkHash2] || [];
  if (sameHashIds2.length > 1) {
    console.log(`\n   📝 ${checkId2}: "նաև" → նույն hash-ը ունի հետևյալ բառերի հետ:`);
    sameHashIds2.filter(id => id !== checkId2).forEach(id => {
      const item = dict.find(d => d.id === id);
      console.log(`      - ${id}: "${item ? item.hy : '?'}"`);
    });
  }
}

// Ստուգել 000939 (հետև)
const checkId3 = '000939';
const checkHash3 = audioHashes[checkId3];
if (checkHash3) {
  const sameHashIds3 = hashGroups[checkHash3] || [];
  if (sameHashIds3.length > 1) {
    console.log(`\n   📝 ${checkId3}: "հետև" → նույն hash-ը ունի հետևյալ բառերի հետ:`);
    sameHashIds3.filter(id => id !== checkId3).forEach(id => {
      const item = dict.find(d => d.id === id);
      console.log(`      - ${id}: "${item ? item.hy : '?'}"`);
    });
  }
}

// ============================================
// 9. ԱՄՓՈՓՈՒՄ
// ============================================
console.log('\n' + '=' .repeat(60));
console.log('📊 ԱՄՓՈՓՈՒՄ');

console.log(`\n📋 Բառարան: ${dict.length} բառ`);
console.log(`🎵 Աուդիո ֆայլեր: ${audioFiles.length}`);
console.log(`📊 Կրկնվող hash-ներ: ${duplicateHashes.length} խումբ`);
console.log(`🔴 Խնդրահարույց բառեր: ${problemGroups.length}`);

// Հաշվել, թե քանի բառ է նվագարկում նույն աուդիոն
let duplicateWordsCount = 0;
duplicateHashes.forEach(([hash, ids]) => {
  duplicateWordsCount += ids.length;
});

console.log(`📊 Կրկնվող աուդիո նվագարկող բառեր: ${duplicateWordsCount - duplicateHashes.length}`);

if (problemGroups.length === 0) {
  console.log('\n✅ ԲԱՐՁՐԱՑՈՒՑԻՉ! Խնդրահարույց բառեր չեն գտնվել:');
} else {
  console.log(`\n⚠️ ԳՏՆՎԵԼ ԵՆ ${problemGroups.length} ԽՆԴԻՐԱՀԱՐՈՒՅՑ ԲԱՌԵՐ:`);
  problemGroups.forEach(group => {
    console.log(`   - ${group.id}: "${group.word}" → նույն աուդիոն է ${group.sameHashIds.length} այլ բառերի հետ`);
  });
}

console.log('\n✅ Ստուգումն ավարտված է!');