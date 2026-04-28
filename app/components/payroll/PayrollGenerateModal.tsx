'use client'

import React, { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

interface Worker {
  id: string
  name: string
  hourly_rate: number
}

interface PayrollGenerateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  siteId: string
}

export default function PayrollGenerateModal({
  isOpen,
  onClose,
  onSuccess,
  siteId
}: PayrollGenerateModalProps) {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [selectedWorkerId, setSelectedWorkerId] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && siteId) {
      fetchWorkers()
    }
  }, [isOpen, siteId])

  const fetchWorkers = async () => {
    try {
      const res = await fetch(`/api/workers?siteId=${siteId}`)
      if (res.ok) {
        const data = await res.json()
        setWorkers(data)
      }
    } catch (err) {
      console.error('Failed to fetch workers:', err)
    }
  }

  const handleGenerate = async () => {
    if (!selectedWorkerId) {
      setError('근로자를 선택해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: selectedWorkerId,
          siteId,
          year,
          month,
          weeklyHolidayCount: 0 // 자동 계산
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '급여 생성에 실패했습니다.')
      }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '급여 생성에 실패했습니다.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="급여 명세서 생성">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 근로자 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            근로자 선택
          </label>
          <select
            value={selectedWorkerId}
            onChange={(e) => setSelectedWorkerId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">근로자를 선택하세요</option>
            {workers.map(worker => (
              <option key={worker.id} value={worker.id}>
                {worker.name} (시급: {worker.hourly_rate.toLocaleString()}원)
              </option>
            ))}
          </select>
        </div>

        {/* 년월 선택 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              년도
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              월
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
          <p className="font-semibold mb-1">💡 자동 계산 정보</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>주휴수당: 주 15시간 이상 근무 시 자동 지급</li>
            <li>4대 보험: 월 8일 이상 근무 시 공제</li>
            <li>연장수당: 일 8시간 초과분 1.5배 지급</li>
          </ul>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            size="full"
            onClick={onClose}
            disabled={loading}
          >
            취소
          </Button>
          <Button
            variant="primary"
            size="full"
            onClick={handleGenerate}
            isLoading={loading}
          >
            급여 생성
          </Button>
        </div>
      </div>
    </Modal>
  )
}
