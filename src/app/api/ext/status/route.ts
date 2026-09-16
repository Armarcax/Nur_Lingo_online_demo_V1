// src/app/api/ext/status/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    extension: {
      version: '1.0.0',
      status: 'active',
      features: ['audio', 'dictionary', 'lessons', 'offline'],
    },
    server: {
      status: 'online',
      timestamp: new Date().toISOString(),
    }
  });
}