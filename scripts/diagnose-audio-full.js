// scripts/diagnose-audio-full.js
const fs = require('fs');
const path = require('path');

console.log('🔍 ԱՈՒԴԻՈ ՀԱՄԱԿԱՐԳԻ ԱՄԲՈՂՋԱԿԱՆ ՍՏՈՒԳՈՒՄ');
console.log('═'.repeat(80));

// ============================================================
// 1. ՍՏՈՒԳԵՆՔ ԱՈՒԴԻՈ ՖԱՅԼԵՐԸ
// ============================================================
console.log('\n📁 1. Ստուգում ենք աուդիո ֆայլերը...');
console.log('─'.repeat(80));

const audioDir = path.join(process.cwd(), 'public/audio');
const offlineDir = path.join(audioDir, 'offline');

const audioFolders = {
  hy: ['hy_Ani', 'hy_Areg'],
  en: ['en_female', 'en_male'],
  ru: ['ru_female', 'ru_male']
};

const audioFiles = {};

for (const [lang, folders] of Object.entries(audioFolders)) {
  audioFiles[lang] = {};
  for (const folder of folders) {
    const folderPath = path.join(offlineDir, folder);
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp3') || f.endsWith('.wav'));
      audioFiles[lang][folder] = files.length;
      console.log(`✅ ${lang}/${folder}: ${files.length} ֆայլ`);
      if (files.length > 0) {
        console.log(`   📄 Օրինակ: ${files.slice(0, 3).join(', ')}`);
      }
    } else {
      console.log(`❌ ${lang}/${folder}: ՉԿԱ`);
    }
  }
}

// ============================================================
// 2. ՍՏՈՒԳԵՆՔ EXERCISE_TO_AUDIO-Ն
// ============================================================
console.log('\n📄 2. Ստուգում ենք EXERCISE_TO_AUDIO-ն...');
console.log('─'.repeat(80));

const mappingPath = path.join(process.cwd(), 'src/lib/content/audio-mapping.ts');
if (!fs.existsSync(mappingPath)) {
  console.log('❌ audio-mapping.ts ՉԻ ԳՏՆՎԵԼ');
  process.exit(1);
}

const mappingContent = fs.readFileSync(mappingPath, 'utf8');

// Գտնենք EXERCISE_TO_AUDIO-ն
const exerciseMatch = mappingContent.match(/export const EXERCISE_TO_AUDIO:\s*Record<string,\s*string>\s*=\s*{([^}]*)}/s);
if (exerciseMatch) {
  const entries = exerciseMatch[1].split(',').filter(s => s.trim().includes("'"));
  console.log(`✅ EXERCISE_TO_AUDIO: ${entries.length} entries`);
  
  // Վերցնենք 10 օրինակ
  const samples = entries.slice(0, 10);
  console.log('\n📝 Օրինակներ:');
  samples.forEach(entry => {
    const match = entry.match(/['"]([^'"]+)['"]:\s*['"]([^'"]+)['"]/);
    if (match) {
      console.log(`   ${match[1]} → ${match[2]}`);
    }
  });
} else {
  console.log('❌ EXERCISE_TO_AUDIO ՉԻ ԳՏՆՎԵԼ');
}

// ============================================================
// 3. ՍՏՈՒԳԵՆՔ getAudioPath ՖՈՒՆԿՑԻԱՆ
// ============================================================
console.log('\n🔊 3. Ստուգում ենք getAudioPath ֆունկցիան...');
console.log('─'.repeat(80));

// Գտնենք getAudioPath ֆունկցիան
const getAudioPathMatch = mappingContent.match(/export function getAudioPath\s*\([^)]*\)\s*:\s*string\s*\|\s*null\s*{([^}]*)}/s);
if (getAudioPathMatch) {
  console.log('✅ getAudioPath ֆունկցիան կա');
  const funcBody = getAudioPathMatch[1];
  
  // Ստուգենք folderMap-ը
  if (funcBody.includes('hy_Ani')) {
    console.log('✅ Օգտագործում է hy_Ani');
  } else if (funcBody.includes('hy_Areg')) {
    console.log('⚠️ Օգտագործում է hy_Areg (կարող է չլինել)');
  }
  
  if (funcBody.includes('en_female')) {
    console.log('✅ Օգտագործում է en_female');
  }
  
  if (funcBody.includes('ru_female')) {
    console.log('✅ Օգտագործում է ru_female');
  }
} else {
  console.log('❌ getAudioPath ՉԻ ԳՏՆՎԵԼ');
}

