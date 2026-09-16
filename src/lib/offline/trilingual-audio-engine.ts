// src/lib/offline/trilingual-audio-engine.ts

import { offlineLessonEngine } from './OfflineLessonEngine';
import { offlineAudioManager } from './OfflineAudioManager';
import { resolveOfflineAudio } from './offline-audio-resolver';

// ─── TYPES ────────────────────────────────────────────────────────────

export type Language = 'hy' | 'en' | 'ru';
export type Gender = 'male' | 'female';

export interface AudioEntry {
  id: string;
  text: string;
  language: Language;
  translations: {
    hy?: string;
    en?: string;
    ru?: string;
  };
  audioFiles: {
    hy?: {
      male?: string;
      female?: string;
    };
    en?: {
      male?: string;
      female?: string;
    };
    ru?: {
      male?: string;
      female?: string;
    };
  };
  type: 'vocabulary' | 'phrase' | 'exercise' | 'dialogue' | 'title';
  context?: string;
  duration?: number;
}

export interface TrilingualManifest {
  version: string;
  generatedAt: string;
  totalEntries: number;
  languages: Language[];
  genders: Gender[];
  entries: Record<string, AudioEntry>;
}

export interface AudioGenerationRequest {
  text: string;
  language: Language;
  gender: Gender;
  type: string;
  context?: string;
}

// ─── MAIN ENGINE ──────────────────────────────────────────────────────

class TrilingualAudioEngine {
  private static instance: TrilingualAudioEngine;
  private audioCache: Map<string, AudioEntry> = new Map();
  private audioContext: AudioContext | null = null;
  private initialized = false;
  private manifest: TrilingualManifest | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying = false;

  private constructor() {}

  static getInstance(): TrilingualAudioEngine {
    if (!TrilingualAudioEngine.instance) {
      TrilingualAudioEngine.instance = new TrilingualAudioEngine();
    }
    return TrilingualAudioEngine.instance;
  }

  // ─── INIT ───────────────────────────────────────────────────────────

  async init(forceReload = false): Promise<void> {
    if (this.initialized && !forceReload) return;

    try {
      await offlineLessonEngine.init();
      await offlineAudioManager.init();

      // ✅ Get lesson manifests - use getLessonManifests (plural)
      const lessonManifest = (offlineLessonEngine as any).getLessonManifests?.();
      // ✅ Get dictionary manifest
      const dictionaryManifest = (offlineLessonEngine as any).getDictionaryManifest?.();
      // ✅ Get user manifest
      const userManifest = (offlineLessonEngine as any).getUserManifest?.();

      this.manifest = {
        version: '2.0',
        generatedAt: new Date().toISOString(),
        totalEntries: 0,
        languages: ['hy', 'en', 'ru'],
        genders: ['male', 'female'],
        entries: {},
      };

      // ✅ Load lesson entries
      if (lessonManifest && lessonManifest.mapping) {
        this.loadManifestEntries(lessonManifest, 'lesson');
      }

      // ✅ Load dictionary entries
      if (dictionaryManifest && dictionaryManifest.mapping) {
        this.loadManifestEntries(dictionaryManifest, 'dictionary');
      }

      // ✅ Load user entries
      if (userManifest && userManifest.mapping) {
        this.loadManifestEntries(userManifest, 'user');
      }

      // ✅ Also try to load from offlineAudioManager's combined mapping
      const combinedMapping = offlineAudioManager.getCombinedMapping?.() || {};
      if (combinedMapping) {
        for (const [id, audioId] of Object.entries(combinedMapping)) {
          if (!this.audioCache.has(id)) {
            const audioEntry: AudioEntry = {
              id: id,
              text: id,
              language: 'hy',
              translations: { hy: id, en: id, ru: id },
              audioFiles: {},
              type: 'vocabulary',
              duration: 0,
            };
            
            const languages: Language[] = ['hy', 'en', 'ru'];
            for (const lang of languages) {
              const path = this.getAudioPath(id, lang, 'female');
              if (path) {
                if (!audioEntry.audioFiles[lang]) audioEntry.audioFiles[lang] = {};
                audioEntry.audioFiles[lang]!.female = path;
              }
            }
            
            this.audioCache.set(id, audioEntry);
          }
        }
      }

      this.manifest.totalEntries = this.audioCache.size;

      if (typeof window !== 'undefined') {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      this.initialized = true;
      console.log(`✅ TrilingualAudioEngine initialized: ${this.audioCache.size} entries`);
    } catch (error) {
      console.error('❌ Failed to initialize TrilingualAudioEngine:', error);
      throw error;
    }
  }

  // ─── LOAD MANIFEST ENTRIES ────────────────────────────────────────

  private loadManifestEntries(manifest: any, source: string): void {
    if (!manifest || !manifest.mapping) return;

    let count = 0;
    for (const [id, audioId] of Object.entries(manifest.mapping)) {
      if (!this.audioCache.has(id)) {
        const audioEntry: AudioEntry = {
          id: id,
          text: id,
          language: 'hy',
          translations: { hy: id, en: id, ru: id },
          audioFiles: {},
          type: 'vocabulary',
          duration: 0,
        };
        
        const languages: Language[] = ['hy', 'en', 'ru'];
        for (const lang of languages) {
          const path = this.getAudioPath(id, lang, 'female');
          if (path) {
            if (!audioEntry.audioFiles[lang]) audioEntry.audioFiles[lang] = {};
            audioEntry.audioFiles[lang]!.female = path;
          }
        }
        
        this.audioCache.set(id, audioEntry);
        count++;
      }
    }
    
    console.log(`✅ Loaded ${count} entries from ${source} manifest`);
  }

  // ─── AUDIO PLAYBACK ────────────────────────────────────────────────

  getAudioPath(entryId: string, language: Language, gender: Gender): string | null {
    return resolveOfflineAudio(entryId, language)?.url || null;
  }

  hasAudio(entryId: string, language: Language, gender: Gender): boolean {
    return this.getAudioPath(entryId, language, gender) !== null;
  }

  async playAudio(entryId: string, language: Language, gender: Gender): Promise<boolean> {
    if (this.isPlaying) {
      this.stopAudio();
    }

    const path = this.getAudioPath(entryId, language, gender);
    if (!path) {
      console.warn(`⚠️ No audio found for ${entryId} (${language}/${gender})`);
      return false;
    }

    try {
      this.isPlaying = true;
      
      return new Promise((resolve) => {
        const audio = new Audio(path);
        audio.preload = 'auto';
        
        audio.onended = () => {
          this.isPlaying = false;
          this.currentAudio = null;
          resolve(true);
        };
        
        audio.onerror = () => {
          console.error(`❌ Audio playback error: ${entryId}`);
          this.isPlaying = false;
          this.currentAudio = null;
          resolve(false);
        };
        
        audio.play().catch(() => {
          this.isPlaying = false;
          this.currentAudio = null;
          resolve(false);
        });
        
        this.currentAudio = audio;
      });
    } catch (error) {
      console.error('❌ Failed to play audio:', error);
      this.isPlaying = false;
      this.currentAudio = null;
      return false;
    }
  }

  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isPlaying = false;
  }

