// src/lib/semantic/validator.ts

import { normalizeText, areMorphologicallyEquivalent } from "../nlp/morphology";
import { getAllValidArmenianForms, lookupArmenian } from "../lexicon/dictionary";

// ─── TYPES ────────────────────────────────────────────────────────────

export interface ValidationResult {
  accepted: boolean;
  score: number;
  layer: "exact" | "pattern" | "morphology" | "synonym" | "ai";
  feedback?: string;
  corrections?: string[];
  confidence: number;
  debug?: any;
}

// ─── HELPERS ──────────────────────────────────────────────────────────

function normalizeAnswer(text: string, lang: string): string {
  const base = text.trim().toLowerCase()
    .replace(/[.,!?;:()[\]"'«»]/g, "")
    .replace(/\s+/g, " ");
  
  // Armenian-specific punctuation
  if (lang === "hy") return base.replace(/[։՝՞՛]/g, "");
  
  // Russian: normalize ё→е for loose matching
  if (lang === "ru") return base.replace(/ё/g, "е");
  
  return base;
}

// ─── LAYER 1: EXACT MATCH ──────────────────────────────────────────

export function exactMatch(
  userAnswer: string,
  expectedAnswer: string,
  lang: string
): ValidationResult | null {
  if (normalizeAnswer(userAnswer, lang) === normalizeAnswer(expectedAnswer, lang)) {
    return {
      accepted: true,
      score: 1.0,
      layer: "exact",
      confidence: 1.0,
    };
  }
  return null;
}

// ─── LAYER 2: PATTERN REGISTRY ────────────────────────────────────

export function patternRegistryMatch(
  userSentence: string,
  sourceSentence: string,
  sourceLanguage: string
): ValidationResult | null {
  // Only works for English and Russian sources
  if (sourceLanguage !== "en" && sourceLanguage !== "ru") return null;

  const validForms = getAllValidArmenianForms(sourceSentence);
  if (validForms.length === 0) return null;

  const normUser = normalizeText(userSentence);
  for (const form of validForms) {
    if (normUser === normalizeText(form)) {
      return {
        accepted: true,
        score: 0.98,
        layer: "pattern",
        confidence: 1.0,
      };
    }
  }

  return null;
}

// ─── LAYER 3: MORPHOLOGICAL ANALYSIS ──────────────────────────────

export function morphologicalMatch(
  userAnswer: string,
  expectedAnswer: string
): ValidationResult | null {
  const result = areMorphologicallyEquivalent(userAnswer, expectedAnswer);
  if (result.equivalent) {
    return {
      accepted: true,
      score: Math.max(0.85, result.overlap),
      layer: "morphology",
      confidence: result.overlap,
      debug: {
        jaccard: result.overlap,
        details: result.details,
      },
    };
  }
  return null;
}

// ─── LAYER 4: SYNONYM EXPANSION ────────────────────────────────────

function checkSynonyms(
  userAnswer: string,
  expectedAnswers: string[]
): ValidationResult | null {
  const userTokens = userAnswer
    .split(/\s+/)
    .map((t) => normalizeText(t))
    .filter((t) => t.length > 0);

  for (const exp of expectedAnswers) {
    const expTokens = exp
      .split(/\s+/)
      .map((t) => normalizeText(t))
      .filter((t) => t.length > 0);

    if (userTokens.length !== expTokens.length) continue;

    let allMatch = true;
    for (let i = 0; i < expTokens.length; i++) {
      if (userTokens[i] === expTokens[i]) continue;

      const entry = lookupArmenian(expTokens[i]);
      if (entry && entry.synonyms.map((s) => normalizeText(s)).includes(userTokens[i])) {
        continue;
      }
      allMatch = false;
      break;
    }

    if (allMatch) {
      return {
        accepted: true,
        score: 0.8,
        layer: "synonym",
        confidence: 0.9,
      };
    }
  }
  return null;
}

// ─── LAYER 5: AI FALLBACK (placeholder) ───────────────────────────

export async function aiFallback(
  userAnswer: string,
  expectedAnswers: string[]
): Promise<ValidationResult | null> {
  // Placeholder for future AI integration
  // Could use GPT, Gemini, or other LLM for semantic similarity
  return null;
}

// ─── SCORING ─────────────────────────────────────────────────────────

export const scoreToGrade = (s: number) =>
  s >= 0.98 ? "perfect"
  : s >= 0.85 ? "excellent"
  : s >= 0.75 ? "good"
  : s >= 0.5 ? "partial"
  : "incorrect";

// ─── MAIN VALIDATION PIPELINE ──────────────────────────────────────

/**
 * 5-LAYER SEMANTIC VALIDATION PIPELINE
 * Short-circuits on first high-confidence match.
 * 
 * Layers:
 * 1. Exact Match (normalized)
 * 2. Pattern Registry (pre-calculated variants)
 * 3. Morphological Analysis (lemmatization + Jaccard)
 * 4. Synonym Expansion (dictionary synonyms)
 * 5. AI Fallback (future)
 */
export async function validateAnswer(req: {
  userAnswer: string;
  expectedAnswer: string | string[];
  sourceSentence: string;
  sourceLanguage: string;
  targetLanguage: string;
  options?: {
    strictMode?: boolean;
    allValidAnswers?: string[];
  };
}): Promise<ValidationResult> {
  const {
    userAnswer,
    expectedAnswer,
    sourceLanguage,
    targetLanguage,
    options,
  } = req;

  const expectedArray = Array.isArray(expectedAnswer)
    ? expectedAnswer
    : [expectedAnswer];

  // ─── Layer 1: Exact Match ──────────────────────────────────────
  for (const exp of expectedArray) {
    const res = exactMatch(userAnswer, exp, targetLanguage);
    if (res) return res;
  }

  // Strict mode: exact match only
  if (options?.strictMode) {
    return {
      accepted: false,
      score: 0.2,
      layer: "exact",
      feedback: "Strict mode: Exact match required.",
      confidence: 1.0,
    };
  }

  // ─── Layer 2: Pattern Registry ────────────────────────────────
  const patternMatch = patternRegistryMatch(
    userAnswer,
    req.sourceSentence,
    sourceLanguage
  );
  if (patternMatch) return patternMatch;

  // ─── Layer 3: Morphological Analysis ──────────────────────────
  for (const exp of expectedArray) {
    const morphRes = morphologicalMatch(userAnswer, exp);
    if (morphRes) return morphRes;
  }

  // ─── Layer 4: Synonym Expansion ───────────────────────────────
  const synonymMatch = checkSynonyms(userAnswer, expectedArray);
  if (synonymMatch) return synonymMatch;

  // ─── Layer 5: AI Fallback ─────────────────────────────────────
  const aiResult = await aiFallback(userAnswer, expectedArray);
  if (aiResult) return aiResult;

  // ─── No match ──────────────────────────────────────────────────
  return {
    accepted: false,
    score: 0,
    layer: "exact",
    corrections: expectedArray,
    confidence: 0.5,
  };
}

// ─── BATCH VALIDATION ──────────────────────────────────────────────

export async function validateBatch(
  answers: Array<{
    userAnswer: string;
    expectedAnswer: string | string[];
    sourceSentence: string;
    sourceLanguage: string;
    targetLanguage: string;
    options?: {
      strictMode?: boolean;
      allValidAnswers?: string[];
    };
  }>
): Promise<ValidationResult[]> {
  return Promise.all(answers.map((req) => validateAnswer(req)));
}

// ─── EXPORT ─────────────────────────────────────────────────────────

export default {
  validateAnswer,
  validateBatch,
  exactMatch,
  patternRegistryMatch,
  morphologicalMatch,
  checkSynonyms,
  aiFallback,
  scoreToGrade,
};