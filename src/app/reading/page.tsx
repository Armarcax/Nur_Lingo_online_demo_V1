// src/app/reading/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Volume2, VolumeX, BookOpen, Clock, 
  ChevronLeft, ChevronRight, CheckCircle, Languages 
} from "lucide-react";
import { READING_TEXTS, TOPICS_MAP, type ReadingText } from "@/lib/content/reading-texts";
import { GlassCard } from "@/components/ui/glass-card";
import { loadLangConfig, type LangCode } from "@/lib/i18n/index";

export default function ReadingPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<string>("A1");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [activeText, setActiveText] = useState<ReadingText | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [currentPart, setCurrentPart] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [native, setNative] = useState<LangCode>("hy");
  const [learningLang, setLearningLang] = useState<LangCode>("en");

  useEffect(() => {
    try {
      const config = loadLangConfig();
      if (config) {
        setNative(config.native as LangCode);
        setLearningLang(config.learning as LangCode);
      }
    } catch (e) {}
  }, []);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = learningLang === "en" ? "en-US" : learningLang === "hy" ? "hy-AM" : "ru-RU";
    utterance.rate = 0.9;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const filteredTexts = READING_TEXTS.filter(t => 
    t.level === selectedLevel && (!selectedTopic || t.topics.includes(selectedTopic))
  );

  const handleSelectText = (text: ReadingText) => {
    setActiveText(text);
    setCurrentPart(0);
    stopAudio();
  };

  // Էկրանի ցուցադրում (Եթե տեքստն ընտրված չէ)
  if (!activeText) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col md:flex-row">
        {/* 📚 Ձախ Սայդբար (Թեմաներ և Մակարդակներ) */}
        <aside className="w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 md:h-screen overflow-y-auto">
          <button onClick={() => router.push("/world")} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 mb-6 transition-colors">
            <ArrowLeft size={18} /> Վերադառնալ
          </button>
          
          <h2 className="text-xl font-black mb-6">Ընթերցանություն</h2>

          <div className="space-y-2 mb-8">
            {["A1", "A2", "B1", "B2"].map(level => (
              <button
                key={level}
                onClick={() => { setSelectedLevel(level); setSelectedTopic(null); }}
                className={`w-full text-left px-4 py-2 rounded-xl font-bold transition-all ${
                  selectedLevel === level 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Թեմաներ</h3>
          <div className="space-y-1">
            {Object.entries(TOPICS_MAP).map(([key, labels]) => (
              <button
                key={key}
                onClick={() => setSelectedTopic(selectedTopic === key ? null : key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedTopic === key 
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                {labels[native] || labels.en}
              </button>
            ))}
          </div>
        </aside>

        {/* 📖 Աջ Հատված (Տեքստերի ցանկ) */}
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-black mb-8">
              {selectedTopic ? TOPICS_MAP[selectedTopic][native] : `${selectedLevel} Տեքստեր`}
            </h1>

            {filteredTexts.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p>Այս բաժնում տեքստեր չկան։</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredTexts.map(text => (
                  <motion.div
                    key={text.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    onClick={() => handleSelectText(text)}
                    className="cursor-pointer bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                        {text.format}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} /> {text.minutes} րոպե
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-1">{text.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{text.ru}</p>
                    <div className="mt-4 flex gap-2">
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500">
                        {text.words} բառ
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500">
                        {text.questions} հարց
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Էկրանի ցուցադրում (Երբ տեքստն ընտրված է)
  const partContent = activeText.content?.[currentPart];
  const textToRead = partContent?.[learningLang as "en" | "ru"] || partContent?.en || "";
  const textToTranslate = partContent?.[native as "en" | "ru"] || partContent?.ru || "";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
      {/* 📌 Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => setActiveText(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold hidden sm:block">{activeText.title}</h1>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full font-bold">
              {activeText.level} · {activeText.minutes} րոպե
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              ✅ Նշել կարդացված
            </button>
          </div>
        </div>
      </header>

      {/* 📖 Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
        
        {/* 🛠 Գործիքներ */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => isPlaying ? stopAudio() : speak(textToRead)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                isPlaying ? "bg-amber-100 text-amber-600" : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
              }`}
            >
              {isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
              {isPlaying ? "Կանգնեցնել" : "Լսել"}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowTranslation(!showTranslation)}
              className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                showTranslation ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <Languages size={18} /> Թարգմանություն
            </button>
            <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative cursor-pointer" onClick={() => setShowTranslation(!showTranslation)}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showTranslation ? "left-5" : "left-1"}`} />
            </div>
          </div>
        </div>

        {/* 📝 Տեքստ */}
        <GlassCard variant="premium" className="bg-white dark:bg-gray-800 p-6 md:p-10 min-h-[400px] flex flex-col justify-between">
          {!partContent ? (
            <div className="text-center text-gray-500 py-20">
              <p>Տեքստը դեռ ավելացված չէ տվյալների բազայում։</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* Անգլերեն / Սովորող լեզու */}
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">
                  {learningLang === "en" ? "EN" : learningLang === "hy" ? "HY" : "RU"}
                </span>
                <p className="text-xl leading-relaxed text-gray-800 dark:text-gray-200 font-medium">
                  {textToRead}
                </p>
              </div>

              {/* Թարգմանություն */}
              <AnimatePresence>
                {showTranslation && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="border-l-0 md:border-l border-gray-200 dark:border-gray-700 md:pl-8"
                  >
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">
                      {native === "en" ? "EN" : native === "hy" ? "HY" : "RU"}
                    </span>
                    <p className="text-xl leading-relaxed text-gray-500 dark:text-gray-400">
                      {textToTranslate}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </GlassCard>

        {/* ⏮ Հաջորդ/Նախորդ էջեր */}
        <div className="flex items-center justify-between mt-8">
          <button 
            onClick={() => setCurrentPart(prev => Math.max(0, prev - 1))}
            disabled={currentPart === 0}
            className="p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          
          <span className="text-sm font-bold text-gray-500">
            {currentPart + 1} / {activeText.parts}
          </span>

          <button 
            onClick={() => setCurrentPart(prev => Math.min(activeText.parts - 1, prev + 1))}
            disabled={currentPart === activeText.parts - 1}
            className="p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* 🏁 Ավարտելու կոճակ */}
        <div className="flex justify-center mt-12">
          <button className="px-8 py-3 rounded-2xl bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
            Ավարտել
          </button>
        </div>
      </main>
    </div>
  );
}