// src/app/learn/alphabet/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, BookOpen, CheckCircle, XCircle, Trophy, Sparkles, Play, Delete } from "lucide-react";
import { useRouter } from "next/navigation";
import { ALPHABETS, type AlphabetLesson, type AlphabetLetter } from "@/lib/content/alphabets";
import { GlassCard } from "@/components/ui/glass-card";
import { loadLangConfig, type LangCode } from "@/lib/i18n/index";
import { useAudioManager } from "@/lib/hooks/useAudioManager";
import { getWavClient, WavClient } from "@/lib/audio/WavClient";

// ─── HELPERS ──────────────────────────────────────────────────────────

function sanitizeForTTS(text: string): string {
  if (!text) return text;
  return text
    .replace(/[«»""'']/g, "")
    .replace(/՛/g, "")
    .replace(/՝/g, ",")
    .replace(/։/g, ".")
    .replace(/[.,;:!?։»«]+\s*$/g, "")
    .replace(/[։»«]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getPairKey(native: LangCode, learning: LangCode): string {
  return `${native}-${learning}`;
}

export default function AlphabetLessonPage() {
  const router = useRouter();
  const [native, setNative] = useState<LangCode>("hy");
  const [learningLang, setLearningLang] = useState<LangCode>("en");
  
  const [selectedAlphabet, setSelectedAlphabet] = useState<AlphabetLesson>(ALPHABETS[0]);
  const [activeTab, setActiveTab] = useState<"theory" | "letters" | "spelling">("theory");
  
  // Spelling game states
  const [currentLetter, setCurrentLetter] = useState<AlphabetLetter | null>(null);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [gameState, setGameState] = useState<"idle" | "correct" | "incorrect">("idle");
  const [score, setScore] = useState(0);

  // ✅ ԱՈՒԴԻՈ ՀԱՄԱԿԱՐԳԻ ՎԻՃԱԿՆԵՐ
  const { stop, isPlaying } = useAudioManager();
  const [wavClient, setWavClient] = useState<WavClient | null>(null);
  const [isWAVAvailable, setIsWAVAvailable] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const speakingLockRef = useRef(false);

  useEffect(() => {
    try {
      const config = loadLangConfig();
      if (config) {
        setNative(config.native as LangCode);
        setLearningLang(config.learning as LangCode);
        
        const matchedAlphabet = ALPHABETS.find(a => a.languageCode === config.learning);
        if (matchedAlphabet) {
          setSelectedAlphabet(matchedAlphabet);
        }
      }
    } catch (e) {}
  }, []);

  // ✅ WavClient-ի ինիցիալիզացիա
  useEffect(() => {
    const initWAV = async () => {
      try { 
        const client = getWavClient(); 
        if (client) { 
          setWavClient(client); 
          setIsWAVAvailable(true); 
        } 
      } catch (error) { 
        console.warn("WAV init error:", error); 
      }
    };
    initWAV();
  }, []);

  useEffect(() => { 
    if (wavClient && isWAVAvailable) setIsAudioReady(true); 
  }, [wavClient, isWAVAvailable]);

  useEffect(() => {
    if (!isWAVAvailable && typeof window !== "undefined") {
      const checkVoices = () => { 
        if (window.speechSynthesis.getVoices().length > 0) setIsAudioReady(true); 
      };
      window.speechSynthesis.onvoiceschanged = checkVoices;
      checkVoices();
      return () => { window.speechSynthesis.onvoiceschanged = null; };
    }
  }, [isWAVAvailable]);

  // ─── ԱՈՒԴԻՈ ՖՈՒՆԿՑԻԱՆԵՐ ──────────────────────────────────────────

  const playAudioWithFemaleVoice = useCallback((text: string, lang: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        reject(new Error("Speech synthesis not supported")); return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "en" ? "en-US" : lang === "hy" ? "hy-AM" : "ru-RU";
      utterance.rate = lang === "hy" ? 1.2 : 1.0;
      utterance.pitch = 1.2; utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const femaleVoiceNames = ["Samantha", "Google UK English Female", "Karen", "Zira", "Alice", "Victoria", "Emma", "Susan", "Tessa", "Google русский", "Anna", "Elena", "Katya", "Marina", "Natalia", "Alena", "Ani", "Google Հայերեն", "Armine", "Lusine"];

      let selected: SpeechSynthesisVoice | null = null;
      for (const name of femaleVoiceNames) {
        const found = voices.find((v) => v.lang.startsWith(lang) && v.name.toLowerCase() === name.toLowerCase());
        if (found) { selected = found; break; }
      }
      if (!selected) {
        for (const name of femaleVoiceNames) {
          const found = voices.find((v) => v.lang.startsWith(lang) && v.name.toLowerCase().includes(name.toLowerCase()));
          if (found) { selected = found; break; }
        }
      }
      if (!selected) {
        selected = voices.find((v) => v.lang.startsWith(lang)) ?? null;
      }
      if (selected) utterance.voice = selected;

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // ✅ WavClient + TTS Fallback (Հիմնական աուդիո ֆունկցիան)
  const playAudioWithFallback = useCallback(
    async (text: string, lang: string = "hy", type: "prompt" | "answer" = "prompt") => {
      if (!text) return;
      text = sanitizeForTTS(text);
      if (!text) return;
      const pairKey = getPairKey(native, learningLang);

      // Փորձում ենք WavClient-ով
      if (lang === "hy" && wavClient && isWAVAvailable) {
        try { 
          await wavClient.playPrompt(text, pairKey, "Ani"); 
          return; 
        }
        catch (error: any) {
          if (error.message === "AUTOPLAY_BLOCKED" || error.name === "NotAllowedError") {
            try { await playAudioWithFemaleVoice(text, "hy"); return; } catch {}
          }
          // Եթե WavClient-ը չգտավ, անցնում ենք TTS-ին
        }
      }
      
      // Fallback: TTS
      try { 
        await playAudioWithFemaleVoice(text, lang); 
      } catch (e) {
        console.warn("TTS fallback failed:", e);
      }
    },
    [wavClient, isWAVAvailable, native, learningLang, playAudioWithFemaleVoice]
  );

  const handleSpeak = useCallback(
    async (text: string, lang: string = "hy", type: "prompt" | "answer" = "prompt") => {
      if (!text) return;
      if (speakingLockRef.current) {
        if (typeof window !== "undefined") window.speechSynthesis?.cancel();
        speakingLockRef.current = false; return;
      }
      speakingLockRef.current = true;
      try { await playAudioWithFallback(text, lang, type); }
      catch (e) { console.warn("handleSpeak error:", e); }
      finally { speakingLockRef.current = false; }
    },
    [playAudioWithFallback]
  );

  // ─── ԽԱՂԻ ՖՈՒՆԿՑԻԱՆԵՐ ─────────────────────────────────────────────

  const startSpellingGame = useCallback(() => {
    if (!selectedAlphabet.letters.length) return;
    const randomIndex = Math.floor(Math.random() * selectedAlphabet.letters.length);
    setCurrentLetter(selectedAlphabet.letters[randomIndex]);
    setSelectedLetters([]);
    setGameState("idle");
    setActiveTab("spelling");
  }, [selectedAlphabet]);

  const handleLetterClick = (letter: string) => {
    if (gameState !== "idle" || !currentLetter) return;
    const newSelected = [...selectedLetters, letter];
    setSelectedLetters(newSelected);

    const targetWord = currentLetter.example.word.toUpperCase().split("");
    if (newSelected.length === targetWord.length) {
      if (newSelected.join("") === targetWord.join("")) {
        setGameState("correct");
        setScore(prev => prev + 10);
        handleSpeak(currentLetter.example.word, selectedAlphabet.languageCode);
      } else {
        setGameState("incorrect");
      }
    }
  };

  const removeLastLetter = () => {
    if (gameState !== "idle") return;
    setSelectedLetters(prev => prev.slice(0, -1));
  };

  const theory = selectedAlphabet.theory;
  const spellingLetters = selectedAlphabet.letters.map(l => l.capital);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container-main py-4 flex items-center justify-between">
          <button onClick={() => router.push("/world")} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            {selectedAlphabet.title[native]}
          </h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Alphabet Selector */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {ALPHABETS.map((alphabet) => (
            <button
              key={alphabet.id}
              onClick={() => {
                setSelectedAlphabet(alphabet);
                setActiveTab("theory");
                setCurrentLetter(null);
              }}
              className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                selectedAlphabet.id === alphabet.id
                  ? `border-blue-500 bg-gradient-to-br ${alphabet.color} text-white shadow-lg`
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300"
              }`}
            >
              <span className="text-2xl">{alphabet.icon}</span>
              <span className="text-xs font-bold">{alphabet.title[native]}</span>
              <span className="text-[10px] opacity-70">{alphabet.letterCount} տառ</span>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-gray-200 dark:bg-gray-800 rounded-2xl">
          {[
            { id: "theory", label: "Տեսություն", icon: BookOpen },
            { id: "letters", label: "Տառեր", icon: Sparkles },
            { id: "spelling", label: "Գրագիտություն", icon: Play },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "spelling" && !currentLetter) startSpellingGame();
                else setActiveTab(tab.id as any);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id ? "bg-white dark:bg-gray-700 shadow-md text-blue-600" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Theory Tab */}
          {activeTab === "theory" && (
            <motion.div key={`theory-${selectedAlphabet.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <GlassCard variant="premium" className="p-6 md:p-8">
                <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6">{theory.intro[native]}</p>
                <div className="space-y-4">
                  {theory.facts.map((fact, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                      <span className="text-blue-500 font-bold text-lg mt-0.5">💡</span>
                      <p className="text-gray-700 dark:text-gray-300">{fact[native]}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Letters Tab */}
          {activeTab === "letters" && (
            <motion.div key={`letters-${selectedAlphabet.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {selectedAlphabet.letters.map((letter) => (
                  <motion.div key={letter.id} whileHover={{ scale: 1.02 }} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-2">
                    
                    {/* Տառ, փոքրատառ և անվանում (որպես տրանսկրիպցիա) */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">{letter.capital}</span>
                        <span className="text-xl font-bold text-gray-500">{letter.lowercase}</span>
                        <span className="text-sm font-semibold text-blue-500">
                          ({letter.letterName[selectedAlphabet.languageCode]})
                        </span>
                      </div>
                      
                      {/* ✅ Կոճակը WavClient-ով կարդում է անվանումը (Այբ, Բեն) */}
                      <button 
                        onClick={() => handleSpeak(letter.letterName[selectedAlphabet.languageCode], selectedAlphabet.languageCode, "prompt")} 
                        className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200 transition-colors"
                        title="Լսել տառի անվանումը"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-gray-700 w-full"></div>

                    {/* Օրինակ բառ և թարգմանություն */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {letter.example.word} <span className="text-gray-400 font-mono font-normal">[{letter.example.ipa}]</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {letter.example.translation[native]}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleSpeak(letter.example.word, selectedAlphabet.languageCode, "answer")} 
                        className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200 transition-colors"
                        title="Լսել բառը"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>

                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Spelling Game Tab */}
          {activeTab === "spelling" && currentLetter && (
            <motion.div key={`spelling-${selectedAlphabet.id}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center">
              <GlassCard variant="premium" className="p-8">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Գրիր բառը</p>
                <p className="text-xs text-gray-400 mb-4">Ակնարկ՝ {currentLetter.example.translation[native]}</p>
                
                <div className="flex justify-center gap-2 mb-6 flex-wrap">
                  {currentLetter.example.word.toUpperCase().split("").map((char, idx) => (
                    <div key={idx} className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-black ${
                      selectedLetters[idx] ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "border-gray-300 dark:border-gray-600 text-gray-300"
                    }`}>
                      {selectedLetters[idx] || ""}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-4 mb-6">
                  <button onClick={() => handleSpeak(currentLetter.example.word, selectedAlphabet.languageCode, "answer")} className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200">
                    <Volume2 size={24} />
                  </button>
                  <button onClick={removeLastLetter} disabled={selectedLetters.length === 0} className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 disabled:opacity-50">
                    <Delete size={24} />
                  </button>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 max-w-md mx-auto">
                  {spellingLetters.map((letter, idx) => (
                    <button key={idx} onClick={() => handleLetterClick(letter)} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 text-lg font-bold hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                      {letter}
                    </button>
                  ))}
                </div>
                {gameState === "correct" && (
                  <div className="mt-6 p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center gap-2">
                    <CheckCircle size={20} /> Ճիշտ է: +10 միավոր
                  </div>
                )}
                {gameState === "incorrect" && (
                  <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-700 dark:text-red-300 font-bold flex items-center justify-center gap-2">
                    <XCircle size={20} /> Սխալ է: Փորձիր նորից:
                  </div>
                )}
                <div className="mt-6">
                  <button onClick={startSpellingGame} className="px-6 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700">
                    Հաջորդ բառը
                  </button>
                </div>
                <div className="mt-4 text-lg font-bold text-yellow-500 flex items-center justify-center gap-2">
                  <Trophy size={20} /> {score}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}