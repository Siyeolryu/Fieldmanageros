'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'

// --- Custom Components ---

const Logo = () => (
  <div className="flex flex-col items-center gap-2 mb-8 animate-in fade-in slide-in-from-top duration-1000">
    <div className="relative w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <svg className="w-10 h-10 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14" />
        <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
        <path d="M7 9h2" />
        <path d="M7 13h2" />
        <path d="M15 9h2" />
        <path d="M15 13h2" />
        <circle cx="12" cy="5" r="1" className="fill-amber-500" />
      </svg>
    </div>
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold tracking-tight text-white">
        노무<span className="text-amber-500">Pro</span>
      </h1>
      <div className="h-0.5 w-8 bg-amber-500 rounded-full mt-1" />
    </div>
  </div>
)

const SocialButton = ({ 
  provider, 
  onClick, 
  loading, 
  children, 
  bgColor, 
  textColor, 
  icon 
}: { 
  provider: string, 
  onClick: () => void, 
  loading: boolean, 
  children: React.ReactNode,
  bgColor: string,
  textColor: string,
  icon: React.ReactNode
}) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`w-full py-3.5 ${bgColor} ${textColor} font-bold rounded-xl shadow-lg hover:brightness-95 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50`}
  >
    {icon}
    {children}
  </button>
)

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const signupComplete = searchParams.get('signup') === 'complete'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(signupComplete)

  useEffect(() => {
    if (signupComplete) {
      const timer = setTimeout(() => setShowSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [signupComplete])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/home')
      router.refresh()
    } catch (err: any) {
      setError(err.message || '로그인 정보를 다시 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'kakao' | 'naver') => {
    setLoading(true)
    setError('')

    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err: any) {
      setError(err.message || '소셜 서버 통신 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-amber-600/10 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

      <div className="relative max-w-md w-full px-6 py-12 animate-in fade-in zoom-in duration-500">
        <Logo />

        <div className="glass-card p-8 md:p-10 rounded-[2rem]">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-1">환영합니다</h2>
            <p className="text-sm text-slate-400">현장 관리의 새로운 표준, 노무Pro 서비스입니다.</p>
          </div>

          {showSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              회원가입이 완료되었습니다! 로그인해주세요.
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="group">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                전자우편
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 transition-all outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10"
                  placeholder="manager@nomupro.com"
                />
              </div>
            </div>

            <div className="group">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 transition-all outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-amber-500 text-slate-950 font-black rounded-xl hover:bg-amber-400 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-slate-950" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  본인 확인 중...
                </span>
              ) : '시스템 접속'}
            </button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
              <div className="h-px flex-1 bg-slate-800" />
              <span>간편 접속</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <SocialButton
                provider="kakao"
                onClick={() => handleSocialLogin('kakao')}
                loading={loading}
                bgColor="bg-[#FEE500]"
                textColor="text-slate-900"
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
                  </svg>
                }
              >
                카카오 계정으로 계속하기
              </SocialButton>

              <SocialButton
                provider="naver"
                onClick={() => handleSocialLogin('naver')}
                loading={loading}
                bgColor="bg-[#03C75A]"
                textColor="text-white"
                icon={
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
                  </svg>
                }
              >
                네이버 계정으로 계속하기
              </SocialButton>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <span className="text-sm text-slate-500">아직 계정이 없으신가요? </span>
            <Link href="/auth/signup" className="text-sm text-amber-500 hover:text-amber-400 font-bold ml-1 hover:underline underline-offset-4 transition-all">
              회원가입
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-slate-600 uppercase tracking-[0.2em]">
          &copy; 2026 NomuPro Industrial OS. All Rights Reserved.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="text-white">로딩 중...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
