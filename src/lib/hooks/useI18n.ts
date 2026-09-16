import enTranslations from '@/public/locales/en/translations.json';
// եթե ունեք այլ լեզուներ, ավելացրեք նաև դրանք

type TranslationKeys = keyof typeof enTranslations;

export function tServer(key: string): string {
  // կարող եք ավելացնել լեզվի ընտրություն՝ ըստ request-ի կամ cookie-ի
  const translations = enTranslations;
  return (translations as any)[key] || key;
}