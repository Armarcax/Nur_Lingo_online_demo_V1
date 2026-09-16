// audit_audio_system.js
const fs = require('fs');
const path = require('path');

// ==================== ԿԱՐԳԱՎՈՐՈՒՄՆԵՐ ====================
// Փոխեք այս հասցեն ձեր նախագծի արմատային թղթապանակին համապատասխան
const PROJECT_ROOT = 'C:/Users/Armen/Documents/NurLingo/NURLingo-main/nurlingo_integrated_round2';

// ==================== ՕԳՆԱԿԱՆ ՖՈՒՆԿՑԻԱՆԵՐ ====================
function getJsonContent(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`❌ JSON parse error in ${filePath}:`, error.message);
        return null;
    }
}

function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getAllFiles(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    });
    return fileList;
}

// ==================== 1. DICTIONARY ↔ AUDIO MANIFEST ====================
function checkDictionaryVsManifest(dictPath, manifestPath) {
    console.log('\n📚 1. Dictionary ↔ Audio Manifest Check');
    const dict = getJsonContent(dictPath);
    const manifest = getJsonContent(manifestPath);
    if (!dict || !manifest) return;

    // Հավաքել բոլոր audioId-ները բառարանից
    const dictAudioIds = new Set();
    Object.values(dict).forEach(entry => {
        if (entry.audioId) {
            dictAudioIds.add(entry.audioId);
        }
    });

    // Հավաքել բոլոր audioId-ները մանիֆեստից
    const manifestAudioIds = new Set(Object.keys(manifest));

    // Գտնել անհամապատասխանությունները
    const missingInManifest = [...dictAudioIds].filter(id => !manifestAudioIds.has(id));
    const extraInManifest = [...manifestAudioIds].filter(id => !dictAudioIds.has(id));

    console.log(`   Dictionary entries: ${dictAudioIds.size}`);
    console.log(`   Manifest entries: ${manifestAudioIds.size}`);
    if (missingInManifest.length) {
        console.log(`   ⚠️ Missing in Manifest (${missingInManifest.length}):`, missingInManifest.slice(0, 5), '...');
    } else {
        console.log('   ✅ All dictionary audioIds exist in manifest');
    }
    if (extraInManifest.length) {
        console.log(`   ⚠️ Extra in Manifest (${extraInManifest.length}):`, extraInManifest.slice(0, 5), '...');
    } else {
        console.log('   ✅ All manifest entries exist in dictionary');
    }
}

// ==================== 2. MANIFEST ↔ MP3 FILES ====================
function checkManifestVsMp3(manifestPath, audioDir) {
    console.log('\n🎵 2. Manifest ↔ MP3 Files Check');
    const manifest = getJsonContent(manifestPath);
    if (!manifest) return;

    const manifestIds = new Set(Object.keys(manifest));
    const mp3Files = new Set();

    // Գտնել բոլոր mp3 ֆայլերը audio թղթապանակում
    const allFiles = getAllFiles(audioDir);
    allFiles.forEach(file => {
        if (file.endsWith('.mp3')) {
            const fileName = path.basename(file, '.mp3');
            mp3Files.add(fileName);
        }
    });

    // Ստուգել մանիֆեստի ID-ները MP3 ֆայլերի դեմ
    const missingMp3 = [...manifestIds].filter(id => !mp3Files.has(id));
    const extraMp3 = [...mp3Files].filter(id => !manifestIds.has(id));

    console.log(`   Manifest entries: ${manifestIds.size}`);
    console.log(`   MP3 files found: ${mp3Files.size}`);
    if (missingMp3.length) {
        console.log(`   ⚠️ Manifest IDs missing MP3 (${missingMp3.length}):`, missingMp3.slice(0, 5), '...');
    } else {
        console.log('   ✅ All manifest entries have corresponding MP3 files');
    }
    if (extraMp3.length) {
        console.log(`   ⚠️ Extra MP3 files not in manifest (${extraMp3.length}):`, extraMp3.slice(0, 5), '...');
    } else {
        console.log('   ✅ All MP3 files are listed in manifest');
    }
}

