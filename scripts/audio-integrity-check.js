// scripts/audio-integrity-check.js
// Գործարկել՝ node scripts/audio-integrity-check.js

const fs = require('fs');
const path = require('path');

// ============================================================
// 📁 ԿՈՆՖԻԳՈՒՐԱՑԻԱ
// ============================================================

const PROJECT_ROOT = process.cwd();

// 📁 Աուդիո պանակների իրական կառուցվածքը
function findAudioStructure() {
  const result = {
    lesson: { exists: false, subdirs: [], manifests: [], totalFiles: 0, totalSize: 0 },
    dictionary: { exists: false, subdirs: [], manifests: [], totalFiles: 0, totalSize: 0 },
    user: { exists: false, subdirs: [], manifests: [], totalFiles: 0, totalSize: 0 },
  };

  // 📁 LESSON - offline_lesson
  const lessonBase = path.join(PROJECT_ROOT, 'public', 'audio', 'offline_lesson');
  if (fs.existsSync(lessonBase) && fs.statSync(lessonBase).isDirectory()) {
    result.lesson.exists = true;
    const items = fs.readdirSync(lessonBase);
    
    for (const item of items) {
      const itemPath = path.join(lessonBase, item);
      const stat = fs.statSync(itemPath);
      
      // Ենթապանակներ (en_female, hy_Ani, ru_female)
      if (stat.isDirectory()) {
        const mp3Count = countFilesInDir(itemPath, '.mp3');
        const size = getDirSize(itemPath);
        result.lesson.subdirs.push({ name: item, path: itemPath, files: mp3Count, size });
        result.lesson.totalFiles += mp3Count;
        result.lesson.totalSize += size;
      }
      // Մանիֆեստներ (manifest_*.json)
      else if (item.endsWith('.json') && item.includes('manifest')) {
        result.lesson.manifests.push({ name: item, path: itemPath });
      }
    }
  }

  // 📁 DICTIONARY - offline_dictionary
  const dictBase = path.join(PROJECT_ROOT, 'public', 'audio', 'offline_dictionary');
  if (fs.existsSync(dictBase) && fs.statSync(dictBase).isDirectory()) {
    result.dictionary.exists = true;
    const items = fs.readdirSync(dictBase);
    
    for (const item of items) {
      const itemPath = path.join(dictBase, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        const mp3Count = countFilesInDir(itemPath, '.mp3');
        const size = getDirSize(itemPath);
        result.dictionary.subdirs.push({ name: item, path: itemPath, files: mp3Count, size });
        result.dictionary.totalFiles += mp3Count;
        result.dictionary.totalSize += size;
      } else if (item.endsWith('.json') && item.includes('manifest')) {
        result.dictionary.manifests.push({ name: item, path: itemPath });
      }
    }
  }

  // 📁 USER - offline_user_dictionary
  const userBase = path.join(PROJECT_ROOT, 'public', 'audio', 'offline_user_dictionary');
  if (fs.existsSync(userBase) && fs.statSync(userBase).isDirectory()) {
    result.user.exists = true;
    const items = fs.readdirSync(userBase);
    
    for (const item of items) {
      const itemPath = path.join(userBase, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        const mp3Count = countFilesInDir(itemPath, '.mp3');
        const size = getDirSize(itemPath);
        result.user.subdirs.push({ name: item, path: itemPath, files: mp3Count, size });
        result.user.totalFiles += mp3Count;
        result.user.totalSize += size;
      } else if (item.endsWith('.json') && item.includes('manifest')) {
        result.user.manifests.push({ name: item, path: itemPath });
      }
    }
  }

  return result;
}

function countFilesInDir(dirPath, ext) {
  try {
    if (!fs.existsSync(dirPath)) return 0;
    const files = fs.readdirSync(dirPath);
    return files.filter(f => f.endsWith(ext)).length;
  } catch {
    return 0;
  }
}

function getDirSize(dirPath) {
  let total = 0;
  try {
    if (!fs.existsSync(dirPath)) return 0;
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      if (fs.statSync(itemPath).isFile()) {
        total += fs.statSync(itemPath).size;
      }
    }
  } catch {}
  return total;
}

