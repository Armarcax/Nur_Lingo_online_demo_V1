// src/components/Nuri.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/hooks/useI18n";

export type NuriMood = 
  | "idle" 
  | "happy" 
  | "thinking" 
  | "celebrating" 
  | "sad" 
  | "encouraging" 
  | "excited" 
  | "surprised"
  | "confused"
  | "proud"
  | "listening"
  | "sleepy"
  | "wink"
  | "wrong"
  | "learning"
  | "relax"
  | "shy";

interface NuriProps {
  mood?: NuriMood;
  size?: number;
  animate?: boolean;
  className?: string;
  glow?: boolean;
  tear?: boolean;
  autoRotate?: boolean;
  onClick?: () => void;
  interactive?: boolean;
  demo?: boolean;
  message?: string;
  speechDelay?: number;
  imagePath?: string;
  state?: "idle" | "thinking" | "sleepy" | "celebrating" | "proud" | "learning";
  position?: "fixed" | "sticky" | "absolute" | "relative";
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

interface Particle {
  emoji: string;
  position: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    transform?: string;
  };
}

// ─── MOOD EMOJIS ──────────────────────────────────────────────────────

export const moodEmojis: Record<NuriMood, string> = {
  idle: "🧘",
  happy: "😊",
  thinking: "🤔",
  celebrating: "🎉",
  sad: "😢",
  wrong: "😢",
  encouraging: "💪",
  excited: "🤩",
  surprised: "😲",
  confused: "😕",
  proud: "🦚",
  listening: "👂",
  sleepy: "😴",
  wink: "😉",
  learning: "📚",
  relax: "🧘‍♀️",
  shy: "😊",
};

// ─── MOOD COLORS ──────────────────────────────────────────────────────

export const moodColors: Record<NuriMood, string> = {
  idle: "border-white/20 bg-white/5 backdrop-blur-soft",
  happy: "border-emerald-400/50 bg-emerald-950/40 backdrop-blur-soft",
  thinking: "border-blue-400/50 bg-blue-950/40 backdrop-blur-soft",
  celebrating: "border-yellow-400/50 bg-yellow-950/40 backdrop-blur-soft",
  sad: "border-red-400/50 bg-red-950/40 backdrop-blur-soft",
  wrong: "border-red-500/70 bg-red-950/50 backdrop-blur-soft",
  encouraging: "border-orange-400/50 bg-orange-950/40 backdrop-blur-soft",
  excited: "border-pink-400/50 bg-pink-950/40 backdrop-blur-soft",
  surprised: "border-purple-400/50 bg-purple-950/40 backdrop-blur-soft",
  confused: "border-amber-400/50 bg-amber-950/40 backdrop-blur-soft",
  proud: "border-indigo-400/50 bg-indigo-950/40 backdrop-blur-soft",
  listening: "border-cyan-400/50 bg-cyan-950/40 backdrop-blur-soft",
  sleepy: "border-gray-400/50 bg-gray-950/40 backdrop-blur-soft",
  wink: "border-teal-400/50 bg-teal-950/40 backdrop-blur-soft",
  learning: "border-blue-500/50 bg-blue-950/40 backdrop-blur-soft",
  relax: "border-purple-400/40 bg-purple-950/30 backdrop-blur-soft",
  shy: "border-pink-400/40 bg-pink-950/30 backdrop-blur-soft",
};

// ─── GLOW COLORS ──────────────────────────────────────────────────────

export const glowColors: Record<NuriMood, string> = {
  idle: "bg-white/10",
  happy: "bg-emerald-400/30",
  thinking: "bg-blue-400/30",
  celebrating: "bg-yellow-400/30",
  sad: "bg-red-400/30",
  wrong: "bg-red-500/40",
  encouraging: "bg-orange-400/30",
  excited: "bg-pink-400/30",
  surprised: "bg-purple-400/30",
  confused: "bg-amber-400/30",
  proud: "bg-indigo-400/30",
  listening: "bg-cyan-400/30",
  sleepy: "bg-gray-400/20",
  wink: "bg-teal-400/30",
  learning: "bg-blue-500/30",
  relax: "bg-purple-400/25",
  shy: "bg-pink-400/25",
};

