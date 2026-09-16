// src/lib/nuri/NuriEmotionEngine.ts
"use client";

// NuriMood and nuriImages imported below, alongside NURI_IMAGES re-export

import { NuriMood, nuriImages } from "@/components/Nuri";
import { useI18n } from "@/hooks/useI18n";

export const NURI_IMAGES = nuriImages;

export interface NuriContext {
  page: "home" | "world" | "learn" | "dictionary" | "dialogues" | "stories" | "garden" | "curriculum" | "onboarding" | "user-dictionary" | "vocab-audio";
  lastActionTime: number;
  idleTime: number;
  correctAnswers: number;
  wrongAnswers: number;
  streak: number;
  combo: number;
  perfectLesson: boolean;
  lessonComplete: boolean;
  themeComplete: boolean;
  dailyGoalComplete: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  isRecording: boolean;
  audioLoading: boolean;
  hayqEarned: number;
  medalUnlocked: string | null;
  seedCollected: boolean;
  plantingTree: boolean;
  wateringPlant: boolean;
  breakSuggested: boolean;
  breakAccepted: boolean;
  isEmpty: boolean;
  weather?: "spring" | "summer" | "autumn" | "winter" | "christmas" | "snow";
}

export interface NuriState {
  mood: NuriMood;
  message?: string;
  animation: string;
  emoji: string;
  priority: number;
  duration?: number;
  imagePath: string;
}

export interface NuriEmotionRule {
  condition: (context: NuriContext) => boolean;
  state: NuriState;
}

// ─── RULES ─────────────────────────────────────────────────────────────

