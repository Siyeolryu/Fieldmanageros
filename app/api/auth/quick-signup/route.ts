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
          signup_source: 'landing_page',
          signup_timestamp: new Date().toISOString(),
        },
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
        // Custom email template data
        // Note: Email templates are configured in Supabase Dashboard
        // This metadata can be used in email templates
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

    // Debugging log for email confirmation status
    console.log('Signup result:', {
      hasUser: !!signUpData.user,
      hasSession: !!signUpData.session,
      userId: signUpData.user?.id,
      userEmail: signUpData.user?.email,
      emailConfirmationSent: signUpData.user && !signUpData.session,
      timestamp: new Date().toISOString(),
    })

    // Check if email confirmation is required
    if (signUpData.user && !signUpData.session) {
      // Email confirmation is required
      console.log('Email confirmation required for:', signUpData.user.email)
      return NextResponse.json({
        success: true,
        user: signUpData.user,
        message: '가입이 완료되었습니다. 이메일을 확인하여 계정을 인증해주세요.',
        requiresEmailConfirmation: true,
        debugInfo: {
          emailSent: true,
          checkSpamFolder: true,
          note: '이메일이 오지 않으면 스팸 메일함을 확인하거나 5분 후 재전송을 시도해주세요.',
        },
      })
    }

    // If session exists, user is automatically signed in (email confirmation disabled)
    if (signUpData.session) {
      console.log('User auto-signed in (email confirmation disabled):', signUpData.user.email)
      return NextResponse.json({
        success: true,
        user: signUpData.user,
        message: '가입이 완료되었습니다',
        autoSignedIn: true,
      })
    }

    // Fallback: try to sign in manually
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: tempPassword,
    })

    if (signInError) {
      console.error('Auto sign-in error:', signInError)
      return NextResponse.json({
        success: true,
        user: signUpData.user,
        message: '가입이 완료되었습니다. 이메일을 확인하여 계정을 인증해주세요.',
        requiresEmailConfirmation: true,
      })
    }

    return NextResponse.json({
      success: true,
      user: signUpData.user,
      message: '가입이 완료되었습니다',
      autoSignedIn: true,
    })
  } catch (error) {
    console.error('Quick signup error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
