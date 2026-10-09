// src/components/drive-test/QuestionCard.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Lightbulb,
  BookOpen,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import type { LangCode } from "@/lib/i18n/multilingual";

export interface DriveQuestion {
  id: string;
  testNumber: number;
  sourceQuestionNumber: number;
  category: string;
  prompt: Record<LangCode, string>;
  options: Record<LangCode, string[]>;
  correctIndex: number;
  imageUrl: string | null;
  imageFilename: string | null;
  page: number;
}

interface ExplanationData {
  title: string;
  reason: string;
  rule: string;
  tip: string;
  example: string;
}

interface QuestionCardProps {
  question: DriveQuestion;
  index: number;
  total: number;
  mode: "test" | "study";
  native: LangCode;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  showExplanation?: boolean;
}

export function QuestionCard({
  question,
  index,
  total,
  mode,
  native,
  onAnswer,
  onNext,
  showExplanation = true,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [showExplain, setShowExplain] = useState(false);

  const prompt = question.prompt[native] || question.prompt.hy || "";
  const options = question.options[native] || question.options.hy || [];
  const correct = question.correctIndex;

  const isCorrect = submitted && selected === correct;

  // Reset on question change
  useEffect(() => {
    setSelected(null);
    setSubmitted(false);
    setExplanation(null);
    setShowExplain(false);
  }, [question.id]);

  // Study mode: auto-submit and show explanation
  useEffect(() => {
    if (mode === "study") {
      setSelected(correct);
      setSubmitted(true);
      setShowExplain(true);
    }
  }, [mode, correct, question.id]);

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelected(idx);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    onAnswer(selected === correct);
  };

  const handleExplain = async () => {
    if (explanation) {
      setShowExplain(true);
      return;
    }
    setShowExplain(true);
    setLoadingExplain(true);

    try {
      const res = await fetch("/api/explain-driving", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: prompt,
          correctAnswer: options[correct] || "",
          nativeLang: native,
          category: question.category,
          allOptions: options,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setExplanation(data);
      }
    } catch (e) {
      console.error("Explain failed:", e);
    } finally {
      setLoadingExplain(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-500">
          #{index + 1} / {total}
        </span>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-500 uppercase">
          {question.category.replace("_", " ")}
        </span>
      </div>

      {/* Image */}
      {question.imageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-2xl overflow-hidden bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-white/10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.imageUrl}
            alt={prompt}
            className="w-full max-h-[300px] object-contain"
            loading="lazy"
          />
        </motion.div>
      )}

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-4 p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10"
      >
        <p className="font-bold text-gray-900 dark:text-white leading-relaxed">
          {prompt}
        </p>
      </motion.div>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrectOpt = idx === correct;
          const showCorrect = submitted && isCorrectOpt;
          const showWrong = submitted && isSelected && !isCorrectOpt;

          let cls =
            "w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 ";

          if (showCorrect) {
            cls += "border-emerald-500 bg-emerald-500/10";
          } else if (showWrong) {
            cls += "border-red-500 bg-red-500/10";
          } else if (isSelected && !submitted) {
            cls += "border-purple-500 bg-purple-500/10";
          } else {
            cls +=
              "border-white/20 dark:border-white/10 bg-white/30 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/10";
          }

          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + idx * 0.03 }}
              onClick={() => handleSelect(idx)}
              disabled={submitted && mode === "test"}
              className={cls}
            >
              <span
                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  showCorrect
                    ? "bg-emerald-500 text-white"
                    : showWrong
                    ? "bg-red-500 text-white"
                    : isSelected
                    ? "bg-purple-500 text-white"
                    : "bg-white/60 dark:bg-white/10 text-gray-600 dark:text-gray-300"
                }`}
              >
                {showCorrect ? "✓" : showWrong ? "✕" : String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1 text-sm text-gray-900 dark:text-white leading-relaxed">
                {opt}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 p-4 rounded-xl border ${
              isCorrect
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle size={20} className="text-emerald-500" />
              ) : (
                <XCircle size={20} className="text-red-500" />
              )}
              <span className="font-bold text-gray-900 dark:text-white">
                {isCorrect
                  ? native === "hy"
                    ? "✅ Ճիշտ է!"
                    : native === "ru"
                    ? "✅ Правильно!"
                    : "✅ Correct!"
                  : native === "hy"
                  ? "❌ Սխալ է"
                  : native === "ru"
                  ? "❌ Неправильно"
                  : "❌ Wrong"}
              </span>
            </div>

            {!isCorrect && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-bold">
                  {native === "hy"
                    ? "Ճիշտ պատասխան. "
                    : native === "ru"
                    ? "Правильный ответ: "
                    : "Correct answer: "}
                </span>
                {options[correct]}
              </p>
            )}

            {/* AI explain button */}
            {showExplanation && !showExplain && (
              <button
                onClick={handleExplain}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-500 text-xs font-bold transition"
              >
                <Sparkles size={12} />
                {native === "hy"
                  ? "Ինչու՞"
                  : native === "ru"
                  ? "Почему?"
                  : "Why?"}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation panel */}
      <AnimatePresence>
        {showExplain && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-3">
              {loadingExplain ? (
                <div className="flex items-center justify-center gap-2 py-6">
                  <Loader2 size={20} className="animate-spin text-purple-500" />
                  <span className="text-sm text-purple-500">
                    {native === "hy"
                      ? "Նուռիկը մտածում է..."
                      : native === "ru"
                      ? "Нурик думает..."
                      : "Nuri is thinking..."}
                  </span>
                </div>
              ) : explanation ? (
                <>
                  {explanation.title && (
                    <h4 className="font-black text-purple-500 text-sm flex items-center gap-2">
                      <Sparkles size={14} />
                      {explanation.title}
                    </h4>
                  )}
                  {explanation.reason && (
                    <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                      {explanation.reason}
                    </p>
                  )}
                  {explanation.rule && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">
                        📌 Rule
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {explanation.rule}
                      </p>
                    </div>
                  )}
                  {explanation.tip && (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-2">
                      <Lightbulb size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-900 dark:text-white">
                        {explanation.tip}
                      </p>
                    </div>
                  )}
                  {explanation.example && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex gap-2">
                      <BookOpen size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-900 dark:text-white italic">
                        {explanation.example}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertCircle size={16} />
                  <span className="text-sm">
                    {native === "hy"
                      ? "Չհաջողվեց բացատրություն ստանալ"
                      : native === "ru"
                      ? "Не удалось получить объяснение"
                      : "Could not get explanation"}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-3">
        {!submitted && mode === "test" && (
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition"
          >
            {native === "hy"
              ? "Ստուգել"
              : native === "ru"
              ? "Проверить"
              : "Check"}
          </button>
        )}

        {submitted && (
          <button
            onClick={onNext}
            className="flex-1 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold transition"
          >
            {index + 1 === total
              ? native === "hy"
                ? "🎉 Ավարտել"
                : native === "ru"
                ? "🎉 Завершить"
                : "🎉 Finish"
              : native === "hy"
              ? "Հաջորդ →"
              : native === "ru"
              ? "Далее →"
              : "Next →"}
          </button>
        )}
      </div>
    </div>
  );
}