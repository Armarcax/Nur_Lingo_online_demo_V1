// src/components/TrilingualLesson.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, Loader2, CheckCircle, Wifi, WifiOff, Music } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useCanonicalOfflineAudio } from '@/lib/hooks/useCanonicalOfflineAudio';
import { useI18n } from '@/hooks/useI18n';

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
// VOICE SELECTOR COMPONENT
// ============================================================

function VoiceSelector({ 
  language, 
  selectedGender, 
  onSelect,
  disabled,
  t
}: { 
  language: string;
  selectedGender: 'male' | 'female';
  onSelect: (gender: 'male' | 'female') => void;
  disabled?: boolean;
  t: (key: string) => string;
}) {
  const config = VOICE_CONFIG[language as keyof typeof VOICE_CONFIG];
  if (!config) return null;

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onSelect('male')}
        disabled={disabled}
        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
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
        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
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
// TRILINGUAL AUDIO ITEM
// ============================================================

interface AudioItem {
  id: string;
  text: string;
  translations: {
    hy: string;
    en: string;
    ru: string;
  };
}

interface TrilingualAudioItemProps {
  item: AudioItem;
  onPlay: (id: string, language: string, gender: 'male' | 'female') => void;
  isPlaying: boolean;
  isOfflineMode: boolean;
  getVoice: (lang: string) => 'male' | 'female';
  t: (key: string) => string;
}

