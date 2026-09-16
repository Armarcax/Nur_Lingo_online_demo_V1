
// src/lib/audio/AudioManifest.ts
// NUR Lingo Audio Engine — Manifest Management with Advanced Caching

import {
  AudioManifest,
  AudioManifestEntry,
  AudioStatus,
  AudioProviderType,
  LanguageCode,
} from "./AudioTypes";

const MANIFEST_URL = "/audio/manifest.json";
const MANIFEST_SCHEMA_VERSION = 1;
const CACHE_TTL = 120_000; // 2 minutes

// ─── LANGUAGE CONFIG ─────────────────────────────────────────────────

const LANGUAGE_CONFIG: Record<LanguageCode, { name: string; folder: string; fallback: LanguageCode; hasTTS: boolean }> = {
  hy: { name: "Հայերեն", folder: "hy", fallback: "hy", hasTTS: false },
  en: { name: "English", folder: "en", fallback: "hy", hasTTS: true },
  ru: { name: "Русский", folder: "ru", fallback: "hy", hasTTS: true },
};

/**
 * AudioManifestManager — Manages audio manifest with advanced caching
 */
class AudioManifestManager {
  private manifest: AudioManifest | null = null;
  private loadingPromise: Promise<AudioManifest> | null = null;
  private statusCache = new Map<string, boolean>(); // id-lang -> exists
  private entryCache = new Map<string, AudioManifestEntry>(); // id-lang -> entry
  private lastFetchTime = 0;
  private pendingUpdates: Map<string, Partial<AudioManifestEntry>> = new Map();
  private updateTimeout: ReturnType<typeof setTimeout> | null = null;
  private subscribers: Set<() => void> = new Set();

  // ─── PUBLIC API ──────────────────────────────────────────────────────

