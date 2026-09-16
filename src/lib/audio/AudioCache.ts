// src/lib/audio/AudioCache.ts
// NUR Lingo Audio Engine — Intelligent Audio Caching with IndexedDB Support

import { AudioCacheStats } from "./AudioTypes";

// ─── INDEXED DB HELPERS ───

const DB_NAME = "NurLingoAudioCache";
const DB_VERSION = 1;
const STORE_NAME = "audioFiles";

interface DBCacheEntry {
  key: string;
  data: Blob;
  size: number;
  timestamp: number;
}

/**
 * AudioCache — LRU Cache for audio elements with IndexedDB persistence
 */
export class AudioCache {
  private memoryCache = new Map<string, CacheEntry>();
  private loading = new Map<string, Promise<HTMLAudioElement>>();
  private headChecks = new Map<string, Promise<boolean>>();
  private headCheckCache = new Map<string, boolean>();
  private db: IDBDatabase | null = null;
  private dbReady: Promise<void> | null = null;

  private hits = 0;
  private misses = 0;
  private maxSizeBytes: number;
  private maxEntries: number;
  private useIndexedDB: boolean;

  constructor(options?: { maxSizeMB?: number; maxEntries?: number; useIndexedDB?: boolean }) {
    this.maxSizeBytes = (options?.maxSizeMB ?? 50) * 1024 * 1024;
    this.maxEntries = options?.maxEntries ?? 500;
    this.useIndexedDB = options?.useIndexedDB !== false;

    // Initialize IndexedDB
    if (this.useIndexedDB && typeof window !== "undefined") {
      this.dbReady = this.initDB();
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // INDEXED DB INITIALIZATION
  // ══════════════════════════════════════════════════════════════════════

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        this.useIndexedDB = false;
        resolve();
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
          store.createIndex("timestamp", "timestamp");
          store.createIndex("size", "size");
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.db.onerror = () => {
          // Handle DB errors gracefully
          this.useIndexedDB = false;
        };
        resolve();
      };

      request.onerror = () => {
        this.useIndexedDB = false;
        resolve();
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase | null> {
    if (this.dbReady) {
      await this.dbReady;
    }
    return this.db;
  }

  // ══════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Get audio from memory cache or IndexedDB
   */
  async get(key: string): Promise<HTMLAudioElement | undefined> {
    // Check memory cache first
    const memEntry = this.memoryCache.get(key);
    if (memEntry) {
      memEntry.lastAccessed = Date.now();
      memEntry.hits++;
      this.hits++;
      return memEntry.audio;
    }

    // Check IndexedDB
    if (this.useIndexedDB) {
      try {
        const db = await this.ensureDB();
        if (db) {
          const blob = await this.getFromDB(key);
          if (blob) {
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audio.preload = "auto";
            await new Promise((resolve) => {
              audio.oncanplaythrough = resolve;
              audio.onerror = resolve;
              audio.load();
            });
            this.set(key, audio, blob.size);
            this.hits++;
            return audio;
          }
        }
      } catch {
        // DB error - fall through
      }
    }

    this.misses++;
    return undefined;
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    if (this.memoryCache.has(key)) return true;
    if (this.useIndexedDB) {
      try {
        const db = await this.ensureDB();
        if (db) {
          return this.hasInDB(key);
        }
      } catch {
        // DB error - fall through
      }
    }
    return false;
  }

  /**
   * Set audio in cache (memory + IndexedDB)
   */
  async set(key: string, audio: HTMLAudioElement, size?: number): Promise<void> {
    const estimatedSize = size ?? 50 * 1024;

    // Memory cache
    this.evictIfNeeded(estimatedSize);
    this.memoryCache.set(key, {
      audio,
      url: key,
      size: estimatedSize,
      lastAccessed: Date.now(),
      hits: 0,
    });

    // IndexedDB
    if (this.useIndexedDB && audio.src && !audio.src.startsWith("blob:")) {
      try {
        const response = await fetch(audio.src);
        const blob = await response.blob();
        await this.saveToDB(key, blob);
      } catch {
        // Silently fail DB storage
      }
    }
  }

  /**
   * Get or load audio with deduplication
   */
  async getOrLoad(url: string, signal?: AbortSignal): Promise<HTMLAudioElement> {
    // Check cache first
    const cached = await this.get(url);
    if (cached) {
      return cached;
    }

    // Deduplicate concurrent loads
    if (this.loading.has(url)) {
      return this.loading.get(url)!;
    }

    // Start loading
    const promise = this.loadAudio(url, signal);
    this.loading.set(url, promise);

    try {
      const audio = await promise;
      await this.set(url, audio);
      return audio;
    } finally {
      this.loading.delete(url);
    }
  }

  /**
   * Load audio element
   */
  private async loadAudio(url: string, signal?: AbortSignal): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = url;

      const cleanup = () => {
        audio.oncanplaythrough = null;
        audio.onerror = null;
      };

      audio.oncanplaythrough = () => {
        cleanup();
        resolve(audio);
      };

      audio.onerror = () => {
        cleanup();
        reject(new Error(`Failed to load audio: ${url}`));
      };

      if (signal) {
        signal.addEventListener("abort", () => {
          cleanup();
          audio.src = "";
          reject(new Error("Aborted"));
        });
      }

      audio.load();
    });
  }

  /**
   * Check if an MP3 file exists via HEAD request (cached)
   */
  async checkExists(url: string): Promise<boolean> {
    if (this.headCheckCache.has(url)) {
      return this.headCheckCache.get(url)!;
    }

    if (this.headChecks.has(url)) {
      return this.headChecks.get(url)!;
    }

    const promise = (async (): Promise<boolean> => {
      try {
        const response = await fetch(url, { method: "HEAD" });
        const exists = response.ok;
        this.headCheckCache.set(url, exists);
        return exists;
      } catch {
        this.headCheckCache.set(url, false);
        return false;
      } finally {
        this.headChecks.delete(url);
      }
    })();

    this.headChecks.set(url, promise);
    return promise;
  }

  /**
   * Prefetch multiple URLs
   */
  async prefetch(urls: string[]): Promise<void> {
    const promises = urls.slice(0, 10).map(async (url) => {
      try {
        const exists = await this.checkExists(url);
        if (exists) {
          await this.getOrLoad(url);
        }
      } catch {
        // Silently fail prefetch
      }
    });
    await Promise.allSettled(promises);
  }

  // ══════════════════════════════════════════════════════════════════════
  // INDEXED DB OPERATIONS
  // ══════════════════════════════════════════════════════════════════════

  private async getFromDB(key: string): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
      const db = this.db;
      if (!db) {
        resolve(null);
        return;
      }

      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          const entry = request.result as DBCacheEntry | undefined;
          if (entry) {
            resolve(entry.data);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  private async saveToDB(key: string, blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = this.db;
      if (!db) {
        resolve();
        return;
      }

      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        const entry: DBCacheEntry = {
          key,
          data: blob,
          size: blob.size,
          timestamp: Date.now(),
        };

        const request = store.put(entry);
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  private async hasInDB(key: string): Promise<boolean> {
    return new Promise((resolve) => {
      const db = this.db;
      if (!db) {
        resolve(false);
        return;
      }

      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.getKey(key);

        request.onsuccess = () => {
          resolve(request.result !== undefined);
        };
        request.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  private async deleteFromDB(key: string): Promise<void> {
    return new Promise((resolve) => {
      const db = this.db;
      if (!db) {
        resolve();
        return;
      }

      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.delete(key);
        resolve();
      } catch {
        resolve();
      }
    });
  }

  private async getAllKeysFromDB(): Promise<string[]> {
    return new Promise((resolve) => {
      const db = this.db;
      if (!db) {
        resolve([]);
        return;
      }

      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAllKeys();

        request.onsuccess = () => {
          resolve(request.result as string[]);
        };
        request.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // CACHE MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════

  private evictIfNeeded(neededSize: number): void {
    while (this.memoryCache.size >= this.maxEntries) {
      this.evictLRU();
    }
    while (this.totalSize + neededSize > this.maxSizeBytes && this.memoryCache.size > 0) {
      this.evictLRU();
    }
  }

  private evictLRU(): void {
    let oldest: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldest = key;
      }
    }

    if (oldest) {
      const entry = this.memoryCache.get(oldest);
      if (entry) {
        if (entry.audio.src.startsWith("blob:")) {
          URL.revokeObjectURL(entry.audio.src);
        }
        entry.audio.src = "";
      }
      this.memoryCache.delete(oldest);
      // Also remove from DB
      this.deleteFromDB(oldest).catch(() => {});
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // STATISTICS
  // ══════════════════════════════════════════════════════════════════════

  get totalSize(): number {
    let total = 0;
    for (const entry of this.memoryCache.values()) {
      total += entry.size;
    }
    return total;
  }

  get totalEntries(): number {
    return this.memoryCache.size;
  }

  async getStats(): Promise<AudioCacheStats> {
    const totalRequests = this.hits + this.misses;
    const dbSize = this.useIndexedDB ? await this.getDBSize() : 0;

    return {
      entries: this.memoryCache.size,
      totalSize: this.totalSize + dbSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: totalRequests > 0 ? this.hits / totalRequests : 0,
      dbEntries: this.useIndexedDB ? await this.getDBCount() : 0,
      dbSize: dbSize,
    };
  }

  private async getDBSize(): Promise<number> {
    try {
      const db = await this.ensureDB();
      if (!db) return 0;
      const keys = await this.getAllKeysFromDB();
      let total = 0;
      for (const key of keys) {
        const blob = await this.getFromDB(key);
        if (blob) total += blob.size;
      }
      return total;
    } catch {
      return 0;
    }
  }

  private async getDBCount(): Promise<number> {
    try {
      const keys = await this.getAllKeysFromDB();
      return keys.length;
    } catch {
      return 0;
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // CLEANUP
  // ══════════════════════════════════════════════════════════════════════

  async clear(): Promise<void> {
    // Clear memory cache
    for (const entry of this.memoryCache.values()) {
      if (entry.audio.src.startsWith("blob:")) {
        URL.revokeObjectURL(entry.audio.src);
      }
      entry.audio.src = "";
    }
    this.memoryCache.clear();
    this.loading.clear();
    this.headChecks.clear();
    this.headCheckCache.clear();
    this.hits = 0;
    this.misses = 0;

    // Clear IndexedDB
    if (this.useIndexedDB) {
      try {
        const db = await this.ensureDB();
        if (db) {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          store.clear();
        }
      } catch {
        // DB error - ignore
      }
    }
  }

  async delete(key: string): Promise<boolean> {
    const memDeleted = this.memoryCache.delete(key);
    let dbDeleted = false;
    if (this.useIndexedDB) {
      try {
        await this.deleteFromDB(key);
        dbDeleted = true;
      } catch {
        // DB error - ignore
      }
    }
    return memDeleted || dbDeleted;
  }

  get size(): number {
    return this.memoryCache.size;
  }

  // ══════════════════════════════════════════════════════════════════════
  // DEGUGGING
  // ══════════════════════════════════════════════════════════════════════

  async debugInfo(): Promise<{
    memory: { entries: number; totalSize: number };
    indexedDB: { entries: number; totalSize: number };
    hits: number;
    misses: number;
    hitRate: number;
  }> {
    const memStats = {
      entries: this.memoryCache.size,
      totalSize: this.totalSize,
    };

    const dbEntries = await this.getDBCount();
    const dbSize = await this.getDBSize();

    const totalRequests = this.hits + this.misses;

    return {
      memory: memStats,
      indexedDB: { entries: dbEntries, totalSize: dbSize },
      hits: this.hits,
      misses: this.misses,
      hitRate: totalRequests > 0 ? this.hits / totalRequests : 0,
    };
  }
}

// ─── SINGLETON INSTANCE ───
export const audioCache = new AudioCache();

// ─── TYPES ───

interface CacheEntry {
  audio: HTMLAudioElement;
  url: string;
  size: number;
  lastAccessed: number;
  hits: number;
}