// ============================================================
// 4. ՍՏՈՒԳԵՆՔ ԹԵ ԻՆՉ Է ՎԵՐԱԴԱՐՁՆՈՒՄ getAudioPath-Ը
// ============================================================
console.log('\n🔍 4. Ստուգում ենք getAudioPath-ի վերադարձրած ճանապարհը...');
console.log('─'.repeat(80));

// Վերցնենք առաջին exerciseId-ն
const firstEntry = exerciseMatch ? exerciseMatch[1].split(',').filter(s => s.trim().includes("'"))[0] : null;
if (firstEntry) {
  const match = firstEntry.match(/['"]([^'"]+)['"]:\s*['"]([^'"]+)['"]/);
  if (match) {
    const exerciseId = match[1];
    const audioId = match[2];
    
    console.log(`📝 Փորձարկում: ${exerciseId} → ${audioId}`);
    console.log('\n🔊 Հնարավոր ճանապարհներ:');
    
    const paths = [
      `/audio/offline/hy_Ani/${audioId}.mp3`,
      `/audio/offline/hy_Areg/${audioId}.mp3`,
      `/audio/offline/en_female/${audioId}.mp3`,
      `/audio/offline/en_male/${audioId}.mp3`,
      `/audio/offline/ru_female/${audioId}.mp3`,
      `/audio/offline/ru_male/${audioId}.mp3`,
    ];
    
    for (const p of paths) {
      const fullPath = path.join(process.cwd(), 'public', p);
      const exists = fs.existsSync(fullPath);
      console.log(`   ${exists ? '✅' : '❌'} ${p} ${exists ? '(ԳՏՆՎԵՑ)' : '(ՉԿԱ)'}`);
    }
  }
}

// ============================================================
// 5. ՍՏՈՒԳԵՆՔ W1_L1 ԴԱՍԻ ԱՈՒԴԻՈՆ
// ============================================================
console.log('\n📚 5. Ստուգում ենք w1_l1 դասի աուդիոն...');
console.log('─'.repeat(80));

// Փնտրենք w1_l1-ի աուդիո ֆայլերը
const w1L1Files = [];
const searchDir = (dir) => {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      searchDir(fullPath);
    } else if (item.includes('w1_l1') && (item.endsWith('.mp3') || item.endsWith('.wav'))) {
      w1L1Files.push(item);
    }
  }
};

searchDir(offlineDir);

if (w1L1Files.length > 0) {
  console.log(`✅ Գտնվել է ${w1L1Files.length} w1_l1 աուդիո ֆայլ:`);
  w1L1Files.forEach(f => console.log(`   - ${f}`));
} else {
  console.log('❌ w1_l1 աուդիո ֆայլեր ՉԵՆ ԳՏՆՎԵԼ');
  console.log('   💡 Ստուգեք, թե ինչ ֆայլեր կան hy_Ani պանակում:');
  
  const hyAniPath = path.join(offlineDir, 'hy_Ani');
  if (fs.existsSync(hyAniPath)) {
    const files = fs.readdirSync(hyAniPath).slice(0, 20);
    console.log(`\n📄 hy_Ani պանակի ֆայլեր (առաջին 20):`);
    files.forEach(f => console.log(`   - ${f}`));
  }
}

// ============================================================
// 6. ՍՏՈՒԳԵՆՔ PAGE.TSX-Ի playOfflineAudio ՖՈՒՆԿՑԻԱՆ
// ============================================================
console.log('\n📄 6. Ստուգում ենք page.tsx-ի playOfflineAudio-ն...');
console.log('─'.repeat(80));

const pagePath = path.join(process.cwd(), 'src/app/learn/page.tsx');
if (fs.existsSync(pagePath)) {
  const pageContent = fs.readFileSync(pagePath, 'utf8');
  
  // Ստուգենք playOfflineAudio
  if (pageContent.includes('playOfflineAudio')) {
    console.log('✅ playOfflineAudio ֆունկցիան կա');
    
    // Ստուգենք, թե ինչ է անում
    if (pageContent.includes('const audioId = current.id')) {
      console.log('✅ Օգտագործում է current.id որպես audioId');
    } else {
      console.log('⚠️ current.id-ը չի օգտագործվում');
    }
    
    if (pageContent.includes('getAudioPath(')) {
      console.log('✅ Օգտագործում է getAudioPath');
    } else {
      console.log('❌ getAudioPath-ը ՉԻ օգտագործվում');
    }
  } else {
    console.log('❌ playOfflineAudio ՉԻ ԳՏՆՎԵԼ');
  }
}

