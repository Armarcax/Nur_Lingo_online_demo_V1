// src/app/api/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fullValidationWithAI } from "@/lib/ai/evaluator";

export const runtime = "nodejs";

// ─── LANGUAGE CODE TYPE GUARD ───────────────────────────────────────

type LangCode = "hy" | "en" | "ru";

const VALID_LANGS: readonly LangCode[] = ["hy", "en", "ru"] as const;

/**
 * Narrow an unknown value to a valid LangCode, with a fallback.
 * Replaces unsafe `String(...)` casts that break strict typing.
 */
function toLangCode(value: unknown, fallback: LangCode = "en"): LangCode {
  if (
    typeof value === "string" &&
    (VALID_LANGS as readonly string[]).includes(value)
  ) {
    return value as LangCode;
  }
  return fallback;
}

// ─── CONSTANTS ──────────────────────────────────────────────────────

const MAX_ANSWER_LENGTH = 500;
const MAX_VALID_FORMS = 50;

// ─── NORMALIZATION ──────────────────────────────────────────────────

/**
 * Normalize a string for comparison.
 * Removes quotes (Armenian «», Russian «», Latin ""), collapses spaces,
 * strips trailing punctuation.
 */
function normalize(str: string): string {
  if (typeof str !== "string") return "";
  return str
    .trim()
    .toLowerCase()
    // ─── Armenian ligature normalization ─────────────────────────
    // Treat all 3 variants of "և" as the same:
    //   և  (U+0587)          → եվ (U+0565 U+057E)
    //   եւ  (U+0565 U+0582)  → եվ (U+0565 U+057E)
    //   եվ  (U+0565 U+057E)  → եվ (already modern)
    // This makes "բարև", "բարեւ", "բարեվ" all equal.
    .replace(/\u0587/g, "\u0565\u057E")           // և → եվ
    .replace(/\u0565\u0582/g, "\u0565\u057E")     // եւ → եվ
    // Remove quote characters from all supported languages
    .replace(/[«»""''`´ʻʽ՚՛՜՝՞„‟‹›]/g, "")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    // Remove trailing punctuation (Armenian ։, Russian ., Latin .!?;:)
    .replace(/[.,!?;:։՝]+$/g, "")
    .trim();
}

/**
 * Tokenize into words, stripping ALL punctuation.
 */
function normalizeWords(str: string): string[] {
  return normalize(str)
    .replace(/[.,!?;:()[\]{}։՝]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}

// ─── VALIDATION GUARDS ──────────────────────────────────────────────

/**
 * Checks if a user answer is a valid non-empty string.
 * Returns the trimmed string if valid, or null if invalid.
 */
function sanitizeUserAnswer(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > MAX_ANSWER_LENGTH) return null;
  // Must contain at least one alphanumeric or letter character
  // (rejects punctuation-only answers like "..." or "!!!")
  const stripped = trimmed.replace(
    /[\s.,!?;:()"'\u00ab\u00bb\u2018\u2019\u201c\u201d`\u0589\u058a\u055d\u055e\u0589\u058a՝։]/g,
    ""
  );
  if (stripped.length === 0) return null;
  return trimmed;
}

/**
 * Sanitize expected answer.
 */
function sanitizeExpectedAnswer(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > MAX_ANSWER_LENGTH) return null;
  return trimmed;
}

/**
 * Sanitize list of valid alternative forms.
 */
function sanitizeValidForms(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, MAX_VALID_FORMS)
    .filter((v) => typeof v === "string" && v.trim().length > 0)
    .map((v) => (v as string).trim());
}

/**
 * Compute ratio of words that appear in both lists (order-agnostic).
 */
function wordSetRatio(
  a: string[],
  b: string[]
): {
  ratio: number;
  allPresent: boolean;
} {
  if (a.length === 0 || b.length === 0) {
    return { ratio: 0, allPresent: false };
  }
  const setB = new Set(b);
  const setA = new Set(a);
  const aInB = a.filter((w) => setB.has(w)).length;
  const bInA = b.filter((w) => setA.has(w)).length;
  const allPresent = aInB === a.length && bInA === b.length;
  const ratio = (aInB + bInA) / (a.length + b.length);
  return { ratio, allPresent };
}

/**
 * Compute positional match ratio (same word at same index).
 */
