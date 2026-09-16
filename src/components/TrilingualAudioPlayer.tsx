// src/components/TrilingualAudioPlayer.tsx

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, Loader2, CheckCircle, Wifi, WifiOff, Play, Pause, XCircle } from 'lucide-react';
import { offlineLessonEngine } from '@/lib/offline/OfflineLessonEngine';
import { useCanonicalOfflineAudio } from '@/lib/hooks/useCanonicalOfflineAudio';
import { useI18n } from '@/hooks/useI18n';

// ─── VOICE CONFIGURATION ─────────────────────────────────────────────

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

// ─── VOICE SELECTOR ──────────────────────────────────────────────────

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
  t: (key: string) => string;
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

// ─── MAIN PLAYER ─────────────────────────────────────────────────────

interface TrilingualAudioPlayerProps {
  entryId: string;
  text: string;
  translations?: { hy?: string; en?: string; ru?: string };
  type?: 'vocabulary' | 'phrase' | 'dialogue' | 'exercise';
  autoPlay?: boolean;
  showLanguages?: boolean;
  onPlay?: (language: Language) => void;
  onComplete?: () => void;
  className?: string;
}

export function TrilingualAudioPlayer({
  entryId,
  text,
  translations,
  type = 'vocabulary',
  autoPlay = false,
  showLanguages = true,
  onPlay,
  onComplete,
  className = '',
}: TrilingualAudioPlayerProps) {
  const { t } = useI18n();
  const offlineAudio = useCanonicalOfflineAudio();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('hy');
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const autoPlayRef = useRef(false);

  useEffect(() => {
    if (autoPlay && !autoPlayRef.current && offlineAudio.isOfflineMode) {
      autoPlayRef.current = true;
      handlePlay();
    }
  }, [autoPlay, offlineAudio.isOfflineMode]);

  const handlePlay = useCallback(async () => {
    if (!offlineAudio.isOfflineMode) {
      setError(t('TrilingualAudioPlayer__enable_offline'));
      return;
    }

    if (isPlaying) {
      offlineAudio.stopAudio();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const gender = offlineAudio.getVoice(selectedLanguage);
      const success = await offlineAudio.playAudio(entryId, selectedLanguage);
      
      if (success) {
        setIsPlaying(true);
        onPlay?.(selectedLanguage);
        
        const checkPlaying = setInterval(() => {
          if (!offlineAudio.isPlaying) {
            setIsPlaying(false);
            onComplete?.();
            clearInterval(checkPlaying);
          }
        }, 500);
      } else {
        let fallbackSuccess = false;
        const langs: Language[] = ['hy', 'en', 'ru'];
        for (const lang of langs) {
          if (lang === selectedLanguage) continue;
          const s = await offlineAudio.playAudio(entryId, lang);
          if (s) {
            setSelectedLanguage(lang);
            setIsPlaying(true);
            fallbackSuccess = true;
            onPlay?.(lang);
            break;
          }
        }
        if (!fallbackSuccess) {
          setError(t('TrilingualAudioPlayer__no_audio', { lang: selectedLanguage.toUpperCase() }));
        }
      }
    } catch (err) {
      setError(t('TrilingualAudioPlayer__play_failed'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [offlineAudio, entryId, selectedLanguage, isPlaying, onPlay, onComplete, t]);

  const handleLanguageChange = useCallback((lang: Language) => {
    if (isPlaying) {
      offlineAudio.stopAudio();
      setIsPlaying(false);
    }
    setSelectedLanguage(lang);
  }, [isPlaying, offlineAudio]);

  const handlePlayAll = useCallback(async () => {
    if (!offlineAudio.isOfflineMode) {
      setError(t('TrilingualAudioPlayer__enable_offline'));
      return;
    }

    setIsLoading(true);
    setError(null);

    const languages: Language[] = ['hy', 'en', 'ru'];
    let played = false;

    for (const lang of languages) {
      const success = await offlineAudio.playAudio(entryId, lang);
      if (success) {
        played = true;
        setSelectedLanguage(lang);
        setIsPlaying(true);
        onPlay?.(lang);
        await new Promise(resolve => {
          const check = setInterval(() => {
            if (!offlineAudio.isPlaying) {
              clearInterval(check);
              resolve(null);
            }
          }, 300);
        });
      }
    }

    setIsPlaying(false);
    setIsLoading(false);
    if (!played) {
      setError(t('TrilingualAudioPlayer__no_audio_all'));
    }
    onComplete?.();
  }, [offlineAudio, entryId, onPlay, onComplete, t]);

  const displayText = translations?.[selectedLanguage] || text;

  return (
    <div className={`flex flex-col gap-2 p-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700 ${className}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={handlePlay}
          disabled={!offlineAudio.isOfflineMode || isLoading}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isPlaying
              ? 'bg-blue-500/20 text-blue-400'
              : offlineAudio.isOfflineMode
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
          title={offlineAudio.isOfflineMode ? (isPlaying ? t('TrilingualAudioPlayer__stop') : t('TrilingualAudioPlayer__play')) : t('TrilingualAudioPlayer__enable_offline')}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={18} />
          ) : (
            <Play size={18} className="ml-0.5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 dark:text-white truncate">
            {displayText}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{selectedLanguage.toUpperCase()}</span>
            <span>•</span>
            <span className="capitalize">{t('TrilingualAudioPlayer__type_' + type)}</span>
            {offlineAudio.isOfflineMode && offlineAudio.hasAudio(entryId, selectedLanguage) && (
              <span className="text-green-500 flex items-center gap-1">
                <CheckCircle size={10} />
                {t('TrilingualAudioPlayer__offline')}
              </span>
            )}
          </div>
        </div>

        {showLanguages && (
          <div className="flex items-center gap-1">
            {(['hy', 'en', 'ru'] as Language[]).map((lang) => {
              const hasAudio = offlineAudio.hasAudio(entryId, lang);
              
              return (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  disabled={!offlineAudio.isOfflineMode || isPlaying}
                  className={`px-2 py-1 text-[10px] rounded transition-all ${
                    selectedLanguage === lang
                      ? 'bg-red-600 text-white'
                      : hasAudio && offlineAudio.isOfflineMode
                      ? 'bg-white/20 dark:bg-gray-800/80 hover:bg-white/30 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pl-13">
        <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
          <span>{t('TrilingualAudioPlayer__voice')}:</span>
          {(['hy', 'en', 'ru'] as Language[]).map((lang) => (
            <div key={lang} className="flex items-center gap-1">
              <span className="uppercase">{lang}:</span>
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

        {showLanguages && (
          <button
            onClick={handlePlayAll}
            disabled={!offlineAudio.isOfflineMode || isLoading || isPlaying}
            className="px-3 py-1 text-[10px] font-medium bg-white/20 dark:bg-gray-800/80 hover:bg-white/30 dark:hover:bg-gray-700 rounded-lg border border-white/20 dark:border-gray-700 text-gray-600 dark:text-gray-300 transition-all disabled:opacity-50"
          >
            🔊 {t('TrilingualAudioPlayer__all')}
          </button>
        )}

        <button
          onClick={offlineAudio.toggleOfflineMode}
          className={`px-2 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-all ${
            offlineAudio.isOfflineMode
              ? 'bg-green-500/20 text-green-500 border border-green-500/30'
              : 'bg-white/20 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-700 border border-white/20 dark:border-gray-700'
          }`}
        >
          {offlineAudio.isOfflineMode ? (
            <>
              <WifiOff size={12} />
              {t('TrilingualAudioPlayer__offline')}
            </>
          ) : (
            <>
              <Wifi size={12} />
              {t('TrilingualAudioPlayer__online')}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-500 flex items-center gap-1">
          <XCircle size={12} />
          {error}
        </div>
      )}

      {offlineAudio.isOfflineMode && offlineAudio.isPlaying && (
        <div className="text-xs text-blue-400 animate-pulse flex items-center gap-1">
          <Loader2 size={12} className="animate-spin" />
          {t('TrilingualAudioPlayer__playing')}
        </div>
      )}
    </div>
  );
}

// ─── LIST COMPONENT ──────────────────────────────────────────────────

interface AudioListProps {
  items: Array<{
    id: string;
    text: string;
    translations?: { hy?: string; en?: string; ru?: string };
    type?: 'vocabulary' | 'phrase' | 'dialogue' | 'exercise';
  }>;
  autoPlay?: boolean;
  showLanguages?: boolean;
  className?: string;
}

export function TrilingualAudioList({ 
  items, 
  autoPlay = false, 
  showLanguages = true,
  className = ''
}: AudioListProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <TrilingualAudioPlayer
          key={item.id}
          entryId={item.id}
          text={item.text}
          translations={item.translations}
          type={item.type || 'vocabulary'}
          autoPlay={autoPlay && index === 0}
          showLanguages={showLanguages}
        />
      ))}
    </div>
  );
}

export default TrilingualAudioPlayer;