// ─── NURI IMAGE MAPPING ──────────────────────────────────────────────

export const nuriImages: Record<NuriMood, string> = {
  idle: "/images/nuri/nuri-idle.png",
  happy: "/images/nuri/nuri-happy.png",
  thinking: "/images/nuri/nuri-thinking.png",
  celebrating: "/images/nuri/nuri-celebrating.png",
  sad: "/images/nuri/nuri-sad.png",
  wrong: "/images/nuri/nuri-confused.png",
  encouraging: "/images/nuri/nuri-encouraging.png",
  excited: "/images/nuri/nuri-excited.png",
  surprised: "/images/nuri/nuri-surprised.png",
  confused: "/images/nuri/nuri-confused.png",
  proud: "/images/nuri/nuri-proud.png",
  listening: "/images/nuri/nuri-listening.png",
  sleepy: "/images/nuri/nuri-sleepy.png",
  wink: "/images/nuri/nuri-wink.png",
  learning: "/images/nuri/nuri-learning.png",
  relax: "/images/nuri/nuri-relax.png",
  shy: "/images/nuri/nuri-shy.png",
};

// ─── MOOD LABELS ──────────────────────────────────────────────────────

export const moodLabels: Record<NuriMood, string> = {
  idle: "nuri_mood_idle",
  happy: "nuri_mood_happy",
  thinking: "nuri_mood_thinking",
  celebrating: "nuri_mood_celebrating",
  sad: "nuri_mood_sad",
  wrong: "nuri_mood_wrong",
  encouraging: "nuri_mood_encouraging",
  excited: "nuri_mood_excited",
  surprised: "nuri_mood_surprised",
  confused: "nuri_mood_confused",
  proud: "nuri_mood_proud",
  listening: "nuri_mood_listening",
  sleepy: "nuri_mood_sleepy",
  wink: "nuri_mood_wink",
  learning: "nuri_mood_learning",
  relax: "nuri_mood_relax",
  shy: "nuri_mood_shy",
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function Nuri({
  mood = "idle",
  size = 120,
  animate = true,
  className = "",
  glow = false,
  tear = false,
  autoRotate = false,
  onClick,
  interactive = false,
  demo = false,
  message,
  speechDelay = 0,
  imagePath,
  state,
  position = "relative",
  top,
  right,
  bottom,
  left,
}: NuriProps) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);
  const [currentMood, setCurrentMood] = useState<NuriMood>(mood);
  const [showMessage, setShowMessage] = useState(false);
  const sleepTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentMood(mood);
  }, [mood]);

  useEffect(() => {
    if (!demo) return;
    const moods: NuriMood[] = ["idle", "happy", "thinking", "wink", "happy"];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % moods.length;
      setCurrentMood(moods[index]);
    }, 3000);
    return () => clearInterval(interval);
  }, [demo]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setShowMessage(true), speechDelay);
      return () => clearTimeout(timer);
    }
  }, [message, speechDelay]);

  useEffect(() => {
    if (state) {
      const stateToMood: Record<string, NuriMood> = {
        idle: "idle",
        thinking: "thinking",
        sleepy: "sleepy",
        celebrating: "celebrating",
        proud: "proud",
        learning: "learning",
      };
      setCurrentMood(stateToMood[state] || mood);
    }
  }, [state, mood]);

  useEffect(() => {
    if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);

    if (mood === "thinking" || mood === "learning") {
      sleepTimeoutRef.current = setTimeout(() => {
        setCurrentMood((cur) => (cur !== "sleepy" && cur !== "idle" ? "sleepy" : cur));
      }, 2000);
    }

    return () => {
      if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);
    };
  }, [mood]);

  const effectiveMood = currentMood;
  const effectiveImage = imagePath || nuriImages[effectiveMood] || nuriImages.idle;

  const getPositionClasses = () => {
    const posMap: Record<string, string> = {
      fixed: "fixed z-50",
      sticky: "sticky z-50",
      absolute: "absolute z-50",
      relative: "relative",
    };
    return posMap[position] || "relative";
  };

  const getPositionStyles = () => {
    const styles: React.CSSProperties = {};
    if (top !== undefined) styles.top = top;
    if (right !== undefined) styles.right = right;
    if (bottom !== undefined) styles.bottom = bottom;
    if (left !== undefined) styles.left = left;
    return styles;
  };

  const getAnimation = () => {
    if (!animate) return {};
    
    switch (effectiveMood) {
      case "happy":
        return { y: [0, -15, 0], rotate: [0, 5, -5, 0], scale: [1, 1.02, 1] };
      case "excited":
        return { scale: [1, 1.15, 1], y: [0, -20, 0, -20, 0], rotate: [0, 8, -8, 8, -8, 0] };
      case "celebrating":
        return { scale: [1, 1.1, 1], rotate: [0, 360], y: [0, -10, 0] };
      case "sad":
        return { x: [0, -3, 3, -3, 3, 0], y: [0, 3, 0], scale: [1, 0.98, 1] };
      case "wrong":
        return { x: [0, -5, 5, -5, 5, 0], y: [0, 5, 0], scale: [1, 0.95, 1], rotate: [0, -5, 5, -5, 5, 0] };
      case "encouraging":
        return { scale: [1, 1.06, 1], rotate: [0, 3, -3, 0], y: [0, -4, 0] };
      case "thinking":
        return { rotate: [0, -6, 6, 0], x: [0, 3, -3, 0], y: [0, -2, 0] };
      case "surprised":
        return { scale: [1, 1.12, 1], y: [0, -8, 0] };
      case "confused":
        return { rotate: [0, -4, 4, -4, 0], x: [0, 2, -2, 0] };
      case "proud":
        return { y: [0, -8, 0], scale: [1, 1.04, 1], rotate: [0, 2, -2, 0] };
      case "listening":
        return { x: [0, 4, -4, 0], y: [0, -2, 0] };
      case "sleepy":
        return { y: [0, -3, 0], rotate: [0, 3, -3, 0], opacity: [1, 0.9, 1, 0.9, 1] };
      case "wink":
        return { scale: [1, 1.05, 1], rotate: [0, 3, -3, 0] };
      case "learning":
        return { y: [0, -6, 0], rotate: [0, 2, -2, 0] };
      case "relax":
        return { y: [0, -4, 0], rotate: [0, 1, -1, 0] };
      case "shy":
        return { scale: [1, 0.95, 1], rotate: [0, -3, 3, 0] };
      default:
        return { y: [0, -6, 0], rotate: [0, 1, -1, 0] };
    }
  };

  const getTransition = () => {
    switch (effectiveMood) {
      case "excited":
        return { duration: 0.5, repeat: Infinity, ease: "easeInOut" };
      case "happy":
        return { duration: 0.6, repeat: Infinity, ease: "easeInOut" };
      case "celebrating":
        return { duration: 1.2, repeat: Infinity, ease: "linear" };
      case "sad":
        return { duration: 2.5, repeat: Infinity };
      case "wrong":
        return { duration: 2.0, repeat: Infinity };
      case "sleepy":
        return { duration: 3.5, repeat: Infinity };
      case "learning":
        return { duration: 3, repeat: Infinity, ease: "easeInOut" };
      default:
        return { duration: 3, repeat: Infinity, ease: "easeInOut" };
    }
  };

  const renderParticles = (): Particle[] => {
    const particles: Particle[] = [];
    
    if (effectiveMood === "celebrating" || effectiveMood === "excited") {
      particles.push(
        { emoji: "⭐", position: { top: "-12px", right: "-4px" } },
        { emoji: "✨", position: { top: "4px", left: "-10px" } },
        { emoji: "💫", position: { bottom: "8px", right: "-8px" } },
        { emoji: "🎊", position: { top: "-20px", left: "50%" } }
      );
    }
    
    if (effectiveMood === "thinking") {
      particles.push(
        { emoji: "💭", position: { top: "-10px", right: "-2px" } },
        { emoji: "❓", position: { top: "-20px", left: "30%" } }
      );
    }
    
    if (effectiveMood === "happy") {
      particles.push({ emoji: "🌸", position: { top: "-8px", right: "-6px" } });
    }
    
    if (effectiveMood === "proud") {
      particles.push({ emoji: "🌟", position: { top: "-14px", right: "10%" } });
    }
    
    if (effectiveMood === "listening") {
      particles.push({ emoji: "👂", position: { top: "-8px", right: "-8px" } });
    }
    
    if (effectiveMood === "sleepy") {
      particles.push({ emoji: "💤", position: { top: "-10px", right: "20%" } });
    }
    
    if (effectiveMood === "excited") {
      particles.push({ emoji: "🔥", position: { top: "-24px", left: "50%", transform: "translateX(-50%)" } });
    }

    if (effectiveMood === "wrong") {
      particles.push(
        { emoji: "😢", position: { top: "-8px", right: "-12px" } },
        { emoji: "💧", position: { top: "10px", left: "-8px" } }
      );
    }

    if (effectiveMood === "learning") {
      particles.push(
        { emoji: "📖", position: { top: "-10px", left: "-10px" } },
        { emoji: "✏️", position: { top: "-8px", right: "-8px" } }
      );
    }

    if (effectiveMood === "relax") {
      particles.push(
        { emoji: "☕", position: { top: "-12px", left: "10%" } },
        { emoji: "🌿", position: { top: "-8px", right: "15%" } }
      );
    }

    return particles;
  };

  const getStateClassName = () => {
    const stateMap: Record<string, string> = {
      idle: "nuri-state-idle",
      thinking: "nuri-state-thinking",
      sleepy: "nuri-state-sleepy",
      celebrating: "nuri-state-celebrating",
      proud: "nuri-state-proud",
      learning: "nuri-state-learning",
    };
    return state ? stateMap[state] || "" : "";
  };

  return (
    <div className={`relative inline-flex flex-col items-center ${getPositionClasses()}`} style={getPositionStyles()}>
      <motion.div
        className={`relative inline-block cursor-${interactive ? 'pointer' : 'default'} ${className} ${getStateClassName()}`}
        animate={getAnimation()}
        transition={getTransition()}
        style={{ width: size, height: size }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        whileHover={interactive ? { scale: 1.08, transition: { duration: 0.2 } } : undefined}
        whileTap={interactive ? { scale: 0.95 } : undefined}
      >
        {/* Glow Effect */}
        {glow && (
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className={`absolute inset-0 rounded-full -z-10 blur-3xl ${glowColors[effectiveMood]}`}
          />
        )}

        {/* Auto-rotate glow ring */}
        {autoRotate && (
          <motion.div
            className="absolute -inset-2 rounded-full border-2 border-red-500/20 dark:border-red-400/20 -z-5"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Decorative Particles */}
        {renderParticles().map((particle, index) => (
          <motion.div
            key={index}
            className="absolute text-base pointer-events-none"
            style={{
              top: particle.position.top,
              left: particle.position.left,
              right: particle.position.right,
              bottom: particle.position.bottom,
              transform: particle.position.transform
            }}
            animate={
              effectiveMood === "celebrating" || effectiveMood === "excited"
                ? { scale: [1, 1.5, 1], opacity: [1, 0.3, 1], y: [0, -10, 0] }
                : effectiveMood === "thinking"
                ? { opacity: [0, 1, 0], scale: [0.5, 1, 0.5], y: [0, -5, 0] }
                : effectiveMood === "wrong"
                ? { scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8], y: [0, -8, 0] }
                : effectiveMood === "learning"
                ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5], y: [0, -5, 0] }
                : { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }
            }
            transition={{ 
              duration: effectiveMood === "celebrating" || effectiveMood === "excited" 
                ? 0.8 + index * 0.3 
                : effectiveMood === "wrong"
                ? 1.5 + index * 0.2
                : 2 + index,
              repeat: Infinity 
            }}
          >
            {particle.emoji}
          </motion.div>
        ))}

        {/* Main Image */}
        <Image
          src={effectiveImage}
          alt={`Nuri mascot - ${effectiveMood}`}
          width={size}
          height={size}
          priority={["happy", "idle", "encouraging", "sad", "wrong"].includes(effectiveMood)}
          className={`transition-all duration-300 ${isHovered && interactive ? 'scale-105' : ''}`}
        />

        {/* Tear Effect */}
        {(tear || effectiveMood === "wrong") && (effectiveMood === "sad" || effectiveMood === "wrong") && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 20, opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute top-1/2 left-[60%] text-xl pointer-events-none"
          >
            💧
          </motion.div>
        )}

        {/* Heart animation on hover */}
        {isHovered && (effectiveMood === "happy" || effectiveMood === "proud") && (
          <motion.div
            initial={{ scale: 0, y: 0 }}
            animate={{ scale: 1, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute -top-4 -right-4 text-lg pointer-events-none"
          >
            ❤️
          </motion.div>
        )}

        {/* Interactive indicator */}
        {interactive && (
          <motion.div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Speech Bubble */}
      <AnimatePresence>
        {showMessage && message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2"
          >
            <NuriSpeech text={message} mood={effectiveMood} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────

export function getMoodFromScore(
  score: number, 
  accepted: boolean, 
  streak: number = 0,
  attempts: number = 0
): NuriMood {
  if (!accepted) {
    if (attempts >= 2) return "wrong";
    return "confused";
  }
  if (streak >= 10) return "celebrating";
  if (streak >= 5) return "excited";
  if (streak >= 3) return "happy";
  if (score > 80) return "proud";
  return "encouraging";
}

export function getRandomMood(): NuriMood {
  const moods: NuriMood[] = ["happy", "thinking", "wink", "idle", "encouraging"];
  return moods[Math.floor(Math.random() * moods.length)];
}

export function getMoodFromTime(seconds: number): NuriMood {
  if (seconds > 600) return "sleepy";
  if (seconds > 300) return "relax";
  if (seconds > 120) return "thinking";
  return "happy";
}

export function getMoodFromProgress(progress: number, total: number): NuriMood {
  const pct = (progress / total) * 100;
  if (pct === 100) return "celebrating";
  if (pct > 80) return "excited";
  if (pct > 50) return "happy";
  if (pct > 25) return "learning";
  return "encouraging";
}

// ─── SPEECH BUBBLE COMPONENT ─────────────────────────────────────────

interface NuriSpeechProps {
  text: string;
  mood?: NuriMood;
  className?: string;
  animated?: boolean;
  onComplete?: () => void;
}

export function NuriSpeech({ 
  text, 
  mood = "idle", 
  className = "",
  animated = true,
  onComplete 
}: NuriSpeechProps) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!animated) {
      setDisplayText(text);
      return;
    }

    setIsTyping(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [text, animated, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`relative ${className}`}
    >
      <div className={`rounded-2xl border border-white/10 bg-background/60 backdrop-blur-xl px-5 py-3 text-sm text-foreground/90 max-w-[220px] shadow-glass`}>
        <div className="absolute -top-2 left-5 w-3 h-3 rotate-45 border-l border-t bg-inherit border-inherit" />
        <span className="font-medium">
          {displayText}
          {isTyping && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="inline-block w-0.5 h-4 ml-0.5 bg-foreground/60"
            />
          )}
        </span>
      </div>
    </motion.div>
  );
}

// ─── MOOD BADGE ───────────────────────────────────────────────────────

interface NuriMoodBadgeProps {
  mood: NuriMood;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function NuriMoodBadge({ mood, size = "md", showLabel = true }: NuriMoodBadgeProps) {
  const { t } = useI18n();
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full ${moodColors[mood]} border ${sizeClasses[size]}`}>
      <span>{moodEmojis[mood]}</span>
      {showLabel && (
        <span className="text-foreground/70 text-xs font-medium">
          {t(moodLabels[mood])}
        </span>
      )}
    </div>
  );
}