// scripts/utils/dictionary-parser.ts

import * as fs from 'fs';
import * as path from 'path';

export interface LessonDictionary {
  version: string;
  generatedAt: string;
  totalLessons: number;
  lessons: Record<string, Lesson>;
}

export interface Lesson {
  id: string;
  worldId: string;
  slug: string;
  title: Record<string, string>;
  concept: Record<string, string>;
  difficulty: string;
  vocabulary?: VocabularyItem[];
  exercises: Exercise[];
}

export interface VocabularyItem {
  id: string;
  hy: string;
  en: string;
  ru?: string;
  audioId?: string;
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

export class DictionaryParser {
  private dictionary: LessonDictionary | null = null;
  private dictionaryPath: string;

  constructor(dictionaryPath: string) {
    this.dictionaryPath = dictionaryPath;
  }

  load(): LessonDictionary | null {
    try {
      if (!fs.existsSync(this.dictionaryPath)) {
        console.error(`Dictionary not found: ${this.dictionaryPath}`);
        return null;
      }

      const content = fs.readFileSync(this.dictionaryPath, 'utf-8');
      this.dictionary = JSON.parse(content);
      
      // ✅ Add null check before accessing properties
      if (this.dictionary) {
        console.log('📋 Dictionary structure:');
        console.log(`  - Version: ${this.dictionary.version}`);
        console.log(`  - Total lessons: ${this.dictionary.totalLessons}`);
        console.log(`  - Lessons keys: ${Object.keys(this.dictionary.lessons || {}).slice(0, 5).join(', ')}...`);
      }
      
      return this.dictionary;
    } catch (error) {
      console.error(`Failed to load dictionary: ${error}`);
      return null;
    }
  }

  save(dictionary: LessonDictionary): boolean {
    try {
      fs.writeFileSync(
        this.dictionaryPath,
        JSON.stringify(dictionary, null, 2),
        'utf-8'
      );
      return true;
    } catch (error) {
      console.error(`Failed to save dictionary: ${error}`);
      return false;
    }
  }

  getAllLessons(): Lesson[] {
    if (!this.dictionary) return [];
    return Object.values(this.dictionary.lessons);
  }

  getAllExercises(): Array<Exercise & { lessonId: string }> {
    const exercises: Array<Exercise & { lessonId: string }> = [];
    if (!this.dictionary) return exercises;

    for (const [lessonId, lesson] of Object.entries(this.dictionary.lessons)) {
      if (lesson.exercises && Array.isArray(lesson.exercises)) {
        for (const exercise of lesson.exercises) {
          exercises.push({
            ...exercise,
            lessonId: lessonId,
          });
        }
      }
    }

    return exercises;
  }

  getExercisesWithAudio(): Array<{ lessonId: string; exercise: Exercise }> {
    const result: Array<{ lessonId: string; exercise: Exercise }> = [];
    if (!this.dictionary) return result;

    for (const [lessonId, lesson] of Object.entries(this.dictionary.lessons)) {
      if (lesson.exercises && Array.isArray(lesson.exercises)) {
        for (const exercise of lesson.exercises) {
          if (exercise.audioId) {
            result.push({ lessonId, exercise });
          }
        }
      }
    }

    return result;
  }

  getExercisesWithoutAudio(): Array<{ lessonId: string; exercise: Exercise }> {
    const result: Array<{ lessonId: string; exercise: Exercise }> = [];
    if (!this.dictionary) return result;

    for (const [lessonId, lesson] of Object.entries(this.dictionary.lessons)) {
      if (lesson.exercises && Array.isArray(lesson.exercises)) {
        for (const exercise of lesson.exercises) {
          if (!exercise.audioId) {
            result.push({ lessonId, exercise });
          }
        }
      }
    }

    return result;
  }

  getAudioIdMap(): Record<string, string> {
    const map: Record<string, string> = {};
    if (!this.dictionary) return map;

    for (const [lessonId, lesson] of Object.entries(this.dictionary.lessons)) {
      if (lesson.exercises && Array.isArray(lesson.exercises)) {
        for (const exercise of lesson.exercises) {
          if (exercise.audioId) {
            const exerciseId = `${lessonId}_${exercise.id}`;
            map[exerciseId] = exercise.audioId;
          }
        }
      }

      if (lesson.vocabulary && Array.isArray(lesson.vocabulary)) {
        for (const vocab of lesson.vocabulary) {
          if (vocab.audioId) {
            const vocabId = `${lessonId}_vocab_${vocab.id}`;
            map[vocabId] = vocab.audioId;
          }
        }
      }
    }

    return map;
  }

  getStats() {
    if (!this.dictionary) {
      return {
        totalLessons: 0,
        totalExercises: 0,
        exercisesWithAudio: 0,
        exercisesWithoutAudio: 0,
        uniqueAudioIds: 0,
        vocabularyWithAudio: 0,
      };
    }

    const audioIds = new Set<string>();
    let exercisesWithAudio = 0;
    let exercisesWithoutAudio = 0;
    let vocabularyWithAudio = 0;
    let totalExercises = 0;

    for (const lesson of Object.values(this.dictionary.lessons)) {
      if (lesson.exercises && Array.isArray(lesson.exercises)) {
        for (const exercise of lesson.exercises) {
          totalExercises++;
          if (exercise.audioId) {
            audioIds.add(exercise.audioId);
            exercisesWithAudio++;
          } else {
            exercisesWithoutAudio++;
          }
        }
      }

      if (lesson.vocabulary && Array.isArray(lesson.vocabulary)) {
        for (const vocab of lesson.vocabulary) {
          if (vocab.audioId) {
            audioIds.add(vocab.audioId);
            vocabularyWithAudio++;
          }
        }
      }
    }

    return {
      totalLessons: this.dictionary.totalLessons || Object.keys(this.dictionary.lessons).length,
      totalExercises,
      exercisesWithAudio,
      exercisesWithoutAudio,
      uniqueAudioIds: audioIds.size,
      vocabularyWithAudio,
    };
  }

  getAllAudioIds(): Set<string> {
    const audioIds = new Set<string>();
    if (!this.dictionary) return audioIds;

    for (const lesson of Object.values(this.dictionary.lessons)) {
      if (lesson.exercises && Array.isArray(lesson.exercises)) {
        for (const exercise of lesson.exercises) {
          if (exercise.audioId) {
            audioIds.add(exercise.audioId);
          }
        }
      }

      if (lesson.vocabulary && Array.isArray(lesson.vocabulary)) {
        for (const vocab of lesson.vocabulary) {
          if (vocab.audioId) {
            audioIds.add(vocab.audioId);
          }
        }
      }
    }

    return audioIds;
  }
}