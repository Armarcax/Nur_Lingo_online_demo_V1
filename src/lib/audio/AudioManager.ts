// src/lib/audio/AudioManager.ts
// NUR Lingo Audio Engine — Central Audio Manager (Single Public API)

import {
  AudioProviderType,
  AudioPlayOptions,
  AudioPlayResult,
  AudioSettings,
  AudioCacheStats,
  LanguageCode,
  AudioGenerateRequest,
  AudioGenerateResult,
  AudioEngineEvents,
  AudioProgressEvent,
  DEFAULT_AUDIO_SETTINGS,
  LANGUAGE_TTS_SUPPORT,
  LANGUAGE_PROVIDER_PREFERENCE,
  IAudioProvider,
} from "./AudioTypes";
import { audioCache } from "./AudioCache";
import { audioManifest } from "./AudioManifest";
import { audioQueue } from "./AudioQueue";
import { audioSettings } from "./AudioSettings";
import {
  MP3AudioProvider,
  BrowserTTSProvider,
  mp3Provider,
  browserTTSProvider,
} from "./AudioProviders";
import { WavProvider } from "./WavProvider";

type EventHandler<K extends keyof AudioEngineEvents> = (data: AudioEngineEvents[K]) => void;

// ─── AUDIO PRIORITY SYSTEM ───────────────────────────────────────────

export const AUDIO_PRIORITY = {
  VERIFIED_MP3: 1,
  CACHED_AUDIO: 2,
  BROWSER_CACHE: 3,
  INDEXED_DB: 4,
  BROWSER_TTS: 5,
  USER_RECORDING: 6,
} as const;

export type AudioPriority = typeof AUDIO_PRIORITY[keyof typeof AUDIO_PRIORITY];

interface AudioSource {
  priority: AudioPriority;
  provider: AudioProviderType;
  url?: string;
  data?: string;
  text?: string;
}

/**
 * AudioManager — The single public API for all audio operations
 */
class AudioManager {
  private providers: Map<AudioProviderType, IAudioProvider> = new Map();
  private currentPlayId: string | null = null;
  private lastPlayKey: string | null = null;
  private eventHandlers: Map<string, Set<EventHandler<any>>> = new Map();
  private pendingOperations: Map<string, Promise<void>> = new Map();
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.registerProvider(mp3Provider);
    this.registerProvider(browserTTSProvider);
    this.registerProvider(new WavProvider());

    audioSettings.subscribe((settings) => {
      this.emit("settingsChange", settings);
    });

