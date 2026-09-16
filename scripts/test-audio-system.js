// scripts/test-audio-system.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🎵 ՆՈՒՐԼԻՆԳՈ - ԱՈՒԴԻՈՀԱՄԱԿԱՐԳԻ ԹԵՍՏ');
console.log('='.repeat(60));

const rootDir = path.resolve(__dirname, '..');
const audioDir = path.join(rootDir, 'public', 'audio');

class AudioSystemTester {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0
        };
    }

    runAllTests() {
        console.log('\n📋 ԹԵՍՏԵՐԻ ՑԱՆԿ:\n');
        
        this.testDirectories();
        this.testManifests();
        this.testMappings();
        this.testAudioFiles();
        this.testDictionaryAudio();
        this.testUserDictionaryAudio();
        this.testCorruptedFiles();
        
        this.printSummary();
    }

    testDirectories() {
        console.log('📁 ԹԵՍՏ 1: Աուդիո դիրեկտորիաների ստուգում');
        console.log('-'.repeat(40));

        const expectedDirs = [
            'offline/hy_Ani',
            'offline/en_female',
            'offline/ru_female',
            'offline_dictionary/hy',
            'offline_dictionary/en',
            'offline_dictionary/ru',
            'offline_user_dictionary/hy_user',
            'offline_user_dictionary/en_user',
            'offline_user_dictionary/ru_user'
        ];

        for (const dir of expectedDirs) {
            const fullPath = path.join(audioDir, dir);
            const exists = fs.existsSync(fullPath);
            const status = exists ? '✅' : '❌';
            
            if (exists) {
                this.results.passed++;
                console.log(`  ${status} ${dir}`);
            } else {
                this.results.failed++;
                console.log(`  ${status} ${dir} - ԲԱՑԱԿԱՅՈՒՄ Է`);
                // Ստեղծել բացակայող դիրեկտորիան
                if (dir.includes('user_dictionary')) {
                    fs.mkdirSync(fullPath, { recursive: true });
                    console.log(`     📁 Ստեղծվեց: ${dir}`);
                }
            }
        }
        console.log();
    }

    testManifests() {
        console.log('📋 ԹԵՍՏ 2: Manifest ֆայլերի ստուգում');
        console.log('-'.repeat(40));

        const manifests = [
            'offline/manifest_hy_ani.json',
            'offline/manifest_en_female.json',
            'offline/manifest_ru_female.json',
            'offline/manifest_index.json',
            'offline_dictionary/manifest.json',
            'offline_user_dictionary/user_manifest.json'
        ];

        for (const manifest of manifests) {
            const fullPath = path.join(audioDir, manifest);
            const exists = fs.existsSync(fullPath);
            
            if (exists) {
                try {
                    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    const count = Array.isArray(data) ? data.length : Object.keys(data).length;
                    console.log(`  ✅ ${path.basename(manifest)} - ${count} entries`);
                    this.results.passed++;
                } catch (e) {
                    console.log(`  ❌ ${path.basename(manifest)} - CORRUPTED`);
                    this.results.failed++;
                }
            } else {
                console.log(`  ❌ ${path.basename(manifest)} - ԲԱՑԱԿԱՅՈՒՄ Է`);
                this.results.failed++;
                // Ստեղծել դատարկ manifest
                this.createEmptyManifest(manifest);
            }
        }
        console.log();
    }

    createEmptyManifest(manifestPath) {
        const fullPath = path.join(audioDir, manifestPath);
        const dir = path.dirname(fullPath);
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        const emptyData = manifestPath.includes('user') ? {} : [];
        fs.writeFileSync(fullPath, JSON.stringify(emptyData, null, 2));
        console.log(`     📝 Ստեղծվեց դատարկ manifest: ${path.basename(manifestPath)}`);
    }

    testMappings() {
        console.log('🗺️ ԹԵՍՏ 3: Mapping ֆայլերի ստուգում');
        console.log('-'.repeat(40));

        const srcDir = path.join(rootDir, 'src', 'lib', 'content');
        const mappings = [
            'audio-num-hy-mapping.json',
            'audio-num-en-mapping.json',
            'audio-num-ru-mapping.json'
        ];

        for (const mapping of mappings) {
            const fullPath = path.join(srcDir, 'mappings', mapping);
            const exists = fs.existsSync(fullPath);
            
            if (exists) {
                try {
                    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    const count = Object.keys(data).length;
                    console.log(`  ✅ ${mapping} - ${count} entries`);
                    this.results.passed++;
                } catch (e) {
                    console.log(`  ❌ ${mapping} - CORRUPTED`);
                    this.results.failed++;
                }
            } else {
                console.log(`  ❌ ${mapping} - ԲԱՑԱԿԱՅՈՒՄ Է`);
                this.results.failed++;
            }
        }
        console.log();
    }

    testAudioFiles() {
        console.log('🎧 ԹԵՍՏ 4: Աուդիո ֆայլերի ստուգում (sample)');
        console.log('-'.repeat(40));

        const testFiles = [
            { dir: 'offline/hy_Ani', file: '000001.mp3', language: 'Հայերեն' },
            { dir: 'offline/en_female', file: '000001.mp3', language: 'Անգլերեն' },
            { dir: 'offline/ru_female', file: '000001.mp3', language: 'Ռուսերեն' },
            { dir: 'offline_dictionary/hy', file: '001001.mp3', language: 'Բառարան Հայ' },
            { dir: 'offline_dictionary/en', file: '001001.mp3', language: 'Բառարան Անգլ' },
            { dir: 'offline_dictionary/ru', file: '001001.mp3', language: 'Բառարան Ռուս' }
        ];

        for (const test of testFiles) {
            const fullPath = path.join(audioDir, test.dir, test.file);
            const exists = fs.existsSync(fullPath);
            const status = exists ? '✅' : '⚠️';
            
            if (exists) {
                const stats = fs.statSync(fullPath);
                const size = (stats.size / 1024).toFixed(1);
                console.log(`  ${status} ${test.language} - ${test.file} (${size}KB)`);
                this.results.passed++;
            } else {
                console.log(`  ${status} ${test.language} - ${test.file} ԲԱՑԱԿԱՅՈՒՄ Է`);
                this.results.warnings++;
            }
        }
        console.log();
    }

    testDictionaryAudio() {
        console.log('📖 ԹԵՍՏ 5: Բառարանի աուդիո ֆայլերի քանակ');
        console.log('-'.repeat(40));

        const dictDirs = [
            { dir: 'offline_dictionary/hy', name: 'Հայերեն բառարան', expected: 1152 },
            { dir: 'offline_dictionary/en', name: 'Անգլերեն բառարան', expected: 1152 },
            { dir: 'offline_dictionary/ru', name: 'Ռուսերեն բառարան', expected: 1152 }
        ];

        for (const dict of dictDirs) {
            const fullPath = path.join(audioDir, dict.dir);
            if (fs.existsSync(fullPath)) {
                const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.mp3'));
                const count = files.length;
                const status = count >= dict.expected ? '✅' : '⚠️';
                console.log(`  ${status} ${dict.name}: ${count}/${dict.expected} ֆայլ`);
                
                if (count >= dict.expected) {
                    this.results.passed++;
                } else {
                    this.results.warnings++;
                }
            } else {
                console.log(`  ❌ ${dict.name}: Դիրեկտորիան բացակայում է`);
                this.results.failed++;
            }
        }
        console.log();
    }

    testUserDictionaryAudio() {
        console.log('👤 ԹԵՍՏ 6: User dictionary աուդիո');
        console.log('-'.repeat(40));

        const userDirs = [
            { dir: 'offline_user_dictionary/hy_user', name: 'User Հայ' },
            { dir: 'offline_user_dictionary/en_user', name: 'User Անգլ' },
            { dir: 'offline_user_dictionary/ru_user', name: 'User Ռուս' }
        ];

        for (const user of userDirs) {
            const fullPath = path.join(audioDir, user.dir);
            if (fs.existsSync(fullPath)) {
                const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.mp3'));
                console.log(`  ✅ ${user.name}: ${files.length} ֆայլ`);
                this.results.passed++;
            } else {
                console.log(`  ⚠️ ${user.name}: Դիրեկտորիան բացակայում է`);
                fs.mkdirSync(fullPath, { recursive: true });
                console.log(`     📁 Ստեղծվեց: ${user.dir}`);
                this.results.warnings++;
            }
        }
        console.log();
    }

    testCorruptedFiles() {
        console.log('🔧 ԹԵՍՏ 7: Կոռումպացված ֆայլերի ստուգում');
        console.log('-'.repeat(40));

        const hyDir = path.join(audioDir, 'offline', 'hy_Ani');
        const backupDir = path.join(hyDir, 'corrupted_backup');
        
        if (fs.existsSync(backupDir)) {
            const corrupted = fs.readdirSync(backupDir).filter(f => f.endsWith('.mp3'));
            console.log(`  ⚠️ ${corrupted.length} կոռումպացված ֆայլեր backup-ում`);
            console.log(`     📂 Backup: ${backupDir}`);
            this.results.warnings += corrupted.length;
        } else {
            console.log('  ✅ Կոռումպացված ֆայլեր չկան');
            this.results.passed++;
        }
        console.log();
    }

    printSummary() {
        console.log('='.repeat(60));
        console.log('📊 ԹԵՍՏԻ ԱՐԴՅՈՒՆՔՆԵՐ');
        console.log('='.repeat(60));
        console.log(`  ✅ Հաջողված: ${this.results.passed}`);
        console.log(`  ❌ Ձախողված: ${this.results.failed}`);
        console.log(`  ⚠️ Զգուշացումներ: ${this.results.warnings}`);
        console.log();
        
        const total = this.results.passed + this.results.failed + this.results.warnings;
        const score = total > 0 ? Math.round((this.results.passed / total) * 100) : 0;
        console.log(`  🎯 Համակարգի առողջություն: ${score}%`);
        
        if (this.results.failed === 0 && this.results.warnings < 10) {
            console.log('\n🎉 ԱՈՒԴԻՈՀԱՄԱԿԱՐԳԸ ԱՇԽԱՏՈՒՄ Է ՆՈՐՄԱԼ');
        } else if (this.results.failed === 0) {
            console.log('\n⚠️ ԱՈՒԴԻՈՀԱՄԱԿԱՐԳԸ ԱՇԽԱՏՈՒՄ Է, ԲԱՅՑ ԿԱՆ ԶԳՈՒՇԱՑՈՒՄՆԵՐ');
        } else {
            console.log('\n❌ ԱՈՒԴԻՈՀԱՄԱԿԱՐԳԸ ՊԵՏՔ Է ՈՒՂՂԵԼ');
        }
        console.log('='.repeat(60));
    }
}

// Գործարկել թեստերը
const tester = new AudioSystemTester();
tester.runAllTests();