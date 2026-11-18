"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, BookOpen } from "lucide-react";

// ─── Տվյալների մոդելներ ───────────────────────────────────────────
// Սա համապատասխանում է ձեր grammer-en.json-ի կառուցվածքին
export interface GrammarItem {
  s: string; // նախադասությունը բացթողումով
  o?: string[]; // տարբերակները (pick-ի համար)
  a: string | string[] | number; // ճիշտ պատասխան(ներ)ը
  why?: string; // բացատրությունը
  no?: Record<string, string>; // սխալ տարբերակի հետադարձ կապ
}

export interface GrammarExercise {
  id: string;
  type: "pick" | "gap" | "order" | "write" | "fix";
  instruction: string;
  items: GrammarItem[];
}

export interface GrammarUnit {
  id: string;
  title: string;
  cefr?: string;
  explanation: string;
  exercises: GrammarExercise[];
}

// ─── Հիմնական բաղադրիչ ─────────────────────────────────────────
export default function GrammarPracticePage({ unit }: { unit: GrammarUnit }) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [showResults, setShowResults] = useState(false);

  const currentExercise = unit.exercises[currentExerciseIndex];
  const totalExercises = unit.exercises.length;

  // Պատասխանի պահպանում
  const handleAnswerChange = (itemIndex: number, value: string | number) => {
    setAnswers((prev) => ({
      ...prev,
      [`${currentExercise.id}-${itemIndex}`]: value,
    }));
  };

  // Ստուգում
  const handleCheck = () => {
    setShowResults(true);
  };

  // Անցում հաջորդ վարժությանը
  const handleNext = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setShowResults(false);
    } else {
      alert("🎉 Ապրե՛ս։ Ավարտեցիր այս դասի բոլոր վարժությունները։");
    }
  };

  // Վերսկսում
  const handleReset = () => {
    setAnswers({});
    setShowResults(false);
    setCurrentExerciseIndex(0);
  };

  // Առաջընթացի հաշվարկ
  const progress = ((currentExerciseIndex + (showResults ? 1 : 0)) / totalExercises) * 100;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Վերնագիր և առաջընթաց */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="text-blue-600" size={28} />
          <h1 className="text-2xl md:text-3xl font-black">{unit.title}</h1>
          {unit.cefr && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
              {unit.cefr}
            </span>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{unit.explanation}</p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <motion.div
            className="bg-blue-600 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>Առաջընթաց</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Ընթացիկ վարժություն */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentExercise.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <ExerciseRenderer
            exercise={currentExercise}
            answers={answers}
            showResults={showResults}
            onAnswerChange={handleAnswerChange}
          />
        </motion.div>
      </AnimatePresence>

      {/* Կոճակներ */}
      <div className="mt-8 flex gap-4">
        {!showResults ? (
          <button
            onClick={handleCheck}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Ստուգել
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            {currentExerciseIndex < totalExercises - 1 ? "Հաջորդ վարժությունը" : "Ավարտել"}
            <ChevronRight size={18} />
          </button>
        )}
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={18} /> Վերսկսել
        </button>
      </div>
    </div>
  );
}

// ─── Վարժությունների տիպերի ռենդերեր ─────────────────────────────
function ExerciseRenderer({
  exercise,
  answers,
  showResults,
  onAnswerChange,
}: {
  exercise: GrammarExercise;
  answers: Record<string, string | number>;
  showResults: boolean;
  onAnswerChange: (index: number, value: string | number) => void;
}) {
  switch (exercise.type) {
    case "pick":
      return <PickExercise exercise={exercise} answers={answers} showResults={showResults} onAnswerChange={onAnswerChange} />;
    case "gap":
    case "write":
    case "fix":
      return <TextExercise exercise={exercise} answers={answers} showResults={showResults} onAnswerChange={onAnswerChange} />;
    case "order":
      return <OrderExercise exercise={exercise} answers={answers} showResults={showResults} onAnswerChange={onAnswerChange} />;
    default:
      return <p>Անհայտ վարժության տեսակ։</p>;
  }
}

