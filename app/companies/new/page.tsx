import React from 'react'
import CompanyForm from '../../components/companies/CompanyForm'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function NewCompanyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">회사 등록</h1>
        <p className="text-gray-500 mt-1">새로운 혀장 관리를 위한 건설사를 등록합니다.</p>
      </div>

      <CompanyForm ownerId={user.id} />
    </div>
  )
}
