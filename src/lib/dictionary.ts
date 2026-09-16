// src/lib/dictionary/index.ts
// ✅ ԲԱՌԱՐԱՆՆԵՐԻ ԿԱՌԱՎԱՐՄԱՆ ՄՈԴՈՒԼ — Unified Dictionary Engine
//
// Architecture (per Section 2):
//  • Verified Dictionary — read-only, loaded from data/dictionaries/unified-dictionary.json.
//    Every entry's `id` (e.g. "000001") is its permanent canonical ID.
//  • User Dictionary — editable, stored in localStorage. Entries may carry a
//    `canonicalId` linking them to a verified entry once one is found to match.
//  • Duplicate detection + self-healing sync — every time the user dictionary
//    loads, unlinked entries are re-checked against the verified dictionary;
//    a match attaches canonicalId while preserving the user's notes,
//    recording, favorite flag, mastery/progress and history untouched.

import verifiedRaw from "../../data/dictionaries/unified-dictionary.json";

// ─── TYPES ────────────────────────────────────────────────────────────

export interface AudioPaths {
  hy?: string;
  en?: string;
  ru?: string;
}

/** A verified entry as it exists in the read-only canonical dictionary. */
export interface VerifiedEntry {
  id: string; // canonical ID, permanent, e.g. "000001"
  hy: string;
  en: string;
  ru: string;
  type: string;
  audio?: AudioPaths;
}

export interface HistoryEvent {
  date: string;
  event: "added" | "linked" | "recorded" | "edited" | "reviewed" | string;
  detail?: string;
}

export interface DictionaryEntry {
  id: string;
  hy: string;
  en: string;
  ru: string;
  type: "vocab" | "phrase" | "dialogue" | "user";
  isUserAdded?: boolean;
  /** Canonical ID this entry has been linked/merged with, once matched. */
  canonicalId?: string | null;
  /** @deprecated legacy field kept for backward compatibility with older saved data */
  original_id?: string | null;
  userRecording?: string;
  addedAt?: string;
  lastReviewed?: string;
  mastery?: number;
  favorite?: boolean;
  notes?: string;
  history?: HistoryEvent[];
  tags?: string[];
}

export interface DictionaryStats {
  total: number;
  base: number;
  user: number;
  linked: number;
  byType: Record<string, number>;
  byLanguage: {
    hy: number;
    en: number;
    ru: number;
  };
}

export type DictionaryFilter = {
  query?: string;
  type?: string;
  language?: "hy" | "en" | "ru";
  tags?: string[];
  isUserAdded?: boolean;
};

// ─── VERIFIED (BASE) DICTIONARY ─────────────────────────────────────
// Read-only. Source of truth is unified-dictionary.json (1152 entries),
// the same file the Dictionary page renders — previously this module had
// its own disconnected 15-word stub, so isInBaseDictionary()/duplicate
// checks were comparing against the wrong, tiny dataset.

export const baseDictionary: DictionaryEntry[] = (verifiedRaw as VerifiedEntry[]).map(
  (e) => ({
    id: e.id,
    hy: e.hy,
    en: e.en,
    ru: e.ru,
    type: (e.type as DictionaryEntry["type"]) || "vocab",
  })
);

const verifiedById = new Map<string, VerifiedEntry>(
  (verifiedRaw as VerifiedEntry[]).map((e) => [e.id, e])
);

// ─── NORMALIZATION / MATCHING ────────────────────────────────────────

const normalize = (s: string | undefined | null): string =>
  (s || "").trim().toLowerCase();

/**
 * Finds a verified entry matching a candidate word by exact (normalized)
 * text in any of the three languages. This is the single duplicate-detection
 * routine used both when adding a word and during self-healing sync.
 */
const findVerifiedMatch = (
  hy?: string,
  en?: string,
  ru?: string
): VerifiedEntry | null => {
  const nHy = normalize(hy);
  const nEn = normalize(en);
  const nRu = normalize(ru);
  if (!nHy && !nEn && !nRu) return null;

  for (const entry of verifiedRaw as VerifiedEntry[]) {
    if (
      (nHy && normalize(entry.hy) === nHy) ||
      (nEn && normalize(entry.en) === nEn) ||
      (nRu && normalize(entry.ru) === nRu)
    ) {
      return entry;
    }
  }
  return null;
};

