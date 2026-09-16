// src/lib/offline/OfflineAudioSystem.test.ts
// Օֆլայն աուդիոհամակարգի ամբողջական թեստ

import { OfflineAudioEngine } from './OfflineAudioEngine';
import { AudioCache } from '../audio/AudioCache';
import { AudioManager } from '../audio/AudioManager';

class OfflineAudioTest {
    private engine: OfflineAudioEngine;
    private cache: AudioCache;
    private manager: AudioManager;
    
    constructor() {
        this.engine = new OfflineAudioEngine();
        this.cache = new AudioCache();
        this.manager = new AudioManager();
    }
    
    async testAllAudioSources() {
        console.log('🎵 ՕՖԼԱՅՆ ԱՈՒԴԻՈՀԱՄԱԿԱՐԳԻ ԹԵՍՏ');
        console.log('='.repeat(50));
        
        // 1. Թեստ 1: Բոլոր աուդիո ֆայլերի առկայություն
        await this.testAudioFilesPresence();
        
        // 2. Թեստ 2: Օֆլայն նվագարկում
        await this.testOfflinePlayback();
        
        // 3. Թեստ 3: Cache-ի աշխատանք
        await this.testCacheSystem();
        
        // 4. Թեստ 4: Բոլոր լեզուների աջակցություն
        await this.testAllLanguages();
        
        // 5. Թեստ 5: User dictionary-ի աուդիո
        await this.testUserDictionaryAudio();
    }
    
    private async testAudioFilesPresence() {
        console.log('\n📁 ԹԵՍՏ 1: Աուդիո ֆայլերի առկայություն');
        
        const sources = [
            { path: 'offline/hy_Ani', expected: 25099, name: 'Հայերեն' },
            { path: 'offline/en_female', expected: 25099, name: 'Անգլերեն' },
            { path: 'offline/ru_female', expected: 20627, name: 'Ռուսերեն' },
            { path: 'offline_dictionary/hy', expected: 1152, name: 'Բառարան Հայ' },
            { path: 'offline_dictionary/en', expected: 1152, name: 'Բառարան Անգլ' },
            { path: 'offline_dictionary/ru', expected: 1152, name: 'Բառարան Ռուս' },
        ];
        
        for (const source of sources) {
            const count = await this.engine.getFileCount(source.path);
            const status = count === source.expected ? '✅' : '❌';
            console.log(`  ${status} ${source.name}: ${count}/${source.expected} ֆայլ`);
        }
    }
    
    private async testOfflinePlayback() {
        console.log('\n🎧 ԹԵՍՏ 2: Օֆլայն նվագարկում');
        
        const testCases = [
            { id: '000001', language: 'hy', expected: true },
            { id: '000001', language: 'en', expected: true },
            { id: '000001', language: 'ru', expected: true },
            { id: '999999', language: 'hy', expected: false },
        ];
        
        for (const test of testCases) {
            const result = await this.engine.playAudio(test.id, test.language);
            const status = result === test.expected ? '✅' : '❌';
            console.log(`  ${status} ID: ${test.id}, Լեզու: ${test.language} → ${result ? 'Հաջող' : 'Ձախողում'}`);
        }
    }
    
    private async testCacheSystem() {
        console.log('\n💾 ԹԵՍՏ 3: Cache համակարգ');
        
        // Փորձել cache-ավորել աուդիո
        const audioId = '000001';
        const language = 'hy';
        
        const cached = await this.cache.getAudio(audioId, language);
        if (cached) {
            console.log(`  ✅ Cache-ում կա: ${audioId} (${language})`);
        } else {
            console.log(`  📥 Cache չկա, բեռնում եմ...`);
            await this.cache.cacheAudio(audioId, language);
            const nowCached = await this.cache.getAudio(audioId, language);
            console.log(`  ✅ Cache-ավորվեց: ${nowCached ? 'Հաջող' : 'Ձախողում'}`);
        }
    }
    
    private async testAllLanguages() {
        console.log('\n🌍 ԹԵՍՏ 4: Բոլոր լեզուներ');
        
        const languages = ['hy', 'en', 'ru'];
        const testAudioId = '000001';
        
        for (const lang of languages) {
            try {
                const result = await this.engine.playAudio(testAudioId, lang);
                console.log(`  ✅ ${lang.toUpperCase()}: Աշխատում է`);
            } catch (error) {
                console.log(`  ❌ ${lang.toUpperCase()}: Չի աշխատում - ${error}`);
            }
        }
    }
    
    private async testUserDictionaryAudio() {
        console.log('\n👤 ԹԵՍՏ 5: User dictionary աուդիո');
        
        const userWords = ['apple', 'house', 'car'];
        const languages = ['hy', 'en', 'ru'];
        
        for (const word of userWords) {
            for (const lang of languages) {
                const audioPath = `offline_user_dictionary/${lang}_user/${word}.mp3`;
                const exists = await this.engine.fileExists(audioPath);
                const status = exists ? '✅' : '❌';
                console.log(`  ${status} ${word} (${lang}): ${exists ? 'Գոյություն ունի' : 'Բացակայում է'}`);
            }
        }
    }
}

// Գործարկել թեստը
const test = new OfflineAudioTest();
test.testAllAudioSources();