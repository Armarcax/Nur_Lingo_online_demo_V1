// src/components/InteractiveLesson.tsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Volume2, Loader2, CheckCircle, XCircle, Wifi, WifiOff, Music, ArrowLeft, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useCanonicalOfflineAudio } from '@/lib/hooks/useCanonicalOfflineAudio';
import { useI18n } from '@/hooks/useI18n';
import { resolveOfflineAudio } from '@/lib/offline/offline-audio-resolver';

// ============================================================
// VOICE CONFIGURATION
// ============================================================

const VOICE_CONFIG = {
  hy: {
    male: { name: 'Areg', dir: 'hy_Areg', label: 'Արեգ' },
    female: { name: 'Ani', dir: 'hy_Ani', label: 'Անի' }
  },
  en: {
    male: { name: 'en_male', dir: 'en_male', label: 'Male' },
    female: { name: 'en_female', dir: 'en_female', label: 'Female' }
  },
  ru: {
    male: { name: 'ru_male', dir: 'ru_male', label: 'Мужской' },
    female: { name: 'ru_female', dir: 'ru_female', label: 'Женский' }
  }
};

type Language = 'hy' | 'en' | 'ru';
type Gender = 'male' | 'female';

// ============================================================
// TYPES
// ============================================================

interface Exercise {
  id: string;
  type: 'listen-and-select' | 'listen-and-speak' | 'listen-and-repeat' | 'multiple-choice' | 'translate' | 'matching';
  question: string;
  questionArmenian?: string;
  correctAnswer?: string;
  options?: string[];
  audioId?: string;
  audioText?: string;
  hint?: string;
  translations?: { hy?: string; en?: string; ru?: string };
  pairs?: { id: string; native: string; learning: string }[]; // ✅ Ավելացվել է Matching-ի համար
}

interface ExerciseState extends Exercise {
  isAnswered: boolean;
  selectedAnswer?: string;
  isCorrect?: boolean;
}

// ============================================================
// VOICE SELECTOR
// ============================================================

function VoiceSelector({ 
  language, selectedGender, onSelect, disabled
}: { 
  language: Language; selectedGender: Gender; onSelect: (gender: Gender) => void; disabled?: boolean;
}) {
  const config = VOICE_CONFIG[language];
  if (!config) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onSelect('male')} disabled={disabled}
        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
          selectedGender === 'male' ? 'bg-blue-600 text-white' : 'bg-white/20 dark:bg-gray-800/80 text-gray-500 hover:bg-white/30'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >🧑</button>
      <button
        onClick={() => onSelect('female')} disabled={disabled}
        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
          selectedGender === 'female' ? 'bg-pink-600 text-white' : 'bg-white/20 dark:bg-gray-800/80 text-gray-500 hover:bg-white/30'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >👩</button>
    </div>
  );
}

// ============================================================
// INTERACTIVE LESSON COMPONENT
// ============================================================

