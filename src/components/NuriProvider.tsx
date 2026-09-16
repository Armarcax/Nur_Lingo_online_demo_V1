// src/components/NuriProvider.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { NuriEmotionEngine, NuriContext, NuriState } from "@/lib/nuri/NuriEmotionEngine";
import { NuriMood } from "@/components/Nuri";
import { useI18n } from "@/hooks/useI18n";
// ✅ ԱՄԲՈՂՋԱԿԱՆ PAGE TYPE-Ը
type Page = 
  | "home" 
  | "world" 
  | "dictionary" 
  | "user-dictionary" 
  | "vocab-audio" 
  | "garden" 
  | "learn" 
  | "dialogues" 
  | "curriculum" 
  | "stories" 
  | "onboarding";

interface NuriProviderProps {
  children: ReactNode;
  initialContext?: Partial<NuriContext>;
}

interface NuriContextValue {
  engine: NuriEmotionEngine;
  mood: NuriMood;
  message: string | undefined;
  animation: string;
  state: NuriState;
  context: NuriContext;
  correctAnswer: () => void;
  wrongAnswer: () => void;
  completeLesson: (perfect?: boolean) => void;
  completeTheme: () => void;
  completeDailyGoal: () => void;
  startSpeaking: () => void;
  stopSpeaking: () => void;
  startListening: () => void;
  stopListening: () => void;
  showBreak: () => void;
  acceptBreak: () => void;
  collectSeed: () => void;
  unlockMedal: (medal: string) => void;
  resetLesson: () => void;
  updateContext: (updates: Partial<NuriContext>) => void;
  getState: () => NuriState;
  setPage: (page: Page) => void;
  getImagePath: () => string;
}

const NuriContextProvider = createContext<NuriContextValue | null>(null);

export function NuriProvider({ children, initialContext }: NuriProviderProps) {
  const { t } = useI18n();
  const [engine] = useState(() => new NuriEmotionEngine(initialContext));
  const [mood, setMood] = useState<NuriMood>("idle");
  const [message, setMessage] = useState<string | undefined>("");
  const [animation, setAnimation] = useState<string>("idle");
  const [state, setState] = useState<NuriState>({ 
    mood: "idle", 
    message: "", 
    animation: "idle", 
    emoji: "", 
    priority: 0, 
    imagePath: "/images/nuri/nuri-idle.png" 
  });
  const [context, setContext] = useState<NuriContext>(engine.getContext());
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = engine.subscribe((newState) => {
      if (isMounted.current) {
        setMood(newState.mood);
        setMessage(newState.message);
        setAnimation(newState.animation);
        setState(newState);
        setContext(engine.getContext());
      }
    });
    return unsubscribe;
  }, [engine]);

  const value: NuriContextValue = {
    engine,
    mood,
    message,
    animation,
    state,
    context,
    correctAnswer: () => engine.correctAnswer(),
    wrongAnswer: () => engine.wrongAnswer(),
    completeLesson: (perfect?: boolean) => engine.completeLesson(perfect),
    completeTheme: () => engine.completeTheme(),
    completeDailyGoal: () => engine.completeDailyGoal(),
    startSpeaking: () => engine.startSpeaking(),
    stopSpeaking: () => engine.stopSpeaking(),
    startListening: () => engine.startListening(),
    stopListening: () => engine.stopListening(),
    showBreak: () => engine.showBreak(),
    acceptBreak: () => engine.acceptBreak(),
    collectSeed: () => engine.collectSeed(),
    unlockMedal: (medal: string) => engine.unlockMedal(medal),
    resetLesson: () => engine.resetLesson(),
    updateContext: (updates: Partial<NuriContext>) => engine.updateContext(updates),
    getState: () => engine.getState(),
    setPage: (page: Page) => engine.setPage(page),
    getImagePath: () => engine.getImagePath(),
  };

  return <NuriContextProvider.Provider value={value}>{children}</NuriContextProvider.Provider>;
}

export function useNuriEngine() {
  const context = useContext(NuriContextProvider);
  if (!context) {
    throw new Error("useNuriEngine must be used within NuriProvider");
  }
  return context;
}

// ✅ EXPORT TYPE-ՆԵՐԸ
export type { Page, NuriMood, NuriContext, NuriState };