// 📄 Բոլոր բառարանները
function findDictionaries() {
  const dicts = {};
  
  const dictPaths = [
    { name: 'unified-dictionary.json', path: path.join(PROJECT_ROOT, 'data', 'dictionaries', 'unified-dictionary.json') },
    { name: 'user-dictionary.json', path: path.join(PROJECT_ROOT, 'data', 'dictionaries', 'user-dictionary.json') },
    { name: 'lesson-dictionary.json', path: path.join(PROJECT_ROOT, 'data', 'dictionaries', 'lesson-dictionary.json') },
    // Backup locations
    { name: 'master-dictionary.json', path: path.join(PROJECT_ROOT, 'src', 'lib', 'lexicon', 'master-dictionary.json') },
    { name: 'master-dictionary.fixed.json', path: path.join(PROJECT_ROOT, 'src', 'lib', 'lexicon', 'master-dictionary.fixed.json') },
  ];

  for (const dict of dictPaths) {
    if (fs.existsSync(dict.path)) {
      dicts[dict.name] = dict.path;
    }
  }

  return dicts;
}

// 📄 Audio mapping files
function findAudioMappings() {
  const mappings = [];
  const mappingDir = path.join(PROJECT_ROOT, 'src', 'lib', 'content', 'mappings');
  
  if (fs.existsSync(mappingDir)) {
    const files = fs.readdirSync(mappingDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        mappings.push({ name: file, path: path.join(mappingDir, file) });
      }
    }
  }

  // Audio mapping TS
  const tsMapping = path.join(PROJECT_ROOT, 'src', 'lib', 'content', 'audio-mapping.ts');
  if (fs.existsSync(tsMapping)) {
    mappings.push({ name: 'audio-mapping.ts', path: tsMapping });
  }

  return mappings;
}

// ============================================================
// 🛠️ ՕԳՏԱԿԱՆ ՖՈՒՆԿՑԻԱՆԵՐ
// ============================================================

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[34m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    header: '\x1b[36m',
    reset: '\x1b[0m',
  };

  const prefix = {
    info: 'ℹ️ ',
    success: '✅ ',
    warning: '⚠️ ',
    error: '❌ ',
    header: '📌 ',
  };

  console.log(colors[type] + prefix[type] + message + colors.reset);
}

function readJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================================
// 🔍 ՍՏՈՒԳՈՒՄՆԵՐ
// ============================================================

function checkAudioDirectories(audioStructure) {
  log('📁 Ստուգում ենք աուդիո պանակները...', 'header');
  
  for (const [name, data] of Object.entries(audioStructure)) {
    if (data.exists) {
      log(`${name}:`, 'success');
      log(`   📂 ${data.subdirs.length} ենթապանակներ, ${data.totalFiles} MP3 ֆայլ (${formatBytes(data.totalSize)})`, 'info');
      
      for (const subdir of data.subdirs) {
        log(`      └── ${subdir.name}: ${subdir.files} MP3`, 'info');
      }
      
      if (data.manifests.length > 0) {
        log(`   📄 ${data.manifests.length} մանիֆեստներ:`, 'info');
        for (const manifest of data.manifests) {
          log(`      └── ${manifest.name}`, 'info');
        }
      }
    } else {
      log(`${name}: Պանակը բացակայում է`, 'error');
    }
  }
}

function checkManifests(audioStructure) {
  log('\n📄 Ստուգում ենք մանիֆեստները...', 'header');
  
  let totalEntries = 0;
  let validManifests = 0;
  let totalManifests = 0;

  for (const [name, data] of Object.entries(audioStructure)) {
    if (!data.exists) continue;
    
    for (const manifest of data.manifests) {
      totalManifests++;
      const content = readJSON(manifest.path);
      
      if (!content) {
        log(`${manifest.name}: Անվավեր է`, 'error');
        continue;
      }

      // Ստուգել mapping
      let entries = 0;
      if (content.mapping && typeof content.mapping === 'object') {
        entries = Object.keys(content.mapping).length;
      }
      
      if (entries > 0 || content.totalFiles > 0) {
        validManifests++;
        totalEntries += entries || content.totalFiles || 0;
        log(`${manifest.name}: ${entries || content.totalFiles || 0} entries`, 'success');
      } else {
        log(`${manifest.name}: 0 entries (դատարկ)`, 'warning');
      }
    }
  }

  return { totalManifests, validManifests, totalEntries };
}