// ✅ FIXED: removed "speaking" mood - using "happy" instead
const createRules = (): NuriEmotionRule[] => [
  {
    condition: (ctx) => ctx.breakAccepted && ctx.breakSuggested,
    state: { 
      mood: "relax", 
      message: "☕ Ժամանակն է հանգստի!", 
      animation: "float", 
      emoji: "☕", 
      priority: 100,
      imagePath: NURI_IMAGES.relax
    }
  },
  {
    condition: (ctx) => ctx.medalUnlocked !== null,
    state: { 
      mood: "proud", 
      message: "🏅 Պարգևատրում!", 
      animation: "celebrate", 
      emoji: "🏅", 
      priority: 90,
      imagePath: NURI_IMAGES.proud
    }
  },
  {
    condition: (ctx) => ctx.seedCollected,
    state: { 
      mood: "excited", 
      message: "🌱 Սերմ հավաքեցիր!", 
      animation: "jump", 
      emoji: "🌱", 
      priority: 90,
      imagePath: NURI_IMAGES.excited
    }
  },
  {
    condition: (ctx) => ctx.dailyGoalComplete,
    state: { 
      mood: "proud", 
      message: "🎯 Օրվա նպատակը կատարված է!", 
      animation: "celebrate", 
      emoji: "🎯", 
      priority: 85,
      imagePath: NURI_IMAGES.proud
    }
  },
  {
    condition: (ctx) => ctx.themeComplete,
    state: { 
      mood: "excited", 
      message: "🌟 Թեման ավարտված է!", 
      animation: "celebrate", 
      emoji: "🌟", 
      priority: 80,
      imagePath: NURI_IMAGES.excited
    }
  },
  {
    condition: (ctx) => ctx.lessonComplete && ctx.perfectLesson,
    state: { 
      mood: "surprised", 
      message: "⭐ Անթերի դաս!", 
      animation: "jump", 
      emoji: "⭐", 
      priority: 75,
      imagePath: NURI_IMAGES.surprised
    }
  },
  {
    condition: (ctx) => ctx.lessonComplete && !ctx.perfectLesson,
    state: { 
      mood: "celebrating", 
      message: "🎉 Դասն ավարտված է!", 
      animation: "celebrate", 
      emoji: "🎉", 
      priority: 70,
      imagePath: NURI_IMAGES.celebrating
    }
  },
  {
    condition: (ctx) => ctx.isSpeaking,
    state: { 
      // ✅ FIXED: using "happy" instead of "speaking"
      mood: "happy", 
      message: "🗣️ Լսիր...", 
      animation: "speak", 
      emoji: "🗣️", 
      priority: 55,
      imagePath: NURI_IMAGES.happy
    }
  },
  {
    condition: (ctx) => ctx.isListening || ctx.isRecording,
    state: { 
      mood: "listening", 
      message: "👂 Լսում եմ...", 
      animation: "idle", 
      emoji: "👂", 
      priority: 50,
      imagePath: NURI_IMAGES.listening
    }
  },
  {
    condition: (ctx) => ctx.idleTime > 600000,
    state: { 
      mood: "sleepy", 
      message: "😴 Հանգստացիր...", 
      animation: "sleep", 
      emoji: "😴", 
      priority: 45,
      imagePath: NURI_IMAGES.sleepy
    }
  },
  {
    condition: (ctx) => ctx.idleTime > 300000,
    state: { 
      mood: "relax", 
      message: "🧘 Ժամանակն է ընդմիջման...", 
      animation: "float", 
      emoji: "🧘", 
      priority: 40,
      imagePath: NURI_IMAGES.relax
    }
  },
  {
    condition: (ctx) => ctx.isEmpty,
    state: { 
      mood: "encouraging", 
      message: "📖 Եկեք միասին սկսենք!", 
      animation: "float", 
      emoji: "📖", 
      priority: 40,
      imagePath: NURI_IMAGES.encouraging
    }
  },
  {
    condition: (ctx) => ctx.wrongAnswers >= 2,
    state: { 
      mood: "sad", 
      message: "😢 Մի տխրիր, կփորձենք նորից!", 
      animation: "shake", 
      emoji: "😢", 
      priority: 35,
      imagePath: NURI_IMAGES.sad
    }
  },
  {
    condition: (ctx) => ctx.wrongAnswers === 1,
    state: { 
      mood: "confused", 
      message: "🤔 Փորձիր նորից!", 
      animation: "think", 
      emoji: "🤔", 
      priority: 30,
      imagePath: NURI_IMAGES.confused
    }
  },
  {
    condition: (ctx) => ctx.correctAnswers > 0 && ctx.streak >= 3,
    state: { 
      mood: "happy", 
      message: "🔥 Շարունակի՛ր լավ աշխատանքը!", 
      animation: "float", 
      emoji: "🔥", 
      priority: 25,
      imagePath: NURI_IMAGES.happy
    }
  },
  {
    condition: (ctx) => ctx.correctAnswers > 0,
    state: { 
      mood: "encouraging", 
      message: "💪 Լավ աշխատանք!", 
      animation: "float", 
      emoji: "💪", 
      priority: 20,
      imagePath: NURI_IMAGES.encouraging
    }
  },
  {
    condition: (ctx) => ctx.page === "home",
    state: { 
      mood: "happy", 
      message: "🍎 Բարի գալուստ!", 
      animation: "float", 
      emoji: "🍎", 
      priority: 15,
      imagePath: NURI_IMAGES.happy
    }
  },
  {
    condition: (ctx) => ctx.page === "world",
    state: { 
      mood: "learning", 
      message: "🌍 Եկեք սովորենք!", 
      animation: "float", 
      emoji: "🌍", 
      priority: 15,
      imagePath: NURI_IMAGES.learning
    }
  },
  {
    condition: (ctx) => ctx.page === "dictionary",
    state: { 
      mood: "listening", 
      message: "📖 Նոր բառեր սովորենք!", 
      animation: "idle", 
      emoji: "📖", 
      priority: 15,
      imagePath: NURI_IMAGES.listening
    }
  },
  {
    condition: (ctx) => ctx.page === "user-dictionary",
    state: { 
      mood: "listening", 
      message: "📝 Քո բառարանը!", 
      animation: "idle", 
      emoji: "📝", 
      priority: 15,
      imagePath: NURI_IMAGES.listening
    }
  },
  {
    condition: (ctx) => ctx.page === "vocab-audio",
    state: { 
      mood: "listening", 
      message: "🎧 Լսենք բառերը!", 
      animation: "idle", 
      emoji: "🎧", 
      priority: 15,
      imagePath: NURI_IMAGES.listening
    }
  },
  {
    condition: (ctx) => ctx.page === "dialogues",
    state: { 
      mood: "happy", 
      message: "💬 Զրուցենք հայերեն!", 
      animation: "float", 
      emoji: "💬", 
      priority: 15,
      imagePath: NURI_IMAGES.happy
    }
  },
  {
    condition: (ctx) => ctx.page === "onboarding",
    state: { 
      mood: "relax", 
      message: "🌍 Ընտրիր լեզուն!", 
      animation: "float", 
      emoji: "🌍", 
      priority: 15,
      imagePath: NURI_IMAGES.relax
    }
  },
  {
    condition: () => true,
    state: { 
      mood: "idle", 
      message: "", 
      animation: "idle", 
      emoji: "", 
      priority: 0,
      imagePath: NURI_IMAGES.idle
    }
  }
];

// ─── ENGINE CLASS ──────────────────────────────────────────────────────

export class NuriEmotionEngine {
  private context: NuriContext;
  private rules: NuriEmotionRule[];
  private currentState: NuriState;
  private stateHistory: NuriState[] = [];
  private listeners: ((state: NuriState) => void)[] = [];
  private lastUpdate: number = Date.now();
  private isPaused: boolean = false;

