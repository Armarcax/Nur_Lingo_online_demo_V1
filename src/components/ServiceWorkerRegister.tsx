// src/components/ServiceWorkerRegister.tsx
"use client";

import { useEffect, useState } from "react";
import { registerServiceWorker } from "@/lib/notifications";
import { useI18n } from "@/hooks/useI18n";

export default function ServiceWorkerRegister() {
  const { t } = useI18n();
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const registerServiceWorkerWithOffline = async (): Promise<ServiceWorkerRegistration | null> => {
      if (typeof window === 'undefined') return null;
      
      if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service Worker not supported in this browser');
        return null;
      }

      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        console.log('✅ Service Worker registered:', registration);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 New Service Worker available - refreshing...');
                // ✅ t()-ն այստեղ հասանելի է
                const shouldRefresh = confirm(t('service_worker_new_version'));
                if (shouldRefresh) {
                  window.location.reload();
                }
              }
            });
          }
        });

        if (navigator.serviceWorker.controller) {
          console.log('✅ Service Worker is active');
        }

        return registration;
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        return null;
      }
    };

    registerServiceWorkerWithOffline().then((reg) => {
      if (reg) {
        setRegistration(reg);
        setIsReady(true);
      }
    });

    const handleOnline = () => {
      console.log('📡 Online - checking for updates...');
      if (registration) {
        registration.update().catch(() => {});
      }
    };

    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [t, registration]);

  // ─── CACHE AUDIO ───────────────────────────────────────────────────

  const cacheAudioFiles = async (audioIds: string[]) => {
    if (!registration || !navigator.serviceWorker.controller) {
      console.warn('⚠️ SW not ready for audio caching');
      return;
    }

    try {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_AUDIO',
        payload: { audioIds },
      });
      console.log(`📦 Sent ${audioIds.length} audio files for caching`);
    } catch (error) {
      console.error('❌ Failed to send cache request:', error);
    }
  };

  const clearCache = async (cacheName?: string) => {
    if (!registration || !navigator.serviceWorker.controller) {
      console.warn('⚠️ SW not ready for cache clearing');
      return;
    }

    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_CACHE',
      payload: { cacheName },
    });
    console.log('🧹 Cache clear requested');
  };

  const getCacheStatus = async (): Promise<any> => {
    if (!registration || !navigator.serviceWorker.controller) {
      return null;
    }

    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_CACHE_STATUS' },
          [channel.port2]
        );
      } else {
        resolve(null);
      }
    });
  };

  // ─── EXPOSE TO WINDOW ─────────────────────────────────────────────

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__nurlingo_sw = {
        register: async () => {
          // Re-run registration
          const reg = await navigator.serviceWorker?.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
          });
          return reg;
        },
        cacheAudio: cacheAudioFiles,
        clearCache,
        getCacheStatus,
        registration,
      };
    }
  }, [registration]);

  return null;
}

// ─── HOOK ────────────────────────────────────────────────────────────

export function useServiceWorker() {
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    const checkSW = async () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        setSwReady(true);
      } else {
        try {
          await navigator.serviceWorker?.ready;
          setSwReady(true);
        } catch {
          setSwReady(false);
        }
      }
    };
    checkSW();
  }, []);

  const cacheAudio = async (audioIds: string[]) => {
    if (!navigator.serviceWorker.controller) return;
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_AUDIO',
      payload: { audioIds },
    });
  };

  const clearCache = async (cacheName?: string) => {
    if (!navigator.serviceWorker.controller) return;
    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_CACHE',
      payload: { cacheName },
    });
  };

  const getCacheStatus = async (): Promise<any> => {
    if (!navigator.serviceWorker.controller) return null;
    
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_CACHE_STATUS' },
          [channel.port2]
        );
      } else {
        resolve(null);
      }
    });
  };

  return { swReady, cacheAudio, clearCache, getCacheStatus };
}