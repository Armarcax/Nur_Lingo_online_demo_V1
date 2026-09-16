// diagnose-audio.js
const fs = require('fs');
const path = require('path');

console.log('🔍 ԱՈՒԴԻՈ ՀԱՄԱԿԱՐԳԻ ԴԻԱԳՆՈՍՏԻԿԱ');
console.log('=' .repeat(60));
console.log();

// ─── 1. ՍՏՈՒԳԵԼ ԱՈՒԴԻՈ ՊԱՆԱԿՆԵՐԸ ──────────────────────────────

console.log('📁 1. ԱՈՒԴԻՈ ՊԱՆԱԿՆԵՐԻ ՍՏՈՒԳՈՒՄ');
console.log('-'.repeat(40));

const audioDirs = [
  { name: 'hy_Ani', path: 'public/audio/offline/hy_Ani' },
  { name: 'en_female', path: 'public/audio/offline/en_female' },
  { name: 'ru_female', path: 'public/audio/offline/ru_female' },
  { name: 'dictionary_hy', path: 'public/audio/offline_dictionary/hy' },
  { name: 'dictionary_en', path: 'public/audio/offline_dictionary/en' },
  { name: 'dictionary_ru', path: 'public/audio/offline_dictionary/ru' },
  { name: 'dictionary_avet', path: 'public/audio/offline_dictionary/Avet' },
  { name: 'user_hy', path: 'public/audio/offline_user_dictionary/hy_user' },
  { name: 'user_en', path: 'public/audio/offline_user_dictionary/en_user' },
  { name: 'user_ru', path: 'public/audio/offline_user_dictionary/ru_user' },
];

for (const dir of audioDirs) {
  const fullPath = path.join(process.cwd(), dir.path);
  if (fs.existsSync(fullPath)) {
    const files = fs.readdirSync(fullPath);
    const mp3Files = files.filter(f => f.endsWith('.mp3'));
    const sample = mp3Files.slice(0, 5);
    console.log(`✅ ${dir.name}: ${mp3Files.length} ֆայլ`);
    console.log(`   📄 Օրինակներ: ${sample.join(', ')}`);
  } else {
    console.log(`❌ ${dir.name}: Պանակը բացակայում է`);
  }
}

console.log();

// ─── 2. ՍՏՈՒԳԵԼ MAPPING ՖԱՅԼԵՐԸ ──────────────────────────────────

console.log('📋 2. MAPPING ՖԱՅԼԵՐԻ ՍՏՈՒԳՈՒՄ');
console.log('-'.repeat(40));

const mappingFiles = [
  { name: 'exercise-to-audio.json', path: 'src/lib/content/exercise-to-audio.json' },
  { name: 'audio-num-hy.json', path: 'src/lib/content/mappings/audio-num-hy-mapping.json' },
  { name: 'audio-num-en.json', path: 'src/lib/content/mappings/audio-num-en-mapping.json' },
  { name: 'audio-num-ru.json', path: 'src/lib/content/mappings/audio-num-ru-mapping.json' },
  { name: 'audio-num-unified.json', path: 'src/lib/content/mappings/audio-num-unified.json' },
];

for (const file of mappingFiles) {
  const fullPath = path.join(process.cwd(), file.path);
  if (fs.existsSync(fullPath)) {
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const data = JSON.parse(content);
      
      // Որոշել տիպը
      let type = 'unknown';
      let count = 0;
      let sample = [];
      
      if (Array.isArray(data)) {
        type = 'array';
        count = data.length;
        sample = data.slice(0, 3);
      } else if (data && typeof data === 'object') {
        if (data.mapping) {
          type = 'with_mapping';
          count = Object.keys(data.mapping).length;
          sample = Object.keys(data.mapping).slice(0, 5);
        } else if (data.entries) {
          type = 'with_entries';
          count = Object.keys(data.entries).length;
          sample = Object.keys(data.entries).slice(0, 5);
        } else {
          type = 'simple_object';
          count = Object.keys(data).length;
          sample = Object.keys(data).slice(0, 5);
        }
      }
      
      console.log(`✅ ${file.name}: ${count} entries (${type})`);
      if (sample.length > 0) {
        console.log(`   📄 Օրինակներ: ${sample.join(', ')}`);
      }
    } catch (e) {
      console.log(`❌ ${file.name}: Սխալ - ${e.message}`);
    }
  } else {
    console.log(`❌ ${file.name}: Ֆայլը բացակայում է`);
  }
}

console.log();

// ─── 3. ՍՏՈՒԳԵԼ MANIFEST ՖԱՅԼԵՐԸ ──────────────────────────────────

console.log('📦 3. MANIFEST ՖԱՅԼԵՐԻ ՍՏՈՒԳՈՒՄ');
console.log('-'.repeat(40));

