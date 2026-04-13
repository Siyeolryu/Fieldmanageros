'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const supabase = createSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // 프로필 정보 로드
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name || '')
        setCompanyName(profile.company_name || '')
      }
    } catch (err: any) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const supabase = createSupabaseClient()

      // 프로필 업데이트
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          company_name: companyName,
          email: user.email,
          updated_at: new Date().toISOString(),
        })

      if (updateError) throw updateError

      setSuccess('프로필이 성공적으로 업데이트되었습니다.')

      // 3초 후 성공 메시지 제거
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || '프로필 업데이트에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setSuccess('비밀번호 재설정 이메일이 발송되었습니다.')
    } catch (err: any) {
      setError(err.message || '비밀번호 재설정 이메일 발송에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-white">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* 헤더 */}
      <header className="bg-slate-800/60 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">프로필 설정</h1>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              대시보드로 돌아가기
            </Link>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/50 text-green-400">
              {success}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* 이메일 (읽기 전용) */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-slate-500">이메일은 변경할 수 없습니다.</p>
            </div>

            {/* 이름 */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                이름
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="홍길동"
              />
            </div>

            {/* 회사명 */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-300 mb-2">
                회사명
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="회사명"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-sky-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? '저장 중...' : '프로필 저장'}
            </button>
          </form>

          {/* 비밀번호 변경 */}
          <div className="mt-8 pt-8 border-t border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">비밀번호 변경</h2>
            <p className="text-sm text-slate-400 mb-4">
              비밀번호를 변경하려면 이메일로 재설정 링크를 받으세요.
            </p>
            <button
              onClick={handleChangePassword}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              비밀번호 재설정 이메일 받기
            </button>
          </div>

          {/* 계정 정보 */}
          <div className="mt-8 pt-8 border-t border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">계정 정보</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">가입일</span>
                <span className="text-white">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('ko-KR')
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">로그인 방식</span>
                <span className="text-white">
                  {user?.app_metadata?.provider === 'email' ? '이메일/비밀번호' : user?.app_metadata?.provider || '이메일'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