function checkDictionaries() {
  log('\n📖 Ստուգում ենք բառարանները...', 'header');
  
  const dicts = findDictionaries();
  let totalEntries = 0;
  let withAudio = 0;
  let valid = 0;

  for (const [name, filePath] of Object.entries(dicts)) {
    const data = readJSON(filePath);
    if (!data) {
      log(`${name}: Անվավեր է`, 'error');
      continue;
    }

    let entries = [];
    if (Array.isArray(data)) {
      entries = data;
    } else if (data.entries && Array.isArray(data.entries)) {
      entries = data.entries;
    } else if (data.lessons && Array.isArray(data.lessons)) {
      entries = data.lessons;
    }

    const withAudioId = entries.filter(e => e.audioId || e.audio || e.file).length;
    totalEntries += entries.length;
    withAudio += withAudioId;
    valid++;

    log(`${name}: ${entries.length} բառեր, ${withAudioId} աուդիոյով`, 'success');
  }

  return { valid, totalEntries, withAudio };
}

function checkAudioMappings() {
  log('\n🔗 Ստուգում ենք audio-mapping-ը...', 'header');
  
  const mappings = findAudioMappings();
  
  let hasMain = false;
  let hasMappings = false;

  for (const mapping of mappings) {
    if (mapping.name === 'audio-mapping.ts') {
      hasMain = true;
      const content = fs.readFileSync(mapping.path, 'utf8');
      const hasExport = content.includes('EXERCISE_TO_AUDIO') || content.includes('export');
      const hasImport = content.includes('import') || content.includes('require');
      
      log(`${mapping.name}: ${hasExport ? '✅' : '⚠️'}`, hasExport ? 'success' : 'warning');
    } else if (mapping.name.endsWith('.json')) {
      hasMappings = true;
      const data = readJSON(mapping.path);
      const entries = data ? Object.keys(data).length : 0;
      log(`${mapping.name}: ${entries} entries`, 'info');
    }
  }

  return { hasMain, hasMappings, total: mappings.length };
}

function checkCrossReferences(audioStructure) {
  log('\n🔗 Ստուգում ենք խաչաձև հղումները...', 'header');
  
  // Հավաքել բոլոր audio IDs մանիֆեստներից
  const manifestIds = new Set();
  let manifestTotal = 0;

  for (const [name, data] of Object.entries(audioStructure)) {
    if (!data.exists) continue;
    for (const manifest of data.manifests) {
      const content = readJSON(manifest.path);
      if (content && content.mapping) {
        for (const id of Object.values(content.mapping)) {
          manifestIds.add(id);
          manifestTotal++;
        }
      }
    }
  }

  // Հավաքել audio IDs բառարաններից
  const dictIds = new Set();
  let dictTotal = 0;
  const dicts = findDictionaries();

  for (const [name, filePath] of Object.entries(dicts)) {
    const data = readJSON(filePath);
    if (!data) continue;
    
    let entries = [];
    if (Array.isArray(data)) entries = data;
    else if (data.entries && Array.isArray(data.entries)) entries = data.entries;
    else if (data.lessons && Array.isArray(data.lessons)) entries = data.lessons;

    for (const entry of entries) {
      const id = entry.audioId || entry.audio || entry.file;
      if (id) {
        dictIds.add(id);
        dictTotal++;
      }
    }
  }

  // Համեմատություն
  let matched = 0;
  for (const id of dictIds) {
    if (manifestIds.has(id)) matched++;
  }

  log(`📊 Dictionary → Manifest: ${matched}/${dictIds.size}`, 'info');
  if (dictIds.size > 0 && matched < dictIds.size) {
    log(`   ⚠️ ${dictIds.size - matched} audio IDs բացակայում են մանիֆեստում`, 'warning');
  }

  log(`📊 Manifest → Dictionary: ${manifestIds.size > 0 ? '✅' : '⚠️'} (${manifestIds.size} IDs)`, manifestIds.size > 0 ? 'success' : 'warning');

  return { matched, dictTotal, manifestTotal };
}

