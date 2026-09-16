// scripts/utils/manifest-parser.ts

import * as fs from 'fs';
import * as path from 'path';
import { AudioManifest, AudioFile } from '../types/audio-types';

export class ManifestParser {
  private manifestsPath: string;

  constructor(manifestsPath: string) {
    this.manifestsPath = manifestsPath;
  }

  loadManifest(voiceDir: string): AudioManifest | null {
    const manifestName = `manifest_${voiceDir.toLowerCase()}.json`;
    const manifestPath = path.join(this.manifestsPath, manifestName);

    try {
      if (!fs.existsSync(manifestPath)) {
        return null;
      }

      const content = fs.readFileSync(manifestPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Failed to load manifest ${manifestName}: ${error}`);
      return null;
    }
  }

  saveManifest(voiceDir: string, manifest: AudioManifest): boolean {
    const manifestName = `manifest_${voiceDir.toLowerCase()}.json`;
    const manifestPath = path.join(this.manifestsPath, manifestName);

    try {
      fs.writeFileSync(
        manifestPath,
        JSON.stringify(manifest, null, 2),
        'utf-8'
      );
      return true;
    } catch (error) {
      console.error(`Failed to save manifest ${manifestName}: ${error}`);
      return false;
    }
  }

  getAllManifests(): Record<string, AudioManifest> {
    const manifests: Record<string, AudioManifest> = {};

    const files = fs.readdirSync(this.manifestsPath);
    for (const file of files) {
      if (file.startsWith('manifest_') && file.endsWith('.json')) {
        const voiceDir = file.replace('manifest_', '').replace('.json', '');
        const manifest = this.loadManifest(voiceDir);
        if (manifest) {
          manifests[voiceDir] = manifest;
        }
      }
    }

    return manifests;
  }

  getAudioFilesByVoice(): Record<string, AudioFile[]> {
    const result: Record<string, AudioFile[]> = {};
    const manifests = this.getAllManifests();

    for (const [voiceDir, manifest] of Object.entries(manifests)) {
      result[voiceDir] = manifest.files;
    }

    return result;
  }

  getAudioIdsByVoice(): Record<string, Set<string>> {
    const result: Record<string, Set<string>> = {};
    const filesByVoice = this.getAudioFilesByVoice();

    for (const [voiceDir, files] of Object.entries(filesByVoice)) {
      result[voiceDir] = new Set(files.map(f => f.audioId));
    }

    return result;
  }

  getDuplicateAudioIds(): Array<{ audioId: string; voices: string[] }> {
    const audioIdToVoices: Record<string, string[]> = {};
    const filesByVoice = this.getAudioFilesByVoice();

    for (const [voiceDir, files] of Object.entries(filesByVoice)) {
      for (const file of files) {
        if (!audioIdToVoices[file.audioId]) {
          audioIdToVoices[file.audioId] = [];
        }
        if (!audioIdToVoices[file.audioId].includes(voiceDir)) {
          audioIdToVoices[file.audioId].push(voiceDir);
        }
      }
    }

    const duplicates: Array<{ audioId: string; voices: string[] }> = [];
    for (const [audioId, voices] of Object.entries(audioIdToVoices)) {
      if (voices.length > 1) {
        duplicates.push({ audioId, voices });
      }
    }

    return duplicates;
  }

  getTotalFiles(): number {
    const manifests = this.getAllManifests();
    let total = 0;
    for (const manifest of Object.values(manifests)) {
      total += manifest.totalFiles;
    }
    return total;
  }

  getStats() {
    const manifests = this.getAllManifests();
    const stats: Record<string, { totalFiles: number; totalSize: number }> = {};

    for (const [voiceDir, manifest] of Object.entries(manifests)) {
      let totalSize = 0;
      for (const file of manifest.files) {
        totalSize += file.size || 0;
      }
      stats[voiceDir] = {
        totalFiles: manifest.totalFiles,
        totalSize,
      };
    }

    return stats;
  }
}