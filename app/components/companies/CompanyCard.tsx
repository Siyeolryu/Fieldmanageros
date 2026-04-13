import React from 'react'
import Link from 'next/link'
import { Company } from '@prisma/client'

interface CompanyCardProps {
  company: Company & {
    _count?: {
      sites: number
    }
  }
}

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link 
      href={`/companies/${company.id}`}
      className="group block relative bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl shadow-gray-200/40 border border-white/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-[0.98]"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            {company.name}
          </h3>
          {company.businessNumber && (
            <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-50 text-[11px] font-medium text-gray-500 tracking-wider">
              No. {company.businessNumber}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-blue-500/20">
            현장 {company._count?.sites || 0}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {company.phone && (
          <div className="flex items-center gap-3 text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <span className="font-medium">{company.phone}</span>
          </div>
        )}
        {company.address && (
          <div className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-600 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="truncate">{company.address}</span>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-50 flex justify-end">
        <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
          현장 관리하기
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  )
}
