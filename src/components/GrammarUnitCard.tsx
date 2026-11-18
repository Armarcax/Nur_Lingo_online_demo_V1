"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpenCheck, Layers3 } from "lucide-react";
import type { GrammarUnit, NativeLang } from "@/lib/content/grammar-types";
import { loadMastery } from "@/lib/adaptive/mastery";

const copy = {
  hy: { label: "Անգլերենի քերականություն", tasks: "վարժություն", cards: "ուսուցողական քարտ", start: "Բացել դասը", due: "Կրկնիր այս դասը" },
  ru: { label: "Грамматика английского", tasks: "заданий", cards: "учебных карточек", start: "Открыть урок", due: "Пора повторить урок" },
} satisfies Record<NativeLang, Record<string, string>>;

export function GrammarUnitCard({
  unit,
  nativeLang,
  onClick,
}: {
  unit: GrammarUnit;
  nativeLang: NativeLang;
  onClick: () => void;
}) {
  const [reviewDue, setReviewDue] = useState(false);
  const title = unit.title[nativeLang] || unit.title.hy || unit.title.ru || "";
  const labels = copy[nativeLang];

  useEffect(() => {
    try {
      const entry = loadMastery()[`grammar:${unit.id}`];
      setReviewDue(!!entry && entry.level < 5 && entry.nextReviewDate <= Date.now());
    } catch {
      setReviewDue(false);
    }
  }, [unit.id]);

  return (
    <motion.button
      type="button"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="group relative flex min-h-56 w-full flex-col overflow-hidden rounded-[1.75rem] border border-white/60 bg-gradient-to-br from-white via-rose-50 to-amber-50 p-6 text-left shadow-lg shadow-rose-950/5 transition-shadow hover:shadow-xl hover:shadow-rose-950/10 dark:border-white/10 dark:from-gray-900 dark:via-gray-900 dark:to-rose-950/30"
      aria-label={`${labels.start}: ${title}`}
    >
      <div aria-hidden="true" className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-rose-400/10 blur-2xl transition-colors group-hover:bg-rose-400/20" />
      <div className="relative flex w-full items-start justify-between gap-3">
        <span className="rounded-full border border-rose-200 bg-white/75 px-3 py-1 text-[11px] font-bold tracking-wide text-rose-700 dark:border-rose-900 dark:bg-gray-900/70 dark:text-rose-300">
          {labels.label}{unit.cefr ? ` · ${unit.cefr}` : ""}
        </span>
        <span className="rounded-xl bg-white/75 p-2 text-rose-600 shadow-sm dark:bg-gray-800 dark:text-rose-300">
          <BookOpenCheck size={19} aria-hidden="true" />
        </span>
      </div>

      <div className="relative mt-7 flex-1">
        <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          {nativeLang === "hy" ? `Միավոր ${unit.unitNumber}` : `Раздел ${unit.unitNumber}`}
        </p>
        <h3 className="text-xl font-extrabold leading-snug text-gray-900 dark:text-white">{title}</h3>
        {reviewDue && <span className="mt-2 inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-200">{labels.due}</span>}
      </div>

      <div className="relative mt-5 flex items-end justify-between gap-3 border-t border-rose-100 pt-4 dark:border-white/10">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-gray-600 dark:text-gray-300">
          <span className="inline-flex items-center gap-1.5">
            <Layers3 size={14} className="text-rose-500" aria-hidden="true" />
            {unit.cards.length} {labels.cards}
          </span>
          <span>{unit.exercises.length} {labels.tasks}</span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-rose-700 dark:text-rose-300">
          {labels.start}<ArrowUpRight size={16} aria-hidden="true" />
        </span>
      </div>
    </motion.button>
  );
}
