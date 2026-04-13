'use client'

import React, { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import Button from '@/app/components/ui/Button'

interface Worker {
  id: string
  site_id: string
  name: string
  phone?: string | null
  id_number?: string | null
  bank_name?: string | null
  bank_account?: string | null
  hourly_rate: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

interface WorkerListProps {
  onEdit: (worker: Worker) => void
}

const WorkerList: React.FC<WorkerListProps> = ({ onEdit }) => {
  const { selectedSite } = useAppStore()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(false)

  const fetchWorkers = async () => {
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
  }

  useEffect(() => {
    fetchWorkers()

    // Real-time 업데이트 구독
    if (!selectedSite) return

    const setupRealtimeSubscription = async () => {
      const { createSupabaseClient } = await import('@/lib/supabase/client')
      const supabase = createSupabaseClient()

      const channel = supabase
        .channel('workers-changes')
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

      return () => {
        channel.unsubscribe()
      }
    }

    const cleanup = setupRealtimeSubscription()

    return () => {
      cleanup.then(unsubscribe => unsubscribe?.())
    }
  }, [selectedSite])

  const toggleStatus = async (worker: Worker) => {
    try {
      const res = await fetch(`/api/workers/${worker.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !worker.is_active }),
      })
      if (res.ok) fetchWorkers()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

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
          {workers.map((worker) => (
            <div
              key={worker.id}
              className={`p-5 bg-white rounded-3xl border transition-all ${worker.is_active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-lg">
                    {worker.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 leading-tight">{worker.name}</p>
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
                  <p className="font-bold text-gray-900 text-sm">{worker.hourly_rate.toLocaleString()}원</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">은행</p>
                  <p className="font-bold text-gray-900 text-sm truncate">{worker.bank_name || '-'} {worker.bank_account || ''}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WorkerList
