import React from 'react'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import SiteForm from '@/app/components/sites/SiteForm'
import Button from '@/app/components/ui/Button'
import Link from 'next/link'

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      company: true,
      _count: {
        select: {
          workers: true,
          attendance: true,
        }
      }
    }
  })

  if (!site) {
    notFound()
  }

  // 건설사 목록 (수정 폼용)
  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
  })

  // Serialize Date objects for client components
  const serializedSite = {
    ...site,
    startDate: site.startDate?.toISOString() || null,
    endDate: site.endDate?.toISOString() || null,
    createdAt: site.createdAt.toISOString(),
    updatedAt: site.updatedAt.toISOString(),
    company: site.company ? {
      ...site.company,
      createdAt: site.company.createdAt.toISOString(),
      updatedAt: site.company.updatedAt.toISOString(),
    } : null,
  }

  const serializedCompanies = companies.map(company => ({
    ...company,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  }))

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            {site.name} <span className="text-gray-400 text-2xl font-medium ml-2">대시보드</span>
          </h1>
          <p className="text-lg text-gray-500 font-medium tracking-tight">
            {site.company?.name} &middot; {site.location || '위치 정보 없음'}
          </p>
        </div>
        <Link href={`/attendance?siteId=${site.id}`}>
          <Button variant="premium" size="lg" className="shadow-2xl">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            실시간 출역 관리
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-8 bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white/50 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase mb-2">등록 근로자</p>
          <p className="text-4xl font-black text-blue-600">{site._count?.workers || 0}</p>
        </div>
        <div className="p-8 bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white/50 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase mb-2">누적 출역수</p>
          <p className="text-4xl font-black text-indigo-600">{site._count?.attendance || 0}</p>
        </div>
        <div className="p-8 bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white/50 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase mb-2">상태</p>
          <p className={`text-4xl font-black ${site.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
            {site.isActive ? '진행 중' : '종료됨'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 ml-2">현장 정보 수정</h3>
          <SiteForm initialData={serializedSite} companies={serializedCompanies} isEdit={true} />
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 ml-2">최근 활동</h3>
          <div className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[400px]">
            <svg className="w-12 h-12 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-400 font-medium">최근 출역 정보가 없습니다.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
