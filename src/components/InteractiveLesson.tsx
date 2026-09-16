// src/components/InteractiveLesson.tsx

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, Loader2, CheckCircle, XCircle, Wifi, WifiOff, Play, Pause, Music, ArrowLeft, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useCanonicalOfflineAudio } from '@/lib/hooks/useCanonicalOfflineAudio';
import { useI18n } from '@/hooks/useI18n'; // ✅ ՃԻՇՏ import

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
// VOICE SELECTOR
// ============================================================

function VoiceSelector({ 
  language, 
  selectedGender, 
  onSelect,
  disabled,
  t
}: { 
  language: Language;
  selectedGender: Gender;
  onSelect: (gender: Gender) => void;
  disabled?: boolean;
  t: (key: string, params?: any) => string;
}) {
  const config = VOICE_CONFIG[language];
  if (!config) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onSelect('male')}
        disabled={disabled}
        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
          selectedGender === 'male'
            ? 'bg-blue-600 text-white'
            : 'bg-white/20 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        🧑
      </button>
      <button
        onClick={() => onSelect('female')}
        disabled={disabled}
        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
          selectedGender === 'female'
            ? 'bg-pink-600 text-white'
            : 'bg-white/20 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        👩
      </button>
    </div>
  );
}

// ============================================================
// TYPES
// ============================================================

interface Exercise {
  id: string;
  type: 'listen-and-select' | 'listen-and-speak' | 'listen-and-repeat' | 'multiple-choice' | 'translate';
  question: string;
  questionArmenian?: string;
  correctAnswer: string;
  options?: string[];
  audioId?: string;
  audioText?: string;
  hint?: string;
  translations?: { hy?: string; en?: string; ru?: string };
}

interface ExerciseState extends Exercise {
  isAnswered: boolean;
  selectedAnswer?: string;
  isCorrect?: boolean;
}

// ============================================================
// INTERACTIVE LESSON COMPONENT
// ============================================================

interface InteractiveLessonProps {
  lessonId: string;
  lessonData?: {
    title: string;
    exercises: Exercise[];
  };
  onComplete?: (score: number, stats: { correct: number; total: number; accuracy: number }) => void;
  className?: string;
}

