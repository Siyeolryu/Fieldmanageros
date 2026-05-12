'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CompanyCard from '../components/companies/CompanyCard'

interface Company {
  id: string
  name: string
  businessNumber?: string | null
  phone?: string | null
  address?: string | null
  ownerId: string
  createdAt: Date
  updatedAt: Date
  _count?: {
    sites: number
  }
}

export default function CompaniesPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch('/api/companies')

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/auth/login')
          return
        }
        throw new Error('건설사 목록을 불러오는데 실패했습니다.')
      }

      const data = await res.json()
      setCompanies(data)
    } catch (err: unknown) {
      console.error('Error fetching companies:', err)
      const message = err instanceof Error ? err.message : '건설사 목록을 불러오는 중 오류가 발생했습니다.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchCompanies()

    // Real-time 업데이트 구독
    const setupRealtimeSubscription = async () => {
      const { createSupabaseClient } = await import('@/lib/supabase/client')
      const supabase = createSupabaseClient()

      const channel = supabase
        .channel('companies-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // INSERT, UPDATE, DELETE 모두 감지
            schema: 'public',
            table: 'companies',
          },
          (payload) => {
            console.log('Company changed:', payload)
            // 데이터 변경 시 목록 다시 가져오기
            fetchCompanies()
          }
        )
        .subscribe()

      return () => {
        channel.unsubscribe()
      }
    }

    setupRealtimeSubscription()
  }, [fetchCompanies])

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
              회사 관리
            </h1>
            <p className="text-lg text-gray-500 font-medium">
              등록된 건설사와 협진 현황을 한눈에 관리합니다.
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
            onClick={fetchCompanies}
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
            회사 관리
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            등록된 건설사와 협진 현황을 한눈에 관리합니다.
          </p>
        </div>
        <Link
          href="/companies/new"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-2xl transition-all"
        >
          <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          신규 건설사 등록
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-gray-200 shadow-inner">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">등록된 회사가 아직 없습니다</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            건설사를 먼저 등록해야 현장을 개설하고 <br /> 출역 관리를 시작할 수 있습니다.
          </p>
          <Link
            href="/companies/new"
            className="inline-block px-8 py-3 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-2xl border border-gray-200 transition-colors"
          >
            첫 번째 회사 등록하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {companies.map(company => (
            <CompanyCard key={company.id} company={company as any} />
          ))}
        </div>
      )}
    </div>
  )
}
