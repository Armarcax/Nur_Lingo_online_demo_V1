// hooks/useI18n.ts
import { useContext } from 'react';
import { I18nContext } from '@/components/I18nProvider';

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}