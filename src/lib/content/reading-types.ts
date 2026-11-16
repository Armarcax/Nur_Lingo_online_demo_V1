// src/lib/content/reading-types.ts

export interface ReadingParagraph {
  en: string;
  hy: string;
  ru: string;
}

export interface ReadingVocabulary {
  word: string;
  translation: { en: string; hy: string; ru: string };
}

export interface ReadingQuestion {
  question: { en: string; hy: string; ru: string };
  options: { en: string; hy: string; ru: string }[];
  correctIndex: number;
}

export interface CreativeTask {
  prompt: { en: string; hy: string; ru: string };
  questions: { en: string; hy: string; ru: string }[];
}

export interface ReadingText {
  id: string;
  level: "A1" | "A2" | "B1" | "B2";
  topics: string[];
  title: { en: string; hy: string; ru: string };
  format: string;
  difficulty: number;
  words: number;
  minutes: number;
  parts: number;
  questionsCount: number;
  paragraphs: ReadingParagraph[];
  vocabulary: ReadingVocabulary[];
  questions: ReadingQuestion[];
  creativeTask?: CreativeTask;
}