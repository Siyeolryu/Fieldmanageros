import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: '이메일을 입력해주세요' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 주소를 입력해주세요' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)

    // Sign up the user with Supabase
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: {
          quick_signup: true,
          needs_password_setup: true,
        },
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      console.error('Signup error:', signUpError)

      // Check for specific error types
      if (signUpError.message.includes('already registered')) {
        return NextResponse.json(
          { error: '이미 가입된 이메일입니다. 로그인해주세요.' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: signUpError.message || '회원가입 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }

    if (!signUpData.user) {
      return NextResponse.json(
        { error: '회원가입에 실패했습니다' },
        { status: 500 }
      )
    }

    // Automatically sign in the user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: tempPassword,
    })

    if (signInError) {
      console.error('Auto sign-in error:', signInError)
      // Don't fail the whole request if auto sign-in fails
      // User can still sign in manually
      return NextResponse.json({
        success: true,
        user: signUpData.user,
        message: '가입이 완료되었습니다. 로그인해주세요.',
        requiresLogin: true,
      })
    }

    return NextResponse.json({
      success: true,
      user: signUpData.user,
      message: '가입이 완료되었습니다',
    })
  } catch (error) {
    console.error('Quick signup error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