export function InteractiveLesson({ lessonId, lessonData, onComplete, className = '' }: {
  lessonId: string;
  lessonData?: { title: string; exercises: Exercise[] };
  onComplete?: (score: number, stats: { correct: number; total: number; accuracy: number }) => void;
  className?: string;
}) {
  const { t } = useI18n();
  const offlineAudio = useCanonicalOfflineAudio();
  
  const [exercises, setExercises] = useState<ExerciseState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; correctAnswer?: string } | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('hy');

  // ✅ Matching-ի վիճակները
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  useEffect(() => {
    if (lessonData?.exercises) {
      setExercises(lessonData.exercises.map(ex => ({
        ...ex, isAnswered: false, selectedAnswer: undefined, isCorrect: undefined,
      })));
    }
  }, [lessonData]);

  // ✅ ՀԱՄԱՊԱՏԱՍԽԱՆԵՑՄԱՆ ԱՈՒԴԻՈՅԻ ՖՈՒՆԿՑԻԱ (WAV հայերենի, TTS անգլերենի)
  const playMatchAudio = useCallback((text: string, lang: 'hy' | 'en') => {
    if (!text) return;

    if (lang === 'hy') {
      // 1. Փորձում ենք գտնել WAV ֆայլը
      const audioData = resolveOfflineAudio(text, 'hy');
      if (audioData?.url) {
        new Audio(audioData.url).play().catch(e => console.warn("WAV Error:", e));
      } else {
        // 2. Եթե WAV չկա, որպես պահուստ միացնում ենք հայերեն TTS
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'hy-AM';
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      }
    } else {
      // 3. Անգլերենի համար միացնում ենք TTS
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, []);

  // Մնացած վարժությունների աուդիոն
  const playAudioText = useCallback((text: string, lang: Language) => {
    if (!text) return;
    if (lang === 'hy') {
      if (offlineAudio.isOfflineMode) offlineAudio.playAudio(text, 'hy');
      else playMatchAudio(text, 'hy');
    } else {
      playMatchAudio(text, 'en'); // en կամ ru
    }
  }, [offlineAudio, playMatchAudio]);

  // Auto-play հարցի աուդիոն
  useEffect(() => {
    if (!exercises.length || completed) return;
    const current = exercises[currentIndex];
    if (current && current.type !== 'matching') {
      const textToPlay = current.audioText || current.questionArmenian || current.question;
      const timer = setTimeout(() => playAudioText(textToPlay, selectedLanguage), 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, exercises, completed, selectedLanguage, playAudioText]);

  // ✅ Matching-ի լոգիկան
  const leftItems = useMemo(() => {
    if (!exercises[currentIndex]?.pairs) return [];
    return [...exercises[currentIndex].pairs!].sort(() => Math.random() - 0.5);
  }, [currentIndex, exercises]);

  const rightItems = useMemo(() => {
    if (!exercises[currentIndex]?.pairs) return [];
    return [...exercises[currentIndex].pairs!].sort(() => Math.random() - 0.5);
  }, [currentIndex, exercises]);

  const handleMatchClick = (id: string, word: string, side: 'left' | 'right') => {
    if (matchedPairs.includes(id)) return; // Եթե արդեն միացված է
    playMatchAudio(word, side === 'left' ? 'hy' : 'en');

    if (side === 'left') {
      setSelectedLeft(id);
      if (selectedRight) checkMatch(id, selectedRight);
    } else {
      setSelectedRight(id);
      if (selectedLeft) checkMatch(selectedLeft, id);
    }
  };

  const checkMatch = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      // Ճիշտ է
      setMatchedPairs(prev => {
        const newMatched = [...prev, leftId];
        // Եթե բոլոր զույգերը գտնվել են, ավարտում ենք
        if (newMatched.length === exercises[currentIndex].pairs?.length) {
          setTimeout(() => handleAnswer('matched'), 500);
        }
        return newMatched;
      });
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      // Սխալ է
      setTimeout(() => { setSelectedLeft(null); setSelectedRight(null); }, 500);
    }
  };

  const handleAnswer = useCallback(async (selected: string) => {
    if (isSubmitting) return;
    const current = exercises[currentIndex];
    if (!current || current.isAnswered) return;

    setIsSubmitting(true);
    setSelectedOption(selected);

    // Matching-ը միշտ ճիշտ է համարվում, եթե հասել է այստեղ
    const isCorrect = current.type === 'matching' ? true : selected === current.correctAnswer;
    
    setExercises(prev => {
      const updated = [...prev];
      updated[currentIndex] = { ...updated[currentIndex], isAnswered: true, isCorrect };
      return updated;
    });

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback({ isCorrect: true, message: t('InteractiveLesson__correct') });
    } else {
      setFeedback({ isCorrect: false, message: t('InteractiveLesson__wrong'), correctAnswer: current.correctAnswer });
    }

    setTimeout(() => {
      setFeedback(null);
      setSelectedOption(null);
      setIsSubmitting(false);
      setMatchedPairs([]); // Մաքրում ենք Matching-ի վիճակը
      setSelectedLeft(null);
      setSelectedRight(null);
      
      const nextIndex = currentIndex + 1;
      if (nextIndex < exercises.length) {
        setCurrentIndex(nextIndex);
      } else {
        setCompleted(true);
        const accuracy = Math.round(((score + (isCorrect ? 1 : 0)) / exercises.length) * 100);
        onComplete?.(accuracy, { correct: score + (isCorrect ? 1 : 0), total: exercises.length, accuracy });
      }
    }, 2000);
  }, [currentIndex, exercises, score, onComplete, isSubmitting, t]);

  if (!offlineAudio.manifestLoaded) {
    return <div className="flex items-center justify-center min-h-[300px]"><Loader2 size={40} className="animate-spin text-red-500 mx-auto" /></div>;
  }

  if (!exercises.length) {
    return <div className="text-center p-8 bg-yellow-50 text-yellow-800 rounded-xl">⚠️ {t('InteractiveLesson__no_exercises')}</div>;
  }

  if (completed) {
    const accuracy = Math.round((score / exercises.length) * 100);
    return (
      <div className="text-center p-8 bg-green-50 rounded-xl border border-green-200">
        <div className="text-6xl mb-4">{accuracy === 100 ? '🏆' : accuracy >= 70 ? '🎉' : '💪'}</div>
        <h2 className="text-2xl font-bold text-green-700">{t('InteractiveLesson__perfect')}</h2>
        <p className="text-3xl font-bold mt-4 text-red-500">{accuracy}%</p>
      </div>
    );
  }

  const current = exercises[currentIndex];
  const progress = ((currentIndex + 1) / exercises.length) * 100;

  return (
    <div className={`max-w-2xl mx-auto p-4 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {lessonData?.title || `${t('InteractiveLesson__lesson')} ${lessonId}`}
            </h2>
            <p className="text-sm text-gray-500">{t('InteractiveLesson__exercise_x_of_y', { current: currentIndex + 1, total: exercises.length })}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={offlineAudio.toggleOfflineMode} className={`p-2 rounded-xl transition-colors ${offlineAudio.isOfflineMode ? 'bg-green-500/20 text-green-500' : 'bg-white/20 text-gray-500'}`}>
              {offlineAudio.isOfflineMode ? <WifiOff size={18} /> : <Wifi size={18} />}
            </button>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/40 border border-white/20">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-sm font-bold text-gray-900">{score}</span>
              <span className="text-xs text-gray-500">/ {exercises.length}</span>
            </div>
          </div>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <GlassCard variant="premium" className="p-6">
        {/* ✅ ՆՈՐ UI ՀԱՄԱՊԱՏԱՍԽԱՆԵՑՄԱՆ ՀԱՄԱՐ */}
        {current.type === 'matching' && current.pairs && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 text-center">
              Համապատասխանեցրու բառերը:
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Ձախ սյունակ (Հայերեն) */}
              <div className="flex flex-col gap-2">
                {leftItems.map((item) => (
                  <button
                    key={`left-${item.id}`}
                    onClick={() => handleMatchClick(item.id, item.native, 'left')}
                    disabled={matchedPairs.includes(item.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex justify-between items-center ${
                      matchedPairs.includes(item.id) 
                        ? 'bg-green-500/20 border-green-500 text-green-700 opacity-50' 
                        : selectedLeft === item.id
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-white/20 bg-white/40 hover:bg-white/60 text-gray-900'
                    }`}
                  >
                    <span>{item.native}</span>
                    <Volume2 size={16} className="text-gray-500" />
                  </button>
                ))}
              </div>
              {/* Աջ սյունակ (Անգլերեն) */}
              <div className="flex flex-col gap-2">
                {rightItems.map((item) => (
                  <button
                    key={`right-${item.id}`}
                    onClick={() => handleMatchClick(item.id, item.learning, 'right')}
                    disabled={matchedPairs.includes(item.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex justify-between items-center ${
                      matchedPairs.includes(item.id) 
                        ? 'bg-green-500/20 border-green-500 text-green-700 opacity-50' 
                        : selectedRight === item.id
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-white/20 bg-white/40 hover:bg-white/60 text-gray-900'
                    }`}
                  >
                    <span>{item.learning}</span>
                    <Volume2 size={16} className="text-gray-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ՄՆԱՑԱԾ ՎԱՐԺՈՒԹՅՈՒՆՆԵՐԸ */}
        {current.type !== 'matching' && (
          <>
            <div className="mb-6 flex items-start gap-3">
              <button
                onClick={() => playAudioText(current.audioText || current.questionArmenian || current.question, selectedLanguage)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-gray-700"
              >
                <Volume2 size={20} />
              </button>
              <div className="flex-1">
                <p className="text-lg font-medium text-gray-900 dark:text-white">{current.questionArmenian || current.question}</p>
              </div>
            </div>
            
            {/* Options / Translate կոդը այստեղ... */}
            {current.options && (
              <div className="space-y-3">
                {current.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => !current.isAnswered && handleAnswer(option)}
                    disabled={current.isAnswered || isSubmitting}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      current.isAnswered
                        ? option === current.correctAnswer ? "border-green-500 bg-green-500/10" : "border-white/20 opacity-50"
                        : "border-white/20 bg-white/20 hover:bg-white/30"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`mt-4 p-4 rounded-xl ${feedback.isCorrect ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
            <div className="flex items-center gap-2">
              {feedback.isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
              <span>{feedback.message}</span>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

export default InteractiveLesson;