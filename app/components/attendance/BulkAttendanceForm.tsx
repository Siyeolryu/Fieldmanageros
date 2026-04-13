'use client'

import React, { useState } from 'react'
import { Worker } from '@prisma/client'
import Button from '../ui/Button'
import { formatDate } from '@/lib/dateUtils'

interface BulkAttendanceFormProps {
  workers: Worker[]
  date: Date
  siteId: string
  onSuccess: () => void
  onCancel: () => void
}

const BulkAttendanceForm: React.FC<BulkAttendanceFormProps> = ({
  workers,
  date,
  siteId,
  onSuccess,
  onCancel
}) => {
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([])
  const [gongsu, setGongsu] = useState(1.0)
  const [isWeeklyHoliday, setIsWeeklyHoliday] = useState(false)
  const [isManualEdit, setIsManualEdit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleWorker = (id: string) => {
    setSelectedWorkerIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedWorkerIds.length === workers.length) {
      setSelectedWorkerIds([])
    } else {
      setSelectedWorkerIds(workers.map(w => w.id))
    }
  }

  const handleSubmit = async () => {
    if (selectedWorkerIds.length === 0) return
    
    setIsSubmitting(true)
    try {
      const hoursWorked = gongsu * 8
      const records = selectedWorkerIds.map(workerId => ({
        workerId,
        siteId,
        date: formatDate(date),
        hoursWorked,
        isWeeklyHoliday,
      }))

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(records),
      })

      if (response.ok) {
        onSuccess()
      } else {
        alert('출근 등록 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error(error)
      alert('네트워크 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-gray-700">인원 선택 ({selectedWorkerIds.length}명)</h4>
        <Button variant="ghost" size="sm" onClick={selectAll} className="text-blue-600 font-bold p-0 min-h-0 text-xs text-blue-600">
          {selectedWorkerIds.length === workers.length ? '전체 해제' : '전체 선택'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-[30vh] overflow-y-auto pr-2">
        {workers.map(worker => (
          <label 
            key={worker.id}
            className={`
              flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer
              ${selectedWorkerIds.includes(worker.id) ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}
            `}
          >
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={selectedWorkerIds.includes(worker.id)}
              onChange={() => toggleWorker(worker.id)}
            />
            <span className="font-bold text-gray-900 truncate">{worker.name}</span>
          </label>
        ))}
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between ml-1">
          <span className="font-bold text-gray-700">공통 적용 공수</span>
          <button 
            type="button" 
            onClick={() => setIsManualEdit(!isManualEdit)}
            className="text-[10px] font-bold text-blue-600 underline"
          >
            {isManualEdit ? '버튼 사용' : '직접 입력'}
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 bg-gray-50 p-4 rounded-2xl">
          {isManualEdit ? (
            <input
              type="number"
              step="0.1"
              value={gongsu}
              onChange={(e) => setGongsu(parseFloat(e.target.value) || 0)}
              className="w-24 text-center text-3xl font-black text-blue-600 bg-transparent outline-none border-b-2 border-blue-200"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-6">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-10 h-10 min-h-0 p-0 rounded-full bg-white border-gray-200"
                onClick={() => setGongsu(prev => Math.max(0, prev - 0.5))}
              >-</Button>
              <div className="text-center">
                <span className="text-3xl font-black text-blue-600">{gongsu.toFixed(1)}</span>
                <span className="block text-[10px] font-bold text-gray-400">공수</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-10 h-10 min-h-0 p-0 rounded-full bg-white border-gray-200"
                onClick={() => setGongsu(prev => prev + 0.5)}
              >+</Button>
            </div>
          )}
          
          {!isManualEdit && (
            <div className="flex gap-2 w-full">
              <button onClick={() => setGongsu(1.0)} className="flex-1 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600">1.0 기본</button>
              <button onClick={() => setGongsu(prev => prev + 0.5)} className="flex-1 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-rose-500">+0.5 연장</button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isWeeklyHoliday ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 shadow-sm'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-xs">주휴수당 일괄 적용</span>
          </div>
          <button
            type="button"
            onClick={() => setIsWeeklyHoliday(!isWeeklyHoliday)}
            className={`w-10 h-5 rounded-full transition-colors relative ${isWeeklyHoliday ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isWeeklyHoliday ? 'left-5.5' : 'left-0.5'}`} />
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" size="full" onClick={onCancel}>취소</Button>
          <Button 
            size="full" 
            onClick={handleSubmit} 
            disabled={selectedWorkerIds.length === 0}
            isLoading={isSubmitting}
            className="shadow-md shadow-blue-50"
          >
            {selectedWorkerIds.length}명 일괄 등록
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BulkAttendanceForm
