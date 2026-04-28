'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'

type UserType = 'manager' | 'both' | 'worker'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [userType, setUserType] = useState<UserType>('both')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      setLoading(false)
      return
    }

    try {
      const supabase = createSupabaseClient()

      // 회원가입
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_name: companyName,
            user_type: userType,
          },
        },
      })

      if (signupError) throw signupError

      if (data.user) {
        setSuccess(true)

        // userType에 따라 다른 페이지로 이동
        setTimeout(() => {
          if (userType === 'both' || userType === 'worker') {
            // 근로자 정보 입력 필요
            router.push(`/onboarding/profile?type=${userType}`)
          } else {
            // 관리자만 선택한 경우 바로 로그인 페이지
            router.push('/auth/login')
          }
        }, 2000)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '회원가입에 실패했습니다.'
      setError(message)
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
        provider: provider as 'kakao' | 'naver',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '소셜 로그인에 실패했습니다.'
      setError(message)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-700/50 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">회원가입 완료!</h2>
            <p className="text-slate-400 mb-4">
              이메일을 확인하여 계정을 인증해주세요.
            </p>
            <p className="text-sm text-slate-500">
              잠시 후 로그인 페이지로 이동합니다...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">회원가입</h1>
          <p className="text-slate-400">건설 현장 관리 시스템에 가입하세요</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-700/50">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-300 mb-2">
                회사명
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="회사명을 입력하세요"
              />
            </div>

            {/* 역할 선택 */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                주요 역할을 선택해주세요
              </label>
              <div className="space-y-3">
                <label className="flex items-start p-4 bg-slate-900/30 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors">
                  <input
                    type="radio"
                    name="userType"
                    value="manager"
                    checked={userType === 'manager'}
                    onChange={(e) => setUserType(e.target.value as UserType)}
                    className="mt-1 w-4 h-4 text-sky-500 bg-slate-900 border-slate-600 focus:ring-sky-500 focus:ring-2"
                  />
                  <div className="ml-3 flex-1">
                    <span className="block text-white font-medium">관리자만</span>
                    <span className="block text-sm text-slate-400 mt-1">현장 운영 및 인력 관리만 담당 (직접 작업 안 함)</span>
                  </div>
                </label>

                <label className="flex items-start p-4 bg-slate-900/30 border-2 border-sky-500/50 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors">
                  <input
                    type="radio"
                    name="userType"
                    value="both"
                    checked={userType === 'both'}
                    onChange={(e) => setUserType(e.target.value as UserType)}
                    className="mt-1 w-4 h-4 text-sky-500 bg-slate-900 border-slate-600 focus:ring-sky-500 focus:ring-2"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="block text-white font-medium">관리자 + 근로자</span>
                      <span className="px-2 py-0.5 bg-sky-500/20 text-sky-400 text-xs font-bold rounded">추천</span>
                    </div>
                    <span className="block text-sm text-slate-400 mt-1">현장을 운영하면서 직접 작업도 투입 (소규모 팀장)</span>
                  </div>
                </label>

                <label className="flex items-start p-4 bg-slate-900/30 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors">
                  <input
                    type="radio"
                    name="userType"
                    value="worker"
                    checked={userType === 'worker'}
                    onChange={(e) => setUserType(e.target.value as UserType)}
                    className="mt-1 w-4 h-4 text-sky-500 bg-slate-900 border-slate-600 focus:ring-sky-500 focus:ring-2"
                  />
                  <div className="ml-3 flex-1">
                    <span className="block text-white font-medium">근로자만</span>
                    <span className="block text-sm text-slate-400 mt-1">다른 팀의 근로자로 등록됨</span>
                  </div>
                </label>
              </div>

              {userType === 'both' && (
                <div className="mt-3 p-3 bg-sky-500/10 border border-sky-500/30 rounded-lg">
                  <p className="text-xs text-sky-300">
                    <span className="font-bold">💡 안내:</span> 관리자+근로자를 선택하시면 현장을 만들고 다른 근로자를 관리할 수 있으며, 본인의 출퇴근과 급여도 기록할 수 있습니다.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="최소 6자 이상"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-sky-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">또는</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => handleSocialLogin('kakao')}
                disabled={loading}
                className="w-full py-3 bg-[#FEE500] text-[#000000] font-semibold rounded-lg hover:bg-[#FDD835] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
                </svg>
                카카오로 시작하기
              </button>

              <button
                onClick={() => handleSocialLogin('naver')}
                disabled={loading}
                className="w-full py-3 bg-[#03C75A] text-white font-semibold rounded-lg hover:bg-[#02B350] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
                </svg>
                네이버로 시작하기
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-400">이미 계정이 있으신가요? </span>
            <Link href="/auth/login" className="text-sky-400 hover:text-sky-300 font-medium">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
