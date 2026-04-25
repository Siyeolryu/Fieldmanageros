'use client'

import React, { useState } from 'react'
import Modal from '@/app/components/ui/Modal'
import Button from '@/app/components/ui/Button'
import { toast } from 'sonner'

interface CorrectionRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  attendance: {
    id: string
    date: string
    hoursWorked: number
    notes: string | null
    worker: {
      name: string
    }
  }
}

export default function CorrectionRequestModal({
  isOpen,
  onClose,
  onSuccess,
  attendance,
}: CorrectionRequestModalProps) {
  const [requestedHours, setRequestedHours] = useState(attendance.hoursWorked.toString())
  const [requestedNotes, setRequestedNotes] = useState(attendance.notes || '')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('수정 사유를 입력해주세요')
      return
    }

    if (parseFloat(requestedHours) === attendance.hoursWorked && requestedNotes === (attendance.notes || '')) {
      toast.error('변경 사항이 없습니다')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/correction-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendanceId: attendance.id,
          requestedHours: parseFloat(requestedHours),
          requestedNotes: requestedNotes || null,
          reason,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '수정 요청 제출 실패')
      }

      toast.success('수정 요청이 제출되었습니다')
      onSuccess()
      handleClose()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setRequestedHours(attendance.hoursWorked.toString())
    setRequestedNotes(attendance.notes || '')
    setReason('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="출근 기록 수정 요청">
      <div className="space-y-6">
        {/* Current Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-bold text-gray-500 mb-2">현재 기록</p>
          <div className="space-y-1">
            <p className="text-sm text-gray-900">
              <span className="font-semibold">날짜:</span> {new Date(attendance.date).toLocaleDateString('ko-KR')}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-semibold">근무시간:</span> {attendance.hoursWorked}시간
            </p>
            {attendance.notes && (
              <p className="text-sm text-gray-900">
                <span className="font-semibold">비고:</span> {attendance.notes}
              </p>
            )}
          </div>
        </div>

        {/* Requested Changes */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수정 요청 근무시간 *
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={requestedHours}
              onChange={(e) => setRequestedHours(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: 8"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수정 요청 비고
            </label>
            <input
              type="text"
              value={requestedNotes}
              onChange={(e) => setRequestedNotes(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="비고 (선택사항)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수정 사유 *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="수정이 필요한 사유를 작성해주세요"
            />
            <p className="text-xs text-gray-500 mt-1">
              * 관리자가 검토할 때 참고할 사유를 상세히 작성해주세요
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="full"
            onClick={handleClose}
            disabled={submitting}
          >
            취소
          </Button>
          <Button
            variant="primary"
            size="full"
            onClick={handleSubmit}
            isLoading={submitting}
            disabled={submitting}
          >
            수정 요청 제출
          </Button>
        </div>
      </div>
    </Modal>
  )
}
