// src/app/api/generate-wav/route.ts

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE_URL = "https://wav.am";

// ─── TOKEN POOL ─────────────────────────────────────────────────────
// Configure up to 4 tokens via env vars:
//   WAV_ACCESS_TOKEN_1, WAV_PROJECT_ID_1
//   WAV_ACCESS_TOKEN_2, WAV_PROJECT_ID_2
//   WAV_ACCESS_TOKEN_3, WAV_PROJECT_ID_3
//   WAV_ACCESS_TOKEN_4, WAV_PROJECT_ID_4
//
// Legacy single-token env vars (WAV_ACCESS_TOKEN / WAV_PROJECT_ID)
// are still supported and will be tried first if present.

interface TokenConfig {
  index: number;
  token: string;
  projectId: string;
  label: string;
}

function loadTokenPool(): TokenConfig[] {
  const pool: TokenConfig[] = [];

  // Legacy single-token (optional)
  const legacyToken = process.env.WAV_ACCESS_TOKEN;
  const legacyProjectId = process.env.WAV_PROJECT_ID;
  if (legacyToken && legacyProjectId) {
    pool.push({
      index: 0,
      token: legacyToken,
      projectId: legacyProjectId,
      label: `legacy(${legacyProjectId})`,
    });
  }

  // Numbered tokens (1..4)
  for (let i = 1; i <= 4; i++) {
    const token = process.env[`WAV_ACCESS_TOKEN_${i}`];
    const projectId = process.env[`WAV_PROJECT_ID_${i}`];
    if (token && projectId) {
      pool.push({
        index: i,
        token,
        projectId,
        label: `slot${i}(${projectId})`,
      });
    }
  }

  return pool;
}

// ─── ROTATION STATE (per-instance, best-effort) ────────────────────
// Just a hint to prefer the last-working token. On cold start, resets.
// Correctness doesn't depend on this — we always fall through on failure.

let lastWorkingIndex = 0;

// ─── ERROR CLASSIFICATION ──────────────────────────────────────────

/**
 * Does this error mean "this token is exhausted/invalid, try next one"?
 */
function shouldTryNextToken(status: number, errorText: string): boolean {
  if (status === 401) return true; // Unauthorized
  if (status === 402) return true; // Payment Required
  if (status === 403) return true; // Forbidden (often quota)
  if (status === 404) return true; // Project not found (wrong project_id)
  if (status === 429) return true; // Too Many Requests
  if (status >= 500) return true;  // Upstream server error

  const lower = errorText.toLowerCase();
  if (
    lower.includes("insufficient") ||
    lower.includes("no credits") ||
    lower.includes("quota") ||
    lower.includes("limit") ||
    lower.includes("exceeded") ||
    lower.includes("not enough") ||
    lower.includes("balance") ||
    lower.includes("unauthorized") ||
    lower.includes("token") ||
    lower.includes("expired")
  ) {
    return true;
  }

  return false;
}

// ─── SINGLE TOKEN ATTEMPT ──────────────────────────────────────────

async function tryGenerateWithToken(
  token: string,
  projectId: string,
  text: string,
  voice: string
): Promise<Buffer> {
  const response = await fetch(`${BASE_URL}/generate_audio/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      project_id: projectId,
      text,
      voice,
      format: "mp3",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    const err: any = new Error(
      `WAV API error (${response.status}): ${errorText.slice(0, 200)}`
    );
    err.status = response.status;
    err.errorText = errorText;
    throw err;
  }

  const data = await response.json();

  if (!data.path) {
    const err: any = new Error(
      `WAV API returned no path: ${JSON.stringify(data).slice(0, 200)}`
    );
    err.status = 500;
    err.errorText = JSON.stringify(data);
    throw err;
  }

  const downloadUrl = `${BASE_URL}${data.path}`;
  const audioResponse = await fetch(downloadUrl, {
    headers: { Authorization: token },
    cache: "no-store",
  });

  if (!audioResponse.ok) {
    const err: any = new Error(
      `Failed to download audio: ${audioResponse.status}`
    );
    err.status = audioResponse.status;
    err.errorText = "";
    throw err;
  }

  const audioBuffer = await audioResponse.arrayBuffer();
  return Buffer.from(audioBuffer);
}

// ─── ROTATING GENERATOR ────────────────────────────────────────────

async function generateAudioWithRotation(
  text: string,
  voice: string,
  tokenPool: TokenConfig[]
): Promise<{ buffer: Buffer; usedToken: TokenConfig }> {
  if (tokenPool.length === 0) {
    throw new Error(
      "No WAV tokens configured. Set WAV_ACCESS_TOKEN_1..4 and WAV_PROJECT_ID_1..4 in env."
    );
  }

  // Order: last-known-working first, then remaining in index order
  const sorted = [...tokenPool].sort((a, b) => {
    if (a.index === lastWorkingIndex) return -1;
    if (b.index === lastWorkingIndex) return 1;
    return a.index - b.index;
  });

  const errors: string[] = [];

  for (const cfg of sorted) {
    try {
      const buffer = await tryGenerateWithToken(
        cfg.token,
        cfg.projectId,
        text,
        voice
      );
      lastWorkingIndex = cfg.index;
      console.log(`✅ WAV success via ${cfg.label}`);
      return { buffer, usedToken: cfg };
    } catch (err: any) {
      const status = err.status || 0;
      const errorText = err.errorText || err.message || "";

      // Hard failure (bad text, etc.) — no point trying other tokens
      if (status === 400 && !shouldTryNextToken(status, errorText)) {
        console.error(`❌ WAV hard failure on ${cfg.label}:`, err.message);
        throw err;
      }

      console.warn(
        `⚠️ WAV token ${cfg.label} failed (status ${status}): ${err.message}`
      );
      errors.push(`${cfg.label}: status=${status} ${err.message.slice(0, 120)}`);
      // Continue to next token
    }
  }

  throw new Error(
    `All ${tokenPool.length} WAV tokens failed:\n${errors.join("\n")}`
  );
}

// ─── POST HANDLER ──────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = "Ani" } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }

    const tokenPool = loadTokenPool();
    if (tokenPool.length === 0) {
      return NextResponse.json(
        {
          error:
            "WAV tokens not configured. Set WAV_ACCESS_TOKEN_1..4 and WAV_PROJECT_ID_1..4.",
        },
        { status: 500 }
      );
    }

    console.log(
      `🔊 Generating WAV: "${text.slice(0, 50)}..." voice=${voice} pool=${tokenPool.length}`
    );

    const { buffer, usedToken } = await generateAudioWithRotation(
      text,
      voice,
      tokenPool
    );

    const base64Audio = buffer.toString("base64");
    const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`;

    return NextResponse.json({
      success: true,
      voice,
      audio: base64Audio,
      audioUrl: audioDataUrl,
      text,
      language: "hy",
      _token: usedToken.label, // useful for debugging; safe to remove
    });
  } catch (error) {
    console.error("❌ WAV generation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ─── GET HANDLER (health check / diagnostics) ─────────────────────

export async function GET() {
  const pool = loadTokenPool();

  return NextResponse.json({
    success: true,
    message: "WAV API running with token rotation",
    defaultVoice: "Ani",
    availableVoices: ["Ani", "Avet", "Areg", "Luse", "Tigran"],
    supportedLanguages: ["hy"],
    tokenPool: pool.map((t) => ({
      label: t.label,
      projectId: t.projectId,
    })),
    lastWorkingIndex,
  });
}