import React from 'react'
import SiteForm from '../../components/sites/SiteForm'
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function NewSitePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 건설사 목록 가져오기 (현장 등록 시 필요)
  const companies = await prisma.company.findMany({
    where: { ownerId: user.id },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
          현장 개설
        </h1>
        <p className="text-lg text-gray-500 font-medium">
          새로운 건설 현장을 등록하고 관리를 시작합니다.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        <div className="flex-1">
          <SiteForm companies={companies} />
        </div>
        
        <div className="hidden lg:block w-72 space-y-6">
          <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
            <h4 className="font-bold text-blue-900 mb-2">도움말</h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              건설사가 등록되어 있어야 현장을 개설할 수 있습니다. 
              시작일과 종료일은 나중에 수정 가능합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
