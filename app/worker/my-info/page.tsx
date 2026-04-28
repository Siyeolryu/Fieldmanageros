'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import Link from 'next/link'
import CorrectionRequestModal from '@/app/components/corrections/CorrectionRequestModal'

interface PayrollData {
  id: string
  year: number
  month: number
  totalWorkDays: number
  totalHours: number
  basePay: number
  weeklyHolidayPay: number
  overtimePay: number
  totalPay: number
  healthInsurance: number
  pensionInsurance: number
  employmentInsurance: number
  incomeTax: number
  totalDeduction: number
  netPay: number
  paidAt: string | null
}

interface AttendanceData {
  id: string
  date: string
  hoursWorked: number
  isWeeklyHoliday: boolean
  notes: string | null
}

export default function WorkerMyInfoPage() {
  const router = useRouter()
  const { user, activeRole } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [payrollData, setPayrollData] = useState<PayrollData[]>([])
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceData & { worker: { name: string } } | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    // 근로자 모드가 아니면 홈으로 리다이렉트
    if (activeRole !== 'worker') {
      toast.error('근로자 모드에서만 접근 가능합니다')
      router.push('/home')
      return
    }

    fetchMyData()
  }, [user, activeRole, router, selectedMonth])

  const fetchMyData = async () => {
    setLoading(true)
    try {
      const year = selectedMonth.getFullYear()
      const month = selectedMonth.getMonth() + 1

      // 급여 데이터 조회
      const payrollRes = await fetch(`/api/worker/my-payroll?year=${year}&month=${month}`)
      if (payrollRes.ok) {
        const payrollResult = await payrollRes.json()
        setPayrollData(payrollResult.data || [])
      }

      // 출근 기록 조회
      const attendanceRes = await fetch(`/api/worker/my-attendance?year=${year}&month=${month}`)
      if (attendanceRes.ok) {
        const attendanceResult = await attendanceRes.json()
        setAttendanceData(attendanceResult.data || [])
      }
    } catch (error) {
      console.error('데이터 조회 실패:', error)
      toast.error('데이터를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const currentPayroll = payrollData[0]
  const totalGongsu = attendanceData.reduce((sum, record) => sum + (record.hoursWorked / 8), 0)

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[family-name:var(--font-geist-sans)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black text-blue-600 tracking-tight">노무PRO</h1>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-xl border border-green-200">
              <span className="text-xs font-semibold text-green-700">근로자 모드</span>
            </div>
          </div>
          <Link
            href="/home"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            홈으로
          </Link>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900">나의 급여 정보</h2>
          <p className="text-gray-500 font-medium mt-2">
            {user?.fullName || '근로자'}님의 근로 기록 및 급여 내역을 확인하세요
          </p>
        </div>

        {/* 월 선택 */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => {
              const newDate = new Date(selectedMonth)
              newDate.setMonth(newDate.getMonth() - 1)
              setSelectedMonth(newDate)
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-xl font-bold text-gray-900">
            {selectedMonth.getFullYear()}년 {selectedMonth.getMonth() + 1}월
          </div>
          <button
            onClick={() => {
              const newDate = new Date(selectedMonth)
              newDate.setMonth(newDate.getMonth() + 1)
              setSelectedMonth(newDate)
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 급여 요약 */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">급여 요약</h3>
                {currentPayroll ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">근로일수</span>
                      <span className="text-sm font-bold text-gray-900">{currentPayroll.totalWorkDays}일</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">총 근무시간</span>
                      <span className="text-sm font-bold text-gray-900">{currentPayroll.totalHours}시간</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">총 공수</span>
                      <span className="text-sm font-bold text-gray-900">{totalGongsu.toFixed(1)}공수</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">기본급</span>
                      <span className="text-sm font-bold text-blue-600">{currentPayroll.basePay.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">주휴수당</span>
                      <span className="text-sm font-bold text-blue-600">{currentPayroll.weeklyHolidayPay.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">연장수당</span>
                      <span className="text-sm font-bold text-blue-600">{currentPayroll.overtimePay.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-blue-50 rounded-xl px-3 mt-2">
                      <span className="font-bold text-gray-900">총 지급액</span>
                      <span className="text-lg font-black text-blue-600">{currentPayroll.totalPay.toLocaleString()}원</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">급여 데이터가 없습니다</p>
                )}
              </div>

              {/* 공제 내역 */}
              {currentPayroll && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">공제 내역</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">건강보험 (3.545%)</span>
                      <span className="text-sm font-bold text-red-600">-{currentPayroll.healthInsurance.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">국민연금 (4.5%)</span>
                      <span className="text-sm font-bold text-red-600">-{currentPayroll.pensionInsurance.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">고용보험 (0.9%)</span>
                      <span className="text-sm font-bold text-red-600">-{currentPayroll.employmentInsurance.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">소득세</span>
                      <span className="text-sm font-bold text-red-600">-{currentPayroll.incomeTax.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-red-50 rounded-xl px-3 mt-2">
                      <span className="font-bold text-gray-900">총 공제액</span>
                      <span className="text-lg font-black text-red-600">-{currentPayroll.totalDeduction.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between items-center py-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl px-4 mt-4 border-2 border-green-200">
                      <span className="text-lg font-black text-gray-900">실수령액</span>
                      <span className="text-2xl font-black text-green-600">{currentPayroll.netPay.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 출근 기록 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">출근 기록</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {attendanceData.length > 0 ? (
                  attendanceData.map((record) => (
                    <div
                      key={record.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{new Date(record.date).toLocaleDateString('ko-KR')}</p>
                        {record.notes && <p className="text-xs text-gray-500">{record.notes}</p>}
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="font-bold text-blue-600">{record.hoursWorked}시간</p>
                          <p className="text-xs text-gray-500">{(record.hoursWorked / 8).toFixed(1)}공수</p>
                          {record.isWeeklyHoliday && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">주휴</span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedAttendance({ ...record, worker: { name: user?.fullName || '근로자' } })
                            setIsCorrectionModalOpen(true)
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-orange-200"
                        >
                          수정 요청
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">출근 기록이 없습니다</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Correction Request Modal */}
      {selectedAttendance && (
        <CorrectionRequestModal
          isOpen={isCorrectionModalOpen}
          onClose={() => {
            setIsCorrectionModalOpen(false)
            setSelectedAttendance(null)
          }}
          onSuccess={() => {
            fetchMyData()
          }}
          attendance={selectedAttendance}
        />
      )}
    </div>
  )
}
