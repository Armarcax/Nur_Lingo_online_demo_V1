// src/lib/audio/WavClient.ts
// NUR Lingo — WAV.am API Client (Client-side)
// ✅ Online only — No file saving
// ✅ In-memory Blob cache (fast session)
// ✅ IndexedDB persistent cache (cross-session, offline-friendly)
// ✅ URL.createObjectURL for instant playback on mobile

import {
  getCachedAudio,
  setCachedAudio,
  clearAudioCache,
  getCacheStats,
} from "./wavCache";

export class WavClient {
  private apiUrl: string;
  private memCache: Map<string, Blob> = new Map();
  private objectUrls: Map<string, string> = new Map();
  private preloading: Set<string> = new Set();

  constructor(apiUrl: string = "") {
    this.apiUrl =
      apiUrl ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000");
  }

  private cacheKey(text: string, voice: string): string {
    return `${voice}::${text}`;
  }

  private getObjectUrl(key: string, blob: Blob): string {
    let url = this.objectUrls.get(key);
    if (!url) {
      url = URL.createObjectURL(blob);
      this.objectUrls.set(key, url);
    }
    return url;
  }

  hasCached(text: string, voice?: string): boolean {
    return this.memCache.has(this.cacheKey(text, voice || "Ani"));
  }

  // ─── GET AUDIO (3-level cache) ────────────────────────────────

  private async getAudioBlob(text: string, voice: string): Promise<Blob> {
    const key = this.cacheKey(text, voice);

    // 1. In-memory Blob (0ms)
    const memBlob = this.memCache.get(key);
    if (memBlob) {
      console.log(`⚡ [WavClient] Memory HIT: "${text.slice(0, 30)}..."`);
      return memBlob;
    }

    // 2. IndexedDB (5-20ms)
    try {
      const idbBlob = await getCachedAudio(key);
      if (idbBlob) {
        console.log(`💾 [WavClient] IndexedDB HIT: "${text.slice(0, 30)}..."`);
        this.memCache.set(key, idbBlob);
        return idbBlob;
      }
    } catch {}

    // 3. Network (1-3s)
    console.log(
      `📤 [WavClient] Network fetch: "${text.slice(0, 30)}..." | voice: ${voice}`
    );

    const response = await fetch(
      `${this.apiUrl}/api/generate-wav?format=binary`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `API error: ${response.status}`);
    }

    const blob = await response.blob();
    if (blob.size < 100) {
      throw new Error("Audio too small");
    }

    // Store in both caches (async)
    this.memCache.set(key, blob);
    setCachedAudio(key, blob, { voice, text }).catch(() => {});

