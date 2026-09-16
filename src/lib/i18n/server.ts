// src/lib/i18n/server.ts
import translations from './translations.json';

type Translations = typeof translations;
type Locale = keyof Translations; // 'hy' | 'en' | 'ru'

const DEFAULT_LOCALE: Locale = 'hy';

export function tServer(key: string, locale: Locale = DEFAULT_LOCALE): string {
  const langData = translations[locale];
  if (!langData) return key;
  return (langData as any)[key] ?? key;
}

export function getLocaleFromRequest(req: Request): Locale {
  const acceptLang = req.headers.get('accept-language') || '';
  const lang = acceptLang.split(',')[0]?.slice(0, 2) || 'hy';
  return lang === 'hy' || lang === 'en' || lang === 'ru' ? lang : DEFAULT_LOCALE;
}