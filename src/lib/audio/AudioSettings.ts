// src/lib/audio/AudioSettings.ts
// NUR Lingo Audio Engine — User Settings Management with Advanced Features

import {
  AudioSettings,
  DEFAULT_AUDIO_SETTINGS,
  AudioProviderType,
  LanguageCode,
} from "./AudioTypes";

const STORAGE_KEY = "nurlingo_audio_settings";
const STORAGE_VERSION = 2;

type SettingsChangeHandler = (settings: AudioSettings, previous?: AudioSettings) => void;

// ─── SETTINGS MANAGER ─────────────────────────────────────────────────

/**
 * Manages user audio preferences with localStorage persistence
 * Supports versioning, validation, and schema migration
 */
class AudioSettingsManager {
  private settings: AudioSettings;
  private previousSettings: AudioSettings | null = null;
  private handlers: Set<SettingsChangeHandler> = new Set();
  private isLoaded = false;

  constructor() {
    this.settings = this.load();
    this.isLoaded = true;
  }

  // ─── LOADING & PERSISTENCE ─────────────────────────────────────────

  /**
   * Load settings from localStorage with migration
   */
  private load(): AudioSettings {
    if (typeof window === "undefined") {
      return { ...DEFAULT_AUDIO_SETTINGS };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const version = parsed._version || 1;

        // Migrate from old versions
        let migrated = parsed;
        if (version < STORAGE_VERSION) {
          migrated = this.migrate(parsed, version);
        }

        // Validate and merge with defaults
        return this.validate({ ...DEFAULT_AUDIO_SETTINGS, ...migrated });
      }
    } catch {
      // Invalid stored settings
    }