function positionalRatio(a: string[], b: string[]): number {
  if (a.length === 0 || b.length !== a.length) return 0;
  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) matches++;
  }
  return matches / a.length;
}

// ─── EXACT MATCH ────────────────────────────────────────────────────

function checkExactMatch(
  userAnswer: string,
  expectedAnswer: string,
  allValidForms: string[] = []
): { accepted: boolean; score: number } {
  const userNorm = normalize(userAnswer);
  const expectedNorm = normalize(expectedAnswer);
  const validNorm = allValidForms.map(normalize).filter((v) => v.length > 0);

  // 1. Exact match (after normalize)
  if (userNorm.length > 0 && userNorm === expectedNorm) {
    return { accepted: true, score: 1.0 };
  }

  // 2. Match against pre-approved alternatives
  if (userNorm.length > 0 && validNorm.some((v) => v === userNorm)) {
    return { accepted: true, score: 1.0 };
  }

  // 3. Word-level comparison (order-flexible, but ALL words must match)
  const userWords = normalizeWords(userNorm);
  const expectedWords = normalizeWords(expectedNorm);

  if (userWords.length === 0 || expectedWords.length === 0) {
    return { accepted: false, score: 0 };
  }

  // ❌ Do NOT use `includes()` — it fails for partial answers
  // Instead, use strict word-set matching
  const { allPresent } = wordSetRatio(userWords, expectedWords);

  if (allPresent && userWords.length === expectedWords.length) {
    // Same exact set of words
    const posRatio = positionalRatio(userWords, expectedWords);

    if (posRatio === 1.0) {
      return { accepted: true, score: 1.0 };
    }
    if (posRatio >= 0.7) {
      // Mostly same order — accept as valid alternative
      return { accepted: true, score: 0.9 };
    }
    // Same words but radically different order
    // Accept only with reduced score (intent-recognition)
    return { accepted: true, score: 0.8 };
  }

  // User provided only subset of expected words — REJECT
  return { accepted: false, score: 0 };
}

// ─── MULTIPLE CHOICE ────────────────────────────────────────────────

function checkMultipleChoice(
  userAnswer: string,
  expectedAnswer: string,
  options: string[] = [],
  allValidAnswers: string[] = []
): { accepted: boolean; score: number } {
  const userNorm = normalize(userAnswer);
  const expectedNorm = normalize(expectedAnswer);
  const optionsNorm = options.map(normalize).filter((o) => o.length > 0);
  const validNorm = allValidAnswers.map(normalize).filter((v) => v.length > 0);

  if (userNorm.length === 0) {
    return { accepted: false, score: 0 };
  }

  // Direct exact match with expected
  if (userNorm === expectedNorm) {
    return { accepted: true, score: 1.0 };
  }

  // Match against valid alternatives
  if (validNorm.some((v) => v === userNorm)) {
    return { accepted: true, score: 1.0 };
  }

  // If user's answer matches one of the options, it must be the correct one
  const matchedOption = optionsNorm.find((o) => o === userNorm);
  if (matchedOption) {
    // User selected an option, but it's NOT the correct one
    return { accepted: false, score: 0 };
  }

  // No match at all
  return { accepted: false, score: 0 };
}

// ─── WORD ORDER ─────────────────────────────────────────────────────

function checkWordOrder(
  userAnswer: string,
  expectedAnswer: string,
  allValidAnswers: string[] = []
): { accepted: boolean; score: number } {
  const userNorm = normalize(userAnswer);
  const expectedNorm = normalize(expectedAnswer);
  const validNorm = allValidAnswers.map(normalize).filter((v) => v.length > 0);

  if (userNorm.length === 0) {
    return { accepted: false, score: 0 };
  }

  // 1. Exact match
  if (userNorm === expectedNorm) {
    return { accepted: true, score: 1.0 };
  }

  // 2. Match against alternatives (which may have different valid orders)
  if (validNorm.some((v) => v === userNorm)) {
    return { accepted: true, score: 1.0 };
  }

  // 3. Position-based match — for word_order, this is critical
  const userWords = normalizeWords(userNorm);
  const expectedWords = normalizeWords(expectedNorm);

  if (userWords.length !== expectedWords.length || userWords.length === 0) {
    return { accepted: false, score: 0 };
  }

  const posRatio = positionalRatio(userWords, expectedWords);

  // Require 100% positional match for word_order
  // (this is the entire point of the exercise)
  if (posRatio === 1.0) {
    return { accepted: true, score: 1.0 };
  }

  // No partial acceptance — order must be exact
  return { accepted: false, score: posRatio };
}

