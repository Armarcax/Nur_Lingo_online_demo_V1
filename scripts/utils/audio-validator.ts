// scripts/utils/audio-validator.ts

import * as fs from 'fs';
import * as path from 'path';
import { AudioFile, SyncReport } from '../types/audio-types';

export class AudioValidator {
  private audioBasePath: string;
  private voiceConfig: Record<string, Record<string, { dir: string; name: string }>>;

  constructor(
    audioBasePath: string,
    voiceConfig: Record<string, Record<string, { dir: string; name: string }>>
  ) {
    this.audioBasePath = audioBasePath;
    this.voiceConfig = voiceConfig;
  }

  validateFileExists(audioId: string, language: string, gender: string): boolean {
    const voiceDir = this.voiceConfig[language]?.[gender]?.dir;
    if (!voiceDir) return false;

    const filePath = path.join(this.audioBasePath, voiceDir, `${audioId}.mp3`);
    return fs.existsSync(filePath);
  }

  getFilePath(audioId: string, language: string, gender: string): string | null {
    const voiceDir = this.voiceConfig[language]?.[gender]?.dir;
    if (!voiceDir) return null;

    const filePath = path.join(this.audioBasePath, voiceDir, `${audioId}.mp3`);
    return fs.existsSync(filePath) ? filePath : null;
  }

  getFileInfo(filePath: string): { size: number; hash: string } | null {
    try {
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath);
      const hash = this.getFileHash(content);
      
      return {
        size: stats.size,
        hash,
      };
    } catch (error) {
      console.error(`Failed to get file info for ${filePath}: ${error}`);
      return null;
    }
  }

  private getFileHash(content: Buffer): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  validateAudioIds(
    audioIdMap: Record<string, string>
  ): Array<{
    exerciseId: string;
    audioId: string;
    exists: boolean;
    path: string | null;
    inAllVoices: boolean;
  }> {
    const results: Array<{
      exerciseId: string;
      audioId: string;
      exists: boolean;
      path: string | null;
      inAllVoices: boolean;
    }> = [];

    for (const [exerciseId, audioId] of Object.entries(audioIdMap)) {
      let inAllVoices = true;
      let firstPath: string | null = null;

      for (const [language, voices] of Object.entries(this.voiceConfig)) {
        for (const [gender] of Object.entries(voices)) {
          const path = this.getFilePath(audioId, language, gender);
          if (!path) {
            inAllVoices = false;
          } else if (!firstPath) {
            firstPath = path;
          }
        }
      }

      results.push({
        exerciseId,
        audioId,
        exists: !!firstPath,
        path: firstPath,
        inAllVoices,
      });
    }

    return results;
  }

  findMissingFiles(
    audioIdMap: Record<string, string>
  ): Array<{
    exerciseId: string;
    audioId: string;
    language: string;
    gender: string;
    expectedPath: string;
  }> {
    const missing: Array<{
      exerciseId: string;
      audioId: string;
      language: string;
      gender: string;
      expectedPath: string;
    }> = [];

    for (const [exerciseId, audioId] of Object.entries(audioIdMap)) {
      for (const [language, voices] of Object.entries(this.voiceConfig)) {
        for (const [gender, config] of Object.entries(voices)) {
          const filePath = path.join(this.audioBasePath, config.dir, `${audioId}.mp3`);
          if (!fs.existsSync(filePath)) {
            missing.push({
              exerciseId,
              audioId,
              language,
              gender,
              expectedPath: filePath,
            });
          }
        }
      }
    }

    return missing;
  }

  findOrphanFiles(
    audioIdMap: Record<string, string>
  ): Array<{
    filename: string;
    fullPath: string;
    audioId: string;
    voice: string;
    language: string;
  }> {
    const audioIds = new Set(Object.values(audioIdMap));
    const orphans: Array<{
      filename: string;
      fullPath: string;
      audioId: string;
      voice: string;
      language: string;
    }> = [];

    for (const [language, voices] of Object.entries(this.voiceConfig)) {
      for (const [gender, config] of Object.entries(voices)) {
        const voiceDir = path.join(this.audioBasePath, config.dir);
        if (!fs.existsSync(voiceDir)) continue;

        const files = fs.readdirSync(voiceDir);
        for (const file of files) {
          if (file.endsWith('.mp3')) {
            const audioId = file.replace('.mp3', '');
            if (!audioIds.has(audioId)) {
              orphans.push({
                filename: file,
                fullPath: path.join(voiceDir, file),
                audioId,
                voice: gender,
                language,
              });
            }
          }
        }
      }
    }

    return orphans;
  }

  findDuplicates(
    audioIdMap: Record<string, string>
  ): Array<{
    audioId: string;
    exerciseIds: string[];
  }> {
    const audioIdToExercises: Record<string, string[]> = {};

    for (const [exerciseId, audioId] of Object.entries(audioIdMap)) {
      if (!audioIdToExercises[audioId]) {
        audioIdToExercises[audioId] = [];
      }
      audioIdToExercises[audioId].push(exerciseId);
    }

    const duplicates: Array<{
      audioId: string;
      exerciseIds: string[];
    }> = [];

    for (const [audioId, exerciseIds] of Object.entries(audioIdToExercises)) {
      if (exerciseIds.length > 1) {
        duplicates.push({ audioId, exerciseIds });
      }
    }

    return duplicates;
  }

  generateReport(
    audioIdMap: Record<string, string>
  ): {
    missing: Array<{
      exerciseId: string;
      audioId: string;
      language: string;
      gender: string;
      expectedPath: string;
    }>;
    orphans: Array<{
      filename: string;
      fullPath: string;
      audioId: string;
      voice: string;
      language: string;
    }>;
    duplicates: Array<{
      audioId: string;
      exerciseIds: string[];
    }>;
    stats: {
      totalAudioIds: number;
      missingFiles: number;
      orphanFiles: number;
      duplicates: number;
    };
  } {
    const missing = this.findMissingFiles(audioIdMap);
    const orphans = this.findOrphanFiles(audioIdMap);
    const duplicates = this.findDuplicates(audioIdMap);

    return {
      missing,
      orphans,
      duplicates,
      stats: {
        totalAudioIds: Object.keys(audioIdMap).length,
        missingFiles: missing.length,
        orphanFiles: orphans.length,
        duplicates: duplicates.length,
      },
    };
  }
}