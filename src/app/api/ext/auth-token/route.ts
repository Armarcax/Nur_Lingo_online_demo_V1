// src/app/api/ext/auth-token/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization');
    
    // Զարգացման ռեժիմում վերադարձնել test token
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      return NextResponse.json({
        success: true,
        token: 'dev-test-token-12345',
        expiresIn: 3600,
        type: 'development',
      });
    }

    // Production-ում ստուգել իրական token-ը
    // ... token-ի ստացման տրամաբանությունը
    
    return NextResponse.json({
      success: false,
      error: 'Not implemented in production',
      token: null,
    }, { status: 501 });
    
  } catch (error) {
    console.error('Auth token error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get auth token',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action } = body;
    
    if (action === 'refresh') {
      // Token-ի թարմացում
      return NextResponse.json({
        success: true,
        token: `refreshed-token-${Date.now()}`,
        expiresIn: 3600,
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action',
    }, { status: 400 });
    
  } catch (error) {
    console.error('Auth token POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}