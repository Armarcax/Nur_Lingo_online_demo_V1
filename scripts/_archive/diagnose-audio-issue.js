// scripts/diagnose-audio-issue.js
const fs = require('fs');
const path = require('path');

console.log('🔍 ԱՈՒԴԻՈ ՀԱՄԱԿԱՐԳԻ ԱՄԲՈՂՋԱԿԱՆ ԴԻԱԳՆՈՍՏԻԿԱ');
console.log('═'.repeat(80));

// Գլոբալ փոփոխական աուդիո ֆայլերի համար
let allAudioFiles = [];

// ============================================================
// 1. ՍՏՈՒԳԵՆՔ audio-mapping.ts
// ============================================================
console.log('\n📄 1. Ստուգում ենք audio-mapping.ts...');
console.log('─'.repeat(80));

const mappingPath = path.join(process.cwd(), 'src/lib/content/audio-mapping.ts');
if (!fs.existsSync(mappingPath)) {
  console.log('❌ audio-mapping.ts ՉԻ ԳՏՆՎԵԼ');
  process.exit(1);
}

const mappingContent = fs.readFileSync(mappingPath, 'utf8');

// Ստուգենք EXERCISE_TO_AUDIO
const exerciseMatch = mappingContent.match(/export const EXERCISE_TO_AUDIO:\s*Record<string,\s*string>\s*=\s*{([^}]*)}/s);
if (exerciseMatch) {
  const entries = exerciseMatch[1].split(',').filter(s => s.trim().includes("'"));
  console.log(`✅ EXERCISE_TO_AUDIO: ${entries.length} entries`);
  const sample = entries.slice(0, 3).map(e => e.trim());
  console.log(`   📝 Օրինակ: ${sample.join(', ')}`);
} else {
  console.log('❌ EXERCISE_TO_AUDIO ՉԻ ԳՏՆՎԵԼ');
}

// Ստուգենք getAudioPath
if (mappingContent.includes('export function getAudioPath')) {
  console.log('✅ getAudioPath ֆունկցիան կա');
  const pathMatch = mappingContent.match(/return\s*['"]([^'"]+)['"]/);
  if (pathMatch) {
    console.log(`   📂 Վերադարձնում է: ${pathMatch[1]}`);
  }
} else {
  console.log('❌ getAudioPath ՉԻ ԳՏՆՎԵԼ');
}

// Ստուգենք getStats
if (mappingContent.includes('export function getStats')) {
  console.log('✅ getStats ֆունկցիան կա');
} else {
  console.log('❌ getStats ՉԻ ԳՏՆՎԵԼ');
}

// Ստուգենք getMapping
if (mappingContent.includes('export function getMapping')) {
  console.log('✅ getMapping ֆունկցիան կա');
} else {
  console.log('❌ getMapping ՉԻ ԳՏՆՎԵԼ');
}

// ============================================================
// 2. ՍՏՈՒԳԵՆՔ learn/page.tsx
// ============================================================
console.log('\n📄 2. Ստուգում ենք learn/page.tsx...');
console.log('─'.repeat(80));

const learnPath = path.join(process.cwd(), 'src/app/learn/page.tsx');
if (!fs.existsSync(learnPath)) {
  console.log('❌ learn/page.tsx ՉԻ ԳՏՆՎԵԼ');
} else {
  const learnContent = fs.readFileSync(learnPath, 'utf8');
  
  console.log('📦 Import-ների ստուգում:');
  const imports = {
    'getAudioPath': learnContent.includes('getAudioPath') && learnContent.includes('from "@/lib/content/audio-mapping"'),
    'hasAudioFile': learnContent.includes('hasAudioFile'),
    'searchAudio': learnContent.includes('searchAudio'),
    'getStats': learnContent.includes('getStats'),
    'getMapping': learnContent.includes('getMapping'),
    'EXERCISE_TO_AUDIO': learnContent.includes('EXERCISE_TO_AUDIO'),
    'useLessonAudio': learnContent.includes('useLessonAudio'),
    'AudioControls': learnContent.includes('AudioControls'),
  };
  
  Object.entries(imports).forEach(([name, exists]) => {
    console.log(`   ${exists ? '✅' : '❌'} ${name}`);
  });
  
  // Ստուգենք useOfflineAudio
  if (learnContent.includes('function useOfflineAudio')) {
    console.log('✅ useOfflineAudio հուկը կա');
    if (learnContent.includes('getAudioPath(') && learnContent.includes('useOfflineAudio')) {
      console.log('   ✅ getAudioPath-ը օգտագործվում է useOfflineAudio-ում');
    } else {
      console.log('   ❌ getAudioPath-ը ՉԻ օգտագործվում useOfflineAudio-ում');
    }
  } else {
    console.log('❌ useOfflineAudio հուկը ՉԻ ԳՏՆՎԵԼ');
  }
  
  // Ստուգենք playOfflineAudio
  if (learnContent.includes('playOfflineAudio')) {
    console.log('✅ playOfflineAudio ֆունկցիան կա');
    if (learnContent.includes('getAudioPath(')) {
      console.log('   ✅ Օգտագործում է getAudioPath');
    } else {
      console.log('   ❌ Չի օգտագործում getAudioPath');
    }
  } else {
    console.log('❌ playOfflineAudio ՉԻ ԳՏՆՎԵԼ');
  }
  
  // Ստուգենք getMappedAudioPath (սխալ)
  if (learnContent.includes('getMappedAudioPath')) {
    console.log('❌ ՕԳՏԱԳՈՐԾՎՈՒՄ Է getMappedAudioPath (ՍԽԱԼ)');
    console.log('   💡 Պետք է փոխարինել getAudioPath-ով');
  }
}

