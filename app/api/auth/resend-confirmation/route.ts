import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '이메일을 입력해주세요' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()

    // Resend confirmation email using Supabase's resend method
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Resend confirmation error:', error)

      // Check if user already confirmed
      if (error.message.includes('already confirmed')) {
        return NextResponse.json(
          { error: '이미 인증이 완료된 계정입니다. 로그인해주세요.' },
          { status: 400 }
        )
      }

      // Check if email not found
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: '가입되지 않은 이메일입니다. 먼저 회원가입을 진행해주세요.' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: '확인 이메일 재전송 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '확인 이메일을 다시 전송했습니다. 메일함을 확인해주세요.',
    })
  } catch (error) {
    console.error('Resend confirmation API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
