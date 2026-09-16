// audio-audit.js
// NUR Lingo - Audio Integrity Audit (Updated)
// Run with: node audio-audit.js

const fs = require('fs');
const path = require('path');

// ============================================================
// 1. ԿԱՐԳԱՎՈՐՈՒՄՆԵՐ
// ============================================================

// Փոխեք այս արժեքը ձեր նախագծի արմատային հասցեին
const PROJECT_ROOT = 'C:/Users/Armen/Documents/NurLingo/NURLingo-main/nurlingo_integrated_round2';

// Բացառվող թղթապանակներ և ֆայլեր (audit-ի մաս չեն լինի)
const EXCLUDED_DIRS = new Set([
    'node_modules', '.git', '.next', '.vercel', 'dist', 'build',
    'coverage', '.cache', '.turbo', '.idea', '.vscode', 'logs',
    'audit-reports', 'src.zip', '__pycache__', '.pytest_cache',
    'venv', 'env', '.venv', 'site-packages'
]);

const EXCLUDED_FILES = new Set([
    'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock',
    'tsconfig.json', 'tsconfig.tsbuildinfo', 'next-env.d.ts',
    'postcss.config.js', 'tailwind.config.js', 'next.config.js',
    'fix-dictionary.js', 'fix-expand.js', 'server.js'
]);

// Meta-data keys in manifests (should be ignored during validation)
const MANIFEST_META_KEYS = new Set([
    'entries', 'totalEntries', 'lastUpdated', 'source',
    'version', 'generatedAt', 'voice', 'languages',
    'timestamp', 'count', 'metadata', 'schema',
    'description', 'author', 'createdAt', 'updatedAt',
    'total', 'page', 'pages', 'next', 'prev'
]);

// ============================================================
// 2. ՕԳՆԱԿԱՆ ՖՈՒՆԿՑԻԱՆԵՐ
// ============================================================

class AuditLogger {
    constructor() {
        this.results = [];
        this.passCount = 0;
        this.warningCount = 0;
        this.errorCount = 0;
        this.totalFiles = 0;
    }

    log(message, type = 'info') {
        const prefix = {
            'pass': '✅ PASS',
            'warning': '⚠️ WARNING',
            'error': '❌ ERROR',
            'info': '📌 INFO',
            'section': '📋 SECTION'
        }[type] || '📌 INFO';
        console.log(`${prefix}: ${message}`);
        this.results.push({ type, message });
        if (type === 'pass') this.passCount++;
        if (type === 'warning') this.warningCount++;
        if (type === 'error') this.errorCount++;
    }

    section(title) {
        console.log('\n' + '='.repeat(80));
        console.log(`📋 ${title}`);
        console.log('='.repeat(80));
        this.results.push({ type: 'section', message: title });
    }

    summary() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 ԱՄՓՈՓ ՀԱՇՎԵՏՎՈՒԹՅՈՒՆ');
        console.log('='.repeat(80));
        console.log(`📁 Ստուգված ֆայլեր՝ ${this.totalFiles}`);
        console.log(`✅ PASS: ${this.passCount}`);
        console.log(`⚠️ WARNING: ${this.warningCount}`);
        console.log(`❌ ERROR: ${this.errorCount}`);
        
        // Calculate score considering only non-meta checks
        const total = this.passCount + this.warningCount + this.errorCount;
        const score = total > 0 ? Math.round((this.passCount / total) * 100) : 0;
        console.log(`📈 Offline Readiness Score: ${score}%`);
        
        const status = this.errorCount === 0 ? '✅ PASS' : '❌ FAIL';
        console.log(`🏁 Վերջնական գնահատական: ${status}`);
        console.log('='.repeat(80));
    }
}

function getProjectFiles(dir, fileList = []) {
    try {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
            const fullPath = path.join(dir, entry);
            const stat = fs.statSync(fullPath);
            const baseName = path.basename(entry);
            
            if (EXCLUDED_DIRS.has(baseName)) continue;
            if (EXCLUDED_FILES.has(baseName)) continue;
            
            if (stat.isDirectory()) {
                getProjectFiles(fullPath, fileList);
            } else {
                // Skip manifest meta entries in filenames
                if (MANIFEST_META_KEYS.has(baseName.replace('.json', ''))) continue;
                fileList.push(fullPath);
            }
        }
    } catch (error) {
        // Անտեսել անհասանելի թղթապանակները
    }
    return fileList;
}

function readJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        return null;
    }
}

function isManifestMetaKey(key) {
    return MANIFEST_META_KEYS.has(key);
}

function findLineNumber(filePath, pattern) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(pattern)) {
                return i + 1;
            }
        }
    } catch (error) {}
    return null;
}

// ============================================================
// 3. AUDIT FUNCTIONS
// ============================================================

