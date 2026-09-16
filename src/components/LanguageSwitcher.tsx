// src/components/LanguageSwitcher.tsx
"use client";

import { useI18n } from '@/hooks/useI18n';

export function LanguageSwitcher() {
  const { locale, setLanguage } = useI18n();

  return (
    <div className="flex gap-2 items-center p-2 bg-white/10 dark:bg-black/20 rounded-lg backdrop-blur-sm">
      <button
        onClick={() => setLanguage('hy')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          locale === 'hy' 
            ? 'bg-[#c41e3a] text-white shadow-lg shadow-[#c41e3a]/30' 
            : 'bg-white/20 hover:bg-white/30 text-gray-700 dark:text-gray-300'
        }`}
      >
        🇦🇲 Հայ
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          locale === 'en' 
            ? 'bg-[#c41e3a] text-white shadow-lg shadow-[#c41e3a]/30' 
            : 'bg-white/20 hover:bg-white/30 text-gray-700 dark:text-gray-300'
        }`}
      >
        🇬🇧 EN
      </button>
      <button
        onClick={() => setLanguage('ru')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          locale === 'ru' 
            ? 'bg-[#c41e3a] text-white shadow-lg shadow-[#c41e3a]/30' 
            : 'bg-white/20 hover:bg-white/30 text-gray-700 dark:text-gray-300'
        }`}
      >
        🇷🇺 RU
      </button>
    </div>
  );
}