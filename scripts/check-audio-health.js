// scripts/check-audio-health.js

const fs = require('fs');
const path = require('path');

console.log('\n🏥 ԱՈՒԴԻՈՀԱՄԱԿԱՐԳԻ ԱՌՈՂՋՈՒԹՅԱՆ ՍՏՈՒԳՈՒՄ');
console.log('='.repeat(60));

const rootDir = path.resolve(__dirname, '..');
const audioDir = path.join(rootDir, 'public', 'audio');

class AudioHealthChecker {
    check() {
        const issues = [];
        const warnings = [];
        
        // 1. Ստուգել հիմնական դիրեկտորիաները
        this.checkDirectories(audioDir, issues, warnings);
        
        // 2. Ստուգել manifest-ները
        this.checkManifests(audioDir, issues, warnings);
        
        // 3. Ստուգել mapping-ները
        this.checkMappings(rootDir, issues, warnings);
        
        // 4. Ստուգել աուդիո ֆայլերի ամբողջականությունը
        this.checkAudioIntegrity(audioDir, issues, warnings);
        
        // 5. Print results
        this.printResults(issues, warnings);
        
        return { issues, warnings };
    }
    
    checkDirectories(audioDir, issues, warnings) {
        console.log('\n📁 ԴԻՐԵԿՏՈՐԻԱՆԵՐ');
        console.log('-'.repeat(40));
        
        const required = [
            'offline',
            'offline/hy_Ani',
            'offline/en_female',
            'offline/ru_female',
            'offline_dictionary',
            'offline_user_dictionary'
        ];
        
        for (const dir of required) {
            const fullPath = path.join(audioDir, dir);
            if (!fs.existsSync(fullPath)) {
                issues.push(`Բացակայում է դիրեկտորիան: ${dir}`);
                console.log(`  ❌ ${dir}`);
            } else {
                console.log(`  ✅ ${dir}`);
            }
        }
    }
    
    checkManifests(audioDir, issues, warnings) {
        console.log('\n📋 MANIFEST-ՆԵՐ');
        console.log('-'.repeat(40));
        
        const manifests = [
            'offline/manifest_hy_ani.json',
            'offline/manifest_en_female.json',
            'offline/manifest_ru_female.json',
            'offline_dictionary/manifest.json',
            'offline_user_dictionary/user_manifest.json'
        ];
        
        for (const manifest of manifests) {
            const fullPath = path.join(audioDir, manifest);
            if (!fs.existsSync(fullPath)) {
                issues.push(`Բացակայում է manifest-ը: ${manifest}`);
                console.log(`  ❌ ${path.basename(manifest)}`);
            } else {
                try {
                    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    const count = Array.isArray(data) ? data.length : Object.keys(data).length;
                    console.log(`  ✅ ${path.basename(manifest)} (${count} entries)`);
                } catch (e) {
                    issues.push(`Manifest-ը corrupted է: ${manifest}`);
                    console.log(`  ❌ ${path.basename(manifest)} - CORRUPTED`);
                }
            }
        }
    }
    
    checkMappings(rootDir, issues, warnings) {
        console.log('\n🗺️ MAPPING-ՆԵՐ');
        console.log('-'.repeat(40));
        
        const mappingsPath = path.join(rootDir, 'src', 'lib', 'content', 'mappings');
        const mappings = [
            'audio-num-hy-mapping.json',
            'audio-num-en-mapping.json',
            'audio-num-ru-mapping.json'
        ];
        
        for (const mapping of mappings) {
            const fullPath = path.join(mappingsPath, mapping);
            if (!fs.existsSync(fullPath)) {
                issues.push(`Բացակայում է mapping-ը: ${mapping}`);
                console.log(`  ❌ ${mapping}`);
            } else {
                try {
                    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    const count = Object.keys(data).length;
                    console.log(`  ✅ ${mapping} (${count} entries)`);
                } catch (e) {
                    issues.push(`Mapping-ը corrupted է: ${mapping}`);
                    console.log(`  ❌ ${mapping} - CORRUPTED`);
                }
            }
        }
    }
    
    checkAudioIntegrity(audioDir, issues, warnings) {
        console.log('\n🎧 ԱՈՒԴԻՈ ՖԱՅԼԵՐ');
        console.log('-'.repeat(40));
        
        const audioDirs = [
            { path: 'offline/hy_Ani', name: 'Հայերեն' },
            { path: 'offline/en_female', name: 'Անգլերեն' },
            { path: 'offline/ru_female', name: 'Ռուսերեն' }
        ];
        
        for (const audio of audioDirs) {
            const fullPath = path.join(audioDir, audio.path);
            if (fs.existsSync(fullPath)) {
                const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.mp3'));
                const corrupted = files.filter(f => {
                    const stats = fs.statSync(path.join(fullPath, f));
                    return stats.size < 2048; // < 2KB
                });
                
                console.log(`  ${audio.name}: ${files.length} ֆայլ, ${corrupted.length} corrupted`);
                
                if (corrupted.length > 0) {
                    warnings.push(`${audio.name}: ${corrupted.length} corrupted files`);
                }
            } else {
                issues.push(`Բացակայում է աուդիո դիրեկտորիան: ${audio.path}`);
                console.log(`  ❌ ${audio.name} - ԲԱՑԱԿԱՅՈՒՄ Է`);
            }
        }
    }
    
    printResults(issues, warnings) {
        console.log('\n' + '='.repeat(60));
        console.log('📊 ԱՌՈՂՋՈՒԹՅԱՆ ԱՐԴՅՈՒՆՔ');
        console.log('='.repeat(60));
        
        if (issues.length === 0 && warnings.length === 0) {
            console.log('✅ ԱՄԵՆ ԻՆՉ ԿԱՏԱՐՅԱԼ Է');
        } else {
            if (issues.length > 0) {
                console.log(`\n❌ ԽՆԴԻՐՆԵՐ (${issues.length}):`);
                issues.forEach((issue, i) => {
                    console.log(`  ${i+1}. ${issue}`);
                });
            }
            
            if (warnings.length > 0) {
                console.log(`\n⚠️ ԶԳՈՒՇԱՑՈՒՄՆԵՐ (${warnings.length}):`);
                warnings.forEach((warning, i) => {
                    console.log(`  ${i+1}. ${warning}`);
                });
            }
        }
        console.log('='.repeat(60));
    }
}

const checker = new AudioHealthChecker();
checker.check();