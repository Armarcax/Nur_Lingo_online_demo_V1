// src/app/api/generate-wav/route.ts

import { NextRequest, NextResponse } from "next/server";

const WAV_ACCESS_TOKEN = process.env.WAV_ACCESS_TOKEN;
const PROJECT_ID = process.env.WAV_PROJECT_ID || "16527";
const BASE_URL = "https://wav.am";

// ─── VOICES ───────────────────────────────────────────────────────────

const AVAILABLE_VOICES = ["Ani", "Avet", "Areg", "Luse", "Tigran"];

// ─── GENERATE AUDIO (ONLY ONLINE, NO SAVE) ──────────────────────────

async function generateAudio(text: string, voice: string = "Ani"): Promise<Buffer> {
  const response = await fetch(`${BASE_URL}/generate_audio/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": WAV_ACCESS_TOKEN!,
    },
    body: JSON.stringify({
      project_id: PROJECT_ID,
      text: text,
      voice: voice,
      format: "mp3",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WAV API error: ${error}`);
  }

  const data = await response.json();

  const downloadUrl = `${BASE_URL}${data.path}`;
  const audioResponse = await fetch(downloadUrl, {
    headers: { "Authorization": WAV_ACCESS_TOKEN! },
  });

  if (!audioResponse.ok) {
    throw new Error(`Failed to download audio: ${audioResponse.status}`);
  }

  const audioBuffer = await audioResponse.arrayBuffer();
  return Buffer.from(audioBuffer);
}

// ─── POST HANDLER ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      text, 
      voice = "Ani"
    } = body;

    if (!WAV_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "WAV_ACCESS_TOKEN not configured" },
        { status: 500 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }

    console.log(`🔊 Generating Armenian audio: "${text}" with voice: ${voice}`);

    // Generate audio
    const audioBuffer = await generateAudio(text, voice);

    // ✅ Return audio as base64 for client playback (ONLINE ONLY)
    const base64Audio = audioBuffer.toString('base64');
    const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`;

    return NextResponse.json({
      success: true,
      voice: voice,
      audio: base64Audio,
      audioUrl: audioDataUrl,
      text: text,
      language: 'hy',
    });

  } catch (error) {
    console.error("❌ WAV generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// ─── GET HANDLER ─────────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "WAV API is running - Online only (no saving)",
    defaultVoice: "Ani",
    availableVoices: AVAILABLE_VOICES,
    supportedLanguages: ['hy'],
  });
}