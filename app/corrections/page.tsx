'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import Link from 'next/link'

interface CorrectionRequest {
  id: string
  reason: string
  requestedHours: number | null
  requestedNotes: string | null
  status: string
  createdAt: string
  reviewedAt: string | null
  reviewNotes: string | null
  attendance: {
    id: string
    date: string
    hoursWorked: number
    notes: string | null
    worker: {
      name: string
    }
    site: {
      name: string
    }
  }
  requester: {
    fullName: string
    email: string
  }
  reviewer: {
    fullName: string
    email: string
  } | null
}

export default function CorrectionsPage() {
  const router = useRouter()
  const { user, activeRole } = useAuthStore()
  const { selectedSite } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<CorrectionRequest[]>([])
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    if (activeRole !== 'manager') {
      toast.error('관리자 모드에서만 접근 가능합니다')
      router.push('/home')
      return
    }

    fetchRequests()
  }, [user, activeRole, router, selectedSite, selectedStatus])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: selectedStatus,
      })

      if (selectedSite?.id) {
        params.append('siteId', selectedSite.id)
      }

      const res = await fetch(`/api/correction-requests?${params}`)
      if (res.ok) {
        const result = await res.json()
        setRequests(result.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch correction requests:', error)
      toast.error('수정 요청 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/correction-requests/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNotes }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '승인 실패')
      }

      toast.success('수정 요청이 승인되었습니다')
      setReviewingId(null)
      setReviewNotes('')
      fetchRequests()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleReject = async (id: string) => {
    if (!reviewNotes.trim()) {
      toast.error('거부 사유를 입력해주세요')
      return
    }

    try {
      const res = await fetch(`/api/correction-requests/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNotes }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '거부 실패')
      }

      toast.success('수정 요청이 거부되었습니다')
      setReviewingId(null)
      setReviewNotes('')
      fetchRequests()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[family-name:var(--font-geist-sans)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black text-blue-600 tracking-tight">노무PRO</h1>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-xs font-semibold text-blue-700">관리자 모드</span>
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
          <h2 className="text-3xl font-black text-gray-900">출근 기록 수정 요청</h2>
          <p className="text-gray-500 font-medium mt-2">
            근로자가 제출한 출근 기록 수정 요청을 검토하세요
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6">
          {(['pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status === 'pending' && '대기중'}
              {status === 'approved' && '승인됨'}
              {status === 'rejected' && '거부됨'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center">
            <p className="text-gray-400 font-medium">수정 요청이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {request.attendance.worker.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {request.attendance.site.name} • {new Date(request.attendance.date).toLocaleDateString('ko-KR')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      요청자: {request.requester.fullName} ({request.requester.email})
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      request.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {request.status === 'pending' && '대기중'}
                      {request.status === 'approved' && '승인됨'}
                      {request.status === 'rejected' && '거부됨'}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(request.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>

                {/* Current vs Requested */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs font-bold text-gray-500 mb-2">현재 기록</p>
                    <p className="text-sm font-bold text-gray-900">{request.attendance.hoursWorked}시간</p>
                    {request.attendance.notes && (
                      <p className="text-xs text-gray-600 mt-1">{request.attendance.notes}</p>
                    )}
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-xs font-bold text-blue-600 mb-2">수정 요청</p>
                    {request.requestedHours !== null && (
                      <p className="text-sm font-bold text-blue-700">{request.requestedHours}시간</p>
                    )}
                    {request.requestedNotes && (
                      <p className="text-xs text-blue-600 mt-1">{request.requestedNotes}</p>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div className="p-4 bg-amber-50 rounded-xl mb-4">
                  <p className="text-xs font-bold text-amber-700 mb-1">수정 사유</p>
                  <p className="text-sm text-gray-900">{request.reason}</p>
                </div>

                {/* Review Actions (only for pending) */}
                {request.status === 'pending' && (
                  <div className="border-t border-gray-100 pt-4">
                    {reviewingId === request.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="검토 의견 (선택사항)"
                          rows={3}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
                          >
                            거부
                          </button>
                          <button
                            onClick={() => {
                              setReviewingId(null)
                              setReviewNotes('')
                            }}
                            className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewingId(request.id)}
                        className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                      >
                        검토하기
                      </button>
                    )}
                  </div>
                )}

                {/* Review Result (for approved/rejected) */}
                {request.status !== 'pending' && request.reviewer && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500 mb-1">
                      검토자: {request.reviewer.fullName} • {request.reviewedAt && new Date(request.reviewedAt).toLocaleString('ko-KR')}
                    </p>
                    {request.reviewNotes && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {request.reviewNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
