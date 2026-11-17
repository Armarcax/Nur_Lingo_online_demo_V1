// src/components/GrammarUnitCard.tsx
"use client";

import { motion } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";
import type { GrammarUnit } from "@/lib/content/grammar-types";
import { getUnitExercises } from "@/lib/content/grammar-loader";

type NativeLang = "hy" | "ru";

export function GrammarUnitCard({
  unit, nativeLang, onClick,
}: {
  unit: GrammarUnit; nativeLang: NativeLang; onClick: () => void;
}) {
  const title = unit.title?.[nativeLang] ?? unit.title?.hy ?? "";
  const exCount = getUnitExercises(unit).length;
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative cursor-pointer overflow-hidden rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700 bg-gradient-to-br from-indigo-500 to-purple-600"
    >
      <div className="absolute -top-4 -right-4 text-9xl opacity-20 transform rotate-12">📖</div>
      <span className="inline-block text-[10px] font-black text-white/90 uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">
        Grammar Practice
      </span>
      <h3 className="text-2xl font-black text-white mt-6 mb-1 drop-shadow-md">{title}</h3>
      {unit.cefr && <p className="text-sm text-white/80 font-medium">CEFR {unit.cefr}</p>}
      <div className="mt-6 flex items-center justify-between text-white/80">
        <span className="text-xs font-bold flex items-center gap-1">
          <BookOpen size={14} /> {exCount} վարժություն
        </span>
        <ChevronRight size={20} />
      </div>
    </motion.div>
  );
}