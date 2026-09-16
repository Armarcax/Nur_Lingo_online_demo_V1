// src/app/api/ext/activate/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Extension-ի ակտիվացման տրամաբանություն
    return NextResponse.json({ 
      success: true, 
      message: 'Extension activated successfully',
      data: {
        activated: true,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Extension activation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Activation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    status: 'active',
    message: 'Extension API is running'
  });
}