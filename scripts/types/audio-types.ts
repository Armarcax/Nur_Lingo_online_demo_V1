// scripts/types/audio-types.ts

export interface LessonDictionary {
  lessons: Lesson[];
  metadata: {
    version: string;
    generatedAt: string;
    totalLessons: number;
    totalExercises: number;
  };
}

export interface Lesson {
  id: string;
  title: Record<string, string>;
  description?: Record<string, string>;
  level: string;
  category: string;
  estimatedMinutes: number;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  type: 'multiple_choice' | 'word_order' | 'match_pairs' | 'listening' | 'free_text';
  prompt: Record<string, string>;
  targetAnswer: string;
  acceptableAnswers?: string[];
  options?: string[];
  words?: string[];
  pairs?: [string, string][];
  ttsText?: string;
  ttsLang?: string;
  hint?: Record<string, string>;
  audioId?: string;
  image?: string;
}

export interface AudioManifest {
  version: string;
  generatedAt: string;
  totalFiles: number;
  files: AudioFile[];
}

export interface AudioFile {
  filename: string;
  audioId: string;
  size?: number;
  duration?: number;
  hash?: string;
}

export interface AudioMapping {
  exerciseId: string;
  audioId: string;
  filename: string;
  voice: string;
  language: string;
}

export interface VoiceConfig {
  [language: string]: {
    [gender: string]: {
      name: string;
      dir: string;
      label: string;
    };
  };
}

export interface SyncReport {
  timestamp: string;
  dictionaryStats: {
    lessons: number;
    exercises: number;
    exercisesWithAudio: number;
    uniqueAudioIds: number;
  };
  audioStats: {
    [voice: string]: {
      totalFiles: number;
      sizeMB: number;
    };
  };
  missingFiles: Array<{
    exerciseId: string;
    audioId: string;
    language: string;
    voice: string;
    expectedPath: string;
  }>;
  orphanFiles: Array<{
    filename: string;
    fullPath: string;
    audioId: string;
    voice: string;
    language: string;
  }>;
  duplicateFiles: Array<{
    audioId: string;
    exerciseIds: string[];
  }>;
  summary: {
    totalAudioFiles: number;
    missingFiles: number;
    orphanFiles: number;
    duplicates: number;
  };
}