'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import Button from '@/app/components/ui/Button'
import type { Worker } from '@prisma/client'

interface WorkerListProps {
  onEdit: (worker: Worker) => void
}

const WorkerList: React.FC<WorkerListProps> = ({ onEdit }) => {
  const { selectedSite } = useAppStore()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const fetchWorkers = useCallback(async () => {
    if (!selectedSite) return
    setLoading(true)
    try {
      const res = await fetch(`/api/workers?siteId=${selectedSite.id}`)
      if (res.ok) {
        const data = await res.json()
        setWorkers(data)
      }
    } catch (error) {
      console.error('Failed to fetch workers:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedSite])

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { createSupabaseClient } = await import('@/lib/supabase/client')
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    fetchCurrentUser()
  }, [])

  // 초기 데이터 로드
  useEffect(() => {
    fetchWorkers()
  }, [fetchWorkers])

  // Real-time 업데이트 구독
  useEffect(() => {
    if (!selectedSite) return

    let channel: unknown = null

    const setupRealtimeSubscription = async () => {
      const { createSupabaseClient } = await import('@/lib/supabase/client')
      const supabase = createSupabaseClient()

      channel = supabase
        .channel(`workers-changes-${selectedSite.id}`)
        .on(
          'postgres_changes',
          {
            event: '*', // INSERT, UPDATE, DELETE 모두 감지
            schema: 'public',
            table: 'workers',
            filter: `site_id=eq.${selectedSite.id}`,
          },
          (payload) => {
            console.log('Worker changed:', payload)
            // 데이터 변경 시 목록 다시 가져오기
            fetchWorkers()
          }
        )
        .subscribe()
    }

    setupRealtimeSubscription()

    return () => {
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [selectedSite, fetchWorkers])

  if (!selectedSite) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
        <p className="text-gray-500 font-bold">현장을 먼저 선택해 주세요.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-2xl" />
      ))}
    </div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900">
          등록된 근로자 ({workers.length}명)
        </h3>
      </div>
      
      {workers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-bold">등록된 근로자가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workers.map((worker) => {
            // Phase 5: 본인 여부 확인
            const isMyself = worker.profileId === currentUserId
            const isOwner = worker.isOwner

            return (
              <div
                key={worker.id}
                className={`p-5 rounded-3xl border-2 transition-all ${
                  isMyself
                    ? 'bg-sky-50/50 border-sky-300'
                    : worker.isActive
                      ? 'bg-white border-gray-100'
                      : 'bg-white border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                      isMyself ? 'bg-sky-600 text-white' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {worker.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-gray-900 leading-tight">{worker.name}</p>
                        {isMyself && (
                          <span className="px-2 py-0.5 bg-sky-600 text-white text-[10px] font-bold rounded-full">
                            본인
                          </span>
                        )}
                        {isOwner && (
                          <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                            관리자
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-gray-400 tracking-wider">
                        {worker.phone || '연락처 없음'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(worker)} className="h-8 min-h-0 text-xs font-bold">수정</Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">시급</p>
                    <p className="font-bold text-gray-900 text-sm">{worker.hourlyRate.toLocaleString()}원</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">은행</p>
                    <p className="font-bold text-gray-900 text-sm truncate">{worker.bankName || '-'} {worker.bankAccount || ''}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default WorkerList
