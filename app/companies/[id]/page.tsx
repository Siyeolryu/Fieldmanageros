import React from 'react'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import CompanyForm from '@/app/components/companies/CompanyForm'
import DeleteCompanyButton from '@/app/components/companies/DeleteCompanyButton'
import SiteCard from '@/app/components/sites/SiteCard'
import Link from 'next/link'
import Button from '@/app/components/ui/Button'

// Serialized types for client components
type SerializedCompany = {
  id: string
  name: string
  businessNumber: string | null
  phone: string | null
  address: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
}

type SerializedSite = {
  id: string
  companyId: string
  name: string
  location: string | null
  startDate: string | null
  endDate: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    workers: number
    attendance: number
  }
}

type SiteWithStats = SerializedSite & {
  monthlyLaborCost: number
  currentMonthWorkers: number
}

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      sites: {
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              workers: true,
              attendance: true,
            },
          },
        },
      }
    }
  })

  if (!company) {
    notFound()
  }

  // Serialize company data
  const serializedCompany: SerializedCompany = JSON.parse(JSON.stringify(company))

  // Serialize sites with default stats (will be loaded client-side if needed)
  const sitesWithStats: SiteWithStats[] = company.sites.map((site) => {
    const serializedSite: SerializedSite = JSON.parse(JSON.stringify(site))
    return {
      ...serializedSite,
      monthlyLaborCost: 0,  // Default value - can be loaded via API
      currentMonthWorkers: 0,  // Default value - can be loaded via API
    }
  })

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            회사 정보 <span className="text-gray-400 text-2xl font-medium ml-2">상세/수정</span>
          </h1>
          <p className="text-lg text-gray-500 font-medium tracking-tight">
            건설사 정보와 등록된 소속 현장을 통합 관리합니다.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href={`/sites/new?companyId=${company.id}`}>
            <Button variant="premium" size="md">
              + 새 현장 추가
            </Button>
          </Link>
          <DeleteCompanyButton companyId={company.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-gray-900 ml-2">회사 기본 정보</h3>
          <CompanyForm
            initialData={serializedCompany as any}
            ownerId={company.ownerId}
            isEdit={true}
          />
        </div>

        <div className="space-y-8">
          <div className="flex justify-between items-center ml-2">
            <h3 className="text-2xl font-bold text-gray-900">소속 현장 목록</h3>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              총 {sitesWithStats.length}개
            </span>
          </div>

          {sitesWithStats.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-[2.5rem] p-12 text-center">
              <p className="text-gray-400 font-medium mb-4">등록된 현장이 없습니다.</p>
              <Link href={`/sites/new?companyId=${company.id}`}>
                <Button variant="outline" size="sm" className="rounded-xl">
                  첫 현장 등록하기
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {sitesWithStats.map(site => (
                <SiteCard
                  key={site.id}
                  site={site as any}
                  monthlyLaborCost={site.monthlyLaborCost}
                  currentMonthWorkers={site.currentMonthWorkers}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
