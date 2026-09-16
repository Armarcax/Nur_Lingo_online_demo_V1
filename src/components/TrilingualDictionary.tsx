// src/components/TrilingualDictionary.tsx

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TrilingualAudioPlayer } from './TrilingualAudioPlayer';
import { trilingualAudioEngine } from '@/lib/offline/trilingual-audio-engine';
import { offlineLessonEngine } from '@/lib/offline/OfflineLessonEngine';
import { Loader2 } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

interface DictionaryEntry {
  id: string;
  hy: string;
  en: string;
  ru?: string;
  category?: string;
  source?: 'lesson' | 'dictionary' | 'user';
}

interface TrilingualDictionaryProps {
  entries: DictionaryEntry[];
  searchable?: boolean;
  filterable?: boolean;
  autoGenerate?: boolean;
  showSource?: boolean;
}

export function TrilingualDictionary({ 
  entries, 
  searchable = true, 
  filterable = true,
  autoGenerate = false,
  showSource = false
}: TrilingualDictionaryProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState<'hy' | 'en' | 'ru'>('hy');
  const [generatedCount, setGeneratedCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [offlineStats, setOfflineStats] = useState<{
    total: number;
    lesson: number;
    dictionary: number;
    user: number;
  } | null>(null);

  // ✅ Initialize offline engine
  useEffect(() => {
    const initOffline = async () => {
      try {
        await trilingualAudioEngine.init();
        await offlineLessonEngine.init();
        
        setIsInitialized(true);
        console.log('✅ TrilingualDictionary initialized');
      } catch (error) {
        console.warn('⚠️ Offline init error:', error);
        setIsInitialized(true);
      }
    };
    initOffline();
  }, []);

  // ✅ Simplified source check - only uses offlineLessonEngine
  const getEntrySource = useCallback((entryId: string): 'lesson' | 'dictionary' | 'user' | null => {
    try {
      const path = offlineLessonEngine.getAudioPath(entryId, 'hy' as any, 'female' as any);
      if (path) return 'lesson';
      return null;
    } catch {
      return null;
    }
  }, []);

  // ✅ Auto-generate audio for entries (optional)
  useEffect(() => {
    if (!autoGenerate || !isInitialized || entries.length === 0) return;

    const generateAll = async () => {
      setIsGenerating(true);
      let count = 0;
      
      for (const entry of entries) {
        try {
          const hasAudio = trilingualAudioEngine.hasAudio(entry.id, 'hy', 'female');
          if (!hasAudio) {
            await trilingualAudioEngine.generateTrilingualAudio(entry.hy, {
              hy: entry.hy,
              en: entry.en,
              ru: entry.ru || entry.en,
            });
            count++;
          }
        } catch (error) {
          console.warn(`Failed to generate "${entry.hy}":`, error);
        }
      }
      
      setGeneratedCount(count);
      setIsGenerating(false);
    };
    
    generateAll();
  }, [entries, autoGenerate, isInitialized]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    let result = entries;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(entry =>
        entry.hy.toLowerCase().includes(query) ||
        entry.en.toLowerCase().includes(query) ||
        (entry.ru && entry.ru.toLowerCase().includes(query))
      );
    }
    
    if (filter !== 'all') {
      result = result.filter(entry => entry.category === filter);
    }
    
    return result;
  }, [entries, searchQuery, filter]);

  // Get categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const entry of entries) {
      if (entry.category) cats.add(entry.category);
    }
    return Array.from(cats);
  }, [entries]);

  // Get source badge color
  const getSourceBadge = (source: string | null | undefined) => {
    switch (source) {
      case 'lesson': return 'bg-blue-500/20 text-blue-400';
      case 'dictionary': return 'bg-purple-500/20 text-purple-400';
      case 'user': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getSourceLabel = (source: string | null | undefined) => {
    switch (source) {
      case 'lesson': return t('trilingual_dict_source_lesson');
      case 'dictionary': return t('trilingual_dict_source_dictionary');
      case 'user': return t('trilingual_dict_source_user');
      default: return t('trilingual_dict_source_unknown');
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 size={32} className="animate-spin text-primary" />
        <span className="ml-3 text-gray-500">{t("TrilingualDictionary_loading_")}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-2xl font-bold">{t("TrilingualDictionary__dictionary")}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {isGenerating && (
              <span className="flex items-center gap-1">
                <Loader2 size={14} className="animate-spin" />
                {t("trilingual_dict_generating")}
              </span>
            )}
            <span>{t("TrilingualDictionary__entries_length_entries", { entries: entries.length })}</span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mt-4">
          {searchable && (
            <input
              type="text"
              placeholder={t("TrilingualDictionary_search_words_")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border-white/20 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          )}
          
          {filterable && categories.length > 0 && (
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border-white/20 dark:border-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">{t("TrilingualDictionary_all_categories")}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
          
          {/* Language switcher for display */}
          <div className="flex gap-1 bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-1 border border-white/20 dark:border-gray-700">
            {(['hy', 'en', 'ru'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  selectedLanguage === lang
                    ? 'bg-primary text-white shadow-sm'
                    : 'hover:bg-white/10 text-gray-700 dark:text-gray-300'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t("trilingual_dict_no_entries")}
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const displayText = selectedLanguage === 'hy' 
              ? entry.hy 
              : selectedLanguage === 'en' 
              ? entry.en 
              : entry.ru || entry.en;
            
            const source = entry.source || getEntrySource(entry.id);
            
            return (
              <div key={entry.id} className="relative">
                {showSource && source && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <span className={`text-[8px] px-2 py-0.5 rounded-full ${getSourceBadge(source)}`}>
                      {getSourceLabel(source)}
                    </span>
                  </div>
                )}
                <TrilingualAudioPlayer
                  entryId={entry.id}
                  text={displayText}
                  translations={{
                    hy: entry.hy,
                    en: entry.en,
                    ru: entry.ru || entry.en,
                  }}
                  type="vocabulary"
                  showLanguages={true}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 flex flex-wrap justify-between text-sm text-gray-500 border-t border-white/20 dark:border-gray-700 pt-4 gap-2">
        <span>{t("TrilingualDictionary__filteredentries_length_entries", { entries: filteredEntries.length })}</span>
        <span>{t("TrilingualDictionary__hy_en_ru")}</span>
      </div>
    </div>
  );
}