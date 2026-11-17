// src/lib/content/grammar-types.ts

export interface BilingualText {
  hy: string;
  ru: string;
  en?: string;
}

export interface GrammarCard {
  id: string;
  type: string;
  title: BilingualText;
  body: BilingualText;
}

export interface PickItem {
  s: string;
  o: string[];
  a: number;
  no?: Record<string, unknown>;
  byOption?: Record<string, unknown>;
  feedback?: BilingualText;
}

export interface TextItem {
  s?: string;
  p?: string;
  a: string[];
  exact?: boolean;
  feedback?: BilingualText;
}

export interface OrderItem {
  w: string[];
  a: string[];
  feedback?: BilingualText;
}

export type GrammarExerciseType = "pick" | "gap" | "write" | "order" | "fix" | "match";

export interface GrammarExercise {
  id?: string;
  type: GrammarExerciseType;
  shuffleOptions?: boolean;
  instruction: BilingualText;
  order?: number;
  difficulty?: string;
  cardIds?: string[];
  exact?: boolean;
  ex?: string;
  box?: string[];
  opts?: string[];
  items: (PickItem | TextItem | OrderItem)[];
}

export interface GrammarUnit {
  id: string;
  bookId?: string;
  targetLanguage?: string;
  cefr?: string | null;
  sectionId?: string;
  unitNumber: number;
  title: BilingualText;
  explanation: BilingualText;
  cards?: GrammarCard[];
  exercises?: GrammarExercise[];
  tasks?: GrammarExercise[];
  needsReview?: boolean;
}