function findDictionaryFiles(projectFiles) {
    const patterns = ['lesson-dictionary.json', 'unified-dictionary.json', 'user-dictionary.json'];
    const files = [];
    for (const file of projectFiles) {
        for (const pattern of patterns) {
            if (file.includes(pattern) && !file.includes('.backup')) {
                files.push(file);
            }
        }
    }
    return files;
}

function findManifestFiles(projectFiles) {
    const manifests = [];
    for (const file of projectFiles) {
        if (file.includes('manifest') && file.endsWith('.json')) {
            manifests.push(file);
        }
    }
    return manifests;
}

function findAudioFiles(projectFiles) {
    return projectFiles.filter(f => f.endsWith('.mp3'));
}

function findServiceWorker(projectFiles) {
    return projectFiles.find(f => f.includes('sw.js') || f.includes('service-worker.js'));
}

function findAudioManager(projectFiles) {
    return projectFiles.find(f => f.includes('AudioManager') && (f.endsWith('.js') || f.endsWith('.ts')));
}

function findExerciseFiles(projectFiles) {
    return projectFiles.filter(f => 
        (f.includes('exercise') || f.includes('lesson')) && 
        (f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.json'))
    );
}

// ============================================================
// 3.1. Dictionary ↔ Audio Manifest
// ============================================================

function auditDictionaryManifest(projectFiles, logger) {
    logger.section('Dictionary ↔ Audio Manifest');
    
    const dictFiles = findDictionaryFiles(projectFiles);
    if (dictFiles.length === 0) {
        logger.log('Dictionary files not found!', 'error');
        return;
    }
    
    const manifests = findManifestFiles(projectFiles);
    if (manifests.length === 0) {
        logger.log('No manifest files found!', 'error');
        return;
    }
    
    // Load all dictionaries
    const allDictKeys = new Set();
    const dictAudioIds = new Set();
    let dictCount = 0;
    
    for (const dictFile of dictFiles) {
        const dict = readJsonFile(dictFile);
        if (!dict) {
            logger.log(`Cannot parse dictionary: ${path.basename(dictFile)}`, 'error');
            continue;
        }
        
        const keys = Object.keys(dict);
        dictCount += keys.length;
        for (const key of keys) {
            allDictKeys.add(key);
            if (dict[key] && typeof dict[key] === 'object' && dict[key].audioId) {
                dictAudioIds.add(dict[key].audioId);
            }
        }
    }
    
    logger.log(`Dictionary entries: ${dictCount} (${dictFiles.length} files)`, 'info');
    logger.log(`Dictionary audioIds: ${dictAudioIds.size}`, 'info');
    
    let totalManifestEntries = 0;
    let missingInManifest = [];
    let extraInManifest = [];
    
    for (const manifestFile of manifests) {
        const manifest = readJsonFile(manifestFile);
        if (!manifest) continue;
        
        const manifestKeys = Object.keys(manifest);
        const filteredKeys = manifestKeys.filter(k => !isManifestMetaKey(k));
        totalManifestEntries += filteredKeys.length;
        
        // Check dictionary audioIds in manifest
        for (const id of dictAudioIds) {
            if (!manifestKeys.includes(id)) {
                missingInManifest.push(id);
            }
        }
        
        // Check manifest entries in dictionary
        for (const key of filteredKeys) {
            if (!allDictKeys.has(key) && !manifestFile.includes('_index')) {
                extraInManifest.push(key);
            }
        }
    }
    
    if (missingInManifest.length === 0) {
        logger.log('All dictionary audioIds exist in manifests', 'pass');
    } else {
        logger.log(`${missingInManifest.length} audioIds missing from manifests`, 'error');
        const sample = missingInManifest.slice(0, 5);
        for (const id of sample) {
            logger.log(`  - ${id}`, 'info');
        }
        if (missingInManifest.length > 5) {
            logger.log(`  ... and ${missingInManifest.length - 5} more`, 'info');
        }
        logger.log('Լուծում: Ավելացրեք բացակայող audioId-ները համապատասխան մանիֆեստներում', 'info');
    }
    
    if (extraInManifest.length === 0) {
        logger.log('All manifest entries exist in dictionary', 'pass');
    } else {
        // Filter out meta keys from extra check
        const realExtra = extraInManifest.filter(k => !isManifestMetaKey(k));
        if (realExtra.length === 0) {
            logger.log('All manifest entries exist in dictionary (meta keys ignored)', 'pass');
        } else {
            logger.log(`${realExtra.length} extra entries in manifests`, 'warning');
            const sample = realExtra.slice(0, 5);
            for (const key of sample) {
                logger.log(`  - ${key}`, 'info');
            }
            if (realExtra.length > 5) {
                logger.log(`  ... and ${realExtra.length - 5} more`, 'info');
            }
            logger.log('Լուծում: Հեռացրեք ավելորդ entries-ները կամ ավելացրեք դրանք բառարանում', 'info');
        }
    }
}

// ============================================================
// 3.2. Manifest ↔ Offline MP3
// ============================================================

function auditManifestOfflineMp3(projectFiles, logger) {
    logger.section('Manifest ↔ Offline MP3');
    
    const manifests = findManifestFiles(projectFiles);
    if (manifests.length === 0) {
        logger.log('No manifest files found!', 'error');
        return;
    }
    
    const offlineManifests = manifests.filter(f => f.includes('offline'));
    if (offlineManifests.length === 0) {
        logger.log('No offline manifests found', 'warning');
        logger.log('Լուծում: Ստեղծեք offline մանիֆեստներ public/audio/offline/ թղթապանակում', 'info');
        return;
    }
    
    const audioFiles = findAudioFiles(projectFiles);
    const audioSet = new Set();
    for (const file of audioFiles) {
        const name = path.basename(file, '.mp3');
        audioSet.add(name);
    }
    
    let totalChecked = 0;
    let missingMp3 = [];
    
    for (const manifestFile of offlineManifests) {
        const manifest = readJsonFile(manifestFile);
        if (!manifest) continue;
        
        const manifestKeys = Object.keys(manifest);
        const filteredKeys = manifestKeys.filter(k => !isManifestMetaKey(k));
        totalChecked += filteredKeys.length;
        
        for (const key of filteredKeys) {
            if (!audioSet.has(key)) {
                missingMp3.push({ key, manifest: path.basename(manifestFile) });
            }
        }
    }
    
    if (missingMp3.length === 0) {
        logger.log(`All ${totalChecked} offline manifest entries have MP3 files`, 'pass');
    } else {
        logger.log(`${missingMp3.length} MP3 files missing for offline manifests`, 'error');
        const sample = missingMp3.slice(0, 5);
        for (const item of sample) {
            logger.log(`  - ${item.key} (${item.manifest})`, 'info');
        }
        if (missingMp3.length > 5) {
            logger.log(`  ... and ${missingMp3.length - 5} more`, 'info');
        }
        logger.log('Լուծում: Ներբեռնեք բացակայող MP3 ֆայլերը offline թղթապանակ', 'info');
    }
}

// ============================================================
// 3.3. Exercise ↔ Dictionary Mapping
// ============================================================

function auditExerciseDictionary(projectFiles, logger) {
    logger.section('Exercise ↔ Dictionary Mapping');
    
    const dictFiles = findDictionaryFiles(projectFiles);
    if (dictFiles.length === 0) {
        logger.log('Dictionary files not found!', 'error');
        return;
    }
    
    const allDictKeys = new Set();
    for (const dictFile of dictFiles) {
        const dict = readJsonFile(dictFile);
        if (dict) {
            for (const key of Object.keys(dict)) {
                allDictKeys.add(key);
            }
        }
    }
    
    const exerciseFiles = findExerciseFiles(projectFiles);
    if (exerciseFiles.length === 0) {
        logger.log('No exercise files found!', 'warning');
        return;
    }
    
    const referencedKeys = new Set();
    
    for (const file of exerciseFiles) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const matches = content.match(/["'](?:wordId|dictionaryKey|key|word)["']\s*:\s*["']([^"']+)["']/g);
            if (matches) {
                for (const match of matches) {
                    const key = match.match(/["']([^"']+)["']$/);
                    if (key && key[1] && !isManifestMetaKey(key[1])) {
                        referencedKeys.add(key[1]);
                    }
                }
            }
        } catch (error) {
            // Skip unreadable files
        }
    }
    
    const missingKeys = [];
    for (const key of referencedKeys) {
        if (!allDictKeys.has(key)) {
            missingKeys.push(key);
        }
    }
    
    if (missingKeys.length === 0) {
        logger.log(`All ${referencedKeys.size} referenced keys exist in dictionary`, 'pass');
    } else {
        logger.log(`${missingKeys.length} dictionary keys missing from exercises`, 'warning');
        const sample = missingKeys.slice(0, 5);
        for (const key of sample) {
            logger.log(`  - ${key}`, 'info');
        }
        if (missingKeys.length > 5) {
            logger.log(`  ... and ${missingKeys.length - 5} more`, 'info');
        }
        logger.log('Լուծում: Ավելացրեք բացակայող keys-ները բառարանում', 'info');
    }
}

// ============================================================
// 3.4. Offline Manifest ↔ AudioManager
// ============================================================

function auditOfflineAudioManager(projectFiles, logger) {
    logger.section('Offline Manifest ↔ AudioManager');
    
    const audioManager = findAudioManager(projectFiles);
    if (!audioManager) {
        logger.log('AudioManager not found!', 'error');
        logger.log('Լուծում: Ստեղծեք AudioManager դաս կամ մոդուլ', 'info');
        return;
    }
    
    const offlineManifests = findManifestFiles(projectFiles).filter(f => f.includes('offline'));
    if (offlineManifests.length === 0) {
        logger.log('No offline manifests found', 'warning');
        return;
    }
    
    try {
        const content = fs.readFileSync(audioManager, 'utf8');
        let manifestReferences = 0;
        let referencedManifests = [];
        
        for (const manifest of offlineManifests) {
            const basename = path.basename(manifest);
            if (content.includes(basename) || content.includes(basename.replace('.json', ''))) {
                manifestReferences++;
                referencedManifests.push(basename);
            }
        }
        
        if (manifestReferences === offlineManifests.length) {
            logger.log(`AudioManager references all ${offlineManifests.length} offline manifests`, 'pass');
            for (const name of referencedManifests) {
                logger.log(`  - ${name}`, 'info');
            }
        } else {
            logger.log(`AudioManager references only ${manifestReferences}/${offlineManifests.length} manifests`, 'warning');
            logger.log('Լուծում: Ավելացրեք բոլոր offline մանիֆեստների հղումները AudioManager-ում', 'info');
        }
        
        // Ստուգել preload/caching logic
        if (content.includes('preload') || content.includes('cache')) {
            logger.log('AudioManager has preload/caching logic', 'pass');
        } else {
            logger.log('AudioManager missing preload/caching logic', 'warning');
            logger.log('Լուծում: Ավելացրեք աուդիո ֆայլերի preload և caching մեխանիզմ', 'info');
        }
    } catch (error) {
        logger.log(`Cannot read AudioManager: ${path.basename(audioManager)}`, 'error');
    }
}

// ============================================================
// 3.5. AudioManager Fallback Logic
// ============================================================

function auditFallbackLogic(projectFiles, logger) {
    logger.section('AudioManager Fallback Logic');
    
    const audioManager = findAudioManager(projectFiles);
    if (!audioManager) {
        logger.log('AudioManager not found!', 'error');
        return;
    }
    
    try {
        const content = fs.readFileSync(audioManager, 'utf8');
        let fallbackCount = 0;
        let fallbackDetails = [];
        
        // Ստուգել տարբեր fallback patterns
        const patterns = [
            { pattern: 'fallback', desc: 'General fallback' },
            { pattern: 'catch', desc: 'Error handling' },
            { pattern: 'try', desc: 'Try-catch blocks' },
            { pattern: 'offline', desc: 'Offline mode' },
            { pattern: 'retry', desc: 'Retry mechanism' },
            { pattern: 'cache', desc: 'Cache fallback' },
            { pattern: 'default', desc: 'Default values' },
            { pattern: 'error', desc: 'Error handling' }
        ];
        
        for (const { pattern, desc } of patterns) {
            if (content.includes(pattern)) {
                fallbackCount++;
                fallbackDetails.push(desc);
            }
        }
        
        if (fallbackCount >= 5) {
            logger.log(`AudioManager has excellent fallback coverage (${fallbackCount}/8 patterns)`, 'pass');
        } else if (fallbackCount >= 3) {
            logger.log(`AudioManager has good fallback coverage (${fallbackCount}/8 patterns)`, 'pass');
            logger.log(`Առկա է՝ ${fallbackDetails.join(', ')}`, 'info');
        } else if (fallbackCount >= 1) {
            logger.log(`AudioManager has minimal fallback coverage (${fallbackCount}/8 patterns)`, 'warning');
            logger.log(`Առկա է՝ ${fallbackDetails.join(', ')}`, 'info');
            logger.log('Լուծում: Ավելացրեք բացակայող fallback մեխանիզմներ', 'info');
        } else {
            logger.log(`AudioManager has no fallback coverage`, 'error');
            logger.log('Լուծում: Իրականացրեք ամբողջական fallback համակարգ', 'info');
        }
    } catch (error) {
        logger.log(`Cannot read AudioManager: ${path.basename(audioManager)}`, 'error');
    }
}

// ============================================================
// 3.6. Missing IDs
// ============================================================

function auditMissingIds(projectFiles, logger) {
    logger.section('Missing IDs');
    
    // Only check dictionary and manifest files
    const dictFiles = findDictionaryFiles(projectFiles);
    const manifestFiles = findManifestFiles(projectFiles);
    const targetFiles = [...dictFiles, ...manifestFiles];
    
    let missingCount = 0;
    let filesWithMissing = [];
    
    for (const file of targetFiles) {
        const data = readJsonFile(file);
        if (!data || typeof data !== 'object') continue;
        
        let hasMissing = false;
        for (const [key, value] of Object.entries(data)) {
            if (isManifestMetaKey(key)) continue;
            if (value && typeof value === 'object' && value.id === undefined && key !== 'audioId') {
                if (!hasMissing) {
                    filesWithMissing.push(path.basename(file));
                    missingCount++;
                    hasMissing = true;
                }
            }
        }
    }
    
    if (missingCount === 0) {
        logger.log('No missing IDs found in dictionary/manifest files', 'pass');
    } else {
        logger.log(`${missingCount} files with missing IDs`, 'warning');
        const sample = filesWithMissing.slice(0, 10);
        for (const name of sample) {
            logger.log(`  - ${name}`, 'info');
        }
        if (filesWithMissing.length > 10) {
            logger.log(`  ... and ${filesWithMissing.length - 10} more`, 'info');
        }
        logger.log('Լուծում: Ավելացրեք id դաշտ բոլոր JSON օբյեկտներին', 'info');
    }
}

// ============================================================
// 3.7. Duplicate IDs
// ============================================================

function auditDuplicateIds(projectFiles, logger) {
    logger.section('Duplicate IDs');
    
    const dictFiles = findDictionaryFiles(projectFiles);
    const idMap = new Map();
    let duplicates = [];
    
    for (const file of dictFiles) {
        const data = readJsonFile(file);
        if (!data || typeof data !== 'object') continue;
        
        for (const [key, value] of Object.entries(data)) {
            if (isManifestMetaKey(key)) continue;
            if (value && typeof value === 'object' && value.id) {
                const id = value.id;
                if (idMap.has(id)) {
                    duplicates.push({
                        id,
                        file1: path.basename(idMap.get(id)),
                        file2: path.basename(file)
                    });
                } else {
                    idMap.set(id, file);
                }
            }
        }
    }
    
    if (duplicates.length === 0) {
        logger.log('No duplicate IDs found in dictionary files', 'pass');
    } else {
        logger.log(`${duplicates.length} duplicate IDs found`, 'error');
        const sample = duplicates.slice(0, 10);
        for (const dup of sample) {
            logger.log(`  - "${dup.id}" in ${dup.file1} and ${dup.file2}`, 'info');
        }
        if (duplicates.length > 10) {
            logger.log(`  ... and ${duplicates.length - 10} more`, 'info');
        }
        logger.log('Լուծում: Փոխեք կրկնվող ID-ները, որպեսզի դրանք լինեն յուրահատուկ', 'info');
        logger.log('Առաջարկություն: Հեռացրեք user-dictionary-fixed.json-ը կամ միավորեք այն user-dictionary.json-ի հետ', 'info');
    }
}

// ============================================================
// 3.8. Orphan MP3 Files
// ============================================================

function auditOrphanMp3(projectFiles, logger) {
    logger.section('Orphan MP3 Files');
    
    const audioFiles = findAudioFiles(projectFiles);
    const manifests = findManifestFiles(projectFiles);
    
    if (audioFiles.length === 0) {
        logger.log('No MP3 files found', 'warning');
        return;
    }
    
    if (manifests.length === 0) {
        logger.log('No manifest files found', 'error');
        return;
    }
    
    // Հավաքել բոլոր manifest-ների ID-ները (բացառելով meta-data)
    const manifestIds = new Set();
    for (const manifestFile of manifests) {
        const manifest = readJsonFile(manifestFile);
        if (manifest) {
            for (const key of Object.keys(manifest)) {
                if (!isManifestMetaKey(key)) {
                    manifestIds.add(key);
                }
            }
        }
    }
    
    const orphanFiles = [];
    for (const file of audioFiles) {
        const name = path.basename(file, '.mp3');
        if (!manifestIds.has(name) && !file.includes('offline')) {
            orphanFiles.push(file);
        }
    }
    
    if (orphanFiles.length === 0) {
        logger.log(`No orphan MP3 files found (${audioFiles.length} total)`, 'pass');
    } else {
        logger.log(`${orphanFiles.length} orphan MP3 files found`, 'warning');
        for (const file of orphanFiles.slice(0, 5)) {
            logger.log(`  - ${path.basename(file)}`, 'info');
        }
        if (orphanFiles.length > 5) {
            logger.log(`  ... and ${orphanFiles.length - 5} more`, 'info');
        }
        logger.log('Լուծում: Հեռացրեք ավելորդ MP3 ֆայլերը կամ ավելացրեք դրանք մանիֆեստներում', 'info');
    }
}

// ============================================================
// 3.9. Broken Manifest Entries
// ============================================================

function auditBrokenManifests(projectFiles, logger) {
    logger.section('Broken Manifest Entries');
    
    const manifests = findManifestFiles(projectFiles);
    if (manifests.length === 0) {
        logger.log('No manifest files found', 'error');
        return;
    }
    
    const audioFiles = findAudioFiles(projectFiles);
    const audioMap = new Map();
    for (const file of audioFiles) {
        const name = path.basename(file, '.mp3');
        audioMap.set(name, file);
    }
    
    let brokenEntries = 0;
    let totalEntries = 0;
    let brokenDetails = [];
    
    for (const manifestFile of manifests) {
        const manifest = readJsonFile(manifestFile);
        if (!manifest) continue;
        
        const manifestKeys = Object.keys(manifest);
        const filteredKeys = manifestKeys.filter(k => !isManifestMetaKey(k));
        totalEntries += filteredKeys.length;
        
        for (const key of filteredKeys) {
            if (!audioMap.has(key)) {
                brokenEntries++;
                brokenDetails.push({ key, manifest: path.basename(manifestFile) });
            }
        }
    }
    
    if (brokenEntries === 0) {
        logger.log(`All ${totalEntries} manifest entries have corresponding MP3 files`, 'pass');
    } else {
        logger.log(`${brokenEntries}/${totalEntries} manifest entries missing MP3 files`, 'error');
        const sample = brokenDetails.slice(0, 5);
        for (const item of sample) {
            logger.log(`  - ${item.key} (${item.manifest})`, 'info');
        }
        if (brokenDetails.length > 5) {
            logger.log(`  ... and ${brokenDetails.length - 5} more`, 'info');
        }
        logger.log('Լուծում: Ներբեռնեք բացակայող MP3 ֆայլերը կամ հեռացրեք կոտրված entries-ները', 'info');
    }
}

// ============================================================
// 3.10. Missing Audio Files
// ============================================================

function auditMissingAudio(projectFiles, logger) {
    logger.section('Missing Audio Files');
    
    const dictFiles = findDictionaryFiles(projectFiles);
    if (dictFiles.length === 0) {
        logger.log('Dictionary files not found!', 'error');
        return;
    }
    
    const audioFiles = findAudioFiles(projectFiles);
    const audioMap = new Map();
    for (const file of audioFiles) {
        const name = path.basename(file, '.mp3');
        audioMap.set(name, file);
    }
    
    let missingAudio = [];
    let totalAudioIds = 0;
    
    for (const dictFile of dictFiles) {
        const dict = readJsonFile(dictFile);
        if (!dict) {
            logger.log(`Cannot parse dictionary: ${path.basename(dictFile)}`, 'error');
            continue;
        }
        
        for (const [key, value] of Object.entries(dict)) {
            if (isManifestMetaKey(key)) continue;
            if (value && typeof value === 'object' && value.audioId) {
                totalAudioIds++;
                const audioId = value.audioId;
                if (!audioMap.has(audioId)) {
                    missingAudio.push({ key, audioId, dictFile: path.basename(dictFile) });
                }
            }
        }
    }
    
    if (missingAudio.length === 0) {
        logger.log(`All ${totalAudioIds} dictionary entries have audio files`, 'pass');
    } else {
        logger.log(`${missingAudio.length} dictionary entries missing audio files`, 'error');
        const sample = missingAudio.slice(0, 5);
        for (const item of sample) {
            logger.log(`  - "${item.key}" → ${item.audioId} (${item.dictFile})`, 'info');
        }
        if (missingAudio.length > 5) {
            logger.log(`  ... and ${missingAudio.length - 5} more`, 'info');
        }
        logger.log('Լուծում: Ներբեռնեք բացակայող աուդիո ֆայլերը', 'info');
    }
}

// ============================================================
// 3.11. Audio Mapping Integrity
// ============================================================

function auditMappingIntegrity(projectFiles, logger) {
    logger.section('Audio Mapping Integrity');
    
    const dictFiles = findDictionaryFiles(projectFiles);
    if (dictFiles.length === 0) {
        logger.log('Dictionary files not found!', 'error');
        return;
    }
    
    let validMappings = 0;
    let invalidMappings = [];
    let totalEntries = 0;
    
    for (const dictFile of dictFiles) {
        const dict = readJsonFile(dictFile);
        if (!dict) {
            logger.log(`Cannot parse dictionary: ${path.basename(dictFile)}`, 'error');
            continue;
        }
        
        for (const [key, value] of Object.entries(dict)) {
            if (isManifestMetaKey(key)) continue;
            if (value && typeof value === 'object') {
                totalEntries++;
                const hasAudioId = value.audioId !== undefined && value.audioId !== null;
                const hasWord = value.word !== undefined || value.text !== undefined;
                
                if (hasAudioId && hasWord) {
                    validMappings++;
                } else {
                    invalidMappings.push({
                        key,
                        file: path.basename(dictFile),
                        hasAudioId,
                        hasWord
                    });
                }
            }
        }
    }
    
    if (invalidMappings.length === 0) {
        logger.log(`All ${totalEntries} entries have valid audio mappings`, 'pass');
    } else {
        logger.log(`${invalidMappings.length} entries have incomplete mappings`, 'error');
        const sample = invalidMappings.slice(0, 5);
        for (const item of sample) {
            logger.log(`  - "${item.key}": audioId=${item.hasAudioId}, word=${item.hasWord} (${item.file})`, 'info');
        }
        if (invalidMappings.length > 5) {
            logger.log(`  ... and ${invalidMappings.length - 5} more`, 'info');
        }
        logger.log('Լուծում: Լրացրեք բացակայող դաշտերը բառարանում', 'info');
    }
}

// ============================================================
// 3.12. Service Worker Audio Caching
// ============================================================

function auditServiceWorkerCache(projectFiles, logger) {
    logger.section('Service Worker Audio Caching');
    
    const swFile = findServiceWorker(projectFiles);
    if (!swFile) {
        logger.log('No Service Worker found!', 'warning');
        logger.log('Լուծում: Ստեղծեք Service Worker offline աուդիո caching-ի համար', 'info');
        return;
    }
    
    try {
        const content = fs.readFileSync(swFile, 'utf8');
        let issues = [];
        
        // Ստուգել audio caching
        if (content.includes('audio') && (content.includes('cache') || content.includes('CacheStorage'))) {
            logger.log('Service Worker has audio caching logic', 'pass');
        } else {
            logger.log('Service Worker missing audio caching logic', 'error');
            issues.push('Add audio file caching to Service Worker');
        }
        
        // Ստուգել offline support
        if (content.includes('offline') || content.includes('fallback')) {
            logger.log('Service Worker has offline fallback logic', 'pass');
        } else {
            logger.log('Service Worker missing offline fallback logic', 'warning');
            issues.push('Add offline fallback handling to Service Worker');
        }
        
        // Ստուգել MP3 support
        if (content.includes('.mp3') || content.includes('audio/')) {
            logger.log('Service Worker handles MP3 files', 'pass');
        } else {
            logger.log('Service Worker may not handle MP3 files', 'warning');
            issues.push('Add MP3 file handling to Service Worker');
        }
        
        if (issues.length > 0) {
            logger.log('Լուծումներ:', 'info');
            for (const issue of issues) {
                logger.log(`  - ${issue}`, 'info');
            }
        }
    } catch (error) {
        logger.log(`Cannot read Service Worker: ${path.basename(swFile)}`, 'error');
    }
}

// ============================================================
// 3.13. Offline Audio Coverage
// ============================================================

function auditOfflineCoverage(projectFiles, logger) {
    logger.section('Offline Audio Coverage');
    
    const dictFiles = findDictionaryFiles(projectFiles);
    if (dictFiles.length === 0) {
        logger.log('Dictionary files not found!', 'error');
        return;
    }
    
    const offlineManifests = findManifestFiles(projectFiles).filter(f => f.includes('offline'));
    if (offlineManifests.length === 0) {
        logger.log('No offline manifests found', 'error');
        logger.log('Լուծում: Ստեղծեք offline մանիֆեստներ public/audio/offline/ թղթապանակում', 'info');
        return;
    }
    
    // Հավաքել բոլոր dictionary audioId-ները
    const dictAudioIds = new Set();
    for (const dictFile of dictFiles) {
        const dict = readJsonFile(dictFile);
        if (dict) {
            for (const [key, value] of Object.entries(dict)) {
                if (isManifestMetaKey(key)) continue;
                if (value && typeof value === 'object' && value.audioId) {
                    dictAudioIds.add(value.audioId);
                }
            }
        }
    }
    
    if (dictAudioIds.size === 0) {
        logger.log('No audioIds found in dictionary', 'warning');
        return;
    }
    
    // Հավաքել բոլոր offline աուդիո ID-ները
    const offlineIds = new Set();
    for (const manifestFile of offlineManifests) {
        const manifest = readJsonFile(manifestFile);
        if (manifest) {
            for (const key of Object.keys(manifest)) {
                if (!isManifestMetaKey(key)) {
                    offlineIds.add(key);
                }
            }
        }
    }
    
    let covered = 0;
    for (const id of dictAudioIds) {
        if (offlineIds.has(id)) {
            covered++;
        }
    }
    
    const total = dictAudioIds.size;
    const percentage = total > 0 ? Math.round((covered / total) * 100) : 0;
    
    if (percentage >= 80) {
        logger.log(`Excellent offline coverage: ${percentage}% (${covered}/${total})`, 'pass');
    } else if (percentage >= 50) {
        logger.log(`Good offline coverage: ${percentage}% (${covered}/${total})`, 'warning');
        logger.log('Լուծում: Ավելացրեք ավելի շատ աուդիո ֆայլեր offline հավաքածուում', 'info');
    } else if (percentage > 0) {
        logger.log(`Low offline coverage: ${percentage}% (${covered}/${total})`, 'warning');
        logger.log('Լուծում: Զգալիորեն ավելացրեք offline աուդիո ֆայլերի քանակը', 'info');
    } else {
        logger.log(`No offline coverage: ${percentage}% (${covered}/${total})`, 'error');
        logger.log('Լուծում: Ստեղծեք offline աուդիո ֆայլեր բոլոր կարևոր բառերի համար', 'info');
    }
}

// ============================================================
// 3.14. Offline Readiness Summary
// ============================================================

function auditOfflineReadiness(projectFiles, logger) {
    logger.section('Offline Readiness');
    
    const checks = {
        'offlineManifests': findManifestFiles(projectFiles).filter(f => f.includes('offline')).length > 0,
        'serviceWorker': findServiceWorker(projectFiles) !== undefined,
        'audioManager': findAudioManager(projectFiles) !== undefined,
        'offlineAudio': findAudioFiles(projectFiles).filter(f => f.includes('offline')).length > 0,
        'audioCaching': false,
        'fallbackLogic': false
    };
    
    // Check audio caching in Service Worker
    const swFile = findServiceWorker(projectFiles);
    if (swFile) {
        try {
            const content = fs.readFileSync(swFile, 'utf8');
            checks.audioCaching = content.includes('audio') && (content.includes('cache') || content.includes('CacheStorage'));
        } catch (error) {}
    }
    
    // Check fallback logic in AudioManager
    const audioManager = findAudioManager(projectFiles);
    if (audioManager) {
        try {
            const content = fs.readFileSync(audioManager, 'utf8');
            checks.fallbackLogic = content.includes('fallback') || content.includes('catch') || content.includes('try');
        } catch (error) {}
    }
    
    let passed = 0;
    let total = Object.keys(checks).length;
    
    const checkNames = {
        'offlineManifests': 'Offline manifests exist',
        'serviceWorker': 'Service Worker exists',
        'audioManager': 'AudioManager exists',
        'offlineAudio': 'Offline audio files exist',
        'audioCaching': 'Audio caching implemented',
        'fallbackLogic': 'Fallback logic implemented'
    };
    
    for (const [check, status] of Object.entries(checks)) {
        const name = checkNames[check] || check;
        if (status) {
            logger.log(`✅ ${name}`, 'pass');
            passed++;
        } else {
            logger.log(`❌ ${name}`, 'error');
        }
    }
    
    const percentage = Math.round((passed / total) * 100);
    if (percentage === 100) {
        logger.log(`Offline readiness: ${percentage}% - Fully ready`, 'pass');
    } else if (percentage >= 66) {
        logger.log(`Offline readiness: ${percentage}% - Mostly ready`, 'warning');
    } else if (percentage >= 33) {
        logger.log(`Offline readiness: ${percentage}% - Partially ready`, 'warning');
    } else {
        logger.log(`Offline readiness: ${percentage}% - Not ready`, 'error');
    }
}

// ============================================================
// 4. ԳԼԽԱՎՈՐ AUDIT FUNCTION
// ============================================================

function runAudioAudit() {
    const logger = new AuditLogger();
    
    console.log('🎵 NUR Lingo - Audio Integrity Audit (Updated)');
    console.log(`📂 Project: ${PROJECT_ROOT}`);
    console.log('='.repeat(80));
    
    // Հավաքել բոլոր ֆայլերը
    const projectFiles = getProjectFiles(PROJECT_ROOT);
    logger.totalFiles = projectFiles.length;
    console.log(`📁 Found ${logger.totalFiles} project files`);
    
    // 1. Dictionary ↔ Audio Manifest
    auditDictionaryManifest(projectFiles, logger);
    
    // 2. Manifest ↔ Offline MP3
    auditManifestOfflineMp3(projectFiles, logger);
    
    // 3. Exercise ↔ Dictionary Mapping
    auditExerciseDictionary(projectFiles, logger);
    
    // 4. Offline Manifest ↔ AudioManager
    auditOfflineAudioManager(projectFiles, logger);
    
    // 5. AudioManager Fallback Logic
    auditFallbackLogic(projectFiles, logger);
    
    // 6. Missing IDs
    auditMissingIds(projectFiles, logger);
    
    // 7. Duplicate IDs
    auditDuplicateIds(projectFiles, logger);
    
    // 8. Orphan MP3 Files
    auditOrphanMp3(projectFiles, logger);
    
    // 9. Broken Manifest Entries
    auditBrokenManifests(projectFiles, logger);
    
    // 10. Missing Audio Files
    auditMissingAudio(projectFiles, logger);
    
    // 11. Audio Mapping Integrity
    auditMappingIntegrity(projectFiles, logger);
    
    // 12. Service Worker Audio Caching
    auditServiceWorkerCache(projectFiles, logger);
    
    // 13. Offline Audio Coverage
    auditOfflineCoverage(projectFiles, logger);
    
    // 14. Offline Readiness
    auditOfflineReadiness(projectFiles, logger);
    
    // Վերջնական ամփոփում
    logger.summary();
}

// ============================================================
// 5. ԳՈՐԾԱՐԿԵԼ
// ============================================================

try {
    runAudioAudit();
} catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error('Խնդրում եմ ստուգեք PROJECT_ROOT-ի հասցեն և համոզվեք, որ այն ճիշտ է');
    process.exit(1);
}