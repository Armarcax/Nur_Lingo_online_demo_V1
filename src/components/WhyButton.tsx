// src/components/WhyButton.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  X,
  Loader2,
  BookOpen,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

interface WhyButtonProps {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  wasCorrect: boolean;
  exerciseType: string;
  sourceLesson?: string;
  acceptableAnswers?: string[];
  learningLang: "hy" | "en" | "ru";
}

interface ExplanationData {
  title: string;
  reason: string;
  tip: string;
  example: string;
  encouragement: string;
  sourceLesson: string | null;
}

export function WhyButton({
  question,
  userAnswer,
  correctAnswer,
  wasCorrect,
  exerciseType,
  sourceLesson,
  acceptableAnswers,
  learningLang,
}: WhyButtonProps) {
  const { t, locale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = async () => {
    setIsOpen(true);

    // If already loaded, don't re-fetch
    if (explanation) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          userAnswer,
          correctAnswer,
          nativeLang: locale,
          learningLang,
          exerciseType,
          sourceLesson,
          wasCorrect,
          acceptableAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get explanation");
      }

      const data = await response.json();

      if (data.success) {
        setExplanation({
          title: data.title,
          reason: data.reason,
          tip: data.tip,
          example: data.example,
          encouragement: data.encouragement,
          sourceLesson: data.sourceLesson,
        });
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const labels = {
    hy: {
      button: "Ինչու՞",
      loading: "Նուռիկը մտածում է...",
      error: "Չհաջողվեց բացատրություն ստանալ",
      retry: "Կրկին փորձել",
      tip: "Հուշում",
      example: "Օրինակ",
      source: "Աղբյուր",
      close: "Փակել",
    },
    en: {
      button: "Why?",
      loading: "Nuri is thinking...",
      error: "Couldn't get explanation",
      retry: "Try again",
      tip: "Tip",
      example: "Example",
      source: "Source",
      close: "Close",
    },
    ru: {
      button: "Почему?",
      loading: "Нурик думает...",
      error: "Не удалось получить объяснение",
      retry: "Попробовать снова",
      tip: "Подсказка",
      example: "Пример",
      source: "Источник",
      close: "Закрыть",
    },
  };

  const L = labels[locale as keyof typeof labels] || labels.en;

  return (
    <>
      {/* ─── «Ինչու՞» button ─── */}
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-500 text-xs font-bold transition-all"
      >
        <HelpCircle size={12} />
        {L.button}
      </button>

      {/* ─── Modal ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Sparkles size={16} className="text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                      {explanation?.title || (isLoading ? L.loading : "🤖 Nuri")}
                    </h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      {wasCorrect ? "✅" : "💡"} AI Tutor
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                  aria-label={L.close}
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 size={32} className="animate-spin text-purple-500" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {L.loading}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">😢</div>
                    <p className="text-sm text-red-500 mb-4">{L.error}</p>
                    <button
                      onClick={() => {
                        setError(null);
                        setExplanation(null);
                        handleOpen();
                      }}
                      className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold transition"
                    >
                      {L.retry}
                    </button>
                  </div>
                )}

                {explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Reason */}
                    {explanation.reason && (
                      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <p className="text-sm text-gray-900 dark:text-white leading-relaxed whitespace-pre-line">
                          {explanation.reason}
                        </p>
                      </div>
                    )}

                    {/* Tip */}
                    {explanation.tip && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Lightbulb size={14} className="text-amber-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                            {L.tip}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                          {explanation.tip}
                        </p>
                      </div>
                    )}

                    {/* Example */}
                    {explanation.example && (
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-1.5">
                          <BookOpen size={14} className="text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                            {L.example}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white leading-relaxed italic">
                          {explanation.example}
                        </p>
                      </div>
                    )}

                    {/* Source */}
                    {explanation.sourceLesson && (
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
                        📚 {L.source}: {explanation.sourceLesson}
                      </div>
                    )}

                    {/* Encouragement */}
                    {explanation.encouragement && (
                      <div className="text-center pt-2">
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                          {explanation.encouragement}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default WhyButton;