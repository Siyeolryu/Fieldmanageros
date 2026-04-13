'use client'

import React from 'react'
import Link from 'next/link'
import { Site } from '@prisma/client'
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
    }
  }
}

export default function SiteCard({ site }: SiteCardProps) {
  const isFinished = !site.isActive || (site.endDate && new Date(site.endDate) < new Date())
  
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

        <div className="space-y-3 mb-6">
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
            <span>
              {site.startDate ? format(new Date(site.startDate), 'yyyy.MM.dd', { locale: ko }) : '시작일 미정'} 
              {' ~ '}
              {site.endDate ? format(new Date(site.endDate), 'yyyy.MM.dd', { locale: ko }) : '종료일 미정'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-50">
        <Link href={`/attendance?siteId=${site.id}`} className="block">
          <Button variant={isFinished ? 'outline' : 'primary'} size="full" className="rounded-2xl">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            출역 관리하기
          </Button>
        </Link>
        <Link href={`/sites/${site.id}`} className="block text-center">
          <span className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors cursor-pointer inline-flex items-center gap-1">
            현장 상세 정보 및 대시보드
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  )
}
