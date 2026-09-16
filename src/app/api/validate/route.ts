// src/app/api/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fullValidationWithAI } from "@/lib/ai/evaluator";

export const runtime = "edge";

// ─── NORMALIZATION HELPERS ──────────────────────────────────────────

function normalize(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,!?;:()"']/g, "")
    .replace(/«|»|"|'|`|’|‘/g, "")
    .replace(/\s*([?.!,;:])\s*/g, "$1")
    .trim();
}

function normalizeWords(str: string): string[] {
  return normalize(str)
    .split(" ")
    .filter(w => w.length > 0);
}

function removeSpaces(str: string): string {
  return str.replace(/\s/g, "");
}

// ─── EXACT MATCH WITH FLEXIBILITY ──────────────────────────────────

function checkExactMatch(userAnswer: string, expectedAnswer: string, allValidForms: string[] = []): { accepted: boolean; score: number } {
  const userNorm = normalize(userAnswer);
  const expectedNorm = normalize(expectedAnswer);
  const validNorm = allValidForms.map(f => normalize(f));

  if (userNorm === expectedNorm) {
    return { accepted: true, score: 1.0 };
  }

  if (validNorm.some(v => v === userNorm)) {
    return { accepted: true, score: 1.0 };
  }

  if (removeSpaces(userNorm) === removeSpaces(expectedNorm)) {
    return { accepted: true, score: 0.9 };
  }

  const userWords = normalizeWords(userNorm);
  const expectedWords = normalizeWords(expectedNorm);
  
  if (userWords.length > 0 && expectedWords.length > 0) {
    const commonWords = userWords.filter(w => expectedWords.includes(w));
    const ratio = commonWords.length / expectedWords.length;
    
    if (ratio >= 0.9) {
      return { accepted: true, score: 0.85 };
    }
    if (ratio >= 0.7) {
      return { accepted: true, score: 0.7 };
    }
  }

  if (userNorm.includes(expectedNorm) || expectedNorm.includes(userNorm)) {
    return { accepted: true, score: 0.8 };
  }

  return { accepted: false, score: 0 };
}

// ─── MULTIPLE CHOICE MATCH ──────────────────────────────────────────

function checkMultipleChoice(
  userAnswer: string, 
  expectedAnswer: string, 
  options: string[] = [],
  allValidAnswers: string[] = []
): { accepted: boolean; score: number } {
  const userNorm = normalize(userAnswer);
  const expectedNorm = normalize(expectedAnswer);
  const optionsNorm = options.map(o => normalize(o));
  const validNorm = allValidAnswers.map(a => normalize(a));

  if (userNorm === expectedNorm) {
    return { accepted: true, score: 1.0 };
  }

  if (validNorm.some(v => v === userNorm)) {
    return { accepted: true, score: 1.0 };
  }

  if (optionsNorm.some(o => o === userNorm)) {
    if (userNorm === expectedNorm) {
      return { accepted: true, score: 1.0 };
    }
    return { accepted: false, score: 0 };
  }

  if (userNorm.includes(expectedNorm) || expectedNorm.includes(userNorm)) {
    return { accepted: true, score: 0.85 };
  }

  return { accepted: false, score: 0 };
}

// ─── WORD ORDER MATCH ───────────────────────────────────────────────

function checkWordOrder(
  userAnswer: string, 
  expectedAnswer: string,
  allValidAnswers: string[] = []
): { accepted: boolean; score: number } {
  const userNorm = normalize(userAnswer);
  const expectedNorm = normalize(expectedAnswer);
  const validNorm = allValidAnswers.map(a => normalize(a));

  if (userNorm === expectedNorm) {
    return { accepted: true, score: 1.0 };
  }

  if (validNorm.some(v => v === userNorm)) {
    return { accepted: true, score: 1.0 };
  }

  if (removeSpaces(userNorm) === removeSpaces(expectedNorm)) {
    return { accepted: true, score: 0.95 };
  }

  if (validNorm.some(v => removeSpaces(v) === removeSpaces(userNorm))) {
    return { accepted: true, score: 0.9 };
  }

  const userWords = normalizeWords(userNorm);
  const expectedWords = normalizeWords(expectedNorm);

  if (userWords.length === expectedWords.length) {
    let matches = 0;
    for (let i = 0; i < userWords.length; i++) {
      if (userWords[i] === expectedWords[i]) {
        matches++;
      }
    }
    const ratio = matches / expectedWords.length;
    if (ratio >= 0.9) {
      return { accepted: true, score: ratio };
    }
    if (ratio >= 0.7 && ratio < 0.9) {
      return { accepted: false, score: ratio };
    }
    return { accepted: false, score: ratio };
  }

  const sortedUser = [...userWords].sort();
  const sortedExpected = [...expectedWords].sort();
  if (sortedUser.join(" ") === sortedExpected.join(" ")) {
    return { accepted: false, score: 0.5 };
  }

  return { accepted: false, score: 0 };
}

// ─── MATCH PAIRS MATCH ──────────────────────────────────────────────

function parseMatchPairsString(str: string): Record<string, string> | null {
  try {
    const result: Record<string, string> = {};
    
    let pairs: string[] = [];
    
    if (str.includes(',')) {
      pairs = str.split(',').map(p => p.trim());
    } else if (str.includes(';')) {
      pairs = str.split(';').map(p => p.trim());
    } else if (str.includes('\n')) {
      pairs = str.split('\n').map(p => p.trim());
    } else {
      pairs = [str];
    }
    
    for (const pair of pairs) {
      if (!pair) continue;
      
      let key: string, value: string;
      
      if (pair.includes(' → ')) {
        [key, value] = pair.split(' → ').map(s => s.trim());
      } else if (pair.includes(' -> ')) {
        [key, value] = pair.split(' -> ').map(s => s.trim());
      } else if (pair.includes(':')) {
        [key, value] = pair.split(':').map(s => s.trim());
      } else if (pair.includes('=')) {
        [key, value] = pair.split('=').map(s => s.trim());
      } else {
        continue;
      }
      
      if (key && value) {
        result[key] = value;
      }
    }
    
    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}

function checkMatchPairs(
  userAnswer: string, 
  expectedAnswer: string
): { accepted: boolean; score: number; matches: number; total: number } {
  try {
    let userPairs: Record<string, string>;
    let expectedPairs: Record<string, string>;
    
    try {
      userPairs = JSON.parse(userAnswer);
    } catch {
      const parsed = parseMatchPairsString(userAnswer);
      if (!parsed) {
        return { accepted: false, score: 0, matches: 0, total: 0 };
      }
      userPairs = parsed;
    }
    
    try {
      expectedPairs = JSON.parse(expectedAnswer);
    } catch {
      const parsed = parseMatchPairsString(expectedAnswer);
      if (!parsed) {
        return { accepted: false, score: 0, matches: 0, total: 0 };
      }
      expectedPairs = parsed;
    }
    
    if (!userPairs || !expectedPairs) {
      return { accepted: false, score: 0, matches: 0, total: 0 };
    }
    
    let matches = 0;
    const total = Object.keys(expectedPairs).length;
    
    for (const [key, value] of Object.entries(expectedPairs)) {
      const userValue = userPairs[key]?.trim().toLowerCase() || "";
      const expectedValue = value.trim().toLowerCase();
      
      if (userValue === expectedValue) {
        matches++;
      }
    }
    
    const score = matches / total;
    const accepted = score >= 0.8;
    
    return { accepted, score, matches, total };
  } catch (error) {
    console.error("Match pairs error:", error);
    return { accepted: false, score: 0, matches: 0, total: 0 };
  }
}

// ─── MAIN POST HANDLER ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      userAnswer,
      expectedAnswer,
      englishOriginal,
      sourceLanguage = "en",
      targetLanguage = "hy",
      allValidAnswers = [],
      exerciseType = "fill_in",
      options = [],
      useAI = true,
      legacy = false,
    } = body;

    console.log(`📤 Validation request:`, {
      exerciseType,
      userAnswer,
      expectedAnswer,
      allValidAnswers,
    });

    if (legacy) {
      const result = checkExactMatch(userAnswer, expectedAnswer, allValidAnswers);
      return NextResponse.json({
        accepted: result.accepted,
        score: result.score,
        layer: "exact_match",
        feedback: result.accepted ? "✅ Correct!" : "❌ Try again",
      });
    }

    // ✅ FIX: Add layer to result type
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
      feedback: "❌ Try again",
    };

    switch (exerciseType) {
      case "multiple_choice": {
        const mcResult = checkMultipleChoice(userAnswer, expectedAnswer, options, allValidAnswers);
        result.accepted = mcResult.accepted;
        result.score = mcResult.score;
        result.feedback = mcResult.accepted ? "✅ Ճիշտ է!" : "❌ Սխալ է, փորձիր նորից";
        result.corrections = mcResult.accepted ? undefined : [expectedAnswer];
        break;
      }

      case "word_order": {
        const woResult = checkWordOrder(userAnswer, expectedAnswer, allValidAnswers);
        result.accepted = woResult.accepted;
        result.score = woResult.score;
        result.feedback = woResult.accepted 
          ? `✅ Ճիշտ հերթականություն (${Math.round(woResult.score * 100)}%)` 
          : "❌ Սխալ հերթականություն, փորձիր նորից";
        result.corrections = woResult.accepted ? undefined : [expectedAnswer];
        break;
      }

      case "match_pairs": {
        const mpResult = checkMatchPairs(userAnswer, expectedAnswer);
        result.accepted = mpResult.accepted;
        result.score = mpResult.score;
        result.feedback = mpResult.accepted 
          ? `✅ ${mpResult.matches}/${mpResult.total} զույգ ճիշտ է` 
          : `❌ ${mpResult.matches}/${mpResult.total} զույգ ճիշտ է, փորձիր նորից`;
        result.corrections = mpResult.accepted ? undefined : [expectedAnswer];
        result.details = { matches: mpResult.matches, total: mpResult.total };
        break;
      }

      case "listening":
      case "speaking":
      case "fill_in":
      default: {
        const exactResult = checkExactMatch(userAnswer, expectedAnswer, allValidAnswers);
        result.accepted = exactResult.accepted;
        result.score = exactResult.score;
        result.feedback = exactResult.accepted 
          ? `✅ Ընդունված է (${Math.round(exactResult.score * 100)}%)` 
          : "❌ Փորձիր նորից";
        result.corrections = exactResult.accepted ? undefined : [expectedAnswer];
        break;
      }
    }

    if (useAI && !result.accepted && body.userAnswer && body.userAnswer.trim().length > 2) {
      try {
        console.log("🤖 AI fallback validation...");
        const aiResult = await fullValidationWithAI({
          userAnswer: body.userAnswer,
          expectedAnswer: body.expectedAnswer,
          sourceSentence: body.englishOriginal || "",
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLanguage,
          allValidForms: allValidAnswers,
        });

        if (aiResult.accepted) {
          result.accepted = true;
          result.score = Math.max(result.score, aiResult.score || 0.7);
          result.feedback = aiResult.feedback || "✅ AI-ն հաստատեց";
          result.layer = "ai_fallback";
        }
      } catch (error) {
        console.warn("⚠️ AI validation failed:", error);
      }
    }

    console.log(`📥 Validation result:`, {
      accepted: result.accepted,
      score: result.score,
      feedback: result.feedback,
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