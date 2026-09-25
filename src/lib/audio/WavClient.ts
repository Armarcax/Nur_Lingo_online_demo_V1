// src/lib/audio/WavClient.ts
// NUR Lingo — WAV.am API Client (Client-side)
// ✅ Online only - No file saving
// ✅ In-memory cache (same text+voice = instant replay)

export class WavClient {
  private apiUrl: string;
  private cache: Map<string, string> = new Map(); // key: text|voice → base64 audio
  private preloading: Set<string> = new Set(); // keys currently being preloaded

  constructor(apiUrl: string = "") {
    this.apiUrl = apiUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  }

  // ─── CACHE HELPERS ──────────────────────────────────────────────

  private cacheKey(text: string, voice: string): string {
    return `${voice}::${text}`;
  }

  hasCached(text: string, voice?: string): boolean {
    return this.cache.has(this.cacheKey(text, voice || "Ani"));
  }

  // ─── GENERATE AUDIO (ONLINE ONLY, NO SAVE) ──────────────────────

  async generateAudio(
    text: string,
    options?: { voice?: string; format?: string }
  ): Promise<{ id: string; path: string; duration: number; audioData?: string; audioUrl?: string }> {
    const voice = options?.voice || "Ani";
    const key = this.cacheKey(text, voice);

    // ✅ CACHE HIT — return instantly
    if (this.cache.has(key)) {
      console.log(`⚡ [WavClient] Cache HIT: "${text.slice(0, 30)}..."`);
      return {
        id: `wav_cached`,
        path: `cached.mp3`,
        duration: 1,
        audioData: this.cache.get(key)!,
      };
    }

    console.log(`📤 [WavClient] generateAudio (cache miss):`, { text: text.slice(0, 30), voice });

    try {
      const response = await fetch(`${this.apiUrl}/api/generate-wav`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice,
          format: options?.format || "mp3",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      // ✅ Store in cache
      const audioData = data.audio || data.audioUrl || null;
      if (audioData) {
        this.cache.set(key, audioData);
        console.log(`💾 [WavClient] Cached: "${text.slice(0, 30)}..." (total cached: ${this.cache.size})`);
      }
      
      return {
        id: `wav_${Date.now()}`,
        path: data.path || `${Date.now()}.mp3`,
        duration: data.duration || 1,
        audioData: audioData,
        audioUrl: data.audioUrl || null,
      };
    } catch (error) {
      console.error('❌ Generate audio failed:', error);
      throw error;
    }
  }

  // ─── PRELOAD (background, no playback) ──────────────────────────

  async preloadPrompt(text: string, voice?: string): Promise<void> {
    const effectiveVoice = voice || "Ani";
    const key = this.cacheKey(text, effectiveVoice);

    // Skip if already cached or being preloaded
    if (this.cache.has(key) || this.preloading.has(key)) {
      return;
    }

    this.preloading.add(key);

    try {
      console.log(`🎯 [WavClient] Preloading: "${text.slice(0, 30)}..."`);
      await this.generateAudio(text, { voice: effectiveVoice });
      console.log(`✅ [WavClient] Preloaded: "${text.slice(0, 30)}..."`);
    } catch (error) {
      console.warn(`⚠️ [WavClient] Preload failed:`, error);
    } finally {
      this.preloading.delete(key);
    }
  }

  async preloadBatch(texts: string[], voice?: string): Promise<void> {
    const effectiveVoice = voice || "Ani";
    console.log(`📦 [WavClient] Preloading batch of ${texts.length} items...`);
    
    // Preload sequentially to avoid overwhelming the server
    for (const text of texts) {
      await this.preloadPrompt(text, effectiveVoice);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ [WavClient] Batch preload complete`);
  }

    // ─── DOWNLOAD AUDIO (kept for backwards compatibility) ────────────

  async downloadAudio(path: string): Promise<Blob> {
    console.warn('⚠️ [WavClient] downloadAudio called - returning silent audio');
    return this.createSilentAudio();
  }

  private createSilentAudio(): Blob {
    const wavHeader = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00,
      0x57, 0x41, 0x56, 0x45, 0x66, 0x6D, 0x74, 0x20,
      0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
      0x44, 0xAC, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00,
      0x02, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61,
      0x00, 0x00, 0x00, 0x00,
    ]);
    return new Blob([wavHeader], { type: 'audio/wav' });
  }

  // ─── PLAY AUDIO ──────────────────────────────────────────────────

  async playGeneratedAudio(text: string, voice?: string, type?: string, pair?: string): Promise<void> {
    try {
      const effectiveVoice = voice || "Ani";
      
      console.log(`🔊 [WavClient] playGeneratedAudio: "${text.slice(0, 30)}..." | voice: ${effectiveVoice}`);
      
      const result = await this.generateAudio(text, { 
        voice: effectiveVoice,
      });
      
      if (result.audioData) {
        let audioUrl = result.audioData;
        if (!audioUrl.startsWith('data:audio')) {
          audioUrl = `data:audio/mp3;base64,${audioUrl}`;
        }
        
        return new Promise((resolve, reject) => {
          const audio = new Audio(audioUrl);
          audio.volume = 1;
          
          audio.onended = () => {
            console.log(`✅ [WavClient] Playback finished`);
            resolve();
          };
          audio.onerror = (e) => {
            console.error('❌ Audio playback error:', e);
            reject(new Error("Playback error"));
          };
          
          audio.play().catch((err) => {
            console.error('❌ Play failed:', err);
            reject(err);
          });
        });
      } else if (result.audioUrl) {
        return new Promise((resolve, reject) => {
          const audio = new Audio(result.audioUrl);
          audio.volume = 1;
          
          audio.onended = () => {
            console.log(`✅ [WavClient] Playback finished`);
            resolve();
          };
          audio.onerror = (e) => {
            console.error('❌ Audio playback error:', e);
            reject(new Error("Playback error"));
          };
          
          audio.play().catch((err) => {
            console.error('❌ Play failed:', err);
            reject(err);
          });
        });
      } else {
        throw new Error('No audio data received');
      }
    } catch (error) {
      console.error('❌ WAV playback failed:', error);
      throw error;
    }
  }

  // ─── PLAY PROMPT ────────────────────────────────────────────────

  async playPrompt(text: string, pair: string, voice?: string): Promise<void> {
    console.log(`🎯 [WavClient] playPrompt: "${text.slice(0, 30)}..." | pair: ${pair}`);
    return this.playGeneratedAudio(text, voice);
  }

  // ─── PLAY ANSWER ────────────────────────────────────────────────

  async playAnswer(text: string, pair: string, voice?: string): Promise<void> {
    console.log(`🎯 [WavClient] playAnswer: "${text.slice(0, 30)}..." | pair: ${pair}`);
    return this.playGeneratedAudio(text, voice);
  }

  // ─── CACHE UTILITIES ────────────────────────────────────────────

  getCacheSize(): number {
    return this.cache.size;
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ [WavClient] Cache cleared');
  }

  // ─── VOICE HELPERS ──────────────────────────────────────────────

  getAvailableVoices(): string[] {
    return ["Ani", "Avet", "Areg", "Luse", "Tigran"];
  }

  getAvailablePairs(): string[] {
    return ['hy-en', 'hy-ru'];
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

// ─── SINGLETON ──────────────────────────────────────────────────────

let wavClientInstance: WavClient | null = null;

export function getWavClient(): WavClient | null {
  if (!wavClientInstance) {
    try {
      const apiUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      wavClientInstance = new WavClient(apiUrl);
      console.log('✅ [WavClient] Singleton initialized (ONLINE ONLY - no saving)');
    } catch (error) {
      console.error('❌ [WavClient] Failed to initialize:', error);
      return null;
    }
  }
  return wavClientInstance;
}

export default WavClient;