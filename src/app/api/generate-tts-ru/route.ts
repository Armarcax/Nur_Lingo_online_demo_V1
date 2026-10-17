// src/app/api/generate-tts-ru/route.ts

import { NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export const runtime = 'nodejs';
export const maxDuration = 60;

const VOICE = 'ru-RU-SvetlanaNeural';

async function generateTts(text: string): Promise<Buffer | null> {
  try {
    const cleanText = text
      .replace(/[“”"]/g, '"')
      .replace(/[‘’']/g, "'")
      .replace(/[—–-]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();

    const tts = new MsEdgeTTS();
    
    await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    
    // ✅ ՆՈՐ API: toStream()-ը վերադարձնում է { audioStream, metadataStream }
    const { audioStream } = tts.toStream(cleanText);
    
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      
      audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));
      audioStream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (buffer.length < 100) {
          reject(new Error('Audio too small'));
        } else {
          resolve(buffer);
        }
      });
      audioStream.on('error', (err: Error) => reject(err));
    });

  } catch (error) {
    console.error('❌ Russian TTS generation failed:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    console.log(`🔊 Russian TTS: "${text}"`);

    const audioBuffer = await generateTts(text);
    
    if (!audioBuffer) {
      return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
    }

    const base64Audio = audioBuffer.toString('base64');
    const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`;

    return NextResponse.json({
      success: true,
      audio: base64Audio,
      audioUrl: audioDataUrl,
      text: text,
      language: 'ru',
    });

  } catch (error) {
    console.error('❌ Russian TTS failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate Russian TTS' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Russian TTS API is running - Online only (Node.js msedge-tts)',
    voice: VOICE,
    language: 'ru',
  });
}