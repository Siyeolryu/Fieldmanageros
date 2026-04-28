import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/health - 헬스체크 엔드포인트
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    // 1. 데이터베이스 연결 확인
    const { error } = await supabase
      .from('companies')
      .select('count')
      .limit(1)

    if (error) {
      throw error
    }

    // 2. 응답 데이터
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Field Manager OS',
      version: '1.0.0',
      checks: {
        database: 'ok',
        api: 'ok'
      }
    }

    return NextResponse.json(healthStatus, { status: 200 })
  } catch (error) {
    console.error('Health check failed:', error)

    const errorStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'Field Manager OS',
      version: '1.0.0',
      checks: {
        database: 'error',
        api: 'ok'
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json(errorStatus, { status: 503 })
  }
}