// ==================== 3. EXERCISE ↔ DICTIONARY MAPPING ====================
function checkExerciseDictionaryMapping(exercisesPath, dictPath) {
    console.log('\n📝 3. Exercise ↔ Dictionary Mapping Check');
    const dict = getJsonContent(dictPath);
    if (!dict) return;

    // Փնտրել exercise ֆայլերը (ենթադրում ենք, որ դրանք .js կամ .json են)
    const allFiles = getAllFiles(exercisesPath);
    const exerciseFiles = allFiles.filter(f => 
        f.includes('exercise') || f.includes('lesson') && (f.endsWith('.js') || f.endsWith('.json'))
    );

    let missingKeys = new Set();
    let dictKeys = new Set(Object.keys(dict));

    exerciseFiles.forEach(file => {
        try {
            const content = fs.readFileSync(file, 'utf8');
            // Փնտրել dictionary key-երի հղումները (ենթադրելով, որ դրանք "wordId" կամ "dictionaryKey" են)
            const matches = content.match(/["'](?:wordId|dictionaryKey|key)["']\s*:\s*["']([^"']+)["']/g);
            if (matches) {
                matches.forEach(match => {
                    const key = match.match(/["']([^"']+)["']$/)[1];
                    if (!dictKeys.has(key)) {
                        missingKeys.add(key);
                    }
                });
            }
        } catch (error) {
            // Անտեսել ֆայլերը, որոնք չեն կարող կարդալ
        }
    });

    console.log(`   Dictionary entries: ${dictKeys.size}`);
    console.log(`   Exercise files scanned: ${exerciseFiles.length}`);
    if (missingKeys.size) {
        console.log(`   ⚠️ Dictionary keys missing in exercises (${missingKeys.size}):`, [...missingKeys].slice(0, 5), '...');
    } else {
        console.log('   ✅ All dictionary keys referenced in exercises exist');
    }
}

// ==================== 4. OFFLINE MANIFESTS ↔ AUDIOMANAGER ====================
function checkOfflineManifests(offlineDir) {
    console.log('\n📱 4. Offline Manifests ↔ AudioManager Check');
    const allFiles = getAllFiles(offlineDir);
    const manifestFiles = allFiles.filter(f => f.includes('manifest') && f.endsWith('.json'));
    
    manifestFiles.forEach(file => {
        const manifest = getJsonContent(file);
        if (manifest) {
            const keys = Object.keys(manifest);
            console.log(`   ${path.basename(file)}: ${keys.length} entries`);
            // Ստուգել, արդյոք կան պակասող աուդիո ֆայլեր
            const baseDir = path.dirname(file);
            let missingFiles = 0;
            keys.forEach(key => {
                const mp3Path = path.join(baseDir, `${key}.mp3`);
                if (!fs.existsSync(mp3Path)) {
                    missingFiles++;
                }
            });
            if (missingFiles > 0) {
                console.log(`   ⚠️ ${missingFiles} missing MP3 files for this manifest`);
            } else {
                console.log('   ✅ All MP3 files exist for this manifest');
            }
        }
    });
}

// ==================== 5. MISSING IDS ====================
function checkMissingIds(rootDir) {
    console.log('\n🔍 5. Missing IDs Check');
    const allFiles = getAllFiles(rootDir);
    const jsonFiles = allFiles.filter(f => f.endsWith('.json'));
    const missingIds = new Set();

    jsonFiles.forEach(file => {
        const data = getJsonContent(file);
        if (data && typeof data === 'object') {
            // Փնտրել "id" դաշտեր, որոնք դատարկ են կամ բացակայում են
            Object.values(data).forEach(item => {
                if (item && typeof item === 'object' && item.id === undefined) {
                    missingIds.add(path.basename(file));
                }
            });
        }
    });

    if (missingIds.size > 0) {
        console.log(`   ⚠️ Files with missing IDs (${missingIds.size}):`, [...missingIds]);
    } else {
        console.log('   ✅ No missing IDs found');
    }
}

// ==================== 6. DUPLICATE IDS ====================
function checkDuplicateIds(rootDir) {
    console.log('\n🔄 6. Duplicate IDs Check');
    const allFiles = getAllFiles(rootDir);
    const jsonFiles = allFiles.filter(f => f.endsWith('.json'));
    const allIds = new Map();
    let duplicateFound = false;

    jsonFiles.forEach(file => {
        const data = getJsonContent(file);
        if (data && typeof data === 'object') {
            Object.values(data).forEach(item => {
                if (item && typeof item === 'object' && item.id) {
                    if (allIds.has(item.id)) {
                        duplicateFound = true;
                        console.log(`   ⚠️ Duplicate ID "${item.id}" found in ${path.basename(file)} and ${path.basename(allIds.get(item.id))}`);
                    } else {
                        allIds.set(item.id, file);
                    }
                }
            });
        }
    });

    if (!duplicateFound) {
        console.log('   ✅ No duplicate IDs found');
    }
}

// ==================== 7. ORPHAN MP3 FILES ====================
function checkOrphanMp3(audioDir, manifestPath) {
    console.log('\n🗑️ 7. Orphan MP3 Files Check');
    const manifest = getJsonContent(manifestPath);
    if (!manifest) return;

    const manifestIds = new Set(Object.keys(manifest));
    const allFiles = getAllFiles(audioDir);
    const orphanMp3 = [];

    allFiles.forEach(file => {
        if (file.endsWith('.mp3')) {
            const fileName = path.basename(file, '.mp3');
            if (!manifestIds.has(fileName)) {
                orphanMp3.push(file);
            }
        }
    });

    if (orphanMp3.length > 0) {
        console.log(`   ⚠️ Orphan MP3 files (${orphanMp3.length}):`, orphanMp3.slice(0, 5), '...');
    } else {
        console.log('   ✅ No orphan MP3 files found');
    }
}

// ==================== 8. FALLBACK LOGIC ====================
function checkFallbackLogic(rootDir) {
    console.log('\n🔄 8. Fallback Logic Check');
    const allFiles = getAllFiles(rootDir);
    const jsFiles = allFiles.filter(f => f.endsWith('.js') || f.endsWith('.ts'));

    let fallbackCount = 0;
    jsFiles.forEach(file => {
        try {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('fallback') || content.includes('AudioManager') && content.includes('catch')) {
                fallbackCount++;
            }
        } catch (error) {
            // Անտեսել ֆայլերը, որոնք չեն կարող կարդալ
        }
    });

    console.log(`   JS/TS files with fallback logic: ${fallbackCount}`);
    console.log('   ⚠️ Manual review recommended to ensure proper fallback implementation');
}

// ==================== 9. SERVICE WORKER CACHE ====================
function checkServiceWorker(rootDir) {
    console.log('\n⚙️ 9. Service Worker Cache Check');
    const allFiles = getAllFiles(rootDir);
    const swFiles = allFiles.filter(f => f.includes('sw.js') || f.includes('service-worker.js'));

    if (swFiles.length === 0) {
        console.log('   ⚠️ No Service Worker file found');
        return;
    }

    swFiles.forEach(file => {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const hasCache = content.includes('cache') || content.includes('CacheStorage');
            const hasAudioCache = content.includes('audio') && (content.includes('add') || content.includes('put'));
            
            console.log(`   ${path.basename(file)}:`);
            console.log(`      Cache API usage: ${hasCache ? '✅' : '❌'}`);
            console.log(`      Audio caching: ${hasAudioCache ? '✅' : '❌'}`);
            
            if (content.includes('workbox')) {
                console.log('      Workbox detected: ✅');
            }
        } catch (error) {
            console.log(`   ❌ Could not read ${path.basename(file)}`);
        }
    });
}

// ==================== ԳԼԽԱՎՈՐ ՖՈՒՆԿՑԻԱ ====================
function runFullAudit() {
    console.log('🚀 Starting Full Audio System Audit...');
    console.log(`📂 Project root: ${PROJECT_ROOT}`);

    // Որոշել կարևոր ուղիները
    const dataDir = path.join(PROJECT_ROOT, 'data');
    const dictDir = path.join(dataDir, 'dictionaries');
    const dictPath = path.join(dictDir, 'lesson-dictionary.json');
    const publicDir = path.join(PROJECT_ROOT, 'public');
    const audioDir = path.join(publicDir, 'audio');
    const offlineDir = path.join(audioDir, 'offline');
    const manifestPath = path.join(audioDir, 'manifest_dictionary.json');

    // 1. Dictionary ↔ Audio Manifest
    if (fs.existsSync(dictPath) && fs.existsSync(manifestPath)) {
        checkDictionaryVsManifest(dictPath, manifestPath);
    } else {
        console.log('\n📚 1. Dictionary ↔ Audio Manifest: ⚠️ Required files not found');
    }

    // 2. Manifest ↔ MP3 Files
    if (fs.existsSync(manifestPath) && fs.existsSync(audioDir)) {
        checkManifestVsMp3(manifestPath, audioDir);
    } else {
        console.log('\n🎵 2. Manifest ↔ MP3 Files: ⚠️ Required files/directories not found');
    }

    // 3. Exercise ↔ Dictionary Mapping
    const exercisesPath = path.join(PROJECT_ROOT, 'src'); // ենթադրում ենք, որ վարժությունները src-ում են
    if (fs.existsSync(exercisesPath) && fs.existsSync(dictPath)) {
        checkExerciseDictionaryMapping(exercisesPath, dictPath);
    } else {
        console.log('\n📝 3. Exercise ↔ Dictionary Mapping: ⚠️ Required files/directories not found');
    }

    // 4. Offline Manifests ↔ AudioManager
    if (fs.existsSync(offlineDir)) {
        checkOfflineManifests(offlineDir);
    } else {
        console.log('\n📱 4. Offline Manifests ↔ AudioManager: ⚠️ Offline directory not found');
    }

    // 5. Missing IDs
    checkMissingIds(PROJECT_ROOT);

    // 6. Duplicate IDs
    checkDuplicateIds(PROJECT_ROOT);

    // 7. Orphan MP3 Files
    if (fs.existsSync(audioDir) && fs.existsSync(manifestPath)) {
        checkOrphanMp3(audioDir, manifestPath);
    } else {
        console.log('\n🗑️ 7. Orphan MP3 Files: ⚠️ Required files/directories not found');
    }

    // 8. Fallback Logic
    checkFallbackLogic(PROJECT_ROOT);

    // 9. Service Worker Cache
    checkServiceWorker(PROJECT_ROOT);

    console.log('\n✅ Audit completed!');
}

// ==================== ԳՈՐԾԱՐԿԵԼ ====================
runFullAudit();