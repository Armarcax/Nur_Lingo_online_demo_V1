// scripts/utils/mapping-generator.ts

import * as fs from 'fs';
import * as path from 'path';
import { AudioMapping, VoiceConfig } from '../types/audio-types';

export class MappingGenerator {
  private outputPath: string;
  private voiceConfig: VoiceConfig;

  constructor(outputPath: string, voiceConfig: VoiceConfig) {
    this.outputPath = outputPath;
    this.voiceConfig = voiceConfig;
  }

  generate(
    audioIdMap: Record<string, string>,
    audioMetadata: Record<string, any>
  ): string {
    const timestamp = new Date().toISOString();
    
    let content = `// lib/content/audio-mapping.ts\n`;
    content += `// ⚠️ ԱՎՏՈՄԱՏ ԳԵՆԵՐԱՑՎԱԾ ՖԱՅԼ - ՄԻ ԽՄԲԱԳՐԵԼ ՁԵՌՔՈՎ\n`;
    content += `// Վերջին թարմացում: ${timestamp}\n\n`;
    
    // EXERCISE_TO_AUDIO
    content += `export const EXERCISE_TO_AUDIO: Record<string, string> = {\n`;
    for (const [exerciseId, audioId] of Object.entries(audioIdMap).sort()) {
      content += `  '${exerciseId}': '${audioId}',\n`;
    }
    content += `};\n\n`;
    
    // AUDIO_TO_EXERCISE
    content += `export const AUDIO_TO_EXERCISE: Record<string, string[]> = {\n`;
    const reverseMap: Record<string, string[]> = {};
    for (const [exerciseId, audioId] of Object.entries(audioIdMap)) {
      if (!reverseMap[audioId]) reverseMap[audioId] = [];
      reverseMap[audioId].push(exerciseId);
    }
    for (const [audioId, exerciseIds] of Object.entries(reverseMap).sort()) {
      content += `  '${audioId}': [${exerciseIds.map(id => `'${id}'`).join(', ')}],\n`;
    }
    content += `};\n\n`;
    
    // AUDIO_METADATA
    content += `export const AUDIO_METADATA: Record<string, {\n`;
    content += `  lessonId: string;\n`;
    content += `  exerciseId: string;\n`;
    content += `  language: string;\n`;
    content += `  voice: string;\n`;
    content += `  filename: string;\n`;
    content += `  duration?: number;\n`;
    content += `  size?: number;\n`;
    content += `}> = {\n`;
    
    for (const [audioId, metadata] of Object.entries(audioMetadata).sort()) {
      content += `  '${audioId}': {\n`;
      content += `    lessonId: '${metadata.lessonId}',\n`;
      content += `    exerciseId: '${metadata.exerciseId}',\n`;
      content += `    language: '${metadata.language}',\n`;
      content += `    filename: '${metadata.filename}',\n`;
      content += `    size: ${metadata.size || 0},\n`;
      content += `    duration: ${metadata.duration || 0},\n`;
      content += `  },\n`;
    }
    content += `};\n\n`;
    
    // Helper functions
    content += `export function getAudioPath(\n`;
    content += `  exerciseId: string,\n`;
    content += `  language: 'hy' | 'en' | 'ru',\n`;
    content += `  gender: 'male' | 'female'\n`;
    content += `): string | null {\n`;
    content += `  const audioId = EXERCISE_TO_AUDIO[exerciseId];\n`;
    content += `  if (!audioId) return null;\n`;
    content += `  \n`;
    content += `  const folderMap: Record<string, Record<string, string>> = {\n`;
    content += `    hy: { male: 'hy_Areg', female: 'hy_Ani' },\n`;
    content += `    en: { male: 'en_male', female: 'en_female' },\n`;
    content += `    ru: { male: 'ru_male', female: 'ru_female' },\n`;
    content += `  };\n`;
    content += `  \n`;
    content += `  const folder = folderMap[language]?.[gender];\n`;
    content += `  if (!folder) return null;\n`;
    content += `  \n`;
    content += `  return \`/audio/offline/\${folder}/\${audioId}.mp3\`;\n`;
    content += `}\n\n`;
    
    content += `export function getAudioPathByAudioId(\n`;
    content += `  audioId: string,\n`;
    content += `  language: 'hy' | 'en' | 'ru',\n`;
    content += `  gender: 'male' | 'female'\n`;
    content += `): string | null {\n`;
    content += `  const folderMap: Record<string, Record<string, string>> = {\n`;
    content += `    hy: { male: 'hy_Areg', female: 'hy_Ani' },\n`;
    content += `    en: { male: 'en_male', female: 'en_female' },\n`;
    content += `    ru: { male: 'ru_male', female: 'ru_female' },\n`;
    content += `  };\n`;
    content += `  \n`;
    content += `  const folder = folderMap[language]?.[gender];\n`;
    content += `  if (!folder) return null;\n`;
    content += `  \n`;
    content += `  return \`/audio/offline/\${folder}/\${audioId}.mp3\`;\n`;
    content += `}\n\n`;
    
    content += `export function searchAudio(searchTerm: string): Array<{\n`;
    content += `  exerciseId: string;\n`;
    content += `  audioId: string;\n`;
    content += `  language: string;\n`;
    content += `  voice: string;\n`;
    content += `}> {\n`;
    content += `  const results: Array<{\n`;
    content += `    exerciseId: string;\n`;
    content += `    audioId: string;\n`;
    content += `    language: string;\n`;
    content += `    voice: string;\n`;
    content += `  }> = [];\n`;
    content += `  \n`;
    content += `  for (const [exerciseId, audioId] of Object.entries(EXERCISE_TO_AUDIO)) {\n`;
    content += `    if (exerciseId.includes(searchTerm) || audioId.includes(searchTerm)) {\n`;
    content += `      for (const lang of ['hy', 'en', 'ru'] as const) {\n`;
    content += `        for (const voice of ['male', 'female'] as const) {\n`;
    content += `          if (getAudioPath(exerciseId, lang, voice as 'male' | 'female')) {\n`;
    content += `            results.push({\n`;
    content += `              exerciseId,\n`;
    content += `              audioId,\n`;
    content += `              language: lang,\n`;
    content += `              voice: voice as 'male' | 'female',\n`;
    content += `            });\n`;
    content += `          }\n`;
    content += `        }\n`;
    content += `      }\n`;
    content += `    }\n`;
    content += `  }\n`;
    content += `  \n`;
    content += `  return results;\n`;
    content += `}\n\n`;
    
    content += `export function hasAudioFile(\n`;
    content += `  exerciseId: string,\n`;
    content += `  language: 'hy' | 'en' | 'ru',\n`;
    content += `  gender: 'male' | 'female'\n`;
    content += `): boolean {\n`;
    content += `  return getAudioPath(exerciseId, language, gender) !== null;\n`;
    content += `}\n`;
    
    return content;
  }

