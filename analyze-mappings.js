// analyze-mappings.js
const fs = require('fs');
const path = require('path');

// ✅ Բոլոր ֆայլերի ուղիները
const files = {
  'exercise-to-audio': './src/lib/content/exercise-to-audio.json',
  'audio-num-hy': './src/lib/content/mappings/audio-num-hy-mapping.json',
  'audio-num-en': './src/lib/content/mappings/audio-num-en-mapping.json',
  'audio-num-ru': './src/lib/content/mappings/audio-num-ru-mapping.json',
  'audio-num-unified': './src/lib/content/mappings/audio-num-unified.json',
  'lesson-dictionary': './data/dictionaries/lesson-dictionary.json',
  'lesson-dictionary-bak': './data/dictionaries/lesson-dictionary.json.bak',
  'manifest-dictionary': './public/audio/offline_dictionary/manifest_dictionary.json',
  'user-manifest': './public/audio/offline_user_dictionary/user_manifest.json',
};

console.log('📊 ՄԱՓԻՆԳՆԵՐԻ ԿԱՌՈՒՑՎԱԾՔԻ ՎԵՐԼՈՒԾՈՒԹՅՈՒՆ');
console.log('=' .repeat(70));
console.log();

for (const [name, filePath] of Object.entries(files)) {
  console.log(`📁 ${name}: ${filePath}`);
  
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`   ❌ ՖԱՅԼԸ ՉԿԱ`);
      console.log();
      continue;
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    const data = JSON.parse(content);
    
    // Որոշել տիպը
    let type = 'unknown';
    let keys = [];
    let entries = [];
    
    if (Array.isArray(data)) {
      type = 'array';
      entries = data.slice(0, 50);
    } else if (data && typeof data === 'object') {
      // Ստուգել, թե ինչ կառուցվածք է
      if (data.mapping && typeof data.mapping === 'object') {
        type = 'manifest_with_mapping';
        keys = Object.keys(data.mapping).slice(0, 50);
        entries = Object.entries(data.mapping).slice(0, 50);
      } else if (data.entries && typeof data.entries === 'object') {
        type = 'manifest_with_entries';
        keys = Object.keys(data.entries).slice(0, 50);
        entries = Object.entries(data.entries).slice(0, 50);
      } else if (data.version || data.generatedAt || data.voice) {
        type = 'metadata_manifest';
        keys = Object.keys(data).slice(0, 50);
        // Ցույց տալ հիմնական metadata-ն
        console.log(`   📋 ՏԻՊ: Metadata Manifest`);
        console.log(`   📊 ԸՆԴՀԱՆՈՒՐ: ${Object.keys(data).length} keys`);
        if (data.version) console.log(`   📌 version: ${data.version}`);
        if (data.generatedAt) console.log(`   📌 generatedAt: ${data.generatedAt}`);
        if (data.voice) console.log(`   📌 voice: ${data.voice}`);
        if (data.totalFiles) console.log(`   📌 totalFiles: ${data.totalFiles}`);
        if (data.mapping) {
          const mappingKeys = Object.keys(data.mapping).slice(0, 10);
          console.log(`   📌 mapping keys (first 10): ${mappingKeys.join(', ')}`);
        }
        console.log();
        continue;
      } else {
        // Պարզ object - ստուգել, թե արդյոք սա mapping է
        const firstKey = Object.keys(data)[0];
        if (firstKey && typeof data[firstKey] === 'string') {
          type = 'simple_mapping';
          keys = Object.keys(data).slice(0, 50);
          entries = Object.entries(data).slice(0, 50);
        } else {
          type = 'complex_object';
          keys = Object.keys(data).slice(0, 50);
        }
      }
    }
    
    console.log(`   📋 ՏԻՊ: ${type}`);
    console.log(`   📊 ԸՆԴՀԱՆՈՒՐ: ${keys.length} entries (first 50 shown)`);
    
    if (entries.length > 0) {
      console.log(`   📋 ԱՌԱՋԻՆ 10 ENTRY-ՆԵՐԸ:`);
      const showEntries = entries.slice(0, 10);
      showEntries.forEach(([key, value], index) => {
        if (typeof value === 'object') {
          console.log(`      ${index + 1}. ${key}: ${JSON.stringify(value).slice(0, 80)}...`);
        } else {
          console.log(`      ${index + 1}. ${key}: ${value}`);
        }
      });
    }
    
    // Ցույց տալ կառուցվածքի օրինակ
    console.log(`   📐 ԿԱՌՈՒՑՎԱԾՔԻ ՕՐԻՆԱԿ:`);
    const sample = entries.length > 0 ? entries[0] : null;
    if (sample) {
      if (Array.isArray(sample)) {
        console.log(`      [${sample[0]}, ${sample[1]}]`);
      } else if (typeof sample === 'object') {
        console.log(`      ${JSON.stringify(sample).slice(0, 100)}...`);
      } else {
        console.log(`      ${sample}`);
      }
    } else {
      console.log(`      (empty)`);
    }
    
    console.log();
    
  } catch (error) {
    console.log(`   ❌ ՍԽԱԼ: ${error.message}`);
    console.log();
  }
}

// ✅ ԱՄՓՈՓՈՒՄ
console.log('=' .repeat(70));
console.log('📊 ԱՄՓՈՓՈՒՄ');
console.log('=' .repeat(70));

// Ստուգել, թե որ ֆայլերն ունեն նույն կառուցվածքը
console.log(`
🔍 ԿԱՐԵՎՈՐ ԴԻՏԱՐԿՈՒՄՆԵՐ:

1. exercise-to-audio.json - 5017 entries ✅
   → ՍԱ Է ՀԻՄՆԱԿԱՆ ՄԱՓԻՆԳԸ

2. audio-num-*.json - Փոքր ֆայլեր (7-12 entries)
   → ՍՐԱՆՑ ԿԱՌՈՒՑՎԱԾՔԸ ՊԵՏՔ Է ՀԱՄԱՊԱՏԱՍԽԱՆԻ exercise-to-audio.json-ԻՆ

3. lesson-dictionary.json - Դասերի բառարան
   → ՊԱՐՈՒՆԱԿՈՒՄ Է vocabulary-ի ցանկ

4. manifest_dictionary.json - Dictionary audio manifest
   → Ունի entries կամ mapping դաշտ

5. user_manifest.json - User audio manifest
   → Նույն կառուցվածքը, ինչ dictionary-ինը
`);

console.log('✅ ՎԵՐԼՈՒԾՈՒԹՅՈՒՆՆ ԱՎԱՐՏՎԵՑ');