  isPlayingAudio(): boolean {
    return this.isPlaying;
  }

  // ─── TRILINGUAL PLAYBACK ──────────────────────────────────────────

  async playTrilingualAudio(entryId: string, gender: Gender = 'male'): Promise<void> {
    const entry = this.audioCache.get(entryId);
    if (!entry) {
      console.warn(`⚠️ Audio entry not found: ${entryId}`);
      return;
    }

    const languages: Language[] = ['hy', 'en', 'ru'];
    for (const lang of languages) {
      const path = this.getAudioPath(entryId, lang, gender);
      if (path) {
        await this.playAudio(entryId, lang, gender);
        await this.delay(400);
      }
    }
  }

  // ─── ENTRY MANAGEMENT ─────────────────────────────────────────────

  getAudioEntry(id: string): AudioEntry | undefined {
    return this.audioCache.get(id);
  }

  searchAudio(query: string): AudioEntry[] {
    const results: AudioEntry[] = [];
    const q = query.toLowerCase();
    for (const entry of this.audioCache.values()) {
      if (entry.text.toLowerCase().includes(q)) {
        results.push(entry);
        continue;
      }
      for (const [, translation] of Object.entries(entry.translations)) {
        if (translation && translation.toLowerCase().includes(q)) {
          results.push(entry);
          break;
        }
      }
    }
    return results;
  }

  getAllEntries(): AudioEntry[] {
    return Array.from(this.audioCache.values());
  }

  // ─── GENERATION ────────────────────────────────────────────────────

  async generateTrilingualAudio(
    text: string,
    translations: { hy?: string; en?: string; ru?: string },
    gender: Gender = 'male'
  ): Promise<AudioEntry> {
    const id = this.generateId(text, 'hy');
    
    if (this.audioCache.has(id)) {
      return this.audioCache.get(id)!;
    }

    const audioFiles: Record<Language, Record<Gender, string>> = {} as any;
    const languages: Language[] = ['hy', 'en', 'ru'];

    for (const lang of languages) {
      const word = translations[lang] || text;
      if (word) {
        const path = this.getAudioPath(id, lang, gender);
        if (path) {
          if (!audioFiles[lang]) audioFiles[lang] = {} as any;
          audioFiles[lang][gender] = path;
        } else {
          const generated = await this.generateTTS(word, lang, gender);
          if (!audioFiles[lang]) audioFiles[lang] = {} as any;
          audioFiles[lang][gender] = generated;
        }
      }
    }

    const entry: AudioEntry = {
      id,
      text,
      language: 'hy',
      translations: {
        hy: translations.hy || text,
        en: translations.en || text,
        ru: translations.ru || text,
      },
      audioFiles,
      type: 'vocabulary',
    };

    this.audioCache.set(id, entry);
    if (this.manifest) {
      this.manifest.totalEntries = this.audioCache.size;
    }
    return entry;
  }

  // ─── TTS (PLACEHOLDER) ────────────────────────────────────────────

  private async generateTTS(text: string, language: Language, gender: Gender): Promise<string> {
    return `/audio/offline/${language}_${gender}/${this.sanitizeFilename(text)}.mp3`;
  }

  // ─── UTILITIES ─────────────────────────────────────────────────────

  private generateId(text: string, language: Language): string {
    return `${language}_${this.sanitizeFilename(text)}_${Date.now().toString().slice(-4)}`;
  }

  private sanitizeFilename(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-zա-ֆա-ֆа-яa-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 50);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ─── STATS ─────────────────────────────────────────────────────────

  isAvailable(): boolean {
    return this.initialized && this.audioCache.size > 0;
  }

  getStats(): {
    totalEntries: number;
    languages: Language[];
    genders: Gender[];
    lastGenerated: string;
  } {
    return {
      totalEntries: this.audioCache.size,
      languages: ['hy', 'en', 'ru'],
      genders: ['male', 'female'],
      lastGenerated: this.manifest?.generatedAt || new Date().toISOString(),
    };
  }

  getCache(): Map<string, AudioEntry> {
    return this.audioCache;
  }
}

// ─── EXPORT ──────────────────────────────────────────────────────────

export const trilingualAudioEngine = TrilingualAudioEngine.getInstance();