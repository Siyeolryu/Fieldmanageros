'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'

function ConfirmEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState('')

  const handleResendEmail = async () => {
    if (!email) {
      setResendError('이메일 주소를 찾을 수 없습니다')
      return
    }

    setIsResending(true)
    setResendError('')
    setResendSuccess(false)

    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) throw error

      setResendSuccess(true)
    } catch (err: any) {
      setResendError(err.message || '이메일 재전송에 실패했습니다')
    } finally {
      setIsResending(false)
    }
  }

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
                    이메일 내의 "이메일 인증하기" 버튼을 클릭해주세요.
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

            {/* Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="font-bold text-yellow-900 text-sm mb-1">이메일이 도착하지 않았나요?</h4>
                  <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                    <li>스팸 또는 프로모션 폴더를 확인해주세요</li>
                    <li>이메일 주소가 정확한지 확인해주세요</li>
                    <li>최대 5분 정도 소요될 수 있습니다</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Resend Email */}
            {resendSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                ✓ 인증 이메일이 재전송되었습니다
              </div>
            )}

            {resendError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {resendError}
              </div>
            )}

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
