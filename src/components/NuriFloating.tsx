// src/components/NuriFloating.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNuriEngine } from "@/components/NuriProvider";
import Nuri, { NuriMood } from "@/components/Nuri";

interface NuriFloatingProps {
  size?: number;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  showMessage?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  onClick?: () => void;
}

export function NuriFloating({
  size = 80,
  position = "bottom-right",
  showMessage = true,
  autoHide = false,
  autoHideDelay = 5000,
  onClick,
}: NuriFloatingProps) {
  const { mood, message, animation, context } = useNuriEngine();

  const [isBlinking, setIsBlinking] = useState(false);
  const [breathScale, setBreathScale] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (autoHide && isMounted) {
      setIsVisible(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);
    }
  }, [autoHide, autoHideDelay, isMounted]);

  const positionClasses = {
    // 📱 Mobile: raise Nuri up so it doesn't overlap the bottom nav
    // 🖥️  Desktop (md+): keep it near the bottom corner
    "bottom-right": "bottom-24 md:bottom-6 right-4",
    "bottom-left": "bottom-24 md:bottom-6 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  const getEmoji = (mood: NuriMood): string => {
    const emojiMap: Record<NuriMood, string> = {
      idle: "🐿️",
      happy: "😊",
      excited: "🤩",
      encouraging: "💪",
      thinking: "🤔",
      listening: "👂",
      sad: "😢",
      confused: "😕",
      celebrating: "🎉",
      surprised: "😲",
      shy: "😊",
      proud: "😌",
      wink: "😉",
      sleepy: "😴",
      wrong: "❌",
      learning: "📚",
      relax: "🧘",
    };
    return emojiMap[mood] || "🐿️";
  };

  const emoji = getEmoji(mood as NuriMood);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className={`fixed ${positionClasses[position]} z-50 cursor-pointer`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onClick}
        >
          <motion.div
            animate={{
              scale: breathScale,
              y: [0, -8, 0],
            }}
            transition={{
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className="relative"
          >
            <Nuri mood={mood} size={size} glow interactive />

            {emoji && (
              <motion.div
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: 20 }}
                className="absolute -top-2 -right-2 text-2xl"
              >
                {emoji}
              </motion.div>
            )}

            {showMessage && message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 shadow-lg whitespace-nowrap"
              >
                <span className="text-xs font-medium text-gray-800 dark:text-white">
                  {message}
                </span>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/90 dark:bg-gray-800/90 border-r border-b border-gray-200 dark:border-gray-700 rotate-45" />
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NuriFloating;