import { NextResponse } from 'next/server'

// GET /api/debug - 배포 환경 디버깅 엔드포인트 (개발 환경 전용)
export async function GET() {
  // 프로덕션 환경에서는 접근 차단
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      {
        error: 'Debug endpoint is not available in production',
        message: 'This endpoint is only accessible in development mode'
      },
      { status: 403 }
    )
  }

  try {
    const debugInfo = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
        DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
        DIRECT_URL: process.env.DIRECT_URL ? 'SET' : 'NOT SET',
      },
      runtime: {
        platform: process.platform,
        nodeVersion: process.version,
        cwd: process.cwd(),
      },
      headers: {
        host: process.env.VERCEL_URL || 'localhost',
        region: process.env.VERCEL_REGION || 'local',
      }
    }

    return NextResponse.json(debugInfo, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
