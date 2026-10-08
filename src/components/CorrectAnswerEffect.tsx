// src/components/CorrectAnswerEffect.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface CorrectAnswerEffectProps {
  show: boolean;
  intensity?: "normal" | "perfect";
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
  duration: number;
  shape: "circle" | "square" | "star" | "coin" | "sparkle" | "emoji";
  emoji?: string;
}

const COLORS = [
  "#F2A800", // HAYQ gold
  "#FFD700", // bright gold
  "#D90012", // Armenian red
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
];

const EMOJIS = ["🪙", "⭐", "✨", "💫", "🌟", "🎉", "🍎", "🏆"];

export function CorrectAnswerEffect({
  show,
  intensity = "normal",
}: CorrectAnswerEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!show) {
      setParticles([]);
      return;
    }

    const count = intensity === "perfect" ? 60 : 35;
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const shape =
        i % 8 === 0
          ? "emoji"
          : i % 4 === 0
          ? "star"
          : i % 3 === 0
          ? "sparkle"
          : i % 2 === 0
          ? "circle"
          : "square";

      newParticles.push({
        id: i,
        x: (Math.random() - 0.5) * 800, // spread horizontally
        y: -(Math.random() * 600 + 200), // go up
        rotation: Math.random() * 720 - 360,
        scale: Math.random() * 0.8 + 0.6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.3,
        duration: 1.2 + Math.random() * 0.8,
        shape: shape as Particle["shape"],
        emoji:
          shape === "emoji"
            ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
            : undefined,
      });
    }

    setParticles(newParticles);

    // Clear particles after animation
    const timer = setTimeout(() => setParticles([]), 2200);
    return () => clearTimeout(timer);
  }, [show, intensity]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 0,
                rotate: 0,
              }}
              animate={{
                x: p.x,
                y: p.y,
                opacity: [1, 1, 0.8, 0],
                scale: [0, p.scale, p.scale, 0],
                rotate: p.rotation,
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute left-1/2 top-1/2 will-change-transform"
              style={{
                transform: "translate(-50%, -50%)",
              }}
            >
              {p.shape === "emoji" && p.emoji ? (
                <span className="text-3xl">{p.emoji}</span>
              ) : p.shape === "star" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill={p.color}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ) : p.shape === "sparkle" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill={p.color}>
                  <path d="M12 0l2 10 10 2-10 2-2 10-2-10-10-2 10-2z" />
                </svg>
              ) : (
                <div
                  className={
                    p.shape === "circle"
                      ? "rounded-full"
                      : "rounded-sm"
                  }
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: p.color,
                    boxShadow: `0 0 8px ${p.color}80`,
                  }}
                />
              )}
            </motion.div>
          ))}

          {/* Central glow pulse */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 2.5, 3.5],
              opacity: [0, 0.5, 0],
            }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "200px",
              height: "200px",
              background: `radial-gradient(circle, ${
                intensity === "perfect" ? "#F2A800" : "#10b981"
              } 0%, transparent 70%)`,
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}

export default CorrectAnswerEffect;