    return { ...DEFAULT_AUDIO_SETTINGS };
  }

  /**
   * Migrate settings from older versions
   */
  private migrate(data: any, fromVersion: number): any {
    let migrated = { ...data };

    // Version 1 → 2: Added pitch, cacheEnabled, preloadCount
    if (fromVersion < 2) {
      if (migrated.pitch === undefined) migrated.pitch = 1.0;
      if (migrated.cacheEnabled === undefined) migrated.cacheEnabled = true;
      if (migrated.preloadCount === undefined) migrated.preloadCount = 5;
    }

    migrated._version = STORAGE_VERSION;
    return migrated;
  }

  /**
   * Validate and sanitize settings
   */
  private validate(settings: any): AudioSettings {
    const valid: AudioSettings = { ...DEFAULT_AUDIO_SETTINGS };

    // Volume: 0-1
    if (typeof settings.volume === "number" && !isNaN(settings.volume)) {
      valid.volume = Math.max(0, Math.min(1, settings.volume));
    }

    // Rate: 0.5-2.0
    if (typeof settings.rate === "number" && !isNaN(settings.rate)) {
      valid.rate = Math.max(0.5, Math.min(2, settings.rate));
    }

    // Pitch: 0.5-2.0
    if (typeof settings.pitch === "number" && !isNaN(settings.pitch)) {
      valid.pitch = Math.max(0.5, Math.min(2, settings.pitch));
    }

    // AutoPlay: boolean
    if (typeof settings.autoPlay === "boolean") {
      valid.autoPlay = settings.autoPlay;
    }

    // PreferredTTS: enum
    if (settings.preferredTTS && Object.values(AudioProviderType).includes(settings.preferredTTS)) {
      valid.preferredTTS = settings.preferredTTS;
    }

    // FallbackChain: array of valid providers
    if (Array.isArray(settings.fallbackChain) && settings.fallbackChain.length > 0) {
      const validChain = settings.fallbackChain.filter((p: any) =>
        Object.values(AudioProviderType).includes(p)
      );
      if (validChain.length > 0) {
        valid.fallbackChain = validChain;
      }
    }

    // VoicePreferences: object
    if (typeof settings.voicePreferences === "object" && settings.voicePreferences !== null) {
      // ✅ FIXED: Create a properly typed Record
      const typedVoicePrefs: Record<LanguageCode, string> = {} as Record<LanguageCode, string>;
      for (const key of Object.keys(settings.voicePreferences)) {
        if (key === "hy" || key === "en" || key === "ru") {
          const value = settings.voicePreferences[key];
          if (typeof value === "string") {
            typedVoicePrefs[key as LanguageCode] = value;
          }
        }
      }
      valid.voicePreferences = typedVoicePrefs;
    }

    // ShowTTSIndicator: boolean
    if (typeof settings.showTTSIndicator === "boolean") {
      valid.showTTSIndicator = settings.showTTSIndicator;
    }

    // PreloadCount: number
    if (typeof settings.preloadCount === "number" && !isNaN(settings.preloadCount)) {
      valid.preloadCount = Math.max(0, Math.min(50, settings.preloadCount));
    }

    // CacheEnabled: boolean
    if (typeof settings.cacheEnabled === "boolean") {
      valid.cacheEnabled = settings.cacheEnabled;
    }

    return valid;
  }

  /**
   * Save settings to localStorage
   */
  private save(): void {
    if (typeof window === "undefined") return;

    try {
      const toSave = {
        ...this.settings,
        _version: STORAGE_VERSION,
        _updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // Storage quota exceeded or unavailable
    }
  }

  // ─── PUBLIC API ─────────────────────────────────────────────────────

  /**
   * Get all settings
   */
  get(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Update settings with validation
   */
  update(updates: Partial<AudioSettings>): AudioSettings {
    const previous = { ...this.settings };
    this.previousSettings = previous;

    // Apply updates with validation
    const merged = { ...this.settings, ...updates };
    this.settings = this.validate(merged);

    // Ensure _version is preserved
    this.save();
    this.notifyHandlers(previous);

    return this.get();
  }

  /**
   * Reset to defaults
   */
  reset(): AudioSettings {
    const previous = { ...this.settings };
    this.previousSettings = previous;
    this.settings = { ...DEFAULT_AUDIO_SETTINGS };
    this.save();
    this.notifyHandlers(previous);
    return this.get();
  }

  /**
   * Check if settings are at defaults
   */
  isDefault(): boolean {
    const current = this.settings;
    const defaults = DEFAULT_AUDIO_SETTINGS;
    return (
      current.volume === defaults.volume &&
      current.rate === defaults.rate &&
      current.pitch === defaults.pitch &&
      current.autoPlay === defaults.autoPlay &&
      current.preferredTTS === defaults.preferredTTS &&
      current.fallbackChain.length === defaults.fallbackChain.length &&
      current.fallbackChain.every((p, i) => p === defaults.fallbackChain[i])
    );
  }

  // ─── GETTERS ────────────────────────────────────────────────────────

  getVolume(): number {
    return this.settings.volume;
  }

  getRate(): number {
    return this.settings.rate;
  }

  getPitch(): number {
    return this.settings.pitch;
  }

  getAutoPlay(): boolean {
    return this.settings.autoPlay;
  }

  getPreferredTTS(): AudioProviderType {
    return this.settings.preferredTTS;
  }

  getFallbackChain(): AudioProviderType[] {
    return [...this.settings.fallbackChain];
  }

  getVoicePreference(lang: LanguageCode): string | undefined {
    return this.settings.voicePreferences[lang];
  }

  getPreloadCount(): number {
    return this.settings.preloadCount;
  }

  isCacheEnabled(): boolean {
    return this.settings.cacheEnabled;
  }

  shouldShowTTSIndicator(): boolean {
    return this.settings.showTTSIndicator;
  }

  // ─── SETTERS ────────────────────────────────────────────────────────

  setVolume(volume: number): void {
    this.update({ volume: Math.max(0, Math.min(1, volume)) });
  }

  setRate(rate: number): void {
    this.update({ rate: Math.max(0.5, Math.min(2, rate)) });
  }

  setPitch(pitch: number): void {
    this.update({ pitch: Math.max(0.5, Math.min(2, pitch)) });
  }

  setAutoPlay(autoPlay: boolean): void {
    this.update({ autoPlay });
  }

  setPreferredTTS(provider: AudioProviderType): void {
    this.update({ preferredTTS: provider });
  }

  setFallbackChain(chain: AudioProviderType[]): void {
    // Ensure at least one provider
    const validChain = chain.filter((p) => Object.values(AudioProviderType).includes(p));
    if (validChain.length === 0) {
      validChain.push(AudioProviderType.BROWSER_TTS);
    }
    this.update({ fallbackChain: validChain });
  }

  setVoicePreference(lang: LanguageCode, voice: string): void {
    this.update({
      voicePreferences: {
        ...this.settings.voicePreferences,
        [lang]: voice,
      },
    });
  }

  setPreloadCount(count: number): void {
    this.update({ preloadCount: Math.max(0, Math.min(50, count)) });
  }

  setCacheEnabled(enabled: boolean): void {
    this.update({ cacheEnabled: enabled });
  }

  setShowTTSIndicator(show: boolean): void {
    this.update({ showTTSIndicator: show });
  }

  // ─── VOICE MANAGEMENT ──────────────────────────────────────────────

  /**
   * Get all voice preferences
   */
  getVoicePreferences(): Record<LanguageCode, string> {
    // ✅ FIXED: Return a complete Record with all language codes
    const result: Record<LanguageCode, string> = {
      hy: "",
      en: "",
      ru: "",
    };
    
    const prefs = this.settings.voicePreferences;
    // Copy existing preferences if they are strings
    if (prefs.hy && typeof prefs.hy === "string") result.hy = prefs.hy;
    if (prefs.en && typeof prefs.en === "string") result.en = prefs.en;
    if (prefs.ru && typeof prefs.ru === "string") result.ru = prefs.ru;
    
    return result;
  }

  /**
   * Clear voice preference for a language
   */
  clearVoicePreference(lang: LanguageCode): void {
    const newPrefs = { ...this.settings.voicePreferences };
    delete newPrefs[lang];
    this.update({ voicePreferences: newPrefs as Record<LanguageCode, string> });
  }

  /**
   * Clear all voice preferences
   */
  clearAllVoicePreferences(): void {
    this.update({ voicePreferences: { hy: "", en: "", ru: "" } });
  }


  // ─── EVENTS ─────────────────────────────────────────────────────────

  /**
   * Subscribe to settings changes
   */
  subscribe(handler: SettingsChangeHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /**
   * Subscribe once
   */
  subscribeOnce(handler: SettingsChangeHandler): () => void {
    const wrapper = (settings: AudioSettings, previous?: AudioSettings) => {
      handler(settings, previous);
      this.handlers.delete(wrapper);
    };
    this.handlers.add(wrapper);
    return () => this.handlers.delete(wrapper);
  }

  /**
   * Notify all handlers
   */
  private notifyHandlers(previous?: AudioSettings): void {
    const settings = this.get();
    for (const handler of this.handlers) {
      try {
        handler(settings, previous);
      } catch {
        // Handler error
      }
    }
  }

  // ─── UTILITY ────────────────────────────────────────────────────────

  /**
   * Export settings as JSON
   */
  exportToJSON(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from JSON
   */
  importFromJSON(json: string): boolean {
    try {
      const data = JSON.parse(json);
      this.settings = this.validate(data);
      this.save();
      this.notifyHandlers();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if settings are loaded
   */
  isReady(): boolean {
    return this.isLoaded;
  }

  /**
   * Get the version of the stored settings
   */
  getVersion(): number {
    return STORAGE_VERSION;
  }

  /**
   * Get last updated timestamp
   */
  getLastUpdated(): string | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed._updatedAt || null;
      }
    } catch {
      // Ignore
    }
    return null;
  }
}

// ─── SINGLETON INSTANCE ──────────────────────────────────────────────

export const audioSettings = new AudioSettingsManager();

// ─── RE-EXPORT ────────────────────────────────────────────────────────

export type { AudioSettings };
export { DEFAULT_AUDIO_SETTINGS };