  /**
   * Get the full manifest, loading it if necessary
   */
  async getManifest(): Promise<AudioManifest> {
    if (this.manifest && Date.now() - this.lastFetchTime < CACHE_TTL) {
      return this.manifest;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.loadManifest();
    return this.loadingPromise;
  }

  /**
   * Subscribe to manifest changes
   */
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // ─── ENTRY LOOKUP ────────────────────────────────────────────────────

  /**
   * Get entry by ID (all languages)
   */
  async getEntry(id: string): Promise<AudioManifestEntry | null> {
    const manifest = await this.getManifest();
    return manifest.entries[id] ?? null;
  }

  /**
   * Get entry by ID and language
   */
  async getEntryByLang(id: string, lang: LanguageCode): Promise<AudioManifestEntry | null> {
    const key = `${id}-${lang}`;

    if (this.entryCache.has(key)) {
      return this.entryCache.get(key)!;
    }

    const manifest = await this.getManifest();
    const entry = manifest.entries[id];

    if (entry && entry.lang === lang) {
      this.entryCache.set(key, entry);
      return entry;
    }

    return null;
  }

  /**
   * Get all entries for a language
   */
  async getEntriesByLang(lang: LanguageCode): Promise<AudioManifestEntry[]> {
    const manifest = await this.getManifest();
    const result: AudioManifestEntry[] = [];

    for (const entry of Object.values(manifest.entries)) {
      if (entry.lang === lang) {
        result.push(entry);
      }
    }

    return result;
  }

  /**
   * Get all audio IDs for a language
   */
  async getAudioIds(lang: LanguageCode): Promise<string[]> {
    const entries = await this.getEntriesByLang(lang);
    return entries.map((e) => e.id);
  }

  /**
   * Check if audio exists (fast check)
   */
  hasAudio(id: string, lang: LanguageCode): boolean | null {
    const key = `${id}-${lang}`;

    if (this.statusCache.has(key)) {
      return this.statusCache.get(key)!;
    }

    if (this.manifest) {
      const entry = this.manifest.entries[id];
      if (entry && entry.lang === lang) {
        const exists = entry.status === AudioStatus.READY;
        this.statusCache.set(key, exists);
        return exists;
      }
    }

    return null;
  }

  /**
   * Check if audio exists with HEAD fallback
   */
  async checkAudioExists(id: string, lang: LanguageCode): Promise<boolean> {
    const manifestResult = this.hasAudio(id, lang);
    if (manifestResult !== null) {
      return manifestResult;
    }

    const paddedId = id.padStart(6, "0");
    const url = `/audio/${lang}/${paddedId}.mp3`;

    try {
      const response = await fetch(url, { method: "HEAD" });
      const exists = response.ok;
      this.statusCache.set(`${id}-${lang}`, exists);
      return exists;
    } catch {
      this.statusCache.set(`${id}-${lang}`, false);
      return false;
    }
  }

  /**
   * Batch check audio existence
   */
  async batchCheckAudioExists(items: Array<{ id: string; lang: LanguageCode }>): Promise<Record<string, boolean>> {
    const result: Record<string, boolean> = {};
    const toCheck: Array<{ id: string; lang: LanguageCode; key: string }> = [];

    for (const { id, lang } of items) {
      const key = `${id}-${lang}`;
      const exists = this.hasAudio(id, lang);
      if (exists !== null) {
        result[key] = exists;
      } else {
        toCheck.push({ id, lang, key });
      }
    }

    if (toCheck.length > 0) {
      const promises = toCheck.map(async ({ id, lang, key }) => {
        const paddedId = id.padStart(6, "0");
        const url = `/audio/${lang}/${paddedId}.mp3`;
        try {
          const response = await fetch(url, { method: "HEAD" });
          const exists = response.ok;
          this.statusCache.set(key, exists);
          result[key] = exists;
        } catch {
          this.statusCache.set(key, false);
          result[key] = false;
        }
      });

      await Promise.all(promises);
    }

    return result;
  }

  // ─── STATISTICS ──────────────────────────────────────────────────────

  /**
   * Get statistics for a language
   */
  async getStats(lang: LanguageCode): Promise<{ total: number; ready: number; missing: number; unknown: number }> {
    const manifest = await this.getManifest();
    const stats = manifest.stats[lang];

    if (stats) {
      return {
        total: stats.total,
        ready: stats.ready,
        missing: stats.missing,
        unknown: stats.total - stats.ready - stats.missing,
      };
    }

    return { total: 0, ready: 0, missing: 0, unknown: 0 };
  }

  /**
   * Get all statistics summary
   */
  async getStatsSummary(): Promise<Record<LanguageCode, { total: number; ready: number; missing: number; unknown: number }>> {
    const manifest = await this.getManifest();
    const result: Record<LanguageCode, any> = {} as any;

    for (const lang of Object.keys(manifest.stats) as LanguageCode[]) {
      const stats = manifest.stats[lang];
      result[lang] = {
        total: stats.total,
        ready: stats.ready,
        missing: stats.missing,
        unknown: stats.total - stats.ready - stats.missing,
      };
    }

    return result;
  }

  /**
   * Get missing audio IDs
   */
  async getMissingAudio(lang?: LanguageCode): Promise<string[]> {
    const manifest = await this.getManifest();
    const missing: string[] = [];

    for (const [id, entry] of Object.entries(manifest.entries)) {
      if (entry.status === AudioStatus.MISSING || entry.status === AudioStatus.UNKNOWN) {
        if (!lang || entry.lang === lang) {
          missing.push(id);
        }
      }
    }

    return missing;
  }

  /**
   * Get audio files that need generation
   */
  async getNeedGeneration(lang?: LanguageCode): Promise<string[]> {
    const manifest = await this.getManifest();
    const needGen: string[] = [];

    for (const [id, entry] of Object.entries(manifest.entries)) {
      if (entry.status !== AudioStatus.READY) {
        if (!lang || entry.lang === lang) {
          needGen.push(id);
        }
      }
    }

    return needGen;
  }

  // ─── MANIFEST LOADING ───────────────────────────────────────────────

  private async loadManifest(): Promise<AudioManifest> {
    try {
      const response = await fetch(MANIFEST_URL);
      if (!response.ok) {
        return this.createEmptyManifest();
      }

      const data = await response.json();

      if (data.schemaVersion && data.schemaVersion > MANIFEST_SCHEMA_VERSION) {
        console.warn("[AudioManifest] Manifest schema newer than expected");
      }

      this.manifest = this.normalizeManifest(data);
      this.lastFetchTime = Date.now();
      this.loadingPromise = null;

      this.rebuildCache();
      this.notifySubscribers();

      return this.manifest;
    } catch {
      console.warn("[AudioManifest] Failed to load manifest, using empty");
      this.loadingPromise = null;
      return this.createEmptyManifest();
    }
  }

  // ✅ FIXED: createEmptyManifest-ը ավելացված cached-ով
  private createEmptyManifest(): AudioManifest {
    return {
      schemaVersion: MANIFEST_SCHEMA_VERSION,
      lastUpdated: new Date().toISOString(),
      totalEntries: 0,
      entries: {},
      stats: {
        hy: { total: 0, ready: 0, missing: 0, cached: 0 },
        en: { total: 0, ready: 0, missing: 0, cached: 0 },
        ru: { total: 0, ready: 0, missing: 0, cached: 0 },
      },
    };
  }

  private normalizeManifest(data: Record<string, unknown>): AudioManifest {
    const entries: Record<string, AudioManifestEntry> = {};

    if (data.entries) {
      Object.assign(entries, data.entries);
    } else {
      for (const [id, value] of Object.entries(data)) {
        if (id === "schemaVersion" || id === "lastUpdated" || id === "stats") continue;
        if (typeof value === "object" && value !== null) {
          entries[id] = this.normalizeEntry(id, value as Record<string, unknown>);
        }
      }
    }

    const stats = this.computeStats(entries);

    return {
      schemaVersion: (data.schemaVersion as number) ?? MANIFEST_SCHEMA_VERSION,
      lastUpdated: (data.lastUpdated as string) ?? new Date().toISOString(),
      totalEntries: Object.keys(entries).length,
      entries,
      stats,
    };
  }

  private normalizeEntry(id: string, data: Record<string, unknown>): AudioManifestEntry {
    return {
      id,
      text: (data.text as string) ?? "",
      lang: (data.lang as LanguageCode) ?? "hy",
      filename: (data.filename as string) ?? `${id.padStart(6, "0")}.mp3`,
      duration: data.duration as number | undefined,
      provider: (data.provider as AudioProviderType) ?? AudioProviderType.MP3,
      version: (data.version as number) ?? 1,
      checksum: data.checksum as string | undefined,
      generatedAt: data.generatedAt as string | undefined,
      size: data.size as number | undefined,
      sampleRate: data.sampleRate as number | undefined,
      status: (data.status as AudioStatus) ?? AudioStatus.UNKNOWN,
    };
  }

  // ✅ FIXED: computeStats-ը ավելացված cached-ով
  private computeStats(entries: Record<string, AudioManifestEntry>): AudioManifest["stats"] {
    const stats: AudioManifest["stats"] = {
      hy: { total: 0, ready: 0, missing: 0, cached: 0 },
      en: { total: 0, ready: 0, missing: 0, cached: 0 },
      ru: { total: 0, ready: 0, missing: 0, cached: 0 },
    };

    for (const entry of Object.values(entries)) {
      const langStats = stats[entry.lang] ?? stats.hy;
      langStats.total++;
      if (entry.status === AudioStatus.READY) {
        langStats.ready++;
      } else if (entry.status === AudioStatus.MISSING) {
        langStats.missing++;
      } else if (entry.status === AudioStatus.CACHED) {
        langStats.cached++;
      }
    }

    return stats;
  }

  // ─── CACHE MANAGEMENT ───────────────────────────────────────────────

  private rebuildCache(): void {
    this.statusCache.clear();
    this.entryCache.clear();

    if (!this.manifest) return;

    for (const [id, entry] of Object.entries(this.manifest.entries)) {
      const key = `${id}-${entry.lang}`;
      this.statusCache.set(key, entry.status === AudioStatus.READY);
      this.entryCache.set(key, entry);
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.manifest = null;
    this.statusCache.clear();
    this.entryCache.clear();
    this.lastFetchTime = 0;
    this.loadingPromise = null;
  }

  /**
   * Invalidate a specific entry
   */
  invalidateEntry(id: string, lang: LanguageCode): void {
    const key = `${id}-${lang}`;
    this.statusCache.delete(key);
    this.entryCache.delete(key);

    if (this.manifest) {
      const entry = this.manifest.entries[id];
      if (entry && entry.lang === lang) {
        entry.status = AudioStatus.UNKNOWN;
        this.manifest.stats = this.computeStats(this.manifest.entries);
        this.notifySubscribers();
      }
    }
  }

  // ─── UPDATES ─────────────────────────────────────────────────────────

  /**
   * Update an entry (with debounced save)
   */
  updateEntry(id: string, updates: Partial<AudioManifestEntry>): void {
    this.pendingUpdates.set(id, updates);

    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      this.applyUpdates();
    }, 500);
  }

