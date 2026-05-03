'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/store'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function LandingPage() {
  const router = useRouter()
  const { user, setUser, setGuestMode } = useAuthStore()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({ 
          id: user.id, 
          email: user.email!, 
          fullName: user.user_metadata?.full_name 
        })
      }
    }
    fetchUser()
  }, [setUser])

  // Auto-redirect removed: Allow all users to view landing page
  // Logged-in users can navigate to dashboard via header button

  const handleSocialLogin = async (provider: 'kakao' | 'naver') => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.auth.signInWithOAuth({
        // @ts-ignore - Supabase doesn't support naver provider type
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '소셜 서버 통신 중 오류가 발생했습니다.'
      setErrorMessage(message)
      setIsLoading(false)
    }
  }

  const handleQuickSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setErrorMessage('올바른 이메일 주소를 입력해주세요')
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/quick-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (res.ok) {
        if (data.requiresEmailConfirmation) {
          // Redirect to email confirmation page
          router.push(`/auth/confirm-email?email=${encodeURIComponent(email)}`)
        } else if (data.autoSignedIn) {
          // Redirect to dashboard
          toast.success('환영합니다! 대시보드로 이동합니다.')
          router.push('/home')
        } else {
          // 기존 계정이면 로그인 성공 처리
          toast.success('로그인되었습니다.')
          router.push('/home')
        }
      } else {
        if (res.status === 409) {
          setErrorMessage('이미 가입된 이메일입니다. 아래 로그인 버튼을 이용해주세요.')
        } else {
          setErrorMessage(data.error || '가입 중 오류가 발생했습니다')
        }
      }
    } catch (error) {
      console.error('Quick signup error:', error)
      setErrorMessage('서버 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-black text-blue-600 tracking-tight">노무PRO</h1>
          <div className="flex items-center gap-4">
{user ? (
              <Link
                href="/home"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
              >
                대시보드로 가기
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setGuestMode(true)
                    router.push('/home')
                    toast.success('게스트 모드로 입장했습니다. 데이터는 브라우저에만 저장됩니다.')
                  }}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  둘러보기
                </button>
                <button
                  onClick={() => {
                    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement
                    emailInput?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    setTimeout(() => emailInput?.focus(), 500)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                >
                  시작하기
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Hero Text */}
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
              건설 현장 노무 관리의 새로운 기준
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
              수기 노임대장,<br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                이제 그만 쓰세요
              </span>
            </h2>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              월말마다 3시간 걸리던 노임대장 작성,<br className="hidden md:block" />
              이제 클릭 한 번이면 끝납니다.
            </p>

            {/* Before/After Comparison */}
            <div className="mt-8 p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2 font-medium">기존 방법</p>
                  <p className="text-3xl md:text-4xl font-black text-gray-900">3시간</p>
                  <p className="text-xs text-gray-500 mt-1">월말 정산 시간</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600 mb-2 font-medium">노무PRO</p>
                  <p className="text-3xl md:text-4xl font-black text-blue-600">5분</p>
                  <p className="text-xs text-blue-500 mt-1">자동 생성</p>
                </div>
              </div>
            </div>

            {/* Quick Signup Form */}
            <form onSubmit={handleQuickSignup} className="space-y-4" id="quick-signup">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소 입력"
                  className="flex-1 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isLoading ? '처리 중...' : '3분 만에 무료 시작 →'}
                </button>
              </div>
              {errorMessage && (
                <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
              )}

              {/* Social Login Section */}
              <div className="pt-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">간편 로그인</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleSocialLogin('kakao')}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-3.5 bg-[#FEE500] text-[#3c1e1e] font-bold rounded-xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
                    </svg>
                    {isLoading ? '로그인 중...' : '카카오 로그인'}
                  </button>
                  <button
                    onClick={() => handleSocialLogin('naver')}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-3.5 bg-[#03C75A] text-white font-bold rounded-xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
                    </svg>
                    {isLoading ? '로그인 중...' : '네이버 로그인'}
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                기존 계정이 있으신가요? <Link href="/auth/signup" className="text-blue-600 font-bold hover:underline">상세 가입하기</Link>
              </p>
            </form>

            {/* Social Proof - Removed for production launch */}
          </div>

          {/* Right - Feature Preview */}
          <div className="relative">
            {/* Decorative gradient orbs */}
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl" />

            {/* Preview Cards */}
            <div className="relative space-y-6">
              <div className="p-6 bg-white rounded-3xl shadow-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">실시간 근로자 관리</h3>
                    <p className="text-sm text-gray-500">출퇴근, 일당, 보험 한눈에</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                </div>
              </div>

              <div className="p-6 bg-white rounded-3xl shadow-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">AI 공사비 분석</h3>
                    <p className="text-sm text-gray-500">지출 패턴 자동 분석</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-green-50 rounded-xl text-center">
                    <p className="text-xs text-green-600 font-bold mb-1">안정</p>
                    <p className="text-lg font-black text-green-700">92%</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl text-center">
                    <p className="text-xs text-blue-600 font-bold mb-1">효율</p>
                    <p className="text-lg font-black text-blue-700">87%</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl text-center">
                    <p className="text-xs text-indigo-600 font-bold mb-1">예측</p>
                    <p className="text-lg font-black text-indigo-700">95%</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-xl text-white">
                <h3 className="font-bold text-lg mb-2">자동 신고 알림</h3>
                <p className="text-blue-100 text-sm mb-4">4대보험 신고 기한을 놓치지 않도록 자동으로 알려드립니다</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">다음 신고일: 2026년 5월 10일</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              노무 관리의 모든 것
            </h2>
            <p className="text-lg text-gray-600">
              건설 현장에 필요한 모든 기능을 하나의 플랫폼에서
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-gray-50 rounded-3xl hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">출퇴근 관리</h3>
              <p className="text-gray-600 leading-relaxed">
                달력 기반 직관적인 인터페이스로 근로자의 출퇴근 현황을 한눈에 파악하고 관리하세요.
              </p>
            </div>

            <div className="p-8 bg-gray-50 rounded-3xl hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">노임 계산</h3>
              <p className="text-gray-600 leading-relaxed">
                복잡한 일당, 시급, 야간수당 계산을 자동화하고 정확한 노임대장을 생성하세요.
              </p>
            </div>

            <div className="p-8 bg-gray-50 rounded-3xl hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">보험 신고</h3>
              <p className="text-gray-600 leading-relaxed">
                4대보험 가입 대상자를 자동으로 식별하고 신고 기한을 알림으로 관리하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section - Removed for production launch */}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-black text-lg mb-4">노무PRO</h3>
              <p className="text-sm leading-relaxed">
                건설 현장 인건비 신고 & 소득 관리 플랫폼
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-4">제품</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">기능 소개</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">요금제</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">사용 사례</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-4">지원</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">도움말</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">고객센터</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-4">회사</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">회사 소개</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">이용약관</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-sm">
              &copy; 2026 노무PRO. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
