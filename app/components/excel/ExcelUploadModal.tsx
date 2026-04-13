'use client'

import React, { useState, useRef } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

interface ExcelUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  siteId: string
  type: 'attendance' | 'workers' | 'ledger'
}

export default function ExcelUploadModal({
  isOpen,
  onClose,
  onSuccess,
  siteId,
  type
}: ExcelUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    } catch (err: any) {
      setError(err.message)
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
              <li>통합 노임대장 형식 (근로자 정보 + 일별 근무시간)</li>
              <li>1~5열: 이름, 전화번호, 주민번호, 은행, 계좌, 시급</li>
              <li>6열 이후: 날짜별 근무시간</li>
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
                <p>근로자: {result.workers.saved}/{result.workers.total}명 저장</p>
                <p>출근 기록: {result.attendance.saved}/{result.attendance.total}건 저장</p>
                {(result.workers.failed > 0 || result.attendance.failed > 0) && (
                  <p className="text-red-600">
                    실패: 근로자 {result.workers.failed}명, 출근 {result.attendance.failed}건
                  </p>
                )}
              </div>
            ) : (
              <div className="text-sm text-green-600">
                <p>{result.saved}/{result.total}건 저장 완료</p>
                {result.failed > 0 && (
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