// ============================================================
// 7. ԽՆԴԻՐՆԵՐԻ ԱՄՓՈՓՈՒՄ
// ============================================================
console.log('\n📋 ԽՆԴԻՐՆԵՐԻ ԱՄՓՈՓՈՒՄ');
console.log('═'.repeat(80));

const issues = [];

// 1. Ստուգենք hy_Ani պանակը
const hyAniPath = path.join(offlineDir, 'hy_Ani');
if (!fs.existsSync(hyAniPath) || fs.readdirSync(hyAniPath).filter(f => f.endsWith('.mp3')).length === 0) {
  issues.push('❌ hy_Ani պանակում աուդիո ֆայլեր ՉԿԱՆ');
}

// 2. Ստուգենք w1_l1 ֆայլերը
if (w1L1Files.length === 0) {
  issues.push('❌ w1_l1 աուդիո ֆայլեր ՉԵՆ ԳՏՆՎԵԼ');
}

// 3. Ստուգենք getAudioPath-ը
if (getAudioPathMatch) {
  const funcBody = getAudioPathMatch[1];
  if (!funcBody.includes('hy_Ani')) {
    issues.push('⚠️ getAudioPath-ը hy_Ani չի օգտագործում');
  }
}

// 4. Ստուգենք playOfflineAudio-ն
if (fs.existsSync(pagePath)) {
  const pageContent = fs.readFileSync(pagePath, 'utf8');
  if (!pageContent.includes('getAudioPath(')) {
    issues.push('❌ playOfflineAudio-ն getAudioPath ՉԻ օգտագործում');
  }
}

// ԱՐԴՅՈՒՆՔ
if (issues.length === 0) {
  console.log('\n✅ ԽՆԴԻՐՆԵՐ ՉԻ ԳՏՆՎԵԼ');
  console.log('🎉 Աուդիո համակարգը պետք է աշխատի');
  console.log('\n💡 Եթե դեռ չի աշխատում, ապա խնդիրը page.tsx-ի playOfflineAudio-ում է:');
} else {
  console.log(`\n🔴 Գտնվել է ${issues.length} խնդիր:\n`);
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
}

// ============================================================
// 8. ԱՌԱՋԱՐԿՎՈՂ ՈՒՂՂՈՒՄՆԵՐ
// ============================================================
console.log('\n🔧 ԱՌԱՋԱՐԿՎՈՂ ՈՒՂՂՈՒՄՆԵՐ');
console.log('═'.repeat(80));

if (issues.some(i => i.includes('w1_l1 աուդիո ֆայլեր ՉԵՆ ԳՏՆՎԵԼ'))) {
  console.log('\n1. 🛠️ w1_l1-ի աուդիո ֆայլերը չկան');
  console.log('   📁 Ստուգեք public/audio/offline/hy_Ani/ պանակը');
  console.log('   💡 Օգտագործեք TTS-ը (խոսքի սինթեզ) կամ ավելացրեք աուդիո ֆայլեր');
}

if (issues.some(i => i.includes('hy_Ani պանակում աուդիո ֆայլեր ՉԿԱՆ'))) {
  console.log('\n2. 🛠️ hy_Ani պանակում աուդիո ֆայլեր չկան');
  console.log('   💡 Ստեղծեք hy_Ani պանակը և տեղադրեք աուդիո ֆայլերը');
  console.log('   🎤 Կամ օգտագործեք Web Speech API-ն');
}

if (issues.some(i => i.includes('getAudioPath-ը hy_Ani չի օգտագործում'))) {
  console.log('\n3. 🛠️ getAudioPath-ը սխալ պանակ է օգտագործում');
  console.log('   📁 Ուղղեք audio-mapping.ts-ի getAudioPath ֆունկցիան');
  console.log('   ✏️ hy: { male: "hy_Ani", female: "hy_Ani" }');
}

if (issues.some(i => i.includes('getAudioPath ՉԻ օգտագործում'))) {
  console.log('\n4. 🛠️ playOfflineAudio-ն getAudioPath չի օգտագործում');
  console.log('   📁 Ուղղեք page.tsx-ի playOfflineAudio ֆունկցիան');
  console.log('   ✏️ Օգտագործեք getAudioPath(audioId, lang, gender)');
}

console.log('\n5. 🛠️ Գործարկեք dev server-ը');
console.log('   npm run dev');

console.log('\n' + '═'.repeat(80));
console.log('✅ ԴԻԱԳՆՈՍՏԻԿԱ ԱՎԱՐՏՎԵՑ');
console.log('═'.repeat(80));