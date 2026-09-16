/**
 * NUR Lingo — Service Worker
 * Full offline support with audio caching, lesson caching, and push notifications
 * ✅ FIXED: 206 Partial Response handling
 * ✅ FIXED: All 3 audio sources (offline, offline_dictionary, offline_user_dictionary)
 */

const CACHE_NAME = 'nurlingo-v4';
const ASSETS_CACHE = 'nurlingo-assets-v4';
const AUDIO_CACHE = 'nurlingo-audio-v4';
const LESSONS_CACHE = 'nurlingo-lessons-v4';
const DICTIONARY_CACHE = 'nurlingo-dictionary-v4';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/logo.svg',
  '/manifest.json',
  '/offline.html',
];

// ✅ All audio paths to cache
const AUDIO_PATHS = [
  '/audio/offline/',
  '/audio/offline_dictionary/',
  '/audio/offline_user_dictionary/',
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(ASSETS_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('[SW] Some assets failed to cache:', err);
        });
      }),
      caches.open(DICTIONARY_CACHE).then((cache) => {
        console.log('[SW] Caching dictionary');
        return cache.add('/data/dictionaries/unified-dictionary.json').catch(() => {});
      }),
      caches.open(LESSONS_CACHE).then((cache) => {
        console.log('[SW] Caching lessons');
        return cache.add('/api/lessons').catch(() => {});
      }),
    ])
  );
  
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((keys) => {
        const toDelete = keys.filter((key) => {
          return key.startsWith('nurlingo-') && 
                 key !== CACHE_NAME && 
                 key !== ASSETS_CACHE && 
                 key !== AUDIO_CACHE && 
                 key !== LESSONS_CACHE && 
                 key !== DICTIONARY_CACHE;
        });
        return Promise.all(
          toDelete.map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
        );
      }),
    ])
  );
});

// ─── FETCH EVENT ─────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests and chrome-extension
  if (event.request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // --- AUDIO FILES: Cache First, Network Fallback (FIXED) ---
  // ✅ Check ALL audio paths
  const isAudioRequest = AUDIO_PATHS.some(path => url.pathname.includes(path)) && 
                         url.pathname.endsWith('.mp3');
  
  if (isAudioRequest) {
    event.respondWith(handleAudioRequest(event));
    return;
  }

  // --- API REQUESTS: Network First, Fallback to Cache ---
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event));
    return;
  }

  // --- DICTIONARY & DATA FILES ---
  if (url.pathname.includes('/data/') || url.pathname.includes('/dictionary')) {
    event.respondWith(handleDataRequest(event));
    return;
  }

  // --- STATIC ASSETS ---
  event.respondWith(handleStaticRequest(event));
});

// ─── HANDLE AUDIO REQUEST ───────────────────────────────────────────

async function handleAudioRequest(event) {
  const request = event.request;
  const url = new URL(request.url);
  
  try {
    // ✅ Skip cache for range requests (avoid 206)
    if (request.headers.has('range')) {
      console.log('[SW] Range request - bypassing cache:', url.pathname.split('/').pop());
      return fetch(request);
    }

    // ✅ Try cache first
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] Audio served from cache:', url.pathname.split('/').pop());
      return cached;
    }

    // ✅ Network fallback
    const response = await fetch(request);
    
    if (response && response.status === 200) {
      // ✅ Only cache complete responses
      const clonedResponse = response.clone();
      const cache = await caches.open(AUDIO_CACHE);
      await cache.put(request, clonedResponse);
      console.log('[SW] Audio cached:', url.pathname.split('/').pop());
      return response;
    }
    
    // ✅ Return partial response if available (206)
    if (response && response.status === 206) {
      console.log('[SW] Partial response (206) - serving directly:', url.pathname.split('/').pop());
      return response;
    }
    
    return response || new Response(null, { status: 404 });
  } catch (error) {
    console.warn('[SW] Audio fetch error:', error);
    
    // Try cache one more time
    const cached = await caches.match(request);
    if (cached) return cached;
    
    // Return empty response
    return new Response(null, { 
      status: 204,
      statusText: 'No Content' 
    });
  }
}

// ─── HANDLE API REQUEST ─────────────────────────────────────────────

