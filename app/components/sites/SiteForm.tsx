'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/app/components/ui/Button'
import { Site, Company } from '@prisma/client'

const siteSchema = z.object({
  name: z.string().min(1, '현장명을 입력해주세요.'),
  companyId: z.string().uuid('건설사를 선택해주세요.'),
  location: z.string().optional(),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  includeMyself: z.boolean().default(false),
})

type SiteFormValues = z.infer<typeof siteSchema>

interface SiteFormProps {
  initialData?: Partial<Site>
  companies: Company[]
  isEdit?: boolean
  userProfile?: {
    user_type: string
    full_name: string | null
    hourly_rate: number | null
    bank_name: string | null
    bank_account: string | null
  }
}

export default function SiteForm({ initialData, companies, isEdit = false, userProfile }: SiteFormProps) {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState('')

  // user_type이 'both' 또는 'worker'이고 근로자 정보가 있는 경우만 본인 포함 옵션 표시
  const canIncludeMyself = userProfile &&
    (userProfile.user_type === 'both' || userProfile.user_type === 'worker') &&
    userProfile.hourly_rate &&
    userProfile.hourly_rate > 0

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: initialData?.name || '',
      companyId: initialData?.companyId || '',
      location: initialData?.location || '',
      startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
      endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
      isActive: initialData?.isActive ?? true,
      includeMyself: false,
    },
  })

  const includeMyselfValue = watch('includeMyself')

  const onSubmit = async (data: SiteFormValues) => {
    setErrorMsg('')
    try {
      const url = isEdit ? `/api/sites/${initialData?.id}` : '/api/sites'
      const method = isEdit ? 'PATCH' : 'POST'
      
      const payload = {
        ...data,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || '저장 중 오류가 발생했습니다.')
      }

      router.push('/sites')
      router.refresh()
    } catch (error: any) {
      setErrorMsg(error.message)
    }
  }

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="space-y-8 max-w-2xl bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl shadow-blue-500/5 border border-white/50"
    >
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-medium">
          {errorMsg}
        </div>
      )}
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
            현장명 <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full px-5 py-3 bg-gray-50/50 border rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all ${errors.name ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200 hover:border-gray-300'}`}
            placeholder="예) 곤지암 삼리 주택 현장"
            {...register('name')}
          />
          {errors.name && <p className="mt-2 text-xs font-medium text-rose-500 ml-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
            소속 건설사 <span className="text-rose-500">*</span>
          </label>
          <select
            className={`w-full px-5 py-3 bg-gray-50/50 border rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all ${errors.companyId ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200 hover:border-gray-300'}`}
            {...register('companyId')}
          >
            <option value="">건설사를 선택해주세요</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
          {errors.companyId && <p className="mt-2 text-xs font-medium text-rose-500 ml-1">{errors.companyId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">현장 위치</label>
          <input
            type="text"
            className="w-full px-5 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all hover:border-gray-300"
            placeholder="시/도 시/군/구 상세주소..."
            {...register('location')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">공사 시작일</label>
            <input
              type="date"
              className="w-full px-5 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all hover:border-gray-300"
              {...register('startDate')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">공사 종료일</label>
            <input
              type="date"
              className="w-full px-5 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all hover:border-gray-300"
              {...register('endDate')}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            id="isActive"
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            {...register('isActive')}
          />
          <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
            현재 진행 중인 현장으로 활성화
          </label>
        </div>

        {/* Phase 4: 본인 포함 옵션 */}
        {!isEdit && canIncludeMyself && (
          <div className="mt-6 p-6 bg-sky-50/50 border-2 border-sky-200 rounded-2xl space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="includeMyself"
                className="mt-1 w-5 h-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                {...register('includeMyself')}
              />
              <div className="flex-1">
                <label htmlFor="includeMyself" className="block text-sm font-bold text-sky-900 cursor-pointer">
                  이 현장에 본인도 작업자로 투입
                </label>
                <p className="text-xs text-sky-700 mt-1">
                  팀장이면서 직접 작업도 하시는 경우 선택하세요. 출퇴근 기록 및 급여 계산에 포함됩니다.
                </p>
              </div>
            </div>

            {includeMyselfValue && userProfile && (
              <div className="pl-8 pt-3 border-t border-sky-200 space-y-2">
                <p className="text-sm text-sky-900 font-medium">등록될 정보:</p>
                <div className="text-xs text-sky-700 space-y-1">
                  <p>• 이름: {userProfile.full_name || '(미입력)'}</p>
                  <p>• 시급: {userProfile.hourly_rate?.toLocaleString()}원</p>
                  <p>• 은행: {userProfile.bank_name || '(미입력)'}</p>
                  <p>• 계좌: {userProfile.bank_account || '(미입력)'}</p>
                </div>
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800">
                    <span className="font-bold">💡 세무 안내:</span> 본인 급여 지급 시 원천징수 신고가 필요하며, 4대보험 신고 대상입니다 (고용보험 제외).
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-6">
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1 border-gray-200 hover:bg-gray-50 rounded-2xl" 
          onClick={() => router.back()} 
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button 
          type="submit" 
          variant="premium" 
          className="flex-1 rounded-2xl py-4 shadow-xl" 
          isLoading={isSubmitting}
        >
          {isEdit ? '현장 정보 수정' : '현장 등록하기'}
        </Button>
      </div>
    </form>
  )
}