// ─── MATCH PAIRS ────────────────────────────────────────────────────

function parseMatchPairsString(str: string): Record<string, string> | null {
  try {
    const result: Record<string, string> = {};

    let pairs: string[] = [];
    if (str.includes("\n")) pairs = str.split("\n");
    else if (str.includes(";")) pairs = str.split(";");
    else if (str.includes(",")) pairs = str.split(",");
    else pairs = [str];

    for (const pair of pairs) {
      if (!pair || !pair.trim()) continue;

      let key = "";
      let value = "";
      if (pair.includes(" → ")) {
        [key, value] = pair.split(" → ").map((s) => s.trim());
      } else if (pair.includes(" -> ")) {
        [key, value] = pair.split(" -> ").map((s) => s.trim());
      } else if (pair.includes(":")) {
        [key, value] = pair.split(":").map((s) => s.trim());
      } else if (pair.includes("=")) {
        [key, value] = pair.split("=").map((s) => s.trim());
      } else {
        continue;
      }

      if (key && value) result[key] = value;
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}

function parseMatchPairs(str: string): Record<string, string> | null {
  // Try JSON first
  try {
    const parsed = JSON.parse(str);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
  } catch {
    // Fall through to string parsing
  }
  return parseMatchPairsString(str);
}

function checkMatchPairs(
  userAnswer: string,
  expectedAnswer: string
): { accepted: boolean; score: number; matches: number; total: number } {
  try {
    const userPairs = parseMatchPairs(userAnswer);
    const expectedPairs = parseMatchPairs(expectedAnswer);

    if (!userPairs || !expectedPairs) {
      return { accepted: false, score: 0, matches: 0, total: 0 };
    }

    const total = Object.keys(expectedPairs).length;
    if (total === 0) {
      return { accepted: false, score: 0, matches: 0, total: 0 };
    }

    let matches = 0;
    for (const [key, value] of Object.entries(expectedPairs)) {
      const userValue = userPairs[key];
      if (userValue === undefined) continue;

      // ✅ Use full normalize, not just toLowerCase
      const userNorm = normalize(String(userValue));
      const expectedNorm = normalize(String(value));

      if (userNorm.length > 0 && userNorm === expectedNorm) {
        matches++;
      }
    }

    const score = matches / total;
    const accepted = score >= 0.8;

    return { accepted, score, matches, total };
  } catch (error) {
    console.error("[validate] match_pairs error:", error);
    return { accepted: false, score: 0, matches: 0, total: 0 };
  }
}

// ─── MAIN POST HANDLER ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { accepted: false, score: 0, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const {
      userAnswer: rawUserAnswer,
      expectedAnswer: rawExpectedAnswer,
      englishOriginal = "",
      sourceLanguage = "en",
      targetLanguage = "hy",
      allValidAnswers: rawValidAnswers,
      exerciseType = "fill_in",
      options: rawOptions,
      useAI = true,
      legacy = false,
    } = body ?? {};

    // ─── SANITIZE INPUTS ───────────────────────────────────────────
    const userAnswer = sanitizeUserAnswer(rawUserAnswer);
    const expectedAnswer = sanitizeExpectedAnswer(rawExpectedAnswer);
    const allValidAnswers = sanitizeValidForms(rawValidAnswers);
    const options = sanitizeValidForms(rawOptions);

    // ❌ Reject empty user answer EARLY
    if (userAnswer === null) {
      console.log("[validate] Rejected: empty or invalid userAnswer");
      return NextResponse.json({
        accepted: false,
        score: 0,
        feedback: "❌ Խնդրում ենք պատասխանել",
        corrections: expectedAnswer ? [expectedAnswer] : [],
        layer: "input_guard",
      });
    }

    // ❌ Reject if expectedAnswer missing (data integrity)
    if (expectedAnswer === null) {
      console.error("[validate] Missing expectedAnswer");
      return NextResponse.json(
        {
          accepted: false,
          score: 0,
          error: "Missing expectedAnswer",
          feedback: "⚠️ Տվյալների սխալ",
        },
        { status: 400 }
      );
    }

    // Legacy mode (simple exact match)
    if (legacy) {
      const result = checkExactMatch(userAnswer, expectedAnswer, allValidAnswers);
      return NextResponse.json({
        accepted: result.accepted,
        score: result.score,
        layer: "exact_match",
        feedback: result.accepted ? "✅ Correct!" : "❌ Try again",
      });
    }

    // ─── RESULT OBJECT ─────────────────────────────────────────────
    let result: {
      accepted: boolean;
      score: number;
      feedback: string;
      corrections?: string[];
      details?: any;
      layer?: string;
    } = {
      accepted: false,
      score: 0,
      feedback: "❌ Փորձիր նորից",
    };

    // ─── ROUTE BY EXERCISE TYPE ────────────────────────────────────
    switch (exerciseType) {
      case "multiple_choice": {
        const r = checkMultipleChoice(
          userAnswer,
          expectedAnswer,
          options,
          allValidAnswers
        );
        result.accepted = r.accepted;
        result.score = r.score;
        result.feedback = r.accepted ? "feedback_correct" : "feedback_wrong";
        result.corrections = r.accepted ? undefined : [expectedAnswer];
        result.layer = "multiple_choice";
        break;
      }

      case "word_order": {
        const r = checkWordOrder(userAnswer, expectedAnswer, allValidAnswers);
        result.accepted = r.accepted;
        result.score = r.score;
        result.feedback = r.accepted
          ? "✅ Ճիշտ հերթականություն"
          : "❌ Սխալ հերթականություն, փորձիր նորից";
        result.corrections = r.accepted ? undefined : [expectedAnswer];
        result.layer = "word_order";
        break;
      }

      case "match_pairs": {
        const r = checkMatchPairs(userAnswer, expectedAnswer);
        result.accepted = r.accepted;
        result.score = r.score;
        result.feedback = r.accepted
          ? `✅ ${r.matches}/${r.total} զույգ ճիշտ է`
          : `❌ ${r.matches}/${r.total} զույգ ճիշտ է`;
        result.corrections = r.accepted ? undefined : [expectedAnswer];
        result.details = { matches: r.matches, total: r.total };
        result.layer = "match_pairs";
        break;
      }

      case "listening":
      case "speaking":
      case "fill_in":
      default: {
        const r = checkExactMatch(userAnswer, expectedAnswer, allValidAnswers);
        result.accepted = r.accepted;
        result.score = r.score;
        result.feedback = r.accepted ? "✅ Ճիշտ է" : "❌ Փորձիր նորից";
        result.corrections = r.accepted ? undefined : [expectedAnswer];
        result.layer = "exact_match";
        break;
      }
    }

    // ─── AI FALLBACK (only if rule-based rejected) ─────────────────
    if (
      useAI &&
      !result.accepted &&
      userAnswer.length >= 3 &&
      exerciseType !== "match_pairs" // AI doesn't handle pairs
    ) {
      try {
        console.log("[validate] AI fallback triggered");
        const aiResult = await fullValidationWithAI({
          userAnswer,
          expectedAnswer,
          sourceSentence:
            typeof englishOriginal === "string" ? englishOriginal : "",
          sourceLanguage: toLangCode(sourceLanguage, "en"),
          targetLanguage: toLangCode(targetLanguage, "hy"),
          allValidForms: allValidAnswers,
        });

        if (aiResult.accepted) {
          result.accepted = true;
          result.score = Math.max(result.score, aiResult.score || 0.7);
          result.feedback = aiResult.feedback || "✅ AI-ն հաստատեց";
          result.corrections = undefined;
          result.layer = "ai_fallback";
        }
      } catch (error) {
        console.warn("[validate] AI fallback failed:", error);
      }
    }

    console.log("[validate] result:", {
      exerciseType,
      accepted: result.accepted,
      score: result.score,
      layer: result.layer,
    });

    return NextResponse.json({
      accepted: result.accepted,
      score: Math.round(result.score * 100) / 100,
      feedback: result.feedback,
      corrections: result.corrections,
      details: result.details,
      layer: result.layer || "rule_based",
    });
  } catch (error) {
    console.error("[NUR Lingo API Error]:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        accepted: false,
        score: 0,
        feedback: "⚠️ Տեխնիկական սխալ, փորձեք կրկին",
      },
      { status: 500 }
    );
  }
}