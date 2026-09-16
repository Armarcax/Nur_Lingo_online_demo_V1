// src/lib/offline/OfflineAudioManager.ts
// ✅ ԹԱՐՄԱՑՎԱԾ - ՈՒՂՂԱԿԻ ՖԱՅԼԵՐԻ ՀԵՏ ԱՇԽԱՏԵԼՈՒ ՀԱՄԱՐ

"use client";

// ─── TYPES ────────────────────────────────────────────────────────────

interface Manifest {
  version: string;
  generatedAt: string;
  voice: string;
  voiceLabel: string;
  totalFiles: number;
  mapping: Record<string, string>;
  files?: string[];
}

// ─── IMPORT MAPPINGS FROM mappings/ FOLDER ─────────────────────────

// ✅ IMPORT from mappings folder
import hyMapping from '@/lib/content/mappings/audio-num-hy-mapping.json';
import enMapping from '@/lib/content/mappings/audio-num-en-mapping.json';
import ruMapping from '@/lib/content/mappings/audio-num-ru-mapping.json';
import exerciseToAudio from '@/lib/content/exercise-to-audio.json';
import { useI18n } from "@/hooks/useI18n";

// ─── MAIN CLASS ────────────────────────────────────────────────────

export class OfflineAudioManager {
  private static instance: OfflineAudioManager;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private lessonManifests: Record<string, Manifest> = {};
  private dictionaryManifest: Manifest | null = null;
  private userManifest: Manifest | null = null;
  private combinedMapping: Record<string, string> = {};
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private volume = 1.0;
  private isMuted = false;
  private currentAudioKey: string | null = null;
  private currentLanguage: string | null = null;

  // ✅ Ճիշտ ուղիները աուդիո ֆայլերի համար
  private readonly AUDIO_PATHS: Record<string, string> = {
    hy: '/audio/offline/hy_Ani/',
    en: '/audio/offline/en_female/',
    ru: '/audio/offline/ru_female/',
  };

  // ─── SINGLETON ─────────────────────────────────────────────────────

  static getInstance(): OfflineAudioManager {
    if (!OfflineAudioManager.instance) {
      OfflineAudioManager.instance = new OfflineAudioManager();
    }
    return OfflineAudioManager.instance;
  }

  // ─── INIT ──────────────────────────────────────────────────────────

  async init(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = this._init();
    return this.initPromise;
  }

