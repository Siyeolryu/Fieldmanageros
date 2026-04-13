import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    DATABASE_URL: process.env.DATABASE_URL ? '설정됨' : '미설정',
    DIRECT_URL: process.env.DIRECT_URL ? '설정됨' : '미설정',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '미설정',
    NODE_ENV: process.env.NODE_ENV,
  })
}
