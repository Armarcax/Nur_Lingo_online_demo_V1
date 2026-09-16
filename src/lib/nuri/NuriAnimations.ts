// src/lib/nuri/NuriAnimations.ts
"use client";

export const NuriAnimations = {
  float: {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  },
  jump: {
    y: [0, -20, 0],
    transition: { duration: 0.5, repeat: 1, ease: "easeOut" }
  },
  celebrate: {
    scale: [1, 1.1, 1],
    rotate: [0, 5, -5, 0],
    transition: { duration: 0.5, repeat: 2, ease: "easeInOut" }
  },
  shake: {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.4, repeat: 1, ease: "easeOut" }
  },
  think: {
    rotate: [0, -3, 3, -3, 3, 0],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
  },
  sleep: {
    opacity: [1, 0.8, 1],
    scale: [1, 0.98, 1],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  },
  speak: {
    scaleY: [1, 0.85, 1],
    transition: { duration: 0.3, repeat: Infinity, ease: "easeInOut" }
  },
  idle: {
    y: [0, -2, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  }
};