// ─── Pick (ընտրովի) վարժություն ─────────────────────────────────
function PickExercise({
  exercise,
  answers,
  showResults,
  onAnswerChange,
}: {
  exercise: GrammarExercise;
  answers: Record<string, string | number>;
  showResults: boolean;
  onAnswerChange: (index: number, value: string | number) => void;
}) {
  return (
    <div>
      <p className="text-lg font-bold mb-4">{exercise.instruction}</p>
      <div className="space-y-6">
        {exercise.items.map((item, idx) => {
          const selected = answers[`${exercise.id}-${idx}`];
          const isCorrect = showResults && selected === item.a;
          const isWrong = showResults && selected !== undefined && selected !== item.a;

          return (
            <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-base mb-3">{item.s}</p>
              <div className="flex flex-wrap gap-2">
                {item.o?.map((option, optIdx) => {
                  const isSelected = selected === optIdx;
                  let bgClass = "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600";
                  if (isSelected) bgClass = "bg-blue-100 dark:bg-blue-900 border-blue-500";
                  if (showResults && isSelected && isCorrect) bgClass = "bg-emerald-100 dark:bg-emerald-900 border-emerald-500";
                  if (showResults && isSelected && isWrong) bgClass = "bg-rose-100 dark:bg-rose-900 border-rose-500";
                  if (showResults && !isSelected && optIdx === item.a) bgClass = "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300";

                  return (
                    <button
                      key={optIdx}
                      onClick={() => !showResults && onAnswerChange(idx, optIdx)}
                      disabled={showResults}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${bgClass}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {showResults && (
                <div className="mt-2 text-sm">
                  {isCorrect && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={16} /> Ճիշտ է։</span>}
                  {isWrong && <span className="text-rose-600 flex items-center gap-1"><XCircle size={16} /> Սխալ է։ {item.why}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Text (գրավոր) վարժություն ──────────────────────────────────
function TextExercise({
  exercise,
  answers,
  showResults,
  onAnswerChange,
}: {
  exercise: GrammarExercise;
  answers: Record<string, string | number>;
  showResults: boolean;
  onAnswerChange: (index: number, value: string | number) => void;
}) {
  return (
    <div>
      <p className="text-lg font-bold mb-4">{exercise.instruction}</p>
      <div className="space-y-4">
        {exercise.items.map((item, idx) => {
          const value = answers[`${exercise.id}-${idx}`] as string || "";
          const accepted = Array.isArray(item.a) ? item.a : [item.a];
          const isCorrect = showResults && accepted.some((a) => String(a).toLowerCase() === value.toLowerCase().trim());
          const isWrong = showResults && value && !isCorrect;

          return (
            <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-base mb-2">{item.s}</p>
              <input
                type="text"
                value={value}
                onChange={(e) => onAnswerChange(idx, e.target.value)}
                disabled={showResults}
                className={`w-full p-2 border-2 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none ${
                  isCorrect ? "border-emerald-500" : isWrong ? "border-rose-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Պատասխանդ..."
              />
              {showResults && (
                <div className="mt-1 text-sm">
                  {isCorrect && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={16} /> Ճիշտ է։</span>}
                  {isWrong && <span className="text-rose-600 flex items-center gap-1"><XCircle size={16} /> Ճիշտ պատասխանը՝ {accepted.join(" / ")}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Order (դասավորում) վարժություն ─────────────────────────────
function OrderExercise({
  exercise,
  answers,
  showResults,
  onAnswerChange,
}: {
  exercise: GrammarExercise;
  answers: Record<string, string | number>;
  showResults: boolean;
  onAnswerChange: (index: number, value: string | number) => void;
}) {
  // Իրական դասավորման համար պետք է ավելի բարդ տրամաբանություն (drag & drop կամ կոճակներով տեղափոխում)
  // Այստեղ պարզության համար օգտագործում ենք տեքստային դաշտ, որտեղ պետք է գրել ճիշտ նախադասությունը
  return (
    <div>
      <p className="text-lg font-bold mb-4">{exercise.instruction}</p>
      <div className="space-y-4">
        {exercise.items.map((item, idx) => {
          const value = answers[`${exercise.id}-${idx}`] as string || "";
          const accepted = Array.isArray(item.a) ? item.a : [item.a];
          const isCorrect = showResults && accepted.some((a) => String(a).toLowerCase() === value.toLowerCase().trim());

          return (
            <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-base mb-2">Սեղմիր բառերը՝ նախադասությունը կազմելու համար։</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {item.o?.map((word, wIdx) => (
                  <button
                    key={wIdx}
                    onClick={() => onAnswerChange(idx, (value + " " + word).trim())}
                    disabled={showResults}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                  >
                    {word}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={value}
                readOnly
                placeholder="Կազմված նախադասությունը..."
                className={`w-full p-2 border-2 rounded-lg bg-gray-50 dark:bg-gray-900 ${
                  isCorrect ? "border-emerald-500" : showResults ? "border-rose-500" : "border-gray-300"
                }`}
              />
              {showResults && (
                <div className="mt-1 text-sm">
                  {isCorrect ? (
                    <span className="text-emerald-600">Ճիշտ է։</span>
                  ) : (
                    <span className="text-rose-600">Ճիշտ պատասխանը՝ {accepted[0]}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}