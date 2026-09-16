// src/lib/translation/provider.ts

import type { LangCode } from "../i18n/index";

// ─── TYPES ──────────────────────────────────────────────────────────

export interface TranslationProvider {
  name: string;
  translate(text: string, source: LangCode, target: LangCode): Promise<string | null>;
  detectLanguage?(text: string): Promise<LangCode | null>;
  healthCheck?(): Promise<boolean>;
}

export interface TranslationResult {
  text: string;
  source: LangCode;
  target: LangCode;
  provider: string;
  confidence?: number;
}

// ─── INTERNAL DICTIONARY ────────────────────────────────────────────

type DictEntry = { en: string; hy: string; ru: string };

// Try to load dataset, fallback to empty
let DICT: Record<string, DictEntry> = {};
try {
  // @ts-ignore - dynamic import for JSON
  DICT = require("../lexicon/dataset.json") as Record<string, DictEntry>;
} catch {
  console.warn("[Translation] Dataset not found, using empty dictionary");
}

// Build reverse indexes for fast lookup
const REVERSE: Record<LangCode, Map<string, string>> = {
  en: new Map(),
  hy: new Map(),
  ru: new Map(),
};

let reverseBuilt = false;

function buildReverseIndexes() {
  if (reverseBuilt) return;
  for (const [key, entry] of Object.entries(DICT)) {
    if (entry.en) REVERSE.en.set(entry.en.toLowerCase(), key);
    if (entry.hy) REVERSE.hy.set(entry.hy.toLowerCase(), key);
    if (entry.ru) REVERSE.ru.set(entry.ru.toLowerCase(), key);
  }
  reverseBuilt = true;
}

// ─── DICTIONARY PROVIDER ────────────────────────────────────────────

export const dictionaryProvider: TranslationProvider = {
  name: "internal-dictionary",

  async translate(text: string, source: LangCode, target: LangCode): Promise<string | null> {
    if (!text) return null;
    if (source === target) return text;
    if (Object.keys(DICT).length === 0) return null;

    buildReverseIndexes();

    const normalized = text.trim().toLowerCase();
    const key = REVERSE[source]?.get(normalized);

    if (!key) return null;

    const entry = DICT[key];
    return entry?.[target] ?? null;
  },
};

// ─── MOCK PROVIDER ──────────────────────────────────────────────────

export const mockProvider: TranslationProvider = {
  name: "mock",
  async translate(text: string): Promise<string | null> {
    // Return original text wrapped with mock indicator
    return text;
  },
};

// ─── PLACEHOLDER PROVIDERS ─────────────────────────────────────────

export const googleTranslateProvider: TranslationProvider = {
  name: "google-translate",
  async translate(): Promise<string | null> {
    return null;
  },
};

export const aiTranslateProvider: TranslationProvider = {
  name: "ai-gateway",
  async translate(): Promise<string | null> {
    return null;
  },
};

// ─── PROVIDER CHAIN ─────────────────────────────────────────────────

const DEFAULT_CHAIN: TranslationProvider[] = [
  dictionaryProvider,
  mockProvider,
  googleTranslateProvider,
  aiTranslateProvider,
];

let providerChain: TranslationProvider[] = [...DEFAULT_CHAIN];
let activeProviderIndex = 0;

/**
 * Set the translation provider chain
 */
export function setProviderChain(providers: TranslationProvider[]): void {
  providerChain = providers;
  activeProviderIndex = 0;
}

/**
 * Add a provider to the chain
 */
export function addProvider(provider: TranslationProvider, position: "first" | "last" = "last"): void {
  if (position === "first") {
    providerChain = [provider, ...providerChain];
  } else {
    providerChain.push(provider);
  }
}

/**
 * Get the current provider chain
 */
export function getProviderChain(): TranslationProvider[] {
  return [...providerChain];
}

// ─── MAIN TRANSLATE FUNCTION ────────────────────────────────────────

/**
 * Translate text using the provider chain
 */
export async function translate(
  text: string,
  source: LangCode,
  target: LangCode
): Promise<string | null> {
  if (!text) return null;
  if (source === target) return text;

  for (const provider of providerChain) {
    try {
      const result = await provider.translate(text, source, target);
      if (result) {
        return result;
      }
    } catch (error) {
      console.warn(`[Translation] Provider "${provider.name}" failed:`, error);
      continue;
    }
  }

  return null;
}

/**
 * Translate with metadata (which provider was used)
 */
export async function translateWithMeta(
  text: string,
  source: LangCode,
  target: LangCode
): Promise<TranslationResult | null> {
  if (!text) return null;
  if (source === target) {
    return {
      text,
      source,
      target,
      provider: "identity",
    };
  }

  for (const provider of providerChain) {
    try {
      const result = await provider.translate(text, source, target);
      if (result) {
        return {
          text: result,
          source,
          target,
          provider: provider.name,
        };
      }
    } catch (error) {
      console.warn(`[Translation] Provider "${provider.name}" failed:`, error);
      continue;
    }
  }

  return null;
}

/**
 * Batch translate multiple texts
 */
export async function translateBatch(
  texts: string[],
  source: LangCode,
  target: LangCode
): Promise<(string | null)[]> {
  return Promise.all(texts.map((text) => translate(text, source, target)));
}

/**
 * Translate with fallback to original text
 */
export async function translateWithFallback(
  text: string,
  source: LangCode,
  target: LangCode,
  fallback: string = text
): Promise<string> {
  const result = await translate(text, source, target);
  return result || fallback;
}

// ─── PROVIDER MANAGEMENT ────────────────────────────────────────────

/**
 * Set the current translation provider (for backward compatibility)
 */
export function setTranslationProvider(provider: TranslationProvider): void {
  setProviderChain([provider, ...providerChain.filter(p => p !== provider)]);
}

/**
 * Get the first active provider (for backward compatibility)
 */
export function getTranslationProvider(): TranslationProvider {
  return providerChain[0] || mockProvider;
}

/**
 * Reset to default provider chain
 */
export function resetProviders(): void {
  providerChain = [...DEFAULT_CHAIN];
  activeProviderIndex = 0;
}

// ─── LANGUAGE DETECTION ─────────────────────────────────────────────

/**
 * Detect language of text using provider chain
 */
export async function detectLanguage(text: string): Promise<LangCode | null> {
  if (!text) return null;

  for (const provider of providerChain) {
    if (provider.detectLanguage) {
      try {
        const result = await provider.detectLanguage(text);
        if (result) return result;
      } catch {
        continue;
      }
    }
  }

  return null;
}

// ─── HEALTH CHECK ───────────────────────────────────────────────────

/**
 * Check if any provider is healthy
 */
export async function checkProvidersHealth(): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  for (const provider of providerChain) {
    if (provider.healthCheck) {
      try {
        results[provider.name] = await provider.healthCheck();
      } catch {
        results[provider.name] = false;
      }
    } else {
      results[provider.name] = true;
    }
  }

  return results;
}

// ─── EXPORT ─────────────────────────────────────────────────────────

export default {
  translate,
  translateWithMeta,
  translateBatch,
  translateWithFallback,
  detectLanguage,
  dictionaryProvider,
  mockProvider,
  googleTranslateProvider,
  aiTranslateProvider,
  setProviderChain,
  addProvider,
  getProviderChain,
  setTranslationProvider,
  getTranslationProvider,
  resetProviders,
  checkProvidersHealth,
};