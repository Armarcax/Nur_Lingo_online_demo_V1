// src/lib/audio/WavProvider.ts

import { getWavClient } from "./WavClient";
import { IAudioProvider, AudioProviderType, AudioPlayOptions, AudioPlayResult } from "./AudioTypes";

export class WavProvider implements IAudioProvider {
  readonly type: AudioProviderType = AudioProviderType.WAV;
  readonly name = "WAV.am TTS";
  readonly capabilities = {
    canPlayFiles: false,
    canSynthesize: true,
    canStream: false,
    hasVoiceSelection: true,
    requiresNetwork: true,
    supportsOffline: false,
    canPersist: false,
    supportsRate: false,
    supportsPitch: false,
  };

  private client = getWavClient();
  private currentAudio: HTMLAudioElement | null = null;

  async isAvailable(): Promise<boolean> {
    return !!this.client;
  }

  async play(text: string, lang: string, options: AudioPlayOptions): Promise<AudioPlayResult> {
    if (!this.client) {
      throw new Error("WAV provider not available");
    }

    try {
      const voice = this.getVoiceForLanguage(lang);
      const result = await this.client.generateAudio(text, { voice, format: "mp3" });
      const audioBlob = await this.client.downloadAudio(result.path);
      const audioUrl = URL.createObjectURL(audioBlob);

      return new Promise((resolve) => {
        this.currentAudio = new Audio(audioUrl);
        
        const cleanup = () => {
          try { URL.revokeObjectURL(audioUrl); } catch {}
          this.currentAudio = null;
        };

        this.currentAudio.onended = () => {
          cleanup();
          resolve({ 
            provider: this.type, 
            isTTSFallback: false, 
            completed: true, 
            duration: result.duration || 0 
          });
        };

        this.currentAudio.onerror = () => {
          cleanup();
          resolve({ 
            provider: this.type, 
            isTTSFallback: true, 
            completed: false, 
            error: new Error("Playback error") 
          });
        };

        this.currentAudio.play().catch((err) => {
          cleanup();
          resolve({ 
            provider: this.type, 
            isTTSFallback: true, 
            completed: false, 
            error: err 
          });
        });
      });
    } catch (error) {
      return { 
        provider: this.type, 
        isTTSFallback: true, 
        completed: false, 
        error: error instanceof Error ? error : new Error("WAV error") 
      };
    }
  }

  stop(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      } catch {
        // Ignore
      }
    }
  }

  isPlaying(): boolean {
    return !!this.currentAudio && !this.currentAudio.paused;
  }

  private getVoiceForLanguage(lang: string): string {
    const voices: Record<string, string> = { 
      hy: "Avet", 
      en: "Avet", 
      ru: "Ani" 
    };
    return voices[lang] || "Avet";
  }
}