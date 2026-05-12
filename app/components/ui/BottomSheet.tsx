'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

const BottomSheet: React.FC<BottomSheetProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* 백드롭 */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* 바텀 시트 컨테이너 */}
      <div className="relative w-full max-w-md overflow-hidden bg-white rounded-t-[32px] shadow-2xl animate-in slide-in-from-bottom duration-300 ease-out">
        {/* 드래그 핸들 (장식용) */}
        <div className="flex justify-center p-4">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-50">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="px-6 py-4 overflow-y-auto max-h-[85vh]">
          {children}
        </div>
        
        {/* 모바일 하단 여백 대응 */}
        <div className="h-safe-area-inset-bottom pb-8" />
      </div>
    </div>,
    document.body
  )
}

export default BottomSheet
