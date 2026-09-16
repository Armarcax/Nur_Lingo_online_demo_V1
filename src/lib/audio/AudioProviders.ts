// src/lib/audio/AudioProviders.ts
// NUR Lingo Audio Engine — Audio Provider Implementations

import {
  IAudioProvider,
  AudioProviderType,
  ProviderCapabilities,
  LanguageCode,
  AudioPlayOptions,
  AudioPlayResult,
  AudioGenerateRequest,
  AudioGenerateResult,
  LANGUAGE_CONFIGS,
  LANGUAGE_TTS_SUPPORT,
} from "./AudioTypes";
import { audioCache } from "./AudioCache";
import { audioManifest } from "./AudioManifest";

// ─── BASE PROVIDER CLASS ─────────────────────────────────────────────

abstract class BaseAudioProvider implements IAudioProvider {
  abstract readonly type: AudioProviderType;
  abstract readonly name: string;
  abstract readonly capabilities: ProviderCapabilities;
  protected activeId: string | null = null;
  protected isActive = false;

  abstract isAvailable(): Promise<boolean>;
  abstract play(text: string, lang: LanguageCode, options: AudioPlayOptions): Promise<AudioPlayResult>;
  abstract stop(): void;
  abstract isPlaying(): boolean;

  protected onStart(id: string, options: AudioPlayOptions): void {
    this.activeId = id;
    this.isActive = true;
    options.onStart?.();
  }

  protected onEnd(options: AudioPlayOptions): void {
    this.activeId = null;
    this.isActive = false;
    options.onEnd?.();
  }

  protected onError(error: Error, options: AudioPlayOptions): void {
    this.activeId = null;
    this.isActive = false;
    options.onError?.(error);
  }
}

// ─── MP3 PROVIDER ─────────────────────────────────────────────────────

export class MP3AudioProvider extends BaseAudioProvider {
  readonly type = AudioProviderType.MP3;
  readonly name = "Local MP3";
  readonly capabilities: ProviderCapabilities = {
    canPlayFiles: true,
    canSynthesize: false,
    canStream: false,
    hasVoiceSelection: false,
    requiresNetwork: false,
    supportsOffline: true,
    canPersist: false,
  };

  private activeAudio: HTMLAudioElement | null = null;
  private activeUrl: string | null = null;
  private retryCount = 0;
  private maxRetries = 3;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async play(text: string, lang: LanguageCode, options: AudioPlayOptions): Promise<AudioPlayResult> {
    const audioId = options.id;
    if (!audioId) {
      throw new Error("MP3 provider requires an audio ID");
    }

    const paddedId = audioId.padStart(6, "0");
    const url = `/audio/${lang}/${paddedId}.mp3`;

    const exists = await audioManifest.checkAudioExists(audioId, lang);
    if (!exists) {
      throw new Error(`MP3 not found for ID: ${audioId} (${lang})`);
    }

    this.onStart(audioId, options);
    options.onLoading?.();

    try {
      const audio = await audioCache.getOrLoad(url);
      const clone = audio.cloneNode(true) as HTMLAudioElement;

      this.activeAudio = clone;
      this.activeUrl = url;
      this.retryCount = 0;

      clone.volume = options.volume ?? 1.0;
      clone.playbackRate = options.rate ?? 1.0;

      return new Promise((resolve, reject) => {
        let resolved = false;

        const cleanup = () => {
          clone.onplay = null;
          clone.onended = null;
          clone.onerror = null;
          clone.ontimeupdate = null;
        };

        clone.onplay = () => {
          options.onSource?.(this.type);
          options.onStart?.();
        };

        clone.onended = () => {
          if (resolved) return;
          resolved = true;
          cleanup();
          this.activeAudio = null;
          this.activeUrl = null;
          this.onEnd(options);
          resolve({
            provider: this.type,
            isTTSFallback: false,
            completed: true,
          });
        };

        clone.onerror = (e) => {
          if (resolved) return;
          resolved = true;
          cleanup();
          this.activeAudio = null;
          this.activeUrl = null;
          const error = new Error(`Playback error: ${url}`);
          this.onError(error, options);
          reject(error);
        };

        // ✅ FIXED: հեռացված id-ն onProgress-ից
        clone.ontimeupdate = () => {
          if (clone.duration && !isNaN(clone.duration)) {
            const progress = clone.currentTime / clone.duration;
            options.onProgress?.({
              loaded: Math.round(progress * 100),
              total: 100,
              progress,
            });
          }
        };

        clone.play().catch((err) => {
          cleanup();
          this.activeAudio = null;
          this.activeUrl = null;
          this.onError(err, options);
          reject(err);
        });
      });
    } catch (error) {
      this.activeAudio = null;
      this.activeUrl = null;
      throw error instanceof Error ? error : new Error("MP3 load failed");
    }
  }