// ============================================================
// 3. ՍՏՈՒԳԵՆՔ dialogues/page.tsx
// ============================================================
console.log('\n📄 3. Ստուգում ենք dialogues/page.tsx...');
console.log('─'.repeat(80));

const dialoguesPath = path.join(process.cwd(), 'src/app/dialogues/page.tsx');
if (!fs.existsSync(dialoguesPath)) {
  console.log('⚠️ dialogues/page.tsx ՉԻ ԳՏՆՎԵԼ');
} else {
  const dialoguesContent = fs.readFileSync(dialoguesPath, 'utf8');
  if (dialoguesContent.includes('audio') || dialoguesContent.includes('Audio')) {
    console.log('✅ dialogues-ում կա աուդիո կոդ');
    if (dialoguesContent.includes('getAudioPath')) {
      console.log('   ✅ Օգտագործում է getAudioPath');
    }
    if (dialoguesContent.includes('useLessonAudio')) {
      console.log('   ✅ Օգտագործում է useLessonAudio');
    }
  } else {
    console.log('⚠️ dialogues-ում ՉԿԱ աուդիո կոդ');
  }
}

// ============================================================
// 4. ՍՏՈՒԳԵՆՔ user-dictionary/page.tsx
// ============================================================
console.log('\n📄 4. Ստուգում ենք user-dictionary/page.tsx...');
console.log('─'.repeat(80));

const userDictPath = path.join(process.cwd(), 'src/app/user-dictionary/page.tsx');
if (!fs.existsSync(userDictPath)) {
  console.log('⚠️ user-dictionary/page.tsx ՉԻ ԳՏՆՎԵԼ');
} else {
  const userDictContent = fs.readFileSync(userDictPath, 'utf8');
  if (userDictContent.includes('audio') || userDictContent.includes('Audio')) {
    console.log('✅ user-dictionary-ում կա աուդիո կոդ');
    if (userDictContent.includes('getAudioPath')) {
      console.log('   ✅ Օգտագործում է getAudioPath');
    }
  } else {
    console.log('⚠️ user-dictionary-ում ՉԿԱ աուդիո կոդ');
  }
}

// ============================================================
// 5. ՍՏՈՒԳԵՆՔ ՖԻԶԻԿԱԿԱՆ ԱՈՒԴԻՈ ՖԱՅԼԵՐԸ
// ============================================================
console.log('\n🔊 5. Ստուգում ենք ֆիզիկական աուդիո ֆայլերը...');
console.log('─'.repeat(80));