  /**
   * Apply pending updates immediately
   */
  private applyUpdates(): void {
    if (!this.manifest) return;

    for (const [id, updates] of this.pendingUpdates) {
      const existing = this.manifest.entries[id] ?? {
        id,
        text: "",
        lang: "hy" as LanguageCode,
        filename: `${id.padStart(6, "0")}.mp3`,
        provider: AudioProviderType.MP3,
        version: 1,
        status: AudioStatus.UNKNOWN,
      };

      this.manifest.entries[id] = { ...existing, ...updates };

      const key = `${id}-${existing.lang}`;
      if (updates.status) {
        this.statusCache.set(key, updates.status === AudioStatus.READY);
      }
      if (updates.lang) {
        const newKey = `${id}-${updates.lang}`;
        if (updates.status) {
          this.statusCache.set(newKey, updates.status === AudioStatus.READY);
        }
      }
      this.entryCache.set(key, this.manifest.entries[id]);
    }

    this.manifest.stats = this.computeStats(this.manifest.entries);
    this.manifest.lastUpdated = new Date().toISOString();

    this.pendingUpdates.clear();
    this.updateTimeout = null;
    this.notifySubscribers();
  }

  // ─── NOTIFICATIONS ───────────────────────────────────────────────────

  private notifySubscribers(): void {
    for (const callback of this.subscribers) {
      try {
        callback();
      } catch {
        // Ignore subscriber errors
      }
    }
  }