  stop(): void {
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      } catch {
        // Ignore errors during stop
      }
      this.activeAudio = null;
      this.activeUrl = null;
      this.activeId = null;
      this.isActive = false;
    }
  }

  isPlaying(): boolean {
    return this.activeAudio !== null && !this.activeAudio.paused;
  }

  getProgress(): { current: number; duration: number; percentage: number } | null {
    if (!this.activeAudio) return null;
    const current = this.activeAudio.currentTime || 0;
    const duration = this.activeAudio.duration || 0;
    return {
      current,
      duration,
      percentage: duration > 0 ? (current / duration) * 100 : 0,
    };
  }

  getCurrentUrl(): string | null {
    return this.activeUrl;
  }

  getCurrentId(): string | null {
    return this.activeId;
  }
}

// ─── BROWSER TTS PROVIDER ────────────────────────────────────────────

export class BrowserTTSProvider extends BaseAudioProvider {
  readonly type = AudioProviderType.BROWSER_TTS;
  readonly name = "Browser TTS";
  readonly capabilities: ProviderCapabilities = {
    canPlayFiles: false,
    canSynthesize: true,
    canStream: false,
    hasVoiceSelection: true,
    requiresNetwork: false,
    supportsOffline: true,
    canPersist: false,
  };

  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private isCurrentlySpeaking = false;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;
  private voiceLoadPromise: Promise<SpeechSynthesisVoice[]> | null = null;
  private preferredVoice: SpeechSynthesisVoice | null = null;

  async isAvailable(): Promise<boolean> {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  private async loadVoices(): Promise<SpeechSynthesisVoice[]> {
    if (this.voicesLoaded && this.voices.length > 0) {
      return this.voices;
    }

    if (this.voiceLoadPromise) {
      return this.voiceLoadPromise;
    }

    const synth = window.speechSynthesis;
    if (!synth) return [];

    this.voiceLoadPromise = new Promise((resolve) => {
      const loadedVoices = synth.getVoices();
      if (loadedVoices.length > 0) {
        this.voices = loadedVoices;
        this.voicesLoaded = true;
        resolve(this.voices);
        return;
      }

      const handler = () => {
        this.voices = synth.getVoices();
        this.voicesLoaded = true;
        synth.removeEventListener("voiceschanged", handler);
        resolve(this.voices);
      };
      synth.addEventListener("voiceschanged", handler);

      setTimeout(() => {
        const voices = synth.getVoices();
        if (voices.length > 0) {
          this.voices = voices;
          this.voicesLoaded = true;
        }
        synth.removeEventListener("voiceschanged", handler);
        resolve(this.voices);
      }, 1500);
    });

    return this.voiceLoadPromise;
  }

  async setPreferredVoice(voiceName: string): Promise<void> {
    const voices = await this.loadVoices();
    const found = voices.find((v) => v.name === voiceName);
    if (found) {
      this.preferredVoice = found;
    }
  }

  async play(text: string, lang: LanguageCode, options: AudioPlayOptions): Promise<AudioPlayResult> {
    if (lang === 'hy') {
      throw new Error('TTS not available for Armenian language');
    }

    const synth = window.speechSynthesis;
    if (!synth) {
      throw new Error("Speech synthesis not available");
    }

    if (synth.speaking) {
      synth.cancel();
    }

    this.onStart(options.id ?? text, options);
    options.onLoading?.();

    await this.loadVoices();

    const langConfig = LANGUAGE_CONFIGS[lang];
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = langConfig.speechSynthesisLang;
    utterance.rate = options.rate ?? 0.9;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    const voices = await this.getVoices();
    let selectedVoice: SpeechSynthesisVoice | null = this.preferredVoice || null;

    if (!selectedVoice) {
      const targetLang = langConfig.speechSynthesisLang.split("-")[0];
      selectedVoice = (
        voices.find((v) => v.lang.startsWith(targetLang) && v.localService) ||
        voices.find((v) => v.lang.startsWith(targetLang)) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0] ||
        null
      );
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    this.activeUtterance = utterance;
    this.isCurrentlySpeaking = true;

    return new Promise((resolve, reject) => {
      let resolved = false;

      const cleanup = () => {
        utterance.onstart = null;
        utterance.onend = null;
        utterance.onerror = null;
        utterance.onpause = null;
        utterance.onresume = null;
      };

      utterance.onstart = () => {
        options.onSource?.(this.type);
        options.onStart?.();
      };

      utterance.onend = () => {
        if (resolved) return;
        resolved = true;
        cleanup();
        this.activeUtterance = null;
        this.isCurrentlySpeaking = false;
        this.onEnd(options);
        resolve({
          provider: this.type,
          isTTSFallback: true,
          completed: true,
        });
      };

      utterance.onerror = (event) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        this.activeUtterance = null;
        this.isCurrentlySpeaking = false;
        const error = new Error(`Speech synthesis error: ${event.error || "Unknown"}`);
        this.onError(error, options);
        reject(error);
      };

      utterance.onpause = () => {};
      utterance.onresume = () => {};

      options.onSource?.(this.type);

      try {
        synth.speak(utterance);
      } catch (error) {
        cleanup();
        this.activeUtterance = null;
        this.isCurrentlySpeaking = false;
        const err = error instanceof Error ? error : new Error("Speech synthesis failed");
        this.onError(err, options);
        reject(err);
      }

      const resumeInterval = setInterval(() => {
        try {
          if (!synth.speaking) {
            clearInterval(resumeInterval);
          } else if (synth.paused) {
            synth.resume();
          }
        } catch {
          // Ignore errors in interval
        }
      }, 5000);

      // ✅ FIXED: ճիշտ this context
      const originalEnd = utterance.onend;
      utterance.onend = (event) => {
        clearInterval(resumeInterval);
        if (originalEnd) {
          originalEnd.call(utterance, event);
        }
      };
    });
  }

