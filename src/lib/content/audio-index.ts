// src/lib/content/audio-index.ts

import fs from 'fs';
import path from 'path';

export interface AudioFileInfo {
  id: string;
  path: string;
  language: string;
  exists: boolean;
}

// Աուդիո ֆայլերի քեշ
let audioCache: Map<string, AudioFileInfo> | null = null;

export function scanAudioFiles(): Map<string, AudioFileInfo> {
  if (audioCache) return audioCache;
  
  const cache = new Map<string, AudioFileInfo>();
  const audioDir = path.join(process.cwd(), 'public/audio');
  
  if (!fs.existsSync(audioDir)) {
    console.warn('⚠️ Audio directory not found:', audioDir);
    audioCache = cache;
    return cache;
  }
  
  // Սկանավորենք բոլոր պանակները
  const languages = ['hy', 'en', 'ru', 'hy_user', 'en_user', 'ru_user'];
  
  for (const lang of languages) {
    const langDir = path.join(audioDir, lang);
    if (!fs.existsSync(langDir)) continue;
    
    const files = fs.readdirSync(langDir);
    for (const file of files) {
      if (file.endsWith('.mp3') || file.endsWith('.wav')) {
        const id = path.basename(file, path.extname(file));
        const baseLang = lang.split('_')[0]; // hy, en, ru
        cache.set(id, {
          id,
          path: `/audio/${lang}/${file}`,
          language: baseLang,
          exists: true,
        });
      }
    }
  }
  
  console.log(`✅ Scanned ${cache.size} audio files`);
  audioCache = cache;
  return cache;
}

export function findAudioFile(
  audioId: string,
  language?: string
): AudioFileInfo | null {
  const cache = scanAudioFiles();
  
  // Փնտրենք ըստ ID-ի
  if (cache.has(audioId)) {
    const info = cache.get(audioId)!;
    if (!language || info.language === language) {
      return info;
    }
  }
  
  // Փնտրենք ըստ ID-ի լեզվով
  for (const [id, info] of cache) {
    if (id === audioId && (!language || info.language === language)) {
      return info;
    }
  }
  
  return null;
}