  // ─── DEBUGGING ──────────────────────────────────────────────────────

  /**
   * Get debug information
   */
  async debugInfo(): Promise<{
    manifestLoaded: boolean;
    entriesCount: number;
    cacheSize: number;
    pendingUpdates: number;
    lastFetch: number;
  }> {
    const manifest = await this.getManifest();
    return {
      manifestLoaded: !!this.manifest,
      entriesCount: manifest.totalEntries,
      cacheSize: this.statusCache.size,
      pendingUpdates: this.pendingUpdates.size,
      lastFetch: this.lastFetchTime,
    };
  }

  /**
   * Get language folder path
   */
  getLanguageFolder(lang: LanguageCode): string {
    return LANGUAGE_CONFIG[lang]?.folder ?? lang;
  }

  /**
   * Get audio URL for an entry
   */
  getAudioUrl(id: string, lang: LanguageCode): string {
    const paddedId = id.padStart(6, "0");
    const folder = this.getLanguageFolder(lang);
    return `/audio/${folder}/${paddedId}.mp3`;
  }
}

// ─── SINGLETON ─────────────────────────────────────────────────────────

export const audioManifest = new AudioManifestManager();

// ─── RE-EXPORT TYPES ──────────────────────────────────────────────────

export type { AudioManifest, AudioManifestEntry };
export { AudioStatus };