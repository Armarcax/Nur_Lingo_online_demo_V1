// src/components/TrilingualAudioPlayer.tsx

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Loader2, 
  Play, 
  Pause, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  Music,
  XCircle
} from 'lucide-react';
import { trilingualAudioEngine } from '@/lib/offline/trilingual-audio-engine';
import type { Language, AudioEntry } from '@/lib/offline/trilingual-audio-engine';
import { useI18n } from "@/hooks/useI18n";

// ─── TYPES ────────────────────────────────────────────────────────────

type Gender = 'male' | 'female';

interface TrilingualAudioPlayerProps {
  entryId: string;
  text: string;
  translations?: { hy?: string; en?: string; ru?: string };
  type?: 'vocabulary' | 'phrase' | 'dialogue' | 'exercise' | 'title';
  autoPlay?: boolean;
  showLanguages?: boolean;
  showVoiceSelector?: boolean;
  onPlay?: (language: Language) => void;
  onComplete?: () => void;
  className?: string;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export function TrilingualAudioPlayer({
  const { t } = useI18n();
  entryId,
  text,
  translations,
  type = 'vocabulary',
  autoPlay = false,
  showLanguages = true,
  showVoiceSelector = true,
  onPlay,
  onComplete,
  className = '',
}: TrilingualAudioPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEntry, setAudioEntry] = useState<AudioEntry | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('hy');
  const [selectedGender, setSelectedGender] = useState<Gender>('male');
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [audioCount, setAudioCount] = useState(0);

  // ─── INIT ───────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      try {
        await trilingualAudioEngine.init();
        
        const stats = trilingualAudioEngine.getStats();
        setAudioCount(stats.totalEntries || 0);
        setIsOfflineMode(stats.totalEntries > 0);
        
        let entry = trilingualAudioEngine.getAudioEntry(entryId);
        
        if (!entry) {
          entry = await trilingualAudioEngine.generateTrilingualAudio(
            text,
            translations || { hy: text, en: text, ru: text },
            selectedGender
          );
        }
        
