'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import CalendarView from '@/app/components/calendar/CalendarView'
import SiteSelector from '@/app/components/ui/SiteSelector'
import { useAppStore, useAuthStore } from '@/lib/store'
import Link from 'next/link'
import CostChart from '@/app/components/dashboard/CostChart'
import Modal from '@/app/components/ui/Modal'
import RiskRadar from '@/app/components/dashboard/RiskRadar'
import CostSplitterModal from '@/app/components/dashboard/CostSplitterModal'
import TaxNotification from '@/app/components/dashboard/TaxNotification'

export default function HomePage() {
  const router = useRouter()
  const { selectedSite } = useAppStore()
  const { user, activeRole, setActiveRole } = useAuthStore()

  // Auth check - redirect to landing page if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  const [stats, setStats] = useState<{
    totalWorkers: number
    todayAttendance: number
    monthlyCost: number
    riskWorkers: { name: string, days: number }[]
    chartData: any[]
  }>({
    totalWorkers: 0,
    todayAttendance: 0,
    monthlyCost: 0,
    riskWorkers: [],
    chartData: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isSplitterOpen, setIsSplitterOpen] = useState(false)
  const [isAddAttendanceOpen, setIsAddAttendanceOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const fetchStats = async () => {
    if (!selectedSite) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/dashboard/stats?siteId=${selectedSite.id}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [selectedSite])

  // Show loading while checking auth
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[family-name:var(--font-geist-sans)]">
      {/* 상단 네비게이션 */}
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black text-blue-600 tracking-tight">노무PRO</h1>
            <nav className="hidden md:flex items-center gap-6">
              {activeRole === 'worker' ? (
                /* 근로자 모드 메뉴 */
                <>
                  <Link href="/worker/my-info" className="text-sm font-bold text-gray-900 border-b-2 border-green-600 pb-1">나의 급여</Link>
                  <Link href="/home" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">홈</Link>
                </>
              ) : (
                /* 관리자 모드 메뉴 */
                <>
                  <Link href="/home" className="text-sm font-bold text-gray-900 border-b-2 border-blue-600 pb-1">대시보드</Link>
                  <Link href="/workers" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">근로자 관리</Link>
                  <Link href="/payroll" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">노임대장</Link>
                  <Link href="/corrections" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">수정 요청</Link>
                  {/* 전체 메뉴 바로가기 */}
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    전체 메뉴
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <SiteSelector />

            {/* 역할 표시 및 전환 (userType이 'both'인 경우만) */}
            {user?.userType === 'both' && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <span className="text-xs font-semibold text-gray-600">
                  {activeRole === 'manager' ? '관리자 모드' : '근로자 모드'}
                </span>
                <button
                  onClick={() => {
                    setActiveRole(activeRole === 'manager' ? 'worker' : 'manager')
                    toast.success(`${activeRole === 'manager' ? '근로자' : '관리자'} 모드로 전환되었습니다`)
                  }}
                  className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                  title="역할 전환"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </button>
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden hover:bg-gray-200 transition-colors"
              >
                <span className="text-xs font-bold text-gray-600">{user?.fullName?.[0] || 'U'}</span>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900">{user?.fullName || '사용자'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    {user?.userType === 'both' && (
                      <div className="mt-2 text-xs font-semibold text-blue-600">
                        현재: {activeRole === 'manager' ? '관리자 모드' : '근로자 모드'}
                      </div>
                    )}
                  </div>

                  {/* 역할 전환 (userType이 'both'인 경우만) */}
                  {user?.userType === 'both' && (
                    <button
                      onClick={() => {
                        setActiveRole(activeRole === 'manager' ? 'worker' : 'manager')
                        toast.success(`${activeRole === 'manager' ? '근로자' : '관리자'} 모드로 전환되었습니다`)
                        setIsProfileMenuOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-semibold"
                    >
                      {activeRole === 'manager' ? '근로자 모드로 전환' : '관리자 모드로 전환'}
                    </button>
                  )}

                  <Link
                    href="/dashboard/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    프로필 설정
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    대시보드
                  </Link>
                  <button
                    onClick={async () => {
                      const { createSupabaseClient } = await import('@/lib/supabase/client')
                      const supabase = createSupabaseClient()
                      await supabase.auth.signOut()
                      router.push('/')
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* 좌측 요약 정보 */}
          <div className="lg:col-span-4 space-y-6">
            {/* Phase 6: 세무 알림 */}
            <TaxNotification
              workerCount={stats.totalWorkers}
              ownerIncluded={true}
            />

            <div className={`p-6 bg-white rounded-3xl shadow-sm border border-gray-100 transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">현재 현장 현황</h3>
              <div className="space-y-1 mb-6">
                <p className="text-2xl font-black text-gray-900 leading-tight truncate">
                  {selectedSite?.name || '현장을 선택하세요'}
                </p>
                <p className="text-xs text-gray-500 font-bold">
                  {selectedSite?.location || '위치 정보 없음'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase">총 근로자</p>
                  <p className="text-xl font-black text-gray-900">{stats.totalWorkers}명</p>
                </div>
                <div className="p-4 bg-blue-50">
                  <p className="text-[10px] font-bold text-blue-400 mb-1 uppercase">오늘 출근</p>
                  <p className="text-xl font-black text-blue-600">{stats.todayAttendance}명</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase">이번 달 누적 노무비</p>
                  <p className="text-xl font-black text-gray-900">₩{stats.monthlyCost.toLocaleString()}</p>
              </div>
            </div>

            <div className="h-[300px]">
                <CostChart data={stats.chartData} />
            </div>

            {/* 보험료 리스크 레이더 */}
            <RiskRadar workers={stats.riskWorkers} />

            <div className="p-6 bg-blue-600 rounded-3xl shadow-lg shadow-blue-200 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-1">AI 공사비 분석</h3>
                <p className="text-blue-100 text-sm leading-relaxed mb-4">
                  현재 인원 투입 현황을 분석한 결과 공사비 지출이 <span className="font-bold underline">안정</span> 수준입니다.
                </p>
                <button
                    onClick={() => setIsReportOpen(true)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-bold transition-all"
                >
                  관점 리포트 보기
                </button>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            </div>
          </div>

          {/* 달력 영역 */}
          <div className="lg:col-span-8">
            <div className="h-full min-h-[650px] bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <CalendarView />
            </div>
          </div>

        </div>
      </main>

      {/* AI 리포트 모달 (임시 레이아웃) */}
      <Modal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="AI 공사비 분석 관점 리포트"
      >
        <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-sm text-blue-700 font-bold leading-relaxed">
                    "현재 현장의 노무비 지출은 지난달 동일 기간 대비 약 <span className="underline">4.2% 감소</span>했습니다.
                    인건비 효율이 높은 상태이며, 현재 추세 유지 시 예상 월 총액은 예산 범위 내에 있을 것으로 판단됩니다."
                </p>
            </div>

            <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase">분석 포인트</h4>
                <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-sm">
                        <span className="text-gray-600">지연 가능성</span>
                        <span className="font-bold text-green-600">매우 낮음</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-sm">
                        <span className="text-gray-600">지역 평균 단가 대비</span>
                        <span className="font-bold text-gray-900">-2% (적정)</span>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-50 space-y-3">
                <button
                    onClick={() => {
                        setIsReportOpen(false)
                        setIsSplitterOpen(true)
                    }}
                    className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    AI 공사비 역산 도구 실행
                </button>
                <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md" onClick={() => setIsReportOpen(false)}>
                    확인
                </button>
            </div>
        </div>
      </Modal>

      <CostSplitterModal
        isOpen={isSplitterOpen}
        onClose={() => setIsSplitterOpen(false)}
      />

      {/* 출근 기록 추가 모달 */}
      <Modal
        isOpen={isAddAttendanceOpen}
        onClose={() => setIsAddAttendanceOpen(false)}
        title="출근 기록 추가"
      >
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-700 font-medium">
              빠른 출근 기록을 추가하시려면 근로자와 날짜를 선택하세요.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">현장</label>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-900">
                  {selectedSite?.name || '현장을 선택하세요'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">근로자 선택</label>
              <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>근로자를 선택하세요</option>
              </select>
              <p className="mt-2 text-xs text-gray-500">
                근로자를 먼저 등록해주세요. <Link href="/workers" className="text-blue-600 hover:underline">근로자 관리 →</Link>
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">날짜</label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">근무 시간</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  defaultValue="08:00"
                  className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="time"
                  defaultValue="17:00"
                  className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <button
              onClick={() => {
                // TODO: API 호출하여 출근 기록 저장
                setIsAddAttendanceOpen(false)
              }}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              출근 기록 추가
            </button>
            <button
              onClick={() => setIsAddAttendanceOpen(false)}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      </Modal>

      {/* 하단 탭 바 (모바일) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-6 flex items-center justify-between z-40 pb-safe">
        <Link href="/home" className="flex flex-col items-center gap-1 text-blue-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <span className="text-[10px] font-bold">홈</span>
        </Link>
        <Link href="/workers" className="flex flex-col items-center gap-1 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          <span className="text-[10px] font-bold">근로자</span>
        </Link>
        <div className="relative -top-6">
          <button
            onClick={() => setIsAddAttendanceOpen(true)}
            className="w-14 h-14 bg-blue-600 rounded-2xl shadow-lg shadow-blue-300 flex items-center justify-center text-white transform active:scale-90 transition-transform hover:bg-blue-700"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </button>
        </div>
        <Link href="/payroll" className="flex flex-col items-center gap-1 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span className="text-[10px] font-bold">대장</span>
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="text-[10px] font-bold">메뉴</span>
        </Link>
      </div>
    </div>
  )
}
