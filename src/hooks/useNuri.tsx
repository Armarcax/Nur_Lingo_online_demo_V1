// src/hooks/useNuri.tsx

"use client";

import { useNuriEngine } from "@/components/NuriProvider";

export function useNuri() {
  const engine = useNuriEngine();

  return {
    mood: engine.mood,
    message: engine.message,
    animation: engine.animation,
    state: engine.state,
    context: engine.context,
    onCorrect: () => engine.correctAnswer(),
    onWrong: () => engine.wrongAnswer(),
    onLessonComplete: (perfect?: boolean) => engine.completeLesson(perfect),
    onThemeComplete: () => engine.completeTheme(),
    onDailyGoalComplete: () => engine.completeDailyGoal(),
    onSpeak: () => engine.startSpeaking(),
    onStopSpeak: () => engine.stopSpeaking(),
    onListen: () => engine.startListening(),
    onStopListen: () => engine.stopListening(),
    onBreak: () => engine.showBreak(),
    onBreakAccept: () => engine.acceptBreak(),
    onSeedCollect: () => engine.collectSeed(),
    onMedalUnlock: (medal: string) => engine.unlockMedal(medal),
    onResetLesson: () => engine.resetLesson(),
    updateContext: engine.updateContext,
    getState: engine.getState,
    getContext: () => engine.context,
    setPage: engine.setPage,
  };
}

export default useNuri;

// ✅ FIXED: միայն NuriMood
export type { NuriMood } from "@/components/NuriProvider";