const manifestFiles = [
  { name: 'manifest_hy_ani.json', path: 'public/audio/offline/manifest_hy_ani.json' },
  { name: 'manifest_en_female.json', path: 'public/audio/offline/manifest_en_female.json' },
  { name: 'manifest_ru_female.json', path: 'public/audio/offline/manifest_ru_female.json' },
  { name: 'manifest_dictionary.json', path: 'public/audio/offline_dictionary/manifest_dictionary.json' },
  { name: 'user_manifest.json', path: 'public/audio/offline_user_dictionary/user_manifest.json' },
];

for (const file of manifestFiles) {
  const fullPath = path.join(process.cwd(), file.path);
  if (fs.existsSync(fullPath)) {
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const data = JSON.parse(content);
      const keys = Object.keys(data);
      console.log(`✅ ${file.name}: ${keys.length} keys`);
      console.log(`   📄 Keys: ${keys.slice(0, 5).join(', ')}`);
    } catch (e) {
      console.log(`❌ ${file.name}: Սխալ - ${e.message}`);
    }
  } else {
    console.log(`ℹ️ ${file.name}: Ֆայլը բացակայում է (կարևոր չէ)`);
  }
}

console.log();

// ─── 4. ՍՏՈՒԳԵԼ EXERCISE-TO-AUDIO-Ի ԿԱՌՈՒՑՎԱԾՔԸ ────────────────

console.log('📊 4. EXERCISE-TO-AUDIO JSON-Ի ՎԵՐԼՈՒԾՈՒԹՅՈՒՆ');
console.log('-'.repeat(40));

try {
  const fullPath = path.join(process.cwd(), 'src/lib/content/exercise-to-audio.json');
  const content = fs.readFileSync(fullPath, 'utf-8');
  const data = JSON.parse(content);
  
  const keys = Object.keys(data);
  console.log(`📊 Ընդհանուր entries: ${keys.length}`);
  
  // Վերլուծել տիպերը
  const types = {
    mc: 0,
    tr: 0,
    e: 0,
    listening: 0,
    word_order: 0,
    match_pairs: 0,
    other: 0,
    greet: 0,
  };
  
  const sampleKeys = [];
  let greetCount = 0;
  
  for (const key of keys) {
    if (key.startsWith('w') && key.includes('_mc_')) types.mc++;
    else if (key.startsWith('w') && key.includes('_tr_')) types.tr++;
    else if (key.startsWith('w') && key.includes('_e_')) types.e++;
    else if (key.includes('listening')) types.listening++;
    else if (key.includes('word_order')) types.word_order++;
    else if (key.includes('match_pairs')) types.match_pairs++;
    else if (key.startsWith('greet_')) {
      types.greet++;
      greetCount++;
    }
    else types.other++;
    
    if (sampleKeys.length < 10) {
      sampleKeys.push(key);
    }
  }
  
  console.log(`📊 Տիպերի բաշխում:`);
  console.log(`   📝 MC: ${types.mc}`);
  console.log(`   📝 TR: ${types.tr}`);
  console.log(`   📝 E: ${types.e}`);
  console.log(`   📝 Listening: ${types.listening}`);
  console.log(`   📝 Word Order: ${types.word_order}`);
  console.log(`   📝 Match Pairs: ${types.match_pairs}`);
  console.log(`   📝 Greetings: ${types.greet}`);
  console.log(`   📝 Other: ${types.other}`);
  
  // Ցույց տալ առաջին 10-ը
  console.log(`\n📋 Առաջին 10 keys:`);
  for (const key of sampleKeys) {
    console.log(`   ${key}: ${data[key]}`);
  }
  
  // Ցույց տալ վերջին 10-ը
  console.log(`\n📋 Վերջին 10 keys:`);
  const lastKeys = keys.slice(-10);
  for (const key of lastKeys) {
    console.log(`   ${key}: ${data[key]}`);
  }
  
} catch (e) {
  console.log(`❌ Սխալ: ${e.message}`);
}

console.log();

// ─── 5. ԱՄՓՈՓՈՒՄ ──────────────────────────────────────────────────

console.log('📊 5. ԱՄՓՈՓՈՒՄ');
console.log('=' .repeat(60));

console.log(`
🔍 ԴԻՏԱՐԿՈՒՄՆԵՐ:

1. Աուդիո ֆայլերը գտնվում են public/audio/offline/*/ պանակներում
2. exercise-to-audio.json-ը պարունակում է ${Object.keys(JSON.parse(fs.readFileSync('src/lib/content/exercise-to-audio.json', 'utf-8'))).length} entries
3. Աուդիո ֆայլերը 6-նիշ ID-ներով են (000001.mp3, 000002.mp3, ...)

💡 ԱՌԱՋԱՐԿՆԵՐ:

1. Resolver-ը պետք է ստուգի ֆայլի գոյությունը
2. generate-tts API-ն պետք է ստեղծվի
3. useLessonAudio-ն պետք է նվազեցնի փորձերի քանակը
`);

console.log('✅ ԴԻԱԳՆՈՍՏԻԿԱՆ ԱՎԱՐՏՎԵՑ');