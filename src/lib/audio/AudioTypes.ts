// src/lib/audio/AudioTypes.ts
// NUR Lingo Audio Engine — Complete Type Definitions

// ─── LANGUAGE TYPES ───────────────────────────────────────────────────

export type LanguageCode = "hy" | "en" | "ru";

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  speechSynthesisLang: string;
  preferredVoiceGender?: "male" | "female" | "neutral";
  defaultRate?: number;
  defaultPitch?: number;
}

export const LANGUAGE_CONFIGS: Record<LanguageCode, LanguageConfig> = {
  hy: {
    code: "hy",
    name: "Armenian",
    nativeName: "Հայերեն",
    flag: "🇦🇲",
    speechSynthesisLang: "hy-AM",
    preferredVoiceGender: "female",
    defaultRate: 0.85,
    defaultPitch: 1.0,
  },
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    speechSynthesisLang: "en-US",
    preferredVoiceGender: "female",
    defaultRate: 0.9,
    defaultPitch: 1.0,
  },
  ru: {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    flag: "🇷🇺",
    speechSynthesisLang: "ru-RU",
    preferredVoiceGender: "female",
    defaultRate: 0.85,
    defaultPitch: 1.0,
  },
};

// ─── PROVIDER TYPES ───────────────────────────────────────────────────

export enum AudioProviderType {
  MP3 = "mp3",
  WAV = "wav",
  BROWSER_TTS = "browser-tts",
  NARAKEET = "narakeet",
  AZURE = "azure",
  GOOGLE_TTS = "google-tts",
  ELEVENLABS = "elevenlabs",
  OPENAI = "openai",
  COQUI = "coqui",
  PIPER = "piper",
  EDGE_TTS = "edge-tts",
}

export interface ProviderCapabilities {
  canPlayFiles: boolean;
  canSynthesize: boolean;
  canStream: boolean;
  hasVoiceSelection: boolean;
  requiresNetwork: boolean;
  supportsOffline: boolean;
  canPersist: boolean;
  canPause?: boolean;
  supportsRate?: boolean;
  supportsPitch?: boolean;
}

// ─── AUDIO STATUS ─────────────────────────────────────────────────────

export enum AudioStatus {
  READY = "ready",
  MISSING = "missing",
  GENERATING = "generating",
  ERROR = "error",
  UNKNOWN = "unknown",
  CACHED = "cached",
  OUTDATED = "outdated",
}

export enum PlaybackState {
  IDLE = "idle",
  LOADING = "loading",
  PLAYING = "playing",
  PAUSED = "paused",
  STOPPED = "stopped",
  ERROR = "error",
  COMPLETED = "completed",
}

// ─── MANIFEST TYPES ──────────────────────────────────────────────────

export interface AudioManifestEntry {
  id: string;
  text: string;
  lang: LanguageCode;
  filename: string;
  duration?: number;
  provider: AudioProviderType;
  version: number;
  checksum?: string;
  generatedAt?: string;
  size?: number;
  sampleRate?: number;
  status: AudioStatus;
  playCount?: number;
  lastPlayedAt?: string;
  tags?: string[];
}

export interface AudioManifest {
  schemaVersion: number;
  lastUpdated: string;
  totalEntries: number;
  entries: Record<string, AudioManifestEntry>;
  stats: Record<LanguageCode, { total: number; ready: number; missing: number; cached: number }>;
  globalStats?: {
    totalPlayCount: number;
    averageDuration: number;
    totalSize: number;
  };
}

// ─── PLAYBACK TYPES ──────────────────────────────────────────────────

export interface AudioPlayOptions {
  id?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  preferredProvider?: AudioProviderType;
  forceProvider?: AudioProviderType;
  bypassCache?: boolean;
  autoNext?: boolean;
  allowUserRecording?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  onLoading?: () => void;
  onSource?: (source: AudioProviderType) => void;
  onProgress?: (event: { loaded: number; total: number; progress: number }) => void;
}

export interface AudioPlayResult {
  provider: AudioProviderType;
  isTTSFallback: boolean;
  completed: boolean;
  duration?: number;
  error?: Error;
}

// ─── GENERATION TYPES ─────────────────────────────────────────────────

export interface AudioGenerateRequest {
  text: string;
  lang: LanguageCode;
  id: string;
  preferredProvider?: AudioProviderType;
  persist?: boolean;
  overwrite?: boolean;
  voice?: string;
  rate?: number;
  pitch?: number;
}

export interface AudioGenerateResult {
  id: string;
  provider: AudioProviderType;
  blob?: Blob;
  url?: string;
  duration?: number;
  error?: string;
  success: boolean;
}

