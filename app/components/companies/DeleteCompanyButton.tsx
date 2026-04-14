'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/app/components/ui/Button'

export default function DeleteCompanyButton({ companyId }: { companyId: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 회사를 삭제하시겠습니까? 관련된 현장 정보도 모두 삭제될 수 있습니다.')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('삭제 실패')
      }

      router.push('/companies')
      router.refresh()
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.')
      setIsDeleting(false)
    }
  }

  return (
    <Button 
      variant="danger" 
      onClick={handleDelete} 
      isLoading={isDeleting}
      className="ml-auto"
    >
      삭제하기
    </Button>
  )
}
