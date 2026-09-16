// scripts/migrate-user-dictionary.js
// Գործարկել՝ node scripts/migrate-user-dictionary.js

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const SOURCE = path.join(PROJECT_ROOT, 'src/lib/lexicon/master-dictionary.json');
const TARGET = path.join(PROJECT_ROOT, 'data/dictionaries/user-dictionary.json');

console.log('🔍 ՍԿՍՎՈՒՄ Է ՕԳՏԱՏԵՐԻ ԲԱՌԱՐԱՆԻ ՄԻԳՐԱՑԻԱ...\n');

try {
  // 1. Ստուգել, արդյոք master-dictionary.json գոյություն ունի
  if (!fs.existsSync(SOURCE)) {
    console.log('⚠️ master-dictionary.json բացակայում է, ստեղծվում է դատարկ բառարան...');
    fs.writeFileSync(TARGET, JSON.stringify([], null, 2));
    console.log('✅ Ստեղծվել է դատարկ user-dictionary.json');
    process.exit(0);
  }

  // 2. Բեռնել master-dictionary.json
  const raw = fs.readFileSync(SOURCE, 'utf8');
  const masterData = JSON.parse(raw);
  console.log(`📖 master-dictionary.json բեռնված է`);

  // ✅ Ստուգել, թե ինչ տիպ է masterData-ն
  let masterDict = [];
  if (Array.isArray(masterData)) {
    masterDict = masterData;
    console.log(`   📊 Զանգված է, ${masterDict.length} բառ`);
  } else if (typeof masterData === 'object' && masterData !== null) {
    // Եթե օբյեկտ է, փոխարկել զանգվածի
    console.log(`   📊 Օբյեկտ է, փոխարկվում է զանգվածի...`);
    masterDict = Object.values(masterData);
    console.log(`   📊 Փոխարկվել է, ${masterDict.length} բառ`);
  } else {
    console.log(`   ⚠️ Անհայտ տիպ: ${typeof masterData}`);
    masterDict = [];
  }

  // 3. Բեռնել հիմնական բառարանը
  const baseDictPath = path.join(PROJECT_ROOT, 'data/dictionaries/unified-dictionary.json');
  let baseDict = [];
  if (fs.existsSync(baseDictPath)) {
    const baseRaw = fs.readFileSync(baseDictPath, 'utf8');
    const baseData = JSON.parse(baseRaw);
    if (Array.isArray(baseData)) {
      baseDict = baseData;
    } else if (typeof baseData === 'object' && baseData !== null) {
      baseDict = Object.values(baseData);
    }
    console.log(`📖 unified-dictionary.json բեռնված է (${baseDict.length} բառ)`);
  }

  // 4. Ստեղծել հիմնական բառերի set
  const baseWords = new Set(baseDict.map(item => item.hy || item.word || item.text || ''));

  // 5. Ֆիլտրել միայն նոր բառերը
  const userDict = masterDict
    .filter(item => {
      const word = item.hy || item.word || item.text || '';
      return word && !baseWords.has(word);
    })
    .map((item, index) => {
      // Ստանալ բառը
      const word = item.hy || item.word || item.text || '';
      const en = item.en || item.english || item.translation || word;
      const ru = item.ru || item.russian || item.translation_ru || word;
      
      return {
        id: String(900000 + index + 1).padStart(6, '0'),
        hy: word,
        en: en,
        ru: ru,
        type: item.type || 'user',
        isUserAdded: true,
        original_id: item.id || null,
      };
    });

  console.log(`📊 Ավելացվել են ${userDict.length} նոր բառեր օգտատերերի բառարանում`);

  // 6. Պահպանել user-dictionary.json
  fs.writeFileSync(TARGET, JSON.stringify(userDict, null, 2));
  console.log(`✅ Պահպանվել է user-dictionary.json (${userDict.length} բառ)`);

  // 7. Ցույց տալ առաջին 5 բառը
  if (userDict.length > 0) {
    console.log('\n📝 Առաջին 5 ավելացված բառը:');
    userDict.slice(0, 5).forEach(item => {
      console.log(`   ${item.id}: ${item.hy} → ${item.en}`);
    });
    if (userDict.length > 5) {
      console.log(`   ... և ևս ${userDict.length - 5} բառ`);
    }
  }

  // 8. Ստեղծել .gitignore-ում ավելացնելու հրահանգ
  console.log('\n💡 Ավելացրեք .gitignore-ում՝');
  console.log('   data/dictionaries/user-dictionary.json');

} catch (error) {
  console.error('❌ Սխալ:', error.message);
  console.error('   ', error.stack);
  process.exit(1);
}

console.log('\n✅ ՄԻԳՐԱՑԻԱՆ ԱՎԱՐՏՎԱԾ Է!');