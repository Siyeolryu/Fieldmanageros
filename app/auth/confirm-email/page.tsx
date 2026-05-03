'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

function ConfirmEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email')

  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState('')
  const [countdown, setCountdown] = useState(30)
  const [showSpamTip, setShowSpamTip] = useState(false)

  // 카운트다운 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 0)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 10초 후 스팸 메일함 팁 표시
  useEffect(() => {
    const tipTimer = setTimeout(() => {
      setShowSpamTip(true)
    }, 10000)
    return () => clearTimeout(tipTimer)
  }, [])

  // 실시간 인증 상태 체크 (5초마다)
  useEffect(() => {
    const supabase = createSupabaseClient()

    const checkAuthStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email_confirmed_at) {
        toast.success('인증 완료! 환영합니다 🎉')
        router.push('/home')
      }
    }

    const interval = setInterval(checkAuthStatus, 5000)
    return () => clearInterval(interval)
  }, [router])

  const handleResendEmail = async () => {
    if (!email) {
      setResendError('이메일 주소를 찾을 수 없습니다')
      return
    }

    setIsResending(true)
    setResendError('')
    setResendSuccess(false)

    try {
      const res = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (res.ok) {
        setResendSuccess(true)
        setCountdown(30) // 타이머 리셋
        toast.success('이메일을 다시 전송했습니다!')
      } else {
        setResendError(data.error || '이메일 재전송에 실패했습니다')
        toast.error(data.error || '재전송 실패')
      }
    } catch (err) {
      setResendError(err instanceof Error ? err.message : '이메일 재전송에 실패했습니다')
      toast.error('서버 오류가 발생했습니다')
    } finally {
      setIsResending(false)
    }
  }

  // 스팸 메일함 바로가기 링크
  const getSpamFolderLink = (email: string) => {
    if (email.includes('@gmail.com')) {
      return 'https://mail.google.com/mail/u/0/#spam'
    }
    if (email.includes('@naver.com')) {
      return 'https://mail.naver.com/v2/folders/5'
    }
    return null
  }

  const spamLink = email ? getSpamFolderLink(email) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">이메일을 확인해주세요</h1>
          <p className="text-gray-600">가입이 거의 완료되었습니다!</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            {/* Email Address */}
            {email && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-600 font-medium mb-1">전송된 이메일 주소</p>
                <p className="text-blue-900 font-bold break-all">{email}</p>
              </div>
            )}

            {/* 카운트다운 타이머 */}
            {countdown > 0 ? (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#E0E7FF" strokeWidth="4" />
                      <circle
                        cx="24" cy="24" r="20" fill="none"
                        stroke="#2563EB" strokeWidth="4"
                        strokeDasharray={`${(countdown / 30) * 125.6} 125.6`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {countdown}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-blue-900 text-sm">⏱️ 이메일 도착까지 약 {countdown}초</p>
                    <p className="text-xs text-blue-600 mt-1">잠시만 기다려주세요...</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200 animate-pulse">
                <p className="font-bold text-green-900 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  ✅ 이메일이 전송되었습니다!
                </p>
                <p className="text-xs text-green-700 mt-1">메일함을 확인해주세요</p>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">받은 편지함 확인</h3>
                  <p className="text-sm text-gray-600">
                    {email || '입력하신 이메일 주소'}로 인증 메일이 발송되었습니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">인증 링크 클릭</h3>
                  <p className="text-sm text-gray-600">
                    이메일 내의 &quot;이메일 인증하기&quot; 버튼을 클릭해주세요.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">서비스 시작</h3>
                  <p className="text-sm text-gray-600">
                    인증이 완료되면 자동으로 로그인되어 서비스를 이용하실 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6" />

            {/* 스팸 메일함 팁 (10초 후 자동 표시) */}
            {showSpamTip && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 animate-fadeIn">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-bold text-yellow-900 text-sm mb-2">💡 스팸 메일함도 확인해보세요</h4>
                    <ul className="text-xs text-yellow-800 space-y-1 mb-3">
                      <li>• 처음 받는 발신자는 스팸으로 분류될 수 있습니다</li>
                      <li>• 이메일 주소가 정확한지 확인해주세요</li>
                    </ul>
                    {spamLink && (
                      <a
                        href={spamLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg text-xs font-bold hover:bg-yellow-600 transition-colors"
                      >
                        🔗 스팸 메일함 바로 열기
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 30초 경과 후 재전송 버튼 강조 */}
            {countdown === 0 && !resendSuccess && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-5 animate-pulse">
                <div className="text-center">
                  <p className="font-black text-orange-900 text-lg mb-2">
                    🤔 아직 이메일이 도착하지 않았나요?
                  </p>
                  <p className="text-sm text-orange-700 mb-4">
                    클릭 한 번으로 즉시 다시 보내드립니다
                  </p>
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isResending ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        전송 중...
                      </>
                    ) : (
                      <>
                        📨 지금 바로 다시 보내기
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Resend Success/Error Messages */}
            {resendSuccess && (
              <div className="p-4 bg-green-50 border-2 border-green-300 rounded-xl flex items-center gap-3 animate-fadeIn">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-700 font-bold text-sm">
                  ✓ 인증 이메일이 재전송되었습니다!
                </p>
              </div>
            )}

            {resendError && (
              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-center gap-3 animate-fadeIn">
                <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 font-bold text-sm">{resendError}</p>
              </div>
            )}

            {/* 기본 재전송 버튼 (countdown > 0일 때만) */}
            {countdown > 0 && (
              <button
                onClick={handleResendEmail}
                disabled={isResending || !email}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isResending ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    전송 중...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    인증 이메일 다시 보내기
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-3">
          <Link
            href="/auth/login"
            className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            이미 인증하셨나요? <span className="font-bold text-blue-600">로그인하기</span>
          </Link>
          <Link
            href="/"
            className="block text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            메인 페이지로 돌아가기
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 mb-2">도움이 필요하신가요?</p>
          <a
            href="mailto:support@nomupro.com"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            support@nomupro.com
          </a>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  )
}