    this.initialize();
  }

  // ─── INITIALIZATION ──────────────────────────────────────────────────

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const settings = audioSettings.get();
        await audioManifest.getManifest();

        if (settings.preloadCount > 0) {
          const commonWords = await this.getCommonWords(settings.preloadCount);
          await this.preload(commonWords.map((id) => ({ id, lang: "hy" as LanguageCode })));
        }

        this.isInitialized = true;
        this.emit("initialized", { success: true });
      } catch (error) {
        this.emit("initialized", {
          success: false,
          error: error instanceof Error ? error : new Error("Initialization failed"),
        });
      }
    })();

    return this.initPromise;
  }

  private async getCommonWords(limit: number): Promise<string[]> {
    try {
      const words = await audioManifest.getAudioIds("hy");
      return words.slice(0, limit);
    } catch {
      return [];
    }
  }

  // ─── CORE PLAYBACK ──────────────────────────────────────────────────

  async play(
    text: string,
    lang: LanguageCode,
    options: AudioPlayOptions = {}
  ): Promise<AudioPlayResult> {
    await this.ensureInitialized();

    const playKey = options.id ? `${options.id}-${lang}` : `tts-${text}-${lang}`;

    if (this.lastPlayKey === playKey && this.isPlaying()) {
      this.stop();
      return { provider: AudioProviderType.MP3, isTTSFallback: false, completed: false };
    }

    this.lastPlayKey = playKey;
    this.emit("loading", { id: options.id ?? text });
    options.onLoading?.();

    const pendingKey = `play:${playKey}`;
    if (this.pendingOperations.has(pendingKey)) {
      await this.pendingOperations.get(pendingKey);
    }

    const playPromise = this.executePlay(text, lang, options);
    this.pendingOperations.set(pendingKey, playPromise.then(() => {}));

    try {
      return await playPromise;
    } finally {
      this.pendingOperations.delete(pendingKey);
    }
  }

  private async executePlay(
    text: string,
    lang: LanguageCode,
    options: AudioPlayOptions
  ): Promise<AudioPlayResult> {
    this.stop();

    const settings = audioSettings.get();

    let fallbackChain: AudioProviderType[];
    if (options.preferredProvider) {
      fallbackChain = [
        options.preferredProvider,
        ...LANGUAGE_PROVIDER_PREFERENCE[lang].filter((p) => p !== options.preferredProvider),
      ];
    } else {
      fallbackChain = LANGUAGE_PROVIDER_PREFERENCE[lang] || settings.fallbackChain;
    }

    if (!LANGUAGE_TTS_SUPPORT[lang].hasTTS) {
      fallbackChain = fallbackChain.filter(p => p !== AudioProviderType.BROWSER_TTS);
    }

    const errors: Error[] = [];

    for (const providerType of fallbackChain) {
      const provider = this.providers.get(providerType);
      if (!provider) continue;

      if (providerType === AudioProviderType.MP3 && !options.id) {
        continue;
      }

      try {
        const available = await provider.isAvailable();
        if (!available) continue;

        const result = await provider.play(text, lang, {
          ...options,
          volume: options.volume ?? settings.volume,
          rate: options.rate ?? settings.rate,
          onSource: (source) => {
            this.currentPlayId = options.id ?? text;
            this.emit("play", { id: this.currentPlayId, provider: source });
            options.onSource?.(source);
          },
        });

        return result;
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error("Unknown error"));
      }
    }

    const finalError = new Error(`All audio providers failed: ${errors.map((e) => e.message).join("; ")}`);
    options.onError?.(finalError);
    this.emit("error", { id: options.id ?? text, error: finalError });
    throw finalError;
  }

  // ✅ FIXED: findAudioSources (հեռացված է data: cached)
  private async findAudioSources(
    text: string,
    lang: LanguageCode,
    options: AudioPlayOptions
  ): Promise<AudioSource[]> {
    const sources: AudioSource[] = [];

    if (options.id) {
      const exists = await audioManifest.checkAudioExists(options.id, lang);
      if (exists) {
        const paddedId = options.id.padStart(6, "0");
        const url = `/audio/${lang}/${paddedId}.mp3`;
        sources.push({
          priority: AUDIO_PRIORITY.VERIFIED_MP3,
          provider: AudioProviderType.MP3,
          url,
        });
      }
    }

    // ✅ FIXED: HTMLAudioElement-ը չենք կարող պահել որպես string
    if (options.id) {
      const paddedId = options.id.padStart(6, "0");
      const url = `/audio/${lang}/${paddedId}.mp3`;
      const cached = await audioCache.get(url);
      if (cached) {
        sources.push({
          priority: AUDIO_PRIORITY.CACHED_AUDIO,
          provider: AudioProviderType.MP3,
          url,
        });
      }
    }

    if (options.id && options.allowUserRecording !== false && LANGUAGE_TTS_SUPPORT[lang].hasTTS) {
      try {
        const { getUserRecording } = await import("@/lib/dictionary");
        const recording = getUserRecording(options.id);
        if (recording && typeof recording === 'string' && recording.length > 0) {
          sources.push({
            priority: AUDIO_PRIORITY.USER_RECORDING,
            provider: AudioProviderType.BROWSER_TTS,
            data: recording,
            text: text,
          });
        }
      } catch {
        // User recording not available
      }
    }

    if (LANGUAGE_TTS_SUPPORT[lang].hasTTS) {
      sources.push({
        priority: AUDIO_PRIORITY.BROWSER_TTS,
        provider: AudioProviderType.BROWSER_TTS,
        text: text,
      });
    }

    return sources.sort((a, b) => a.priority - b.priority);
  }

  stop(): void {
    for (const provider of this.providers.values()) {
      provider.stop();
    }
    this.currentPlayId = null;
    if (this.lastPlayKey) {
      this.emit("stop", { id: this.lastPlayKey });
    }
  }

  isPlaying(): boolean {
    for (const provider of this.providers.values()) {
      if (provider.isPlaying()) return true;
    }
    return false;
  }

  isLoading(): boolean {
    return this.pendingOperations.size > 0;
  }

  pause(): void {
    this.stop();
  }

  // ─── QUEUE ──────────────────────────────────────────────────────────

  queuePlay(text: string, lang: LanguageCode, options: AudioPlayOptions = {}): string {
    const queueId = audioQueue.enqueue(text, lang, options);
    this.emit("queueChange", { queueLength: audioQueue.length });
    return queueId;
  }

  clearQueue(): void {
    audioQueue.clear();
    this.emit("queueChange", { queueLength: 0 });
  }

  getQueueLength(): number {
    return audioQueue.length;
  }

  // ─── PRELOADING ─────────────────────────────────────────────────────

  async preload(items: Array<{ id: string; lang: LanguageCode }>): Promise<void> {
    const settings = audioSettings.get();
    const toLoad = items.slice(0, settings.preloadCount);
    const urls: string[] = [];

    for (const { id, lang } of toLoad) {
      const paddedId = id.padStart(6, "0");
      const url = `/audio/${lang}/${paddedId}.mp3`;

      const exists = await audioManifest.checkAudioExists(id, lang);
      if (exists) {
        urls.push(url);
      }
    }

    if (urls.length > 0) {
      await audioCache.prefetch(urls);
    }
  }

  async preloadOne(id: string, lang: LanguageCode): Promise<boolean> {
    const exists = await audioManifest.checkAudioExists(id, lang);
    if (!exists) return false;

    const paddedId = id.padStart(6, "0");
    const url = `/audio/${lang}/${paddedId}.mp3`;

    try {
      await audioCache.getOrLoad(url);
      return true;
    } catch {
      return false;
    }
  }

  // ─── STATUS ─────────────────────────────────────────────────────────

  async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  async hasAudio(id: string, lang: LanguageCode): Promise<boolean> {
    return audioManifest.checkAudioExists(id, lang);
  }

  getAudioUrl(id: string, lang: LanguageCode): string | null {
    const paddedId = id.padStart(6, "0");
    return `/audio/${lang}/${paddedId}.mp3`;
  }

  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    const browserProvider = this.providers.get(AudioProviderType.BROWSER_TTS);
    if (browserProvider && browserProvider.getVoices) {
      return browserProvider.getVoices();
    }
    return [];
  }

  getCurrentPlayId(): string | null {
    return this.currentPlayId;
  }

  isPlayingItem(id: string, lang: LanguageCode): boolean {
    return this.currentPlayId === id || this.lastPlayKey === `${id}-${lang}`;
  }

  isTTSFallback(): boolean {
    return false;
  }

  // ─── SETTINGS ───────────────────────────────────────────────────────

  getSettings(): AudioSettings {
    return audioSettings.get();
  }

  updateSettings(updates: Partial<AudioSettings>): AudioSettings {
    return audioSettings.update(updates);
  }

  // ─── STATISTICS ─────────────────────────────────────────────────────

  async getCacheStats(): Promise<AudioCacheStats> {
    return audioCache.getStats();
  }

  async getManifestStats(lang: LanguageCode): Promise<{ total: number; ready: number; missing: number }> {
    return audioManifest.getStats(lang);
  }

  async getMissingAudio(lang?: LanguageCode): Promise<string[]> {
    return audioManifest.getMissingAudio(lang);
  }

  // ─── CACHE ──────────────────────────────────────────────────────────

  clearCache(): void {
    audioCache.clear();
    audioManifest.clearCache();
    this.emit("cacheChange", { size: 0, items: 0 });
  }

  // ✅ FIXED: getCacheSize-ը async է
  async getCacheSize(): Promise<number> {
    const stats = await audioCache.getStats();
    return stats.totalSize || 0;
  }

  // ─── PROVIDERS ──────────────────────────────────────────────────────

  registerProvider(provider: IAudioProvider): void {
    this.providers.set(provider.type, provider);
  }

  async isProviderAvailable(type: AudioProviderType): Promise<boolean> {
    const provider = this.providers.get(type);
    if (!provider) return false;
    return provider.isAvailable();
  }

  getRegisteredProviders(): AudioProviderType[] {
    return Array.from(this.providers.keys());
  }

  // ─── EVENTS ─────────────────────────────────────────────────────────

  on<K extends keyof AudioEngineEvents>(
    event: K,
    handler: EventHandler<K>
  ): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  onAll(handler: (event: string, data: any) => void): () => void {
    const events: (keyof AudioEngineEvents)[] = [
      "play",
      "stop",
      "loading",
      "error",
      "progress",
      "settingsChange",
      "queueChange",
      "cacheChange",
      "initialized",
    ];

    const unsubscribers = events.map((event) =>
      this.on(event, (data) => handler(event, data))
    );

    return () => unsubscribers.forEach((unsub) => unsub());
  }

  private emit<K extends keyof AudioEngineEvents>(
    event: K,
    data: AudioEngineEvents[K]
  ): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch {
          // Handler error - ignore
        }
      }
    }
  }

  // ✅ FIXED: emitProgress առանց loaded/total-ի
  emitProgress(id: string, loaded: number, total: number): void {
    this.emit("progress", {
      id,
      progress: total > 0 ? loaded / total : 0,
      step: "loading",
    });
  }
}

// ─── SINGLETON INSTANCE ───
export const audioManager = new AudioManager();

// ─── CONVENIENCE EXPORTS ───
export { audioCache } from "./AudioCache";
export { audioManifest } from "./AudioManifest";
export { audioQueue } from "./AudioQueue";
export { audioSettings } from "./AudioSettings";

// ─── RE-EXPORT TYPES ───
export * from "./AudioTypes";