'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../ui/Button'
import { Company } from '@prisma/client'

const companySchema = z.object({
  name: z.string().min(1, '회사명을 입력해주세요.'),
  businessNumber: z.string()
    .regex(/^\d{3}-\d{2}-\d{5}$/, '형식(000-00-00000)에 맞게 입력하거나 비워두세요.')
    .or(z.literal(''))
    .optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type CompanyFormValues = z.infer<typeof companySchema>

interface CompanyFormProps {
  initialData?: Partial<Company>
  ownerId: string
  isEdit?: boolean
}

export default function CompanyForm({ initialData, ownerId, isEdit = false }: CompanyFormProps) {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialData?.name || '',
      businessNumber: initialData?.businessNumber || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
    },
  })

  // 사업자번호 자동 포맷팅 (000-00-00000)
  const handleBusinessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '')
    if (value.length > 3 && value.length <= 5) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`
    } else if (value.length > 5) {
      value = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5, 10)}`
    }
    setValue('businessNumber', value, { shouldValidate: true })
  }

  const onSubmit = async (data: CompanyFormValues) => {
    setErrorMsg('')
    try {
      const url = isEdit ? `/api/companies/${initialData?.id}` : '/api/companies'
      const method = isEdit ? 'PATCH' : 'POST'
      
      const payload = {
        ...data,
        ownerId,
        businessNumber: data.businessNumber || undefined,
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

      router.push('/companies')
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
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
          {errorMsg}
        </div>
      )}
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
            회사명 <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full px-5 py-3 bg-gray-50/50 border rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all ${errors.name ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200 hover:border-gray-300'}`}
            placeholder="(주) 건설이름"
            {...register('name')}
          />
          {errors.name && <p className="mt-2 text-xs font-medium text-rose-500 ml-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">사업자등록번호</label>
          <input
            type="text"
            maxLength={12}
            className={`w-full px-5 py-3 bg-gray-50/50 border rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all ${errors.businessNumber ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200 hover:border-gray-300'}`}
            placeholder="000-00-00000"
            {...register('businessNumber', { onChange: handleBusinessNumberChange })}
          />
          {errors.businessNumber && <p className="mt-2 text-xs font-medium text-rose-500 ml-1">{errors.businessNumber.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">대표 연락처</label>
            <input
              type="text"
              className="w-full px-5 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all hover:border-gray-300"
              placeholder="02-000-0000"
              {...register('phone')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">주소</label>
            <input
              type="text"
              className="w-full px-5 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all hover:border-gray-300"
              placeholder="특별시/도 시/군/구..."
              {...register('address')}
            />
          </div>
        </div>
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
          {isEdit ? '정보 수정하기' : '회사 등록하기'}
        </Button>
      </div>
    </form>
  )
}