// ─── STATE ────────────────────────────────────────────────────────────

const STORAGE_KEY = "nurlingo_user_dictionary";
// Must match the key useAudioRecorder.ts actually writes to (via UserRecordingButton,
// the only UI path that records audio). These used to be two different keys
// ("nurlingo_user_recordings" here vs "userAudioRecordings" there), so a saved
// recording was never found by AudioManager's playback lookup.
const RECORDINGS_KEY = "userAudioRecordings";

let userDictionary: DictionaryEntry[] = [];
let isLoaded = false;

// ─── INITIALIZATION ──────────────────────────────────────────────────

export const loadUserDictionary = (): DictionaryEntry[] => {
  if (isLoaded) return userDictionary;

  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      userDictionary = JSON.parse(local);
      userDictionary = userDictionary.map((entry) => ({
        ...entry,
        isUserAdded: true,
        type: entry.type || "user",
        // Migrate the legacy `original_id` field to `canonicalId` if present.
        canonicalId: entry.canonicalId ?? entry.original_id ?? null,
      }));
    }
  } catch {
    console.warn("⚠️ Failed to load user dictionary");
  }

  isLoaded = true;
  syncUserDictionary();
  return userDictionary;
};

export const saveUserDictionary = (dict: DictionaryEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dict));
    userDictionary = dict;
  } catch {
    console.warn("⚠️ Failed to save user dictionary");
  }
};

/**
 * Self-healing sync: re-checks every unlinked user entry against the verified
 * dictionary. If a match is found, the entry is linked (canonicalId set)
 * while everything the user attached to it -- notes, recording, favorite,
 * mastery/progress, history -- is left exactly as-is. Safe to call any
 * number of times; already-linked entries are skipped.
 *
 * Example: a user adds "apple" before it exists in the verified dictionary.
 * Later a verified "apple" entry ships. On next load, this links the user's
 * entry to that canonical ID without touching their notes/recording/progress.
 */
export const syncUserDictionary = (): { merged: number; total: number } => {
  let merged = 0;

  userDictionary = userDictionary.map((entry) => {
    if (entry.canonicalId) return entry; // already linked, nothing to do

    const match = findVerifiedMatch(entry.hy, entry.en, entry.ru);
    if (!match) return entry;

    merged++;
    const history = entry.history ? [...entry.history] : [];
    history.push({
      date: new Date().toISOString(),
      event: "linked",
      detail: `Linked to verified entry ${match.id}`,
    });

    return { ...entry, canonicalId: match.id, history };
  });

  if (merged > 0) saveUserDictionary(userDictionary);
  return { merged, total: userDictionary.length };
};

loadUserDictionary();

// ─── USER RECORDINGS ──────────────────────────────────────────────────