    console.log(
      `✅ [WavClient] Fetched & cached: "${text.slice(0, 30)}..." (${blob.size}B, total: ${this.memCache.size})`
    );
    return blob;
  }

  // ─── GENERATE (backwards compatible) ────────────────────────

  async generateAudio(
    text: string,
    options?: { voice?: string; format?: string }
  ): Promise<{
    id: string;
    path: string;
    duration: number;
    audioData?: string;
    audioUrl?: string;
  }> {
    const voice = options?.voice || "Ani";
    const blob = await this.getAudioBlob(text, voice);
    const key = this.cacheKey(text, voice);
    const url = this.getObjectUrl(key, blob);

    return {
      id: `wav_${key.slice(0, 20)}`,
      path: `${key.slice(0, 20)}.mp3`,
      duration: 1,
      audioUrl: url,
    };
  }

  // ─── PRELOAD (parallel, limited) ────────────────────────────

  async preloadPrompt(text: string, voice?: string): Promise<void> {
    const effectiveVoice = voice || "Ani";
    const key = this.cacheKey(text, effectiveVoice);

    if (this.memCache.has(key) || this.preloading.has(key)) return;

    this.preloading.add(key);
    try {
      await this.getAudioBlob(text, effectiveVoice);
    } catch (error) {
      console.warn(`⚠️ [WavClient] Preload failed:`, error);
    } finally {
      this.preloading.delete(key);
    }
  }

  async preloadBatch(texts: string[], voice?: string): Promise<void> {
    const effectiveVoice = voice || "Ani";
    if (texts.length === 0) return;
    console.log(`📦 [WavClient] Preloading ${texts.length} items...`);

    // ✅ Parallel with concurrency limit (3x faster than sequential)
    const CONCURRENCY = 3;
    for (let i = 0; i < texts.length; i += CONCURRENCY) {
      const batch = texts.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map((t) => this.preloadPrompt(t, effectiveVoice))
      );
    }

    console.log(`✅ [WavClient] Batch preload complete`);
  }

  // ─── PLAYBACK (instant via object URL) ──────────────────────

  async playGeneratedAudio(text: string, voice?: string): Promise<void> {
    const effectiveVoice = voice || "Ani";
    console.log(
      `🔊 [WavClient] Playing: "${text.slice(0, 30)}..." | voice: ${effectiveVoice}`
    );

    const blob = await this.getAudioBlob(text, effectiveVoice);
    const key = this.cacheKey(text, effectiveVoice);
    const url = this.getObjectUrl(key, blob);

    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audio.volume = 1;
      audio.onended = () => {
        console.log(`✅ [WavClient] Playback finished`);
        resolve();
      };
      audio.onerror = (e) => {
        console.error("❌ Audio playback error:", e);
        reject(new Error("Playback error"));
      };
      audio.play().catch(reject);
    });
  }

  async playPrompt(text: string, pair: string, voice?: string): Promise<void> {
    return this.playGeneratedAudio(text, voice);
  }

  async playAnswer(text: string, pair: string, voice?: string): Promise<void> {
    return this.playGeneratedAudio(text, voice);
  }

  // ─── LEGACY (kept for compatibility) ────────────────────────

  async downloadAudio(path: string): Promise<Blob> {
    return this.createSilentAudio();
  }

  private createSilentAudio(): Blob {
    const wavHeader = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56,
      0x45, 0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00,
      0x01, 0x00, 0x44, 0xac, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00, 0x02,
      0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61, 0x00, 0x00, 0x00, 0x00,
    ]);
    return new Blob([wavHeader], { type: "audio/wav" });
  }

  // ─── STATS & CLEANUP ────────────────────────────────────────

  getCacheSize(): number {
    return this.memCache.size;
  }

  async getPersistentCacheStats(): Promise<{ count: number; sizeMB: number }> {
    return getCacheStats();
  }

  clearCache(): void {
    for (const url of this.objectUrls.values()) {
      URL.revokeObjectURL(url);
    }
    this.objectUrls.clear();
    this.memCache.clear();
    console.log("🗑️ [WavClient] Memory cache cleared");
  }

  async clearAllCaches(): Promise<void> {
    this.clearCache();
    await clearAudioCache();
    console.log("🗑️ [WavClient] All caches cleared (memory + IndexedDB)");
  }

  // ─── VOICES ─────────────────────────────────────────────────

  getAvailableVoices(): string[] {
    return ["Ani", "Avet", "Areg", "Luse", "Tigran"];
  }

  getAvailablePairs(): string[] {
    return ["hy-en", "hy-ru"];
  }

  getDefaultVoiceForLanguage(lang: string): string {
    return "Ani";
  }

  getVoicesForLanguage(lang: string): string[] {
    return ["Ani", "Avet", "Areg", "Luse", "Tigran"];
  }

  async getRemainingCredits(): Promise<number | null> {
    try {
      const response = await fetch(`${this.apiUrl}/api/credits`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.credits || null;
    } catch {
      return null;
    }
  }
}

// ─── SINGLETON ──────────────────────────────────────────────────

let wavClientInstance: WavClient | null = null;

export function getWavClient(): WavClient | null {
  if (!wavClientInstance) {
    try {
      const apiUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";
      wavClientInstance = new WavClient(apiUrl);
      console.log(
        "✅ [WavClient] Singleton initialized (Memory + IndexedDB cache)"
      );
    } catch (error) {
      console.error("❌ [WavClient] Failed to initialize:", error);
      return null;
    }
  }
  return wavClientInstance;
}

export default WavClient;