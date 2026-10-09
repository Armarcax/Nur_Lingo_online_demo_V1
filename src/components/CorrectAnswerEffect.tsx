// src/components/CorrectAnswerEffect.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface CorrectAnswerEffectProps {
  show: boolean;
  intensity?: "normal" | "perfect";
}

export function CorrectAnswerEffect({
  show,
  intensity = "normal",
}: CorrectAnswerEffectProps) {
  const [isActive, setIsActive] = useState(false);
  const [flashKey, setFlashKey] = useState(0);

  useEffect(() => {
    if (!show) {
      setIsActive(false);
      return;
    }

    setIsActive(true);
    setFlashKey((k) => k + 1);

    // Dynamically import canvas-confetti (SSR safe)
    let cancelled = false;

    (async () => {
      try {
        const confettiModule = await import("canvas-confetti");
        const confetti = confettiModule.default;

        if (cancelled) return;

        // ─── Emoji shapes (HAYQ themed) ───
        const coin = confetti.shapeFromText({ text: "🪙", scalar: 2.5 });
        const star = confetti.shapeFromText({ text: "⭐", scalar: 2 });
        const sparkle = confetti.shapeFromText({ text: "✨", scalar: 1.8 });
        const trophy = confetti.shapeFromText({ text: "🏆", scalar: 2.2 });
        const apple = confetti.shapeFromText({ text: "🍎", scalar: 2 });
        const party = confetti.shapeFromText({ text: "🎉", scalar: 2.4 });

        const isPerfect = intensity === "perfect";
        const mult = isPerfect ? 1.8 : 1;

        // ─── BURST 1: Center explosion (HAYQ coins + stars) ───
        confetti({
          particleCount: Math.round(120 * mult),
          spread: 160,
          startVelocity: 70,
          origin: { y: 0.6, x: 0.5 },
          shapes: [coin, star, sparkle, trophy, party],
          scalar: isPerfect ? 1.4 : 1.1,
          gravity: 0.9,
          drift: 0,
          ticks: 250,
          zIndex: 9998,
        });

        // ─── BURST 2: Left cannon ───
        setTimeout(() => {
          if (cancelled) return;
          confetti({
            particleCount: Math.round(50 * mult),
            angle: 60,
            spread: 70,
            origin: { x: 0, y: 0.7 },
            colors: ["#F2A800", "#FFD700", "#D90012", "#FFFFFF"],
            shapes: ["circle", "square", "star"],
            scalar: 1.2,
            gravity: 0.85,
            ticks: 250,
            zIndex: 9998,
          });
        }, 100);

        // ─── BURST 3: Right cannon ───
        setTimeout(() => {
          if (cancelled) return;
          confetti({
            particleCount: Math.round(50 * mult),
            angle: 120,
            spread: 70,
            origin: { x: 1, y: 0.7 },
            colors: ["#F2A800", "#FFD700", "#0033A0", "#FFFFFF"],
            shapes: ["circle", "square", "star"],
            scalar: 1.2,
            gravity: 0.85,
            ticks: 250,
            zIndex: 9998,
          });
        }, 100);

        // ─── BURST 4: Armenian flag fountain (perfect only) ───
        if (isPerfect) {
          setTimeout(() => {
            if (cancelled) return;
            confetti({
              particleCount: 70,
              spread: 180,
              startVelocity: 45,
              origin: { y: 0.5, x: 0.5 },
              colors: ["#D90012", "#0033A0", "#F2A800"],
              shapes: ["square"],
              scalar: 1.5,
              gravity: 0.9,
              ticks: 300,
              zIndex: 9998,
            });
          }, 250);

          // Extra apple + trophy burst
          setTimeout(() => {
            if (cancelled) return;
            confetti({
              particleCount: 30,
              spread: 120,
              startVelocity: 40,
              origin: { y: 0.4, x: 0.5 },
              shapes: [apple, trophy],
              scalar: 2,
              gravity: 1,
              ticks: 250,
              zIndex: 9998,
            });
          }, 400);

          // Side sparkle rain (perfect only)
          setTimeout(() => {
            if (cancelled) return;
            confetti({
              particleCount: 40,
              angle: 90,
              spread: 140,
              startVelocity: 30,
              origin: { x: 0.5, y: 0.3 },
              shapes: [sparkle, star],
              scalar: 1.5,
              gravity: 0.7,
              ticks: 300,
              zIndex: 9998,
            });
          }, 550);
        }

        // ─── BURST 5: Continuous sparkle rain ───
        const end = Date.now() + (isPerfect ? 2000 : 1200);
        const interval = setInterval(() => {
          if (cancelled || Date.now() > end) {
            clearInterval(interval);
            return;
          }
          confetti({
            particleCount: 3,
            angle: 90,
            spread: 90,
            startVelocity: 20,
            origin: { x: Math.random(), y: -0.1 },
            shapes: [sparkle, star],
            scalar: 1.2,
            gravity: 0.6,
            ticks: 300,
            zIndex: 9998,
          });
        }, 80);

        setTimeout(() => clearInterval(interval), isPerfect ? 2200 : 1400);
      } catch (error) {
        console.warn("Confetti effect failed:", error);
      }
    })();

    const timer = setTimeout(() => {
      if (!cancelled) setIsActive(false);
    }, intensity === "perfect" ? 2500 : 1800);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [show, intensity]);

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* ─── LAYER 0: Screen flash (very subtle) ─── */}
          <motion.div
            key={`flash-${flashKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed inset-0 pointer-events-none z-[9996]"
            style={{
              background:
                intensity === "perfect"
                  ? "radial-gradient(circle at center, #F2A800 0%, transparent 60%)"
                  : "radial-gradient(circle at center, #10b981 0%, transparent 60%)",
            }}
          />

          {/* ─── LAYER 1: Central glow pulse ─── */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 2.5, 4],
              opacity: [0, 0.6, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-[9997]"
            style={{
              width: "200px",
              height: "200px",
              background: `radial-gradient(circle, ${
                intensity === "perfect" ? "#F2A800" : "#10b981"
              } 0%, transparent 70%)`,
            }}
          />

          {/* ─── LAYER 2: Perfect — extra ring pulse ─── */}
          {intensity === "perfect" && (
            <>
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: [0, 3, 5], opacity: [0.8, 0.4, 0] }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 pointer-events-none z-[9997]"
                style={{
                  width: "150px",
                  height: "150px",
                  borderColor: "#F2A800",
                }}
              />
              <motion.div
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: [0, 4, 7], opacity: [0.6, 0.3, 0] }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 pointer-events-none z-[9997]"
                style={{
                  width: "120px",
                  height: "120px",
                  borderColor: "#FFD700",
                }}
              />
            </>
          )}

          {/* ─── LAYER 3: Corner sparkles (perfect only) ─── */}
          {intensity === "perfect" && (
            <>
              {[
                { x: "10%", y: "15%", delay: 0 },
                { x: "90%", y: "15%", delay: 0.15 },
                { x: "10%", y: "85%", delay: 0.3 },
                { x: "90%", y: "85%", delay: 0.45 },
              ].map((pos, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0, rotate: 0 }}
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: pos.delay,
                    ease: "easeOut",
                  }}
                  className="fixed pointer-events-none z-[9997]"
                  style={{
                    left: pos.x,
                    top: pos.y,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    className="text-6xl"
                    style={{
                      filter: "drop-shadow(0 0 20px #F2A800)",
                    }}
                  >
                    ✨
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

export default CorrectAnswerEffect;