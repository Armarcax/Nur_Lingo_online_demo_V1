// src/lib/audio/WavASRProvider.ts

import { getWavClient } from "./WavClient";

export class WavASRProvider {
  private client = getWavClient();

  /**
   * Transcribe audio - currently uses fallback since WAV ASR is not fully implemented
   */
  async transcribeAudio(audioBlob: Blob, language: "hy" | "ru" | "en" = "hy"): Promise<string> {
    // WAV ASR is not yet implemented, return empty string
    // This will cause validation to fail gracefully
    console.warn(`WAV ASR not implemented for ${language}, using fallback`);
    return "";
  }

  /**
   * Validate a recording against expected text
   * Uses simple fallback since ASR is not available
   */
  async validateRecording(
    audioBlob: Blob,
    expectedText: string,
    language: "hy" | "ru" | "en" = "hy"
  ): Promise<{ accepted: boolean; confidence: number; transcription: string }> {
    // Since ASR is not available, always return false with 0 confidence
    // This allows the UI to work without crashing
    console.warn(`WAV ASR validation not available for ${language}, returning fallback`);
    return {
      accepted: false,
      confidence: 0,
      transcription: "",
    };
  }

  /**
   * Check if ASR is available
   */
  async isAvailable(): Promise<boolean> {
    // WAV ASR is not available yet
    return false;
  }
}

// ✅ Default export for compatibility
export default WavASRProvider;