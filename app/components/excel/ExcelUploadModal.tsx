'use client'

import React, { useState, useRef } from 'react'
import Modal from '@/app/components/ui/Modal'
import Button from '@/app/components/ui/Button'

interface ExcelUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  siteId: string
  type: 'attendance' | 'workers' | 'ledger'
  year?: number
  month?: number
}

interface UploadResult {
  type: string
  total?: number
  saved?: number
  failed?: number
  errors?: unknown[]
  workers?: {
    total: number
    saved: number
    failed: number
    errors: unknown[]
  }
  attendance?: {
    total: number
    saved: number
    failed: number
    errors: unknown[]
  }
}

export default function ExcelUploadModal({
  isOpen,
  onClose,
  onSuccess,
  siteId,
  type,
  year: propYear,
  month: propMonth,
}: ExcelUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 현재 연/월 (props 없으면 현재 날짜 사용)
  const templateYear = propYear ?? new Date().getFullYear()
  const templateMonth = propMonth ?? (new Date().getMonth() + 1)

  // ledger 서식 API 다운로드
  const handleTemplateDownload = async () => {
    if (type !== 'ledger') return
    setDownloading(true)
    try {
      const res = await fetch(
        `/api/excel/template?type=ledger&year=${templateYear}&month=${templateMonth}`
      )
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '서식 다운로드 실패')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `노임대장_업로드서식_${templateYear}년${templateMonth}월.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '서식 다운로드 중 오류가 발생했습니다.')
    } finally {
      setDownloading(false)
    }
  }

  const typeLabels = {
    attendance: '출근 기록',
    workers: '근로자 정보',
    ledger: '노임대장 (통합)'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Excel 파일인지 확인
      if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
        setError('Excel 파일만 업로드할 수 있습니다.')
        return
      }
      setFile(selectedFile)
      setError('')
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('파일을 선택해주세요.')
      return
    }

    setUploading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('siteId', siteId)
      formData.append('type', type)

      const res = await fetch('/api/excel/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '업로드에 실패했습니다.')
      }

      setResult(data.result)

      // 성공 시 3초 후 모달 닫기
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 3000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '업로드 실패'
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setResult(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`${typeLabels[type]} 업로드`}>
      <div className="space-y-4">
        {/* 파일 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excel 파일 선택
          </label>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-file-input"
            />
            <label
              htmlFor="excel-file-input"
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl cursor-pointer transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              파일 선택
            </label>
            {file && (
              <span className="text-sm text-gray-600 truncate">{file.name}</span>
            )}
          </div>
        </div>

        {/* 서식 파일 다운로드 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">엑셀 양식이 필요하신가요?</p>
                {type === 'ledger' ? (
                  <p className="text-xs text-gray-600">{templateYear}년 {templateMonth}월 날짜가 자동 설정된 서식을 받으세요</p>
                ) : (
                  <p className="text-xs text-gray-600">샘플 파일을 다운로드하여 양식을 확인하세요</p>
                )}
              </div>
            </div>
            {type === 'ledger' ? (
              <button
                onClick={handleTemplateDownload}
                disabled={downloading}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-blue-200 flex items-center gap-2 whitespace-nowrap"
              >
                {downloading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    생성 중...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    서식 다운로드
                  </>
                )}
              </button>
            ) : (
              <a
                href={`/templates/${type === 'workers' ? 'workers-template.csv' : 'attendance-template.csv'}`}
                download
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-blue-200 flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                샘플 다운로드받기
              </a>
            )}
          </div>
        </div>

        {/* 안내 사항 */}
        <div className="bg-blue-50 rounded-lg p-4 text-sm">
          <p className="font-semibold text-blue-700 mb-2">📄 Excel 파일 형식 안내</p>

          {type === 'attendance' && (
            <ul className="list-disc list-inside space-y-1 text-xs text-blue-600">
              <li>열 순서: 이름 | 날짜 | 근무시간 | 주휴수당(O/X) | 비고</li>
              <li>날짜 형식: YYYY-MM-DD 또는 Excel 날짜 형식</li>
              <li>근무시간: 숫자 (예: 8, 8.5)</li>
            </ul>
          )}

          {type === 'workers' && (
            <ul className="list-disc list-inside space-y-1 text-xs text-blue-600">
              <li>열 순서: 이름 | 전화번호 | 주민등록번호 | 은행 | 계좌번호 | 시급</li>
              <li>시급: 숫자 (예: 15000)</li>
              <li>중복된 이름은 오류 발생</li>
            </ul>
          )}

          {type === 'ledger' && (
            <ul className="list-disc list-inside space-y-1 text-xs text-blue-600">
              <li><span className="font-bold">위 서식 파일을 먼저 다운로드하세요</span> (날짜 자동 설정)</li>
              <li>A열: 이름 · B열: 전화번호 · C열: 주민등록번호</li>
              <li>D열: 은행명 · E열: 계좌번호 · F열: 시급(숫자)</li>
              <li>G열 이후: 각 날짜의 근무시간 입력 (숫자, 예: 8, 8.5)</li>
              <li>근무하지 않은 날은 빈칸으로 두세요</li>
            </ul>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 업로드 결과 */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-green-700 mb-2">✅ 업로드 완료!</p>

            {result.type === 'ledger' ? (
              <div className="space-y-2 text-sm text-green-600">
                <p>근로자: {result.workers?.saved}/{result.workers?.total}명 저장</p>
                <p>출근 기록: {result.attendance?.saved}/{result.attendance?.total}건 저장</p>
                {((result.workers?.failed || 0) > 0 || (result.attendance?.failed || 0) > 0) && (
                  <p className="text-red-600">
                    실패: 근로자 {result.workers?.failed}명, 출근 {result.attendance?.failed}건
                  </p>
                )}
              </div>
            ) : (
              <div className="text-sm text-green-600">
                <p>{result.saved}/{result.total}건 저장 완료</p>
                {(result.failed || 0) > 0 && (
                  <p className="text-red-600">실패: {result.failed}건</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            size="full"
            onClick={handleClose}
            disabled={uploading}
          >
            취소
          </Button>
          <Button
            variant="primary"
            size="full"
            onClick={handleUpload}
            isLoading={uploading}
            disabled={!file || uploading}
          >
            업로드
          </Button>
        </div>
      </div>
    </Modal>
  )
}
