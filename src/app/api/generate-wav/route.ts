// src/app/api/generate-wav/route.ts

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE_URL = "https://wav.am";

// ─── TOKEN POOL ─────────────────────────────────────────────────────

interface TokenConfig {
  index: number;
  token: string;
  projectId: string;
  label: string;
}

function loadTokenPool(): TokenConfig[] {
  const pool: TokenConfig[] = [];

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

// ─── ROTATION STATE ────────────────────────────────────────────────
let lastWorkingIndex = 0;

// ─── IN-MEMORY LRU CACHE ───────────────────────────────────────────

const CACHE_MAX_SIZE = 300;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  buffer: Buffer;
  timestamp: number;
}

const audioCache = new Map<string, CacheEntry>();

function getCacheKey(text: string, voice: string): string {
  return `${voice}:${text}`;
}

function getCached(key: string): Buffer | null {
  const entry = audioCache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    audioCache.delete(key);
    return null;
  }

  audioCache.delete(key);
  audioCache.set(key, entry);
  return entry.buffer;
}

function setCached(key: string, buffer: Buffer): void {
  if (audioCache.size >= CACHE_MAX_SIZE) {
    const firstKey = audioCache.keys().next().value;
    if (firstKey) audioCache.delete(firstKey);
  }
  audioCache.set(key, { buffer, timestamp: Date.now() });
}

// ─── PROMISE DEDUPLICATION ─────────────────────────────────────────

const inflightRequests = new Map<string, Promise<Buffer>>();

// ─── ERROR CLASSIFICATION ──────────────────────────────────────────

function shouldTryNextToken(status: number, errorText: string): boolean {
  if (status === 401) return true;
  if (status === 402) return true;
  if (status === 403) return true;
  if (status === 404) return true;
  if (status === 429) return true;
  if (status >= 500) return true;

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
      "No WAV tokens configured. Set WAV_ACCESS_TOKEN_1..4 and WAV_PROJECT_ID_1..4."
    );
  }

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

      if (status === 400 && !shouldTryNextToken(status, errorText)) {
        console.error(`❌ WAV hard failure on ${cfg.label}:`, err.message);
        throw err;
      }

      console.warn(
        `⚠️ WAV token ${cfg.label} failed (status ${status}): ${err.message}`
      );
      errors.push(
        `${cfg.label}: status=${status} ${err.message.slice(0, 120)}`
      );
    }
  }

  throw new Error(
    `All ${tokenPool.length} WAV tokens failed:\n${errors.join("\n")}`
  );
}

// ─── SHARED CACHE HEADERS ──────────────────────────────────────────

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=31536000, immutable",
} as const;

// ─── POST HANDLER ──────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { text, voice = "Ani" } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }

    const format = new URL(req.url).searchParams.get("format") || "json";

    const cacheKey = getCacheKey(text, voice);

    // ─── 1. CACHE HIT (instant) ─────────────────────────────────
    const cached = getCached(cacheKey);
    if (cached) {
      console.log(
        `⚡ WAV cache HIT: "${text.slice(0, 30)}..." (${cached.length}B, ${Date.now() - startTime}ms)`
      );

      if (format === "binary") {
        // ✅ TS fix: cast Buffer to BodyInit (runtime-safe)
        return new NextResponse(cached as unknown as BodyInit, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Length": String(cached.length),
            ...CACHE_HEADERS,
            "X-WAV-Cache": "hit",
            "X-WAV-Voice": voice,
          },
        });
      }

      const base64 = cached.toString("base64");
      return NextResponse.json(
        {
          success: true,
          voice,
          audio: base64,
          audioUrl: `data:audio/mp3;base64,${base64}`,
          text,
          language: "hy",
          _cache: "hit",
        },
        {
          headers: CACHE_HEADERS,
        }
      );
    }

    // ─── 2. PROMISE DEDUPLICATION (in-flight) ───────────────────
    let bufferPromise = inflightRequests.get(cacheKey);
    const wasInflight = !!bufferPromise;

    if (!bufferPromise) {
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

      bufferPromise = generateAudioWithRotation(text, voice, tokenPool)
        .then(({ buffer }) => {
          setCached(cacheKey, buffer);
          inflightRequests.delete(cacheKey);
          return buffer;
        })
        .catch((err) => {
          inflightRequests.delete(cacheKey);
          throw err;
        });

      inflightRequests.set(cacheKey, bufferPromise);
    } else {
      console.log(
        `🔗 WAV dedup HIT: "${text.slice(0, 30)}..." — joining in-flight request`
      );
    }

    const buffer = await bufferPromise;

    // ─── 3. RETURN ─────────────────────────────────────────────
    if (format === "binary") {
      // ✅ TS fix: cast Buffer to BodyInit (runtime-safe)
      return new NextResponse(buffer as unknown as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": String(buffer.length),
          ...CACHE_HEADERS,
          "X-WAV-Cache": wasInflight ? "dedup" : "miss",
          "X-WAV-Voice": voice,
        },
      });
    }

    const base64 = buffer.toString("base64");
    return NextResponse.json(
      {
        success: true,
        voice,
        audio: base64,
        audioUrl: `data:audio/mp3;base64,${base64}`,
        text,
        language: "hy",
        _cache: wasInflight ? "dedup" : "miss",
      },
      {
        headers: CACHE_HEADERS,
      }
    );
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

// ─── GET HANDLER (diagnostics) ────────────────────────────────────

export async function GET() {
  const pool = loadTokenPool();

  return NextResponse.json({
    success: true,
    message: "WAV API running with token rotation + LRU cache",
    defaultVoice: "Ani",
    availableVoices: ["Ani", "Avet", "Areg", "Luse", "Tigran"],
    supportedLanguages: ["hy"],
    tokenPool: pool.map((t) => ({
      label: t.label,
      projectId: t.projectId,
    })),
    lastWorkingIndex,
    cache: {
      size: audioCache.size,
      maxSize: CACHE_MAX_SIZE,
      ttlHours: CACHE_TTL_MS / (60 * 60 * 1000),
    },
    inflight: inflightRequests.size,
  });
}