  private async _init(): Promise<void> {
    try {
      console.log('🎵 Initializing OfflineAudioManager...');

      // ============================================================
      // 1. ✅ LOAD FROM exercise-to-audio.json
      // ============================================================
      let totalMapped = 0;

      // Register all exercise-to-audio mappings
      for (const [exerciseId, audioId] of Object.entries(exerciseToAudio)) {
        if (exerciseId && audioId) {
          this.combinedMapping[exerciseId] = audioId;
          // Also register with language prefix
          for (const lang of ['hy', 'en', 'ru']) {
            this.combinedMapping[`${lang}_${exerciseId}`] = audioId;
            // With answer suffix
            this.combinedMapping[`${exerciseId}_answer`] = audioId;
            this.combinedMapping[`${lang}_${exerciseId}_answer`] = audioId;
          }
          totalMapped++;
        }
      }
      console.log(`✅ Registered ${totalMapped} exercise-to-audio mappings`);

      // ============================================================
      // 2. ✅ LOAD FROM MAPPINGS FOLDER (imported)
      // ============================================================
      const extractMapping = (data: any): Record<string, string> => {
        if (!data) return {};
        
        // If data has 'mapping' field with entries
        if (data.mapping && typeof data.mapping === 'object' && Object.keys(data.mapping).length > 0) {
          return data.mapping;
        }
        
        // If data has 'files' array, convert to mapping
        if (data.files && Array.isArray(data.files)) {
          const result: Record<string, string> = {};
          for (const file of data.files) {
            if (typeof file === 'string' && file.endsWith('.mp3')) {
              const id = file.replace('.mp3', '');
              result[id] = id;
            }
          }
          return result;
        }
        
        // If data itself is a mapping object
        if (typeof data === 'object' && !data.version && !data.generatedAt) {
          return data;
        }
        
        return {};
      };

      // Load HY mapping
      const hyData = extractMapping(hyMapping);
      this.combinedMapping = { ...this.combinedMapping, ...hyData };
      console.log(`✅ HY mapping: ${Object.keys(hyData).length} entries`);

      // Load EN mapping
      const enData = extractMapping(enMapping);
      this.combinedMapping = { ...this.combinedMapping, ...enData };
      console.log(`✅ EN mapping: ${Object.keys(enData).length} entries`);

      // Load RU mapping
      const ruData = extractMapping(ruMapping);
      this.combinedMapping = { ...this.combinedMapping, ...ruData };
      console.log(`✅ RU mapping: ${Object.keys(ruData).length} entries`);

      // ============================================================
      // 3. ✅ TRY TO LOAD LARGE MANIFESTS (if they exist)
      // ============================================================
      const manifestPaths = [
        { lang: 'hy', path: '/audio/offline/manifest_hy_ani.json' },
        { lang: 'en', path: '/audio/offline/manifest_en_female.json' },
        { lang: 'ru', path: '/audio/offline/manifest_ru_female.json' },
      ];

      for (const { lang, path } of manifestPaths) {
        try {
          const response = await fetch(path, {
            headers: { 'Cache-Control': 'no-cache' }
          });
          if (response.ok) {
            const data = await response.json() as Manifest;
            if (data.mapping) {
              const filteredMapping = this.filterManifestMapping(data.mapping);
              this.lessonManifests[lang] = { ...data, mapping: filteredMapping };
              this.combinedMapping = { ...this.combinedMapping, ...filteredMapping };
              console.log(`✅ Manifest (${lang}): ${Object.keys(filteredMapping).length} entries`);
            }
          }
        } catch (e) {
          // Silent fail - manifests are optional
        }
      }

      // ============================================================
      // 4. ✅ TRY TO LOAD DICTIONARY MANIFEST (if exists)
      // ============================================================
      try {
        const dictResponse = await fetch('/audio/offline_dictionary/manifest_dictionary.json', {
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (dictResponse.ok) {
          const data = await dictResponse.json() as Manifest;
          if (data && data.mapping) {
            const filteredMapping = this.filterManifestMapping(data.mapping);
            this.dictionaryManifest = { ...data, mapping: filteredMapping };
            this.combinedMapping = { ...this.combinedMapping, ...filteredMapping };
            console.log(`✅ Dictionary manifest: ${Object.keys(filteredMapping).length} entries`);
          }
        }
      } catch (e) {
        // Silent fail
      }

      // ============================================================
      // 5. ✅ TRY TO LOAD USER MANIFEST (if exists)
      // ============================================================
      try {
        const userResponse = await fetch('/audio/offline_user_dictionary/user_manifest.json', {
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (userResponse.ok) {
          const data = await userResponse.json() as Manifest;
          if (data && data.mapping) {
            const filteredMapping = this.filterManifestMapping(data.mapping);
            this.userManifest = { ...data, mapping: filteredMapping };
            this.combinedMapping = { ...this.combinedMapping, ...filteredMapping };
            console.log(`✅ User manifest: ${Object.keys(filteredMapping).length} entries`);
          }
        }
      } catch (e) {
        // Silent fail
      }

      this.initialized = true;
      
      // ✅ Log stats
      const totalKeys = Object.keys(this.combinedMapping).length;
      console.log(`✅ OfflineAudioManager ready: ${totalKeys} total entries`);
      
      // Show sample keys for debugging
      const sampleKeys = Object.keys(this.combinedMapping).slice(0, 10);
      console.log('📋 Sample keys:', sampleKeys);
      
      // Show some specific keys we care about
      const testKeys = ['w1_l1_e0', 'greet_hello', 'hello', '000001'];
      for (const key of testKeys) {
        if (this.combinedMapping[key]) {
          console.log(`✅ Found key: "${key}" → "${this.combinedMapping[key]}"`);
        } else {
          console.log(`❌ Key not found: "${key}"`);
        }
      }
      
    } catch (error) {
      console.error('❌ OfflineAudioManager init failed:', error);
      this.initialized = true;
    } finally {
      this.initPromise = null;
    }
  }

  // ─── FILTER MANIFEST MAPPING ─────────────────────────────────────

  private filterManifestMapping(mapping: Record<string, string>): Record<string, string> {
    const filtered: Record<string, string> = {};
    if (!mapping || typeof mapping !== 'object') return filtered;
    
    const metaKeys = new Set([
      'entries', 'totalEntries', 'lastUpdated', 'source',
      'version', 'generatedAt', 'voice', 'languages',
      'voiceLabel', 'totalFiles', 'mapping', 'files',
      'description', 'author', 'createdAt', 'updatedAt',
      'schema', 'timestamp', 'count', 'metadata'
    ]);

    for (const [key, value] of Object.entries(mapping)) {
      if (!metaKeys.has(key) && typeof value === 'string') {
        filtered[key] = value;
      }
    }
    return filtered;
  }

  // ─── GET AUDIO URL ─────────────────────────────────────────────

  getAudioUrl(audioKey: string, language: string = 'hy'): string | null {
    // ✅ Try to find the audio ID
    let audioId = this.combinedMapping[audioKey];
    
    // If not found, try without language prefix
    if (!audioId && audioKey.startsWith(`${language}_`)) {
      const withoutPrefix = audioKey.replace(`${language}_`, '');
      audioId = this.combinedMapping[withoutPrefix];
    }
    
    // If still not found, try with language prefix
    if (!audioId) {
      audioId = this.combinedMapping[`${language}_${audioKey}`];
    }
    
    // If still not found, use the key itself as ID
    if (!audioId) {
      audioId = audioKey;
    }

    // ✅ Build URL using the correct base path
    const basePath = this.AUDIO_PATHS[language] || this.AUDIO_PATHS.hy;
    
    // Try different filename variations
    const possibleNames = [
      audioId,
      audioId.padStart(6, '0'),
      audioId.replace(/^hy_/, '').replace(/^en_/, '').replace(/^ru_/, ''),
      audioKey.replace(/^hy_/, '').replace(/^en_/, '').replace(/^ru_/, ''),
    ];
    
    // Remove duplicates
    const uniqueNames = [...new Set(possibleNames)];
    
    // Return the first possible URL
    for (const name of uniqueNames) {
      if (name) {
        const url = `${basePath}${name}.mp3`;
        console.log(`🔊 Generated URL: ${url}`);
        return url;
      }
    }
    
    return null;
  }

  // ─── CHECK IF AUDIO EXISTS ─────────────────────────────────────

  hasAudioKey(audioKey: string, language: string = 'hy'): boolean {
    // Check if key exists in mapping
    if (this.combinedMapping[audioKey]) return true;
    if (this.combinedMapping[`${language}_${audioKey}`]) return true;
    
    // Check if it's a direct audio ID
    const audioId = this.combinedMapping[audioKey] || audioKey;
    const url = this.getAudioUrl(audioId, language);
    if (url) return true;
    
    return false;
  }

  // ─── PLAY AUDIO ─────────────────────────────────────────────────

  async play(audioKey: string, language: string = 'hy'): Promise<void> {
    console.log(`🔊 Play requested: "${audioKey}" (${language})`);

    // Try to find the audio
    let audioId = this.combinedMapping[audioKey];
    
    if (!audioId) {
      // Try with language prefix
      audioId = this.combinedMapping[`${language}_${audioKey}`];
    }
    
    if (!audioId) {
      // Try without prefix
      const withoutPrefix = audioKey.replace(/^(hy|en|ru)_/, '');
      audioId = this.combinedMapping[withoutPrefix];
    }
    
    // If still not found, use the key as ID
    if (!audioId) {
      audioId = audioKey;
    }

    // Get the URL
    const url = this.getAudioUrl(audioId, language);
    
    if (!url) {
      console.error(`❌ No URL found for: "${audioKey}" (${language})`);
      throw new Error(`Audio not found: ${audioKey}`);
    }

    console.log(`🔊 Playing: ${url}`);

    // Check if file exists
    try {
      const headResponse = await fetch(url, { method: 'HEAD' });
      if (!headResponse.ok) {
        console.warn(`⚠️ Audio file may not exist: ${url} (${headResponse.status})`);
        // Try fallback - try other languages
        for (const fallbackLang of ['hy', 'en', 'ru']) {
          if (fallbackLang !== language) {
            const fallbackUrl = this.getAudioUrl(audioId, fallbackLang);
            if (fallbackUrl) {
              console.log(`🔄 Trying fallback: ${fallbackUrl}`);
              const fallbackHead = await fetch(fallbackUrl, { method: 'HEAD' });
              if (fallbackHead.ok) {
                return this.playAudioElement(fallbackUrl);
              }
            }
          }
        }
        throw new Error(`Audio file not found: ${url}`);
      }
    } catch (e) {
      console.warn(`⚠️ HEAD check failed:`, e);
    }

    return this.playAudioElement(url);
  }

  private playAudioElement(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audio.volume = this.isMuted ? 0 : this.volume;
      audio.preload = 'auto';
      
      audio.oncanplaythrough = () => {
        console.log(`✅ Audio loaded: ${url}`);
      };
      
      audio.onended = () => {
        console.log(`✅ Audio finished: ${url}`);
        resolve();
      };
      
      audio.onerror = (e) => {
        console.error(`❌ Audio error: ${url}`, e);
        reject(new Error(`Failed to play audio: ${url}`));
      };
      
      audio.play().catch((e) => {
        console.error(`❌ Play failed: ${url}`, e);
        reject(e);
      });
    });
  }

  // ─── STOP ────────────────────────────────────────────────────────

  stop(): void {
    for (const [key, audio] of this.audioCache) {
      audio.pause();
      audio.currentTime = 0;
    }
    this.audioCache.clear();
    this.currentAudioKey = null;
    this.currentLanguage = null;
  }

  isPlaying(): boolean {
    for (const [key, audio] of this.audioCache) {
      if (!audio.paused) return true;
    }
    return false;
  }

  pause(audioKey?: string, language?: string): void {
    if (audioKey && language) {
      const cacheKey = `${language}:${audioKey}`;
      const audio = this.audioCache.get(cacheKey);
      if (audio) {
        audio.pause();
      }
    } else {
      // Pause all
      for (const [key, audio] of this.audioCache) {
        audio.pause();
      }
    }
  }

  pauseAll(): void {
    for (const [key, audio] of this.audioCache) {
      audio.pause();
    }
  }

  clearCache(): void {
    for (const [key, audio] of this.audioCache) {
      audio.pause();
      audio.src = '';
    }
    this.audioCache.clear();
  }

  getCacheSize(): number {
    return this.audioCache.size;
  }

  isAvailable(): boolean {
    return this.initialized && Object.keys(this.combinedMapping).length > 0;
  }

  // ─── VOLUME CONTROL ─────────────────────────────────────────────

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    // Update all cached audio elements
    for (const [key, audio] of this.audioCache) {
      audio.volume = this.isMuted ? 0 : this.volume;
    }
  }

  getVolume(): number {
    return this.volume;
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    // Update all cached audio elements
    for (const [key, audio] of this.audioCache) {
      audio.volume = muted ? 0 : this.volume;
    }
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  // ─── STATS ──────────────────────────────────────────────────────

  getStats(): { 
    totalEntries: number; 
    lessonEntries: number; 
    dictionaryEntries: number;
    userEntries: number;
  } {
    const total = Object.keys(this.combinedMapping || {}).length;
    
    const dictTotal = this.dictionaryManifest?.mapping 
      ? Object.keys(this.dictionaryManifest.mapping).length 
      : 0;
    const userTotal = this.userManifest?.mapping 
      ? Object.keys(this.userManifest.mapping).length 
      : 0;
    const lessonTotal = total - dictTotal - userTotal;
    
    return {
      totalEntries: total,
      lessonEntries: lessonTotal,
      dictionaryEntries: dictTotal,
      userEntries: userTotal,
    };
  }

  getCombinedMapping(): Record<string, string> {
    return this.combinedMapping;
  }

  getLessonManifests(): Record<string, Manifest> {
    return this.lessonManifests;
  }

  getDictionaryManifest(): Manifest | null {
    return this.dictionaryManifest;
  }

  getUserManifest(): Manifest | null {
    return this.userManifest;
  }

  // ─── DISPOSE ────────────────────────────────────────────────────

  dispose(): void {
    this.clearCache();
    this.lessonManifests = {};
    this.dictionaryManifest = null;
    this.userManifest = null;
    this.combinedMapping = {};
    this.initialized = false;
    this.volume = 1.0;
    this.isMuted = false;
    this.currentAudioKey = null;
    this.currentLanguage = null;
  }
}

// ─── EXPORT ──────────────────────────────────────────────────────────

export const offlineAudioManager = OfflineAudioManager.getInstance();

// ✅ Initialize on import (SSR safe)
if (typeof window !== 'undefined') {
  offlineAudioManager.init().catch(() => {
    console.warn('⚠️ OfflineAudioManager init failed, will retry on demand');
  });
}