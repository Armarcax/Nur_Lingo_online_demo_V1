// src/lib/content/audio-mapping-integrated.ts

// ✅ ԳԼԽԱՎՈՐ MAPPING-Ը audio-num-mapping.json-ից
import audioNumMapping from './audio-num-mapping.json';
import { resolveOfflineAudio } from '@/lib/offline/offline-audio-resolver';

// ❌ Հեռացնել բոլոր manifest-ների import-ները
// import lessonEn from '../../../public/audio/offline/manifest_en_female.json';
// import lessonHy from '../../../public/audio/offline/manifest_hy_ani.json';
// import lessonRu from '../../../public/audio/offline/manifest_ru_female.json';
// import dictManifest from '../../../public/audio/offline_dictionary/manifest.json';
// import userManifest from '../../../public/audio/offline_user_dictionary/user_manifest.json';

// ============================================
// 🎯 MAPPING-ՆԵՐ (audio-num-mapping.json-ից)
// ============================================

// audioToNum - բառեր → աուդիո ID
export const AUDIO_TO_NUM = (audioNumMapping as any).audioToNum || {};

// numToAudio - աուդիո ID → բառեր
export const NUM_TO_AUDIO = (audioNumMapping as any).numToAudio || {};

// ============================================
// 🎯 ՖՈՒՆԿՑԻԱՆԵՐ
// ============================================

/**
 * Ստանալ աուդիո ID-ն բառից
 */
export function getAudioIdFromKey(key: string): string | null {
  return AUDIO_TO_NUM[key] || null;
}

/**
 * Ստանալ բառը աուդիո ID-ից
 */
export function getKeyFromAudioId(audioId: string): string | null {
  return NUM_TO_AUDIO[audioId] || null;
}

/**
 * Ստուգել արդյոք աուդիո ID-ն գոյություն ունի
 */
export function audioIdExists(audioId: string): boolean {
  return !!NUM_TO_AUDIO[audioId];
}

/**
 * Ստանալ աուդիոյի path-ը
 */
export function getAudioPath(
  audioId: string,
  language: 'hy' | 'en' | 'ru'
): string | null {
  return resolveOfflineAudio(audioId, language)?.url || null;
}

/**
 * Ստանալ աուդիոյի URL-ը բառից
 */
export function getAudioUrlFromKey(
  key: string,
  language: 'hy' | 'en' | 'ru'
): string | null {
  const audioId = getAudioIdFromKey(key);
  if (!audioId) return null;
  return getAudioPath(audioId, language);
}

/**
 * Ստուգել արդյոք աուդիո ֆայլը գոյություն ունի
 */
export async function audioFileExists(
  audioId: string,
  language: 'hy' | 'en' | 'ru'
): Promise<boolean> {
  const path = getAudioPath(audioId, language);
  if (!path) return false;
  
  try {
    const response = await fetch(path, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Ստանալ բոլոր աուդիո ID-ները
 */
export function getAllAudioIds(language: 'hy' | 'en' | 'ru'): string[] {
  // ✅ Վերադարձնել բոլոր audioIds-ները numToAudio-ից
  return Object.keys(NUM_TO_AUDIO);
}

/**
 * Ստանալ բոլոր բառերը
 */
export function getAllKeys(): string[] {
  return Object.keys(AUDIO_TO_NUM);
}

/**
 * Որոնել բառեր
 */
export function searchKeys(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  return Object.keys(AUDIO_TO_NUM).filter(key =>
    key.toLowerCase().includes(lowerQuery)
  );
}

// ============================================
// 📊 ՎԻՃԱԿԱԳՐՈՒԹՅՈՒՆ
// ============================================

export function getStats() {
  const totalKeys = Object.keys(AUDIO_TO_NUM).length;
  const totalAudioIds = Object.keys(NUM_TO_AUDIO).length;
  
  return {
    mapping: {
      totalKeys,
      totalAudioIds,
      match: totalKeys === totalAudioIds ? '✅' : '⚠️'
    }
  };
}

// ============================================
// 📤 EXPORT ԲՈԼՈՐԸ
// ============================================

export default {
  AUDIO_TO_NUM,
  NUM_TO_AUDIO,
  getAudioIdFromKey,
  getKeyFromAudioId,
  audioIdExists,
  getAudioPath,
  getAudioUrlFromKey,
  audioFileExists,
  getAllAudioIds,
  getAllKeys,
  searchKeys,
  getStats
};