        setAudioEntry(entry);
        setError(null);
      } catch (err) {
        setError('Failed to load audio');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [entryId, text, translations, selectedGender]);

  // ─── AUTO-PLAY ─────────────────────────────────────────────────────

  useEffect(() => {
    if (autoPlay && audioEntry && !isPlaying && !loading) {
      handlePlay();
    }
  }, [autoPlay, audioEntry, loading]);

  // ─── PLAY HANDLER ──────────────────────────────────────────────────

  const handlePlay = useCallback(async () => {
    if (!audioEntry || isPlaying) return;
    
    try {
      setIsPlaying(true);
      
      const hasAudio = trilingualAudioEngine.hasAudio(
        entryId, 
        selectedLanguage, 
        selectedGender
      );
      
      if (hasAudio) {
        const success = await trilingualAudioEngine.playAudio(
          entryId,
          selectedLanguage,
          selectedGender
        );
        
        if (success) {
          onPlay?.(selectedLanguage);
          setTimeout(() => {
            setIsPlaying(false);
            onComplete?.();
          }, 3000);
        } else {
          setIsPlaying(false);
          setError('Failed to play audio');
        }
      } else {
        await fallbackPlay(text, selectedLanguage);
        onPlay?.(selectedLanguage);
        setTimeout(() => {
          setIsPlaying(false);
          onComplete?.();
        }, 2000);
      }
    } catch (err) {
      setError('Failed to play audio');
      console.error(err);
      setIsPlaying(false);
    }
  }, [audioEntry, entryId, selectedLanguage, selectedGender, text, isPlaying, onPlay, onComplete]);

  // ─── FALLBACK PLAY ─────────────────────────────────────────────────

  const fallbackPlay = useCallback((text: string, lang: Language): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hy' ? 'hy-AM' : lang === 'en' ? 'en-US' : 'ru-RU';
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // ─── STOP ──────────────────────────────────────────────────────────

  const stopAudio = useCallback(() => {
    trilingualAudioEngine.stopAudio();
    setIsPlaying(false);
  }, []);

  // ─── PLAY ALL ──────────────────────────────────────────────────────

  const handlePlayAll = useCallback(async () => {
    if (!audioEntry || isPlaying) return;
    
    try {
      setIsPlaying(true);
      await trilingualAudioEngine.playTrilingualAudio(entryId, selectedGender);
      onComplete?.();
    } catch (err) {
      setError('Failed to play audio');
      console.error(err);
    } finally {
      setIsPlaying(false);
    }
  }, [audioEntry, entryId, selectedGender, isPlaying, onComplete]);

  // ─── LANGUAGE CHANGE ──────────────────────────────────────────────

  const handleLanguageChange = useCallback((lang: Language) => {
    setSelectedLanguage(lang);
  }, []);

  // ─── GENDER CHANGE ─────────────────────────────────────────────────

  const handleGenderChange = useCallback((gender: Gender) => {
    setSelectedGender(gender);
  }, []);

  // ─── TOGGLE OFFLINE ──────────────────────────────────────────────

  const toggleOffline = useCallback(() => {
    setIsOfflineMode(prev => !prev);
    if (isPlaying) stopAudio();
  }, [isPlaying, stopAudio]);

  // ─── RENDER ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700 animate-pulse ${className}`}>
        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-1"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 ${className}`}>
        <XCircle size={20} className="text-red-500 flex-shrink-0" />
        <span className="text-sm text-red-500">{error}</span>
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-red-500 underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const hasMultipleLanguages = audioEntry?.translations 
    ? Object.values(audioEntry.translations).filter(Boolean).length > 1
    : false;

  const displayText = audioEntry?.translations?.[selectedLanguage] || text;

  return (
    <div className={`flex flex-col gap-2 p-3 rounded-xl bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700 ${className}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={isPlaying ? stopAudio : handlePlay}
          disabled={!isOfflineMode && !window.speechSynthesis}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isPlaying
              ? 'bg-blue-500/20 text-blue-400'
              : isOfflineMode || window.speechSynthesis
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 dark:text-white truncate">
            {displayText}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="uppercase">{selectedLanguage}</span>
            <span>•</span>
            <span className="capitalize">{type}</span>
            {isOfflineMode && audioEntry && (
              <span className="text-green-500 flex items-center gap-1">
                <CheckCircle size={10} />
                offline
              </span>
            )}
          </div>
        </div>

        {showLanguages && hasMultipleLanguages && (
          <div className="flex items-center gap-1">
            {(['hy', 'en', 'ru'] as Language[]).map((lang) => {
              const hasTranslation = audioEntry?.translations?.[lang];
              if (!hasTranslation) return null;
              
              return (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  disabled={isPlaying}
                  className={`px-2 py-1 text-[10px] rounded transition-all ${
                    selectedLanguage === lang
                      ? 'bg-red-600 text-white'
                      : 'bg-white/20 dark:bg-gray-800/80 hover:bg-white/30 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-white/20 dark:border-gray-700'
                  } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {lang.toUpperCase()}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 pl-13">
        {showVoiceSelector && isOfflineMode && (
          <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
            <Music size={12} />
            <span>Ձայն:</span>
            {(['hy', 'en', 'ru'] as Language[]).map((lang) => (
              <div key={lang} className="flex items-center gap-0.5">
                <span className="uppercase text-[8px]">{lang}:</span>
                <button
                  onClick={() => handleGenderChange('male')}
                  disabled={isPlaying}
                  className={`px-1.5 py-0.5 rounded text-[9px] transition-all ${
                    selectedGender === 'male'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/20 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-700'
                  } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  🧑
                </button>
                <button
                  onClick={() => handleGenderChange('female')}
                  disabled={isPlaying}
                  className={`px-1.5 py-0.5 rounded text-[9px] transition-all ${
                    selectedGender === 'female'
                      ? 'bg-pink-600 text-white'
                      : 'bg-white/20 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-700'
                  } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  👩
                </button>
              </div>
            ))}
          </div>
        )}

        {showLanguages && hasMultipleLanguages && (
          <button
            onClick={handlePlayAll}
            disabled={isPlaying || !isOfflineMode}
            className={`px-2.5 py-1 text-[10px] font-medium rounded-lg transition-all ${
              isOfflineMode && !isPlaying
                ? 'bg-white/20 dark:bg-gray-800/80 hover:bg-white/30 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-white/20 dark:border-gray-700'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            🔊 All
          </button>
        )}

        <button
          onClick={toggleOffline}
          className={`px-2 py-0.5 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-all ${
            isOfflineMode
              ? 'bg-green-500/20 text-green-500 border border-green-500/30'
              : 'bg-white/20 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-700 border border-white/20 dark:border-gray-700'
          }`}
        >
          {isOfflineMode ? <WifiOff size={10} /> : <Wifi size={10} />}
          {isOfflineMode ? 'Offline' : 'Online'}
        </button>

        {isPlaying && (
          <span className="text-xs text-blue-400 animate-pulse flex items-center gap-1">
            <Loader2 size={10} className="animate-spin" />
            Playing...
          </span>
        )}
      </div>

      {isOfflineMode && audioCount > 0 && (
        <div className="text-[10px] text-green-500/60 flex items-center gap-1">
          <CheckCircle size={10} />
          <span>{audioCount} audio files available</span>
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
    type?: 'vocabulary' | 'phrase' | 'dialogue' | 'exercise' | 'title';
  }>;
  autoPlay?: boolean;
  showLanguages?: boolean;
  showVoiceSelector?: boolean;
  className?: string;
}

export function TrilingualAudioList({ 
  items, 
  autoPlay = false, 
  showLanguages = true,
  showVoiceSelector = true,
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
          showVoiceSelector={showVoiceSelector}
        />
      ))}
    </div>
  );
}

export default TrilingualAudioPlayer;