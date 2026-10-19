// src/lib/audio/wavCache.ts
// Persistent audio cache using IndexedDB.
// Stores binary Blobs (not base64) for fast mobile playback.

const DB_NAME = "nur-wav-cache-v2";
const STORE_NAME = "audio";
const DB_VERSION = 1;
const MAX_ENTRIES = 1000; // ~50-100 MB max
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface CacheRecord {
  key: string;
  blob: Blob;
  timestamp: number;
  voice: string;
  text: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB not available"));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
        store.createIndex("timestamp", "timestamp");
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("IndexedDB blocked"));
  });

  return dbPromise;
}

export async function getCachedAudio(key: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        const rec = req.result as CacheRecord | undefined;
        if (!rec) {
          resolve(null);
          return;
        }
        if (Date.now() - rec.timestamp > TTL_MS) {
          try {
            const delTx = db.transaction(STORE_NAME, "readwrite");
            delTx.objectStore(STORE_NAME).delete(key);
          } catch {}
          resolve(null);
          return;
        }
        resolve(rec.blob);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCachedAudio(
  key: string,
  blob: Blob,
  meta: { voice: string; text: string }
): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      const record: CacheRecord = {
        key,
        blob,
        timestamp: Date.now(),
        voice: meta.voice,
        text: meta.text.slice(0, 80),
      };

      const req = store.put(record);
      req.onsuccess = () => {
        maybeCleanup(db).catch(() => {});
        resolve();
      };
      req.onerror = () => resolve();
    });
  } catch {}
}

async function maybeCleanup(db: IDBDatabase): Promise<void> {
  const count = await new Promise<number>((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(0);
  });

  if (count <= MAX_ENTRIES) return;

  const toDelete = count - MAX_ENTRIES;
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const index = store.index("timestamp");
  const req = index.openCursor();

  let deleted = 0;
  req.onsuccess = () => {
    const cursor = req.result;
    if (!cursor || deleted >= toDelete) return;
    cursor.delete();
    deleted++;
    cursor.continue();
  };
}

export async function clearAudioCache(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const req = tx.objectStore(STORE_NAME).clear();
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {}
}

export async function getCacheStats(): Promise<{
  count: number;
  sizeMB: number;
}> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();
      let count = 0;
      let bytes = 0;
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          count++;
          bytes += cursor.value.blob?.size || 0;
          cursor.continue();
        } else {
          resolve({ count, sizeMB: bytes / 1024 / 1024 });
        }
      };
      req.onerror = () => resolve({ count: 0, sizeMB: 0 });
    });
  } catch {
    return { count: 0, sizeMB: 0 };
  }
}