// ============================================================
// 📊 ԳԼԽԱՎՈՐ ՖՈՒՆԿՑԻԱ
// ============================================================

function main() {
  console.log('\x1b[36m\n🎵 NUR LINGO - AUDIO INTEGRITY CHECK\x1b[0m');
  console.log('\x1b[90m' + '═'.repeat(80) + '\x1b[0m');
  console.log(`\x1b[90m📂 Project: ${PROJECT_ROOT}\x1b[0m`);
  console.log(`\x1b[90m📅 ${new Date().toLocaleString()}\x1b[0m`);
  console.log('\x1b[90m' + '═'.repeat(80) + '\x1b[0m\n');

  // 📁 Սկանավորել աուդիո կառուցվածքը
  const audioStructure = findAudioStructure();
  
  // 📊 Ստուգումներ
  checkAudioDirectories(audioStructure);
  const manifestResults = checkManifests(audioStructure);
  const dictResults = checkDictionaries();
  const mappingResults = checkAudioMappings();
  const crossResults = checkCrossReferences(audioStructure);

  // ============================================================
  // 📊 ԱՄՓՈՓՈՒՄ
  // ============================================================

  console.log('\n' + '\x1b[36m' + '='.repeat(80) + '\x1b[0m');
  console.log('\x1b[36m📊 ԱՄՓՈՓ ՀԱՇՎԵՏՎՈՒԹՅՈՒՆ\x1b[0m');
  console.log('\x1b[36m' + '='.repeat(80) + '\x1b[0m');

  console.log('\n\x1b[33m📈 ՎԻՃԱԿԱԳՐՈՒԹՅՈՒՆ\x1b[0m');
  console.log('\x1b[90m' + '─'.repeat(80) + '\x1b[0m');

  // Հաշվել ընդհանուր MP3 ֆայլերը
  let totalMP3 = 0;
  let totalSubdirs = 0;
  for (const [name, data] of Object.entries(audioStructure)) {
    if (data.exists) {
      totalMP3 += data.totalFiles;
      totalSubdirs += data.subdirs.length;
    }
  }

  console.log(`📁 Աուդիո պանակներ: ${Object.values(audioStructure).filter(d => d.exists).length}/3`);
  console.log(`📂 Ենթապանակներ: ${totalSubdirs}`);
  console.log(`🎵 Ընդհանուր MP3 ֆայլեր: ${totalMP3}`);
  console.log(`📄 Մանիֆեստներ: ${manifestResults.validManifests}/${manifestResults.totalManifests}`);
  console.log(`📝 Մանիֆեստի entries: ${manifestResults.totalEntries}`);
  console.log(`📖 Բառարաններ: ${dictResults.valid}/${Object.keys(findDictionaries()).length}`);
  console.log(`📝 Բառարանների բառեր: ${dictResults.totalEntries}`);
  console.log(`🎵 Բառեր աուդիոյով: ${dictResults.withAudio}`);
  console.log(`🔗 Audio mappings: ${mappingResults.total}`);

  // ============================================================
  // 🏁 ԳՆԱՀԱՏԱԿԱՆ
  // ============================================================

  console.log('\n\x1b[33m🔧 ՀԱՄԱԿԱՐԳԻ ԿԱՐԳԱՎԻՃԱԿ\x1b[0m');
  console.log('\x1b[90m' + '─'.repeat(80) + '\x1b[0m');

  const hasAudio = totalMP3 > 0;
  const hasManifests = manifestResults.validManifests > 0;
  const hasDictionaries = dictResults.valid > 0;
  const hasMapping = mappingResults.hasMain;

  console.log(`${hasAudio ? '✅' : '❌'} Աուդիո ֆայլեր: ${hasAudio ? `${totalMP3} MP3` : 'Բացակայում են'}`);
  console.log(`${hasManifests ? '✅' : '❌'} Մանիֆեստներ: ${hasManifests ? 'Կան' : 'Բացակայում են'}`);
  console.log(`${hasDictionaries ? '✅' : '❌'} Բառարաններ: ${hasDictionaries ? 'Կան' : 'Բացակայում են'}`);
  console.log(`${hasMapping ? '✅' : '❌'} Audio Mapping: ${hasMapping ? 'Կա' : 'Բացակայում է'}`);
  console.log(`${crossResults.matched > 0 ? '✅' : '⚠️'} Dictionary ↔ Manifest: ${crossResults.matched > 0 ? 'Համապատասխանում են' : 'Բացեր կան'}`);

  // ============================================================
  // 🎯 ՄԻԱՎՈՐ
  // ============================================================

  let score = 0;
  const maxScore = 6;
  if (hasAudio) score++;
  if (hasManifests) score++;
  if (hasDictionaries) score++;
  if (hasMapping) score++;
  if (crossResults.matched > 0) score++;
  if (manifestResults.totalEntries > 0 && dictResults.withAudio > 0) score++;

  const percentage = Math.round((score / maxScore) * 100);
  
  let grade, emoji;
  if (percentage >= 90) { grade = 'Գերազանց'; emoji = '🌟'; }
  else if (percentage >= 70) { grade = 'Լավ'; emoji = '👍'; }
  else if (percentage >= 50) { grade = 'Միջին'; emoji = '📊'; }
  else { grade = 'Վատ'; emoji = '🔴'; }

  console.log('\n' + '\x1b[36m' + '='.repeat(80) + '\x1b[0m');
  console.log(`\x1b[36m🏆 ԸՆԴՀԱՆՈՒՐ ԳՆԱՀԱՏԱԿԱՆ: ${emoji} ${grade} (${percentage}%)\x1b[0m`);
  console.log(`\x1b[36m📊 Միավոր: ${score}/${maxScore}\x1b[0m`);
  console.log('\x1b[36m' + '='.repeat(80) + '\x1b[0m');

  // ============================================================
  // 📝 ԱՌԱՋԱՐԿՈՒԹՅՈՒՆՆԵՐ
  // ============================================================

  console.log('\n\x1b[33m📝 ԱՌԱՋԱՐԿՈՒԹՅՈՒՆՆԵՐ\x1b[0m');
  console.log('\x1b[90m' + '─'.repeat(80) + '\x1b[0m');

  if (!hasAudio) {
    log('📁 Տեղադրել աուդիո ֆայլերը public/audio/offline_* պանակներում', 'warning');
  }

  if (!hasManifests) {
    log('📄 Ստեղծել մանիֆեստներ աուդիո պանակներում', 'warning');
  }

  if (!hasDictionaries) {
    log('📖 Ստեղծել բառարանները data/dictionaries/-ում', 'warning');
  }

  if (!hasMapping) {
    log('🔗 Ստեղծել audio-mapping.ts src/lib/content/-ում', 'warning');
  }

  if (crossResults.matched === 0 && dictResults.withAudio > 0) {
    log('🔗 Համաձայնեցնել բառարանների audioId-ները մանիֆեստների հետ', 'warning');
  }

  if (hasAudio && hasManifests && hasDictionaries && hasMapping) {
    log('🎉 Բոլոր ստուգումները հաջող են! Համակարգը պատրաստ է աշխատանքի։', 'success');
  }

  console.log('\x1b[90m' + '─'.repeat(80) + '\x1b[0m');
  console.log(`📅 Ստուգումն ավարտված է: ${new Date().toLocaleString()}`);
  console.log('\x1b[36m' + '='.repeat(80) + '\x1b[0m\n');
}

// ============================================================
// 🏃 ԳՈՐԾԱՐԿԵԼ
// ============================================================

main();