export const getUserRecordings = (): Record<string, string> => {
  try {
    const data = localStorage.getItem(RECORDINGS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const saveUserRecording = (wordId: string, base64Audio: string): void => {
  try {
    const recordings = getUserRecordings();
    recordings[wordId] = base64Audio;
    localStorage.setItem(RECORDINGS_KEY, JSON.stringify(recordings));
  } catch {
    console.warn("⚠️ Failed to save recording");
  }
};

export const getUserRecording = (wordId: string): string | null => {
  const recordings = getUserRecordings();
  return recordings[wordId] || null;
};

export const deleteUserRecording = (wordId: string): boolean => {
  try {
    const recordings = getUserRecordings();
    if (recordings[wordId]) {
      delete recordings[wordId];
      localStorage.setItem(RECORDINGS_KEY, JSON.stringify(recordings));
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// ─── ✅ ADDED: GET USER DICTIONARY ──────────────────────────────────

export const getUserDictionary = (): DictionaryEntry[] => {
  loadUserDictionary();
  return [...userDictionary];
};

// ─── ✅ ADDED: GET USER ADDED WORDS ─────────────────────────────────

export const getUserAddedWords = (): DictionaryEntry[] => {
  loadUserDictionary();
  return userDictionary.filter((item) => item.isUserAdded);
};

// ─── ✅ ADDED: IS IN USER DICTIONARY ────────────────────────────────

export const isInUserDictionary = (word: string): boolean => {
  const search = word.trim().toLowerCase();
  return userDictionary.some(
    (item) =>
      item.hy.toLowerCase() === search ||
      item.en.toLowerCase() === search ||
      item.ru.toLowerCase() === search
  );
};

// ─── ✅ ADDED: WORD EXISTS ───────────────────────────────────────────

export const wordExists = (word: string): boolean => {
  return isInBaseDictionary(word) || isInUserDictionary(word);
};

// ─── ✅ ADDED: GET DICTIONARY STATS ─────────────────────────────────

export const getDictionaryStats = (): DictionaryStats => {
  const full = getFullDictionary();
  const byType: Record<string, number> = {};
  for (const entry of full) {
    const type = entry.type || "unknown";
    byType[type] = (byType[type] || 0) + 1;
  }

  const byLanguage = {
    hy: full.filter((e) => e.hy?.length > 0).length,
    en: full.filter((e) => e.en?.length > 0).length,
    ru: full.filter((e) => e.ru?.length > 0).length,
  };

  return {
    total: full.length,
    base: baseDictionary.length,
    user: userDictionary.length,
    linked: userDictionary.filter((e) => !!e.canonicalId).length,
    byType,
    byLanguage,
  };
};

// ─── CRUD OPERATIONS ─────────────────────────────────────────────────

export const addToUserDictionary = (
  hy: string,
  en: string,
  ru: string,
  type: string = "user",
  tags?: string[]
): DictionaryEntry | null => {
  const verifiedMatch = findVerifiedMatch(hy, en, ru);

  if (verifiedMatch) {
    // Word already exists in the verified dictionary. Rather than rejecting
    // outright (which silently threw away the user's intent to track this
    // word), create a linked entry so favorite/notes/mastery/recording can
    // still attach to it, referencing the canonical entry instead of
    // duplicating its verified text.
    const alreadyLinked = userDictionary.find((e) => e.canonicalId === verifiedMatch.id);
    if (alreadyLinked) {
      console.warn(`⚠️ "${hy}" already linked to verified entry ${verifiedMatch.id}`);
      return alreadyLinked;
    }

    const linkedEntry: DictionaryEntry = {
      id: `link_${verifiedMatch.id}`,
      hy: verifiedMatch.hy,
      en: verifiedMatch.en,
      ru: verifiedMatch.ru,
      type: (verifiedMatch.type as DictionaryEntry["type"]) || "vocab",
      isUserAdded: true,
      canonicalId: verifiedMatch.id,
      addedAt: new Date().toISOString(),
      mastery: 0,
      tags: tags || [],
      history: [{ date: new Date().toISOString(), event: "linked", detail: `Linked to verified entry ${verifiedMatch.id}` }],
    };
    userDictionary.push(linkedEntry);
    saveUserDictionary(userDictionary);
    return linkedEntry;
  }

  if (isInUserDictionary(hy)) {
    console.warn(`⚠️ "${hy}" already exists in user dictionary`);
    return null;
  }

  const maxId = userDictionary.reduce((max, item) => {
    const num = parseInt(item.id);
    return Number.isFinite(num) && num > max ? num : max;
  }, 900000);
  const newId = String(maxId + 1).padStart(6, "0");

  const newEntry: DictionaryEntry = {
    id: newId,
    hy: hy.trim(),
    en: en.trim(),
    ru: ru.trim(),
    type: type as any,
    isUserAdded: true,
    canonicalId: null,
    addedAt: new Date().toISOString(),
    mastery: 0,
    tags: tags || [],
    history: [{ date: new Date().toISOString(), event: "added" }],
  };

  userDictionary.push(newEntry);
  saveUserDictionary(userDictionary);
  console.log(`✅ "${hy}" added (ID: ${newId})`);
  return newEntry;
};

export const updateUserDictionaryEntry = (
  id: string,
  updates: Partial<DictionaryEntry>
): DictionaryEntry | null => {
  const index = userDictionary.findIndex((item) => item.id === id);
  if (index === -1) return null;

  if (updates.isUserAdded === false) return null;

  userDictionary[index] = { ...userDictionary[index], ...updates };
  saveUserDictionary(userDictionary);
  return userDictionary[index];
};

export const removeFromUserDictionary = (id: string): boolean => {
  const index = userDictionary.findIndex((item) => item.id === id);
  if (index === -1) return false;

  deleteUserRecording(id);
  userDictionary.splice(index, 1);
  saveUserDictionary(userDictionary);
  return true;
};

// ─── QUERY OPERATIONS ─────────────────────────────────────────────────

export const isInBaseDictionary = (word: string): boolean => {
  const search = word.trim().toLowerCase();
  return baseDictionary.some(
    (item) =>
      item.hy.toLowerCase() === search ||
      item.en.toLowerCase() === search ||
      item.ru.toLowerCase() === search
  );
};

export const getFullDictionary = (): DictionaryEntry[] => {
  return [...baseDictionary, ...userDictionary];
};

export const searchDictionary = (filter: DictionaryFilter): DictionaryEntry[] => {
  let results = getFullDictionary();

  if (filter.query) {
    const q = filter.query.trim().toLowerCase();
    results = results.filter(
      (item) =>
        item.hy.toLowerCase().includes(q) ||
        item.en.toLowerCase().includes(q) ||
        item.ru.toLowerCase().includes(q)
    );
  }

  if (filter.type) {
    results = results.filter((item) => item.type === filter.type);
  }

  if (filter.language) {
    results = results.filter((item) => item[filter.language!]?.length > 0);
  }

  if (filter.tags && filter.tags.length > 0) {
    results = results.filter(
      (item) => item.tags?.some((tag) => filter.tags!.includes(tag))
    );
  }

  if (filter.isUserAdded !== undefined) {
    results = results.filter((item) => !!item.isUserAdded === filter.isUserAdded);
  }

  return results;
};

export const getEntryById = (id: string): DictionaryEntry | null => {
  const base = baseDictionary.find((item) => item.id === id);
  if (base) return base;
  const user = userDictionary.find((item) => item.id === id);
  return user || null;
};

export const getEntriesByType = (type: string): DictionaryEntry[] => {
  return getFullDictionary().filter((item) => item.type === type);
};

export const searchByText = (query: string): DictionaryEntry[] => {
  return searchDictionary({ query });
};

// ─── RECENT ENTRIES ──────────────────────────────────────────────────

export const getRecentUserEntries = (limit: number = 10): DictionaryEntry[] => {
  return userDictionary
    .filter((item) => item.isUserAdded)
    .sort((a, b) => (a.addedAt && b.addedAt ? b.addedAt.localeCompare(a.addedAt) : 0))
    .slice(0, limit);
};

// ─── EXPORT ──────────────────────────────────────────────────────────

export const getVerifiedEntry = (canonicalId: string): VerifiedEntry | null => {
  return verifiedById.get(canonicalId) || null;
};

export default {
  baseDictionary,
  userDictionary,
  loadUserDictionary,
  saveUserDictionary,
  syncUserDictionary,
  getVerifiedEntry,
  getUserDictionary, // ✅ ADDED
  getUserAddedWords,
  isInUserDictionary,
  wordExists, // ✅ ADDED
  getDictionaryStats,
  addToUserDictionary,
  updateUserDictionaryEntry,
  removeFromUserDictionary,
  isInBaseDictionary,
  getFullDictionary,
  searchDictionary,
  searchByText,
  getEntryById,
  getEntriesByType,
  getRecentUserEntries,
  getUserRecording,
  saveUserRecording,
  deleteUserRecording,
  getUserRecordings,
};