// src/components/InteractiveLesson.tsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Volume2, Loader2, CheckCircle, XCircle, Wifi, WifiOff, ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
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

export interface Exercise {
  id: string;
  type: 'listen-and-select' | 'listen-and-speak' | 'listen-and-repeat' | 'multiple-choice' | 'translate' | 'matching' | 'word-scramble' | 'true-false' | 'jumbled-sentence' | 'fill-in-the-blanks';
  question: string;
  questionArmenian?: string;
  correctAnswer?: string;
  options?: string[];
  audioId?: string;
  audioText?: string;
  hint?: string;
  translations?: { hy?: string; en?: string; ru?: string };
  pairs?: { id: string; native: string; learning: string }[];
}

interface ExerciseState extends Exercise {
  isAnswered: boolean;
  selectedAnswer?: string;
  isCorrect?: boolean;
}

// ============================================================
// AUTO EXERCISE GENERATOR
// ============================================================

const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const generateExtraExercises = (lessonData: any): Exercise[] => {
  const generated: Exercise[] = [];
  const vocab = lessonData?.vocabulary || [];
  const phrases = lessonData?.phrases || [];

  // 1. Խառնված տառեր (Word Scramble)
  vocab.forEach((v: any, i: number) => {
    if (i % 3 === 0 && v.hy && v.hy.length > 2) {
      // Մաքրում ենք կետադրական նշաններից
      const clean = v.hy.replace(/[.,!?;:«»""'()]/g, '').trim();
      if (clean.length < 3) return;
      
      const scrambled = shuffleArray(clean.split('')).join('');
      if (scrambled === clean) return; // եթե չխառնվեց, բաց թող

      generated.push({
        id: `gen_scramble_${i}`,
        type: 'word-scramble',
        question: `Վերականգնիր բառը:\n\n${scrambled}`,
        correctAnswer: clean,
        audioText: clean,
        translations: { en: v.en }
      });
    }
  });

  // 2. Ճիշտ / Սխալ (True/False)
  vocab.forEach((v: any, i: number) => {
    if (i % 4 === 0 && v.hy && v.en) {
      const isCorrect = Math.random() > 0.5;
      const fakeEn = isCorrect ? v.en : (vocab[Math.floor(Math.random() * vocab.length)]?.en || "hello");
      generated.push({
        id: `gen_tf_${i}`,
        type: 'true-false',
        question: `«${v.hy}» բառը թարգմանվում է որպես «${fakeEn}»։`,
        correctAnswer: String(isCorrect),
        audioText: v.hy,
      });
    }
  });

  // 3. Խառնված նախադասություն (Jumbled Sentence)
  phrases.forEach((p: any, i: number) => {
    if (i % 3 === 0 && p.hy && p.hy.includes(' ')) {
      const words: string[] = p.hy.split(' ').filter(Boolean);
      if (words.length < 3) return;

      generated.push({
        id: `gen_jumble_${i}`,
        type: 'jumbled-sentence',
        question: "Դասավորիր բառերը ճիշտ հերթականությամբ.",
        options: words, // Ուղղակի փոխանցում ենք բառերը, UI-ն ինքը կխառնի
        correctAnswer: p.hy,
        audioText: p.hy,
      });
    }
  });

  // 4. Բաց թողնված բառ (Fill-in-the-Blanks)
  phrases.forEach((p: any, i: number) => {
    if (i % 4 === 1 && p.hy && p.hy.includes(' ')) {
      const words = p.hy.split(' ');
      const targetIndex = Math.floor(Math.random() * words.length);
      
      // Մաքրում ենք կետադրականից թիրախ բառի մեջ
      const targetWord = words[targetIndex].replace(/[.,!?;:]/g, '');
      if (targetWord.length < 2) return;

      const masked = [...words];
      masked[targetIndex] = "___";

      generated.push({
        id: `gen_fib_${i}`,
        type: 'fill-in-the-blanks',
        question: masked.join(' '),
        correctAnswer: targetWord,
        audioText: p.hy,
        translations: { en: p.en }
      });
    }
  });

  return generated;
};

// ============================================================
// VOICE SELECTOR UI
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
// MAIN COMPONENT
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('hy');

  // Matching States
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  // Input States (Fill-in-the-Blanks, Scramble)
  const [textInput, setTextInput] = useState('');

  // Jumbled Sentence States
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  useEffect(() => {
    if (lessonData?.exercises) {
      const extra = generateExtraExercises(lessonData);
      const allExercises = [...lessonData.exercises, ...extra].map(ex => ({
        ...ex, isAnswered: false, selectedAnswer: undefined, isCorrect: undefined,
      }));
      setExercises(shuffleArray(allExercises));
    }
  }, [lessonData]);

  const playAudioText = useCallback((text: string, lang: Language) => {
    if (!text) return;

    if (lang === 'hy') {
      const audioData = resolveOfflineAudio(text, 'hy');
      if (audioData?.url) {
        new Audio(audioData.url).play().catch(e => console.warn("WAV Error:", e));
      } else {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'hy-AM';
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      }
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'en' ? 'en-US' : 'ru-RU';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, []);

  const current = exercises[currentIndex];

  useEffect(() => {
    if (!current || completed || current.type === 'matching') return;
    const textToPlay = current.audioText || current.questionArmenian || current.question;
    const timer = setTimeout(() => playAudioText(textToPlay, selectedLanguage), 500);
    return () => clearTimeout(timer);
  }, [current, completed, selectedLanguage, playAudioText]);

  useEffect(() => {
    if (!current) return;
    setTextInput('');
    setSelectedWords([]);
    setMatchedPairs([]);
    setSelectedLeft(null);
    setSelectedRight(null);

    if (current.type === 'jumbled-sentence' && current.options) {
      setAvailableWords(shuffleArray(current.options));
    }
  }, [currentIndex, current]);

  const leftItems = useMemo(() => {
    if (!current?.pairs) return [];
    return shuffleArray([...current.pairs]);
  }, [current]);

  const rightItems = useMemo(() => {
    if (!current?.pairs) return [];
    return shuffleArray([...current.pairs]);
  }, [current]);

  const handleMatchClick = (id: string, word: string, side: 'left' | 'right') => {
    if (matchedPairs.includes(id)) return;
    playAudioText(word, side === 'left' ? 'hy' : 'en');
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
      const newMatched = [...matchedPairs, leftId];
      setMatchedPairs(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      if (newMatched.length === (current.pairs?.length || 0)) {
        setTimeout(() => handleAnswer('matched'), 500);
      }
    } else {
      setTimeout(() => { setSelectedLeft(null); setSelectedRight(null); }, 500);
    }
  };

  const handleWordSelect = (word: string, index: number) => {
    setSelectedWords([...selectedWords, word]);
    setAvailableWords(availableWords.filter((_, i) => i !== index));
  };
  const handleWordDeselect = (word: string, index: number) => {
    setAvailableWords([...availableWords, word]);
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
  };

  const handleAnswer = useCallback(async (selected: string) => {
    if (isSubmitting) return;
    if (!current || current.isAnswered) return;

    setIsSubmitting(true);
    const isCorrect = current.type === 'matching' ? true : selected.trim().toLowerCase() === current.correctAnswer?.trim().toLowerCase();
    
    setExercises(prev => {
      const updated = [...prev];
      updated[currentIndex] = { ...updated[currentIndex], isAnswered: true, selectedAnswer: selected, isCorrect };
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
      setIsSubmitting(false);
      const nextIndex = currentIndex + 1;
      if (nextIndex < exercises.length) {
        setCurrentIndex(nextIndex);
      } else {
        setCompleted(true);
        const accuracy = Math.round(((score + (isCorrect ? 1 : 0)) / exercises.length) * 100);
        onComplete?.(accuracy, { correct: score + (isCorrect ? 1 : 0), total: exercises.length, accuracy });
      }
    }, 2000);
  }, [current, currentIndex, exercises.length, isSubmitting, onComplete, score, t]);

  const handleSkip = useCallback(() => {
    if (feedback) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex < exercises.length) {
      setCurrentIndex(nextIndex);
    } else {
      setCompleted(true);
      const accuracy = Math.round((score / exercises.length) * 100);
      onComplete?.(accuracy, { correct: score, total: exercises.length, accuracy });
    }
  }, [currentIndex, exercises.length, score, onComplete, feedback]);

  const handleReset = useCallback(() => {
    setExercises(prev => prev.map(ex => ({ ...ex, isAnswered: false, selectedAnswer: undefined, isCorrect: undefined })));
    setCurrentIndex(0);
    setScore(0);
    setCompleted(false);
    setFeedback(null);
    setMatchedPairs([]);
  }, []);

  if (!offlineAudio.manifestLoaded) {
    return <div className="flex items-center justify-center min-h-[300px]"><Loader2 size={40} className="animate-spin text-red-500 mx-auto" /></div>;
  }

  if (!exercises.length || !current) {
    return <div className="text-center p-8 bg-yellow-50 text-yellow-800 rounded-xl">⚠️ {t('InteractiveLesson__no_exercises')}</div>;
  }

  if (completed) {
    const accuracy = Math.round((score / exercises.length) * 100);
    return (
      <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200">
        <div className="text-6xl mb-4">{accuracy === 100 ? '🏆' : accuracy >= 70 ? '🎉' : '💪'}</div>
        <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">{t('InteractiveLesson__perfect')}</h2>
        <p className="text-3xl font-bold mt-4 text-red-500">{accuracy}%</p>
        <button onClick={handleReset} className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium">
          🔄 {t('InteractiveLesson__repeat_lesson')}
        </button>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / exercises.length) * 100;

  return (
    <div className={`max-w-2xl mx-auto p-4 ${className}`}>
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
        <div className="mb-6 flex items-start gap-3">
          <button
            onClick={() => playAudioText(current.audioText || current.questionArmenian || current.question, selectedLanguage)}
            className="p-2 rounded-xl bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition-colors"
          >
            <Volume2 size={20} />
          </button>
          <div className="flex-1">
            <p className="text-lg font-medium text-gray-900 dark:text-white whitespace-pre-line">
              {current.questionArmenian || current.question}
            </p>
          </div>
        </div>

        {current.type === 'matching' && current.pairs && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              {leftItems.map((item) => (
                <button
                  key={`left-${item.id}`}
                  onClick={() => handleMatchClick(item.id, item.native, 'left')}
                  disabled={matchedPairs.includes(item.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    matchedPairs.includes(item.id) ? 'bg-green-500/20 border-green-500 opacity-50' :
                    selectedLeft === item.id ? 'border-orange-500 bg-orange-500/10' : 'border-white/20 bg-white/40 hover:bg-white/60 text-gray-900'
                  }`}
                >
                  {item.native}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {rightItems.map((item) => (
                <button
                  key={`right-${item.id}`}
                  onClick={() => handleMatchClick(item.id, item.learning, 'right')}
                  disabled={matchedPairs.includes(item.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    matchedPairs.includes(item.id) ? 'bg-green-500/20 border-green-500 opacity-50' :
                    selectedRight === item.id ? 'border-orange-500 bg-orange-500/10' : 'border-white/20 bg-white/40 hover:bg-white/60 text-gray-900'
                  }`}
                >
                  {item.learning}
                </button>
              ))}
            </div>
          </div>
        )}

        {current.type === 'true-false' && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              onClick={() => handleAnswer('true')}
              disabled={current.isAnswered}
              className={`py-6 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                current.isAnswered && current.correctAnswer === 'true' ? 'border-green-500 bg-green-500/20' : 'border-white/20 bg-white/20 hover:bg-white/30'
              }`}
            >
              <Check size={32} className="text-green-500" />
              <span className="font-bold">Ճիշտ է</span>
            </button>
            <button
              onClick={() => handleAnswer('false')}
              disabled={current.isAnswered}
              className={`py-6 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                current.isAnswered && current.correctAnswer === 'false' ? 'border-green-500 bg-green-500/20' : 'border-white/20 bg-white/20 hover:bg-white/30'
              }`}
            >
              <X size={32} className="text-red-500" />
              <span className="font-bold">Սխալ է</span>
            </button>
          </div>
        )}

        {current.type === 'jumbled-sentence' && (
          <div className="space-y-4 mt-4">
            <div className="min-h-[60px] p-4 rounded-xl bg-white/30 border border-white/20 flex flex-wrap gap-2">
              {selectedWords.map((w, i) => (
                <button key={i} onClick={() => handleWordDeselect(w, i)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg">
                  {w}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableWords.map((w, i) => (
                <button key={i} onClick={() => handleWordSelect(w, i)} className="px-3 py-1.5 bg-white/40 hover:bg-white/60 rounded-lg text-gray-900">
                  {w}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleAnswer(selectedWords.join(' '))}
              disabled={current.isAnswered || selectedWords.length === 0}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50"
            >
              Ստուգել
            </button>
          </div>
        )}

        {(current.type === 'fill-in-the-blanks' || current.type === 'word-scramble') && (
          <div className="space-y-4 mt-4">
            {current.translations?.en && (
              <p className="text-sm text-gray-500 text-center mb-2">Ակնարկ՝ {current.translations.en}</p>
            )}
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Գրիր պատասխանը..."
              disabled={current.isAnswered}
              className="w-full p-4 rounded-xl bg-white/20 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-center text-gray-900 dark:text-white"
            />
            <button
              onClick={() => handleAnswer(textInput)}
              disabled={current.isAnswered || !textInput.trim()}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50"
            >
              Ստուգել
            </button>
          </div>
        )}

        {current.options && current.type !== 'jumbled-sentence' && (
          <div className="space-y-3 mt-4">
            {current.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={current.isAnswered}
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

        {feedback && (
          <div className={`mt-6 p-4 rounded-xl ${feedback.isCorrect ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              {feedback.isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
              {feedback.message}
            </div>
            {!feedback.isCorrect && (
              <p className="text-sm">Ճիշտ պատասխանն էր՝ <span className="font-bold underline">{feedback.correctAnswer}</span></p>
            )}
          </div>
        )}

        <div className="flex justify-between mt-6 pt-4 border-t border-white/20">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white/20 hover:bg-white/30 disabled:opacity-50 transition-colors text-gray-700"
          >
            <ArrowLeft size={16} className="inline mr-1" /> {t('InteractiveLesson__previous')}
          </button>
          
          <button
            onClick={handleSkip}
            disabled={current.isAnswered}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white/20 hover:bg-white/30 disabled:opacity-50 transition-colors text-gray-700"
          >
            {t('InteractiveLesson__skip')} <ArrowRight size={16} className="inline ml-1" />
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

export default InteractiveLesson;