// ─── QUEUE TYPES ─────────────────────────────────────────────────────

export interface AudioQueueItem {
  queueId: string;
  text: string;
  lang: LanguageCode;
  audioId?: string;
  options: AudioPlayOptions;
  priority: number;
  addedAt: number;
  onPlay?: () => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

// ─── SETTINGS TYPES ──────────────────────────────────────────────────

export interface AudioSettings {
  volume: number;
  rate: number;
  pitch: number;
  autoPlay: boolean;
  preferredTTS: AudioProviderType;
  fallbackChain: AudioProviderType[];
  preloadCount: number;
  cacheEnabled: boolean;
  maxCacheSize: number;
  voicePreferences: Partial<Record<LanguageCode, string>>;
  showTTSIndicator: boolean;
  preferUserRecordings?: boolean;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  volume: 1.0,
  rate: 0.9,
  pitch: 1.0,
  autoPlay: false,
  preferredTTS: AudioProviderType.BROWSER_TTS,
  fallbackChain: [AudioProviderType.MP3, AudioProviderType.BROWSER_TTS],
  preloadCount: 3,
  cacheEnabled: true,
  maxCacheSize: 50,
  voicePreferences: {},
  showTTSIndicator: true,
  preferUserRecordings: true,
};

// ─── CACHE TYPES ─────────────────────────────────────────────────────

export interface AudioCacheStats {
  entries: number;
  totalSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  dbEntries?: number;
  dbSize?: number;
}

// ─── PROVIDER INTERFACE ─────────────────────────────────────────────

export interface IAudioProvider {
  readonly type: AudioProviderType;
  readonly name: string;
  readonly capabilities: ProviderCapabilities;
  isAvailable(): Promise<boolean>;
  play(text: string, lang: LanguageCode, options: AudioPlayOptions): Promise<AudioPlayResult>;
  stop(): void;
  isPlaying(): boolean;
  getVoices?(): Promise<SpeechSynthesisVoice[]>;
  generate?(request: AudioGenerateRequest): Promise<AudioGenerateResult>;
  getProgress?(): { current: number; duration: number; percentage: number } | null;
}

// ─── EVENT TYPES ─────────────────────────────────────────────────────

export interface AudioProgressEvent {
  id: string;
  step: "checking" | "loading" | "generating" | "encoding" | "saving" | "complete" | "error" | "cached" | "fallback";
  progress: number;
  error?: string;
}

export interface AudioEngineEvents {
  play: { id: string; provider: AudioProviderType };
  end: { id: string; completed: boolean };
  stop: { id: string };
  error: { id: string; error: Error };
  loading: { id: string };
  progress: AudioProgressEvent;
  queueChange: { queueLength: number };
  settingsChange: AudioSettings;
  cacheChange: { size: number; items: number };
  initialized: { success: boolean; error?: Error };
  providerChange: { provider: AudioProviderType; available: boolean };
}

// ─── UTILITY TYPES ───────────────────────────────────────────────────

export const AUDIO_PRIORITY = {
  VERIFIED_MP3: 1,
  CACHED_AUDIO: 2,
  BROWSER_CACHE: 3,
  INDEXED_DB: 4,
  BROWSER_TTS: 5,
  USER_RECORDING: 6,
} as const;

export type AudioPriority = (typeof AUDIO_PRIORITY)[keyof typeof AUDIO_PRIORITY];

export interface AudioSource {
  priority: AudioPriority;
  provider: AudioProviderType;
  url?: string;
  data?: string;
  text?: string;
  duration?: number;
}

// ─── LANGUAGE TTS SUPPORT ────────────────────────────────────────────

export const LANGUAGE_TTS_SUPPORT: Record<LanguageCode, { hasTTS: boolean; fallbackOnly: boolean }> = {
  hy: { hasTTS: true, fallbackOnly: false },
  en: { hasTTS: true, fallbackOnly: false },
  ru: { hasTTS: true, fallbackOnly: false },
};

// ✅ SMART HYBRID: Language provider preferences
// WAV for Armenian, BROWSER_TTS for English and Russian
export const LANGUAGE_PROVIDER_PREFERENCE: Record<LanguageCode, AudioProviderType[]> = {
  hy: [AudioProviderType.WAV, AudioProviderType.MP3, AudioProviderType.BROWSER_TTS],
  en: [AudioProviderType.BROWSER_TTS, AudioProviderType.MP3],
  ru: [AudioProviderType.BROWSER_TTS, AudioProviderType.MP3],
};