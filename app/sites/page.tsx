'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SiteCard from '../components/sites/SiteCard'
import Button from '../components/ui/Button'
import type { Site } from '@prisma/client'

type SiteWithRelations = Site & {
  company?: {
    name: string
  }
  _count?: {
    workers: number
    attendance: number
  }
}

export default function SitesPage() {
  const router = useRouter()
  const [sites, setSites] = useState<SiteWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSites()

    // Real-time 업데이트 구독
    const setupRealtimeSubscription = async () => {
      const { createSupabaseClient } = await import('@/lib/supabase/client')
      const supabase = createSupabaseClient()

      const channel = supabase
        .channel('sites-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // INSERT, UPDATE, DELETE 모두 감지
            schema: 'public',
            table: 'sites',
          },
          (payload) => {
            console.log('Site changed:', payload)
            // 데이터 변경 시 목록 다시 가져오기
            fetchSites()
          }
        )
        .subscribe()

      return () => {
        channel.unsubscribe()
      }
    }

    setupRealtimeSubscription()
  }, [])

  const fetchSites = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch('/api/sites')

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/auth/login')
          return
        }
        throw new Error('현장 목록을 불러오는데 실패했습니다.')
      }

      const data = await res.json()
      setSites(data)
    } catch (error: unknown) {
      console.error('Error fetching sites:', error)
      const message = error instanceof Error ? error.message : '현장 목록을 불러오는 중 오류가 발생했습니다.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
              현장 관리
            </h1>
            <p className="text-lg text-gray-500 font-medium">
              전체 현장의 진행 상황과 출역 현황을 관리합니다.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-[2rem]" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">오류 발생</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSites}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            현장 관리
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            전체 현장의 진행 상황과 출역 현황을 관리합니다.
          </p>
        </div>
        <Link href="/sites/new">
          <Button variant="premium" size="lg" className="shadow-2xl">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            신규 현장 개설
          </Button>
        </Link>
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-gray-200">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">등록된 현장이 없습니다</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            건설사를 먼저 선택하고 관리할 현장을 등록해보세요.
          </p>
          <Link href="/sites/new">
            <Button variant="outline" size="md" className="rounded-2xl px-8 border-gray-200">
              첫 번째 현장 등록하기
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  )
}
