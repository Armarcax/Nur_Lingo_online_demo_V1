// src/components/NuriStateManager.tsx
"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Nuri, { type NuriMood } from "@/components/Nuri";
import { useI18n } from "@/hooks/useI18n";

export type NuriState = 
  | "idle" 
  | "happy" 
  | "learning" 
  | "wink" 
  | "listening" 
  | "thinking" 
  | "sleepy" 
  | "encouraging" 
  | "confused" 
  | "celebrating" 
  | "relax" 
  | "surprised" 
  | "shy" 
  | "sad" 
  | "excited" 
  | "proud"
  | "hidden";

interface NuriStateManagerProps {
  children: ReactNode;
  defaultState?: NuriState;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "fixed-center" | "relative";
  size?: number;
  autoIdleTimeout?: number;
  onStateChange?: (state: NuriState) => void;
  className?: string;
}

export function NuriStateManager({
  children,
  defaultState = "idle",
  position = "fixed-center",
  size = 100,
  autoIdleTimeout = 30000,
  onStateChange,
  className = "",
}: NuriStateManagerProps) {
  const { t } = useI18n();
  const [currentState, setCurrentState] = useState<NuriState>(defaultState);
  const [message, setMessage] = useState<string>("");

  // Auto idle timer
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentState !== "idle" && currentState !== "hidden") {
        setCurrentState("idle");
        setMessage(t("nuri_state_idle_message"));
      }
    }, autoIdleTimeout);
    return () => clearTimeout(timer);
  }, [currentState, autoIdleTimeout, t]);

  const setState = useCallback((state: NuriState, msg?: string) => {
    setCurrentState(state);
    if (msg) setMessage(msg);
    onStateChange?.(state);
  }, [onStateChange]);

  const getPositionClasses = () => {
    switch (position) {
      case "top-left": return "fixed top-4 left-4 z-50";
      case "top-right": return "fixed top-4 right-4 z-50";
      case "bottom-left": return "fixed bottom-24 left-4 z-50";
      case "bottom-right": return "fixed bottom-24 right-4 z-50";
      case "fixed-center": return "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50";
      default: return "relative";
    }
  };

  const getMood = (state: NuriState): NuriMood => {
    const map: Record<NuriState, NuriMood> = {
      idle: "idle",
      happy: "happy",
      learning: "learning",
      wink: "wink",
      listening: "listening",
      thinking: "thinking",
      sleepy: "sleepy",
      encouraging: "encouraging",
      confused: "confused",
      celebrating: "celebrating",
      relax: "relax",
      surprised: "surprised",
      shy: "shy",
      sad: "sad",
      excited: "excited",
      proud: "proud",
      hidden: "idle",
    };
    return map[state] || "idle";
  };

  return (
    <>
      <AnimatePresence>
        {currentState !== "hidden" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={`${getPositionClasses()} ${className}`}
          >
            <div className="flex flex-col items-center gap-2">
              <Nuri mood={getMood(currentState)} size={size} glow />
              {message && (
                <div className="bg-white/10 backdrop-blur-none border border-white/10 rounded-xl px-4 py-2 text-xs text-white/70 max-w-[200px] text-center">
                  {message}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}

// ─── HOOK ──────────────────────────────────────────────────────────────

export function useNuriState() {
  const [state, setState] = useState<NuriState>("idle");
  const [message, setMessage] = useState<string>("");

  const setNuriState = useCallback((newState: NuriState, msg?: string) => {
    setState(newState);
    if (msg) setMessage(msg);
  }, []);

  return { state, message, setNuriState, setMessage };
}