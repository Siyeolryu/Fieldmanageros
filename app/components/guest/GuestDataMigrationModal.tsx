'use client'

import React, { useState } from 'react'
import Modal from '@/app/components/ui/Modal'
import { useGuestStore } from '@/lib/store'
import { toast } from 'sonner'

interface GuestDataMigrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function GuestDataMigrationModal({
  isOpen,
  onClose,
  onSuccess,
}: GuestDataMigrationModalProps) {
  const { companies, sites, workers, attendance, clearAll } = useGuestStore()
  const [isLoading, setIsLoading] = useState(false)

  const totalItems = companies.length + sites.length + workers.length + attendance.length

  const handleMigrate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/guest/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestData: {
            companies,
            sites,
            workers,
            attendance,
          },
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('게스트 데이터가 성공적으로 저장되었습니다!')

        // localStorage 게스트 데이터 삭제
        clearAll()

        onSuccess()
        onClose()
      } else {
        toast.error(result.error || '데이터 마이그레이션에 실패했습니다.')
      }
    } catch (error) {
      console.error('Migration error:', error)
      toast.error('데이터 마이그레이션 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    // 게스트 데이터 유지하고 모달만 닫기
    onClose()
  }

  const handleDiscard = () => {
    // 게스트 데이터 완전 삭제
    clearAll()
    toast.success('게스트 데이터가 삭제되었습니다.')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="게스트 모드 데이터 발견">
      <div className="space-y-6">
        {/* 데이터 요약 */}
        <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                게스트 모드에서 생성한 데이터가 있습니다
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                로그인하기 전에 입력한 데이터를 계정에 저장하시겠습니까?
              </p>
            </div>
          </div>
        </div>

        {/* 데이터 상세 */}
        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 text-sm">저장할 데이터:</h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-black text-blue-600 mb-1">{companies.length}</div>
              <div className="text-xs text-gray-600 font-medium">건설사</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-black text-blue-600 mb-1">{sites.length}</div>
              <div className="text-xs text-gray-600 font-medium">현장</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-black text-blue-600 mb-1">{workers.length}</div>
              <div className="text-xs text-gray-600 font-medium">근로자</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-black text-blue-600 mb-1">{attendance.length}</div>
              <div className="text-xs text-gray-600 font-medium">출근 기록</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
            <span className="text-sm font-bold text-gray-700">총 항목</span>
            <span className="text-lg font-black text-green-600">{totalItems}개</span>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-3 pt-4">
          <button
            onClick={handleMigrate}
            disabled={isLoading || totalItems === 0}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                저장 중...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                계정에 저장하기
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            나중에 결정하기
          </button>

          <button
            onClick={handleDiscard}
            disabled={isLoading}
            className="w-full px-6 py-3 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-all disabled:opacity-50"
          >
            게스트 데이터 삭제
          </button>
        </div>

        {/* 안내 메시지 */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-gray-600 leading-relaxed">
              <p className="font-bold mb-1">안내사항:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>&quot;계정에 저장하기&quot;를 선택하면 게스트 데이터가 영구적으로 저장됩니다.</li>
                <li>&quot;나중에 결정하기&quot;를 선택하면 브라우저에 데이터가 유지됩니다.</li>
                <li>&quot;게스트 데이터 삭제&quot;를 선택하면 데이터가 완전히 삭제됩니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