function TrilingualAudioItem({ 
  item, 
  onPlay, 
  isPlaying, 
  isOfflineMode,
  getVoice,
  t
}: TrilingualAudioItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [playLang, setPlayLang] = useState<'hy' | 'en' | 'ru'>('hy');

  const handlePlay = () => {
    const gender = getVoice(playLang);
    onPlay(item.id, playLang, gender);
  };

  return (
    <GlassCard variant="compact" className="p-3 hover:bg-white/5 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <span className="text-sm">{expanded ? '▼' : '▶'}</span>
            </button>
            <span className="font-medium text-gray-900 dark:text-white truncate">
              {item.text}
            </span>
          </div>
          
          {expanded && (
            <div className="mt-2 space-y-1 pl-6 text-sm text-gray-600 dark:text-gray-400">
              <div>🇦🇲 {item.translations.hy}</div>
              <div>🇬🇧 {item.translations.en}</div>
              <div>🇷🇺 {item.translations.ru}</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Language selector */}
          <select
            value={playLang}
            onChange={(e) => setPlayLang(e.target.value as 'hy' | 'en' | 'ru')}
            disabled={!isOfflineMode || isPlaying}
            className="text-xs bg-white/20 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
          >
            <option value="hy">Հայ</option>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select>

          {/* Play button */}
          <button
            onClick={handlePlay}
            disabled={!isOfflineMode || isPlaying}
            className={`p-2 rounded-xl transition-all ${
              isPlaying
                ? 'bg-blue-500/20 text-blue-400 cursor-wait'
                : isOfflineMode
                ? 'bg-white/20 dark:bg-gray-800/80 hover:bg-white/30 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-white/20 dark:border-gray-700'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
            }`}
            title={isOfflineMode ? t('TrilingualLesson__play_audio_offline') : t('TrilingualLesson__enable_offline')}
          >
            {isPlaying ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Volume2 size={16} />
            )}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================================
// TRILINGUAL AUDIO LIST
// ============================================================

interface TrilingualAudioListProps {
  items: AudioItem[];
  title?: string;
  t: (key: string, params?: Record<string, any>) => string;
}

function TrilingualAudioList({ items, title, t }: TrilingualAudioListProps) {
  const offlineAudio = useCanonicalOfflineAudio();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePlay = async (id: string, language: string) => {
    if (playingId) {
      offlineAudio.stopAudio();
      setPlayingId(null);
    }
    
    const success = await offlineAudio.playAudio(id, language);
    if (success) {
      setPlayingId(id);
      setTimeout(() => setPlayingId(null), 3000);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
        
        <div className="flex items-center gap-3">
          {/* Offline mode toggle */}
          <button
            onClick={offlineAudio.toggleOfflineMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              offlineAudio.isOfflineMode
                ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                : 'bg-white/20 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-700 border border-white/20 dark:border-gray-700'
            }`}
          >
            {offlineAudio.isOfflineMode ? (
              <>
                <WifiOff size={14} />
                {t('TrilingualLesson__offline')}
              </>
            ) : (
              <>
                <Wifi size={14} />
                {t('TrilingualLesson__online')}
              </>
            )}
          </button>
          
          {/* Voice selectors */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Music size={14} />
            <span>{t('TrilingualLesson__voice')}:</span>
          </div>
          
          {Object.entries(VOICE_CONFIG).map(([lang, config]) => (
            <div key={lang} className="flex items-center gap-1">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">{lang}:</span>
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

      {/* Offline status */}
      {offlineAudio.isOfflineMode && (
        <div className="text-xs text-green-500 flex items-center gap-2 mb-3">
          <CheckCircle size={14} />
          <span>{t('TrilingualLesson_offline_mode_offlineaudio_audiocount_audio_files_a', { count: offlineAudio.audioCount })}</span>
          {offlineAudio.isPlaying && (
            <span className="animate-pulse flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" />
              {t('TrilingualLesson__playing')}
            </span>
          )}
        </div>
      )}

      {!offlineAudio.isOfflineMode && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
          <Wifi size={14} />
          <span>{t('TrilingualLesson_enable_offline_mode_to_play_audio')}</span>
        </div>
      )}

      {/* Items */}
      <div className="space-y-2">
        {items.map((item) => (
          <TrilingualAudioItem
            key={item.id}
            item={item}
            onPlay={handlePlay}
            isPlaying={playingId === item.id && offlineAudio.isPlaying}
            isOfflineMode={offlineAudio.isOfflineMode}
            getVoice={offlineAudio.getVoice}
            t={t}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
        {items.length} {t('TrilingualLesson__items')} • {offlineAudio.isOfflineMode ? t('TrilingualLesson__offline_mode') : t('TrilingualLesson__online_mode')}
      </div>
    </div>
  );
}

// ============================================================
// MAIN TRILINGUAL LESSON COMPONENT
// ============================================================

interface TrilingualLessonProps {
  lessonId: string;
  lessonData: {
    title: string;
    vocabulary: Array<{ id: string; hy: string; en: string; ru?: string }>;
    phrases: Array<{ id: string; hy: string; en: string; ru?: string }>;
  };
}

export function TrilingualLesson({ lessonId, lessonData }: TrilingualLessonProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'phrases'>('vocabulary');

  // Convert to AudioItem format
  const vocabItems: AudioItem[] = lessonData.vocabulary.map(v => ({
    id: v.id,
    text: v.hy,
    translations: { hy: v.hy, en: v.en, ru: v.ru || v.en }
  }));

  const phraseItems: AudioItem[] = lessonData.phrases.map(p => ({
    id: p.id,
    text: p.hy,
    translations: { hy: p.hy, en: p.en, ru: p.ru || p.en }
  }));

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lessonData.title}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
          <span>{t('TrilingualLesson__vocabitems_length_words', { length: vocabItems.length })}</span>
          <span>•</span>
          <span>{t('TrilingualLesson__phraseitems_length_phrases', { length: phraseItems.length })}</span>
          <span>•</span>
          <span>{t('TrilingualLesson__hy_en_ru')}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-white/20 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('vocabulary')}
          className={`px-4 py-2 -mb-px text-sm font-medium transition-all ${
            activeTab === 'vocabulary'
              ? 'border-b-2 border-red-500 text-red-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {t('TrilingualLesson__vocabulary')} ({vocabItems.length})
        </button>
        <button
          onClick={() => setActiveTab('phrases')}
          className={`px-4 py-2 -mb-px text-sm font-medium transition-all ${
            activeTab === 'phrases'
              ? 'border-b-2 border-red-500 text-red-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {t('TrilingualLesson__phrases')} ({phraseItems.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {activeTab === 'vocabulary' ? (
          <TrilingualAudioList 
            items={vocabItems} 
            title={t('TrilingualLesson__vocabulary')}
            t={t}
          />
        ) : (
          <TrilingualAudioList 
            items={phraseItems}
            title={t('TrilingualLesson__phrases')}
            t={t}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// EXPORT
// ============================================================

export default TrilingualLesson;