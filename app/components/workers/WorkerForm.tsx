'use client'

import React, { useState, useEffect } from 'react'
import type { Worker } from '@prisma/client'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import Button from '@/app/components/ui/Button'

interface WorkerFormProps {
  worker?: Worker | null
  onSuccess: () => void
  onCancel: () => void
}

const WorkerForm: React.FC<WorkerFormProps> = ({ worker, onSuccess, onCancel }) => {
  const { selectedSite } = useAppStore()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    hourlyRate: 15000,
    bankName: '',
    bankAccount: '',
    idNumber: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (worker) {
      setFormData({
        name: worker.name,
        phone: worker.phone || '',
        hourlyRate: Number(worker.hourlyRate),
        bankName: worker.bankName || '',
        bankAccount: worker.bankAccount || '',
        idNumber: worker.idNumber || '',
      })
    }
  }, [worker])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSite) return

    setIsSubmitting(true)
    try {
      const url = worker ? `/api/workers/${worker.id}` : '/api/workers'
      const method = worker ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          siteId: selectedSite.id,
        }),
      })

      if (response.ok) {
        toast.success(worker ? '근로자 정보가 수정되었습니다' : '근로자가 등록되었습니다', {
          description: `${formData.name} - 시급 ${formData.hourlyRate.toLocaleString()}원`,
          duration: 3000,
        })
        onSuccess()
      } else {
        const error = await response.json()
        toast.error(error.error || '저장 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500 ml-1">이름 (필수)</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="홍길동"
            className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl transition-all font-bold outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500 ml-1">연락처</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="010-0000-0000"
            className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl transition-all font-bold outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-500 ml-1">시급 (원)</label>
        <div className="flex items-center gap-3">
          <input
            required
            type="number"
            value={formData.hourlyRate}
            onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) || 0 })}
            className="flex-1 h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl transition-all font-black text-blue-600 outline-none"
          />
          <div className="flex gap-2">
            {[10000, 15000, 20000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setFormData({ ...formData, hourlyRate: val })}
                className="px-3 py-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
              >
                {val/1000}k
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500 ml-1">은행명</label>
          <input
            type="text"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            placeholder="국민은행"
            className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl transition-all font-bold outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500 ml-1">계좌번호</label>
          <input
            type="text"
            value={formData.bankAccount}
            onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
            placeholder="123-456-789012"
            className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl transition-all font-bold outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-500 ml-1 flex items-center gap-2">
          주민등록번호
          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded ml-1 font-bold">노임대장 작성용</span>
        </label>
        <input
          type="password"
          value={formData.idNumber}
          onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
          placeholder="●●●●●● - ●●●●●●●"
          className="w-full h-12 px-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl transition-all font-bold outline-none"
        />
      </div>

      <div className="flex gap-3 pt-6 border-t border-gray-50">
        <Button variant="ghost" size="full" onClick={onCancel}>취소</Button>
        <Button 
          type="submit" 
          size="full" 
          isLoading={isSubmitting}
        >
          {worker ? '정보 수정' : '근로자 추가'}
        </Button>
      </div>
    </form>
  )
}

export default WorkerForm
