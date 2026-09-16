// src/lib/content/audio-mapping-unified.ts

// ✅ Import audio mapping
import audioNumMapping from './audio-num-mapping.json';
import { resolveOfflineAudio } from '@/lib/offline/offline-audio-resolver';

// ✅ Type assertion for the mapping
const mappingData = audioNumMapping as any;

export const unifiedAudioMapping = mappingData;

export const getAudioId = (key: string): string | null => {
  // ✅ Use type assertion to access audioToNum
  return mappingData.audioToNum?.[key] || null;
};

export const getAudioPath = (key: string, language: 'hy' | 'en' | 'ru'): string | null => {
  return resolveOfflineAudio(key, language)?.url || null;
};

// ✅ Optional: direct access without key
export const getAudioIdDirect = (key: string): string | null => {
  const audioToNum = (audioNumMapping as any).audioToNum;
  return audioToNum?.[key] || null;
};

// ✅ Get mapping stats
export const getMappingStats = () => {
  const audioToNum = (audioNumMapping as any).audioToNum || {};
  const numToAudio = (audioNumMapping as any).numToAudio || {};
  
  return {
    totalKeys: Object.keys(audioToNum).length,
    totalAudioIds: Object.keys(numToAudio).length,
    hasMapping: Object.keys(audioToNum).length > 0
  };
};

export default {
  unifiedAudioMapping,
  getAudioId,
  getAudioPath,
  getAudioIdDirect,
  getMappingStats
};