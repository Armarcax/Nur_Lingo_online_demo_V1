// src/app/api/explain/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// ─── TYPES ──────────────────────────────────────────────────────────

interface ExplainRequest {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  nativeLang: "hy" | "en" | "ru";
  learningLang: "hy" | "en" | "ru";
  exerciseType: string;
  sourceLesson?: string;
  wasCorrect: boolean;
  acceptableAnswers?: string[];
}

// ─── LANGUAGE NAMES ─────────────────────────────────────────────────

const LANG_NAMES = {
  hy: "Armenian (հայերեն)",
  en: "English",
  ru: "Russian (русский)",
};

// ─── SYSTEM PROMPT ──────────────────────────────────────────────────

function buildSystemPrompt(
  nativeLang: string,
  learningLang: string,
  wasCorrect: boolean,
): string {
  const nativeName = LANG_NAMES[nativeLang as keyof typeof LANG_NAMES] || "English";
  const learningName = LANG_NAMES[learningLang as keyof typeof LANG_NAMES] || "Armenian";

  return `You are Nuri (Նուռիկ) — a friendly language learning tutor mascot for NUR Lingo.
You are teaching a student who speaks ${nativeName} and is learning ${learningName}.

${wasCorrect
  ? `The student answered CORRECTLY. Your job is to REINFORCE their learning.`
  : `The student made a MISTAKE. Your job is to help them understand WHY it was wrong WITHOUT making them feel bad.`
}

ALWAYS respond in ${nativeName} (the student's native language).

Structure your response as JSON with these EXACT fields:
{
  "title": "Short encouraging title (max 50 chars)",
  "reason": "Why the answer is ${wasCorrect ? 'correct' : 'wrong'} — 2-3 sentences, friendly tone",
  "tip": "A memorable tip/hint to help remember (1-2 sentences)",
  "example": "One example sentence in ${learningName} with its translation to ${nativeName}",
  "encouragement": "Short encouraging phrase (max 30 chars)"
}

Keep it:
- Warm, friendly, encouraging (like a friend helping)
- Use emojis naturally (1-2 per field, not too many)
- Precise but simple — 8-year-old should understand
- For mistakes: gentle, never critical

Return ONLY valid JSON. No markdown, no explanation outside the JSON.`;
}

function buildUserPrompt(req: ExplainRequest): string {
  let prompt = `Question: "${req.question}"
Student's answer: "${req.userAnswer}"
Correct answer: "${req.correctAnswer}"`;

  if (req.exerciseType) {
    prompt += `\nExercise type: ${req.exerciseType}`;
  }

  if (req.acceptableAnswers && req.acceptableAnswers.length > 1) {
    prompt += `\nAlso acceptable: ${req.acceptableAnswers.slice(1, 4).join(", ")}`;
  }

  if (req.sourceLesson) {
    prompt += `\nSource lesson: ${req.sourceLesson}`;
  }

  return prompt;
}

// ─── API HANDLER ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExplainRequest;

    // Validation
    if (!body.question || !body.correctAnswer || !body.userAnswer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = buildSystemPrompt(
      body.nativeLang,
      body.learningLang,
      body.wasCorrect
    );
    const userPrompt = buildUserPrompt(body);

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 500,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      return NextResponse.json(
        { error: "AI service unavailable", details: errorText },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Empty AI response" },
        { status: 502 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // If JSON parsing fails, try to extract JSON from text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON from AI");
      }
    }

    return NextResponse.json({
      success: true,
      title: parsed.title || "",
      reason: parsed.reason || "",
      tip: parsed.tip || "",
      example: parsed.example || "",
      encouragement: parsed.encouragement || "",
      sourceLesson: body.sourceLesson || null,
    });
  } catch (error) {
    console.error("Explain API error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate explanation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}