  stop(): void {
    const synth = window.speechSynthesis;
    if (synth) {
      try {
        synth.cancel();
      } catch {
        // Ignore errors during stop
      }
    }
    this.activeUtterance = null;
    this.isCurrentlySpeaking = false;
    this.activeId = null;
    this.isActive = false;
  }

  isPlaying(): boolean {
    const synth = window.speechSynthesis;
    return this.isCurrentlySpeaking || (synth?.speaking ?? false);
  }

  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    return this.loadVoices();
  }

  async getVoicesForLanguage(lang: LanguageCode): Promise<SpeechSynthesisVoice[]> {
    const allVoices = await this.loadVoices();
    const targetLang = LANGUAGE_CONFIGS[lang]?.speechSynthesisLang?.split("-")[0] || lang;
    return allVoices.filter((v) => v.lang.startsWith(targetLang));
  }

  async isLanguageSupported(lang: LanguageCode): Promise<boolean> {
    if (lang === 'hy') {
      return false;
    }
    const voices = await this.getVoicesForLanguage(lang);
    return voices.length > 0;
  }

  getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.activeUtterance;
  }

  getCurrentText(): string | null {
    return this.activeUtterance?.text || null;
  }
}

// ─── NULL PROVIDER ────────────────────────────────────────────────────

export class NullAudioProvider extends BaseAudioProvider {
  readonly type = AudioProviderType.MP3;
  readonly name = "No Audio";
  readonly capabilities: ProviderCapabilities = {
    canPlayFiles: false,
    canSynthesize: false,
    canStream: false,
    hasVoiceSelection: false,
    requiresNetwork: false,
    supportsOffline: true,
    canPersist: false,
  };

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async play(_text: string, _lang: LanguageCode, options: AudioPlayOptions): Promise<AudioPlayResult> {
    const error = new Error("No audio provider available");
    options.onError?.(error);
    throw error;
  }

  stop(): void {}

  isPlaying(): boolean {
    return false;
  }
}

// ─── PROVIDER FACTORY ─────────────────────────────────────────────────

export class AudioProviderFactory {
  private static instance: AudioProviderFactory;
  private providers: Map<AudioProviderType, IAudioProvider> = new Map();

  private constructor() {
    this.register(new MP3AudioProvider());
    this.register(new BrowserTTSProvider());
    this.register(new NullAudioProvider());
  }

  static getInstance(): AudioProviderFactory {
    if (!AudioProviderFactory.instance) {
      AudioProviderFactory.instance = new AudioProviderFactory();
    }
    return AudioProviderFactory.instance;
  }

  register(provider: IAudioProvider): void {
    this.providers.set(provider.type, provider);
  }

  get(type: AudioProviderType): IAudioProvider | null {
    return this.providers.get(type) || null;
  }

  getAll(): IAudioProvider[] {
    return Array.from(this.providers.values());
  }

  async getAvailable(): Promise<IAudioProvider[]> {
    const available: IAudioProvider[] = [];
    for (const provider of this.providers.values()) {
      if (await provider.isAvailable()) {
        available.push(provider);
      }
    }
    return available;
  }

  async getBestProvider(options: {
    preferMP3?: boolean;
    preferTTS?: boolean;
    lang?: LanguageCode;
  }): Promise<IAudioProvider | null> {
    const available = await this.getAvailable();

    if (options.preferMP3) {
      const mp3 = available.find((p) => p.type === AudioProviderType.MP3);
      if (mp3) return mp3;
    }

    if (options.preferTTS) {
      const tts = available.find((p) => p.type === AudioProviderType.BROWSER_TTS);
      if (tts) return tts;
    }

    const mp3 = available.find((p) => p.type === AudioProviderType.MP3);
    if (mp3) return mp3;

    const tts = available.find((p) => p.type === AudioProviderType.BROWSER_TTS);
    if (tts) return tts;

    return available[0] || null;
  }
}

// ─── SINGLETON INSTANCES ─────────────────────────────────────────────

export const mp3Provider = new MP3AudioProvider();
export const browserTTSProvider = new BrowserTTSProvider();
export const nullProvider = new NullAudioProvider();
export const providerFactory = AudioProviderFactory.getInstance();

export type { IAudioProvider };