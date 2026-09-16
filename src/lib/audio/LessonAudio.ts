// src/lib/audio/LessonAudio.ts

import type { MultiExercise } from "../i18n/multilingual";

export type AudioMode = "off" | "on" | "auto";
export type AudioSource = "mp3" | "wav" | "tts";

export interface LessonAudioConfig {
  mode: AudioMode;        // "off" | "on" | "auto"
  source: AudioSource;    // "mp3" | "wav" | "tts"
  autoPlayQuestions: boolean;
  autoPlayAnswers: boolean;
  autoPlayCorrect: boolean;
  autoPlayFeedback: boolean;
  speed: number;          // 0.5 - 1.5
  voice: string;
}

export interface AudioPlayOptions {
  text: string;
  lang: string;
  speed?: number;
  voice?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

// ✅ SMART HYBRID: Default config with WAV for Armenian
export const DEFAULT_AUDIO_CONFIG: LessonAudioConfig = {
  mode: "on",
  source: "wav",
  autoPlayQuestions: true,
  autoPlayAnswers: false,
  autoPlayCorrect: true,
  autoPlayFeedback: true,
  speed: 0.85,
  voice: "Avet",
};

const STORAGE_KEY = "nur_audio_config";

export function loadAudioConfig(): LessonAudioConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_AUDIO_CONFIG, ...parsed };
    }
  } catch {
    // Ignore
  }
  return DEFAULT_AUDIO_CONFIG;
}

export function saveAudioConfig(config: LessonAudioConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore
  }
}

// ✅ Type guard for prompt
function isValidPrompt(value: any): value is Record<string, string> {
  return value && typeof value === 'object' && 
    typeof value.hy === 'string' && 
    typeof value.en === 'string';
}

// ✅ Type guard for MultiText
function isValidMultiText(value: any): value is Record<string, string> {
  return value && typeof value === 'object' && 
    (typeof value.hy === 'string' || typeof value.en === 'string');
}

export function getAudioText(exercise: MultiExercise, lang: string): string {
  // ✅ Safe prompt access with type guard
  let prompt = "";
  if (exercise.prompt && isValidPrompt(exercise.prompt)) {
    prompt = exercise.prompt[lang] || exercise.prompt.en || "";
  }
  
  // For questions, use the prompt
  if (exercise.type === "multiple_choice" || exercise.type === "translate") {
    return prompt;
  }
  
  // For listening, use TTS text
  if (exercise.type === "listening" && exercise.ttsText) {
    return exercise.ttsText;
  }
  
  // For word order, use the prompt or words
  if (exercise.type === "word_order") {
    if (exercise.words && exercise.words.length > 0) {
      return exercise.words.join(" ");
    }
    return prompt;
  }
  
  // For match pairs, build text from pairs
  if (exercise.type === "match_pairs" && exercise.pairs) {
    const pairsText = exercise.pairs
      .map(([left, right]) => `${left} → ${right}`)
      .join(", ");
    return pairsText || prompt;
  }
  
  return prompt;
}

export function getCorrectAnswerText(exercise: MultiExercise, lang: string): string {
  // ✅ Safe access to targetAnswer
  if (exercise.targetAnswer) {
    return exercise.targetAnswer;
  }
  
  // For match pairs, build from pairs
  if (exercise.type === "match_pairs" && exercise.pairs) {
    return exercise.pairs
      .map(([left, right]) => `${left} → ${right}`)
      .join(", ");
  }
  
  // For word order, build from words
  if (exercise.type === "word_order" && exercise.words) {
    return exercise.words.join(" ");
  }
  
  return "";
}

// ✅ REMOVED: feedback access since MultiExercise doesn't have feedback property
// Instead, use hardcoded feedback messages

export function getFeedbackText(exercise: MultiExercise, isCorrect: boolean, lang: string): string {
  // ✅ FIXED: No feedback property in MultiExercise
  // Use hardcoded feedback messages
  
  // Check if exercise has hint property for more context
  const hint = exercise.hint && isValidMultiText(exercise.hint) 
    ? exercise.hint[lang] || exercise.hint.en || "" 
    : "";
  
  if (isCorrect) {
    // Random correct feedback messages
    const correctMessages = [
      "✅ Ճիշտ է!",
      "👍 Լավ աշխատանք!",
      "🎉 Շատ լավ!",
      "💪 Հիանալի!",
      "🌟 Գերազանց!",
    ];
    // Use hint for context if available
    if (hint) {
      return `✅ Ճիշտ է! 💡 ${hint}`;
    }
    return correctMessages[Math.floor(Math.random() * correctMessages.length)];
  }
  
  // Random incorrect feedback messages
  const incorrectMessages = [
    "❌ Սխալ է, փորձիր նորից",
    "🤔 Չէ, փորձիր կրկին",
    "💪 Մի հանձնվիր, փորձիր նորից",
    "🔄 Կրկին փորձիր",
  ];
  
  if (hint) {
    return `❌ Սխալ է: 💡 ${hint}`;
  }
  return incorrectMessages[Math.floor(Math.random() * incorrectMessages.length)];
}

// ✅ Helper to get exercise title
export function getExerciseTitle(exercise: MultiExercise, lang: string): string {
  // Check for title in prompt
  if (exercise.prompt && isValidPrompt(exercise.prompt)) {
    return exercise.prompt[lang] || exercise.prompt.en || exercise.type;
  }
  return exercise.type;
}

// ✅ Helper to check if audio should play for exercise
export function shouldPlayAudio(exercise: MultiExercise, config: LessonAudioConfig): boolean {
  if (config.mode === "off") return false;
  if (config.mode === "auto") {
    // Auto mode: play only for listening exercises
    return exercise.type === "listening";
  }
  // On mode: play for all exercises
  return true;
}

// ✅ Helper to get TTS language
export function getTTSLang(exercise: MultiExercise, defaultLang: string = "hy"): string {
  return exercise.ttsLang || defaultLang;
}

// ✅ Helper to get exercise type label
export function getExerciseTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    multiple_choice: "Բազմակի ընտրություն",
    translate: "Թարգմանություն",
    listening: "Լսողություն",
    word_order: "Բառերի դասավորություն",
    match_pairs: "Զույգերի համապատասխանեցում",
    fill_in_blank: "Բաց թողնված բառ",
    speaking: "Խոսք",
  };
  return labels[type] || type;
}