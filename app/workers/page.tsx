'use client'

import React, { useState } from 'react'
import { useAppStore, useAuthStore } from '@/lib/store'
import SiteSelector from '@/app/components/ui/SiteSelector'
import Modal from '@/app/components/ui/Modal'
import Button from '@/app/components/ui/Button'
import WorkerList from '@/app/components/workers/WorkerList'
import WorkerForm from '@/app/components/workers/WorkerForm'
import ExcelUploadModal from '@/app/components/excel/ExcelUploadModal'
import Link from 'next/link'
import type { Worker } from '@prisma/client'

export default function WorkersPage() {
  const { selectedSite } = useAppStore()
  const { user } = useAuthStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false)
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAddWorker = () => {
    setEditingWorker(null)
    setIsModalOpen(true)
  }

  const handleEditWorker = (worker: Worker) => {
    setEditingWorker(worker)
    setIsModalOpen(true)
  }

  const handleSuccess = () => {
    setIsModalOpen(false)
    setRefreshKey(prev => prev + 1) // 목록 새로고침 유도
  }

  const handleExcelSuccess = () => {
    setRefreshKey(prev => prev + 1) // 목록 새로고침 유도
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[family-name:var(--font-geist-sans)]">
      {/* 상단 네비게이션 */}
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black text-blue-600 tracking-tight">
              노무PRO
            </h1>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">대시보드</Link>
              <Link href="/workers" className="text-sm font-bold text-gray-900 border-b-2 border-blue-600 pb-1">근로자 관리</Link>
              <Link href="/payroll" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">노임대장</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <SiteSelector />
            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
               <span className="text-xs font-bold text-gray-600">{user?.fullName?.[0] || 'U'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracing-tight">근로자 관리</h2>
            <p className="text-gray-500 font-medium">현장별 인력 현황 및 개인 정보를 관리합니다.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* 샘플 다운로드 버튼 - 직관적으로 노출 */}
            <a
              href="/templates/workers-template.csv"
              download
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              샘플 다운로드받기
            </a>
            <Button
              variant="outline"
              onClick={() => setIsExcelModalOpen(true)}
              disabled={!selectedSite}
              className="gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Excel 업로드
            </Button>
            <Button
              onClick={handleAddWorker}
              disabled={!selectedSite}
              className="gap-2 shadow-lg shadow-blue-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              신규 근로자 등록
            </Button>
          </div>
        </div>

        {/* 근로자 목록 섹션 */}
        <section className="bg-white/50 backdrop-blur-sm p-2 rounded-[2rem] border border-gray-100">
          <div className="bg-white p-6 rounded-[1.8rem] shadow-sm">
            <WorkerList key={refreshKey} onEdit={handleEditWorker} />
          </div>
        </section>
      </main>

      {/* 등록/수정 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWorker ? '근로자 정보 수정' : '신규 근로자 등록'}
      >
        <WorkerForm
          worker={editingWorker}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Excel 업로드 모달 */}
      {selectedSite && (
        <ExcelUploadModal
          isOpen={isExcelModalOpen}
          onClose={() => setIsExcelModalOpen(false)}
          onSuccess={handleExcelSuccess}
          siteId={selectedSite.id}
          type="workers"
        />
      )}

      {/* 모바일 탭 바는 레이아웃에 통합 가능하므로 여기서는 생략하거나 공통 레이아웃 사용 권장 */}
    </div>
  )
}
