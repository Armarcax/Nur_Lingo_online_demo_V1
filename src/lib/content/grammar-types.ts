export type NativeLang = "hy" | "ru";

export interface LocalizedText {
  hy?: string;
  ru?: string;
  en?: string;
}

export interface GrammarCard {
  id: string;
  kind: string;
  order?: number;
  title: LocalizedText;
  body: LocalizedText;
  formula?: string;
  targetText?: string;
  example?: string;
}

export interface GrammarRule {
  id: string;
  formula?: string;
  statement: LocalizedText;
  targetText?: string;
}

export interface GrammarExample {
  id: string;
  targetText: string;
  translation: LocalizedText;
}

export interface GrammarCommonError {
  id: string;
  wrong: string;
  correct: string;
  explanation: LocalizedText;
}

export interface GrammarFeedback {
  correct?: LocalizedText;
  options?: Array<LocalizedText | null>;
  targeted?: Record<string, LocalizedText | string>;
}

export interface GrammarPickItem {
  id: string;
  prompt: string | LocalizedText;
  options: string[];
  correctIndex: number;
  feedback?: GrammarFeedback;
}

export interface GrammarTextItem {
  id: string;
  prompt: string | LocalizedText;
  accepted: string[];
  exact?: boolean;
  feedback?: GrammarFeedback;
}

export interface GrammarMatchItem {
  id: string;
  prompt: string | LocalizedText;
  answer: string;
  feedback?: GrammarFeedback;
}

export interface GrammarOrderItem {
  id: string;
  words: string[];
  accepted: string[];
  feedback?: GrammarFeedback;
}

export type GrammarItem = GrammarPickItem | GrammarTextItem | GrammarMatchItem | GrammarOrderItem;
export type GrammarExerciseType = "pick" | "gap" | "write" | "order" | "fix" | "match" | "unsupported";

export interface GrammarExercise {
  id: string;
  type: GrammarExerciseType;
  order?: number;
  difficulty?: number | string;
  cardIds?: string[];
  shuffleOptions?: boolean;
  exact?: boolean;
  instruction: LocalizedText;
  example?: string;
  box?: string[];
  options?: string[];
  unusedOptionFeedback?: LocalizedText;
  items: GrammarItem[];
}

export interface GrammarReviewCard {
  id: string;
  type: string;
  prompt: LocalizedText;
  answer: string;
}

export interface GrammarUnit {
  id: string;
  bookId?: string;
  targetLanguage: "en";
  supportedDirections: string[];
  cefr?: string | null;
  level?: LocalizedText;
  sectionId?: string;
  section?: LocalizedText;
  unitNumber: number;
  title: LocalizedText;
  explanation: LocalizedText;
  learningObjectives: LocalizedText[];
  rules: GrammarRule[];
  examples: GrammarExample[];
  commonErrors: GrammarCommonError[];
  cards: GrammarCard[];
  exercises: GrammarExercise[];
  reviewCards: GrammarReviewCard[];
  needsReview?: boolean;
}
