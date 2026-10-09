// src/app/api/explain-driving/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface ExplainRequest {
  question: string;
  correctAnswer: string;
  nativeLang: "hy" | "en" | "ru";
  category: string;
  allOptions?: string[];
}

const LANG_NAMES = {
  hy: "Armenian (հայերեն)",
  en: "English",
  ru: "Russian (русский)",
};

function buildPrompt(req: ExplainRequest): string {
  const nativeName = LANG_NAMES[req.nativeLang] || "Armenian";

  return `You are Nuri (Նուռիկ) — a friendly driving theory instructor for NUR Lingo.
You help a student understand Armenian traffic rules (HH traffic rules).

Category: ${req.category}

Question: "${req.question}"
Correct answer: "${req.correctAnswer}"
${req.allOptions?.length ? `All options:\n${req.allOptions.map((o, i) => `${i + 1}. ${o}`).join("\n")}` : ""}

Explain in ${nativeName} WHY this is the correct answer.

Return JSON with these EXACT fields:
{
  "title": "Short title (max 50 chars) — e.g. «🛑 Կանգառի կանոն»",
  "reason": "2-3 sentences explaining the rule clearly",
  "rule": "One memorable rule (like a mnemonic, max 100 chars)",
  "tip": "Practical tip for the real exam (1-2 sentences)",
  "example": "Real-life example when this rule applies"
}

Keep it:
- Warm, encouraging, like a friend explaining
- Precise, based on Armenian traffic rules (ՀՀ ՃԵԿ)
- Simple enough for beginners
- 1-2 emojis per field

Return ONLY valid JSON. No markdown.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExplainRequest;

    if (!body.question || !body.correctAnswer) {
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
            {
              role: "system",
              content:
                "You are a driving theory instructor. Return only valid JSON.",
            },
            { role: "user", content: buildPrompt(body) },
          ],
          temperature: 0.6,
          max_tokens: 600,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 502 });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      else throw new Error("Invalid JSON from AI");
    }

    return NextResponse.json({
      success: true,
      title: parsed.title || "",
      reason: parsed.reason || "",
      rule: parsed.rule || "",
      tip: parsed.tip || "",
      example: parsed.example || "",
    });
  } catch (error) {
    console.error("Explain driving error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate explanation",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}