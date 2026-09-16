// src/components/NuriRain.tsx

"use client";

import { useEffect, useRef } from "react";

interface Drop {
  x: number;
  y: number;
  speed: number;
  size: number;
  char: string;
  lang: string;
  opacity: number;
}

export function NuriRain({ 
  langs = ["hy", "en", "ru"], 
  count = 50, 
  speed = 1 
}: { 
  langs?: string[]; 
  count?: number; 
  speed?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    resize();
    window.addEventListener("resize", resize);

    const drops: Drop[] = [];
    
    const chars = {
      hy: ["ա", "բ", "գ", "դ", "ե", "զ", "է", "ը", "թ", "ժ", "ի", "լ", "խ", "ծ", "կ", "հ", "ձ", "ղ", "ճ", "մ", "յ", "ն", "շ", "ո", "չ", "պ", "ջ", "ռ", "ս", "վ", "տ", "ր", "ց", "ւ", "փ", "ք", "և", "օ", "ֆ"],
      en: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
      ru: ["А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "И", "Й", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "Ь", "Э", "Ю", "Я"],
    };

    const getRandomChar = (lang: string) => {
      const charSet = chars[lang as keyof typeof chars] || chars.hy;
      return charSet[Math.floor(Math.random() * charSet.length)];
    };

    const getRandomLang = () => {
      return langs[Math.floor(Math.random() * langs.length)];
    };

    for (let i = 0; i < count; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: Math.random() * 2 * speed + 0.5,
        size: Math.random() * 20 + 10,
        char: getRandomChar(getRandomLang()),
        lang: getRandomLang(),
        opacity: Math.random() * 0.6 + 0.2,
      });
    }

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const drop of drops) {
        ctx.font = `${drop.size}px Arial`;
        ctx.fillStyle = `rgba(255, 255, 255, ${drop.opacity})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(drop.char, drop.x, drop.y);

        drop.y += drop.speed;

        if (drop.y > height) {
          drop.y = -drop.size;
          drop.x = Math.random() * width;
          drop.speed = Math.random() * 2 * speed + 0.5;
          drop.char = getRandomChar(getRandomLang());
          drop.lang = getRandomLang();
          drop.opacity = Math.random() * 0.6 + 0.2;
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [langs, count, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
}