  constructor(initialContext?: Partial<NuriContext>) {
    this.context = {
      page: "home",
      lastActionTime: Date.now(),
      idleTime: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      streak: 0,
      combo: 0,
      perfectLesson: false,
      lessonComplete: false,
      themeComplete: false,
      dailyGoalComplete: false,
      isSpeaking: false,
      isListening: false,
      isRecording: false,
      audioLoading: false,
      hayqEarned: 0,
      medalUnlocked: null,
      seedCollected: false,
      plantingTree: false,
      wateringPlant: false,
      breakSuggested: false,
      breakAccepted: false,
      isEmpty: false,
      ...initialContext
    };
    
    this.rules = createRules();
    this.currentState = { 
      mood: "idle", 
      message: "", 
      animation: "idle", 
      emoji: "", 
      priority: 0,
      imagePath: NURI_IMAGES.idle
    };
    
    this.startIdleTracking();
  }

  private startIdleTracking() {
    setInterval(() => {
      if (!this.isPaused) {
        this.context.idleTime = Date.now() - this.context.lastActionTime;
        this.update();
      }
    }, 1000);
  }

  public updateContext(updates: Partial<NuriContext>) {
    this.context = { ...this.context, ...updates };
    this.context.lastActionTime = Date.now();
    this.context.idleTime = 0;
    this.update();
  }

  private update() {
    const newState = this.evaluate();
    if (newState.mood !== this.currentState.mood || newState.message !== this.currentState.message) {
      this.currentState = newState;
      this.stateHistory.push({ ...newState });
      if (this.stateHistory.length > 100) {
        this.stateHistory.shift();
      }
      this.notifyListeners();
    }
  }

  private evaluate(): NuriState {
    let bestState: NuriState = { 
      mood: "idle", 
      message: "", 
      animation: "idle", 
      emoji: "", 
      priority: -1,
      imagePath: NURI_IMAGES.idle
    };
    
    for (const rule of this.rules) {
      try {
        if (rule.condition(this.context)) {
          if (rule.state.priority > bestState.priority) {
            bestState = rule.state;
          }
        }
      } catch {
        // Skip broken rules
      }
    }
    
    return bestState;
  }

  public subscribe(listener: (state: NuriState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener(this.currentState);
      } catch {
        // Ignore listener errors
      }
    }
  }

  public getState(): NuriState {
    return this.currentState;
  }

  public getContext(): NuriContext {
    return this.context;
  }

  public getMood(): NuriMood {
    return this.currentState.mood;
  }

  public getMessage(): string | undefined {
    return this.currentState.message;
  }

  public getImagePath(): string {
    return this.currentState.imagePath;
  }

  public correctAnswer() {
    this.updateContext({
      correctAnswers: this.context.correctAnswers + 1,
      wrongAnswers: 0,
      streak: this.context.streak + 1,
      combo: this.context.combo + 1
    });
  }

  public wrongAnswer() {
    this.updateContext({
      wrongAnswers: this.context.wrongAnswers + 1,
      combo: 0
    });
  }

  public completeLesson(perfect: boolean = false) {
    this.updateContext({
      lessonComplete: true,
      perfectLesson: perfect
    });
  }

  public completeTheme() {
    this.updateContext({ themeComplete: true });
  }

  public completeDailyGoal() {
    this.updateContext({ dailyGoalComplete: true });
  }

  public startSpeaking() {
    this.updateContext({ isSpeaking: true });
  }

  public stopSpeaking() {
    this.updateContext({ isSpeaking: false });
  }

  public startListening() {
    this.updateContext({ isListening: true });
  }

  public stopListening() {
    this.updateContext({ isListening: false });
  }

  public showBreak() {
    this.updateContext({ breakSuggested: true });
  }

  public acceptBreak() {
    this.updateContext({ breakAccepted: true });
  }

  public collectSeed() {
    this.updateContext({ seedCollected: true });
    setTimeout(() => {
      this.updateContext({ seedCollected: false });
    }, 3000);
  }

  public unlockMedal(medal: string) {
    this.updateContext({ medalUnlocked: medal });
    setTimeout(() => {
      this.updateContext({ medalUnlocked: null });
    }, 5000);
  }

  public resetLesson() {
    this.updateContext({
      correctAnswers: 0,
      wrongAnswers: 0,
      lessonComplete: false,
      perfectLesson: false,
      combo: 0
    });
  }

  public setPage(page: NuriContext["page"]) {
    this.updateContext({ page });
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
  }

  public exportState(): string {
    return JSON.stringify({
      context: this.context,
      state: this.currentState,
      history: this.stateHistory.slice(-10)
    });
  }

  public importState(data: string) {
    try {
      const parsed = JSON.parse(data);
      if (parsed.context) {
        this.context = parsed.context;
        this.currentState = parsed.state || this.currentState;
        this.update();
      }
    } catch {
      // Ignore invalid data
    }
  }
}