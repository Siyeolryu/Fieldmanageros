'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'

type UserType = 'both' | 'worker'

function ProfileSetupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType = (searchParams.get('type') as UserType) || 'both'

  const [fullName, setFullName] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('사용자 인증이 필요합니다')
      }

      // profiles 테이블 업데이트
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // userType에 따라 추가 정보 저장
      // 현재는 metadata에 저장하고, 나중에 현장 생성 시 workers 테이블에 추가
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          user_type: userType,
          hourly_rate: parseInt(hourlyRate),
          bank_name: bankName,
          bank_account: bankAccount,
        }
      })

      if (metadataError) throw metadataError

      // 완료 후 로그인 페이지로 이동
      router.push('/auth/login?signup=complete')
    } catch (err: any) {
      setError(err.message || '프로필 설정에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">프로필 설정</h1>
          <p className="text-slate-400">근로자 정보를 입력해주세요</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-700/50">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* 세무 안내 */}
          {userType === 'both' && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-amber-400 font-bold text-sm mb-1">세무 안내</p>
                  <p className="text-amber-300/80 text-xs leading-relaxed">
                    본인에게 급여를 지급하는 경우:
                  </p>
                  <ul className="text-amber-300/80 text-xs mt-2 space-y-1 list-disc list-inside">
                    <li>근로소득세 원천징수 필요</li>
                    <li>4대보험 신고 (고용보험 제외)</li>
                    <li>종합소득세 신고 시 사업소득과 합산</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                이름 *
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="홍길동"
              />
            </div>

            <div>
              <label htmlFor="hourlyRate" className="block text-sm font-medium text-slate-300 mb-2">
                시급 (원) *
              </label>
              <input
                id="hourlyRate"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                required
                min="0"
                step="1000"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="250000"
              />
              <p className="mt-1 text-xs text-slate-500">
                {hourlyRate && `일당 (8시간): ${(parseInt(hourlyRate) * 8).toLocaleString()}원`}
              </p>
            </div>

            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-slate-300 mb-2">
                은행명 *
              </label>
              <select
                id="bankName"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="">은행을 선택하세요</option>
                <option value="KB국민은행">KB국민은행</option>
                <option value="신한은행">신한은행</option>
                <option value="우리은행">우리은행</option>
                <option value="하나은행">하나은행</option>
                <option value="NH농협은행">NH농협은행</option>
                <option value="IBK기업은행">IBK기업은행</option>
                <option value="카카오뱅크">카카오뱅크</option>
                <option value="토스뱅크">토스뱅크</option>
                <option value="케이뱅크">케이뱅크</option>
                <option value="SC제일은행">SC제일은행</option>
                <option value="씨티은행">씨티은행</option>
              </select>
            </div>

            <div>
              <label htmlFor="bankAccount" className="block text-sm font-medium text-slate-300 mb-2">
                계좌번호 *
              </label>
              <input
                id="bankAccount"
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="123-456-789012"
              />
              <p className="mt-1 text-xs text-slate-500">
                급여가 입금될 계좌번호를 입력하세요
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-sky-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? '저장 중...' : '완료'}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                disabled={loading}
                className="w-full py-3 bg-slate-700/50 text-slate-300 font-medium rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                나중에 설정하기
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              입력하신 정보는 암호화되어 안전하게 보관됩니다
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="text-white">로딩 중...</div>
      </div>
    }>
      <ProfileSetupContent />
    </Suspense>
  )
}