  save(audioIdMap: Record<string, string>, audioMetadata: Record<string, any>): boolean {
    try {
      const content = this.generate(audioIdMap, audioMetadata);
      fs.writeFileSync(this.outputPath, content, 'utf-8');
      return true;
    } catch (error) {
      console.error(`Failed to save mapping: ${error}`);
      return false;
    }
  }

  generateManifest(audioId: string, fileInfo: { size: number; hash?: string }): any {
    return {
      audioId,
      filename: `${audioId}.mp3`,
      size: fileInfo.size,
      hash: fileInfo.hash || '',
    };
  }

  updateManifest(
    existingManifest: any,
    audioIdMap: Record<string, string>,
    voiceDir: string
  ): any {
    // Get all audio IDs that should exist for this voice
    const audioIds = new Set(Object.values(audioIdMap));
    
    // Build file list
    const files: Array<{ filename: string; audioId: string; size?: number; hash?: string }> = [];
    
    for (const audioId of audioIds) {
      const filePath = path.join(this.voiceConfig.hy.male.dir, `${audioId}.mp3`);
      // Check if file exists
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        files.push({
          filename: `${audioId}.mp3`,
          audioId,
          size: stats.size,
        });
      }
    }
    
    return {
      ...existingManifest,
      generatedAt: new Date().toISOString(),
      totalFiles: files.length,
      files,
    };
  }
}