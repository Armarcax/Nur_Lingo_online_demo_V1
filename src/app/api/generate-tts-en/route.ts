// src/app/api/generate-tts-en/route.ts

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path'; // ✅ Ավելացվել է
import * as fs from 'fs';     // ✅ Ավելացվել է

const execAsync = promisify(exec);

// ─── CONSTANTS ──────────────────────────────────────────────────────

const VOICE = 'en-US-JennyNeural';

// ─── GENERATE TTS (ONLINE ONLY, NO SAVE) ──────────────────────────

async function generateTts(text: string): Promise<Buffer | null> {
  try {
    const cleanText = text
      .replace(/[“”"]/g, '"')
      .replace(/[‘’']/g, "'")
      .replace(/[—–-]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
    
    const tempFile = path.join(process.cwd(), 'temp', `en_${Date.now()}.mp3`);
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const command = `edge-tts --voice "${VOICE}" --text "${cleanText.replace(/"/g, '\\"')}" --write-media "${tempFile}"`;
    
    await execAsync(command, { timeout: 30000 });
    
    if (!fs.existsSync(tempFile)) {
      throw new Error('File not created');
    }
    
    const stats = fs.statSync(tempFile);
    if (stats.size < 100) {
      throw new Error('File too small');
    }
    
    const buffer = fs.readFileSync(tempFile);
    fs.unlinkSync(tempFile);
    return buffer;
    
  } catch (error) {
    console.error('❌ TTS generation failed:', error);
    return null;
  }
}

// ─── POST HANDLER ──────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    console.log(`🔊 English TTS: "${text}"`);

    // Generate audio
    const audioBuffer = await generateTts(text);
    
    if (!audioBuffer) {
      return NextResponse.json(
        { error: 'Failed to generate audio' },
        { status: 500 }
      );
    }

    // ✅ Return audio as base64 for client playback (ONLINE ONLY)
    const base64Audio = audioBuffer.toString('base64');
    const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`;

    return NextResponse.json({
      success: true,
      audio: base64Audio,
      audioUrl: audioDataUrl,
      text: text,
      language: 'en',
    });

  } catch (error) {
    console.error('❌ English TTS failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate English TTS' },
      { status: 500 }
    );
  }
}

// ─── GET HANDLER ──────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'English TTS API is running - Online only (no saving)',
    voice: VOICE,
    language: 'en',
  });
}