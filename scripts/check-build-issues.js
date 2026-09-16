// scripts/check-build-issues.js
const fs = require('fs');
const path = require('path');

const audioMappingPath = path.join(__dirname, '../src/lib/content/audio-mapping.ts');
const pagePath = path.join(__dirname, '../src/app/learn/page.tsx');

console.log('🔍 Ստուգում ենք build-ի հնարավոր խնդիրները...\n');

// ============================================================
// 1. ՍՏՈՒԳԵՆՔ AUDIO-MAPPING.TS
// ============================================================
console.log('📄 Ստուգում ենք audio-mapping.ts...');
console.log('─'.repeat(50));

try {
  const audioContent = fs.readFileSync(audioMappingPath, 'utf8');
  
  // Ստուգենք հիմնական export-ները
  const exports = {
    EXERCISE_TO_AUDIO: audioContent.includes('export const EXERCISE_TO_AUDIO'),
    AUDIO_TO_EXERCISE: audioContent.includes('export const AUDIO_TO_EXERCISE'),
    AUDIO_METADATA: audioContent.includes('export const AUDIO_METADATA'),
    getAudioPath: audioContent.includes('export function getAudioPath'),
    getAudioPathByAudioId: audioContent.includes('export function getAudioPathByAudioId'),
    getAudioId: audioContent.includes('export function getAudioId'),
    getNumId: audioContent.includes('export function getNumId'),
    searchAudio: audioContent.includes('export function searchAudio'),
    hasAudioFile: audioContent.includes('export function hasAudioFile'),
    // 🔴 ՍՏՈՒԳԵՆՔ ԲԱՑԱԿԱՅՈՂՆԵՐԸ
    getStats: audioContent.includes('export function getStats'),
    getMapping: audioContent.includes('export function getMapping'),
  };

  console.log('✅ Առկա export-ներ:');
  Object.entries(exports).forEach(([name, exists]) => {
    console.log(`   ${exists ? '✅' : '❌'} ${name}`);
  });

  // Ստուգենք getStats-ը և getMapping-ը
  if (!exports.getStats) {
    console.log('\n❌ ԲԱՑԱԿԱՅՈՂ Է: getStats() ֆունկցիան');
    console.log('   💡 Պետք է ավելացնել՝');
    console.log(`
   export function getStats() {
     return {
       totalAudioFiles: Object.keys(EXERCISE_TO_AUDIO).length,
       uniqueAudioIds: new Set(Object.values(EXERCISE_TO_AUDIO)).size,
     };
   }`);
  }

  if (!exports.getMapping) {
    console.log('\n❌ ԲԱՑԱԿԱՅՈՂ Է: getMapping() ֆունկցիան');
    console.log('   💡 Պետք է ավելացնել՝');
    console.log(`
   export function getMapping() {
     return {
       exerciseToAudio: EXERCISE_TO_AUDIO,
       audioToExercise: AUDIO_TO_EXERCISE,
     };
   }`);
  }

  // Ստուգենք getAudioPath-ի առկայությունը
  if (!exports.getAudioPath) {
    console.log('\n❌ ԲԱՑԱԿԱՅՈՂ Է: getAudioPath() ֆունկցիան');
    console.log('   💡 Սա կարևոր է page.tsx-ի համար');
  }

  // Ստուգենք hasAudioFile-ի առկայությունը
  if (!exports.hasAudioFile) {
    console.log('\n❌ ԲԱՑԱԿԱՅՈՂ Է: hasAudioFile() ֆունկցիան');
    console.log('   💡 Սա կարևոր է page.tsx-ի համար');
  }

} catch (error) {
  console.log('❌ Չհաջողվեց կարդալ audio-mapping.ts ֆայլը:');
  console.log(`   ${error.message}`);
}

console.log('\n');

// ============================================================
// 2. ՍՏՈՒԳԵՆՔ PAGE.TSX
// ============================================================
console.log('📄 Ստուգում ենք page.tsx...');
console.log('─'.repeat(50));