export function InteractiveLesson({ 
  lessonId, 
  lessonData,
  onComplete,
  className = ''
}: InteractiveLessonProps) {
  const { t } = useI18n(); // ✅ ՃԻՇՏ useI18n
  const offlineAudio = useCanonicalOfflineAudio();
  
  const [exercises, setExercises] = useState<ExerciseState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; correctAnswer?: string } | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('hy');

  // Initialize exercises
  useEffect(() => {
    if (lessonData?.exercises) {
      const initialExercises = lessonData.exercises.map(ex => ({
        ...ex,
        isAnswered: false,
        selectedAnswer: undefined,
        isCorrect: undefined,
      }));
      setExercises(initialExercises);
    }
  }, [lessonData]);

  // Auto-play question audio
  useEffect(() => {
    if (!exercises.length || completed) return;
    
    const current = exercises[currentIndex];
    if (current && offlineAudio.isOfflineMode) {
      const audioId = current.audioId || `ex_${current.id}`;
      
      const timer = setTimeout(() => {
        offlineAudio.playAudio(audioId, selectedLanguage);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, exercises, completed, offlineAudio, selectedLanguage]);

  // Handle answer
  const handleAnswer = useCallback(async (selected: string) => {
    if (isSubmitting) return;
    
    const current = exercises[currentIndex];
    if (!current || current.isAnswered) return;

    setIsSubmitting(true);
    setSelectedOption(selected);

    const isCorrect = selected === current.correctAnswer;
    
    setExercises(prev => {
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        isAnswered: true,
        selectedAnswer: selected,
        isCorrect: isCorrect,
      };
      return updated;
    });

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback({
        isCorrect: true,
        message: t('InteractiveLesson__correct'),
      });
    } else {
      setFeedback({
        isCorrect: false,
        message: t('InteractiveLesson__wrong'),
        correctAnswer: current.correctAnswer,
      });
    }

    setTimeout(() => {
      setFeedback(null);
      setSelectedOption(null);
      setIsSubmitting(false);
      
      const nextIndex = currentIndex + 1;
      if (nextIndex < exercises.length) {
        setCurrentIndex(nextIndex);
      } else {
        setCompleted(true);
        const accuracy = Math.round((score / exercises.length) * 100);
        onComplete?.(accuracy, {
          correct: score + (isCorrect ? 1 : 0),
          total: exercises.length,
          accuracy: accuracy,
        });
      }
    }, 2000);
  }, [currentIndex, exercises, score, onComplete, isSubmitting, t]);

  // Play audio for exercise
  const handlePlayAudio = useCallback((audioId: string, text?: string) => {
    if (!offlineAudio.isOfflineMode) {
      alert(t('InteractiveLesson__enable_offline'));
      return;
    }

    offlineAudio.playAudio(audioId, selectedLanguage);
  }, [offlineAudio, selectedLanguage, t]);

  // Skip to next
  const handleSkip = useCallback(() => {
    if (feedback) return;
    
    const nextIndex = currentIndex + 1;
    if (nextIndex < exercises.length) {
      setCurrentIndex(nextIndex);
    } else {
      setCompleted(true);
      const accuracy = Math.round((score / exercises.length) * 100);
      onComplete?.(accuracy, {
        correct: score,
        total: exercises.length,
        accuracy: accuracy,
      });
    }
  }, [currentIndex, exercises.length, score, onComplete, feedback]);

  // Reset lesson
  const handleReset = useCallback(() => {
    setExercises(prev => prev.map(ex => ({
      ...ex,
      isAnswered: false,
      selectedAnswer: undefined,
      isCorrect: undefined,
    })));
    setCurrentIndex(0);
    setScore(0);
    setCompleted(false);
    setFeedback(null);
    setSelectedOption(null);
  }, []);

  // Loading state
  if (!offlineAudio.manifestLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-red-500 mx-auto" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">{t('InteractiveLesson__loading_audio')}</p>
        </div>
      </div>
    );
  }

  // No exercises
  if (!exercises.length) {
    return (
      <div className="text-center p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400">
          ⚠️ {t('InteractiveLesson__no_exercises')}
        </h3>
      </div>
    );
  }

  // Completed
  if (completed) {
    const accuracy = Math.round((score / exercises.length) * 100);
    const isPerfect = accuracy === 100;
    const isGood = accuracy >= 70;

    return (
      <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
        <div className="text-6xl mb-4">{isPerfect ? '🏆' : isGood ? '🎉' : '💪'}</div>
        <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
          {isPerfect ? t('InteractiveLesson__perfect') : isGood ? t('InteractiveLesson__great_job') : t('InteractiveLesson__keep_practicing')}
        </h2>
        <p className="text-lg mt-2 text-gray-700 dark:text-gray-300">
          {t('InteractiveLesson__correct_answers')}: {score} / {exercises.length}
        </p>
        <p className="text-3xl font-bold mt-4 text-red-500">
          {accuracy}%
        </p>
        <button
          onClick={handleReset}
          className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
        >
          🔄 {t('InteractiveLesson__repeat_lesson')}
        </button>
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('InteractiveLesson__exercise_x_of_y', { current: currentIndex + 1, total: exercises.length })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Offline toggle */}
            <button
              onClick={offlineAudio.toggleOfflineMode}
              className={`p-2 rounded-xl transition-colors ${
                offlineAudio.isOfflineMode
                  ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                  : 'bg-white/20 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-700 border border-white/20 dark:border-gray-700'
              }`}
              title={offlineAudio.isOfflineMode ? t('InteractiveLesson__offline_on') : t('InteractiveLesson__enable_offline')}
            >
              {offlineAudio.isOfflineMode ? <WifiOff size={18} /> : <Wifi size={18} />}
            </button>
            
            {/* Score */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/40 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">{score}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">/ {exercises.length}</span>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-white/10 dark:bg-gray-700 rounded-full h-2 mt-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Exercise Card */}
      <GlassCard variant="premium" className="p-6">
        {/* Language selector and voice controls */}
        <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-white/20 dark:border-gray-700">
          {/* Language selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('InteractiveLesson__language')}</span>
            {(['hy', 'en', 'ru'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2 py-1 text-[10px] rounded transition-all ${
                  selectedLanguage === lang
                    ? 'bg-red-600 text-white'
                    : 'bg-white/20 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-700'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Voice selector */}
          <div className="flex items-center gap-2 ml-auto">
            <Music size={14} className="text-gray-500" />
            {(['hy', 'en', 'ru'] as Language[]).map((lang) => (
              <div key={lang} className="flex items-center gap-1">
                <span className="text-[8px] text-gray-500 uppercase">{lang}:</span>
                <VoiceSelector
                  language={lang}
                  selectedGender={offlineAudio.getVoice(lang)}
                  onSelect={(g) => offlineAudio.setVoice(lang, g)}
                  disabled={!offlineAudio.isOfflineMode}
                  t={t}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <button
              onClick={() => {
                const audioId = current.audioId || `ex_${current.id}`;
                handlePlayAudio(audioId, current.audioText);
              }}
              disabled={!offlineAudio.isOfflineMode || offlineAudio.isPlaying}
              className={`flex-shrink-0 p-2 rounded-xl transition-all ${
                offlineAudio.isOfflineMode && !offlineAudio.isPlaying
                  ? 'bg-white/20 dark:bg-gray-800/80 hover:bg-white/30 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-white/20 dark:border-gray-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              title={offlineAudio.isOfflineMode ? t('InteractiveLesson__play_audio') : t('InteractiveLesson__enable_offline')}
            >
              {offlineAudio.isPlaying ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Volume2 size={20} />
              )}
            </button>
            <div className="flex-1">
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {current.questionArmenian || current.question}
              </p>
              {current.hint && (
                <p className="text-sm text-amber-500 mt-1">💡 {current.hint}</p>
              )}
              {current.translations && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {current.translations.en} • {current.translations.ru}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Options - Listen & Select */}
        {current.type === 'listen-and-select' && current.options && (
          <div className="space-y-3">
            {current.options.map((option) => {
              const isSelected = selectedOption === option;
              const isCorrect = current.isAnswered && option === current.correctAnswer;
              const isWrong = current.isAnswered && isSelected && !isCorrect;
              
              let className = "w-full text-left p-4 rounded-xl border-2 transition-all ";
              
              if (current.isAnswered) {
                if (isCorrect) {
                  className += "border-green-500 bg-green-500/10 text-green-500";
                } else if (isWrong) {
                  className += "border-red-500 bg-red-500/10 line-through opacity-70";
                } else {
                  className += "border-white/20 dark:border-gray-700 opacity-50";
                }
              } else {
                className += isSelected
                  ? "border-red-500 bg-red-500/10"
                  : "border-white/20 dark:border-gray-700 bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-700";
              }

              return (
                <button
                  key={option}
                  onClick={() => !current.isAnswered && handleAnswer(option)}
                  disabled={current.isAnswered || isSubmitting}
                  className={className}
                >
                  <span className="text-gray-900 dark:text-white">{option}</span>
                  {isCorrect && <span className="ml-2 text-green-500">✅</span>}
                  {isWrong && <span className="ml-2 text-red-500">❌</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Listen & Speak / Repeat */}
        {(current.type === 'listen-and-speak' || current.type === 'listen-and-repeat') && (
          <div className="text-center py-8">
            <button
              onClick={() => {
                const audioId = current.audioId || `ex_${current.id}`;
                handlePlayAudio(audioId, current.audioText);
              }}
              disabled={!offlineAudio.isOfflineMode || offlineAudio.isPlaying}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                offlineAudio.isOfflineMode && !offlineAudio.isPlaying
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {offlineAudio.isPlaying ? (
                <>
                  <Loader2 size={18} className="animate-spin inline mr-2" />
                  {t('InteractiveLesson__playing')}
                </>
              ) : (
                '🔊 ' + t('InteractiveLesson__listen')
              )}
            </button>
            
            {!current.isAnswered && (
              <button
                onClick={() => handleAnswer(current.correctAnswer)}
                disabled={isSubmitting}
                className="ml-4 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
              >
                ✅ {t('InteractiveLesson__i_said_it')}
              </button>
            )}
          </div>
        )}

        {/* Multiple Choice */}
        {current.type === 'multiple-choice' && current.options && (
          <div className="space-y-3">
            {current.options.map((option) => {
              const isSelected = selectedOption === option;
              const isCorrect = current.isAnswered && option === current.correctAnswer;
              const isWrong = current.isAnswered && isSelected && !isCorrect;
              
              let className = "w-full text-left p-4 rounded-xl border-2 transition-all ";
              
              if (current.isAnswered) {
                if (isCorrect) {
                  className += "border-green-500 bg-green-500/10 text-green-500";
                } else if (isWrong) {
                  className += "border-red-500 bg-red-500/10 line-through opacity-70";
                } else {
                  className += "border-white/20 dark:border-gray-700 opacity-50";
                }
              } else {
                className += isSelected
                  ? "border-red-500 bg-red-500/10"
                  : "border-white/20 dark:border-gray-700 bg-white/20 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-700";
              }

              return (
                <button
                  key={option}
                  onClick={() => !current.isAnswered && handleAnswer(option)}
                  disabled={current.isAnswered || isSubmitting}
                  className={className}
                >
                  <span className="text-gray-900 dark:text-white">{option}</span>
                  {isCorrect && <span className="ml-2 text-green-500">✅</span>}
                  {isWrong && <span className="ml-2 text-red-500">❌</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Translate */}
        {current.type === 'translate' && (
          <div className="space-y-4">
            <div className="text-center text-xl font-semibold text-gray-900 dark:text-white">
              {current.question}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {current.translations?.en && `🇬🇧 ${current.translations.en}`}
            </div>
            <button
              onClick={() => handleAnswer(current.correctAnswer)}
              disabled={current.isAnswered || isSubmitting}
              className={`w-full py-3 rounded-xl font-medium transition-all ${
                current.isAnswered
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              ✅ {t('InteractiveLesson__show_answer')}
            </button>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`mt-4 p-4 rounded-xl ${
            feedback.isCorrect 
              ? 'bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.isCorrect ? (
                <CheckCircle size={20} />
              ) : (
                <XCircle size={20} />
              )}
              <span>{feedback.message}</span>
            </div>
            {!feedback.isCorrect && feedback.correctAnswer && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t('InteractiveLesson__correct_answer')}: <span className="font-bold">{feedback.correctAnswer}</span>
              </p>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t border-white/20 dark:border-gray-700">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white/20 dark:bg-gray-800/80 hover:bg-white/30 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
          >
            <ArrowLeft size={16} className="inline mr-1" />
            {t('InteractiveLesson__previous')}
          </button>
          
          <button
            onClick={handleSkip}
            disabled={current.isAnswered}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white/20 dark:bg-gray-800/80 hover:bg-white/30 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
          >
            {t('InteractiveLesson__skip')}
            <ArrowRight size={16} className="inline ml-1" />
          </button>
        </div>

        {/* Offline status */}
        {offlineAudio.isOfflineMode && (
          <div className="mt-4 text-xs text-green-500 flex items-center gap-2">
            <WifiOff size={12} />
            <span>{t('InteractiveLesson_offline_mode_offlineaudio_audiocount_audio_files_a', { count: offlineAudio.audioCount })}</span>
            {offlineAudio.isPlaying && (
              <span className="animate-pulse flex items-center gap-1">
                <Loader2 size={10} className="animate-spin" />
                {t('InteractiveLesson__playing')}
              </span>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// ============================================================
// EXPORT
// ============================================================

export default InteractiveLesson;