const audioDir = path.join(process.cwd(), 'public/audio');
if (!fs.existsSync(audioDir)) {
  console.log('❌ public/audio պանակը ՉԻ ԳՏՆՎԵԼ');
} else {
  // Հավաքենք բոլոր աուդիո ֆայլերը
  function scanDir(dir, basePath = '') {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relPath = path.join(basePath, item);
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath, relPath);
      } else if (item.endsWith('.mp3') || item.endsWith('.wav')) {
        allAudioFiles.push(relPath);
      }
    }
  }
  
  scanDir(audioDir);
  
  console.log(`📊 Ընդհանուր աուդիո ֆայլեր: ${allAudioFiles.length}`);
  
  if (allAudioFiles.length === 0) {
    console.log('❌ ԱՈՒԴԻՈ ՖԱՅԼԵՐ ՉԿԱՆ');
  } else {
    // Ցույց տանք բաշխվածությունը
    const extensions = {};
    const directories = {};
    
    allAudioFiles.forEach(file => {
      const ext = path.extname(file);
      extensions[ext] = (extensions[ext] || 0) + 1;
      
      const dir = file.split('/')[0];
      directories[dir] = (directories[dir] || 0) + 1;
    });
    
    console.log('📁 Ֆայլերի բաշխվածություն:');
    Object.entries(directories).forEach(([dir, count]) => {
      console.log(`   ${dir}: ${count} ֆայլ`);
    });
    
    console.log(`\n📄 Ֆայլերի տեսակներ:`);
    Object.entries(extensions).forEach(([ext, count]) => {
      console.log(`   ${ext}: ${count} ֆայլ`);
    });
    
    // Ցույց տանք առաջին 10 ֆայլերը
    console.log(`\n📄 Առաջին 10 աուդիո ֆայլեր:`);
    allAudioFiles.slice(0, 10).forEach(file => {
      console.log(`   - ${file}`);
    });
    
    // Ստուգենք, թե արդյոք կան w1_l1 ֆայլեր
    const sampleFiles = allAudioFiles.filter(f => f.includes('w1_l1'));
    console.log(`\n🔍 w1_l1 ֆայլեր: ${sampleFiles.length}`);
    if (sampleFiles.length > 0) {
      sampleFiles.slice(0, 5).forEach(f => {
        console.log(`   - ${f}`);
      });
    }
  }
}

// ============================================================
// 6. ԽՆԴԻՐՆԵՐԻ ԱՄՓՈՓՈՒՄ
// ============================================================
console.log('\n📋 ԽՆԴԻՐՆԵՐԻ ԱՄՓՈՓՈՒՄ');
console.log('═'.repeat(80));

const issues = [];

// Ստուգենք getMappedAudioPath
if (fs.existsSync(learnPath)) {
  const content = fs.readFileSync(learnPath, 'utf8');
  if (content.includes('getMappedAudioPath')) {
    issues.push('❌ getMappedAudioPath-ը օգտագործվում է (պետք է getAudioPath)');
  }
}

// Ստուգենք աուդիո ֆայլերի առկայությունը
if (allAudioFiles && allAudioFiles.length === 0) {
  issues.push('❌ Աուդիո ֆայլեր չկան public/audio-ում');
}

// Ստուգենք import-ները
if (fs.existsSync(learnPath)) {
  const content = fs.readFileSync(learnPath, 'utf8');
  if (!content.includes('getAudioPath') || !content.includes('from "@/lib/content/audio-mapping"')) {
    issues.push('⚠️ getAudioPath-ը կարող է ճիշտ import չլինել');
  }
}

// Եզրակացություն
if (issues.length === 0) {
  console.log('\n✅ ԽՆԴԻՐՆԵՐ ՉԻ ԳՏՆՎԵԼ');
  console.log('🎉 Աուդիո համակարգը պետք է աշխատի');
} else {
  console.log(`\n🔴 Գտնվել է ${issues.length} խնդիր:\n`);
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
}

// ============================================================
// 7. ԱՌԱՋԱՐԿՎՈՂ ՈՒՂՂՈՒՄՆԵՐ
// ============================================================
console.log('\n🔧 ԱՌԱՋԱՐԿՎՈՂ ՈՒՂՂՈՒՄՆԵՐ');
console.log('═'.repeat(80));

if (issues.some(i => i.includes('getMappedAudioPath'))) {
  console.log('\n1. 🛠️ Փոխարինեք getMappedAudioPath → getAudioPath');
  console.log('   📁 Ֆայլ: src/app/learn/page.tsx');
  console.log('   📝 Փնտրեք: getMappedAudioPath');
  console.log('   ✏️ Փոխարինեք: getAudioPath');
}

if (issues.some(i => i.includes('Աուդիո ֆայլեր չկան'))) {
  console.log('\n2. 🛠️ Ստեղծեք աուդիո ֆայլեր կամ միացրեք TTS');
  console.log('   📁 Տեղադրեք ֆայլերը public/audio/offline/ պանակում');
  console.log('   🎤 Կամ օգտագործեք Web Speech API (TTS)');
}

if (issues.some(i => i.includes('import'))) {
  console.log('\n3. 🛠️ Ստուգեք, որ բոլոր էջերում ճիշտ են import-ները');
  console.log('   📁 src/app/learn/page.tsx');
  console.log('   📁 src/app/dialogues/page.tsx');
  console.log('   📁 src/app/user-dictionary/page.tsx');
}

console.log('\n4. 🛠️ Գործարկեք dev server-ը');
console.log('   npm run dev');

console.log('\n' + '═'.repeat(80));
console.log('✅ ԴԻԱԳՆՈՍՏԻԿԱ ԱՎԱՐՏՎԵՑ');
console.log('═'.repeat(80));