try {
  const pageContent = fs.readFileSync(pagePath, 'utf8');
  
  // Ստուգենք import-ները
  const imports = {
    getStats: pageContent.includes('getStats') && pageContent.includes('import'),
    getMapping: pageContent.includes('getMapping') && pageContent.includes('import'),
    getAudioPath: pageContent.includes('getAudioPath') && pageContent.includes('import'),
    hasAudioFile: pageContent.includes('hasAudioFile') && pageContent.includes('import'),
    searchAudio: pageContent.includes('searchAudio') && pageContent.includes('import'),
    EXERCISE_TO_AUDIO: pageContent.includes('EXERCISE_TO_AUDIO') && pageContent.includes('import'),
    AUDIO_TO_EXERCISE: pageContent.includes('AUDIO_TO_EXERCISE') && pageContent.includes('import'),
  };

  console.log('📦 Import-ներ audio-mapping-ից:');
  Object.entries(imports).forEach(([name, exists]) => {
    console.log(`   ${exists ? '✅' : '⚠️'} ${name} ${exists ? '(imported)' : '(not imported)'}`);
  });

  // Ստուգենք getMappedAudioPath-ի օգտագործումը
  const usesGetMappedAudioPath = pageContent.includes('getMappedAudioPath');
  if (usesGetMappedAudioPath) {
    console.log('\n❌ ԽՆԴԻՐ: Օգտագործվում է getMappedAudioPath (գոյություն չունի)');
    console.log('   💡 Փոխարինել getAudioPath-ով');
    
    // Գտնենք տողերը
    const lines = pageContent.split('\n');
    const problemLines = lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => line.includes('getMappedAudioPath'));
    
    console.log('   📍 Խնդրահարույց տողեր:');
    problemLines.forEach(({ line, index }) => {
      console.log(`      Տող ${index + 1}: ${line.trim()}`);
    });
  }

  // Ստուգենք կրկնվող getAudioPath սահմանումը
  const duplicateGetAudioPath = pageContent.includes('const getAudioPath = useCallback') && 
                                 pageContent.includes('return getMappedAudioPath');
  if (duplicateGetAudioPath) {
    console.log('\n⚠️ ԶԳՈՒՇՈՒՄ: Կրկնվող getAudioPath սահմանում');
    console.log('   💡 Օգտագործեք import-ից եկած getAudioPath-ը');
  }

  // Ստուգենք useOfflineAudio-ի մեջ playAudio-ի սահմանումը
  if (pageContent.includes('playAudio = useCallback') && 
      pageContent.includes('getMappedAudioPath')) {
    console.log('\n⚠️ ԶԳՈՒՇՈՒՄ: playAudio-ում օգտագործվում է getMappedAudioPath');
    console.log('   💡 Փոխարինել getAudioPath-ով');
  }

  // Ստուգենք getStats-ի օգտագործումը
  if (pageContent.includes('getStats') && !pageContent.includes('import.*getStats')) {
    console.log('\n⚠️ ԶԳՈՒՇՈՒՄ: getStats-ը օգտագործվում է, բայց կարող է import չլինել');
  }

} catch (error) {
  console.log('❌ Չհաջողվեց կարդալ page.tsx ֆայլը:');
  console.log(`   ${error.message}`);
}

console.log('\n');

// ============================================================
// 3. ԱՄՓՈՓՈՒՄ
// ============================================================
console.log('📋 ԱՄՓՈՓՈՒՄ');
console.log('═'.repeat(50));

const issues = [];

// Ստուգենք audio-mapping.ts-ի խնդիրները
try {
  const audioContent = fs.readFileSync(audioMappingPath, 'utf8');
  if (!audioContent.includes('export function getStats')) {
    issues.push('❌ audio-mapping.ts-ում բացակայում է getStats() ֆունկցիան');
  }
  if (!audioContent.includes('export function getMapping')) {
    issues.push('❌ audio-mapping.ts-ում բացակայում է getMapping() ֆունկցիան');
  }
  if (!audioContent.includes('export function getAudioPath')) {
    issues.push('❌ audio-mapping.ts-ում բացակայում է getAudioPath() ֆունկցիան');
  }
  if (!audioContent.includes('export function hasAudioFile')) {
    issues.push('❌ audio-mapping.ts-ում բացակայում է hasAudioFile() ֆունկցիան');
  }
} catch {
  issues.push('❌ audio-mapping.ts ֆայլը չի գտնվել');
}

// Ստուգենք page.tsx-ի խնդիրները
try {
  const pageContent = fs.readFileSync(pagePath, 'utf8');
  if (pageContent.includes('getMappedAudioPath')) {
    issues.push('❌ page.tsx-ում օգտագործվում է getMappedAudioPath (պետք է լինի getAudioPath)');
  }
  if (!pageContent.includes('import.*getStats.*from.*audio-mapping') && pageContent.includes('getStats')) {
    issues.push('⚠️ getStats-ը կարող է ճիշտ import չլինել');
  }
} catch {
  issues.push('❌ page.tsx ֆայլը չի գտնվել');
}

if (issues.length === 0) {
  console.log('✅ ԽՆԴԻՐՆԵՐ ՉԻ ԳՏՆՎԵԼ');
  console.log('🎉 Կարող եք build անել');
} else {
  console.log(`🔴 Գտնվել է ${issues.length} խնդիր:\n`);
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
}

console.log('\n🔧 Ֆիքսելու համար օգտագործեք վերը նշված առաջարկությունները');