async function handleApiRequest(event) {
  const request = event.request;
  const url = new URL(request.url);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      const cacheName = url.pathname.includes('/lessons') || url.pathname.includes('/dictionary') 
        ? LESSONS_CACHE 
        : CACHE_NAME;
      const cache = await caches.open(cacheName);
      await cache.put(request, clone);
      return response;
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] API served from cache:', url.pathname);
      return cached;
    }
    return new Response(
      JSON.stringify({ error: 'Offline - Please check your connection' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ─── HANDLE DATA REQUEST ────────────────────────────────────────────

async function handleDataRequest(event) {
  const request = event.request;
  const url = new URL(request.url);
  
  try {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      const cache = await caches.open(DICTIONARY_CACHE);
      await cache.put(request, clone);
      return response;
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ error: 'Data not available offline' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ─── HANDLE STATIC REQUEST ──────────────────────────────────────────

async function handleStaticRequest(event) {
  const request = event.request;
  
  try {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      const clone = response.clone();
      const cache = await caches.open(ASSETS_CACHE);
      await cache.put(request, clone);
      return response;
    }
    return response;
  } catch {
    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      const offlinePage = await caches.match('/offline.html');
      return offlinePage || new Response('Offline - Please connect to the internet', { 
        status: 503,
        headers: { 'Content-Type': 'text/html' }
      });
    }
    return new Response('Offline', { status: 503 });
  }
}

// ─── PUSH NOTIFICATIONS ─────────────────────────────────────────────

self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {
    title: 'NUR Lingo 🍎',
    body: 'Time for your Armenian lesson!',
    icon: '/images/nuri/nuri-happy.png',
    badge: '/favicon.ico',
    tag: 'nurlingo-notification',
    data: { url: '/' }
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/images/nuri/nuri-happy.png',
    badge: data.badge || '/favicon.ico',
    tag: data.tag || 'nurlingo-notification',
    vibrate: [200, 100, 200],
    data: {
      url: data.data?.url || '/',
      lessonId: data.lessonId || null,
    },
    actions: [
      { action: 'open', title: '📚 Open App' },
      { action: 'dismiss', title: '❌ Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  const url = event.notification.data?.url || '/';
  const lessonId = event.notification.data?.lessonId;
  const targetUrl = lessonId ? `/learn?lesson=${lessonId}` : url;

  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// ─── BACKGROUND SYNC ─────────────────────────────────────────────────

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-lessons') {
    event.waitUntil(syncLessons());
  }
});

async function syncLessons() {
  try {
    const response = await fetch('/api/lessons');
    if (response.ok) {
      const cache = await caches.open(LESSONS_CACHE);
      await cache.put('/api/lessons', response.clone());
      console.log('[SW] Lessons synced successfully');
    }
  } catch (error) {
    console.warn('[SW] Failed to sync lessons:', error);
  }
}

// ─── MESSAGE HANDLER ─────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'CACHE_AUDIO':
      handleCacheAudio(payload);
      break;
    case 'CLEAR_CACHE':
      handleClearCache(payload);
      break;
    case 'GET_CACHE_STATUS':
      handleCacheStatus(event);
      break;
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

async function handleCacheAudio(payload) {
  const { audioIds, source = 'offline' } = payload || {};
  if (!audioIds || !Array.isArray(audioIds)) return;
  
  console.log('[SW] Caching audio files:', audioIds.length, 'source:', source);
  const cache = await caches.open(AUDIO_CACHE);
  
  const basePath = source === 'dictionary' 
    ? '/audio/offline_dictionary/' 
    : source === 'user' 
    ? '/audio/offline_user_dictionary/' 
    : '/audio/offline/';
  
  for (const id of audioIds) {
    try {
      // Try different extensions
      const url = `${basePath}${id}.mp3`;
      const response = await fetch(url);
      if (response.ok && response.status === 200) {
        await cache.put(url, response);
        console.log('[SW] Cached audio:', id);
      }
    } catch (e) {
      console.warn('[SW] Failed to cache audio:', id);
    }
  }
}

async function handleClearCache(payload) {
  const { cacheName } = payload || {};
  if (cacheName) {
    await caches.delete(cacheName);
    console.log('[SW] Cache cleared:', cacheName);
  } else {
    const keys = await caches.keys();
    for (const key of keys) {
      if (key.startsWith('nurlingo-')) {
        await caches.delete(key);
      }
    }
    console.log('[SW] All caches cleared');
  }
}

async function handleCacheStatus(event) {
  const status = { caches: {}, totalSize: 0 };
  const keys = await caches.keys();
  
  for (const key of keys) {
    const cache = await caches.open(key);
    const requests = await cache.keys();
    status.caches[key] = requests.length;
  }
  
  event.ports[0]?.postMessage(status);
}

// ─── ONLINE/OFFLINE STATUS ──────────────────────────────────────────

self.addEventListener('online', () => {
  console.log('[SW] Online - syncing...');
  self.registration.sync.register('sync-lessons');
});

self.addEventListener('offline', () => {
  console.log('[SW] Offline - working from cache');
});