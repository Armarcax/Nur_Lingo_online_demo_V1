// src/app/visual-lessons/page.tsx
"use client";

import { useState, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ArrowLeft, Search, Sparkles, BookOpen, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { VISUAL_LESSONS, type VisualLesson } from "@/lib/content/visual-lessons";
import { GlassCard } from "@/components/ui/glass-card";

function VisualLessonsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ✅ Ավելացվել է ? նշանը և || null
  const moduleId = searchParams?.get("module") || null; 

  const [selectedLesson, setSelectedLesson] = useState<VisualLesson | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Grammar" | "Vocabulary" | "Phrases">("All");

  useEffect(() => {
    if (moduleId) {
      const found = VISUAL_LESSONS.find(l => l.id === moduleId);
      if (found) setSelectedLesson(found);
    }
  }, [moduleId]);

  const speak = (text: string, lang: "en" | "hy" | "ru") => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "en" ? "en-US" : lang === "hy" ? "hy-AM" : "ru-RU";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const filteredLessons = VISUAL_LESSONS.filter(l => {
    const matchesFilter = filter === "All" || l.category === filter;
    const matchesSearch = l.title.hy.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.title.en.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleBack = () => {
    if (selectedLesson) {
      setSelectedLesson(null);
      router.replace("/visual-lessons");
    } else {
      router.push("/world");
    }
  };

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent text-gray-900 dark:text-white pb-20">
      <header className="sticky top-0 z-40 bg-white/60 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-white/5 shadow-sm">
        <div className="container-main py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-xl font-black flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                  <Sparkles size={20} className="text-amber-500" /> Վիզուալ Դասեր
                </h1>
                <p className="text-xs text-gray-500 font-medium">Ինտերակտիվ քարտեր եռալեզու աուդիոյով</p>
              </div>
            </div>
          </div>

          {!selectedLesson && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Փնտրել դասեր..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                {["All", "Grammar", "Vocabulary", "Phrases"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      filter === f 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                        : "bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="container-main py-6">
        <AnimatePresence mode="wait">
          {!selectedLesson ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredLessons.map((lesson, idx) => (
                <motion.div
                  key={lesson.id}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`relative cursor-pointer overflow-hidden rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700 bg-gradient-to-br ${lesson.gradient}`}
                >
                  <div className="absolute -top-4 -right-4 text-9xl opacity-20 transform rotate-12 drop-shadow-xl">
                    {lesson.icon}
                  </div>
                  <span className="inline-block text-[10px] font-black text-white/90 uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    {lesson.category}
                  </span>
                  <h3 className="text-2xl font-black text-white mt-6 mb-1 drop-shadow-md">
                    {lesson.title.hy}
                  </h3>
                  <p className="text-sm text-white/90 font-medium">
                    {lesson.title.en} • {lesson.title.ru}
                  </p>
                  <div className="mt-6 flex items-center justify-between text-white/80">
                    <span className="text-xs font-bold flex items-center gap-1"><BookOpen size={14} /> {lesson.items.length} քարտ</span>
                    <ChevronRight size={20} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col items-center"
            >
              <div className="text-center mb-10">
                <div className="text-7xl mb-4 drop-shadow-lg">{selectedLesson.icon}</div>
                <h2 className="text-4xl font-black mb-2">{selectedLesson.title.hy}</h2>
                <p className="text-gray-500 font-medium text-lg">{selectedLesson.title.en} / {selectedLesson.title.ru}</p>
              </div>

              <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedLesson.items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <GlassCard variant="premium" className={`p-5 h-full flex flex-col justify-between border-l-4 border-l-${selectedLesson.gradient.split('-')[1]}-500 bg-white/70 dark:bg-gray-800/70`}>
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              <span className="text-3xl drop-shadow-sm">{item.emoji}</span> 
                              {item.highlightWord ? (
                                <span>
                                  {item.en.split(item.highlightWord).map((part, i, arr) => (
                                    <span key={i}>
                                      {part}
                                      {i < arr.length - 1 && <span className="text-blue-600 dark:text-blue-400 underline decoration-2">{item.highlightWord}</span>}
                                    </span>
                                  ))}
                                </span>
                              ) : (
                                item.en
                              )}
                            </p>
                            <p className="text-base text-gray-700 dark:text-gray-300 font-bold mt-1">
                              {item.hy}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {item.ru}
                            </p>
                          </div>
                          <button
                            onClick={() => speak(item.en, "en")}
                            className="p-3 rounded-full bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all ml-2 shadow-sm"
                          >
                            <Volume2 size={20} />
                          </button>
                        </div>

                        {item.example_en && (
                          <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                              📖 {item.example_en}
                            </p>
                            <p className="text-xs text-emerald-600/80 dark:text-emerald-300/80 mt-1">
                              {item.example_hy}
                            </p>
                            <p className="text-xs text-emerald-600/60 dark:text-emerald-300/60 mt-1">
                              {item.example_ru}
                            </p>
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="mt-12 px-10 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black shadow-xl shadow-purple-500/30 flex items-center gap-2"
              >
                <ArrowLeft size={20} /> Վերադառնալ ցանկին
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function VisualLessonsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Բեռնվում է...</div>}>
      <VisualLessonsContent />
    </Suspense>
  );
}