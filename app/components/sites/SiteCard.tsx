'use client'

import React from 'react'
import Link from 'next/link'
import type { Site } from '@prisma/client'
import Button from '../ui/Button'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface SiteCardProps {
  site: Site & {
    company?: {
      name: string
    }
    _count?: {
      workers: number
      attendance: number
    }
  }
  monthlyLaborCost?: number  // 당월 총 인건비
  currentMonthWorkers?: number  // 당월 근무 근로자 수
}

export default function SiteCard({ site, monthlyLaborCost = 0, currentMonthWorkers = 0 }: SiteCardProps) {
  const isFinished = !site.isActive || (site.endDate && new Date(site.endDate) < new Date())
  const currentMonth = format(new Date(), 'M', { locale: ko })

  return (
    <div
      className={`group relative flex flex-col justify-between h-full bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isFinished ? 'grayscale saturate-50 opacity-80' : 'hover:shadow-blue-500/10'}`}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1 max-w-[70%]">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {site.name}
            </h3>
            {site.company?.name && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {site.company.name}
              </p>
            )}
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-tighter uppercase shadow-sm ${isFinished ? 'bg-gray-100 text-gray-500' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
            {isFinished ? '종료됨' : '진행중'}
          </div>
        </div>

        {/* 인건비 정보 섹션 */}
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <p className="text-xs font-bold text-blue-600 mb-2">{currentMonth}월 인건비</p>
          <p className="text-2xl font-black text-blue-700">
            ₩{monthlyLaborCost.toLocaleString()}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-blue-600">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              등록 {site._count?.workers || 0}명
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              당월 {currentMonthWorkers}명 근무
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {site.location && (
            <div className="flex items-center gap-2.5 text-sm text-gray-500">
              <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <span className="truncate">{site.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-sm text-gray-500">
            <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs">
              {site.startDate ? format(new Date(site.startDate), 'yyyy.MM.dd', { locale: ko }) : '시작일 미정'}
              {' ~ '}
              {site.endDate ? format(new Date(site.endDate), 'yyyy.MM.dd', { locale: ko }) : '종료일 미정'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-gray-50">
        {/* 메인 액션: 인건비 신고서 */}
        <Link href={`/payroll?siteId=${site.id}`} className="block">
          <Button variant={isFinished ? 'outline' : 'premium'} size="full" className="rounded-2xl">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            인건비 신고서 보기
          </Button>
        </Link>

        {/* 서브 액션: 출근 기록 */}
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/attendance?siteId=${site.id}`} className="block">
            <button className="w-full px-3 py-2 text-xs font-bold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-gray-200 hover:border-blue-300">
              출근 기록
            </button>
          </Link>
          <Link href={`/sites/${site.id}`} className="block">
            <button className="w-full px-3 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
              현장 설정
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
