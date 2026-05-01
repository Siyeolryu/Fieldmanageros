'use client'

import React, { useState } from 'react'
import type { Worker } from '@prisma/client'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import Button from '@/app/components/ui/Button'
import { formatDate } from '@/lib/dateUtils'

interface AttendanceFormProps {
  workers: Worker[]
  date: Date
  onSuccess: () => void
  onCancel: () => void
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({
  workers,
  date,
  onSuccess,
  onCancel
}) => {
  const { selectedSite } = useAppStore()
  const [selectedWorkerId, setSelectedWorkerId] = useState('')
  const [gongsu, setGongsu] = useState(1.0)
  const [isWeeklyHoliday, setIsWeeklyHoliday] = useState(false)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isManualEdit, setIsManualEdit] = useState(false)
  const [inputMode, setInputMode] = useState<'hours' | 'gongsu'>('gongsu')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')

  // 시간 계산 함수 (시작시간 ~ 종료시간)
  const calculateHours = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number)
    const [endHour, endMin] = end.split(':').map(Number)

    const startMinutes = startHour * 60 + startMin
    let endMinutes = endHour * 60 + endMin

    // 야간 근무 처리 (종료 시간이 시작 시간보다 작으면 다음날)
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60
    }

    const diffMinutes = endMinutes - startMinutes
    return diffMinutes / 60 // 시간으로 변환
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWorkerId || !selectedSite) return

    setIsSubmitting(true)
    try {
      // inputMode에 따라 시간 계산
      const hoursWorked = inputMode === 'hours'
        ? calculateHours(startTime, endTime)
        : gongsu * 8

      const selectedWorker = workers.find(w => w.id === selectedWorkerId)
      const workerName = selectedWorker?.name || '근로자'

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: selectedWorkerId,
          siteId: selectedSite.id,
          date: formatDate(date),
          hoursWorked,
          notes,
          isWeeklyHoliday,
        }),
      })

      if (response.ok) {
        toast.success('출근 등록이 완료되었습니다', {
          description: `${workerName} - ${formatDate(date)} (${hoursWorked.toFixed(1)}시간)`,
          duration: 3000,
        })
        onSuccess()
      } else {
        toast.error('출근 등록 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error(error)
      toast.error('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 입력 방식 선택 탭 */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        <button
          type="button"
          onClick={() => setInputMode('hours')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
            inputMode === 'hours'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          시간 단위
        </button>
        <button
          type="button"
          onClick={() => setInputMode('gongsu')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
            inputMode === 'gongsu'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          일 단위 (공수)
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-500 ml-1">근로자 선택</label>
        <select
          required
          value={selectedWorkerId}
          onChange={(e) => setSelectedWorkerId(e.target.value)}
          className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl transition-all font-bold outline-none appearance-none"
        >
          <option value="" disabled>출근할 근로자 선택</option>
          {workers.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.name} ({worker.phone || '연락처 없음'})
            </option>
          ))}
        </select>
      </div>

      {/* 시간 단위 입력 */}
      {inputMode === 'hours' ? (
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500 ml-1">근무 시간</label>
          <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
            <div className="space-y-4">
              {/* 시작 시간 */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 ml-1">시작 시간</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full h-14 px-4 bg-white border-2 border-gray-200 focus:border-blue-600 rounded-xl transition-all font-bold text-lg outline-none"
                />
              </div>

              {/* 종료 시간 */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 ml-1">종료 시간</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full h-14 px-4 bg-white border-2 border-gray-200 focus:border-blue-600 rounded-xl transition-all font-bold text-lg outline-none"
                />
              </div>

              {/* 총 근무 시간 표시 */}
              <div className="pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-400 mb-1">총 근무 시간</p>
                  <p className="text-4xl font-black text-blue-600">
                    {calculateHours(startTime, endTime).toFixed(1)}
                    <span className="text-lg ml-1">시간</span>
                  </p>
                </div>
              </div>

              {/* 빠른 설정 버튼 */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setStartTime('09:00'); setEndTime('18:00') }}
                  className="flex-1 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-blue-200 hover:text-blue-600 transition-all"
                >
                  9시-6시 (9h)
                </button>
                <button
                  type="button"
                  onClick={() => { setStartTime('08:00'); setEndTime('17:00') }}
                  className="flex-1 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-blue-200 hover:text-blue-600 transition-all"
                >
                  8시-5시 (9h)
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 공수 단위 입력 */
        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="text-sm font-bold text-gray-500">투입 공수 (Headcount)</label>
            <button
              type="button"
              onClick={() => setIsManualEdit(!isManualEdit)}
              className="text-[10px] font-bold text-blue-600 underline"
            >
              {isManualEdit ? '매크로 버튼 사용' : '직접 입력'}
            </button>
          </div>

          <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
            <div className="flex flex-col items-center gap-4">
              {isManualEdit ? (
                <input
                  type="number"
                  step="0.1"
                  value={gongsu}
                  onChange={(e) => setGongsu(parseFloat(e.target.value) || 0)}
                  className="w-32 text-center text-4xl font-black text-blue-600 bg-transparent outline-none border-b-2 border-blue-200 focus:border-blue-600 transition-colors"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-8">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-12 h-12 rounded-full bg-white shadow-sm border-gray-200"
                    onClick={() => setGongsu(prev => Math.max(0, prev - 0.5))}
                  >-</Button>
                  <div className="text-center">
                    <span className="text-5xl font-black text-blue-600 leading-none">{gongsu.toFixed(1)}</span>
                    <span className="block text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Gong-su</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-12 h-12 rounded-full bg-white shadow-sm border-gray-200"
                    onClick={() => setGongsu(prev => prev + 0.5)}
                  >+</Button>
                </div>
              )}

              {!isManualEdit && (
                <div className="flex gap-2 w-full pt-2">
                  <button
                    type="button"
                    onClick={() => setGongsu(1.0)}
                    className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-blue-200 hover:text-blue-600 transition-all"
                  >
                    1.0 (기본)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGongsu(prev => prev + 0.5)}
                    className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-rose-500 hover:border-rose-200 transition-all"
                  >
                    +0.5 (연장/야간)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isWeeklyHoliday ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">주휴수당 적용</p>
            <p className="text-[10px] text-gray-500 font-medium">관리자 권한으로 유급휴일을 부여합니다.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsWeeklyHoliday(!isWeeklyHoliday)}
          className={`w-12 h-6 rounded-full transition-colors relative ${isWeeklyHoliday ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isWeeklyHoliday ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-500 ml-1">특이사항 메모</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="특이사항 입력 (예: 연장 근무 4시간, 조퇴 등)"
          className="w-full h-24 p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl transition-all font-medium outline-none resize-none"
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-50">
        <Button variant="ghost" size="full" onClick={onCancel} type="button" className="font-bold text-gray-400">취소</Button>
        <Button
          type="submit"
          size="full"
          isLoading={isSubmitting}
          disabled={!selectedWorkerId}
          className="shadow-lg shadow-blue-100"
        >
          {inputMode === 'hours'
            ? `${calculateHours(startTime, endTime).toFixed(1)}시간 등록 완료`
            : `${gongsu.toFixed(1)}공수 등록 완료`
          }
        </Button>
      </div>
    </form>
  )
}

export default AttendanceForm
