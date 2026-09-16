// src/components/I18nProvider.tsx
"use client";

import { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import translations from "@/lib/i18n/translations.json";

type LangCode = 'hy' | 'en' | 'ru';

interface I18nContextType {
  t: (key: string, params?: Record<string, any>) => string;
  locale: LangCode;
  setLanguage: (lang: LangCode) => void;
  isLoading: boolean;
}

export const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children, initialLocale = 'hy' }: { children: ReactNode; initialLocale?: LangCode }) {
  const [locale, setLocale] = useState<LangCode>(initialLocale);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nurlingo_language');
      if (saved && ['hy', 'en', 'ru'].includes(saved)) {
        setLocale(saved as LangCode);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const t = useCallback((key: string, params?: Record<string, any>): string => {
  const dict = (translations as Record<string, Record<string, string>>)[locale] || 
               (translations as Record<string, Record<string, string>>).hy || {};
  let text = dict[key] || key;
  
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(new RegExp(`{${param}}`, 'g'), String(value));
    });
  }
  
  return text;
}, [locale]);  
  
  const setLanguage = useCallback((lang: LangCode) => {
    setLocale(lang);
    try {
      localStorage.setItem('nurlingo_language', lang);
    } catch {
      // Ignore
    }
  }, []);
  
  const value = useMemo(() => ({
    t,
    locale,
    setLanguage,
    isLoading
  }), [t, locale, setLanguage, isLoading]);
  
  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}